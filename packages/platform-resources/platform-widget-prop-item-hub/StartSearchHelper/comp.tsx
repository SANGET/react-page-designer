import React, { useEffect } from "react";
import { Radio } from "antd";

export const StartSearchComp = ({
  changeEntityState,
  editingWidgetState,
  takeMeta,
}) => {
  const { showSearch, field } = editingWidgetState;
  const selectedField = takeMeta({
    metaAttr: "schema",
    metaRefID: field,
  });
  useEffect(() => {
    // const nextStartSearch = selectedField?.column?.name;
    // if (!nextStartSearch || nextStartSearch === showSearch) return;
    // changeEntityState({
    //   attr: 'showSearch',
    //   value: nextStartSearch
    // });
  }, [selectedField]);
  return (
    <Radio.Group
      onChange={(e) =>
        changeEntityState({
          attr: "showSearch",
          value: e.target.value,
        })
      }
      value={showSearch}
    >
      <Radio value={true}>是</Radio>
      <Radio value={false}>否</Radio>
    </Radio.Group>
  );
};
