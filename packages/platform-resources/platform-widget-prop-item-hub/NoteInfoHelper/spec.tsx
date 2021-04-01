import React from "react";
import {
  PropItem,
  PropItemRenderContext,
} from "@provider-app/platform-access-spec";
import { NoteInfoComp } from "./comp";

/** 属性项编辑的组件属性 */
// const whichAttr = 'noteInfo';

@PropItem({
  id: "prop_note_info",
  label: "备注信息",
  whichAttr: ["note"],
  // defaultValues: {
  //   title: '标题'
  // },
})
export default class NoteInfoHelperSpec {
  render(ctx: PropItemRenderContext) {
    return <NoteInfoComp {...ctx} />;
  }
}
