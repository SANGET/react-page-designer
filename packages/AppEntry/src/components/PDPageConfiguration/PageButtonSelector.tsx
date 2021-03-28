import React, { useRef, useContext, useEffect, useState } from "react";
import { Checkbox, Form, Input, Table, Alert, Select, Button } from "antd";
import { ColumnType } from "antd/lib/table";
import { ThunderboltOutlined } from "@ant-design/icons";
import { FlatLayoutItems } from "@provider-app/page-visual-editor-engine/data-structure";
// import { PageConfigContainerProps } from "./PageConfigContainer";
interface IProps {
  delEntity;
  updateEntityState;
  flatLayoutItems: {
    [key: string]: Record<string, FlatLayoutItems>;
  };
}
interface Item {
  key: string;
  name: string;
  age: string;
  address: string;
}
interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  children: React.ReactNode;
  dataIndex: string;
  record: Item;
  handleSave: (record: Item, dataIndex: string) => void;
}
interface ITableItem {
  key: string;
  id: string;
  title: string;
  widgetCode: string;
  widgetRef: string;

  _icon: string;
  _type: string;
  _show: boolean;
  _showType: string;
  _disabled: boolean;
}
interface EditableRowProps {
  index: number;
}

const { Option } = Select;

const EditableContext = React.createContext<any>(null);

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

const EditableCell: React.FC<EditableCellProps> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({ ...record, ...values }, dataIndex);
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} is required.`,
          },
        ]}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ paddingRight: 24 }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};
export const PageButtonSelector: React.FC<IProps> = (props) => {
  const { delEntity } = props;
  const [dataSource, setDataSource] = useState<ITableItem[]>([]);
  const columns: ColumnType<ITableItem>[] = [
    {
      title: "标题",
      dataIndex: "title",
      width: 214,
      onCell: (record) => ({
        handleSave,
        record,
        editable: true,
        dataIndex: "title",
        title: "控件标题",
      }),
    },
    {
      title: "图标",
      dataIndex: "_icon",
    },
    {
      title: "编码",
      dataIndex: "widgetCode",
    },
    {
      title: "按钮类型",
      dataIndex: "widgetRef",
      render: (text) => (text === "FormButton" ? "自定义按钮" : ""),
    },
    {
      title: "显示",
      dataIndex: "_show",
      align: "center",
      render: (text) => <Checkbox checked={!!text} disabled />,
    },
    {
      title: "显示情况",
      dataIndex: "_showType",
      width: 120,
      render: () => (
        <Select style={{ width: "100%" }} disabled>
          <Option value={1}>图标</Option>
          <Option value={2}>标题</Option>
          <Option value={3}>图标 + 标题</Option>
        </Select>
      ),
    },
    {
      title: "禁用",
      dataIndex: "_disabled",
      align: "center",
      render: (text) => <Checkbox checked={!!text} disabled />,
    },
    {
      title: "操作",
      align: "center",
      render: (text, record) => {
        // console.log(record);
        const { id } = record;
        return (
          // TODO: 删除自定义按钮
          <Button
            type="link"
            size="small"
            onClick={(e) => {
              delEntity(id);
            }}
          >
            删除
          </Button>
        );
      },
    },
    {
      title: "事件",
      align: "center",
      render: (text, record) => (
        <span>
          <ThunderboltOutlined />
        </span>
      ),
    },
  ];
  const handleSave = (row, dataIndex) => {
    // console.log(row);
    const { id } = row;
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setDataSource(newData);
    // TODO: 编辑按钮属性方法需要 treeNodePath
    props.updateEntityState?.(id, {
      [dataIndex]: row[dataIndex],
    });
  };

  const initWidget = () => {
    setDataSource(
      Object.values(props.flatLayoutItems)
        .filter((item) => item.widgetRef === "FormButton")
        .map((item) => {
          const {
            id,
            widgetRef,
            treeNodePath,
            propState: { title, widgetCode },
          } = item;
          return {
            id,
            title,
            widgetCode,
            widgetRef,
            treeNodePath,
            key: id,
            widgetItem: item,
            // TODO: 以下参数属于 3.2
            _icon: "",
            _type: "",
            _showType: "",
            _show: false,
            _disabled: false,
          };
        })
    );
  };

  useEffect(() => {
    initWidget();
  }, [props.flatLayoutItems]);

  return (
    <>
      <Alert
        style={{ margin: "5px 0" }}
        message="注：图标，显示，显示情况，禁用（属性）属于 3.2"
        type="info"
        showIcon
        closable
      />
      <Table<ITableItem>
        components={{ body: { row: EditableRow, cell: EditableCell } }}
        bordered
        dataSource={dataSource}
        columns={columns}
        size="small"
      />
    </>
  );
};
