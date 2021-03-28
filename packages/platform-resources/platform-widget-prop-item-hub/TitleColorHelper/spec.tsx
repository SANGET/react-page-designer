import React from "react";
import { Input, Selector } from "@provider-app/shared-ui";
import { PropItem, PropItemRenderContext } from "@provider-app/platform-access-spec";

/** 属性项编辑的组件属性 */
const whichAttr = "labelColor";

@PropItem({
  id: "prop_style_title_color",
  label: "标题颜色",
  whichAttr,
})
export default class TitleColorHelperSpec {
  render(ctx: PropItemRenderContext) {
    const { changeEntityState, editingWidgetState } = ctx;
    /** 取自身定义的 whichAttr */
    const _value = editingWidgetState[whichAttr];
    return (
      <div>
        <Input
          value={_value || ""}
          onChange={(value) =>
            changeEntityState({
              attr: whichAttr,
              value,
            })
          }
        />
      </div>
    );
  }
}
