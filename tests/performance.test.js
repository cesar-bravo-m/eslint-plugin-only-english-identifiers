/**
 * Performance tests for the only-english-identifiers rule
 * Tests database lookup performance, caching efficiency, and identifier processing speed
 */

const Database = require("better-sqlite3");
const path = require("path");

// Initialize database
const dbPath = path.join(__dirname, "..", "scowl.db");
const db = new Database(dbPath, { readonly: true, fileMustExist: true });
db.pragma("journal_mode = OFF");
db.pragma("synchronous = OFF");
db.pragma("temp_store = MEMORY");

const stmt = db.prepare("SELECT 1 FROM english_words WHERE word = ? COLLATE NOCASE LIMIT 1");

// Re-implement the functions with cache for testing
const cache = new Map();

const RE_CAMEL = /([a-z])([A-Z])/g;
const RE_SEP = /[_-]/g;
const RE_ALL_LOWER = /^[a-z]+$/;

function splitIdentifier(name) {
  if (RE_ALL_LOWER.test(name)) return [name];
  const s = name
    .replace(RE_CAMEL, "$1 $2")
    .replace(RE_SEP, " ")
    .toLowerCase();
  const out = [];
  let start = 0;
  for (let i = 0; i <= s.length; i++) {
    const c = s.charCodeAt(i);
    const isSpace = i === s.length || c === 32; // ' '
    if (isSpace) {
      if (i > start) out.push(s.slice(start, i));
      start = i + 1;
    }
  }
  return out;
}

function isEnglishWordUncached(word) {
  return stmt.get(word) !== undefined;
}

function isEnglishWord(word) {
  const cached = cache.get(word);
  if (cached !== undefined) return cached;
  const ok = stmt.get(word) !== undefined;
  cache.set(word, ok);
  return ok;
}

function benchmark(name, fn, iterations = 1000) {
  const start = process.hrtime.bigint();
  
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  
  const end = process.hrtime.bigint();
  const durationMs = Number(end - start) / 1_000_000;
  const avgMs = durationMs / iterations;
  
  return {
    name,
    totalMs: durationMs.toFixed(2),
    avgMs: avgMs.toFixed(4),
    iterations,
    opsPerSec: (1000 / avgMs).toFixed(0),
  };
}

describe("Performance Tests", () => {
  beforeEach(() => {
    cache.clear();
  });

  describe("Database Lookup Performance", () => {
    test("single word lookup (uncached)", () => {
      const result = benchmark(
        "Single word lookup (uncached)",
        () => isEnglishWordUncached("hello"),
        1000
      );
      
      console.log(`\n${result.name}:`);
      console.log(`  Total: ${result.totalMs}ms for ${result.iterations} iterations`);
      console.log(`  Average: ${result.avgMs}ms per lookup`);
      console.log(`  Throughput: ~${result.opsPerSec} ops/sec`);
      
      // Should be reasonably fast (under 5ms per lookup on average)
      expect(parseFloat(result.avgMs)).toBeLessThan(5);
    });

    test("single word lookup (cached)", () => {
      // Prime the cache
      isEnglishWord("hello");
      
      const result = benchmark(
        "Single word lookup (cached)",
        () => isEnglishWord("hello"),
        100000
      );
      
      console.log(`\n${result.name}:`);
      console.log(`  Total: ${result.totalMs}ms for ${result.iterations} iterations`);
      console.log(`  Average: ${result.avgMs}ms per lookup`);
      console.log(`  Throughput: ~${result.opsPerSec} ops/sec`);
      
      // Cached lookups should be extremely fast (under 0.01ms)
      expect(parseFloat(result.avgMs)).toBeLessThan(0.01);
    });

    test("multiple different words (uncached)", () => {
      const words = ["hello", "world", "user", "name", "function", "variable"];
      let index = 0;
      
      const result = benchmark(
        "Multiple words lookup (uncached)",
        () => {
          isEnglishWordUncached(words[index % words.length]);
          index++;
        },
        1000
      );
      
      console.log(`\n${result.name}:`);
      console.log(`  Total: ${result.totalMs}ms for ${result.iterations} iterations`);
      console.log(`  Average: ${result.avgMs}ms per lookup`);
      console.log(`  Throughput: ~${result.opsPerSec} ops/sec`);
      
      expect(parseFloat(result.avgMs)).toBeLessThan(5);
    });

    test("multiple different words (with caching)", () => {
      const words = ["hello", "world", "user", "name", "function", "variable"];
      let index = 0;
      
      const result = benchmark(
        "Multiple words lookup (with caching)",
        () => {
          isEnglishWord(words[index % words.length]);
          index++;
        },
        10000
      );
      
      console.log(`\n${result.name}:`);
      console.log(`  Total: ${result.totalMs}ms for ${result.iterations} iterations`);
      console.log(`  Average: ${result.avgMs}ms per lookup`);
      console.log(`  Throughput: ~${result.opsPerSec} ops/sec`);
      
      // With caching, should be much faster
      expect(parseFloat(result.avgMs)).toBeLessThan(0.1);
    });
  });

  describe("Cache Efficiency", () => {
    test("cache hit ratio with repeated lookups", () => {
      cache.clear();
      const words = ["hello", "world", "user"];
      
      // First pass - all misses
      words.forEach(word => isEnglishWord(word));
      expect(cache.size).toBe(3);
      
      // Subsequent passes should be cache hits
      const iterations = 10000;
      const start = process.hrtime.bigint();
      
      for (let i = 0; i < iterations; i++) {
        isEnglishWord(words[i % words.length]);
      }
      
      const end = process.hrtime.bigint();
      const durationMs = Number(end - start) / 1_000_000;
      
      console.log(`\nCache efficiency test:`);
      console.log(`  ${iterations} lookups with 3 unique words`);
      console.log(`  Total time: ${durationMs.toFixed(2)}ms`);
      console.log(`  Avg per lookup: ${(durationMs / iterations).toFixed(4)}ms`);
      console.log(`  Cache size: ${cache.size}`);
      
      expect(cache.size).toBe(3); // Should not grow
      expect(durationMs / iterations).toBeLessThan(0.01); // Should be very fast
    });

    test("cache memory overhead", () => {
      cache.clear();
      const uniqueWords = 1000;
      
      for (let i = 0; i < uniqueWords; i++) {
        isEnglishWord(`word${i}`);
      }
      
      console.log(`\nCache memory test:`);
      console.log(`  Cached ${uniqueWords} unique words`);
      console.log(`  Cache size: ${cache.size}`);
      
      expect(cache.size).toBe(uniqueWords);
    });

    test("cache vs uncached performance comparison", () => {
      // Uncached
      const uncachedResult = benchmark(
        "Uncached lookup",
        () => isEnglishWordUncached("example"),
        1000
      );
      
      // Cached (prime first)
      isEnglishWord("example");
      const cachedResult = benchmark(
        "Cached lookup",
        () => isEnglishWord("example"),
        10000
      );
      
      const speedup = parseFloat(uncachedResult.avgMs) / parseFloat(cachedResult.avgMs);
      
      console.log(`\nCache speedup analysis:`);
      console.log(`  Uncached: ${uncachedResult.avgMs}ms per lookup`);
      console.log(`  Cached: ${cachedResult.avgMs}ms per lookup`);
      console.log(`  Speedup: ${speedup.toFixed(0)}x faster`);
      
      // Cache should be at least 10x faster
      expect(speedup).toBeGreaterThan(10);
    });
  });

  describe("Identifier Splitting Performance", () => {
    test("simple identifier splitting", () => {
      const result = benchmark(
        "Simple camelCase split",
        () => splitIdentifier("userName"),
        10000
      );
      
      console.log(`\n${result.name}:`);
      console.log(`  Total: ${result.totalMs}ms for ${result.iterations} iterations`);
      console.log(`  Average: ${result.avgMs}ms per split`);
      console.log(`  Throughput: ~${result.opsPerSec} ops/sec`);
      
      expect(parseFloat(result.avgMs)).toBeLessThan(0.1);
    });

    test("complex identifier splitting", () => {
      const result = benchmark(
        "Complex identifier split",
        () => splitIdentifier("performAsyncDatabaseOperationWithRetry"),
        10000
      );
      
      console.log(`\n${result.name}:`);
      console.log(`  Total: ${result.totalMs}ms for ${result.iterations} iterations`);
      console.log(`  Average: ${result.avgMs}ms per split`);
      console.log(`  Throughput: ~${result.opsPerSec} ops/sec`);
      
      expect(parseFloat(result.avgMs)).toBeLessThan(0.1);
    });

    test("snake_case splitting", () => {
      const result = benchmark(
        "snake_case split",
        () => splitIdentifier("user_authentication_token_validator"),
        10000
      );
      
      console.log(`\n${result.name}:`);
      console.log(`  Total: ${result.totalMs}ms for ${result.iterations} iterations`);
      console.log(`  Average: ${result.avgMs}ms per split`);
      
      expect(parseFloat(result.avgMs)).toBeLessThan(0.1);
    });
  });

  describe("End-to-End Performance", () => {
    test("full identifier validation (English)", () => {
      const identifier = "userAuthenticationController";
      
      const result = benchmark(
        "Full validation (English)",
        () => {
          const parts = splitIdentifier(identifier);
          parts.forEach(part => isEnglishWord(part));
        },
        5000
      );
      
      console.log(`\n${result.name}:`);
      console.log(`  Identifier: "${identifier}"`);
      console.log(`  Total: ${result.totalMs}ms for ${result.iterations} iterations`);
      console.log(`  Average: ${result.avgMs}ms per validation`);
      console.log(`  Throughput: ~${result.opsPerSec} ops/sec`);
      
      expect(parseFloat(result.avgMs)).toBeLessThan(1);
    });

    test("full identifier validation (non-English detection)", () => {
      const identifier = "usuarioAutenticacionControlador";
      
      const result = benchmark(
        "Full validation (non-English)",
        () => {
          const parts = splitIdentifier(identifier);
          const allEnglish = parts.every(part => isEnglishWord(part));
          return allEnglish;
        },
        5000
      );
      
      console.log(`\n${result.name}:`);
      console.log(`  Identifier: "${identifier}"`);
      console.log(`  Total: ${result.totalMs}ms for ${result.iterations} iterations`);
      console.log(`  Average: ${result.avgMs}ms per validation`);
      
      expect(parseFloat(result.avgMs)).toBeLessThan(1);
    });

    test("batch processing performance", () => {
      const identifiers = [
        "userName",
        "firstName",
        "emailAddress",
        "phoneNumber",
        "userController",
        "databaseConnection",
        "authenticationService",
        "validationHelper",
      ];
      
      let index = 0;
      const result = benchmark(
        "Batch processing",
        () => {
          const id = identifiers[index % identifiers.length];
          const parts = splitIdentifier(id);
          parts.forEach(part => isEnglishWord(part));
          index++;
        },
        5000
      );
      
      console.log(`\n${result.name}:`);
      console.log(`  ${identifiers.length} different identifiers`);
      console.log(`  Total: ${result.totalMs}ms for ${result.iterations} iterations`);
      console.log(`  Average: ${result.avgMs}ms per identifier`);
      console.log(`  Throughput: ~${result.opsPerSec} identifiers/sec`);
      
      expect(parseFloat(result.avgMs)).toBeLessThan(1);
    });
  });

  describe("Stress Tests", () => {
    test("large number of unique lookups", () => {
      cache.clear();
      const wordCount = 10000;
      
      const start = process.hrtime.bigint();
      
      for (let i = 0; i < wordCount; i++) {
        // Generate pseudo-random words
        isEnglishWord(`word${i}`);
      }
      
      const end = process.hrtime.bigint();
      const durationMs = Number(end - start) / 1_000_000;
      
      console.log(`\nStress test - ${wordCount} unique lookups:`);
      console.log(`  Total time: ${durationMs.toFixed(2)}ms`);
      console.log(`  Average: ${(durationMs / wordCount).toFixed(4)}ms per lookup`);
      console.log(`  Cache size: ${cache.size}`);
      
      expect(durationMs / wordCount).toBeLessThan(10);
    });

    test("very long identifier", () => {
      const veryLongIdentifier = "this_is_a_very_long_identifier_with_many_words_to_test_performance_with_complex_splitting_and_validation_logic";
      
      const result = benchmark(
        "Very long identifier",
        () => {
          const parts = splitIdentifier(veryLongIdentifier);
          parts.forEach(part => isEnglishWord(part));
        },
        1000
      );
      
      console.log(`\n${result.name}:`);
      console.log(`  Identifier length: ${veryLongIdentifier.length} chars`);
      console.log(`  Word count: ${splitIdentifier(veryLongIdentifier).length}`);
      console.log(`  Total: ${result.totalMs}ms for ${result.iterations} iterations`);
      console.log(`  Average: ${result.avgMs}ms per validation`);
      
      expect(parseFloat(result.avgMs)).toBeLessThan(5);
    });
  });
});

// Cleanup
afterAll(() => {
  db.close();
  console.log("\n✓ All performance tests completed!");
});
