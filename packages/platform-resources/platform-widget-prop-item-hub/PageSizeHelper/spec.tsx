import React from "react";
import { PropItem, PropItemRenderContext } from "@provider-app/platform-access-spec";
import { PageSizeComp } from "./comp";

/** 属性项编辑的组件属性 */
// const whichAttr = 'title';
const attr = "pagination";
@PropItem({
  id: "prop_page_size",
  label: "显示分页",
  whichAttr: ["pagination"],
  // defaultValues: {
  //   title: '标题'
  // },
})
export default class PageSizeSpec {
  render(ctx: PropItemRenderContext) {
    const { changeEntityState, editingWidgetState } = ctx;
    const handleChange = (value) => {
      changeEntityState({
        attr,
        value,
      });
    };
    return (
      <PageSizeComp
        onChange={handleChange}
        editingWidgetState={editingWidgetState}
      />
    );
  }
}
