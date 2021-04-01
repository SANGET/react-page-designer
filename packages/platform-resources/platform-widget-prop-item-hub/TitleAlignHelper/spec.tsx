import React from "react";
import {
  PropItem,
  PropItemRenderContext,
} from "@provider-app/platform-access-spec";
import { TitleAlignComp } from "./comp";

/** 属性项编辑的组件属性 */
// const whichAttr = 'title';
const attr = "titleAlign";
@PropItem({
  id: "prop_title_align",
  label: "标题位置",
  whichAttr: [attr],
  // defaultValues: {
  //   title: '标题'
  // },
})
export default class TitleAlignSpec {
  render(ctx: PropItemRenderContext) {
    const { changeEntityState, editingWidgetState } = ctx;
    const handleChange = (value) => {
      changeEntityState({
        attr,
        value,
      });
    };
    return (
      <TitleAlignComp
        onChange={handleChange}
        editingWidgetState={editingWidgetState}
      />
    );
  }
}
