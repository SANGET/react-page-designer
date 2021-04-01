import React from "react";
import {
  PropItem,
  PropItemRenderContext,
} from "@provider-app/platform-access-spec";
import { NumberMaxComp } from "./comp";

/** 属性项编辑的组件属性 */
// const whichAttr = 'title';

@PropItem({
  id: "prop_number_max",
  label: "最大值",
  tip: "只能输入数字，最大值不能小于最小值",
  whichAttr: ["max", "min"],
  // defaultValues: {
  //   max: 10
  // },
})
export default class NumberMaxHelperSpec {
  render(ctx: PropItemRenderContext) {
    const { takeMeta } = ctx.platformCtx.meta;
    return <NumberMaxComp {...ctx} takeMeta={takeMeta} />;
  }
}
