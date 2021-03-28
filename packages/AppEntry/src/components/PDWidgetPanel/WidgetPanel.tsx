import {
  GroupItemsRender,
  ItemRendererType,
} from "@provider-app/page-visual-editor-engine/components/GroupPanel";
import DragItemComp from "@provider-app/page-visual-editor-engine/spec/DragItemComp";
import { LoadingTip } from "@provider-app/shared-ui";
import * as ReactIcon from "react-icons/fi";
import React from "react";
import { PDDragableItemTypes } from "../../const";

import { useWidgetMeta, useWidgetPanelData } from "../../utils";

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
export const WidgetPanel = () => {
  const [ready, widgetPanelData] = useWidgetPanelData();

  if (!ready) {
    return <LoadingTip />;
  }

  const {
    title: compPanelTitle,
    type: groupType,
    itemsGroups,
  } = widgetPanelData;

  return (
    <GroupItemsRender
      itemClasses="nestable"
      groupType={groupType}
      itemRenderer={itemRendererFac()}
      itemsGroups={itemsGroups}
    />
  );
};
