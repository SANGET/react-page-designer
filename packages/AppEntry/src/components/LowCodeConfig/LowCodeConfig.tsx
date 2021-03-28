import { PlatformCtx } from "@provider-app/platform-access-spec";
import { Button, Layout, List, message, Spin, Tabs, Checkbox } from "antd";
import { EditorFromTextArea } from "codemirror";
import React, { ReactNode, Suspense, useEffect, useState } from "react";
import { LowCodeConfigSimple } from "./LowCodeConfigSimple";
import { LowCodeTemplate } from "./lowCodeTemplate";

const { Header, Footer, Sider, Content } = Layout;
const { TabPane } = Tabs;
const LowCodeEditor = React.lazy(
  () => import(/* webpackChunkName: "code_editor" */ "@provider-app/code-editor-engine")
);

interface ISubmitRes {
  code: string | null;
  codeId: string;
  use: string;
  codeSimple: { code: string; params?: any } | undefined;
}

interface IProps {
  metaCtx: PlatformCtx["meta"];
  /** 表达式提交回调函数 */
  onSubmit: (transformRes: ISubmitRes) => void;
  defaultValue?: { code: string; simpleCode: string; params: any; use: string };
  eventType: string;
  platformCtx?: PlatformCtx;
}

interface ITransformRes {
  code: string;
  codeId: string;
}

export interface RPageState {
  widgets?: [{ id: string; widgetRef: string; title: string }];
  dataSource?: [
    {
      id: string;
      name: string;
      code: string;
      column: [{ id: string; name: string; fieldCode: string }];
    }
  ];
}

export const LowCodeConfig: React.FC<IProps> = (props) => {
  /** 编辑器对象 */
  const [editor, setEditor] = useState<EditorFromTextArea | null>(null);
  /** 编辑器是否准备就绪 */
  const [ready, setReady] = useState<boolean>(false);
  const [defaultCode, setDefaultCode] = useState<string | null>(null);
  const [pageState, setpageState] = useState<any>({});

  /** 编辑器是否编辑过 */
  const [edited, setEditing] = useState<boolean>(false);

  const [isShowCode, setisShowCode] = useState<boolean>(
    props.defaultValue?.code !== undefined &&
      props.defaultValue?.code !== "" &&
      props.defaultValue?.code !== null
  );
  const [isShowEdit, setisShowEdit] = useState<boolean>(false);
  const [isClearEditor, setisClearEditor] = useState<boolean>(false);

  const [defaultActiveKey, setdefaultActiveKey] = useState<string>(
    props.defaultValue?.use || "simpleFunc"
  );

  const [codeSimple, setcodeSimple] = useState<{
    code: string;
    params?: any;
  }>({
    code: props?.defaultValue?.simpleCode || "",
    params: props?.defaultValue?.params,
  });
  const [selectCode, setselectCode] = useState<{
    title: string;
    desc: string;
    params: ReactNode | null;
    mark: string;
  }>();
  const [showParams, setShowParams] = useState(false);

  /**
   * 保存表达式
   */
  const onSubmit = () => {
    // if (!editor) return;
    const value = editor?.getValue();
    if (value) {
      try {
        const { code, codeId } = replaceVariablesTitleToId();
        if (code && props.onSubmit) {
          props.onSubmit({
            code,
            codeId,
            use: defaultActiveKey,
            codeSimple,
          });
        } else {
          message.error("生成代码失败，请检查低代码是否无误");
        }
      } catch (error) {
        message.error("生成代码失败，请检查低代码是否无误");
      }
    } else if (props.onSubmit) {
      props.onSubmit({
        code: null,
        codeId: "",
        use: defaultActiveKey,
        codeSimple,
      });
    }
  };

  /**
   * 转换编辑器内容为低代码字符串
   * @param str 编辑器内容
   */
  const replaceVariablesTitleToId = (): ITransformRes => {
    if (!editor) return { code: "", codeId: "" };
    let code = "";
    const codeId = `click`;
    editor.doc.eachLine((line) => {
      const lineText = line.text;
      // TODO: 要考虑多行的情况
      code += `${lineText}\n`;
    });
    return { code, codeId };
  };

  /**
   * 初始化处理低代码回填
   * @param
   */
  const initDefaultValue = (defaultValue: string | undefined) => {
    if (defaultValue) {
      console.log(defaultValue);
      setDefaultCode(defaultValue);
    }
  };
  /**
   * 初始化处理拿到页面数据
   * @param
   */
  const initGetPageState = () => {
    const pageId = props.metaCtx.getPageInfo()?.pageID;
    Promise.all([
      $R_P.get({
        url: `${window.$AppConfig.FEResourceServerUrl}/generate-page/state/${pageId}?lesseeCode=${$R_P.urlManager.currLessee}&applicationCode=${$R_P.urlManager.currApp}`,
      }),
      $R_P.get({
        url: `/page/v1/pages?size=10000`,
      }),
    ]).then((res: [any, any]) => {
      const [state, resData] = res;
      if (resData?.code !== "00000") {
        // throw new Error("获取应用已发布页面失败");
        // return
      }
      let arr = [];
      if (resData?.result?.data) {
        arr = resData?.result?.data.map((item) => ({
          label: item.name,
          value: `Page${item.id}`,
        }));
      }
      setpageState({ pageList: arr, pageState: state.result.pageState });
    });
  };
  /**
   * 编辑器初始化完成回调
   */
  const onReady = () => {
    setReady(true);
  };

  /**
   * 编辑器插入值
   * @param code 指定字符串
   * @param pos 光标倒退几格
   */
  const insertValue = (code: string) => {
    if (editor) {
      const cur = editor.getCursor();
      editor.replaceRange(code, cur, cur, "+insert");
      // 隐藏参数配置器
      setShowParams(false);
    }
  };

  useEffect(() => {
    // 初始化默认值
    initDefaultValue(props.defaultValue?.code);
    setisShowCode(
      props.defaultValue?.code !== undefined &&
        props.defaultValue?.code !== "" &&
        props.defaultValue?.code !== null
    );
    // 请求页面状态数据
    initGetPageState();
  }, [props.defaultValue]);

  /**
   * 构造业务编码参数
   */
  const buildBusinessCodeParam = () => {
    const pageId = props.metaCtx.getPageInfo()?.pageID;
    let widgetId = props.metaCtx.getSelectedEntity()?.id;
    if (props.eventType === "CFId") {
      widgetId = "CFId";
    }
    if (
      ["onPageLoad", "onPageDestroy", "onPageResize", "onPageUpdate"].includes(
        props.eventType
      )
    ) {
      widgetId = "PageId";
    }
    return { pageId, widgetId };
  };

  const lowCodeTemplate = LowCodeTemplate({
    insertValue,
    metaCtx: props.metaCtx,
    platformCtx: props.platformCtx,
    pageState,
    businessCodeParam: buildBusinessCodeParam(),
  });

  return (
    <Suspense fallback={<span></span>}>
      <div className="hy-low-code">
        <div className="hy-low-code-handle py-4">
          <Button
            type="default"
            style={{ marginRight: "16px" }}
            onClick={() => {
              if (defaultActiveKey === "func") {
                editor?.setValue("");
              } else {
                setisClearEditor(true);
              }
            }}
          >
            清空
          </Button>
          <Button type="primary" onClick={onSubmit}>
            确定
          </Button>
        </div>
        <Tabs
          defaultActiveKey={defaultActiveKey}
          onChange={(val) => {
            setdefaultActiveKey(val);
            setisClearEditor(false);
          }}
        >
          <TabPane key="simpleFunc" tab="简单版">
            <LowCodeConfigSimple
              metaCtx={props.metaCtx}
              eventType={props.eventType}
              defaultValue={{
                value: props.defaultValue?.simpleCode,
                params: props.defaultValue?.params,
              }}
              platformCtx={props.platformCtx}
              pageState={pageState}
              valueChange={(code, params) => {
                setcodeSimple({ code, params });
                if (code) {
                  message.success("生成代码成功！");
                } else {
                  message.success("清空代码成功！");
                  setisClearEditor(false);
                }
              }}
              isShowEdit={isShowEdit}
              isClearEditor={isClearEditor}
            />
          </TabPane>
          <TabPane
            key="func"
            tab={isShowCode ? "专家模式" : ""}
            style={{ visibility: isShowCode ? "visible" : "hidden" }}
          >
            <Layout className="site-layout-background">
              <Sider theme="light" style={{ height: "65vh", overflow: "auto" }}>
                <List
                  dataSource={lowCodeTemplate}
                  bordered={true}
                  renderItem={(item: {
                    title: string;
                    desc: string;
                    params: ReactNode | null;
                    mark: string;
                  }) =>
                    !(
                      props.eventType === "CFId" && item.title === "通用函数"
                    ) ? (
                      <List.Item
                        key={item.title}
                        className={
                          selectCode?.title === item.title ? "active" : ""
                        }
                        onClick={() => {
                          setselectCode(item);
                          setShowParams(true);
                        }}
                      >
                        {item.title}
                      </List.Item>
                    ) : null
                  }
                />
              </Sider>
              <Layout className="site-layout-background">
                <div className="hy-low-code-config">
                  <div
                    className="hy-low-code-switch"
                    onClick={() => {
                      setShowParams(!showParams);
                    }}
                  >
                    参数配置
                  </div>
                  <div
                    className={`hy-low-code-header ${
                      showParams ? "hy-low-code-height300" : ""
                    }`}
                  >
                    {selectCode ? (
                      <div>
                        <div className="flex hy-low-code-params">
                          {selectCode?.params}
                        </div>
                        <div
                          className="flex"
                          style={{
                            padding: "8px",
                            margin: "8px",
                            borderTop: "1px solid #ccc",
                          }}
                        >
                          备注：
                          {selectCode?.mark}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div>
                  <Spin
                    tip="初始化编辑器..."
                    spinning={!ready}
                    style={{ backgroundColor: "#fff", width: "100%" }}
                  >
                    <div className="hy-low-code-editor">
                      <LowCodeEditor
                        theme="ttcn"
                        mode="javascript"
                        lint={false}
                        height="60vh"
                        defaultValue={defaultCode || ""}
                        getEditor={(curEditor) => setEditor(curEditor)}
                        ready={onReady}
                        onChange={() => {
                          setEditing(true);
                        }}
                      />
                    </div>
                  </Spin>
                </div>
              </Layout>
            </Layout>
          </TabPane>
        </Tabs>
        <div>
          <Checkbox
            checked={isShowCode}
            onChange={(val) => {
              setisShowCode(val.target.checked);
            }}
          >
            专家模式
          </Checkbox>
          <Checkbox
            onChange={(e) => {
              setisShowEdit(e.target.checked);
            }}
          >
            简版代码可视化
          </Checkbox>
        </div>
      </div>
    </Suspense>
  );
};
