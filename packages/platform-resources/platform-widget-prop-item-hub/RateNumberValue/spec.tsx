import {
  PropItem,
  PropItemRenderContext,
} from "@provider-app/platform-access-spec";
import React from "react";
import { RateNumberComp } from "./comp";

/** 属性项编辑的组件属性 */
// const whichAttr = 'promptInfo';

@PropItem({
  id: "rate-number-value",
  label: "评分值",
  tip: "请输入 0 以上的正整数",
  whichAttr: ["count"],
})
export default class RateNumberValueSpec {
  render(ctx: PropItemRenderContext) {
    return <RateNumberComp {...ctx} />;
  }
}
