import React, { useEffect } from "react";
import { PropItem, PropItemRenderContext } from "@provider-app/platform-access-spec";
import { TitleEditorComp } from "./comp";

@PropItem({
  id: "prop_title_value",
  label: "标题",
  whichAttr: ["title", "field"],
  defaultValues: {
    title: "标题",
  },
})
export default class TitleHelperSpec {
  render(ctx: PropItemRenderContext) {
    return (
      <>
        {/* <div onClick={e => {
          changeWidgetType('DropdownSelector');
        }}
        >
        更改为下拉框类型
        </div> */}
        <TitleEditorComp {...ctx} />
      </>
    );
  }
}
