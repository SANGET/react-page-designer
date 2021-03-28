import React, { useEffect, useState } from "react";
import { Table, Button } from "antd";
import lowerFirst from "lodash/lowerFirst";
import { BasicValueMeta, VariableItem } from "@provider-app/platform-access-spec";
import { VarAttrTypeMap } from "../constants";
// import { ValueHelper } from "../PDInfraUI";

interface Props {
  platformCtx;
  config: { [key: string]: BasicValueMeta };
  onSuccess: (
    param1: { [key: string]: BasicValueMeta } | null,
    param2: string
  ) => void;
  onCancel: () => void;
}
type VariableRecord = { title: string; id: string; children: VariableItem[] };
type GetVariableList = (options: {
  [key: string]: VariableItem[];
}) => VariableRecord[];
type GetSubmitTitle = (
  param: { [key: string]: BasicValueMeta } | null
) => string;
type GetSubmitArea = () => { [key: string]: BasicValueMeta } | null;
export const ChangeVariables = ({
  platformCtx,
  config: changeVariables,
  onSuccess,
  onCancel,
}: Props) => {
  /** 只有自定义变量和控件变量允许被赋值 */
  const varTypeAllowChange = ["customed", "widget"];
  /** 自定义变量和控件变量数据 */
  const [variableList, setVariableList] = useState<VariableRecord[]>([]);
  /** 当前页面变量数据 */
  const [variableData, setVariableData] = useState<{
    [key: string]: VariableItem[];
  }>({});
  /** 展开数据 */
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  /** 被记录的变更数据 */
  const [changeArea, setChangeArea] = useState<{
    [key: string]: BasicValueMeta;
  }>({});

  /**
   * 实时读取最新变量列表
   */
  const getVariableList: GetVariableList = (data) => {
    return [
      { title: "自定义变量", id: "customed", children: data.customed },
      { title: "控件变量", id: "widget", children: data.widget },
    ].filter((item) => item.children?.length > 0);
  };

  /**
   * 初始化变量列表
   */
  const initVariableList = () => {
    platformCtx.meta.getVariableData(["page", "pageInput"]).then((res) => {
      setVariableList(getVariableList(res));
      setExpandedKeys(varTypeAllowChange);
    });
  };

  useEffect(() => {
    initVariableList();
    setChangeArea(changeVariables || {});
    /** 获取当前页面变量 */
    platformCtx.meta.getVariableData([]).then((res) => {
      setVariableData(res);
    });
  }, []);

  /**
   * 获取提交标题
   * @param submitArea
   */
  const getSubmitTitle: GetSubmitTitle = (submitArea) => {
    if (!submitArea) return "";
    const title = [
      ...(variableData.customed || []),
      ...(variableData.widget || []),
    ]
      .filter((item) => item.id in submitArea)
      .map((item) => item.title)
      .join(",");
    return title;
  };
  /**
   * 获取待提交数据，用户手动清楚配置则视为无配置
   */
  const getSubmitArea: GetSubmitArea = () => {
    const hasItemChanged = (item) => {
      return ["exp", "realVal", "variable"].some((key) => !!item[key]);
    };
    const result = {};
    Object.keys(changeArea).forEach((key) => {
      const item = changeArea[key];
      const hasIChanged = hasItemChanged(item);
      if (hasIChanged) {
        result[key] = item;
      }
    });

    return Object.keys(result).length > 0 ? result : null;
  };
  /**
   * 提交数据
   */
  const handleSubmit = () => {
    const submitArea = getSubmitArea();
    const submitTitle = getSubmitTitle(submitArea);
    if (typeof onSuccess === "function") {
      onSuccess(submitArea, `更改：${submitTitle}`);
    }
  };

  /**
   * 清空
   */
  const handleReset = () => {
    setChangeArea({});
  };

  /**
   * 取消
   */
  const handleCancel = () => {
    onCancel();
  };
  return (
    <div className="page-change-variables">
      <Table
        columns={[
          {
            dataIndex: "title",
            title: "变量名称",
            ellipsis: { showTitle: true },
            className: "cursor-pointer",
            width: 200,
          },
          {
            dataIndex: "code",
            title: "变量编码",
            ellipsis: { showTitle: true },
            className: "cursor-pointer",
            width: 200,
            render: (_t) => lowerFirst(_t),
          },
          {
            dataIndex: "varType",
            title: "类型",
            width: 100,
            align: "center",
            render: (_t) => VarAttrTypeMap[_t],
          },
          {
            dataIndex: "id",
            title: "值",
            width: 320,
            render: (_t) => {
              return varTypeAllowChange.includes(_t) ? null : (
                <ValueHelper
                  platformCtx={platformCtx}
                  editedState={changeArea[_t] || {}}
                  onChange={(changeVariable) => {
                    setChangeArea({
                      ...changeArea,
                      [_t]: changeVariable,
                    });
                  }}
                  variableData={variableData}
                />
              );
            },
          },
        ]}
        expandable={{
          expandedRowKeys: expandedKeys,
          onExpand: (expanded, record) => {
            if (expanded) {
              setExpandedKeys([record.id, ...expandedKeys]);
            } else {
              setExpandedKeys(
                expandedKeys.filter((item) => item !== record.id)
              );
            }
          },
        }}
        scroll={{ y: 440 }}
        pagination={false}
        size="small"
        dataSource={variableList}
        rowKey="id"
      />
      <div className="flex mt-2">
        <div className="flex"></div>
        <Button htmlType="button" className="mr-2" onClick={handleReset}>
          清空
        </Button>
        <Button className="mr-2" type="primary" onClick={handleSubmit}>
          确定
        </Button>
        <Button htmlType="button" onClick={handleCancel}>
          取消
        </Button>
      </div>
    </div>
  );
};
