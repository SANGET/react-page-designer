import React, { useEffect } from "react";
import { Select } from "antd";
import { FIELD_TYPE_MENU } from "./constants";

const { Option } = Select;

export const FieldTypeComp = ({ changeEntityState, editingWidgetState, takeMeta }) => {
  const { fieldType, field } = editingWidgetState;
  const selectedField = takeMeta({
    metaAttr: "schema",
    metaRefID: field
  });
  useEffect(() => {
    if(selectedField?.column){
      const { fieldType } = selectedField?.column || {};

      changeEntityState({
        attr: "fieldType",
        value: fieldType
      });
    }
  }, [selectedField]);
  return (
    <Select
      style={{ width: "100%" }}
      value={fieldType}
      onChange={(value) =>
        changeEntityState({
          attr: "fieldType",
          value
        })
      }
      disabled={!!selectedField?.column}
    >
      {FIELD_TYPE_MENU.map((item) => (
        <Option key={item.key} value={item.value}>
          {item.label}
        </Option>
      ))}
    </Select>
  );
};
