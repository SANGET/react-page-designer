import React from "react";
import { Select } from "antd";
import { SHOW_TYPE_OPTIONS } from "./constants";


export const TimeTypeComp = ({ changeEntityState, editingWidgetState, widgetEntity, takeMeta }) => {
  const { timeType, field } = editingWidgetState;
  // const selectedField = takeMeta({
  //   metaAttr: "schema",
  //   metaRefID: field
  // });

  return (
    <Select
      style={{ width: "100%" }}
      value={timeType}
      onChange={(value) =>
        changeEntityState({
          attr: "timeType",
          value
        })
      }
      options={SHOW_TYPE_OPTIONS}
      // disabled={!!selectedField?.column}
    />
  );
};
