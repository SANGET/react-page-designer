import React from "react";
import { Unexpect } from "./Unexpect";
import * as localWidgetRef from "./widget";

export interface PDWidgetRendererProps {
  entity;
  children;
  entityState;
}

export const getWidgetComp = (widgetRef) => {
  const WidgetFormRemote =
    localWidgetRef[widgetRef] || window.PlatformComponents?.[widgetRef];
  return WidgetFormRemote;
};

/**
 * 根据 widget entity 解析的组件渲染器
 */
export const WidgetRenderer: React.FC<PDWidgetRendererProps> = (props) => {
  const { entity, children, entityState = {} } = props;
  const { widgetRef } = entity;

  if (!widgetRef) return <Unexpect />;
  const WidgetFormRemote = getWidgetComp(widgetRef);

  let Com;
  // 把组件属性初始值null转为 ""
  const newEntityState = {};
  Object.keys(entityState).forEach((key) => {
    newEntityState[key] = entityState[key] || undefined;
  });
  if (!WidgetFormRemote) {
    // 处理异常组件
    Com = <Unexpect>异常组件：{widgetRef}</Unexpect>;
  } else {
    Com = React.createElement(
      WidgetFormRemote,
      Object.assign({}, newEntityState, { children })
    );
  }

  return Com;
};
