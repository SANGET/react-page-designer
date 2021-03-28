import React, { useState } from "react";
import { Input, Select, Button } from "antd";
import { PropItem, PropItemRenderContext } from "@provider-app/platform-access-spec";
// import { ShowModal } from "@deer-ui/core";
import { OptionsSelector, OptionsSelectorData } from "./comp";
// import { ApiCreator } from "../../../ApiGenerator/ApiCreator";

// const takeBindColumnInfo = (selectedField: SelectedField) => {
//   const { column, tableInfo } = selectedField;
//   return `${tableInfo?.name}_${column?.name}`;
// };

/** 属性项编辑的组件属性 */

const metaAttr = "schema";

/**
 * 绑定数据列
 */
@PropItem({
  id: "prop_options",
  label: "选项数据源",
  whichAttr: ["propOptions", "options"],
  useMeta: metaAttr,
})
export default class OptionsHelperSpec {
  render({
    editingWidgetState,
    changeEntityState,
    platformCtx,
  }: PropItemRenderContext) {
    const { propOptions } = editingWidgetState;
    return (
      <OptionsSelector
        platformCtx={platformCtx}
        defaultOptions={propOptions}
        onSubmit={(config: OptionsSelectorData) => {
          changeEntityState({
            attr: "propOptions",
            value: config,
          });
          if(config.type === "custom"){
            const options = {};
            config.optionsConfig?.forEach((item)=>{
              options[item.realVal] = item.showVal;
            });
            changeEntityState({
              attr: "options",
              value: options,
            });
          }else {
            changeEntityState({
              attr: "options",
              value: undefined,
            });
          }
        }}
      ></OptionsSelector>
    );
  }
}
