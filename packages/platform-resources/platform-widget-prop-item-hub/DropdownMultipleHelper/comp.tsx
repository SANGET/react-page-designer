import React, { useEffect } from "react";
import { Radio } from "antd";

export const DropdownMultipleComp = ({
  changeEntityState,
  editingWidgetState,
  takeMeta,
}) => {
  const { mode, field } = editingWidgetState;
  const selectedField = takeMeta({
    metaAttr: "schema",
    metaRefID: field,
  });
  useEffect(() => {
    const nextDropdownMultiple = selectedField?.column?.name;
    if (!nextDropdownMultiple || nextDropdownMultiple === mode) return;
    changeEntityState({
      attr: "mode",
      value: nextDropdownMultiple,
    });
  }, [selectedField]);
  return (
    <Radio.Group
      onChange={(e) =>
        changeEntityState({
          attr: "mode",
          value: e.target.value,
        })
      }
      value={mode}
    >
      <Radio value="multi">是</Radio>
      <Radio value="single">否</Radio>
    </Radio.Group>
  );
};
