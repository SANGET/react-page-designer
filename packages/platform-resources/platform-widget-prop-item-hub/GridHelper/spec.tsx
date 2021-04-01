import React, { useEffect } from "react";
import {
  PropItem,
  PropItemRenderContext,
} from "@provider-app/platform-access-spec";
import { GridEditorComp } from "./comp";

@PropItem({
  id: "prop_grid_value",
  whichAttr: ["grid"],
  defaultValues: {
    grid: [{ span: 24 }, { span: 12 }, { span: 12 }],
  },
})
export default class GridHelperSpec {
  render(ctx: PropItemRenderContext) {
    return (
      <>
        {/* <div onClick={e => {
          changeWidgetType('DropdownSelector');
        }}
        >
        更改为下拉框类型
        </div> */}
        <GridEditorComp {...ctx} />
      </>
    );
  }
}
