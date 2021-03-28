import React, { useState, useEffect } from "react";
import { Select } from "antd";
import { FIELD_TYPE_MENU } from "./constants";

const { Option } = Select;
const useOptions = () => {
  const [list, setList] = useState(FIELD_TYPE_MENU);
  const getList = (searchValue) => {
    if (!searchValue) {
      setList(FIELD_TYPE_MENU);
      return;
    }
    setList(FIELD_TYPE_MENU.filter((item) => item.label.includes(searchValue)));
  };
  return [list, getList];
};
export const CheckFixedRuleComp = ({
  changeEntityState,
  editingWidgetState,
}) => {
  const { checkFixedRule } = editingWidgetState;
  const [options, getOptions] = useOptions();
  return (
    <Select
      style={{ width: "100%" }}
      value={checkFixedRule}
      onChange={(value) =>
        changeEntityState({
          attr: "checkFixedRule",
          value,
        })
      }
      filterOption={false}
      showSearch
      onSearch={(searchValue) => {
        getOptions(searchValue);
      }}
      allowClear
    >
      {options?.map((item) => (
        <Option key={item.value} value={item.value}>
          {item.label}
        </Option>
      ))}
    </Select>
  );
};
