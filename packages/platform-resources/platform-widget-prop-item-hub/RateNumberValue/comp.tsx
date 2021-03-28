import { InputNumber, notification } from "antd";
import React from "react";

export const RateNumberComp = ({ changeEntityState, editingWidgetState }) => {
  const { count } = editingWidgetState;
  return (
    <InputNumber
      value={count}
      onBlur={() => {
        if (count && !/^[1-9]\d*$/.test(count)) {
          notification.error({
            message: "只能输入 0 以上的正整数，请重新输入",
          });
          changeEntityState({
            attr: "count",
            value: 5,
          });
        }
      }}
      onChange={(number) =>
        changeEntityState({
          attr: "count",
          value: number,
        })
      }
    />
  );
};
