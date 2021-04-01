import React from "react";
import {
  PropItem,
  PropItemRenderContext,
} from "@provider-app/platform-access-spec";
import { CheckFixedRuleComp } from "./comp";

/** 属性项编辑的组件属性 */
// const whichAttr = 'title';

@PropItem({
  id: "prop_check_fixed_rule",
  label: "固定规则",
  whichAttr: ["checkFixedRule"],
  // defaultValues: {
  //   title: '标题'
  // },
})
export default class CheckFixedRuleHelperSpec {
  render(ctx: PropItemRenderContext) {
    return <CheckFixedRuleComp {...ctx} />;
  }
}
