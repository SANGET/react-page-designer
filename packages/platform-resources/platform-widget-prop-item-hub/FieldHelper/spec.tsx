import React from "react";
import { Input } from "antd";
import { PropItem, PropItemRenderContext } from "@provider-app/platform-access-spec";
import { FieldSelector, SelectedField } from "./comp";

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
  id: "prop_field",
  label: "数据字段",
  whichAttr: "field",
  useMeta: metaAttr,
})
export default class FieldHelperSpec {
  /**
   * 检查该 column 是否已经被其他控件绑定
   */
  checkColumnIsBeUsed = (
    _selectedField: SelectedField,
    schema
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const isBeUsed = Object.keys(schema).some((sID) => {
        const fieldCode = _selectedField.column?.fieldCode;
        return !fieldCode || sID.indexOf(fieldCode) !== -1;
      });
      if (isBeUsed) {
        reject();
        return;
      }
      resolve();
    });
  };

  render({
    editingWidgetState,
    changeEntityState,
    platformCtx,
  }: PropItemRenderContext) {
    const { field } = editingWidgetState;
    return (
      <div>
        <Input
          defaultValue={field}
          onChange={(e) => {
            // console.log(e.target.value);
            const { value } = e.target;
            changeEntityState({
              attr: "field",
              value,
            });
          }}
        />
      </div>
    );
  }
}
