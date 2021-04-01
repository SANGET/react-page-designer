import React from "react";
import {
  PropItem,
  PropItemRenderContext,
} from "@provider-app/platform-access-spec";
import { Comp } from "./comp";

/** 属性项编辑的组件属性 */
// const whichAttr = 'unit';

@PropItem({
  id: "prop_style",
  label: "通用样式设置",
  whichAttr: ["style"],
  defaultValues: {
    style: {
      width: "100%",
      height: "120px",
      margin: "0px",
      padding: "0px",
      opacity: "100%",
      border: "0px solid black",
    },
  },
})
export default class StyleHelperSpec {
  render(ctx: PropItemRenderContext) {
    return <Comp {...ctx} />;
  }
}
