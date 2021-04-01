import React, { ReactElement } from "react";
import { Select } from "antd";
import zhCN from "antd/es/date-picker/locale/zh_CN";
import "dayjs/locale/zh-cn";
import dayjs, { Dayjs } from "dayjs";
import dayjsGenerateConfig from "rc-picker/lib/generate/dayjs";
import generatePicker from "antd/es/date-picker/generatePicker";
import {
  ChangeEntityState,
  PropItemRenderContext,
} from "@provider-app/platform-access-spec";

const DatePicker = generatePicker<Dayjs>(dayjsGenerateConfig);
/**
 * 可用的值的类型
 */
const SELECT_TIME_OPTIONS = [
  { label: "默认值", key: "defValue", value: "defValue" },
  { label: "表达式", key: "expression", value: "expression" },
  { label: "数据联动", key: "linkage", value: "linkage" },
];
const FULLTIME = "fullTime";

/**
 * ValueHelperProps
 */
interface ValueHelperProps extends PropItemRenderContext {
  editingWidgetState;
  changeEntityState: ChangeEntityState;
}

/**
 * 对应着变量的类型，用于生成不同的代码
 * 1. stateVar 挂在在 state 的变量，默认会生成对应的 onChange 方法
 */
type VarType = "stateVar";

/**
 * ValueHelper
 * @param param0
 */
export const ValueHelper: React.FC<ValueHelperProps> = ({
  editingWidgetState,
  platformCtx,
  changeEntityState,
}) => {
  const { exp, realVal, linkage, timeMode, timeType } = editingWidgetState;
  const defaultSelectedItem = (() => {
    // 筛选策略
    if (exp) return "expression";
    if (linkage) return "linkage";
    return "defValue";
  })();

  const [selectedItem, setSelectedItem] = React.useState(defaultSelectedItem);
  let Comp: ReactElement | null | undefined;

  if (selectedItem === "defValue") {
    const getValue = () => {
      if (realVal) {
        return { value: dayjs(realVal) };
      }
      return {};
    };
    const getShowTime = () => {
      if (timeMode === FULLTIME) {
        return { showTime: true };
      }
      return {};
    };
    const getPicker = () => {
      if (timeMode === FULLTIME) return {};
      return { picker: timeMode };
    };
    const handleChange = (value) => {
      changeEntityState([
        {
          value:
            timeType === "string"
              ? value?.format("YYYY-MM-DD HH:mm:ss")
              : value?.valueOf(),
          attr: "realVal",
        },
        /** 需要将 value 清空 */
        { value: null, attr: "exp" },
        { value: null, attr: "linkage" },
      ]);
    };
    Comp = (
      <DatePicker
        allowClear={true}
        className="w-full"
        placeholder="请选择"
        locale={zhCN}
        onOk={handleChange}
        onChange={handleChange}
        {...getValue()}
        {...getShowTime()}
        {...getPicker()}
      />
    );
  } else if (selectedItem === "expression") {
    Comp = (
      <div
        className="px-4 border"
        style={{ height: "34px", lineHeight: "34px" }}
        onClick={() => {
          const closeModal = platformCtx.selector.openExpressionImporter({
            defaultValue: exp?.id ? { id: exp.id || "" } : null,
            onSubmit: (newExp) => {
              changeEntityState([
                {
                  value: newExp?.id
                    ? { id: newExp.id, targetAttr: "realVal" }
                    : null,
                  attr: "exp",
                },
                /** 需要将 value 清空 */
                { value: null, attr: "realVal" },
                { value: null, attr: "linkage" },
              ]);
              closeModal();
            },
          });
        }}
      >
        {exp ? "已设置表达式" : "点击设置表达式"}
      </div>
    );
  } else if (selectedItem === "linkage") {
    Comp = (
      <div
        className="px-4 border"
        style={{ height: "34px", lineHeight: "34px" }}
      >
        待开发
      </div>
    );
  }

  return (
    <div className="value-helper">
      <div className="mb-2">
        <Select
          value={selectedItem}
          onChange={(val) => setSelectedItem(val)}
          style={{ width: "100%" }}
          options={SELECT_TIME_OPTIONS}
        />
      </div>
      <div>{Comp}</div>
    </div>
  );
};
