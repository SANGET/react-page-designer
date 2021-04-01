import React from "react";
import {
  PropItem,
  PropItemRenderContext,
} from "@provider-app/platform-access-spec";
import { PromptInfoComp } from "./comp";

/** 属性项编辑的组件属性 */
// const whichAttr = 'promptInfo';

@PropItem({
  id: "prop_prompt_info",
  label: "提示信息",
  whichAttr: ["placeholder", "field"],
})
export default class PromptInfoHelperSpec {
  render(ctx: PropItemRenderContext) {
    return <PromptInfoComp {...ctx} />;
  }
}
