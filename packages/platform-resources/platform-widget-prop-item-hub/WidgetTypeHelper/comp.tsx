import React, { useEffect, useState } from "react";
import { Select } from "antd";
import { WIDGET_TYPE_MENU } from "./constants";
import { IOptions } from "./interface";
import { getWidgetOptions } from "./utils";

const { Option } = Select;

export const WidgetTypeComp = ({
  changeEntityState,
  changeWidgetType,
  editingWidgetState,
  widgetEntity,
  takeMeta,
}) => {
  const [widgetOptions, setWidgetOptions] = useState<IOptions[]>([]);
  const { field } = editingWidgetState;
  const selectedField = takeMeta({
    metaAttr: "schema",
    metaRefID: field,
  });
  useEffect(() => {
    const { fieldType, colDataType } = selectedField?.column || {};
    setWidgetOptions(getWidgetOptions(fieldType, colDataType));
  }, [selectedField]);
  return (
    <Select
      style={{ width: "100%" }}
      defaultValue={widgetEntity?.widgetRef}
      value={widgetEntity?.widgetRef}
      onChange={(value) => changeWidgetType(value)}
    >
      {WIDGET_TYPE_MENU.map((item) => (
        <Option key={item.key} value={item.value} disabled={!item.value}>
          {item.label}
        </Option>
      ))}
    </Select>
  );
};
