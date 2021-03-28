import React from "react";
import { PropItem, PropItemRenderContext } from "@provider-app/platform-access-spec";
import { TimeModeComp } from "./comp";

/** 属性项编辑的组件属性 */
// const whichAttr = 'title';

@PropItem({
  id: "prop_time_mode",
  label: "展示的时间类型",
  whichAttr: ["timeMode"],
  // defaultValues: {
  //   title: '标题'
  // },
})
export default class DataTypeSpec {
  render(ctx: PropItemRenderContext) {
    const { takeMeta } = ctx.platformCtx.meta;
    return <TimeModeComp {...ctx} takeMeta={takeMeta} />;
  }
}
