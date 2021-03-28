import React, { useRef, useContext, useEffect, useState } from "react";
import { Checkbox, Table, Alert, Select, Space } from "antd";
import { ColumnType } from "antd/lib/table";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
// import { PageConfigContainerProps } from "./PageConfigContainer";
interface IProps {
  pageMetadata;
  // [key: string]: string;
}

const { Option } = Select;
export const PageAttachedTableSelector: React.FC<IProps> = (props) => {
  const [data, setData] = useState([]);

  const columns = [
    {
      title: "附属表名称",
      dataIndex: "name",
    },
    {
      title: "附属表表名",
      dataIndex: "code",
    },
    {
      title: "显示",
      dataIndex: "_show",
      align: "center",
      render: (text) => <Checkbox checked={!!text} disabled />,
    },
    {
      title: "必填",
      dataIndex: "_write",
      align: "center",
      render: (text) => <Checkbox checked={!!text} disabled />,
    },
    {
      title: "只读",
      dataIndex: "_read",
      align: "center",
      render: (text) => <Checkbox checked={!!text} disabled />,
    },
    {
      title: "新增",
      dataIndex: "_add",
      align: "center",
      render: (text) => <Checkbox checked={!!text} disabled />,
    },
    {
      title: "最大行数",
      dataIndex: "max_row",
    },
    {
      title: "复制",
      dataIndex: "_copy",
      align: "center",
      render: (text) => <Checkbox checked={!!text} disabled />,
    },
    {
      title: "删除",
      dataIndex: "_remove",
      align: "center",
      render: (text) => <Checkbox checked={!!text} disabled />,
    },
    {
      title: "显示格式",
      dataIndex: "format",
      width: 120,
      render: () => (
        <Select style={{ width: "100%" }} disabled>
          <Option value={1}>列表形式</Option>
          <Option value={2}>表单形式</Option>
        </Select>
      ),
    },
  ];

  const fieldColumns = [
    {
      title: "序号",
      dataIndex: "index",
    },
    {
      title: "字段名称",
      dataIndex: "name",
    },
    {
      title: "字段编码",
      dataIndex: "fieldCode",
    },
    {
      title: "显示",
      dataIndex: "field_show",
      render: (text) => <Checkbox checked={!!text} disabled />,
    },
    {
      title: "必填",
      dataIndex: "field_write",
      render: (text) => <Checkbox checked={!!text} disabled />,
    },
    {
      title: "只读",
      dataIndex: "field_read",
      render: (text) => <Checkbox checked={!!text} disabled />,
    },
    {
      title: "列宽",
      dataIndex: "field_width",
    },
    {
      title: "换行显示",
      dataIndex: "field_index",
      render: () => (
        <Select style={{ width: "100%" }} disabled>
          <Option value={1}>是</Option>
          <Option value={2}>否</Option>
        </Select>
      ),
    },
    {
      title: "对齐方式",
      dataIndex: "field_lineBreak",
      render: () => (
        <Select style={{ width: "100%" }} disabled>
          <Option value={1}>左对齐</Option>
          <Option value={2}>居中</Option>
          <Option value={3}>右对齐</Option>
        </Select>
      ),
    },
    {
      title: "操作",
      align: "center",
      render: (text, record) => (
        <Space>
          <ArrowUpOutlined />
          <ArrowDownOutlined />
        </Space>
      ),
    },
  ];

  const expandedRowRender = (record) => {
    return (
      <Table
        className="components-table-demo-nested"
        columns={fieldColumns}
        dataSource={record.columns || []}
        size="small"
      />
    );
  };

  const initAttachedTable = () => {
    const {
      pageMetadata: { dataSource },
    } = props;
    setData(
      Object.values(dataSource)
        .filter((item) => item.tableType === "AUX_TABLE")
        .map((item) => ({
          id: item.id,
          key: item.id,
          name: item.name,
          code: item.code,
          columns: Object.values(item.columns).map((column, index) => ({
            index: index + 1,
            id: column.id,
            key: column.id,
            name: column.name,
            fieldCode: column.fieldCode,
          })),
        }))
    );
  };

  useEffect(() => {
    initAttachedTable();
  }, []);

  return (
    <>
      <Alert
        style={{ margin: "5px 0" }}
        message="注：显示，必填，只读，所属分组（属性）属于 3.2"
        type="info"
        showIcon
        closable
      />
      <Table
        className="components-table-demo-nested"
        columns={columns}
        expandable={{ expandedRowRender }}
        dataSource={data}
        size="small"
        scroll={{ x: 1000 }}
      />
    </>
  );
};
