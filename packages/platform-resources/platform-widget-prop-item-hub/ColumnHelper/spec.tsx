import React from "react";
import { Input } from "antd";
import {
  PropItem,
  PropItemRenderContext,
} from "@provider-app/platform-access-spec";

@PropItem({
  id: "prop_flex_config",
  label: "列所占比例",
  whichAttr: ["span"],
})
export default class ColumnHelperSpec {
  render(ctx: PropItemRenderContext) {
    const { changeEntityState, editingWidgetState = {} } = ctx;
    const { span } = editingWidgetState;
    return (
      <div>
        <Input
          readOnly
          value={span}
          onChange={(e) => {
            changeEntityState({
              attr: "span",
              value: e.target.value,
            });
          }}
        />
      </div>
    );
  }
}
