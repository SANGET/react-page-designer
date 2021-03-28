import React, { useEffect } from "react";
import { Select } from "antd";
import { DATA_TYPE_MENU } from "./constants";

const { Option } = Select;

export const DataTypeComp = ({ changeEntityState, editingWidgetState, widgetEntity, takeMeta }) => {
  const { dataType, field } = editingWidgetState;
  const selectedField = takeMeta({
    metaAttr: "schema",
    metaRefID: field
  });
  useEffect(() => {
    if(selectedField?.column){
      const { colDataType } = selectedField?.column || {};

      changeEntityState({
        attr: "dataType",
        value: colDataType
      });
    }
  }, [selectedField]);

  return (
    <Select
      style={{ width: "100%" }}
      value={dataType}
      onChange={(value) =>
        changeEntityState({
          attr: "dataType",
          value
        })
      }
      disabled={!!selectedField?.column}
    >
      {(DATA_TYPE_MENU[widgetEntity?.propState?.fieldType] || []).map((item) => (
        <Option key={item.key} value={item.value}>
          {item.label}
        </Option>
      ))}
    </Select>
  );
};
