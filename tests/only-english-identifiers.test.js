/**
 * Unit tests for the only-english-identifiers ESLint rule
 */

const { RuleTester } = require("eslint");
const rule = require("../src/rules/only-english-identifiers");

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2021,
    sourceType: "module"
  }
});

ruleTester.run("only-english-identifiers", rule, {
  valid: [
    // Simple English identifiers
    {
      code: "const hello = 'world';",
    },
    {
      code: "function calculateTotal(amount) { return amount; }",
    },
    {
      code: "class UserController { }",
    },
    {
      code: "const myVariable = 42;",
    },
    {
      code: "let userName = 'John';",
    },
    {
      code: "const isAuthenticated = true;",
    },
    
    // camelCase
    {
      code: "const firstName = 'Jane';",
    },
    {
      code: "function getMaxValue() { return 100; }",
    },
    
    // snake_case
    {
      code: "const user_name = 'Alice';",
    },
    {
      code: "const max_retry_count = 5;",
    },
    
    // kebab-case (in strings)
    {
      code: "const element = document.querySelector('.user-profile');",
    },
    
    // Short identifiers (3 chars or less, should be ignored)
    {
      code: "const x = 1;",
    },
    {
      code: "let i = 0;",
    },
    {
      code: "function fn(a, b, c) { return a + b + c; }",
    },
    
    // Member expressions (property access should be ignored when accessed, not when declared)
    {
      code: "user.nombre = 'test';", // 'nombre' is Spanish but as member it's ignored
    },
    {
      code: "const value = object.property;",
    },
    
    // Identifiers without alpha characters
    {
      code: "const $$ = jQuery;",
    },
    {
      code: "const _ = require('lodash');",
    },
    {
      code: "const _123 = 456;",
    },
    
    // Complex English identifiers
    {
      code: "const emailAddressValidation = /^[^@]+@[^@]+$/;",
    },
    {
      code: "function performAsyncOperation() { }",
    },
    {
      code: "class DatabaseConnectionPool { }",
    },
    
    // Identifiers with well-separated English words
    {
      code: "const firstUserName = 'test';",
    },
    {
      code: "const encoderBase = null;",
    },
  ],

  invalid: [
    // Spanish identifiers
    {
      code: "const nombre = 'Juan';",
      errors: [{ messageId: "nonEnglish" }],
    },
    {
      code: "function calcularTotal(cantidad) { return cantidad; }",
      errors: [
        { messageId: "nonEnglish" }, // cantidad (first param)
        { messageId: "nonEnglish" }, // cantidad (in return)
      ],
    },
    {
      code: "let usuarioActual = null;",
      errors: [{ messageId: "nonEnglish" }],
    },
    
    // French identifiers
    {
      code: "const utilisateur = 'Pierre';",
      errors: [{ messageId: "nonEnglish" }],
    },
    {
      code: "function calculerSomme(nombre) { return nombre; }",
      errors: [
        { messageId: "nonEnglish" }, // calculerSomme
        { messageId: "nonEnglish" }, // nombre
        { messageId: "nonEnglish" }, // nombre (in return)
      ],
    },
    
    // German identifiers
    {
      code: "const benutzer = 'Hans';",
      errors: [{ messageId: "nonEnglish" }],
    },
    {
      code: "let gesamt = 0;",
      errors: [{ messageId: "nonEnglish" }],
    },
    
    // Portuguese identifiers
    {
      code: "const usuario = 'Maria';",
      errors: [{ messageId: "nonEnglish" }],
    },
    
    // Mixed English and non-English (camelCase)
    {
      code: "const nombreUser = 'test';",
      errors: [{ messageId: "nonEnglish" }], // 'nombre' is not English
    },
    {
      code: "const userNombre = 'test';",
      errors: [{ messageId: "nonEnglish" }], // 'nombre' is not English
    },
    
    // Class names
    {
      code: "class UsuarioController { }",
      errors: [{ messageId: "nonEnglish" }],
    },
    
    // Function parameters
    {
      code: "function test(parametro) { return parametro; }",
      errors: [
        { messageId: "nonEnglish" }, // parametro (param)
        { messageId: "nonEnglish" }, // parametro (in return)
      ],
    },
    
    // Variables in different contexts
    {
      code: "for (let contador = 0; contador < 10; contador++) { }",
      errors: [
        { messageId: "nonEnglish" }, // contador (init)
        { messageId: "nonEnglish" }, // contador (test)
        { messageId: "nonEnglish" }, // contador (update)
      ],
    },
    
    // Arrow functions
    {
      code: "const procesarDatos = (datos) => datos.map(x => x * 2);",
      errors: [
        { messageId: "nonEnglish" }, // procesarDatos
      ],
    },
    
    // Object destructuring - identifiers appear multiple times in AST
    {
      code: "const { nombre, edad } = person;",
      errors: [
        { messageId: "nonEnglish" }, // nombre (appears twice in AST)
        { messageId: "nonEnglish" },
        { messageId: "nonEnglish" }, // edad (appears twice in AST)
        { messageId: "nonEnglish" },
      ],
    },
    
    // More straightforward non-English examples
    {
      code: "let contador = 0;",
      errors: [
        { messageId: "nonEnglish" }, // contador
      ],
    },
    {
      code: "const resultado = 123;",
      errors: [
        { messageId: "nonEnglish" }, // resultado
      ],
    },
    {
      code: "function procesarInformacion() { }",
      errors: [
        { messageId: "nonEnglish" }, // procesarInformacion
      ],
    },
  ],
});

console.log("✓ All ESLint rule tests passed!");
