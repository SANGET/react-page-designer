import {
  PropItem,
  PropItemRenderContext,
} from "@provider-app/platform-access-spec";
import React from "react";
import { LowCodeComp } from "./comp";

/** 属性项编辑的组件属性 */
// const whichAttr = 'promptInfo';

@PropItem({
  id: "low_code",
  label: "低代码",
  whichAttr: ["lowCode", "field"],
  // defaultValues: {
  //   title: '标题'
  // },
})
export default class LowCodeSpec {
  render(ctx: PropItemRenderContext) {
    const { takeMeta } = ctx.platformCtx.meta;
    return <LowCodeComp {...ctx} takeMeta={takeMeta} />;
  }
}
