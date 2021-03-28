import React, { Suspense, useEffect, useState } from "react";
import {
  Spin,
  Space,
  Button,
  Row,
  Col,
  Input,
  InputNumber,
  Modal,
  message,
} from "antd";
import { EditorFromTextArea } from "codemirror";
import codeParser from "@provider-app/code-parser-engine/parser";
import createSandbox from "@provider-app/code-parser-engine/sandbox";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { VariableList } from "./variableList";
import { MethodList } from "./methodList";
import {
  IHyMethod,
  IProps,
  ITransformRes,
  IDefaultTextMark,
  TVariableItem,
  TVariableTree,
} from "./interface";

const { confirm } = Modal;

const ExpressionEditor = React.lazy(
  () => import(/* webpackChunkName: "code_editor" */ "@provider-app/code-editor-engine")
);
export const Expression: React.FC<IProps> = (props) => {
  /** 编辑器对象 */
  const [editor, setEditor] = useState<EditorFromTextArea | null>(null);
  /** 编辑器是否准备就绪 */
  const [ready, setReady] = useState<boolean>(false);
  const [defaultCode, setDefaultCode] = useState<string | null>(null);
  const [curWidget, setCurWidget] = useState<{
    state: string;
    variable: string;
  } | null>(null);
  /** 当前正在查看简介的函数对象 */
  const [curFunction, setCurFunction] = useState<IHyMethod | null>(null);
  /** 用于调试的变量-键值对，用于沙箱的上下文 */
  const [debugCodeValue, setDebugCodeValue] = useState<{
    [key: string]: number | string;
  }>({});
  /** 变量是否正在编辑-键值对 */
  const [variableVisible, setVariableVisible] = useState<{
    [key: string]: boolean;
  }>({});
  /** 变量树 */
  const [variableTree, setVariableTree] = useState<
    TVariableTree<TVariableItem>
  >({});
  /** 默认值的变量文本标记 */
  const [defaultTextMarks, setDefaultTextMarks] = useState<
    IDefaultTextMark[] | null
  >(null);
  /** 编辑器是否编辑过 */
  const [edited, setEditing] = useState<boolean>(false);
  /** 编辑器下拉提示 */
  // const [hintOptions, setHintOptions] = useState<{ completeSingle: boolean; keywords: string[] }>({
  //   completeSingle: false,
  //   keywords: []
  // });
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
   * 根据变量类型初始化变量编辑组件
   */
  const initVariableEdit = (varType: string, field: string) => {
    switch (varType) {
      case "number":
        return (
          <InputNumber
            onPressEnter={(e) => {
              setDebugCodeValue((preDebugCodeValue) => ({
                ...preDebugCodeValue,
                [field]: e.target.value,
              }));
              setVariableVisible((pre) => ({
                ...pre,
                [field]: !pre[field],
              }));
            }}
          />
        );
      case "string":
        return (
          <Input
            onPressEnter={(e) => {
              setDebugCodeValue((preDebugCodeValue) => ({
                ...preDebugCodeValue,
                [field]: e.target.value,
              }));
              setVariableVisible((pre) => ({
                ...pre,
                [field]: !pre[field],
              }));
            }}
          />
        );
      case "date":
        return <div>待开发</div>;
      case "dateTime":
        return <div>待开发</div>;
      default:
        return <div>待开发</div>;
    }
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
    // insertValue(variable.title, 0);
    if (!editor) return;
    const preCur = editor.getCursor();
    editor.replaceRange(variable.title, preCur, preCur, "+insert");
    const cur = editor.getCursor();
    editor.doc.markText(preCur, cur, {
      className: "cm-field cm-field-value",
      attributes: { "data-id": variable.id, "data-field": variable.field },
      atomic: true,
    });
    editor.focus();
  };
  /**
   * 保存表达式
   */
  const onSubmit = () => {
    if (!editor) return;
    const value = editor.getValue();
    if (!curWidget || !curWidget.state) {
      message.error("不存在目标控件");
    }
    if (value) {
      try {
        const { code, fieldMap } = replaceVariablesTitleToId();
        if (code && curWidget && props.onSubmit) {
          // TODO: 目前只考虑文本框值的情况
          props.onSubmit({
            code,
            body: `const{${curWidget.state}}=snippetParams.container.state;snippetParams.container.setState({${curWidget.state}: { ...${curWidget.state}, ${curWidget.variable}: ${code}}});`,
            relation: {
              from: Object.keys(fieldMap)?.length ? Object.keys(fieldMap) : [],
              to: [`${curWidget.state}.${curWidget.variable}`],
            },
          });
        } else {
          message.error("生成代码失败，请检查表达式是否无误");
        }
      } catch (error) {
        message.error("生成代码失败，请检查表达式是否无误");
      }
    } else if (props.onSubmit) {
      props.onSubmit({ code: null });
    }
  };
  /**
   * 保存前校验调试
   */
  const checkSubmit = () => {
    if (!operationResult || !operationResult.success) {
      confirm({
        title: "表达式调试未通过，确定提交?",
        icon: <ExclamationCircleOutlined />,
        okText: "确定",
        cancelText: "取消",
        maskClosable: true,
        onOk: onSubmit,
      });
    }
  };
  /**
   * 转换编辑器内容为低代码字符串和包含变量
   * @param str 编辑器内容
   */
  const replaceVariablesTitleToId = (): ITransformRes => {
    if (!editor) return { code: "", fieldMap: {}, titleMap: {} };
    let code = "";
    const fieldMap = {};
    const titleMap = {};
    editor.doc.eachLine((line) => {
      let lineText = line.text;
      if (line.markedSpans) {
        const tmp: { title: string; field: string }[] = [];
        const sortMarks = line.markedSpans?.sort((a, b) => a.from - b.from);
        sortMarks.forEach((textMark) => {
          if (textMark.marker.className?.indexOf("cm-field") !== -1) {
            const title = line.text.substring(textMark.from, textMark.to);
            const field = textMark.marker.attributes["data-field"];
            const id = textMark.marker.attributes["data-id"];
            tmp.push({ title, field });
            fieldMap[field] = id;
            titleMap[field] = title;
          }
        });
        tmp.forEach(({ title, field }) => {
          lineText = lineText.replace(title, field);
        });
      }
      // TODO: 要考虑多行的情况
      code += `${code ? "\n" : ""}${lineText}`;
    });
    return { code, fieldMap, titleMap };
  };
  /**
   * 检查变量的设置值是否满足调试需要
   * @param { fieldMap, titleMap } 字段映射和标题映射
   * @param Values 变量设置值键值对
   */
  const checkDebugCodeContext = (
    { fieldMap, titleMap }: ITransformRes,
    Values: { [key: string]: number | string }
  ): boolean => {
    let success = true;
    for (
      let i = 0, fieldMapKey = Object.keys(fieldMap);
      i < fieldMapKey.length;
      i++
    ) {
      if (!Values[fieldMapKey[i]]) {
        message.error(`缺少调试变量 ${titleMap[fieldMapKey[i]]}`);
        success = false;
        break;
      }
    }
    return success;
  };
  /**
   * 调试代码
   */
  const debugCode = async () => {
    if (!editor) return;
    const code = editor.getValue();
    console.log("编辑器内容", code);
    if (code) {
      try {
        const transformRes = replaceVariablesTitleToId();
        console.log("转换结果: ", transformRes);
        console.log("变量上下文: ", debugCodeValue);
        // 检查所需参数/变量是否存在
        if (checkDebugCodeContext(transformRes, debugCodeValue)) {
          const str = codeParser(transformRes.code, {});
          console.log("低代码引擎处理结果: ", str);
          // const sandbox = createSandbox({ ...debugCodeValue, HY }, {});
          const sandbox = createSandbox({ ...debugCodeValue }, {});
          const res = await sandbox(str);
          console.log("调试结果: ", res);
          message.success(
            `调试结果: ${typeof res === "object" ? JSON.stringify(res) : res}`
          );
          setOperationResult({
            message: typeof res === "object" ? JSON.stringify(res) : res,
            success: true,
          });
        }
      } catch (error) {
        console.dir("调试失败: ", error);
        setOperationResult({ message: error.toString(), success: false });
        message.error(`调试失败，${error.message}`);
      }
    } else {
      message.warn("编辑器没有内容");
    }
  };
  /**
   * 初始化时增加表达式的文本标记
   */
  const addDefaultTextMarks = () => {
    if (editor && defaultTextMarks && defaultTextMarks.length > 0) {
      defaultTextMarks.forEach(({ from, to, item }, i) => {
        editor.doc.markText(from, to, {
          className: "cm-field cm-field-value",
          attributes: { "data-id": item.id, "data-field": item.field },
          atomic: true,
        });
      });
    }
  };
  /**
   * 初始化处理表达式存在默认值的情况
   * @param variable 所有变量集合
   */
  const initDefaultValue = (allVariable) => {
    if (
      props.defaultValue &&
      props.defaultValue.code &&
      props.defaultValue.relation
    ) {
      let { code } = props.defaultValue;
      const { relation } = props.defaultValue;
      const hasVariable = !!relation?.from?.length;
      const textMarks: IDefaultTextMark[] = [];
      if (hasVariable) {
        const variable = relation.from.map((item) => ({
          state: `snippetParams.container.state.${item}`,
          field: item,
        }));
        const useVariableFields = variable.map((item) => item.field);
        // 获取使用的变量数组
        const useVariables = Object.keys(allVariable).reduce((a, b) => {
          useVariableFields.forEach((useField, i) => {
            const cur = allVariable[b].find(
              (item: TVariableItem) => item.field === useField
            );
            if (cur) {
              a[useField] = cur;
            }
          });
          return a;
        }, {} as { [key: string]: TVariableItem });
        console.log("代码中使用的变量数组: ", useVariables);
        // 判断表达式中的变量是否存在
        if (
          !useVariableFields.reduce((a, b) => !(!useVariables[b] || !a), true)
        ) {
          message.error("存在变量丢失，表达式失效");
          setDefaultCode("");
          return;
        }
        // 获取代码中使用的变量顺序
        const arr = variable
          .reduce((a, b) => {
            const regexp = new RegExp(b.field.replace(/\$/g, "\\$"), "g");
            [...code.matchAll(regexp)].forEach((item) => {
              a.push({
                index: item.index || 0,
                field: item[0],
              });
            });
            return a;
          }, [] as { index: number; field: string }[])
          .sort((a, b) => a.index - b.index);
        console.log("代码中使用的变量顺序: ", arr);
        // 替换
        let cur: { index: number; field: string } | undefined = arr.shift();
        while (cur) {
          textMarks.push({
            from: { line: 0, ch: code.indexOf(cur.field) },
            to: {
              line: 0,
              ch:
                code.indexOf(cur.field) + useVariables[cur.field].title.length,
            },
            item: useVariables[cur.field],
          });
          code = code.replace(cur.field, useVariables[cur.field].title);
          cur = arr.shift();
        }
      }
      // 设置状态
      console.log("初始编辑器内容: ", code);
      console.log("文本标记: ", textMarks);
      setDefaultCode(code);
      if (hasVariable && textMarks?.length) {
        setDefaultTextMarks(textMarks);
      }
    }
  };
  /**
   * 编辑器初始化完成回调
   */
  const onReady = () => {
    setReady(true);
    addDefaultTextMarks();
  };
  /**
   * 选择方法，异步函数需要多加 await
   */
  const selectMethod = (item: IHyMethod) => {
    insertValue(
      `${item.type === "ASYNC" ? "await " : ""}${item.namespace}.${
        item.name
      }()`,
      1
    );
    setCurFunction(item);
  };

  const onDefaultValueChange = () => {
    const pageId = props.metaCtx.getPageInfo()?.pageID;
    const widgetId = props.metaCtx.getSelectedEntity()?.id;
    // TODO: 设置变量的类型应该由触发点决定
    const widgetVariable = "realVal";
    Promise.all([
      $R_P.get({
        url: `${window.$AppConfig.FEResourceServerUrl}/generate-page/state/${pageId}?lesseeCode=${$R_P.urlManager.currLessee}&applicationCode=${$R_P.urlManager.currApp}`,
      }),
    ]).then((res) => {
      const [pageStateRes] = res;

      if (
        pageStateRes?.result?.pageState &&
        typeof pageStateRes?.result?.pageState === "object"
      ) {
        const pageState = pageStateRes?.result?.pageState;
        const widget = Object.keys(pageState)
          .filter((item) => item.includes("_OutState"))
          .reduce((a, b) => {
            if (pageState[b]?._info?.widgetRef !== "FormInput") return a;

            Object.keys(pageState[b])
              .filter((key) => key !== "_info")
              .forEach((key) => {
                a.push({
                  ...pageState[b]?._info,
                  type: "widget",
                  field: `snippetParams.container.state.${b}.${key}`,
                  id: b,
                });
              });
            return a;
          }, [] as TVariableItem[]);

        const cur = Object.keys(pageState)
          .filter((item) => item.includes("_InState"))
          .find((item) => item.includes(widgetId));

        if (cur) {
          setCurWidget({ state: cur, variable: widgetVariable });
        }

        setVariableTree({ widget });
        // 初始化默认值
        initDefaultValue({ widget });
      }
    });
  };

  useEffect(onDefaultValueChange, [props.defaultValue]);

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
                <Button size="small" type="link" onClick={debugCode} disabled>
                  调试
                </Button>
                <Button size="small" type="text" danger onClick={resetEditor}>
                  清除
                </Button>
              </Space>
            </div>
            {!props.defaultValue || defaultCode || defaultCode === "" ? (
              <ExpressionEditor
                theme="ttcn"
                mode="javascript"
                lint={false}
                height="200px"
                defaultValue={defaultCode || ""}
                getEditor={(curEditor) => setEditor(curEditor)}
                ready={onReady}
                onChange={() => {
                  setEditing(true);
                }}
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
          <Col span={12}>
            <VariableList
              variableTree={variableTree}
              variableVisible={variableVisible}
              debugCodeValue={debugCodeValue}
              initVariableEdit={initVariableEdit}
              setVariableVisible={setVariableVisible}
              selectVariable={selectVariable}
            />
          </Col>
          <Col span={12}>
            <MethodList
              curFunction={curFunction}
              methodsTree={{}}
              selectMethod={selectMethod}
            />
          </Col>
        </Row>
        <div className="expression-handle py-4">
          <span className="expression-handle-tip">
            请在英文输入法模式下编辑表达式
          </span>
          <Button
            type="primary"
            onClick={onSubmit}
            // onClick={
            //   edited && (!operationResult || !operationResult.success)
            //     ? checkSubmit
            //     : onSubmit
            // }
          >
            确定
          </Button>
        </div>
      </div>
    </Suspense>
  );
};
