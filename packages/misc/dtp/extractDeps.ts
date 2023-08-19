import ts, {
  ClassElement,
  ClassLikeDeclarationBase,
  CompilerOptions,
  Expression,
  ForInitializer,
  FunctionLikeDeclarationBase,
  isBlock,
  isClassDeclaration,
  isExportAssignment,
  isExportDeclaration,
  isFunctionDeclaration,
  isImportDeclaration,
  isModuleDeclaration,
  isNamespaceExport,
  isVariableStatement,
  JsxAttributes,
  JsxChild,
  JsxTagNameExpression,
  ModuleResolutionHost,
  NodeArray,
  ObjectLiteralElementLike,
  PropertyName,
  SourceFile,
  Statement,
  SwitchStatement,
  SyntaxKind,
} from "typescript";

import { assert, assertNever, def, err, assertPropString } from "^jab";

/**
 * DTP
 *  - assume people make pure declarations in module scope. E.g. `const a = myFunc()` is a code piece, not main code.
 *  - ignore use of IO, network, random, async, etc.
 *  - LExpr in assignments are also dependencies, because the assigner assumes a certain data type. At least that it's declared.
 *  - it's not important to distinguish export/non-exported code pieces. Because users won't be able to make edges to an internal
 *      piece, anyway.
 *  - code pieces with no dependencies don't need to be in the graph. They will impact users fine, when they get added with their
 *      first dependency.
 *
 * note
 *  - it's not important to be certain, that no type end up as code pieces, accidentially. Because no code piece
 *      will ever make a reference to a type. So the 'type' piece will never impact anything. Probably we'll never
 *      start a search from a 'type' piece either.
 */

export type DependencyInfo =
  | Import
  | Export
  | ReExport
  | InternalPieces
  | MainCode;

export type CodePiece = { name: string; deps: string[] };

type Import = {
  type: "import";
  file: string;
  named?: CodePiece[]; //it can only have one dep. Put for simplicity, it's regarded as a code piece.
  nsAlias?: string;
};

export type ReExport = {
  type: "reexport";
  file: string;
  data: "all" | CodePiece[] | { nsAlias: string };
};

type Export = {
  type: "export";
  data: CodePiece[]; //export can have more than one dep. Because export-default have no internal piece to depend on.
};

type InternalPieces = {
  type: "internal";
  data: CodePiece[];
};

type MainCode = {
  type: "main";
  deps: string[];
};

type BindingInfo = { names: string[]; deps: string[] };

/**
 *
 * impl
 *  - loops through top-level children, and recurses as needed.
 *
 * notes
 *  - SourceFile doesn't need parent nodes.
 *  - All returned files are absolute.
 */
export const extractDeps = (
  sourceFile: SourceFile,
  compilerOptions: CompilerOptions,
  host: ModuleResolutionHost
) => {
  let info: DependencyInfo[] = [];
  let mainDeps: string[] = [];

  ts.forEachChild(sourceFile, (node) => {
    if (isImportDeclaration(node)) {
      const imports = parseImportDeclaration(node, sourceFile.fileName, compilerOptions, host) // prettier-ignore

      if (imports) {
        info.push(imports);
      }
      return;
    }

    if (isExportAssignment(node)) {
      info.push(parseExportAssignment(node));
      return;
    }

    if (isExportDeclaration(node)) {
      info.push(
        parseExportDeclaration(node, sourceFile.fileName, compilerOptions, host)
      );
      return;
    }

    if (isFunctionDeclaration(node)) {
      info = info.concat(parseTopLevelFunctionDeclaration(node));
      return;
    }

    if (isClassDeclaration(node)) {
      info = info.concat(parseTopLevelClassDeclaration(node));
      return;
    }

    if (isVariableStatement(node)) {
      info = info.concat(parseTopLevelVariableStatement(node));
      return;
    }

    if (isModuleDeclaration(node)) {
      if (
        node.modifiers?.some((elm) => elm.kind === SyntaxKind.DeclareKeyword)
      ) {
        return;
      }

      throw err("not supported: module declarations.");
    }

    if (
      (node.kind >= SyntaxKind.FirstStatement &&
        node.kind <= SyntaxKind.LastStatement) ||
      isBlock(node)
    ) {
      const deps = parseStatement(node as Statement);
      if (deps.length > 0) {
        mainDeps = mainDeps.concat(deps);
      }
      return;
    }

    if (
      node.kind === ts.SyntaxKind.EndOfFileToken ||
      ts.isTypeAliasDeclaration(node) ||
      ts.isInterfaceDeclaration(node)
    ) {
      return;
    }

    //to ensure all top-level tokens are accounted for.

    err("unknown top-level node: ", ts.SyntaxKind[node.kind], node);
  });

  //add main to the result

  if (mainDeps.length > 0) {
    info.push({ type: "main", deps: mainDeps });
  }

  //return

  return info;
};

/**
 *
 */
export const parseTopLevelClassDeclaration = (node: ts.ClassDeclaration) =>
  parseTopLevelDeclaration(node, parseClass(node));

/**
 *
 */
export const parseTopLevelFunctionDeclaration = (
  node: ts.FunctionDeclaration
) => parseTopLevelDeclaration(node, parseFunctionLike(node));

/**
 * Handle class and function declarations
 *
 * - takes already extracted dependencies. Because they are different in classes/functions.
 *
 * notes
 *  - node.name is optional, when default export. Otherwise mandatory.
 *  - `export default function hej(){}` introduces a exported and local piece.
 *  - `export default function (){}` introduces no local piece.
 *  - only classes and function can introduce internal pieces, because nothing else have an innate name.
 */
export const parseTopLevelDeclaration = (
  node: ts.ClassDeclaration | ts.FunctionDeclaration,
  deps: string[] = []
): DependencyInfo[] => {
  if (node.modifiers?.some((elm) => elm.kind === SyntaxKind.DeclareKeyword)) {
    // we can't extract anything meaningful from declare, right?
    return [];
  }

  const isExport = node.modifiers?.some(
    (elm) => elm.kind === SyntaxKind.ExportKeyword
  );

  //
  // handle non exported declarations
  //

  if (!isExport) {
    if (!node.name) {
      throw new Error("non-exported functions declaration must have a name.");
    }

    return [
      {
        type: "internal",
        data: [{ name: parseIdentifier(node.name), deps }],
      },
    ];
  }

  //
  // from here it has export keyword.
  //

  const isDefault = node.modifiers?.some(
    (elm) => elm.kind === SyntaxKind.DefaultKeyword
  );

  //
  // it has no name, so it just exports a code piece as default.
  //

  if (!node.name) {
    assert(isDefault === true); // also export-default declaration can omit names.
    return [
      {
        type: "export",
        data: [{ name: "default", deps }],
      },
    ];
  }

  //
  // it has a name, so it will declare an internal piece as well as export it.
  //

  const ownName = parseIdentifier(node.name);
  const exportName = isDefault ? "default" : ownName;

  return [
    {
      type: "internal",
      data: [{ name: ownName, deps }],
    },
    {
      type: "export",
      data: [{ name: exportName, deps: [ownName] }],
    },
  ];
};

/**
 *
 */
export const parseExportDeclaration = (
  node: ts.ExportDeclaration,
  containingFile: string,
  compilerOptions: CompilerOptions,
  host: ModuleResolutionHost
): Export | ReExport => {
  assert(node.isTypeOnly === false);

  const exportFile =
    node.moduleSpecifier &&
    ts.resolveModuleName(
      assertPropString(node.moduleSpecifier, "text"),
      containingFile,
      compilerOptions,
      host
    ).resolvedModule?.resolvedFileName;

  //
  // case: `export * from "foo";`
  //

  if (!node.exportClause) {
    return {
      type: "reexport",
      file: def(exportFile),
      data: "all",
    };
  }

  //
  // cases: `export {a}`
  //        `export {a} from "foo"`
  //

  if (ts.isNamedExports(node.exportClause)) {
    const theExports: CodePiece[] = [];

    for (const elm of node.exportClause.elements) {
      const internalName = elm.propertyName
        ? parseIdentifier(elm.propertyName)
        : parseIdentifier(elm.name);

      theExports.push({
        name: parseIdentifier(elm.name),
        deps: [internalName],
      });
    }

    if (exportFile) {
      return { type: "reexport", file: exportFile, data: theExports };
    } else {
      return { type: "export", data: theExports };
    }
  }

  //
  // case: `export * as var from "foo";`
  //

  if (isNamespaceExport(node.exportClause)) {
    if (!exportFile) {
      throw new Error("file to reexport not found");
    }

    return {
      type: "reexport",
      file: exportFile,
      data: { nsAlias: parseIdentifier(node.exportClause.name) },
    };
  }

  //never

  throw assertNever(
    node.exportClause,
    "unknown exportClause in export ",
    ts.SyntaxKind[(node.exportClause as any).kind]
  );
};

/**
 * - an import declaration can contain default with either namespace or named imports, so we return an array.
 */
export const parseImportDeclaration = (
  node: ts.ImportDeclaration,
  containingFile: string,
  compilerOptions: CompilerOptions,
  host: ModuleResolutionHost
): Import | null => {
  const moduleSpecifier = assertPropString(node.moduleSpecifier, "text");

  const importedFile = ts.resolveModuleName(
    moduleSpecifier,
    containingFile,
    compilerOptions,
    host
  ).resolvedModule?.resolvedFileName;

  if (!importedFile) {
    if (moduleSpecifier.match(/^(\.|\/)/)) {
      // hard fail
      //if it's to a file relative or absolute. I.e. in the project folder.
      throw err("import not found", node.moduleSpecifier);
    }

    //ignore native nodejs
    //ignore not found in node_modules
    return null;
  }

  //
  //case: import "library"
  //

  if (!node.importClause) {
    return {
      type: "import",
      file: importedFile,
    };
  }

  const named: CodePiece[] = []; //holds both default and named imports

  //
  //case: import default from "library"
  //  or: import default [, more stuff] from "library"
  //

  if (node.importClause.name) {
    named.push({
      name: parseIdentifier(node.importClause.name),
      deps: ["default"],
    }); //may be returned with other imports below.
  }

  //return if it's only default import.

  if (!node.importClause.namedBindings) {
    //it's only a default import
    return {
      type: "import",
      file: importedFile,
      named,
    };
  }

  //
  // here we have more than just default import. And possible no default.
  //

  //
  //case: import {b,c} from "library"
  //

  if (node.importClause.namedBindings.kind === ts.SyntaxKind.NamedImports) {
    for (const elm of node.importClause.namedBindings.elements) {
      const name = parseIdentifier(elm.name);

      const dep = elm.propertyName ? parseIdentifier(elm.propertyName) : name;

      named.push({ name, deps: [dep] });
    }

    return { type: "import", file: importedFile, named };
  }

  //
  //case: import * as ns from "library"
  //

  if (node.importClause.namedBindings.kind === ts.SyntaxKind.NamespaceImport) {
    return {
      type: "import",
      file: importedFile,
      nsAlias: parseIdentifier(node.importClause.namedBindings.name),
      named,
    };
  }

  //never

  throw assertNever(
    node.importClause.namedBindings,
    "unknown namedBindings in binding in import ",
    ts.SyntaxKind[(node.importClause.namedBindings as any).kind]
  );
};

/**
 *
 */
export const parseExportAssignment = (
  node: ts.ExportAssignment
): Export | ReExport => {
  if (node.isExportEquals) {
    //case: export = 1
    throw err("not supported: export = expr");
  } else {
    //case: export default expr

    return {
      type: "export",
      data: [{ name: "default", deps: parseExpression(node.expression) }],
    };
  }
};

/**
 * - in toplevel it's allowed to have export keywords.
 *
 * ex
 *    const a, b = 1
 *    export const a, b = 1
 *    export default const a, b = 1
 */
export const parseTopLevelVariableStatement = (
  node: ts.VariableStatement
): (InternalPieces | Export | ReExport)[] => {
  if (node.modifiers?.some((elm) => elm.kind === SyntaxKind.DeclareKeyword)) {
    // we can't extract anything meaningful from declare, right?
    return [];
  }

  assert( node.modifiers?.some((elm) => elm.kind === SyntaxKind.DefaultKeyword) !== true ); // prettier-ignore

  const decl = parseVariableDeclarationList(node.declarationList);

  const isExport = node.modifiers?.some(
    (elm) => elm.kind === SyntaxKind.ExportKeyword
  );

  if (!isExport) {
    //internal code piece (it's not exported)
    return [
      {
        type: "internal",
        data: decl.codePieces,
      },
    ];
  } else {
    const exports = decl.codePieces.map<CodePiece>((piece) => ({
      name: piece.name,
      deps: [piece.name],
    }));

    return [
      {
        type: "internal",
        data: decl.codePieces,
      },
      {
        type: "export",
        data: exports,
      },
    ];
  }
};

/**
 * Meant for places, where no exports are declared.
 *
 * ex
 *    const a, b = 1
 *    {const a, b = 1}
 *
 * not
 *    export const a, b = 1
 */
export const parseVariableStatement = (
  node: ts.VariableStatement
): string[] => {
  assert(node.modifiers === undefined);

  const decl = parseVariableDeclarationList(node.declarationList);

  // we just ignore introduced names for now.

  return decl.deps;
};

/**
 * - only parses the statement part for switch cases.
 */
export const parseStatements = (statements?: NodeArray<Statement>) => {
  if (statements === undefined) {
    return [];
  }

  return statements.reduce<string[]>(
    (acc, cur) => acc.concat(parseStatement(cur)),
    []
  );
};

/**
 * - introduced names are not considered yet.
 */
export const parseStatement = (node?: Statement): string[] => {
  if (node === undefined) {
    return [];
  }

  if (
    ts.isExpressionStatement(node) ||
    ts.isReturnStatement(node) ||
    ts.isThrowStatement(node)
  ) {
    return parseExpression(node.expression);
  }

  if (ts.isBreakStatement(node) || ts.isContinueStatement(node)) {
    return [];
  }

  if (ts.isIfStatement(node)) {
    return [
      ...parseExpression(node.expression),
      ...parseStatement(node.thenStatement),
      ...parseStatement(node.elseStatement),
    ];
  }

  if (ts.isWhileStatement(node) || ts.isDoStatement(node)) {
    return [
      ...parseExpression(node.expression),
      ...parseStatement(node.statement),
    ];
  }

  if (ts.isSwitchStatement(node)) {
    return parseSwitch(node);
  }

  if (ts.isForStatement(node)) {
    return [
      ...parseStatement(node.statement),
      ...parseForInitializer(node.initializer),
      ...parseExpression(node.condition),
      ...parseExpression(node.incrementor),
    ];
  }

  if (ts.isForInStatement(node) || ts.isForOfStatement(node)) {
    return [
      ...parseStatement(node.statement),
      ...parseForInitializer(node.initializer),
      ...parseExpression(node.expression),
    ];
  }

  if (ts.isBlock(node)) {
    return parseStatements(node.statements);
  }

  if (ts.isVariableStatement(node)) {
    return parseVariableStatement(node);
  }

  if (ts.isFunctionDeclaration(node)) {
    return parseFunctionLike(node);
  }

  if (ts.isClassDeclaration(node)) {
    return parseClass(node);
  }

  if (ts.isTryStatement(node)) {
    let vars: string[] = [];

    assert(node.catchClause?.variableDeclaration?.initializer === undefined); // there can't be an initializer in a catch clause.

    if (node.catchClause && node.catchClause.variableDeclaration) {
      vars = parseBinding(node.catchClause.variableDeclaration.name).deps;
    }

    return [
      ...parseStatements(node.tryBlock.statements),
      ...parseStatements(node.catchClause?.block.statements),
      ...vars,
      ...parseStatements(node.finallyBlock?.statements),
    ];
  }

  //can't assertNever here, because Statement is basically an uninformative type.

  throw err("unknown node in statement: ", ts.SyntaxKind[node.kind], node);
};

/**
 *
 */
export const parseForInitializer = (node?: ForInitializer): string[] => {
  if (node === undefined) {
    return [];
  }

  if (ts.isVariableDeclarationList(node)) {
    // we just ignore introduced names for now.

    const decl = parseVariableDeclarationList(node);

    return decl.deps;
  }

  return parseExpression(node);
};

/**
 *
 */
export const parseSwitch = (node: SwitchStatement): string[] => {
  let deps: string[] = [];

  for (const clause of node.caseBlock.clauses) {
    if ("expression" in clause) {
      deps = deps.concat(parseExpression(clause.expression));
    }
    deps = deps.concat(parseStatements(clause.statements));
  }

  return [...parseExpression(node.expression), ...deps];
};

/**
 * - return both the code pieces declared, and the overall deps seen.
 *
 * part of export statements
 *  ex
 *    export const a = 1
 *
 * part of a VariableStatement
 *  ex
 *    a = 1
 *    a, b = 1
 *    a = 1, b = 1
 *
 * part of for loops
 *  ex
 *    for (;;)
 *    for (i;;)
 *    for (let i = 0;;)
 *    for (let i in [])
 *
 * note
 *  flags tells if it's: var, const or let.
 */
export const parseVariableDeclarationList = (
  node: ts.VariableDeclarationList
) => {
  const res: CodePiece[] = [];
  let deps: string[] = [];

  for (const decl of node.declarations) {
    const binding = parseBinding(decl.name);
    const declDeps = parseExpression(decl.initializer);

    deps = deps.concat(declDeps).concat(binding.deps);

    for (const name of binding.names) {
      res.push({
        name,
        deps: [...declDeps, ...binding.deps],
      });
    }
  }

  return { codePieces: res, deps };
};

/**
 *
 * - returns list of introduced names, and dependencies.
 * - the alias in object bindings is used, as it's the name declared.
 * - deps comes from the initializers.
 * - initializers impacts all introduced code pieces, for now. It might be okay to have them separate.
 *
 * ex:
 *  [a,b]
 *  [a, ...rest]
 *  {a}
 *  {a:alias}
 *  {a = 1}
 *
 * note
 *  - array and object binding are much alike, they can be handled together.
 *  - ts.BindingName is strangely named. Better just call it `Binding`
 *  - propertyName is never interesting. It's not introducing a variable name. The (sub)binding is where there's content.
 *      it means array and object bindings can be handled in the exact same way.
 *  - binding is stored in `node.name`
 *  - propertyName
 *      - only used in object bindings. It's never set in array bindings.
 *      - it's set, if there is an alias. e.g. `const {propertyName:binding} = 1`.
 *      - it's not set in: `const {binding} = 1`. Even if `binding` is an identifier.
 */

export const parseBinding = (binding: ts.BindingName): BindingInfo => {
  if (ts.isIdentifier(binding)) {
    //it's just a simple variable. No destructuring
    return { names: [parseIdentifier(binding)], deps: [] };
  }

  if (ts.isArrayBindingPattern(binding) || ts.isObjectBindingPattern(binding)) {
    let names: string[] = [];
    let deps: string[] = [];

    for (const elm of binding.elements) {
      //
      // sub bindings
      //

      if (ts.isOmittedExpression(elm)) {
        //only relevant for array bindings. e.g. `const [,] = 1`
        //nothing to find here
        continue;
      }

      // property names can have dependencies, if they are computed.

      if (elm.propertyName) {
        deps = deps.concat(parsePropertyNameDependencies(elm.propertyName));
      }

      // add dependencies from the inilializer

      deps = deps.concat(parseExpression(elm.initializer));

      //recurse or just the identifier.

      const sub = parseBinding(elm.name); //recurse down into each subbinding.

      names = names.concat(sub.names);

      deps = deps.concat(sub.deps); // dependencies from all sub initializers
    }

    return { names, deps };
  }

  throw assertNever(
    binding,
    "unknown node in binding",
    ts.SyntaxKind[(binding as any).kind]
  );
};

/**
 *
 */
export const parseIdentifier = (node: ts.Identifier) => {
  assert(node.text === node.escapedText); //when is there a difference?

  return node.text;
};

/**
 * - name is ignored. Caller can easily handle that, if it's applicable.
 */
export const parseClass = (node: ClassLikeDeclarationBase): string[] => {
  let res: string[] = [];

  //extends, implements

  for (const clause of node.heritageClauses || []) {
    for (const type of clause.types || []) {
      res = res.concat(parseExpression(type.expression));
    }
  }

  //members - pretty much the same, as parsing a object literal.

  res = res.concat(parseObjectElements(node.members));

  return res;
};

/**
 * - handles object literal properties and class members.
 */
export const parseObjectElements = (
  elms: NodeArray<ObjectLiteralElementLike | ClassElement>
): string[] => {
  let res: string[] = [];

  for (const prop of elms) {
    res = res.concat(parseObjectElement(prop));
  }

  return res;
};

/**
 *
 */
export const parseObjectElement = (
  prop: ObjectLiteralElementLike | ClassElement
): string[] => {
  if (ts.isPropertyAssignment(prop)) {
    const propName = parsePropertyNameDependencies(prop.name);

    //we don't care about the names declared here. Only the dependencies from computed property names.

    return [...propName, ...parseExpression(prop.initializer)];
  }

  if (ts.isPropertyDeclaration(prop)) {
    return [
      ...parsePropertyNameDependencies(prop.name), // when member names are computed.
      ...parseExpression(prop.initializer),
    ];
  }

  if (ts.isShorthandPropertyAssignment(prop)) {
    return [
      parseIdentifier(prop.name),
      ...parseExpression(prop.objectAssignmentInitializer),
    ];
  }

  if (ts.isSpreadAssignment(prop)) {
    return parseExpression(prop.expression);
  }

  if (
    ts.isConstructorDeclaration(prop) ||
    ts.isMethodDeclaration(prop) ||
    ts.isGetAccessorDeclaration(prop) ||
    ts.isSetAccessorDeclaration(prop)
  ) {
    return [
      ...parsePropertyNameDependencies(prop.name),
      ...parseFunctionLike(prop),
    ];
  }

  if (ts.isSemicolonClassElement(prop)) {
    return [];
  }

  //can't assertNever here, because ClassElement is basically an uninformative type.

  throw err(
    "unknown node in object/class element: ",
    ts.SyntaxKind[prop.kind],
    prop
  );
};

/**
 * - dependencies comes from ComputedPropertyName.
 * - identifiers aren't references, but keys in objects.
 */
export const parsePropertyNameDependencies = (
  propName?: PropertyName
): string[] => {
  if (propName === undefined) {
    return [];
  }

  if (ts.isComputedPropertyName(propName)) {
    return parseExpression(propName.expression);
  }

  if (
    ts.isStringLiteral(propName) ||
    ts.isNumericLiteral(propName) ||
    ts.isIdentifier(propName) ||
    ts.isPrivateIdentifier(propName) // e.g. `class MyClass { #name = 1}`
  ) {
    return [];
  }

  throw assertNever(
    propName,
    "unknown node in binding name",
    ts.SyntaxKind[(propName as any).kind]
  );
};

/**
 * - name is ignored, because not all functions have names. And caller can easily handle that.
 * - declare function is supported, for convenience.
 */
export const parseFunctionLike = (
  node: FunctionLikeDeclarationBase
): string[] => {
  if (!node.body) {
    //this case: `declare function fido();`
    return [];
  }

  const params = node.parameters.reduce<string[]>(
    (acc, cur) => acc.concat(parseExpression(cur.initializer)),
    []
  );

  const body = isBlock(node.body)
    ? parseStatements(node.body.statements)
    : parseExpression(node.body);

  return [...params, ...body];
};

/**
 *
 */
export const parseExpressions = (arr?: NodeArray<Expression>): string[] => {
  if (arr === undefined) {
    return [];
  }

  let res: string[] = [];

  for (const expr of arr) {
    res = res.concat(parseExpression(expr));
  }

  return res;
};

/**
 * - return a list of referenced identifiers.
 *
 */
export const parseExpression = (node?: ts.Expression): string[] => {
  if (node === undefined) {
    return [];
  }

  if (
    ts.isPropertyAccessExpression(node) ||
    ts.isAsExpression(node) ||
    ts.isDeleteExpression(node) ||
    ts.isTypeOfExpression(node) ||
    ts.isTypeAssertionExpression(node) ||
    ts.isParenthesizedExpression(node)
  ) {
    return parseExpression(node.expression);
  }

  if (ts.isPostfixUnaryExpression(node) || ts.isPrefixUnaryExpression(node)) {
    return parseExpression(node.operand);
  }

  if (ts.isArrayLiteralExpression(node)) {
    return parseExpressions(node.elements);
  }

  if (ts.isObjectLiteralExpression(node)) {
    return parseObjectElements(node.properties);
  }

  if (ts.isBinaryExpression(node)) {
    return [...parseExpression(node.left), ...parseExpression(node.right)];
  }

  if (ts.isTemplateExpression(node)) {
    return node.templateSpans.reduce<string[]>(
      (acc, cur) => acc.concat(parseExpression(cur.expression)),
      []
    );
  }

  if (ts.isElementAccessExpression(node)) {
    return [
      ...parseExpression(node.expression),
      ...parseExpression(node.argumentExpression),
    ];
  }

  if (ts.isCallExpression(node)) {
    if (node.questionDotToken !== undefined) {
      err("unknown questionDotToken in CallExpression");
    }

    return [
      ...parseExpression(node.expression),
      ...parseExpressions(node.arguments),
    ];
  }

  if (ts.isNewExpression(node)) {
    return [
      ...parseExpression(node.expression),
      ...parseExpressions(node.arguments),
    ];
  }

  if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
    return parseFunctionLike(node);
  }

  if (ts.isClassExpression(node)) {
    return parseClass(node);
  }

  if (ts.isConditionalExpression(node)) {
    return [
      ...parseExpression(node.condition),
      ...parseExpression(node.whenTrue),
      ...parseExpression(node.whenFalse),
    ];
  }

  if (ts.isJsxElement(node)) {
    return [
      ...parseJsxTagNameExpression(node.openingElement.tagName),
      ...parseJsxAttributes(node.openingElement.attributes),
      ...parseJsxChildren(node.children),
    ];
  }

  if (ts.isJsxSelfClosingElement(node)) {
    return [
      ...parseJsxTagNameExpression(node.tagName),
      ...parseJsxAttributes(node.attributes),
    ];
  }

  if (ts.isJsxFragment(node)) {
    return parseJsxChildren(node.children);
  }

  if (ts.isIdentifier(node)) {
    return [parseIdentifier(node)];
  }

  if (
    node.kind === SyntaxKind.TemplateExpression ||
    node.kind === SyntaxKind.ElementAccessExpression ||
    node.kind === SyntaxKind.NumericLiteral ||
    node.kind === SyntaxKind.BigIntLiteral ||
    node.kind === SyntaxKind.StringLiteral ||
    node.kind === SyntaxKind.RegularExpressionLiteral ||
    node.kind === SyntaxKind.NoSubstitutionTemplateLiteral ||
    node.kind === SyntaxKind.TrueKeyword ||
    node.kind === SyntaxKind.FalseKeyword ||
    node.kind === SyntaxKind.SuperKeyword ||
    node.kind === SyntaxKind.NullKeyword ||
    node.kind === SyntaxKind.ThisKeyword
  ) {
    return [];
  }

  //can't assertNever here, because Expression is basically an uninformative type.

  throw err("unknown node in expression: ", ts.SyntaxKind[node.kind], node);
};

/**
 *
 */
export const parseJsxTagNameExpression = (
  node: JsxTagNameExpression
): string[] => {
  if (ts.isIdentifier(node)) {
    // it's only a dependency if it starts with uppercase. (React convention). Otherwise it's a build-in react component.
    const name = parseIdentifier(node);
    if (name[0] === name[0].toUpperCase()) {
      //we can do simple upper case check, because we only have alphanum identifiers.
      return [name];
    } else {
      return [];
    }
  }

  if (node.kind === ts.SyntaxKind.ThisKeyword) {
    throw new Error("what is this used for?");
  }

  if (node.kind === ts.SyntaxKind.PropertyAccessExpression) {
    return parseJsxTagNameExpression(node.expression); // one could filter "React" here. But it's from node_modules, so it will be filtered.
  }

  //never

  throw assertNever(
    node,
    "unknown tagName in JsxSelfClosingElement",
    ts.SyntaxKind[(node as any).kind]
  );
};

/**
 *
 */
export const parseJsxAttributes = (node: JsxAttributes): string[] => {
  let res: string[] = [];

  for (const prop of node.properties) {
    if (ts.isJsxAttribute(prop)) {
      if (prop.initializer) {
        res = res.concat(parseJsxExpression(prop.initializer));
      }
      continue;
    }

    if (ts.isJsxSpreadAttribute(prop)) {
      res = res.concat(parseExpression(prop.expression));
      continue;
    }

    //never

    throw assertNever(
      prop,
      "unknown jsx attribute",
      ts.SyntaxKind[(prop as any).kind]
    );
  }

  return res;
};

/**
 *
 * handles StringLiteral for convenience in JsxAttributes.
 */
export const parseJsxExpression = (node: any): string[] => {
  if (ts.isStringLiteral(node)) {
    return [];
  }

  if (ts.isJsxExpression(node)) {
    return parseExpression(node.expression);
  }

  //never

  throw new Error("not impl");

  // throw assertNever(
  //   node,
  //   "unknown node in JsxExpression ",
  //   ts.SyntaxKind[(node as any).kind]
  // );
};

/**
 *
 */
export const parseJsxChildren = (node: NodeArray<JsxChild>): string[] => {
  let res: string[] = [];

  for (const child of node) {
    if (ts.isJsxText(child)) {
      continue;
    }

    if (ts.isJsxExpression(child)) {
      res = res.concat(parseJsxExpression(child));
      continue;
    }

    if (
      ts.isJsxElement(child) ||
      ts.isJsxSelfClosingElement(child) ||
      ts.isJsxFragment(child)
    ) {
      res = res.concat(parseExpression(child));
      continue;
    }

    //never

    throw assertNever(
      child,
      "unknown child in JsxChildren ",
      ts.SyntaxKind[(child as any).kind]
    );
  }

  return res;
};
