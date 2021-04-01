import React from "react";
import {
  PropItem,
  PropItemRenderContext,
} from "@provider-app/platform-access-spec";
import { CheckErrorTooltipComp } from "./comp";

/** 属性项编辑的组件属性 */
// const whichAttr = 'title';

@PropItem({
  id: "prop_check_error_tooltip",
  label: "失败提示",
  whichAttr: ["checkErrorTooltip", "field"],
  // defaultValues: {
  //   title: '标题'
  // },
})
export default class CheckErrorTooltipHelperSpec {
  render(ctx: PropItemRenderContext) {
    const { takeMeta } = ctx.platformCtx.meta;
    return <CheckErrorTooltipComp {...ctx} takeMeta={takeMeta} />;
  }
}
