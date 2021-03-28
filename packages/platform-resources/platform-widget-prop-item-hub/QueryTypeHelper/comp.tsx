import React, { useState } from "react";
import { Checkbox, Select, InputNumber } from "antd";
import pick from "lodash/pick";
import { QUERY_STYLE_MENU } from "./constants";

/**
 * 查询样式
 * @param param0
 */
export const QueryStyleComp = ({ onChange, value }) => {
  return (
    <div className="prop-query-style my-1">
      <span className="mr-3">查询框位置</span>
      <Select value={value} onChange={onChange} options={QUERY_STYLE_MENU} />
    </div>
  );
};
/**
 * 最大个数
 * @param param0
 */
export const MaxShowNum = ({ value: originValue, onChange }) => {
  const [validate, setValidate] = useState(true);
  const [value, setValue] = useState(originValue);
  return (
    <>
      <span className="mr-3">最大显示个数</span>
      <InputNumber
        value={value}
        onChange={(value) => {
          const validateTmpl = /^([1-9]|10)$/.test(value.toString());
          setValidate(validateTmpl);
          value = validateTmpl ? value : originValue;
          onChange(value);
          setValue(value);
        }}
      />
      {!validate ? (
        <div className="text-red-600">只能输入1-10的数字</div>
      ) : null}
    </>
  );
};
/**
 * 查询方式
 * @param param0
 */
export const QueryTypeComp = ({ editingWidgetState, onChange }) => {
  const { queryType } = editingWidgetState;
  const handleChangeQueryStyle = (type, value) => {
    const typeArea = {
      ...(queryType[type] || {}),
      queryStyle: value,
    };
    if (value === "inToolbar") {
      typeArea.maxNum = 4;
    }
    const result = {
      ...queryType,
      [type]: typeArea,
    };
    onChange(result);
  };
  const handleChangeMaxNum = (type, value) => {
    const result = {
      ...queryType,
      [type]: {
        ...(queryType[type] || {}),
        maxNum: value,
      },
    };
    onChange(result);
  };
  return (
    <>
      <Checkbox.Group
        className="w-full"
        value={
          queryType
            ? Object.keys(queryType).filter((item) => !!queryType[item])
            : []
        }
        onChange={(value) => {
          const result = pick(queryType, value);
          value.forEach((item) => {
            if (!(item in result)) {
              result[item] = { queryStyle: "asForm" };
            }
          });
          onChange(result);
        }}
      >
        <Checkbox value="typical">普通查询</Checkbox>
        <br />
        {"typical" in queryType && queryType.typical ? (
          <>
            <QueryStyleComp
              value={queryType.typical.queryStyle}
              onChange={(value) => handleChangeQueryStyle("typical", value)}
            />
            {queryType.typical.queryStyle === "inToolbar" ? (
              <MaxShowNum
                value={queryType.typical.maxNum}
                onChange={(value) => handleChangeMaxNum("typical", value)}
              />
            ) : null}
          </>
        ) : null}
        <Checkbox value="special">高级查询（暂未支持）</Checkbox>
        <br />
        {"special" in queryType && queryType.special ? (
          <QueryStyleComp
            value={queryType.special}
            onChange={(value) => handleChangeQueryStyle("special", value)}
          />
        ) : null}
        <Checkbox value="keyword">关键字查询（暂未支持）</Checkbox>
      </Checkbox.Group>
    </>
  );
};
