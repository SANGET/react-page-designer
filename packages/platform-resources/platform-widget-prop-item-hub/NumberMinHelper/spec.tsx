import React from "react";
import { PropItem, PropItemRenderContext } from "@provider-app/platform-access-spec";
import { NumberMinComp } from "./comp";

/** 属性项编辑的组件属性 */
// const whichAttr = 'title';

@PropItem({
  id: "prop_number_min",
  label: "最小值",
  tip: "只能输入数字，最小值不能大于最大值",
  whichAttr: ["min", "max"],
  // defaultValues: {
  //   min: 0
  // },
})
export default class NumberMinHelperSpec {
  render(ctx: PropItemRenderContext) {
    const { takeMeta } = ctx.platformCtx.meta;

    return <NumberMinComp {...ctx} takeMeta={takeMeta} />;
  }
}
