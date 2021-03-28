import React from "react";
import { Select, Radio } from "antd";
import { PAGE_SIZE_MENU, SHOW_PAGE_SIZE_MENU } from "./constants";

export const PageSizeComp = ({ editingWidgetState, onChange }) => {
  const { pagination } = editingWidgetState;
  return (
    <>
      <Radio.Group
        className="w-full"
        value={!!pagination}
        options={SHOW_PAGE_SIZE_MENU}
        onChange={(e) => {
          onChange(e.target.value ? { pageSize: 10, current: 1 } : null);
        }}
      ></Radio.Group>
      {pagination ? (
        <>
          <span className="mr-2">默认每页显示</span>
          <Select
            defaultValue={pagination.pageSize}
            value={pagination.pageSize}
            onChange={(pageSize) => onChange({ pageSize, current: 1 })}
            options={PAGE_SIZE_MENU}
          />
          <span className="ml-2">行</span>
        </>
      ) : null}
    </>
  );
};
