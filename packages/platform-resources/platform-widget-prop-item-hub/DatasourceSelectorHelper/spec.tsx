import React from "react";
import {
  PropItem,
  PropItemRenderContext,
} from "@provider-app/platform-access-spec";
import { OptionsSelector } from "./comp";

@PropItem({
  id: "prop_datasource_selector",
  label: "数据源选择",
  // optDS => option datasource
  whichAttr: [
    "optDS",
    "realValDefault",
    "showValField",
    "realValField",
    "sortInfo",
  ],
  useMeta: ["dataSource"],
})
export default class DatasourceSelectotHelper {
  constructor(meta) {
    // this.meta = meta
    // console.log(meta);
  }

  getA() {
    console.log("A");
  }

  render(ctx: PropItemRenderContext) {
    // this.getA();
    return <OptionsSelector whichAttr="optDS" {...ctx} />;
  }
}
