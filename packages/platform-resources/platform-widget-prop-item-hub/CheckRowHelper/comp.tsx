import React from "react";
import { Radio, Select } from "antd";
import { CHECK_ROW_MENU, CHECK_ROW, SELECTED_ROW_MENU } from "./constants";

export const CheckRowComp = ({ editingWidgetState, onChange }) => {
  const { rowSelection } = editingWidgetState;
  // const [showPageSize, setShowPageSize] = useState<boolean>(!!pageSize);
  return (
    <>
      <Radio.Group
        className="w-full"
        value={rowSelection?.type || "no"}
        options={CHECK_ROW_MENU}
        onChange={(e) => {
          const { value } = e.target;
          onChange({
            type: e.target.value,
            checkedStyle:
              value === CHECK_ROW.checkbox
                ? "checkedCellNActiveRow"
                : "activeRow",
          });
        }}
      />
      {[CHECK_ROW.checkbox, CHECK_ROW.radio].includes(rowSelection?.type) ? (
        <div className="mt-4">
          <span className="prop-label mb5">选中形式</span>
          <Select
            className="prop-content"
            style={{ width: "100%" }}
            defaultValue={rowSelection?.checkedStyle}
            value={rowSelection?.checkedStyle}
            onChange={(value) => onChange({ checkedStyle: value })}
            options={SELECTED_ROW_MENU}
          />
        </div>
      ) : null}
    </>
  );
};
