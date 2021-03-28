import React, { useRef, useContext, useEffect, useState } from "react";
import { Button, Form, Input, Table, Modal, Popconfirm } from "antd";
import { ColumnType } from "antd/lib/table";
import { ThunderboltOutlined } from "@ant-design/icons";
import pinyin4js from "pinyin4js";
import shortid from "shortid";

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
  name: string;
  content: null | {
    code: string;
    simpleCode: string;
    params: string;
    use: string;
  };
}

interface EditableRowProps {
  index: number;
}

export type OpenLowCode = (record: ITableItem) => void;

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

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};

const CreateModal = ({ visible, onOk, onCancel }) => {
  const [name, setName] = useState("");
  return (
    <Modal
      title="新增函数"
      visible={visible}
      onOk={() => {
        if (onOk && name)
          onOk({
            name,
            id: `${pinyin4js.convertToPinyinString(
              name,
              "",
              pinyin4js.WITHOUT_TONE
            )}${shortid.generate().replace(/-/g, "$")}`,
          });
      }}
      onCancel={() => {
        setName("");
        if (onCancel) onCancel();
      }}
      okText="提交"
      cancelText="取消"
      maskClosable
      closable
    >
      <Form {...layout} name="basic">
        <Form.Item label="函数名称" name="name">
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export const PageCommonFuncSelector = ({
  platformCtx,
  pageState,
  updateEntityState,
  changePageState,
}) => {
  const [createVisible, setCreateVisible] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<ITableItem[]>(
    pageState?.commonCodes ? Object.values(pageState?.commonCodes) : []
  );
  const columns: ColumnType<ITableItem>[] = [
    {
      title: "函数名称",
      dataIndex: "name",
      onCell: (record) => ({
        record,
        handleSave,
        editable: true,
        dataIndex: "name",
        title: "函数名称",
      }),
    },
    {
      title: "事件",
      align: "center",
      render: (text, record) => (
        <div style={{ lineHeight: "32px", height: 32 }}>
          <ThunderboltOutlined
            style={record.content ? { color: "#1890ff" } : {}}
            onClick={() => {
              openLowCode(record);
            }}
          />
        </div>
      ),
    },
    {
      title: "操作",
      align: "center",
      render: (text, record) => {
        return (
          <Popconfirm
            title="确认删除函数?"
            onConfirm={() => {
              setDataSource((prevState) => {
                const nextState = prevState.filter(
                  (item) => item.id !== record.id
                );
                changePageState({
                  ...pageState,
                  commonCodes: nextState.reduce((a, b) => {
                    a[b.id] = b;
                    return a;
                  }, {}),
                });
                return nextState;
              });
            }}
            okText="是"
            cancelText="否"
          >
            <Button type="link" size="small">
              删除
            </Button>
          </Popconfirm>
        );
      },
    },
  ];

  const openLowCode: OpenLowCode = (record) => {
    const closeModal = platformCtx.selector.openLowCodeImporter({
      defaultValue:
        pageState.commonCodes && pageState.commonCodes[record.id]
          ? pageState.commonCodes[record.id].content
          : undefined,
      eventType: "CFId",
      platformCtx,
      onSubmit: (lowCodeKey) => {
        const value = pageState.commonCodes || {};
        const newItem: ITableItem = {
          ...record,
          content:
            lowCodeKey.code || lowCodeKey.codeSimple?.code
              ? {
                  code: lowCodeKey.code,
                  simpleCode: lowCodeKey.codeSimple?.code,
                  params: lowCodeKey.codeSimple?.params,
                  use: lowCodeKey.use,
                }
              : null,
        };

        setDataSource((prevState) =>
          prevState.map((item) => {
            if (item.id === record.id) {
              return newItem;
            }
            return item;
          })
        );

        changePageState({
          ...pageState,
          commonCodes: {
            ...value,
            [record.id]: newItem,
          },
        });
        closeModal();
      },
    });
  };

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
    // TODO: 编辑控件属性方法需要 treeNodePath
    updateEntityState?.(id, {
      [dataIndex]: row[dataIndex],
    });
  };

  const onCreateSubmit = (values) => {
    changePageState({
      ...pageState,
      commonCodes: {
        ...pageState.commonCodes,
        [values.id]: {
          ...values,
          content: null,
        },
      },
    });
    setDataSource((prevState) =>
      prevState.concat({
        key: values.id,
        id: values.id,
        name: values.name,
        content: null,
      })
    );
    setCreateVisible(false);
  };

  return (
    <>
      <div style={{ textAlign: "right", padding: "5px 0" }}>
        <Button
          onClick={() => {
            setCreateVisible(true);
          }}
        >
          新建
        </Button>
      </div>
      <Table<ITableItem>
        components={{ body: { row: EditableRow, cell: EditableCell } }}
        bordered
        dataSource={dataSource}
        columns={columns}
        size="small"
      />
      <CreateModal
        visible={createVisible}
        onOk={onCreateSubmit}
        onCancel={() => {
          setCreateVisible(false);
        }}
      />
    </>
  );
};
