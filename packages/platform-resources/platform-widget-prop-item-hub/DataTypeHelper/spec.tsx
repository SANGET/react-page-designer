import React from "react";
import {
  PropItem,
  PropItemRenderContext,
} from "@provider-app/platform-access-spec";
import { DataTypeComp } from "./comp";

/** 属性项编辑的组件属性 */
// const whichAttr = 'title';

@PropItem({
  id: "prop_data_type",
  label: "数据类型",
  whichAttr: ["dataType", "field"],
  // defaultValues: {
  //   title: '标题'
  // },
})
export default class DataTypeSpec {
  render(ctx: PropItemRenderContext) {
    const { takeMeta } = ctx.platformCtx.meta;
    return <DataTypeComp {...ctx} takeMeta={takeMeta} />;
  }
}
