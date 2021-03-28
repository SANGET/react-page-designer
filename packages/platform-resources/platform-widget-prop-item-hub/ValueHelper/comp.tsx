import React, { ReactElement } from "react";
import { Input, Select } from "antd";
import {
  ChangeEntityState,
  PropItemRenderContext,
} from "@provider-app/platform-access-spec";

/**
 * 可用的值的类型
 */
const selectTypes = {
  defValue: "默认值",
  expression: "表达式",
  linkage: "数据联动",
};

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
 * 实际值的结构
 */
interface RealValStruct {
  /** 变量类型 */
  type: VarType;
  /** 默认值 */
  defValue: string;
}

/**
 * ValueHelper
 * @param param0
 */
export const ValueHelper: React.FC<ValueHelperProps> = ({
  editingWidgetState,
  platformCtx,
  changeEntityState,
}) => {
  const { exp, realVal, linkage } = editingWidgetState;
  const defaultSelectedItem = (() => {
    // 筛选策略
    if (exp) return "expression";
    if (linkage) return "linkage";
    return "defValue";
  })();

  const [selectedItem, setSelectedItem] = React.useState(defaultSelectedItem);
  let Comp: ReactElement | null | undefined;

  if (selectedItem === "defValue") {
    Comp = (
      <Input
        value={realVal || ""}
        onChange={(value) => {
          // const nextRealVal: RealValStruct = {
          //   // 对应了生成代码的规则
          //   type: "stateVar",
          //   defValue: value,
          // };
          changeEntityState([
            {
              value: value.target.value,
              attr: "realVal",
            },
            /** 需要将 value 清空 */
            { value: null, attr: "exp" },
            { value: null, attr: "linkage" },
          ]);
        }}
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
        >
          {Object.keys(selectTypes).map((type) => {
            const label = selectTypes[type];
            return (
              <Select.Option value={type} key={type}>
                {label}
              </Select.Option>
            );
          })}
        </Select>
      </div>
      <div>{Comp}</div>
    </div>
  );
};
