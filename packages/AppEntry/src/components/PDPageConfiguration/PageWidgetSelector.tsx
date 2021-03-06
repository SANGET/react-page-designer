import React, { useRef, useContext, useEffect, useState } from "react";
import { Checkbox, Form, Input, Table, Alert } from "antd";
import { ColumnType } from "antd/lib/table";
import { ThunderboltOutlined } from "@ant-design/icons";
import { FlatLayoutItems } from "@provider-app/page-visual-editor-engine/data-structure";
// import { PageConfigContainerProps } from "./PageConfigContainer";
interface IProps {
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
  _show: boolean;
  _group: string;
  _write: boolean;
  _read: boolean;
  widgetItem: Record<string, FlatLayoutItems>;
  treeNodePath: Record<string, FlatLayoutItems>["treeNodePath"];
}
interface EditableRowProps {
  index: number;
}

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
export const PageWidgetSelector: React.FC<IProps> = (props) => {
  const [dataSource, setDataSource] = useState<ITableItem[]>([]);
  const columns: ColumnType<ITableItem>[] = [
    {
      title: "????????????",
      dataIndex: "title",
      width: 214,
      onCell: (record) => ({
        record,
        handleSave,
        editable: true,
        dataIndex: "title",
        title: "????????????",
      }),
    },
    {
      title: "????????????",
      dataIndex: "widgetCode",
    },
    {
      title: "??????",
      dataIndex: "_show",
      align: "center",
      render: (text) => <Checkbox checked={!!text} disabled />,
    },
    // TODO: ?????????????????????????????????
    {
      title: "??????",
      dataIndex: "widgetRef",
    },
    {
      title: "????????????",
      dataIndex: "_group",
      align: "center",
    },
    {
      title: "??????",
      dataIndex: "_write",
      align: "center",
      render: (text) => <Checkbox checked={!!text} disabled />,
    },
    {
      title: "??????",
      dataIndex: "_read",
      align: "center",
      render: (text) => <Checkbox checked={!!text} disabled />,
    },
    {
      title: "??????",
      align: "center",
      render: (text, record) => (
        <div style={{ lineHeight: "32px", height: 32 }}>
          <ThunderboltOutlined />
        </div>
      ),
    },
  ];
  const handleSave = (row, dataIndex) => {
    const { id } = row;
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setDataSource(newData);
    // TODO: ?????????????????????????????? treeNodePath
    props.updateEntityState?.(id, {
      [dataIndex]: row[dataIndex],
    });
  };

  const initWidget = () => {
    setDataSource(
      Object.values(props.flatLayoutItems)
        .filter((item) => item.widgetRef !== "FormButton")
        .map((item) => {
          const {
            id,
            treeNodePath,
            widgetRef,
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
            // TODO: ?????????????????? 3.2
            _group: "",
            _show: false,
            _write: false,
            _read: false,
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
        message="??????????????????????????????????????????????????????????????? 3.2"
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
