import CodeCompiler, { IOptions } from './CodeEngine';

export default function codeEngine(code: string, options: IOptions) {
  const compiler = new CodeCompiler(options);
  const runCode = compiler.codeIsExpression(`(async function(){${code}})`)
    ? `(async function() { return ${code} })()`
    : `(async function() { ${code} })()`;
  compiler.setCode(runCode);
  if (options.identifierMapping) {
    return compiler.getCompileCode();
  }
  return runCode;
}
