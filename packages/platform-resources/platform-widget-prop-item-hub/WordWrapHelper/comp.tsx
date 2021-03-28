import React from "react";
import { Radio } from "antd";
import { WORD_WRAP_MENU } from "./constants";

export const WordWrapComp = ({ editingWidgetState, onChange }) => {
  const { wordWrap } = editingWidgetState;
  // const [showPageSize, setShowPageSize] = useState<boolean>(!!pageSize);
  return (
    <>
      <Radio.Group
        className='w-full'
        value={!!wordWrap}
        options={WORD_WRAP_MENU}
        onChange={e=>{
          onChange(e.target.value);
        }}
      ></Radio.Group>
    </>
  );
};
