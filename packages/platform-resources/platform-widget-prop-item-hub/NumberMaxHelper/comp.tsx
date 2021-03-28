import React from "react";
import { InputNumber, notification } from "antd";

export const NumberMaxComp = ({ changeEntityState, editingWidgetState }) => {
  const { max, min } = editingWidgetState;
  return (
    <InputNumber
      style={{ width: "100%" }}
      value={max}
      onBlur={() => {
        if([undefined, null, ""].includes(max)) return;
        if (typeof max !== "number") {
          notification.error({ message: "只能输入数字，请重新输入" });
          changeEntityState({
            attr: "max",
            value: null,
          });
          return;
        }
        if (typeof min === "number" && min > max) {
          notification.error({ message: "最大值不能小于最小值，请重新输入" });
          changeEntityState({
            attr: "max",
            value: null,
          });
        }
      }}
      onChange={(value) => {
        changeEntityState({
          attr: "max",
          value,
        });
      }}
    />
  );
};
