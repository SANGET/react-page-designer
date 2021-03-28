import React from "react";
import { Select } from "antd";
import { PLACE_MENU } from "./constants";

export const TitleAlignComp = ({ editingWidgetState, onChange }) => {
  const { titleAlign } = editingWidgetState;
  return (
    <Select
      style={{ width: "100%" }}
      defaultValue={titleAlign}
      value={titleAlign}
      onChange={(value) => onChange(value)}
      options={PLACE_MENU}
    />
  );
};
