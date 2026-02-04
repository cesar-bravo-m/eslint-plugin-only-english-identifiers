# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-02

### Added
- English identifier validation using SCOWL dictionary
- Support for camelCase, snake_case, PascalCase, and kebab-case

### Features
- Validates variable names, function names, class names, and parameters
- Case-insensitive English word matching
- Small performance impact on linting

## [1.0.5] - 2026-02-04

### Added
- Configurable whitelist
- Identifier names that start with acronyms are now properly handled (e.g. HTMLElement passes the lint test)

[1.0.0]: https://github.com/cesar-bravo-m/only-english-identifiers/releases/tag/v1.0.0
