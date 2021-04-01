import React from "react";
import {
  PropItem,
  PropItemRenderContext,
} from "@provider-app/platform-access-spec";
import { CheckCustomRuleComp } from "./comp";

/** 属性项编辑的组件属性 */
// const whichAttr = 'title';

@PropItem({
  id: "prop_check_custom_rule",
  label: "自定义校验",
  whichAttr: ["checkCustomRule", "field"],
  // defaultValues: {
  //   title: '标题'
  // },
})
export default class CheckCustomRuleHelperSpec {
  render(ctx: PropItemRenderContext) {
    const { takeMeta } = ctx.platformCtx.meta;
    return <CheckCustomRuleComp {...ctx} takeMeta={takeMeta} />;
  }
}
