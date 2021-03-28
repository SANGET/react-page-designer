import React from "react";
import { Table, Select, Input, Form, Space, Button } from "antd";
import {
  MinusOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import { CloseModal, ShowModal } from "@provider-app/shared-ui";
import { getTableList as getTableListAPI } from "@provider-app/provider-app-common/services";
import { nanoid } from "nanoid";
import { FormInstance } from "antd/lib/form";
import {
  InsertSubmitDataItem,
  DeleteSubmitDataItem,
  UpdateSubmitDataItem,
} from "@provider-app/platform-access-spec";
import { ChangeFields } from "./ChangeFields";

const OPERATE_TYPE_MENU = [
  { label: "新增", key: "insert", value: "insert" },
  { label: "修改", key: "update", value: "update" },
  { label: "删除", key: "delete", value: "delete" },
];

interface IProps {
  onSuccess;
  config;
  onCancel;
}
interface IState {
  list: (InsertSubmitDataItem | DeleteSubmitDataItem | UpdateSubmitDataItem)[];
  listForShow: (
    | InsertSubmitDataItem
    | DeleteSubmitDataItem
    | UpdateSubmitDataItem
  )[];
  maxIndex: number;
  tableList: { label: string; value: string; key: string }[];
}
export class SubmitData extends React.Component<IProps, IState> {
  state: IState = {
    list: [],
    listForShow: [],
    maxIndex: -1,
    tableList: [],
  };

  listFormRef = React.createRef<FormInstance>();

  searchFormRef = React.createRef<FormInstance>();

  /**
   * 初始化数据表列表
   */
  getTableList = () => {
    getTableListAPI().then((res) => {
      this.setState({
        tableList:
          (res?.result?.data || []).map((item) => {
            return {
              label: item.name,
              key: item.code,
              value: item.id,
            };
          }) || [],
      });
    });
  };

  initActions = () => {
    const { config } = this.props;
    return config || [];
  };

  componentDidMount() {
    this.getTableList();
    const list = this.initActions();
    const maxIndex =
      list.length > 0
        ? Math.max.apply(
            null,
            list.map((item) => this.getOrderById(item.id))
          )
        : this.state.maxIndex;
    console.log(maxIndex);
    this.setState({
      list,
      listForShow: list,
      maxIndex,
    });
    this.listFormRef.current?.setFieldsValue({ list });
  }

  /**
   * 获取提交标题
   */
  getSubmitDataTitle = (): string => {
    const { list } = this.state;
    const operateMap = {
      insert: "新增",
      update: "修改",
      delete: "删除",
    };
    return list
      .map((item) => {
        const { operateType, tableName } = item;
        return `${operateMap[operateType] + tableName}记录`;
      })
      .join("；");
  };

  getOrderById = (id: string) => {
    if (!id) return -1;
    return Number(id.split(".")[2]) - 0;
  };

  getActionId = (index) => {
    return `act.submitData.${index}.${nanoid(8)}`;
  };

  handlePlus = (index) => {
    const { listForShow, list, maxIndex } = this.state;
    const newItem = { id: this.getActionId(maxIndex + 1), index: maxIndex + 1 };
    const newListForShow = [newItem, ...listForShow];
    this.setState({
      listForShow: newListForShow,
      list: [newItem, ...list],
      maxIndex: maxIndex + 1,
    });
    this.listFormRef.current?.setFieldsValue({ list: newListForShow });
  };

  handleMinus = (id) => {
    const list = this.state.list.slice();
    const indexInList = this.getIndexById(list, id);
    list.splice(indexInList, 1);
    const listForShow = this.state.listForShow.slice();
    const indexInListForShow = this.getIndexById(listForShow, id);
    listForShow.splice(indexInListForShow, 1);
    this.setState({
      list,
      listForShow,
    });
    this.listFormRef.current?.setFieldsValue({ list: listForShow });
  };

  handleMoveUp = (index) => {
    const list = this.state.list.slice();
    const prev = list.splice(index - 1, 1);
    list.splice(index, 0, prev[0]);
    this.setState({
      list,
    });
  };

  handleMoveDown = (index) => {
    this.handleMoveUp(index + 1);
  };

  /**
   * 点击确定
   */
  handleFinish = () => {
    const { onSuccess } = this.props;
    typeof onSuccess === "function" &&
      onSuccess(this.state.list, this.getSubmitDataTitle());
  };

  /**
   * 点击取消
   */
  handleCancel = () => {
    const { onCancel } = this.props;
    typeof onCancel === "function" && onCancel();
  };

  /**
   * 点击清空
   */
  handleReset = () => {
    this.setState(
      {
        list: [],
        listForShow: [],
        maxIndex: -1,
      },
      () => {
        this.listFormRef.current?.setFieldsValue({
          list: this.state.listForShow,
        });
      }
    );
  };

  getIndexById = (list, id) => {
    let index = -1;
    list.forEach((item, loopIndex) => {
      if (item.id === id) {
        index = loopIndex;
      }
    });
    return index;
  };

  handleSetValue = (id, data) => {
    const list = this.state.list.slice();
    const listForShow = this.state.listForShow.slice();
    const indexInList = this.getIndexById(list, id);
    const indexInListShow = this.getIndexById(list, id);
    const newData = { ...list[indexInList], ...data };
    list.splice(indexInList, 1, newData);
    listForShow.splice(indexInListShow, 1, newData);
    this.setState({
      list,
      listForShow,
    });
    this.listFormRef.current?.setFieldsValue({ list: listForShow });
  };

  filterOption = (value, option) => {
    return option.label.toLowerCase().includes(value.toLowerCase());
  };

  handleSearch = () => {
    const searchArea = this.searchFormRef.current?.getFieldsValue();
    const listForShow = this.filterListAfterSearch(searchArea);
    this.setState({
      listForShow,
    });
    this.listFormRef.current?.setFieldsValue({ list: listForShow });
  };

  handleClear = () => {
    this.searchFormRef.current?.resetFields();
    this.handleSearch();
  };

  filterListAfterSearch = ({ tableId, operateType }) => {
    const { list } = this.state;
    return list.filter((item) => {
      return (
        (!tableId || item.tableId === tableId) &&
        (!operateType || item.operateType === operateType)
      );
    });
  };

  handleClickChangeFields = (_r) => {
    const modalID = ShowModal({
      title: "配置字段",
      width: 900,
      children: () => {
        return (
          <div className="p-5">
            <ChangeFields
              {...this.props}
              {..._r}
              onSuccess={(changeFields, changeFieldsTitle) => {
                this.handleSetValue(_r.id, { changeFields, changeFieldsTitle });
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
  };

  render() {
    const { listForShow, tableList } = this.state;
    return (
      <div className="page-action-submit-data">
        <Form
          className="search-area mt-2 mb-2 flex"
          layout="inline"
          ref={this.searchFormRef}
        >
          <Form.Item className="w-1/4" name="operateType">
            <Select
              placeholder="请选择操作类型"
              className="w-full"
              options={OPERATE_TYPE_MENU}
            />
          </Form.Item>

          <Form.Item className="w-1/4" name="tableId">
            <Select
              placeholder="请选择数据表"
              filterOption={this.filterOption}
              showSearch
              allowClear
              className="w-full"
              options={tableList}
            />
          </Form.Item>
          <Button type="primary" onClick={this.handleSearch}>
            搜索
          </Button>
          <Button className="ml-2" onClick={this.handleClear}>
            清空
          </Button>
          <div className="flex"></div>
          <Button type="primary" onClick={this.handlePlus}>
            新增
          </Button>
        </Form>
        <Form ref={this.listFormRef} onFinish={this.handleFinish}>
          <Table
            size="small"
            rowKey="id"
            dataSource={listForShow}
            pagination={false}
            scroll={{ y: 440 }}
            columns={[
              {
                dataIndex: "index",
                title: "序号",
                width: 70,
                align: "center",
                render: (_t, _r, index) => index + 1,
              },
              {
                dataIndex: "operateType",
                key: "operateType",
                title: "操作类型",
                align: "center",
                width: 105,
                render: (_t, _r, _i) => {
                  return (
                    <Form.Item
                      name={["list", _i, "operateType"]}
                      rules={[{ required: true, message: "操作类型必填" }]}
                    >
                      <Select
                        className="w-full"
                        options={OPERATE_TYPE_MENU}
                        onChange={(value) => {
                          this.handleSetValue(_r.id, { operateType: value });
                        }}
                        value={_r.operateType}
                      />
                    </Form.Item>
                  );
                },
              },
              {
                dataIndex: "tableId",
                key: "tableId",
                title: "目标数据表",
                align: "center",
                width: 177,
                render: (_t, _r, _i) => {
                  return (
                    <Form.Item
                      name={["list", _i, "tableId"]}
                      rules={[{ required: true, message: "数据表必填" }]}
                    >
                      <Select
                        filterOption={this.filterOption}
                        className="w-full"
                        options={tableList}
                        onChange={(value, option) => {
                          this.handleSetValue(_r.id, {
                            tableId: value,
                            tableCode: option.key,
                            changeFields: null,
                            changeRange: null,
                            tableName: option.label,
                          });
                        }}
                        value={_r.tableId}
                      />
                    </Form.Item>
                  );
                },
              },
              {
                dataIndex: "changeFieldsTitle",
                key: "changeFieldsTitle",
                title: "字段配置",
                align: "center",
                width: 202,
                render: (_t, _r, _i) => {
                  return _r.tableId &&
                    ["update", "insert"].includes(_r.operateType) ? (
                    <Form.Item
                      name={["list", _i, "changeFieldsTitle"]}
                      rules={[{ required: true, message: "需要配置字段" }]}
                    >
                      <Input
                        className="cursor-pointer"
                        title={_r.changeFieldsTitle}
                        onClick={() => {
                          this.handleClickChangeFields(_r);
                        }}
                      />
                    </Form.Item>
                  ) : null;
                },
              },
              {
                dataIndex: "changeRange",
                key: "changeRange",
                title: "检索范围",
                width: 202,
                align: "center",
                render: (_t, _r, _i) => {
                  return _r.tableId &&
                    ["update", "delete"].includes(_r.operateType) ? (
                    <Form.Item
                      name={["list", _i, "changeRange"]}
                      rules={[{ required: true, message: "需要配置检索范围" }]}
                    >
                      <Input className="cursor-pointer" />
                    </Form.Item>
                  ) : null;
                },
              },
              {
                dataIndex: "actionArea",
                width: 80,
                title: "操作",
                align: "center",
                render: (_t, _r, _i) => {
                  return (
                    <>
                      {/* <PlusOutlined 
                        onClick = {() => {this.handlePlus(_i);}}
                        className="mr-2 cursor-pointer"
                      /> */}
                      <MinusOutlined
                        onClick={() => {
                          this.handleMinus(_r.id);
                        }}
                        className="mr-2 cursor-pointer"
                      />
                      {/* <Button
                        type="link"
                        onClick = {()=>{this.handleMinus(_r.id);}}
                      >删除</Button> */}
                      {_i !== 0 ? (
                        <ArrowUpOutlined
                          onClick={() => {
                            this.handleMoveUp(_i);
                          }}
                          className="mr-2 cursor-pointer"
                        />
                      ) : null}
                      {_i !== listForShow.length - 1 ? (
                        <ArrowDownOutlined
                          onClick={() => {
                            this.handleMoveDown(_i);
                          }}
                          className="mr-2 cursor-pointer"
                        />
                      ) : null}
                    </>
                  );
                },
              },
            ]}
          />
          <Form.Item style={{ marginBottom: 0, marginTop: "0.5rem" }}>
            <Space className="float-right">
              <Button onClick={this.handleReset}>清空</Button>
              <Button type="primary" htmlType="submit">
                确定
              </Button>
              <Button onClick={this.handleCancel}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
        {/* <div className="clear-both mt-2" style={{ height: '30px' }}>
          <Button
            className="float-right"
            size="sm"
            onClick={this.handleCancel}
          >
          取消
          </Button>
          <Button
            className="float-right mr-2"
            onClick={this.handleOk}
            size="sm"
            type="primary"
          >
          确定
          </Button>
        </div> */}
      </div>
    );
  }
}
