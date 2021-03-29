/**
 * 左边的组件面板
 */

import React from "react";
import classnames from "classnames";
import { Tooltip } from "react-tippy";

import { PageMetadata } from "@provider-app/platform-access-spec";
import * as ReactIcon from "react-icons/fi";
import { ApiGenerator } from "@provider-app/datasource-module";
import { ShowModal } from "@provider-app/shared-ui";
import { generatePageCode } from "@provider-app/provider-app-common/services";
import { OutlineTree } from "../OutlineTree";
import { WidgetPanel } from "./WidgetPanel";
import { PropDataDisplayer } from "../shared/PropDataDisplayer";
import { PlatformContext } from "../../utils";
import { JSONDisplayer } from "../shared/JsonDisplayer";

export interface PageDesignerComponentPanelProps {
  pageMetadata: PageMetadata;
  // onUpdatedDatasource;
  onUpdateApiConfig;
  layoutNodeInfo;
}

const actionItems = [
  {
    icon: "FiGrid",
    label: "组件",
    render: () => <WidgetPanel />,
  },
  {
    icon: "FiDatabase",
    label: "数据源",
    render: ({ apiConfigMeta, onUpdateApiConfig }) => (
      <ApiGenerator
        apiConfigMeta={apiConfigMeta}
        onDel={(apiConfig) => onUpdateApiConfig(apiConfig, "rm")}
        onSubmit={(apiConfig) => {
          onUpdateApiConfig(apiConfig);
        }}
      />
    ),
  },
  {
    icon: "FiAlignRight",
    label: "大纲树",
    render: ({ layoutNodeInfo }) => (
      <OutlineTree layoutNodeInfo={layoutNodeInfo} />
    ),
  },
  {
    icon: "FiLoader",
    label: "属性项",
    render: () => {
      return <PropDataDisplayer />;
    },
  },
  {
    icon: "FiCommand",
    label: "页面DSL",
    render: ({ pageDSL }) => {
      return <JSONDisplayer jsonData={pageDSL} />;
    },
  },
  {
    icon: "FiCode",
    label: "页面代码",
    action: ({ platformCtx, genPageCode }) => {
      genPageCode().then((res) => {
        const pageCode = res?.pageCode || "// 获取生成代码失败";
        platformCtx.selector.openLowCodeEditor({
          modalSetting: {
            type: "side",
            position: "left",
            width: 900,
          },
          defaultValue: {
            code: pageCode,
          },
          onSubmit: () => {},
          eventType: "",
        });
      });
      // ShowModal({
      //   title: "属性项",
      //   type: "side",
      //   position: "left",
      //   children: () => {
      //     return <PropDataDisplayer />;
      //   },
      // });
    },
  },
];

/**
 * page designer widget panel
 */
const PDWidgetPanel: React.FC<PageDesignerComponentPanelProps> = ({
  pageMetadata,
  // onUpdatedDatasource,
  layoutNodeInfo,
  appLocation,
  getPageContent,
  onUpdateApiConfig,
  // widgetPanelData,
  // ...other
}) => {
  const [activeItemIdx, setActiveItemIdx] = React.useState(0);
  const [isShowPanel, setIsShowPanel] = React.useState(true);
  const [isPinPanel, setIsPinPanel] = React.useState(false);
  const platformCtx = React.useContext(PlatformContext);
  // const interDatasources = [];
  // const interDatasources = Object.values(pageMetadata?.dataSource);
  const apiConfigMeta = pageMetadata?.apisConfig;
  const activeItem = actionItems[activeItemIdx];
  const pageDSL = getPageContent();

  const genPageCode = () => {
    return new Promise((resolve, reject) => {
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

  return (
    <div className="component-panel-container flex h-full">
      <div className="comp-tool w-3/12">
        {actionItems.map((item, idx) => {
          const { label, icon, action } = item;
          const I = ReactIcon[icon];
          const isActive = activeItemIdx === idx;
          const itemClasses = classnames([
            isActive && "active",
            "item py-4 text-gray-600",
          ]);
          return (
            <Tooltip
              title={label}
              key={idx}
              animation="fade"
              arrow
              position="right"
              style={{ width: "100%" }}
            >
              <div
                className={itemClasses}
                onClick={(e) => {
                  if (action) {
                    action({ platformCtx, genPageCode, pageDSL });
                  } else {
                    setActiveItemIdx(idx);
                  }
                }}
              >
                <I className="text-2xl inline-block icon" />
                <div>{label}</div>
              </div>
            </Tooltip>
          );
        })}
      </div>
      <div className="active-panel w-9/12">
        <div className="panel-body overflow-y-auto h-full">
          {/* <div className="panel-header">{activeItem.label}</div> */}
          {activeItem.render({
            genPageCode,
            platformCtx,
            pageDSL,
            layoutNodeInfo,
            apiConfigMeta,
            onUpdateApiConfig,
          })}
        </div>
      </div>
      {/* <Tabs>
        <Tab label={compPanelTitle}>
          <GroupItemsRender
            itemClasses="nestable"
            groupType={groupType}
            itemRenderer={itemRendererFac()}
            itemsGroups={itemsGroups}
            // itemsGroups={widgetPanelData}
          />
        </Tab>
        <Tab label="数据源">
          <ApiGenerator
            apiConfigMeta={apiConfigMeta}
            onDel={(apiConfig) => onUpdateApiConfig(apiConfig, "rm")}
            onSubmit={(apiConfig) => {
              onUpdateApiConfig(apiConfig);
            }}
          />
        </Tab>
        <Tab label="大纲树">
          <OutlineTree layoutNodeInfo={layoutNodeInfo} />
        </Tab>
      </Tabs> */}
    </div>
  );
};

export default PDWidgetPanel;
