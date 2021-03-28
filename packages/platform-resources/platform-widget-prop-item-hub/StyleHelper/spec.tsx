import React from "react";
import { PropItem, PropItemRenderContext } from "@provider-app/platform-access-spec";
import { Comp } from "./comp";

/** 属性项编辑的组件属性 */
// const whichAttr = 'unit';

@PropItem({
  id: "prop_style",
  label: "通用样式设置",
  whichAttr: ["style"],
  // defaultValues: {
  //   unit: '标题'
  // },
})
export default class StyleHelperSpec {
  render(ctx: PropItemRenderContext) {
    return <Comp {...ctx} />;
  }
}
