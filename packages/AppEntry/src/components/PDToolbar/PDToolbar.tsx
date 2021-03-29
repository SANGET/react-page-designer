import { Button, CloseModal, ShowModal } from "@deer-ui/core";
import {
  generatePageCode,
  previewAppService,
} from "@provider-app/provider-app-common/services";
// import { recompiler } from "@provider-app/provider-app-common/services/widget-loader";
// import { getAppPreviewUrl } from "@provider-app/provider-app-common/config";
import { message, Modal } from "antd";
import classnames from "classnames";
import React, { useContext, useState } from "react";
import { BiMobileAlt, BiDesktop } from "react-icons/bi";
import { getAppPreviewUrl } from "@provider-app/provider-app-common/config/getPreviewUrl";
import { loadPropItemMetadata } from "@provider-app/provider-app-common/services/widget-loader";
import { Tooltip } from "react-tippy";
import { StageContext } from "@provider-app/page-visual-editor-engine/utils/stage-context";
import { PlatformContext } from "../../utils";
import { PageConfigContainer } from "../PDPageConfiguration";

const isDevEnv = process.env.NODE_ENV === "development";

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

const mobileWidth = 400;

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
  const platformCtx = useContext(PlatformContext);
  const stageCtx = useContext(StageContext);

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

  const isMobileWidth = stageCtx.stageWidth === mobileWidth;
  const layoutModeIconClasses = classnames("text-2xl layout-mode-icon mr-4");

  return (
    <>
      <div className="flex items-center px-2" style={{ height: "100%" }}>
        <span className="text-gray-500">帮助文档制作中</span>
        {/* 开发用的，查看所有属性项的按钮 */}
        <span className="flex"></span>
        <Tooltip title="PC 模式">
          <BiDesktop
            onClick={(e) => {
              stageCtx.changeStageWidth(1024);
            }}
            className={`${layoutModeIconClasses}${
              !isMobileWidth ? " active" : ""
            }`}
          />
        </Tooltip>
        <Tooltip title="移动设备模式">
          <BiMobileAlt
            className={`${layoutModeIconClasses}${
              isMobileWidth ? " active" : ""
            }`}
            onClick={(e) => {
              stageCtx.changeStageWidth(mobileWidth);
            }}
          />
        </Tooltip>
        <span className="flex"></span>
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
    </>
  );
};

export default ToolbarCustom;
