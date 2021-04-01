import React from "react";
import {
  PropItem,
  PropItemRenderContext,
} from "@provider-app/platform-access-spec";
import { FieldTypeComp } from "./comp";

/** 属性项编辑的组件属性 */
// const whichAttr = 'title';

@PropItem({
  id: "prop_field_type",
  label: "字段类型",
  whichAttr: ["fieldType", "field"],
  // defaultValues: {
  //   title: '标题'
  // },
})
export default class FieldTypeSpec {
  render(ctx: PropItemRenderContext) {
    const { takeMeta } = ctx.platformCtx.meta;
    return <FieldTypeComp {...ctx} takeMeta={takeMeta} />;
  }
}
