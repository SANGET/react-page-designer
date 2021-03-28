/**
 * 左边的组件面板
 */

import React from "react";
import DragItemComp from "@provider-app/page-visual-editor-engine/spec/DragItemComp";
import { LoadingTip } from "@provider-app/shared-ui";
import { Tab, Tabs } from "@deer-ui/core";
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
        // <div
        //   id={widgetRef}
        //   // accept={[]}
        //   className="drag-comp-item"
        //   // type={PDDragableItemTypes.staticWidget}
        //   // dragableWidgetType={{
        //   //   ...widgetMeta,
        //   // }}
        // >
        //   {label}
        // </div>
      );
    case "dataSource":
      return <div>dataSource</div>;
    default:
      return null;
  }
};

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
  const [ready, widgetPanelData] = useWidgetPanelData();
  if (!ready) {
    return <LoadingTip />;
  }
  const {
    title: compPanelTitle,
    type: groupType,
    itemsGroups,
  } = widgetPanelData;
  // const interDatasources = [];
  // const interDatasources = Object.values(pageMetadata?.dataSource);
  const apiConfigMeta = pageMetadata?.apisConfig;

  return (
    <div className="component-panel-container">
      <Tabs>
        <Tab label={compPanelTitle}>
          {/* <WidgetPanel
            {...other}
            componentPanelConfig={[widgetPanelData]}
            itemRenderer={itemRenderer}
          /> */}
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
        {/* <Tab
          label={
            <DataSourceTitle
              interDatasources={interDatasources.filter((ds) =>
                ds.createdBy?.includes("page")
              )}
              onAddDataSource={(addData) => {
                // return console.log(addData);
                onUpdatedDatasource(addData);
              }}
            />
          }
        >
          <DataSourceDragItem interDatasources={interDatasources} />
        </Tab> */}
        <Tab label="大纲树">
          <OutlineTree layoutNodeInfo={layoutNodeInfo} />
        </Tab>
      </Tabs>
    </div>
  );
};

export default PDWidgetPanel;
