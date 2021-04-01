import React from "react";
import {
  PropItem,
  PropItemRenderContext,
} from "@provider-app/platform-access-spec";
import { TimeTypeComp } from "./comp";

/** 属性项编辑的组件属性 */
// const whichAttr = 'title';

@PropItem({
  id: "prop_time_type",
  label: "时间数据类型",
  whichAttr: ["timeType"],
  // defaultValues: {
  //   title: '标题'
  // },
})
export default class DataTypeSpec {
  render(ctx: PropItemRenderContext) {
    const { takeMeta } = ctx.platformCtx.meta;
    return <TimeTypeComp {...ctx} takeMeta={takeMeta} />;
  }
}
