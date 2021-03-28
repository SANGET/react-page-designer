import React from "react";
import { InputNumber, notification } from "antd";

export const NumberMinComp = ({ changeEntityState, editingWidgetState }) => {
  const { min, max } = editingWidgetState;
  return (
    <InputNumber
      style={{ width: "100%" }}
      value={min}
      onBlur={() => {
        if([undefined, null, ""].includes(min)) return;
        if (typeof min !== "number") {
          notification.error({ message: "只能输入数字，请重新输入" });
          changeEntityState({
            attr: "min",
            value: null,
          });
          return;
        }
        if (typeof max === "number" && min > max) {
          notification.error({ message: "最小值不能大于最大值，请重新输入" });
          changeEntityState({
            attr: "min",
            value: null,
          });
        }
      }}
      onChange={(value) => {
        changeEntityState({
          attr: "min",
          value,
        });
      }}
    />
  );
};
