import { PlatformCtx } from "@provider-app/platform-access-spec";
import React, { ReactNode, useEffect, useState } from "react";
import { Layout, List, Spin, Tabs } from "antd";
import { EditorFromTextArea } from "codemirror";
import { LowCodeTemplateSimple } from "./lowCodeTemplateSimple";

const { Sider } = Layout;
const { TabPane } = Tabs;
const LowCodeEditor = React.lazy(
  () => import(/* webpackChunkName: "code_editor" */ "@provider-app/code-editor-engine")
);

interface IProps {
  metaCtx: PlatformCtx["meta"];
  defaultValue?: { value: string | undefined; params?: any };
  eventType: string;
  platformCtx?: PlatformCtx;
  pageState: any;
  valueChange: (code: string, params?: any) => void;
  isShowEdit: boolean;
  isClearEditor: boolean;
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

export const LowCodeConfigSimple: React.FC<IProps> = (props) => {
  /** 编辑器对象 */
  const [editor, setEditor] = useState<EditorFromTextArea | null>(null);
  /** 编辑器是否准备就绪 */
  const [ready, setReady] = useState<boolean>(false);
  const [defaultCode, setDefaultCode] = useState<string | null>(null);

  /** 编辑器是否编辑过 */
  const [edited, setEditing] = useState<boolean>(false);

  let [selectCode, setselectCode] = useState<{
    title: string;
    desc: string;
    params: ReactNode | null;
    mark: string;
  }>();
  const [showParams, setShowParams] = useState<boolean>(
    selectCode?.title !== undefined
  );

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
  const initDefaultValue = (
    defaultValue: { value: string | undefined; params?: any } | undefined
  ) => {
    console.log(defaultValue);
    if (defaultValue?.value) {
      setDefaultCode(defaultValue?.value);
    }
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
  const insertValue = (codeStr: string, params?: any) => {
    editor?.setValue(codeStr);
    // 隐藏参数配置器
    // setShowParams(false);
    // 记录生成的代码
    const { code } = replaceVariablesTitleToId();
    if (params) {
      params.lowCodeTitle = selectCode?.title;
    }
    props.valueChange(codeStr, params);
  };

  /**
   * 构造业务编码参数
   */
  const buildBusinessCodeParam = () => {
    const pageId = props.metaCtx.getPageInfo()?.pageID;
    let widgetId = props.metaCtx.getSelectedEntity()?.id;
    if (
      ["onPageLoad", "onPageDestroy", "onPageResize", "onPageUpdate"].includes(
        props.eventType
      )
    ) {
      widgetId = "PageId";
    }
    return { pageId, widgetId };
  };
  const lowCodeTemplateSimple = LowCodeTemplateSimple({
    insertValue,
    metaCtx: props.metaCtx,
    platformCtx: props.platformCtx,
    params: props.defaultValue?.params,
    pageState: props.pageState,
    businessCodeParam: buildBusinessCodeParam(),
  });

  useEffect(() => {
    if (!defaultCode) {
      // 初始化默认值
      initDefaultValue(props.defaultValue);
      lowCodeTemplateSimple.forEach((item) => {
        if (item.title === props.defaultValue?.params?.lowCodeTitle) {
          setShowParams(true);
          selectCode = item;
          setselectCode(item);
        }
      });
    }
    if (props.isClearEditor) {
      insertValue("");
    }
  }, [props.defaultValue?.value, props.isClearEditor]);

  return (
    <div>
      <Layout className="site-layout-background">
        <Sider theme="light" style={{ height: "65vh", overflow: "auto" }}>
          <List
            dataSource={lowCodeTemplateSimple}
            bordered={true}
            renderItem={(item: {
              title: string;
              desc: string;
              params: ReactNode | null;
              mark: string;
            }) => (
              <List.Item
                className={selectCode?.title === item.title ? "active" : ""}
                onClick={() => {
                  selectCode = item;
                  setselectCode(item);
                  setShowParams(true);
                }}
              >
                {item.title}
              </List.Item>
            )}
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

          <div style={{ visibility: props.isShowEdit ? "visible" : "hidden" }}>
            <Spin
              tip="初始化编辑器..."
              spinning={!ready}
              style={{ backgroundColor: "#fff", width: "100%" }}
            >
              <div className="hy-low-code-editor">
                <LowCodeEditor
                  readOnly="true"
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
    </div>
  );
};
