import React, { useEffect } from "react";
import { Select } from "antd";
import { TIME_MODE_OPTIONS } from "./constants";


export const TimeModeComp = ({ changeEntityState, editingWidgetState, widgetEntity, takeMeta }) => {
  const { timeMode } = editingWidgetState;
  // const selectedField = takeMeta({
  //   metaAttr: "schema",
  //   metaRefID: field
  // });

  return (
    <Select
      style={{ width: "100%" }}
      value={timeMode}
      onChange={(value) =>
        changeEntityState({
          attr: "timeMode",
          value
        })
      }
      options={TIME_MODE_OPTIONS}
      // disabled={!!selectedField?.column}
    />
  );
};
