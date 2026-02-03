# eslint-plugin-only-english-identifiers

An ESLint plugin that enforces English-only names for variables, functions and object properties.

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
      'english/only-english-identifiers': 'error'
    }
  }
];
```

## Caveats

Identifiers should be written in camelCase, snake_case, PascalCase or kebab-case. Something like "myvariable" will not be recognized as English, but "myVariable" will. Consider this a spell check.

## Example

```javascript
// Valid
const userName = 'John';
function calculateTotal(amount) { return amount * 1.1; }

// Invalid
const nombre = 'Juan';  // Error: 'nombre' is not English
```

## Dictionary

This plugin uses [SCOWL (Spell Checker Oriented Word Lists)](http://wordlist.aspell.net/) by Kevin Atkinson, a comprehensive English dictionary that includes common words, technical terms, and both American and British spellings.

## Configuration

The rule has no configuration options. Use `'error'`, `'warn'`, or `'off'`.

To disable for specific lines:

```javascript
// eslint-disable-next-line english/only-english-identifiers
const nombre = 'test';
```

## License

ISC
