import React from "react";
import { Radio } from "antd";
import { SHOW_ORDER_COLUMN_MENU } from "./constants";

export const ShowOrderColumnComp = ({ editingWidgetState, onChange }) => {
  const { showOrderColumn } = editingWidgetState;
  // const [showPageSize, setShowPageSize] = useState<boolean>(!!pageSize);
  return (
    <>
      <Radio.Group
        className='w-full'
        value={!!showOrderColumn}
        options={SHOW_ORDER_COLUMN_MENU}
        onChange={e=>{
          onChange(e.target.value);
        }}
      ></Radio.Group>
    </>
  );
};
