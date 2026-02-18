# eslint-plugin-only-english-identifiers

An ESLint plugin that enforces English-only names for variables, functions and object properties.

This project is part of the **ESLTools** suite of utilities for developers who are non-native English speakers. See also:

- **[windows-live-cc](https://github.com/cesar-bravo-m/windows-live-cc)** — A transcription and translation utility for Windows, useful for watching English-language training material.

## Installation

```bash
npm install --save-dev eslint-plugin-only-english-identifiers
```

## Usage

```javascript
// eslint.config.js
import onlyEnglishIdentifiers from 'eslint-plugin-only-english-identifiers';

export default [
  {
    plugins: {
      'english': onlyEnglishIdentifiers
    },
    rules: {
      'english/only-english-identifiers': 'warn' // 'off' | 'warn' | 'error'
    }
  }
];
```

```bash
npm run lint
```

## Configuration

An identifier whitelist can be added in eslint.config.js, like this:
```javascript
  // eslint.config.js
  module.exports = [
    rules: {
      'english/only-english-identifiers': ["warn", {whitelist: ['nombre']}]
    },
  ]
```

If you can't modify the ESLint config, you can always disable the rule for a specific file or line:

```javascript
// eslint-disable-next-line english/only-english-identifiers
const nombre = 'test';
```

## Caveats

Identifiers are expected to be written in camelCase, snake_case, PascalCase or kebab-case. A name like "myvariable" won't be read as English, but "myVariable" will. Think of it as a bonus spell check.

## Example

```javascript
// Valid
const userName = 'John';
function calculateTotal(amount) { return amount * 1.1; }

// Invalid
const nombre = 'Juan';  // Error: 'nombre' is not English
```

## Dictionary

This plugin ships a modified version of [SCOWL (Spell Checker Oriented Word Lists)](http://wordlist.aspell.net/) by Kevin Atkinson, a comprehensive English dictionary that includes common words, technical terms, and both American and British spellings.

## License

ISC
