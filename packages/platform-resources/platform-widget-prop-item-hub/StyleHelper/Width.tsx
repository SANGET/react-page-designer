import React, { useState, useEffect } from "react";
import { Dropdown, Button, Menu } from "antd";
import { InputNumberWithSuffix } from "@provider-app/page-designer-shared/InputNumberWithSuffix";
import { WIDTH } from "./constants";

export const Width = (props) => {
  const { onChange, value: valueFromProp, options, min, max, ...rest } = props;
  const [widthValue, setWidthValue] = useState(100);
  const [widthType, setWidthType] = useState("%");
  const menuOptions = options || WIDTH;
  useEffect(() => {
    const [value, type] = valueFromProp?.split(/(%|px)$/) || [100, "%"];
    setWidthValue(value);
    setWidthType(type);
  }, [valueFromProp]);

  const handleMenuClick = (type) => {
    setWidthType(type);
    if (typeof widthValue === "number") {
      onChange(widthValue + type);
    }
  };
  const getSelectedKeys = () => {
    if (widthType) return [widthType];
    return [];
  };
  const menu = (
    <Menu className="horizontal-gutter-menu" selectedKeys={getSelectedKeys()}>
      {Object.keys(menuOptions).map((key) => (
        <Menu.Item
          key={key}
          onClick={() => {
            handleMenuClick(key);
          }}
        >
          {menuOptions[key]}
        </Menu.Item>
      ))}
    </Menu>
  );
  return (
    <InputNumberWithSuffix
      {...rest}
      min={min}
      max={max}
      value={widthValue}
      onChange={(value) => {
        setWidthValue(value);
        onChange(parseFloat(value) + widthType);
      }}
      onBlur={() => {
        if (
          typeof widthValue === "number" &&
          min !== undefined &&
          widthValue >= min &&
          max !== undefined &&
          widthValue <= max
        ) {
          onChange(widthValue + widthType);
        }
      }}
      Suffix={
        <Dropdown overlay={menu}>
          <Button className="w-full flex">{widthType}</Button>
        </Dropdown>
      }
    />
  );
};
