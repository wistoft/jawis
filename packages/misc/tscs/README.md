## TypeScript demo

There are 3 ways:

1.  `TsCompileServiceNonIncremental`.
    - Use `ts.createProgram`. Typescript caches nothing.
2.  `TsCompileServiceIncremental`.
    - Use `ts.createEmitAndSemanticDiagnosticsBuilderProgram`. Typescript caches
      everything.
3.  `TsPlugin` in jabu
    - Use `ts.createLanguageService`. Typescript caches everything.
