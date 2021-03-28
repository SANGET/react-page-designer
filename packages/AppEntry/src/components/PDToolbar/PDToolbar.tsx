import { Button, CloseModal, DropdownWrapper, ShowModal } from "@deer-ui/core";
import {
  generatePageCode,
  previewAppService,
} from "@provider-app/provider-app-common/services";
// import { recompiler } from "@provider-app/provider-app-common/services/widget-loader";
// import { getAppPreviewUrl } from "@provider-app/provider-app-common/config";
import { message, Modal } from "antd";
import React, { useState } from "react";
import { getAppPreviewUrl } from "@provider-app/provider-app-common/config/getPreviewUrl";
import { loadPropItemMetadata } from "@provider-app/provider-app-common/services/widget-loader";
import { PlatformContext } from "../../utils";
import { PageConfigContainer } from "../PDPageConfiguration";

const isDevEnv = process.env.NODE_ENV === "development";

function syntaxHighlight(json) {
  json = json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    function (match) {
      let cls = "number";
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = "key";
        } else {
          cls = "string";
        }
      } else if (/true|false/.test(match)) {
        cls = "boolean";
      } else if (/null/.test(match)) {
        cls = "null";
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

const prepareData = async () => {
  const [propItemData] = await Promise.all([loadPropItemMetadata()]);

  return propItemData;
};

const JSONDisplayer = ({ jsonData }) => {
  return (
    <pre
      dangerouslySetInnerHTML={{
        __html: syntaxHighlight(JSON.stringify(jsonData, null, 2)),
      }}
    ></pre>
  );
};

const PropDataDisplayer = () => {
  const [data, setData] = useState({});
  React.useEffect(() => {
    prepareData().then((propData) => {
      setData(propData);
    });
  }, []);
  return <JSONDisplayer jsonData={data} />;
};

const ReleaseBtn = ({ onReleasePage }) => {
  const [loading, setLoading] = useState(false);
  return (
    <Button
      loading={loading}
      onClick={(e) => {
        setLoading(true);
        onReleasePage?.().finally(() => {
          setTimeout(() => setLoading(false), 800);
        });
      }}
    >
      保存
    </Button>
  );
};

let previewWindowHandler: Window | null;

const PreviewBtn = ({ appLocation, getAppDescData, genPageCode }) => {
  // const previewUrl = getAppPreviewUrl({
  //   ...appLocation,
  //   defaultPath: "preview",
  //   mode: "preview",
  //   appName: appLocation.appName,
  // });
  const [loading, setLoading] = useState(false);
  const appDescData = getAppDescData();
  return (
    <Button
      color="default"
      loading={loading}
      className="mr10"
      onClick={async (e) => {
        // $R_P.get('/manage/v1/application/preview/')
        setLoading(true);
        // previewAppService('1319181529431285760');
        const previewUrl = getAppPreviewUrl({
          pageName: appLocation.title,
          appName: appLocation.appName,
          app: appLocation.app,
          pageID: appLocation.pageID,
        });
        genPageCode();
        window.open(previewUrl);
        // if (!previewWindowHandler) {
        //   previewWindowHandler = window.open(previewUrl);
        //   previewWindowHandler?.addEventListener("close", () => {
        //     previewWindowHandler = null;
        //   });
        // } else {
        //   previewWindowHandler.focus();
        // }
        await previewAppService(appLocation.app, appDescData);
        setLoading(false);
      }}
    >
      预览
    </Button>
  );
};
/**
 * 页面事件-低代码入口
 */
const PageEventLowCodeEditor = ({
  pageState,
  platformCtx,
  eventType,
  changePageState,
  title,
}) => {
  return (
    <Button
      className="mb-4"
      color="default"
      onClick={() => {
        const closeModal = platformCtx.selector.openLowCodeImporter({
          defaultValue:
            (pageState.lowCode && pageState.lowCode[eventType]) || undefined,
          eventType,
          platformCtx,
          onSubmit: (lowCodeKey) => {
            const value = pageState.lowCode || {};
            changePageState({
              ...pageState,
              lowCode: {
                ...value,
                [eventType]: {
                  code: lowCodeKey.code,
                  simpleCode: lowCodeKey.codeSimple?.code,
                  params: lowCodeKey.codeSimple?.params,
                  use: lowCodeKey.use,
                },
              },
            });
            closeModal();
          },
        });
      }}
    >
      {title}
    </Button>
  );
};

interface ToolbarCustomProps {
  onReleasePage?: () => Promise<unknown>;
  getAppDescData;
  getPageContent;
  flatLayoutItems;
  appLocation;
  pageMetadata;
  pageState;
  changePageState;
  updateEntityState;
  delEntity;
}

const ToolbarCustom: React.FC<ToolbarCustomProps> = ({
  onReleasePage,
  getAppDescData,
  getPageContent,
  flatLayoutItems,
  pageMetadata,
  appLocation,
  changePageState,
  pageState,
  updateEntityState,
  delEntity,
}) => {
  const appDescData = getAppDescData();

  const [isShowPageSetting, setIsShowPageSetting] = useState(false);

  const genPageCode = () => {
    return new Promise((resolve, reject) => {
      const pageDSL = getPageContent();
      // const res = pageDSL2Code(pageDSL);
      // console.log(res);
      generatePageCode({
        pageDSL,
        pageID: appLocation.pageID,
      })
        .then((res) => {
          resolve(res);
        })
        .catch(reject);
    });
  };

  const handleOk = () => {
    setIsShowPageSetting(false);
  };

  const handleCancel = () => {
    setIsShowPageSetting(false);
  };

  return (
    <>
      <PlatformContext.Consumer>
        {(platformCtx) => {
          return (
            <div className="flex items-center px-2" style={{ height: "100%" }}>
              {/* <span className="text-gray-500">新手教程制作中，敬请期待</span> */}
              {/* 开发用的，查看所有属性项的按钮 */}
              <span className="flex"></span>
              {/* {
                <DropdownWrapper
                  trigger="hover"
                  className="mr10"
                  outside
                  overlay={(hide) => {
                    return (
                      <div className="p-4 flex flex-col">
                        {[
                          { alias: "加载事件", type: "onPageLoad" },
                          { alias: "页面状态更新事件", type: "onPageUpdate" },
                          { alias: "销毁事件", type: "onPageDestroy" },
                          { alias: "窗口大小调整事件", type: "onPageResize" },
                        ].map(({ alias, type }) => (
                          <PageEventLowCodeEditor
                            key={type}
                            eventType={type}
                            title={alias}
                            platformCtx={platformCtx}
                            changePageState={changePageState}
                            pageState={pageState}
                          />
                        ))}
                      </div>
                    );
                  }}
                >
                  页面事件-低代码
                </DropdownWrapper>
              } */}
              <DropdownWrapper
                trigger="hover"
                className="mr10"
                outside
                overlay={(hide) => {
                  return (
                    <div className="p-4 flex flex-col">
                      <Button
                        className="mb-4"
                        color="default"
                        onClick={(e) => {
                          const modalID = ShowModal({
                            title: "页面设置",
                            width: "85%",
                            children: ({ close }) => {
                              return (
                                <div>
                                  <PropDataDisplayer />
                                </div>
                              );
                            },
                            onClose: () => {
                              CloseModal(modalID);
                            },
                          });
                        }}
                      >
                        查看所有属性项
                      </Button>
                      <Button
                        className="mb-4"
                        color="default"
                        onClick={(e) => {
                          genPageCode().then((res) => {
                            const pageCode =
                              res?.pageCode || "// 获取生成代码失败";
                            platformCtx.selector.openLowCodeEditor({
                              defaultValue: {
                                code: pageCode,
                              },
                              onSubmit: () => {},
                              eventType: "",
                            });
                          });
                        }}
                      >
                        查看页面源代码
                      </Button>
                      <Button
                        className="mb-4"
                        color="default"
                        onClick={(e) => {
                          ShowModal({
                            title: "页面 DSL",
                            children: () => {
                              return <JSONDisplayer jsonData={appDescData} />;
                            },
                          });
                        }}
                      >
                        查看页面 DSL
                      </Button>
                    </div>
                  );
                }}
              >
                开发者选项
              </DropdownWrapper>
              {/* <Button
                className="mr10"
                color="default"
                onClick={(e) => {
                  setIsShowPageSetting(true);
                }}
              >
                页面动作
              </Button> */}
              <Button
                className="mr10"
                color="default"
                onClick={(e) => {
                  setIsShowPageSetting(true);
                }}
              >
                页面设置
              </Button>
              <PreviewBtn
                appLocation={appLocation}
                genPageCode={genPageCode}
                getAppDescData={getAppDescData}
              />
              <ReleaseBtn
                onReleasePage={async () => {
                  genPageCode().then((res) => {
                    // eslint-disable-next-line no-unused-expressions
                    res?.pageCode
                      ? message.success("生成页面源代码成功")
                      : message.error("生成页面源代码失败");
                  });
                  // 保存的时候调用生成接口
                  // await previewAppService(appLocation.app, appDescData);
                  await previewAppService(appLocation.app, appDescData);

                  // 发布页面
                  onReleasePage?.();
                }}
              />
              <Modal
                title="页面设置"
                visible={isShowPageSetting}
                width="80vw"
                onOk={handleOk}
                onCancel={handleCancel}
                okText="确定"
                cancelText="取消"
              >
                {isShowPageSetting ? (
                  <PageConfigContainer
                    pageState={pageState}
                    changePageState={changePageState}
                    platformCtx={platformCtx}
                    pageMetadata={pageMetadata}
                    flatLayoutItems={flatLayoutItems}
                    updateEntityState={updateEntityState}
                    delEntity={delEntity}
                  />
                ) : null}
              </Modal>
            </div>
          );
        }}
      </PlatformContext.Consumer>
    </>
  );
};

export default ToolbarCustom;
