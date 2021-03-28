/**
 * 左边的组件面板
 */

import React from "react";
import DragItemComp from "@provider-app/page-visual-editor-engine/spec/DragItemComp";
import { LoadingTip } from "@provider-app/shared-ui";
import { Tab, Tabs } from "@deer-ui/core";
import classnames from "classnames";
import {
  GroupItemsRender,
  ItemRendererType,
} from "@provider-app/page-visual-editor-engine/components/GroupPanel";

// import Sortable from "sortablejs";

import { PageMetadata } from "@provider-app/platform-access-spec";
import * as ReactIcon from "react-icons/fi";
import { ApiGenerator } from "@provider-app/datasource-module";
import { useWidgetMeta, useWidgetPanelData } from "../../utils";
// import { DataSourceDragItem } from "../PDDataSource";
// import { DataSourceTitle } from "./DataSourceTitle";
import { PDDragableItemTypes } from "../../const";
import { OutlineTree } from "../OutlineTree";

// const Icon = ({ n }) => {
//   return <i data-feather={`bi bi-arrow-up-left-square`} />;
// };

const isDev = process.env.NODE_ENV === "development";

export interface PageDesignerComponentPanelProps {
  pageMetadata: PageMetadata;
  // onUpdatedDatasource;
  onUpdateApiConfig;
  layoutNodeInfo;
}

/**
 * 左边组件面板的组件工厂函数
 */
const itemRendererFac = (): ItemRendererType => (widgetRef, groupType) => {
  const [ready, widgetMeta] = useWidgetMeta(widgetRef);
  if (!ready) return null;
  if (!widgetMeta) {
    return <div className="t_red">widget 未定义</div>;
  }
  const { label, icon } = widgetMeta;
  const Icon = ReactIcon[icon] || null;
  switch (groupType) {
    case "dragableItems":
      return (
        <DragItemComp
          id={widgetRef}
          sortable={false}
          accept={[]}
          className="drag-comp-item"
          type={PDDragableItemTypes.staticWidget}
          dragableWidgetType={{
            ...widgetMeta,
          }}
        >
          {Icon && <Icon className="widget-icon" />}
          <div>{label}</div>
        </DragItemComp>
      );
    case "dataSource":
      return <div>dataSource</div>;
    default:
      return null;
  }
};

const actionItems = [
  {
    icon: "FiCodepen",
    label: "组件面板",
    render: ({
      groupType,
      itemsGroups,
    }) => (
    ),
  },
  {
    icon: "FiCodepen",
    label: "数据源",
    render: ApiGenerator,
  },
  {
    icon: "FiCodepen",
    label: "大纲树",
    render: ApiGenerator,
  },
];

/**
 * page designer widget panel
 */
const PDWidgetPanel: React.FC<PageDesignerComponentPanelProps> = ({
  pageMetadata,
  // onUpdatedDatasource,
  layoutNodeInfo,
  onUpdateApiConfig,
  // widgetPanelData,
  // ...other
}) => {
  const [activeItemIdx, setActiveItemIdx] = React.useState(0);
  const [isShowPanel, setIsShowPanel] = React.useState(true);
  const [isPinPanel, setIsPinPanel] = React.useState(false);
  // const interDatasources = [];
  // const interDatasources = Object.values(pageMetadata?.dataSource);
  const apiConfigMeta = pageMetadata?.apisConfig;
  const activeItem = actionItems[activeItemIdx];

  return (
    <div className="component-panel-container flex h-full">
      <div className="comp-tool w-16">
        {actionItems.map((item, idx) => {
          const { label, icon } = item;
          const I = ReactIcon[icon];
          const isActive = activeItemIdx === idx;
          const itemClasses = classnames([
            isActive && "active",
            "item p-2 text-gray-600",
          ]);
          return (
            <div
              className={itemClasses}
              key={idx}
              onClick={(e) => {
                setActiveItemIdx(idx);
              }}
            >
              <I className="text-2xl inline-block icon" />
            </div>
          );
        })}
      </div>
      <div className="active-panel flex">
        <div>
          <activeItem.component />
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
