import React, { useState } from "react";
import { Input, Select, Cascader } from "antd";
import { PropItemRenderContext, VariableItem } from "@provider-app/platform-access-spec";
import { construct } from "@provider-app/provider-app-common/utils/tools";

/**
 * 可用的值的类型
 */
const SELECT_TYPE_MENU = [
  { label: "自定义", value: "realVal", key: "realVal" },
  { label: "表达式", value: "exp", key: "exp" },
  { label: "变量", value: "variable", key: "variable" },
];
/**
 * ValueHelperProps
 */
interface ValueHelperProps {
  platformCtx: PropItemRenderContext["platformCtx"];
  editedState;
  onChange;
  variableData?: VariableItem[];
}

// interface VariableItemInState {
//   title: string;
//   value: string;
//   disabled?: boolean;
// }

// interface VariableListInState extends VariableItemInState {
//   children?: VariableItemInState[];
// }
/**
 * ValueHelper
 * @param param0
 */
export const ValueHelper: React.FC<ValueHelperProps> = ({
  platformCtx,
  variableData,
  editedState,
  onChange,
  realValComp: RealValComp
}) => {
  const getExactKey = () => {
    let key = "realVal";
    const keyList = ["realVal", "variable", "exp"];
    Object.keys(editedState).forEach((item) => {
      if (
        [null, undefined, ""].includes(editedState[item]) ||
        !keyList.includes(item)
      )
        return;
      key = item;
    });
    return key;
  };
  const getVarList = () => {
    if (variableData) return variableData;
    return construct(platformCtx.meta.getVariableData(), {
      mapping: { label: "title", value: "id" },
    });
  };
  const varList = getVarList();
  const [selectedItem, setSelectedItem] = useState(getExactKey());
  const { exp, realVal, variable } = editedState;
  const initVariableList = () => {
    const constructVarList = (list: VariableItem[]) => {
      return Array.isArray(list)
        ? list.map((item) => constructVarItem(item))
        : [];
    };
    const constructVarItem = (item: VariableItem) => {
      const { id, title } = item;
      return { ...item, value: id, title };
    };
    return [
      {
        title: "自定义变量",
        value: "customed",
        key: "customed",
        variableList: variableData.customed,
        disabled: true,
      },
      {
        title: "页面变量",
        value: "page",
        key: "page",
        variableList: variableData.page,
        disabled: true,
      },
      {
        title: "系统变量",
        value: "system",
        key: "system",
        variableList: variableData.system,
        disabled: true,
      },
      {
        title: "控件变量",
        value: "widget",
        key: "widget",
        variableList: variableData.widget,
        disabled: true,
      },
      {
        title: "输入参数变量",
        value: "pageInput",
        key: "pageInput",
        variableList: variableData.pageInput,
        disabled: true,
      },
    ]
      .filter((item) => item.variableList?.length > 0)
      .map((item) => {
        const { variableList, ...rest } = item;
        return { ...rest, children: constructVarList(variableList) };
      });
  };
  /** 实现 变量 的 Cascader 值回显，根据唯一标识查找在 树形结构中的链路 */
  const getVariablePath = (variableParam) => {
    if (!variableParam) return [];
    const list: string[] = [];
    /** 找出所有链路: ['a/b', 'a', 'a/b/c'] */
    const genVar = (path, varListTmpl) => {
      varListTmpl?.forEach(({ id, children }) => {
        const pathTmpl = path ? `${path}/${id}` : id;
        list.push(pathTmpl);
        genVar(pathTmpl, children);
      });
      return list;
    };
    const varTmpl = genVar("", varList);
    /** 最后一个节点为该数据 */
    const reg = new RegExp(`/${variableParam}$`);
    const target = varTmpl.filter((item) => reg.test(item))[0];
    return target?.split("/") || [];
  };
  const returnComp = () => {
    if (selectedItem === "realVal") {
      if(RealValComp){
        return (
          <span>
            <RealValComp
            value={realVal}
            style={{ width: "calc( 100% - 83px )" }}
             onChange={(value)=>{
              onChange({
                exp: "",
                realVal: value || "",
                variable: "",
              });
            }}
            />
          </span>
        );
      }
      return (
        <Input
          className="custom-value"
          value={realVal || ""}
          onChange={(e) =>
            onChange({
              exp: "",
              realVal: e.target?.value || "",
              variable: "",
            })
          }
        />
      );
    }
    if (selectedItem === "exp") {
      return (
        <div
          className="custom-value px-4 py-2 border"
          style={{ display: "inline-block", height: 34 }}
          onClick={() => {
            const closeModal = platformCtx.selector.openExpressionImporter({
              defaultValue: { id: exp },
              onSubmit: (newExp) => {
                onChange({
                  exp: newExp?.id ? newExp.id : "",
                  realVal: "",
                  variable: "",
                });
                // onChange([
                //   {
                //     value: newExp.code && newExp.variable ? newExp : "",
                //     attr: "exp",
                //   },
                //   /** 需要将 value 清空 */
                //   { value: "", attr: "realVal" },
                //   { value: "", attr: "variable" },
                // ]);
                closeModal();
              },
            });
          }}
        >
          {exp ? "已设置表达式" : "点击设置表达式"}
        </div>
      );
    }
    if (selectedItem === "variable") {
      return (
        // <TreeSelect
        //   value={variable || ""}
        //   className="variable-selector py-1 cursor-pointer"
        //   showSearch
        //   filterTreeNode={(valueFilter, treeNode) => {
        //     return (
        //       (treeNode?.title || "").toString().includes(valueFilter) || false
        //     );
        //   }}
        //   onChange={(value) =>
        //     onChange({
        //       exp: "",
        //       realVal: "",
        //       variable: value,
        //     })
        //   }
        //   treeDefaultExpandAll
        //   treeData={initVariableList()}
        // />
        <Cascader
          style={{ width: "calc( 100% - 70px )" }}
          value={getVariablePath(variable || "")}
          // value={variable}
          options={varList || []}
          placeholder="选择变量"
          showSearch={{
            filter: (inputValue, path) => {
              return path.some(
                (option) =>
                  (option?.label || "")
                    ?.toLowerCase()
                    ?.indexOf(inputValue?.toLowerCase()) > -1
              );
            },
          }}
          displayRender={(label) => label.join("_")}
          onChange={(values, options) => {
            onChange({
              exp: "",
              realVal: "",
              variable: values?.[values?.length - 1],
              // variable: values,
              variableConfig: options?.[options?.length - 1],
            });
          }}
        />
      );
    }
    return null;
  };
  return (
    <div className="value-helper">
      <span>{returnComp()}</span>
      <span className="value-type-selector">
        <Select
          options={SELECT_TYPE_MENU}
          onChange={(val) => {
            onChange({
              exp: "",
              realVal: "",
              variable: "",
            });
            setSelectedItem(val);
          }}
          value={selectedItem}
        />
      </span>
    </div>
  );
};
