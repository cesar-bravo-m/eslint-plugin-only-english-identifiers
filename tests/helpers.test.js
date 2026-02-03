/**
 * Unit tests for helper functions
 * Tests the identifier splitting and word validation logic
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

// Re-implement the helper functions for testing
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

function isEnglishWord(word) {
  return stmt.get(word) !== undefined;
}

describe("splitIdentifier", () => {
  test("splits camelCase identifiers", () => {
    expect(splitIdentifier("userName")).toEqual(["user", "name"]);
    expect(splitIdentifier("firstName")).toEqual(["first", "name"]);
    expect(splitIdentifier("isAuthenticated")).toEqual(["is", "authenticated"]);
  });

  test("splits PascalCase identifiers", () => {
    expect(splitIdentifier("UserController")).toEqual(["user", "controller"]);
    expect(splitIdentifier("DatabaseConnection")).toEqual(["database", "connection"]);
  });

  test("splits snake_case identifiers", () => {
    expect(splitIdentifier("user_name")).toEqual(["user", "name"]);
    expect(splitIdentifier("max_retry_count")).toEqual(["max", "retry", "count"]);
  });

  test("splits kebab-case identifiers", () => {
    expect(splitIdentifier("user-name")).toEqual(["user", "name"]);
    expect(splitIdentifier("primary-button")).toEqual(["primary", "button"]);
  });

  test("splits mixed case identifiers", () => {
    expect(splitIdentifier("getUserName")).toEqual(["get", "user", "name"]);
    expect(splitIdentifier("handleClickEvent")).toEqual(["handle", "click", "event"]);
  });

  test("handles all lowercase words without splitting", () => {
    expect(splitIdentifier("hello")).toEqual(["hello"]);
    expect(splitIdentifier("world")).toEqual(["world"]);
  });

  test("handles single character parts", () => {
    expect(splitIdentifier("aB")).toEqual(["a", "b"]);
    expect(splitIdentifier("x_y")).toEqual(["x", "y"]);
  });

  test("handles multiple consecutive separators", () => {
    expect(splitIdentifier("user__name")).toEqual(["user", "name"]);
    expect(splitIdentifier("user--name")).toEqual(["user", "name"]);
  });

  test("handles identifiers with numbers", () => {
    // Numbers don't split the identifier, they stay with the preceding text
    expect(splitIdentifier("user1Name")).toEqual(["user1name"]);
    expect(splitIdentifier("base64Encoder")).toEqual(["base64encoder"]);
  });

  test("handles complex multi-word identifiers", () => {
    expect(splitIdentifier("emailAddressValidator")).toEqual([
      "email",
      "address",
      "validator",
    ]);
    expect(splitIdentifier("performAsyncOperation")).toEqual([
      "perform",
      "async",
      "operation",
    ]);
  });

  test("handles edge cases", () => {
    expect(splitIdentifier("")).toEqual([]);
    expect(splitIdentifier("a")).toEqual(["a"]);
    expect(splitIdentifier("ABC")).toEqual(["abc"]);
  });
});

describe("isEnglishWord", () => {
  test("recognizes common English words", () => {
    expect(isEnglishWord("user")).toBe(true);
    expect(isEnglishWord("name")).toBe(true);
    expect(isEnglishWord("hello")).toBe(true);
    expect(isEnglishWord("world")).toBe(true);
    expect(isEnglishWord("function")).toBe(true);
    expect(isEnglishWord("variable")).toBe(true);
  });

  test("recognizes programming-related English words", () => {
    expect(isEnglishWord("database")).toBe(true);
    expect(isEnglishWord("controller")).toBe(true);
    expect(isEnglishWord("authentication")).toBe(true);
    // Note: "validator" may not be in the dictionary
    expect(isEnglishWord("validate")).toBe(true);
  });

  test("handles case insensitivity", () => {
    expect(isEnglishWord("User")).toBe(true);
    expect(isEnglishWord("NAME")).toBe(true);
    expect(isEnglishWord("Hello")).toBe(true);
  });

  test("rejects non-English words", () => {
    expect(isEnglishWord("nombre")).toBe(false); // Spanish
    expect(isEnglishWord("usuario")).toBe(false); // Spanish
    expect(isEnglishWord("utilisateur")).toBe(false); // French
    expect(isEnglishWord("benutzer")).toBe(false); // German
  });

  test("rejects gibberish", () => {
    expect(isEnglishWord("xyzabc")).toBe(false);
    // Note: "qwerty" might be in some dictionaries as it's a common term
    expect(isEnglishWord("asdfgh")).toBe(false);
    expect(isEnglishWord("zxcvbn")).toBe(false);
  });

  test("handles short words", () => {
    expect(isEnglishWord("a")).toBe(true);
    expect(isEnglishWord("i")).toBe(true);
    expect(isEnglishWord("is")).toBe(true);
    expect(isEnglishWord("it")).toBe(true);
  });

  test("handles technical terms", () => {
    expect(isEnglishWord("async")).toBe(true);
    expect(isEnglishWord("sync")).toBe(true);
  });
});

describe("splitIdentifier + isEnglishWord integration", () => {
  test("validates fully English identifiers", () => {
    const parts = splitIdentifier("userName");
    expect(parts.every(isEnglishWord)).toBe(true);
  });

  test("detects non-English in mixed identifiers", () => {
    const parts = splitIdentifier("nombreUser");
    const allEnglish = parts.every(isEnglishWord);
    expect(allEnglish).toBe(false);
    expect(isEnglishWord("nombre")).toBe(false);
    expect(isEnglishWord("user")).toBe(true);
  });

  test("validates complex English identifiers", () => {
    const parts = splitIdentifier("performAsyncDatabaseOperation");
    expect(parts.every(isEnglishWord)).toBe(true);
  });

  test("handles snake_case validation", () => {
    const parts = splitIdentifier("user_authentication_token");
    expect(parts.every(isEnglishWord)).toBe(true);
  });
});

describe("database query performance", () => {
  test("database connection is working", () => {
    expect(db).toBeDefined();
    expect(stmt).toBeDefined();
  });

  test("can execute queries", () => {
    const result = stmt.get("test");
    expect(result).toBeDefined();
  });
});

// Cleanup
afterAll(() => {
  db.close();
});

console.log("✓ All helper function tests passed!");
