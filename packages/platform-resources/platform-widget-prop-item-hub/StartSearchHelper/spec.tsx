import React from "react";
import {
  PropItem,
  PropItemRenderContext,
} from "@provider-app/platform-access-spec";
import { StartSearchComp } from "./comp";

/** 属性项编辑的组件属性 */
// const whichAttr = 'title';

@PropItem({
  id: "prop_start_search",
  label: "启动搜索",
  whichAttr: ["showSearch", "field"],
  // defaultValues: {
  //   title: '标题'
  // },
})
export default class StartSearchHelperSpec {
  render(ctx: PropItemRenderContext) {
    const { takeMeta } = ctx.platformCtx.meta;
    return <StartSearchComp {...ctx} takeMeta={takeMeta} />;
  }
}
