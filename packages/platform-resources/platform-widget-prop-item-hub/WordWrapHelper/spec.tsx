import React from "react";
import { PropItem, PropItemRenderContext } from "@provider-app/platform-access-spec";
import { WordWrapComp } from "./comp";

/** 属性项编辑的组件属性 */
// const whichAttr = 'title';
const attr = "wordWrap";
@PropItem({
  id: "prop_word_wrap",
  label: "单元格换行显示",
  whichAttr: [attr],
  // defaultValues: {
  //   title: '标题'
  // },
})
export default class WordWrapSpec {
  render(ctx: PropItemRenderContext) {
    const { changeEntityState, editingWidgetState } = ctx;
    const handleChange = (value) => {
      changeEntityState({
        attr,
        value,
      });
    };
    return (
      <WordWrapComp
        onChange={handleChange}
        editingWidgetState={editingWidgetState}
      />
    );
  }
}
