import React, { useState } from "react";
import { Divider, InputNumber, Radio, Input, Button, Select } from "antd";
import { isReferenceField } from "./utils";

type BasicColumn = {
  title: string;
  width: number;
  show: boolean;
  editable?: boolean;
  align?: "left" | "center" | "right";
};
export type DSColumn = {
  type: "dsColumn";
  fieldCode: string;
  tableTitle: string;
  fieldShowType: "realVal" | "showVal";
  colDataType: "string";
};
export type Column = BasicColumn & DSColumn;
export interface ColumnEditableItemsProps {
  defaultValue: Column;
  onChange: (nextState: Column) => void;
}
/**
 * 编辑单元
 */
const Editor = ({ title, children }) => {
  return (
    <div className="mb10">
      <div className="prop-label mb5">{title}</div>
      <div className="prop-content">{children()}</div>
    </div>
  );
};

/**
 * 列宽
 */
/** 列宽单位列表 */
const WIDTH_MENU = [
  { key: "%", value: "%", label: "%" },
  { key: "px", value: "px", label: "px" },
];
type Width = { widthNum: number | undefined; unit: string };
type GetWidth = (param: {
  widthNum?: string | number | undefined;
  unit?: string;
}) => string;
const useWidth = (param = ""): [Width, GetWidth] => {
  const [width, setWidth] = useState<Width>({
    widthNum: param ? parseFloat(param) : undefined,
    unit: !param ? "px" : param?.replace(parseFloat(param).toString(), ""),
  });
  const getWidth: GetWidth = ({ widthNum, unit }) => {
    if (!widthNum) {
      widthNum = width.widthNum;
    } else if (typeof widthNum === "string") {
      widthNum = parseFloat(widthNum);
      widthNum = widthNum || width.widthNum;
    }
    unit = unit || width.unit;
    setWidth({ widthNum, unit });
    return `${widthNum || ""}${unit || ""}`;
  };
  return [width, getWidth];
};
const ColumnWidthEditor = ({ value, onChange }) => {
  const [{ widthNum, unit }, getWidth] = useWidth(value);
  return (
    <>
      <div>
        <InputNumber
          onChange={(changeValue) => {
            onChange(getWidth({ widthNum: changeValue }));
          }}
          value={widthNum}
        />
        <Select
          onChange={(changeValue) => {
            onChange(getWidth({ unit: changeValue }));
          }}
          options={WIDTH_MENU}
          value={unit}
        />
      </div>
    </>
  );
};

/**
 * 是、否、表达式（TODO）
 * @param param0
 */
const YN = ({ value, onChange }) => {
  return (
    <Radio.Group
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
      }}
    >
      <Radio value={true}>是</Radio>
      <Radio value={false}>否</Radio>
    </Radio.Group>
  );
};
/**
 * 对齐
 * @param param0
 */
const Align = ({ value, onChange }) => {
  return (
    <Select
      onChange={(changeValue) => {
        onChange(changeValue);
      }}
      value={value}
    >
      <Select.Option value="left">居左</Select.Option>
      <Select.Option value="center">居中</Select.Option>
      <Select.Option value="right">居右</Select.Option>
    </Select>
  );
};
/**
 * 显示数据类型
 * @param param0
 */
const ShowDataType = ({ value, onChange, colDataType }) => {
  const valueMap = {
    realVal: "实际值",
    showVal: "显示值",
  };
  return isReferenceField(colDataType) ? (
    <Select
      className="w-full"
      onChange={(changeValue) => {
        onChange(changeValue);
      }}
      value={value}
    >
      <Select.Option value="realVal">实际值</Select.Option>
      <Select.Option value="showVal">显示值</Select.Option>
    </Select>
  ) : (
    <span className="__label bg_default t_white">{valueMap[value]}</span>
  );
};
/**
 * 列属性编辑面板
 * @param param0
 */
export const ColumnEditableItems: React.FC<ColumnEditableItemsProps> = ({
  defaultValue,
  onChange,
}) => {
  const [data, setData] = useState(defaultValue);
  console.log(data);
  return (
    <div className="column-editor" id="columnEditor">
      <div className="edit-area group-panel-container">
        <div className="item-group">
          <div className="group-title">基本属性</div>
          <div className="items-content">
            <Editor
              title="字段名称"
              children={() => {
                return (
                  <Input
                    value={data.title || ""}
                    onChange={(e) => {
                      const { value } = e.target;
                      if (
                        value &&
                        !/^[a-zA-Z0-9_()\u4e00-\u9fa5]{1,32}$/.test(value)
                      )
                        return;
                      setData({
                        ...data,
                        title: value,
                      });
                    }}
                  />
                );
              }}
            />
            <Editor
              title="字段编码"
              children={() => {
                return (
                  <span className="__label bg_default t_white">
                    {data.fieldCode}
                  </span>
                );
              }}
            />
            <Editor
              title="列宽"
              children={() => {
                return (
                  // <InputNumber
                  //   onChange={(changeValue) => {
                  //     setData({
                  //       ...data,
                  //       width: parseFloat(`${changeValue}`),
                  //     });
                  //   }}
                  //   value={data.width}
                  // />
                  <ColumnWidthEditor
                    value={data.width}
                    onChange={(value) => {
                      setData({
                        ...data,
                        width: value,
                      });
                    }}
                  />
                );
              }}
            />
            <Editor
              title="是否显示"
              children={() => {
                return (
                  <YN
                    value={data.show}
                    onChange={(value) => {
                      setData({
                        ...data,
                        show: value,
                      });
                    }}
                  />
                );
              }}
            />
            <Editor
              title="是否可编辑"
              children={() => {
                return (
                  <YN
                    value={data.editable || false}
                    onChange={(value) => {
                      setData({
                        ...data,
                        editable: value,
                      });
                    }}
                  />
                );
              }}
            />
            <Editor
              title="对齐方式"
              children={() => {
                return (
                  <Align
                    value={data.align || "left"}
                    onChange={(value) => {
                      setData({
                        ...data,
                        align: value,
                      });
                    }}
                  />
                );
              }}
            />
          </div>
        </div>
        <div className="item-group">
          <div className="group-title">列数据源</div>
          <div className="items-content">
            <Editor
              title="表名"
              children={() => {
                return (
                  <span className="__label bg_default t_white">
                    {data.tableTitle}
                  </span>
                );
              }}
            />
            <Editor
              title="数据类型"
              children={() => {
                return (
                  <ShowDataType
                    value={data.fieldShowType}
                    onChange={(value) => {
                      setData({
                        ...data,
                        fieldShowType: value,
                      });
                    }}
                    colDataType={data.colDataType}
                  />
                );
              }}
            />
          </div>
        </div>
      </div>
      <div className="confirm-area">
        <Divider className="divider" />
        <Button
          className="m-2 float-right"
          onClick={(e) => {
            onChange(data);
          }}
        >
          确定
        </Button>
      </div>
    </div>
  );
};
