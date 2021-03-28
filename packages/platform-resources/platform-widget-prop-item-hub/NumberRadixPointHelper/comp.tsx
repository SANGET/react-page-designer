import React from "react";
import { InputNumber, notification } from "antd";

export const NumberRadixPointComp = ({
  changeEntityState,
  editingWidgetState,
}) => {
  const { precision } = editingWidgetState;
  return (
    <InputNumber
      min={0}
      value={precision}
      style={{ width: "100%" }}
      onBlur={() => {
        if (precision && !/^[1-9]\d*$/.test(precision)) {
          notification.error({ message: "只能输入正整数，请重新输入" });
          changeEntityState({
            attr: "precision",
            value: null,
          });
        }
      }}
      onChange={(value) => {
        changeEntityState({
          attr: "precision",
          value,
        });
      }}
    />
  );
};
