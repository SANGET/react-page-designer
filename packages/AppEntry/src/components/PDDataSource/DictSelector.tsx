import React, { useState, useEffect } from "react";
import { Table, Form, Input, Button } from "antd";
import {
  getDictionaryListServices,
  getListOfDictionaryServices,
  getListOfDictionaryChildServices,
} from "@provider-app/provider-app-common/services";
import { SelectedTags } from "./TableSelector";

interface SelectedRowInfo {
  id: string;
  name: string;
  type: string;
}
interface DictSelectorProps {
  /** 提交已选中的项 */
  onSubmit: (allRowInfo: SelectedRowInfo[]) => void;
  defaultSelectedInfo?: SelectedRowInfo[];
  single?: boolean;
}

interface ChildDictListProps {
  defaultSelectedInfo?: SelectedRowInfo[];
  single?: boolean;
  dictId: string;
  onSubmit: (
    allRowInfo: SelectedRowInfo[],
    selectedRowInfo: SelectedRowInfo[],
    rowKeys: React.ReactText[]
  ) => void;
}

const dictColumns = [
  { title: "字典名称", dataIndex: "name", key: "name" },
  { title: "字典描述", dataIndex: "description", key: "description" },
];
const childDictColumns = [
  { title: "编码", dataIndex: "code", key: "code" },
  { title: "名称", dataIndex: "name", key: "name" },
];
type Dict = SelectedRowInfo & { code: string; children: Dict[] };
interface TableConfig {
  params: {
    offset: number;
    size: number;
    total?: number;
    name?: string;
    description?: string;
  };
  list: any[];
}
type GetSubmitData = (
  allRowInfo: SelectedRowInfo[],
  selectedRowInfo: SelectedRowInfo[],
  rowKeys: React.ReactText[]
) => SelectedRowInfo[];
const useDictList = (
  defaultParams = {
    offset: 0,
    size: 10,
  }
): [TableConfig, (params?: TableConfig["params"]) => void] => {
  const [dataList, setList] = useState<TableConfig>({
    params: defaultParams,
    list: [],
  });
  const getListByPaging = (params: TableConfig["params"] = defaultParams) => {
    const { offset = 0, size = dataList.params.size } = params;

    getDictionaryListServices(params).then((resData) => {
      const { total, data } = resData?.result || {};
      setList({
        params: {
          offset,
          size,
          total,
        },
        list: data,
      });
    });
  };
  useEffect(() => {
    getListByPaging();
  }, []);
  return [dataList, getListByPaging];
};
const SearchArea = ({ onSearch }) => {
  const [form] = Form.useForm();
  return (
    <Form
      layout="inline"
      form={form}
      onFinish={(fields) => {
        onSearch(fields);
      }}
    >
      <Form.Item className="w-1/3" name="name" label="字典名称">
        <Input placeholder="请输入字典名称" />
      </Form.Item>
      <Form.Item className="w-1/3" name="description" label="字典描述">
        <Input placeholder="请输入字典描述" />
      </Form.Item>
      <span className="flex"></span>
      <Button htmlType="submit" type="primary">
        搜索
      </Button>
      <Button
        className="ml-2"
        onClick={() => {
          onSearch();
          form.resetFields();
        }}
      >
        清空
      </Button>
    </Form>
  );
};

export const ChildDictList: React.FC<ChildDictListProps> = ({
  dictId,
  defaultSelectedInfo = [],
  single = false,
  onSubmit,
}) => {
  const [list, setList] = useState<Dict[]>([]);
  const constructList = (list) => {
    return list.map((item) => {
      return {
        children: item.hasChild ? [] : null,
        ...item,
      };
    });
  };
  useEffect(() => {
    getListOfDictionaryServices({ id: dictId }).then((res) => {
      setList(constructList(res?.result?.items || []));
    });
  }, []);
  return (
    <Table
      columns={childDictColumns}
      dataSource={list}
      pagination={false}
      rowKey="id"
      rowSelection={{
        selectedRowKeys: defaultSelectedInfo.map((item) => item.id),
        type: single ? "radio" : "checkbox",
        onChange: (rowKeys, rows) => {
          onSubmit(list, rows, rowKeys);
        },
      }}
      expandable={{
        onExpand: (expand, record) => {
          if (!expand) return;
          getListOfDictionaryChildServices({
            dictionaryId: dictId,
            pid: record.id,
          }).then((res) => {
            const dictList = constructList(res?.result || []);
            record.children = dictList;
            setList(list.slice());
          });
        },
      }}
    />
  );
};
export const DictList: React.FC<DictSelectorProps> = ({
  defaultSelectedInfo = [],
  single = false,
  onSubmit,
}) => {
  const [{ params, list }, getTableList] = useDictList();
  const getSubmitData: GetSubmitData = (
    allRows = [],
    selctedRows = [],
    selectedRowKeys = []
  ) => {
    const defaultSelectedKeys = defaultSelectedInfo.map((item) => item.id);
    const plusRows = selctedRows.filter(
      (item) => !defaultSelectedKeys.includes(item.id)
    );
    const minusRowKeys = allRows
      .map((item) => item.id)
      .filter((item) => !selectedRowKeys.includes(item));
    return [
      ...defaultSelectedInfo.filter((item) => !minusRowKeys.includes(item.id)),
      ...plusRows,
    ];
  };
  return (
    <div className="p-4">
      <SearchArea
        onSearch={(fields) => {
          getTableList(fields);
        }}
      />
      <Table
        onChange={(pagination) => {
          getTableList({
            offset: (pagination.current - 1) * pagination.pageSize,
            size: pagination.pageSize,
          });
        }}
        rowSelection={{
          selectedRowKeys: defaultSelectedInfo.map((item) => item.id),
          type: single ? "radio" : "checkbox",
          onChange: (rowKeys, rows) => {
            const submitData = getSubmitData(list, rows, rowKeys);
            onSubmit(submitData);
          },
        }}
        dataSource={list}
        columns={dictColumns}
        pagination={{
          pageSizeOptions: ["10", "20", "30", "40", "50", "100"],
          size: "small",
          showSizeChanger: true,
          showQuickJumper: true,
          total: params.total,
        }}
        rowKey="id"
        size="small"
        scroll={{ y: 340 }}
        // expandable={{
        //   expandedRowRender: (record) => {
        //     return (
        //       <ChildDictList
        //         dictId={record.id}
        //         single={single}
        //         defaultSelectedInfo={defaultSelectedInfo}
        //         onSubmit={(allRows, selectedRows, selectedRowKeys) => {
        //           const submitData = getSubmitData(
        //             allRows,
        //             selectedRows,
        //             selectedRowKeys
        //           );
        //           onSubmit(submitData);
        //         }}
        //       />
        //     );
        //   },
        // }}
      />
    </div>
  );
};

export const DictSelector: React.FC<DictSelectorProps> = ({
  single,
  defaultSelectedInfo = [],
  onSubmit,
}) => {
  return (
    <>
      <DictList
        single={single}
        defaultSelectedInfo={defaultSelectedInfo}
        onSubmit={onSubmit}
      />
      {!single ? (
        <SelectedTags
          defaultSelectedInfo={defaultSelectedInfo}
          onSubmit={onSubmit}
        />
      ) : null}
    </>
  );
};
