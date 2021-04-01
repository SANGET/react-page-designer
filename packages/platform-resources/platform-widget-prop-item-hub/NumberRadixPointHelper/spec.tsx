import React from "react";
import {
  PropItem,
  PropItemRenderContext,
} from "@provider-app/platform-access-spec";
import { NumberRadixPointComp } from "./comp";

/** 属性项编辑的组件属性 */
// const whichAttr = 'title';

@PropItem({
  id: "prop_number_radixPoint",
  label: "小数位数",
  tip: "只能输入正整数",
  whichAttr: ["precision", "field"],
  // defaultValues: {
  //   radixPoint: 0
  // },
})
export default class NumberRadixPointHelperSpec {
  render(ctx: PropItemRenderContext) {
    return <NumberRadixPointComp {...ctx} />;
  }
}
