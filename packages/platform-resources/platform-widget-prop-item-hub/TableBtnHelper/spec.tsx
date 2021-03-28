import React from "react";
import { PropItem, PropItemRenderContext } from "@provider-app/platform-access-spec";
import TableBtnHelperComp from "./comp";
import "./style.scss";
/** 属性项编辑的组件属性 */
// const whichAttr = 'title';

@PropItem({
  id: "prop_table_btn_helper",
  label: "表格按钮",
  whichAttr: ["headerBtns", "inlineBtns"]
})
export default class TableBtnHelperSpec {
  render(ctx: PropItemRenderContext) {
    return <TableBtnHelperComp {...ctx} />;
  }
}
