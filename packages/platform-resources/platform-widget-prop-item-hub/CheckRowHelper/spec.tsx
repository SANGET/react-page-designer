import React from "react";
import {
  PropItem,
  PropItemRenderContext,
} from "@provider-app/platform-access-spec";
import { CheckRowComp } from "./comp";

/** 属性项编辑的组件属性 */
const whichAttr = "rowSelection";
@PropItem({
  id: "prop_check_row",
  label: "选中数据行",
  whichAttr: [whichAttr],
  // defaultValues: {
  //   title: '标题'
  // },
})
export default class CheckRowSpec {
  render(ctx: PropItemRenderContext) {
    const { changeEntityState, editingWidgetState } = ctx;
    const { rowSelection } = editingWidgetState;
    const handleChange = (map) => {
      changeEntityState({
        attr: whichAttr,
        value: {
          ...(rowSelection || {}),
          ...map,
        },
      });
    };
    return (
      <CheckRowComp
        onChange={handleChange}
        editingWidgetState={editingWidgetState}
      />
    );
  }
}
