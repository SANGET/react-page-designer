import React, { useState, useEffect } from "react";
import { Dropdown, Button, Menu } from "antd";
import { InputNumberWithSuffix } from "@provider-app/page-designer-shared/InputNumberWithSuffix";
import { DownOutlined } from "@ant-design/icons";
import { MARGIN, UNIT, CUSTOMED } from "./constants";
import { FormItem } from "./FormItem";

const UnitPanel = (props) => {
  const { onChange, value } = props;
  const getUnitSelectedKeys = () => {
    if (value) return [value];
    return ["px"];
  };
  return (
    <Menu selectedKeys={getUnitSelectedKeys()}>
      {Object.keys(UNIT).map((key) => (
        <Menu.Item
          key={key}
          onClick={() => {
            onChange(key);
          }}
        >
          {UNIT[key]}
        </Menu.Item>
      ))}
    </Menu>
  );
};

const MarginItem = (props) => {
  const { onChange, value: valueFromProp } = props;
  const [marginValue, setMarginValue] = useState(100);
  const [marginUnit, setMarginUnit] = useState("%");
  useEffect(() => {
    const [value, type] = valueFromProp?.split(/(%|px)$/) || [0, "px"];
    setMarginValue(value);
    setMarginUnit(type);
  }, []);

  const handleMenuClick = (type) => {
    setMarginUnit(type);
    if (typeof marginValue === "number") {
      onChange(marginValue + type);
    }
  };
  return (
    <InputNumberWithSuffix
      value={marginValue}
      onChange={(value) => {
        setMarginValue(value);
        onChange(parseFloat(value) + marginUnit);
      }}
      onBlur={() => {
        if (typeof marginValue === "number") {
          onChange(marginValue + marginUnit);
        }
      }}
      Suffix={
        <Dropdown
          overlay={
            <Menu selectedKeys={marginUnit ? [marginUnit] : []}>
              {Object.keys(UNIT).map((key) => (
                <Menu.Item
                  key={key}
                  onClick={() => {
                    handleMenuClick(key);
                  }}
                >
                  {UNIT[key]}
                </Menu.Item>
              ))}
            </Menu>
          }
        >
          <Button className="w-full flex">{marginUnit}</Button>
        </Dropdown>
      }
    />
  );
};

export const Margin = (props) => {
  const { value: margin, onChange, options } = props;
  const [customedMarginValue, setCustomedMarginValue] = useState();
  const [customedMarginUnit, setCustomedMarginUnit] = useState("px");
  useEffect(() => {
    if (margin in Margin) return;
    /** 初始化自定义数据 */
    const unitString = Object.keys(UNIT).join("|");
    const regExp = new RegExp(`(${unitString})$`);
    const [value, unit] = margin?.split(regExp) || [0, "px"];
    setCustomedMarginValue(value);
    setCustomedMarginUnit(unit);
  }, []);
  /** 用户选择固定数据 */
  const clickMarginPanel = (value) => {
    /** 清空自定义数据 */
    setCustomedMarginValue(null);
    onChange(value);
  };
  /** 用户选择单位数据 */
  const clickUnitPanel = (unit) => {
    setCustomedMarginUnit(unit);
    if (typeof customedMarginValue === "number") {
      onChange(customedMarginValue + unit);
    }
  };
  /** 用户选择完全自定义 */
  const clickTotalCustomed = () => {
    const newMargin = new Array(4).fill(margin).join(" ");
    onChange(newMargin);
  };
  /** 按索引更改对应的 边距 数据 */
  const changeTotalCustomed = (value, index) => {
    const newMargin = margin.split(" ");
    newMargin[index] = value;
    onChange(newMargin.join(" "));
  };
  /** 回显选中项 */
  const getMarginSelectedKeys = () => {
    if (MARGIN[margin]) return [margin];
    if (margin?.split(" ")?.length === 3) return [CUSTOMED];
    return [];
  };
  /** 边距面板 */
  const marginPanel = (
    <Menu
      className="horizontal-gutter-menu"
      selectedKeys={getMarginSelectedKeys()}
    >
      {Object.keys(MARGIN).map((key) => (
        <Menu.Item
          key={key}
          onClick={() => {
            clickMarginPanel(key);
          }}
        >
          {MARGIN[key]}
        </Menu.Item>
      ))}
      {/* 自定义，各方向边距不统一 */}
      <Menu.Item key={CUSTOMED} onClick={clickTotalCustomed}>
        自定义
      </Menu.Item>
      {/* 定制输入，各方向边距统一 */}
      <span>
        <InputNumberWithSuffix
          className="p-2"
          onChange={(value) => {
            setCustomedMarginValue(value);
            onChange(parseFloat(value) + customedMarginUnit);
          }}
          onBlur={() => {
            if (typeof customedMarginValue === "number") {
              onChange(customedMarginValue + customedMarginUnit);
            }
          }}
          value={customedMarginValue}
          Suffix={
            <Dropdown
              overlay={
                <Menu
                  selectedKeys={customedMarginUnit ? [customedMarginUnit] : []}
                >
                  {Object.keys(UNIT).map((key) => (
                    <Menu.Item
                      key={key}
                      onClick={() => {
                        clickUnitPanel(key);
                      }}
                    >
                      {UNIT[key]}
                    </Menu.Item>
                  ))}
                </Menu>
              }
            >
              <Button className="w-full flex">
                {UNIT[customedMarginUnit]}
              </Button>
            </Dropdown>
          }
        />
      </span>
    </Menu>
  );
  /** 获取展示数据 */
  const showMargin = () => {
    if (margin in MARGIN) return MARGIN[margin];
    if (margin.split(" ").length > 0) return "自定义";
    return margin;
  };
  const marginShowValue = showMargin();
  return (
    <>
      <Dropdown overlay={marginPanel}>
        <Button className="w-full flex">
          <span className="w-11/12 text-left">{marginShowValue}</span>
          <DownOutlined />
        </Button>
      </Dropdown>
      {/* 勾选为自定义时展示对应的 上下左右（边、间）距 */}
      {marginShowValue === "自定义" && (
        <div className="mt-2 p-3 bg-gray-200">
          {options?.map(({ title }, index) => (
            <FormItem title={title} key={title} className="mb-2">
              <MarginItem
                value={margin.split(" ")[index]}
                onChange={(value) => {
                  changeTotalCustomed(value, index);
                }}
              />
            </FormItem>
          ))}
        </div>
      )}
    </>
  );
};
