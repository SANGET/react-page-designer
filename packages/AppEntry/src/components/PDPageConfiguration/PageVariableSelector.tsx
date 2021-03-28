import React, { useEffect, useState } from "react";
import { Table, Button } from "antd";
import lowerFirst from "lodash/lowerFirst";
import { ShowModal, CloseModal } from "@deer-ui/core";
import { nanoid } from "nanoid";
import { PlatformCtx, VariableItem } from "@provider-app/platform-access-spec";
import { construct } from "@provider-app/provider-app-common/utils/tools";
import { VariableEditor } from "./PageVariableEditor";

interface Props {
  platformCtx: PlatformCtx;
  pageMetadata;
}
export type VariableRecord = {
  title: string;
  id: string;
  children: VariableItem[];
};
/**
 * 获取变量项索引
 * @param item 变量项
 */
const getOrder = (item) => {
  return item.id.split("_")[2] - 0;
};
export type GetVariableList = (options: {
  [key: string]: VariableItem[];
}) => VariableRecord[];
type OpenModalUpdateParam = { mode: "UPDATE"; record: VariableRecord };
type OpenModalInsertParam = { mode: "INSERT"; record?: undefined };
type OpenModal = (
  param: OpenModalUpdateParam | OpenModalInsertParam
) => Promise<VariableRecord>;

const VarAttrTypeMap = {
  string: "字符串",
  number: "数字",
  date: "日期",
  dateTime: "日期时间",
};
export const PageVariableSelector = (props: Props) => {
  const { platformCtx, pageMetadata } = props;
  // const [variableList, setVariableList] = useState<VariableRecord[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([
    "page",
    "widget",
    "pageInput",
  ]);
  /**
   * 对列表数据进行排序，由于新增按钮在表头，所以按 唯一标识中的索引值 降序处理
   */
  const sortList = (list: VariableItem[]): VariableItem[] => {
    return list.sort((a, b) => {
      return getOrder(b) - getOrder(a);
    });
  };
  /**
   * 实时读取最新变量列表
   */
  const getVariableList: GetVariableList = (variableData) => {
    return [
      { title: "页面变量", id: "page", children: variableData.page },
      { title: "控件变量", id: "widget", children: variableData.widget },
      {
        title: "输入参数变量",
        id: "pageInput",
        children: sortList(variableData.pageInput),
      },
    ];
  };
  // useEffect(() => {
  //   // initVariableList();
  // }, [pageMetadata]);
  const variableList = construct(platformCtx.meta.getVariableData());

  /**
   * 初始化变量列表
   */
  // const initVariableList = () => {
  //   platformCtx.meta.getVariableData([]).then((res) => {
  //     setVariableList(getVariableList(res));
  //   });
  //   setExpandedKeys(["page", "widget", "pageInput"]);
  // };
  /**
   * 操作列渲染
   */
  const actionRenderer = (record) => {
    /** 变量项支持编辑和删除 */
    if (["pageInput"].includes(record.type)) {
      return (
        <>
          <Button
            type="link"
            size="small"
            onClick={() => {
              handleEdit(record);
            }}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              handleDelete(record);
            }}
          >
            删除
          </Button>
        </>
      );
    }
    /** 变量类型，支持新增变量项 */
    if (["pageInput"].includes(record.id)) {
      return (
        <Button
          type="link"
          size="small"
          onClick={() => {
            handlePlus(record);
          }}
        >
          新增
        </Button>
      );
    }
    return null;
  };
  /**
   * 打开编辑变量弹窗（支持新增或编辑）
   */
  const openModal: OpenModal = ({ mode, record }) => {
    return new Promise((resolve, reject) => {
      const modalID = ShowModal({
        title: "配置变量",
        width: 900,
        children: () => {
          return (
            <div className="p-5">
              <VariableEditor
                getVariableData={platformCtx.meta.getVariableData}
                mode={mode}
                data={record}
                onSuccess={(data) => {
                  resolve(data);
                  CloseModal(modalID);
                }}
                onCancel={() => {
                  CloseModal(modalID);
                }}
              />
            </div>
          );
        },
      });
    });
  };
  /**
   * 根据现有列表数据，产生新的索引（由于变量可支持删除，所以不能直接由 长度+1 得出新的索引）
   * @param record
   */
  const newOrder = (record) => {
    if (
      "children" in record &&
      Array.isArray(record.children) &&
      record.children.length > 0
    ) {
      return getOrder(record.children[0]) + 1;
    }
    return 0;
  };
  /**
   * 新增变量
   * @param record
   * @param mode
   */
  const handlePlus = (record: VariableRecord) => {
    const { id: type } = record;
    openModal({ mode: "INSERT" }).then((data) => {
      const metaID = `var_${type}_${newOrder(record)}_${nanoid(8)}`;
      platformCtx.meta.changePageMeta({
        type: "update",
        metaAttr: "varRely",
        data: { ...data, type },
        metaID,
      });
      // initVariableList();
      setExpandedKeys([type, ...expandedKeys]);
    });
  };
  /**
   * 修改变量
   * @param record
   * @param mode
   */
  const handleEdit = (record: VariableRecord) => {
    const { id, ...oldData } = record;
    openModal({ mode: "UPDATE", record }).then((data) => {
      platformCtx.meta.changePageMeta({
        type: "update",
        metaAttr: "varRely",
        data: { ...oldData, ...data },
        metaID: id,
      });
      // initVariableList();
    });
  };
  /**
   * 删除变量
   * @param record
   */
  const handleDelete = (record: VariableRecord) => {
    platformCtx.meta.changePageMeta({
      metaAttr: "varRely",
      rmMetaID: record.id,
      type: "rm",
    });
    // initVariableList();
  };
  return (
    <div className="page-var-selector">
      <Table
        columns={[
          {
            dataIndex: "title",
            title: "变量名称",
            ellipsis: { showTitle: true },
            className: "cursor-pointer",
            width: 175,
          },
          {
            dataIndex: "code",
            title: "变量编码",
            ellipsis: { showTitle: true },
            className: "cursor-pointer",
            width: 175,
            // render: (_t) => lowerFirst(_t),
          },
          {
            dataIndex: "varType",
            title: "类型",
            width: 100,
            align: "center",
            render: (_t) => {
              return VarAttrTypeMap[_t];
            },
          },
          // {
          //   dataIndex: "alias",
          //   title: "描述",
          //   width: 250,
          //   align: "center",
          // },
          {
            dataIndex: "action",
            title: "操作",
            width: 120,
            render: (_, record) => {
              return actionRenderer(record);
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
    </div>
  );
};
