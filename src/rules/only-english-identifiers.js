"use strict";

const Database = require("better-sqlite3");

let db;
try {
  db = new Database(__dirname + "/scowl.db", { readonly: true, fileMustExist: true });
} catch {
  db = new Database("scowl.db", { readonly: true, fileMustExist: true });
}
db.pragma("journal_mode = OFF");
db.pragma("synchronous = OFF");
db.pragma("temp_store = MEMORY");

const stmt = db.prepare("SELECT 1 FROM english_words WHERE word = ? COLLATE NOCASE LIMIT 1");

const cache = new Map();

const RE_CAMEL = /([a-z])([A-Z])/g;
const RE_SEP = /[_-]/g;
const RE_ALL_LOWER = /^[a-z]+$/;
const RE_HAS_ALPHA = /[A-Za-z]/;

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
  const cached = cache.get(word);
  if (cached !== undefined) return cached;
  const ok = stmt.get(word) !== undefined;
  cache.set(word, ok);
  return ok;
}

module.exports = {
  meta: {
    type: "layout",
    docs: {
      description: "Disallow identifier names not written in English",
      recommended: false,
    },
    schema: [],
    messages: {
      nonEnglish: "Avoid using non-English words in identifiers",
    },
  },

  create(context) {
    function checkName(node, name) {
      if (!RE_HAS_ALPHA.test(name)) return;
      const parts = splitIdentifier(name);
      for (let i = 0; i < parts.length; i++) {
        const w = parts[i];
        if (w.length <= 3) continue;
        if (!isEnglishWord(w)) {
          context.report({ node, messageId: "nonEnglish" });
          return;
        }
      }
    }

    return {
      Identifier(node) {
        const parent = node.parent;
        if (
          parent &&
          parent.type === "MemberExpression" &&
          parent.property === node &&
          parent.computed === false
        ) {
          return;
        }
        checkName(node, node.name);
      },
      JSXIdentifier(node) {
        checkName(node, node.name);
      },
    };
  },
};
