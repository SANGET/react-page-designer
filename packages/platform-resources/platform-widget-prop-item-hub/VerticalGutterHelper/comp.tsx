import React, { useState } from "react";
import { PropItemRenderContext } from "@provider-app/platform-access-spec";
import { InputNumber, Dropdown, Menu, Button } from "antd";
import { DownOutlined } from "@ant-design/icons";
// import { InputNumberWithSuffix } from "@provider-app/page-designer-shared/InputNumberWithSuffix";
import { OPTIONS } from "./constant";
import "./style.scss";

const PX = "px";
/**
 * 栅格比例面板
 * @param param0
 * @returns
 */
export const VerticalGutterComp: React.FC<PropItemRenderContext> = ({
  changeEntityState,
  editingWidgetState,
}) => {
  const [customedValue, setCustomedValue] = useState();
  const { verticalGutter } = editingWidgetState;
  const handleMenuClick = (value) => {
    setCustomedValue(null);
    changeEntityState({
      attr: "verticalGutter",
      value: Number(value),
    });
  };
  const menu = (
    <Menu className="vertical-gutter-menu">
      {Object.keys(OPTIONS).map((key) => (
        <Menu.Item
          key={key}
          onClick={() => {
            handleMenuClick(key);
          }}
        >
          {OPTIONS[key]}
        </Menu.Item>
      ))}
      <div className="w-full gutter-editor">
        <InputNumberWithSuffix
          className="p-2"
          onChange={(value) => {
            setCustomedValue(value);
          }}
          onBlur={() => {
            if (customedValue) {
              changeEntityState({
                attr: "verticalGutter",
                value: Number(customedValue),
              });
            }
          }}
          value={customedValue}
          Suffix={
            <Dropdown
              overlay={
                <Menu selectedKeys={[PX]}>
                  <Menu.Item key={PX}>{PX}</Menu.Item>
                </Menu>
              }
            >
              <Button className="w-full flex">{PX}</Button>
            </Dropdown>
          }
        />
      </div>
    </Menu>
  );
  return (
    <div className="vertical-gutter-helper">
      {/* <div className="grid-label ant-col ant-col-10 pl-1">行间距</div>
        <div className="grid-input ant-col ant-col-14"> */}
      <Dropdown overlay={menu}>
        <Button className="w-full flex" style={{ paddingLeft: 10 }}>
          <span className="w-11/12 text-left">
            {OPTIONS[verticalGutter] || `${verticalGutter}px`}
          </span>
          <DownOutlined />
        </Button>
      </Dropdown>
      {/* </div> */}
    </div>
  );
};
