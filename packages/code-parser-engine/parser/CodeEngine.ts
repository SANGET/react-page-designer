import { parse } from "@babel/parser";
import traverse, { NodePath } from "@babel/traverse";
import generate from "@babel/generator";
import { transform } from "@babel/core";
import { File } from "@babel/types";

export interface IOptions {
  visitor?: { enter: (path: NodePath) => void };
  es5?: boolean;
  identifierMapping?: { [key: string]: string };
}

export default class CodeCompiler {
  /** 代码块 */
  private code: string;

  /** AST */
  private ast: File | null;

  /**  */
  private visitor: IOptions['visitor'] | null  = null;

  private es5 = true;

  private identifierMapping: { [key: string]: string } = {};

  constructor(options: IOptions) {
    this.code = "";
    this.ast = null;
    this.es5 = options?.es5 || false;
    this.identifierMapping = options?.identifierMapping || {};
    this.visitor = this.getVisitor(options?.visitor);
  }

  /**
   * 判断代码为表达式还是低代码
   * @param code 代码字符串
   */
  public codeIsExpression(code: string): boolean {
    // const statement = parse(code).program.body[0];
    // if(statement.type === "ExpressionStatement"){
    //   return true;
    // }
    // return false;
    const { expression } = parse(code).program.body[0];
    return (
      expression &&
      expression.body.body.length === 1 &&
      expression.body.body[0].type === "ExpressionStatement"
    );
  }

  /**
   * 设置 code 值
   * @param code
   */
  public setCode(code: string) {
    this.code = code;
  }

  /**
   * 获取编译后的 code
   */
  public getCompileCode() {
    return this.es5 ? this.codeTransformEs5() : this.astGenerateCode();
  }

  /**
   * 获取转换后的 es5 代码字符串
   */
  public codeTransformEs5(): string {
    return transform(this.astGenerateCode(), {
      presets: [
        [
          require("@babel/preset-env"),
          {
            modules: false
          }
        ]
      ]
    })?.code as string;
  }

  /**
   * 获取为转换的代码字符串
   */
  public astGenerateCode(): string {
    this.parseCodeToAst();
    this.traverseAst();
    const res = generate(this.ast as File, {
      comments: false
    });
    return res.code;
  }

  /**
   * code 解析成AST
   */
  public parseCodeToAst(): void {
    this.ast = parse(this.code);
  }

  /**
   * 变量AST 并对节点进行对应转化
   */
  public traverseAst(): void {
    if(this.visitor?.enter){
      traverse(this.ast as File, this.visitor);
    }
  }

  /**
   * 转化AST节点类型
   * @param visitor
   */
  public getVisitor(visitor?: IOptions['visitor'] | null): IOptions['visitor'] {
    if (visitor) {
      return visitor;
    }
    const { identifierMapping } = this;
    return {
      enter(path: NodePath) {
        if (path.node.type === "Identifier" && identifierMapping[path.node.name]) {
          path.node.name = identifierMapping[path.node.name];
        }
      }
    };
  }
}
