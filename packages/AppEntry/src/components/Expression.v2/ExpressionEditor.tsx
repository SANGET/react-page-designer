import React, { Suspense, useEffect, useState, useCallback } from "react";
import { construct } from "@provider-app/provider-app-common/utils/tools";
// import { acorn } from "acorn";
import { Spin, Space, Button, Row, Col, Descriptions, message } from "antd";
import { EditorFromTextArea } from "codemirror";
import { customAlphabet } from "nanoid";
import { useExpMeta } from "../../utils";
import { VariableList } from "./variableList";
import { MethodList } from "./methodList";
import {
  IProps,
  ITransformRes,
  IDefaultTextMark,
  IDefaultMethodTextMark,
  TVariableItem,
} from "./interface";

const nanoid = customAlphabet("platformExp", 8);

const ExpressionEditor = React.lazy(
  () => import(/* webpackChunkName: "code_editor" */ "@provider-app/code-editor-engine")
);

export const Expression: React.FC<IProps> = (props) => {
  const [expReady, expMeta] = useExpMeta();
  const {
    defaultValue,
    metaCtx: { getVariableData, getPageMeta, changePageMeta },
  } = props;
  const curExp = defaultValue ? getPageMeta("exp")?.[defaultValue?.id] : null;
  console.log("curExp", defaultValue, curExp);
  /** 编辑器对象 */
  const [editor, setEditor] = useState<EditorFromTextArea | null>(null);
  /** 编辑器是否准备就绪 */
  const [ready, setReady] = useState<boolean>(false);
  const [defaultCode, setDefaultCode] = useState<string | null>(null);
  /** 变量树 */
  const [variableTree, setVariableTree] = useState<any[]>([]);
  /** 默认值的变量文本标记 */
  const [defaultTextMarks, setDefaultTextMarks] = useState<
    IDefaultTextMark[] | null
  >(null);
  /** 默认值的函数文本标记 */
  const [defaultMethodTextMarks, setDefaultMethodTextMarks] = useState<
    IDefaultMethodTextMark[] | null
  >(null);
  /** 调试结果 */
  const [operationResult, setOperationResult] = useState<{
    message: string;
    success: boolean;
  } | null>(null);

  /**
   * 编辑器插入值
   * @param code 指定字符串
   * @param pos 光标倒退几格
   */
  const insertValue = (code: string, pos = 0) => {
    if (!editor) return;
    const cur = editor.getCursor();
    editor.replaceRange(code, cur, cur, "+insert");
    setTimeout(() => {
      const nextCur = editor.getCursor();
      editor.setCursor({ line: nextCur.line, ch: nextCur.ch - pos });
      editor.focus();
    }, 500);
  };

  /**
   * 清除编辑器
   */
  const resetEditor = () => {
    setOperationResult(null);
    if (!editor) return;
    editor.setValue("");
  };

  /**
   * 选择变量
   * @param variable
   */
  const selectVariable = (variable: TVariableItem) => {
    if (!editor) return;
    const preCur = editor.getCursor();
    editor.replaceRange(variable.title, preCur, preCur, "+insert");
    const cur = editor.getCursor();
    editor.doc.markText(preCur, cur, {
      className: "cm-field cm-field-value",
      attributes: {
        "data-id": variable.id,
        "data-varType": variable.varType,
        "data-type": variable.type,
      },
      atomic: true,
    });
    editor.focus();
  };

  /**
   * 选择函数
   * @param name
   */
  const selectMethod = (name: string, isAsync?: boolean) => {
    if (!editor) return;
    const preCur = editor.getCursor();
    editor.replaceRange(
      `${isAsync ? "await " : ""}${name}`,
      preCur,
      preCur,
      "+insert"
    );
    const cur = editor.getCursor();
    editor.doc.markText(preCur, cur, {
      className: "cm-method cm-method-value",
      attributes: {
        "data-name": name,
      },
      atomic: true,
    });
    // editor.focus();
    insertValue("()", 1);
  };

  /**
   * 检查表达式语法
   * @param code
   * @param relation
   * @returns
   */
  const checkGrammar = (code, relation, methods) => {
    try {
      // const methodArr = methods.map((m) => `function ${m}(){}`);
      relation.forEach((r) => {
        const stateKey = r.id.replace(".", "_");
        if (r.type === "widget") {
          code = code.replace(
            new RegExp(r.id, "g"),
            `handlerCtx.state["${stateKey}"]`
          );
        } else if (r.type === "page") {
          code = code.replace(
            new RegExp(r.id, "g"),
            `handlerCtx.props["${stateKey}"]`
          );
        } else if (r.type === "pageInput") {
          code = code.replace(
            new RegExp(r.id, "g"),
            `handlerCtx.props["${stateKey}"]`
          );
        }
        // 其他变量类型，页面变量不确定来源暂不考虑...
      });
      // console.log("code", code);
      require("@babel/parser").parse(code, {
        sourceType: "module",
        strictMode: true,
      });
      // console.log("ast", ast);
      // eslint-disable-next-line no-new-func
      // const sum = new Function(
      //   "handlerCtx",
      //   `${methodArr.join("")}return ${code}`
      // )({
      //   props: {},
      //   state: {},
      // });
      // console.log("sum", sum);
    } catch (error) {
      message.error(`保存代码失败，请检查语法是否错误`);
      console.log("----------------------------");
      console.log("表达式元数据：", code);
      console.log("具体报错：", error);
      console.log("----------------------------");
      return false;
    }
    return true;
  };
  /**
   * 保存表达式
   */
  const onSubmit = () => {
    if (!editor) return;
    try {
      const { code, relation, methods } = replaceVariablesTitleToId();
      if (code && props.onSubmit) {
        if (!checkGrammar(code, relation, methods)) return;
        const id = defaultValue?.id || `exp_${nanoid()}`;
        changePageMeta({
          type: "update",
          metaAttr: "exp",
          metaID: id,
          data: {
            code,
            relation,
            methods,
          },
        });
        props.onSubmit({ id });
      } else {
        if (defaultValue?.id) {
          changePageMeta({
            type: "rm",
            metaAttr: "exp",
            rmMetaID: defaultValue.id,
          });
        }
        if (props.onSubmit) {
          props.onSubmit({ id: "" });
        }
      }
    } catch (error) {
      message.error("保存代码失败，请检查表达式是否无误");
    }
  };

  /**
   * 转换编辑器内容为低代码字符串和包含变量
   * @param str 编辑器内容
   */
  const replaceVariablesTitleToId = (): ITransformRes => {
    if (!editor) return { code: "", relation: [], methods: [] };
    let code = "";
    const relation: { id: string; varType: string; type: string }[] = [];
    const methods: string[] = [];
    editor.doc.eachLine((line) => {
      let lineText = line.text;
      if (line.markedSpans) {
        const tmp: { title: string; id: string }[] = [];
        const sortMarks = line.markedSpans?.sort((a, b) => a.from - b.from);
        const set = new Set();
        const useMethods = new Set();
        sortMarks.forEach((textMark) => {
          if (textMark.marker.className?.indexOf("cm-field") !== -1) {
            const title = line.text.substring(textMark.from, textMark.to);
            const id = textMark.marker.attributes["data-id"];
            const varType = textMark.marker.attributes["data-varType"];
            const type = textMark.marker.attributes["data-type"];
            tmp.push({ title, id });
            if (!set.has(id)) {
              set.add(id);
              relation.push({ id, varType, type });
            }
          } else if (textMark.marker.className?.indexOf("cm-method") !== -1) {
            const name = textMark.marker.attributes["data-name"];
            if (!useMethods.has(name)) {
              useMethods.add(name);
              methods.push(name);
            }
          }
        });
        tmp.forEach(({ title, id }) => {
          lineText = lineText.replace(title, id);
        });
      }
      // TODO: 要考虑多行的情况
      code += `${code ? "\n" : ""}${lineText}`;
    });
    return { code, relation, methods };
  };

  /**
   * 初始化时增加表达式的变量文本标记
   */
  const addDefaultTextMarks = () => {
    if (editor && defaultTextMarks && defaultTextMarks.length > 0) {
      defaultTextMarks.forEach(({ from, to, item }) => {
        editor.doc.markText(from, to, {
          className: "cm-field cm-field-value",
          attributes: {
            "data-id": item.id,
            "data-varType": item.varType,
            "data-type": item.type,
          },
          atomic: true,
        });
      });
    }
  };

  /**
   * 初始化时增加表达式的函数文本标记
   */
  const addDefaultMethodTextMarks = () => {
    if (editor && defaultMethodTextMarks && defaultMethodTextMarks.length > 0) {
      defaultMethodTextMarks.forEach(({ from, to, item }) => {
        editor.doc.markText(from, to, {
          className: "cm-method cm-method-value",
          attributes: {
            "data-name": item,
          },
          atomic: true,
        });
      });
    }
  };

  /**
   * 编辑器初始化完成回调
   */
  const onReady = () => {
    setReady(true);
    addDefaultTextMarks();
    addDefaultMethodTextMarks();
  };

  /**
   * 初始化处理表达式存在默认值的情况
   * @param variable 所有变量集合
   */
  const initDefaultValue = useCallback(() => {
    const variableData = getVariableData();
    setVariableTree(
      construct(variableData, {
        nodeDecorator: (node) => {
          // node.disabled = !node.type || ["page"].includes(node.type);
          node.title = node.wholeTitle;
        },
      })
    );
    if (defaultValue?.id && !curExp?.code) {
      message.error("未查询到表达式");
      setDefaultCode("");
      return;
    }
    if (defaultValue?.id) {
      let { code } = curExp;
      const { relation, methods } = curExp;
      console.log("初始编辑器内容: ", code);
      let methodTextMarks: IDefaultMethodTextMark[] = [];
      if (curExp?.relation?.length > 0) {
        const textMarks: IDefaultTextMark[] = [];
        const relationIds = relation.map((item) => item.id);
        // 获取使用的变量数组
        const useVariables = relationIds.map((curId, i) => {
          return variableData.find((item) => item.id === curId) || false;
        });
        console.log("代码中使用的变量数组: ", useVariables);
        // 判断表达式中的变量是否存在
        if (useVariables.includes(false)) {
          message.error("存在变量丢失，表达式失效");
          setDefaultCode("");
          return;
        }
        const useVariablesObj = useVariables.reduce((a, b) => {
          a[b.id] = b;
          return a;
        }, {});
        // 获取代码中使用的变量顺序
        const set = new Set();
        const arr = relationIds
          .reduce((a, b) => {
            if (set.has(b)) return a;
            set.add(b);
            const regexp = new RegExp(b.replace(/\./g, "\\."), "g");
            [...code.matchAll(regexp)].forEach((item, i) => {
              console.log(item, i);
              a.push({
                index: item.index || 0,
                field: item[0],
              });
            });
            return a;
          }, [] as { index: number; field: string }[])
          .sort((a, b) => a.index - b.index);
        console.log("代码中使用的变量顺序: ", arr);
        // 替换 TODO: 未考虑多行的情况
        let cur: { index: number; field: string } | undefined = arr.shift();
        while (cur) {
          textMarks.push({
            from: { line: 0, ch: code.indexOf(cur.field) },
            to: {
              line: 0,
              ch:
                code.indexOf(cur.field) +
                useVariablesObj[cur.field].title.length,
            },
            item: useVariablesObj[cur.field],
          });
          code = code.replace(cur.field, useVariablesObj[cur.field].title);
          cur = arr.shift();
        }
        if (methods?.length > 0) {
          methodTextMarks = getDefaultMethodsTextMarks(code, methods);
          setDefaultMethodTextMarks(methodTextMarks);
        }
        console.log("文本标记: ", textMarks);

        if (textMarks?.length > 0) {
          setDefaultTextMarks(textMarks);
          setDefaultCode(code);
        }
      } else {
        if (methods?.length > 0) {
          methodTextMarks = getDefaultMethodsTextMarks(code, methods);
          setDefaultMethodTextMarks(methodTextMarks);
        }

        setDefaultCode(code);
      }
    }
  }, [defaultValue, curExp, getVariableData]);

  const getDefaultMethodsTextMarks = (
    code: string,
    methods: string[]
  ): IDefaultMethodTextMark[] => {
    const textMarks: IDefaultMethodTextMark[] = [];
    methods.forEach((method) => {
      textMarks.push({
        from: { line: 0, ch: code.indexOf(method) },
        to: {
          line: 0,
          ch: code.indexOf(method) + method.length,
        },
        item: method,
      });
    });

    return textMarks;
  };

  useEffect(() => {
    // const pageId = props.metaCtx.getPageInfo()?.pageID;
    // const widgetId = props.metaCtx.getSelectedEntity()?.id;
    initDefaultValue();
  }, [initDefaultValue]);

  return (
    <Suspense fallback={<span></span>}>
      <div className="expression">
        <Spin
          tip="初始化编辑器..."
          spinning={!ready}
          style={{ backgroundColor: "#fff" }}
        >
          <div className="expression-editor">
            <div className="expression-header">
              <span>{`结果 = ${
                operationResult ? operationResult.message : ""
              }`}</span>
              <Space size="small">
                <Button size="small" type="text" danger onClick={resetEditor}>
                  清除
                </Button>
              </Space>
            </div>
            {!curExp || defaultCode || defaultCode === "" ? (
              <ExpressionEditor
                theme="ttcn"
                mode="javascript"
                lint={false}
                height="130px"
                defaultValue={defaultCode || ""}
                getEditor={(curEditor) => setEditor(curEditor)}
                ready={onReady}
              />
            ) : (
              ""
            )}
            <div className="expression-footer">
              <span></span>
            </div>
          </div>
        </Spin>
        <Row gutter={8}>
          <Col span={6}>
            <VariableList
              variableTree={variableTree}
              selectVariable={selectVariable}
            />
          </Col>
          <Col span={12}>
            <MethodList
              ready={expReady}
              data={expMeta}
              onSelect={selectMethod}
            />
          </Col>
          <Col span={6}>
            <section className="expression-option">
              <h4>注意</h4>
              <div
                className="expression-option-body"
                style={{ padding: "0 16px", paddingTop: 12 }}
              >
                <Descriptions column={1} size="small">
                  <Descriptions.Item key="no1" label="1">
                    要使用固定的变量请使用英文双引号包裹，比如表达式（abc +
                    张三）需要写成（"abc" + "张三"）
                  </Descriptions.Item>
                  <Descriptions.Item key="no1" label="1">
                    请在英文输入法模式下编辑表达式
                  </Descriptions.Item>
                  <Descriptions.Item key="no2" label="2">
                    变量和预置函数只能从列表中选择，不支持手动输入
                  </Descriptions.Item>
                  <Descriptions.Item key="no3" label="3">
                    变量和预置函数不支持复制粘贴操作
                  </Descriptions.Item>
                  <Descriptions.Item key="no4" label="4">
                    支持原生 JavaScript 语法
                  </Descriptions.Item>
                </Descriptions>
              </div>
            </section>
          </Col>
        </Row>
        <div className="expression-handle py-4">
          <div></div>
          <Button type="primary" onClick={onSubmit}>
            确定
          </Button>
        </div>
      </div>
    </Suspense>
  );
};
