import React from "react";
import {
  Table,
  Select,
  Input,
  Form,
  Button,
  message as AntMessage,
  Card,
  Col,
  Row,
} from "antd";

import { CloseModal, ShowModal } from "@deer-ui/core";
import { customAlphabet } from "nanoid";
import { FormInstance } from "antd/lib/form";
import { CheckCircleOutlined, DeleteOutlined } from "@ant-design/icons";
import { ActionsMeta as BasicActionsMeta } from "@provider-app/platform-access-spec";
import { PageActionCreator } from "@provider-app/action-creator";

const nanoid = customAlphabet("platformAction", 8);

const Tile = ({ children, onDel, onEdit, onClick }) => {
  return (
    <div
      className="action-config-item p-2 app-tile md:w-4/12 lg:w-3/12 xl:w-1/5 relative"
      onClick={onClick}
    >
      <div className="tile-container text-center text-gray-700 block py-4 bg-white shadow-md cursor-pointer rounded items-start transition duration-200 hover:shadow-lg">
        {/* <div
          className={`app-icon text-3xl rounded-full text-center mx-4`}
          style={{ height: 40, width: 40, lineHeight: `30px` }}
        ></div> */}
        {children}
        <div
          className="action-area"
          style={{ position: "absolute", top: "0", right: "0" }}
        >
          {/* <span className="item edit p-1" onClick={onEdit}>
            编辑
          </span> */}
          <span
            className="item del p-1"
            onClick={(e) => {
              e.stopPropagation();
              onDel?.();
            }}
          >
            删除
          </span>
        </div>
      </div>
    </div>
  );
};

export interface IProps {
  flatLayoutItems;
  pageMetadata;
  platformCtx;
}

type IdActionsMeta = { id: string };
type ActionsMeta = IdActionsMeta & BasicActionsMeta;
export interface IState {
  list: ActionsMeta[];
  listForShow: ActionsMeta[];
  maxIndex: number;
}
type InitActions = () => { [key: string]: ActionsMeta };
export class PageActionSelector extends React.Component<IProps, IState> {
  state: IState = {
    list: [],
    listForShow: [],
    maxIndex: -1,
  };

  listFormRef = React.createRef<FormInstance>();

  searchFormRef = React.createRef<FormInstance>();

  componentDidMount() {
    /** 初始化动作列表 */
    const list = this.initList();
    const maxIndex =
      list.length > 0 ? this.getOrderById(list[0]?.id) : this.state.maxIndex;
    this.setState({
      list,
      listForShow: list,
      maxIndex,
    });
    this.listFormRef.current?.setFieldsValue({ list });
  }

  /**
   * 从页面上下文中获取动作数据
   */
  initActions: InitActions = () => {
    const { actions } = this.props.pageMetadata;
    return actions;
  };

  /**
   * 初始化动作列表
   */
  initList = (): ActionsMeta[] => {
    const actions = this.initActions();

    const list: {
      order: number;
      data: ActionsMeta;
    }[] = Object.keys(actions).map((id) => {
      const data = actions[id];
      const order = this.getOrderById(id);
      return { order, data: { ...data, id } };
    });
    return list.sort((a, b) => b.order - a.order).map((item) => item.data);
  };

  /**
   * 获取 唯一标识 中隐藏的索引值
   * @param id
   */
  getOrderById = (id: string): number => {
    if (!id) return -1;
    return Number(id.split(".")[1]) - 0;
  };

  /**
   * 生成动作唯一标识
   * @param index
   */
  newActionId = (index: number): string => {
    return `act.${index}.${nanoid()}`;
  };

  /**
   * 现有支持的动作类型列表
   */
  getTypeList = () => {
    return [
      { label: "打开链接", value: "openPage", key: "openPage" },
      // {
      //   label: "刷新控件（未实现）",
      //   value: "refreshControl",
      //   key: "refreshControl",
      // },
      // { label: "赋值给变量", value: "changeVariables", key: "changeVariables" },
      { label: "数据提交", value: "submitData", key: "submitData" },
      { label: "数据选择", value: "chooseData", key: "chooseData" },
      // { label: "显示隐藏", value: "displayControl", key: "displayControl" },
      // { label: "刷新页面", value: "refreshPage", key: "refreshPage" },
      // { label: "关闭页面", value: "closePage", key: "closePage" },
      { label: "整表读取", value: "readFormData", key: "readFormData" },
      { label: "整表回写", value: "writeFormData", key: "writeFormData" },
      // { label: "表格查询", value: "readTableData", key: "readTableData" },
      // { label: "表格回写", value: "writeTableData", key: "writeTableData" },
    ];
  };

  /**
   * 各动作类型的动作配置
   * @param action
   */
  getActionConfig = (action: string) => {
    const config = {
      changeVariables: {
        ModalContent: ChangeVariables,
      },
      // openPage: {
      //   ModalContent: OpenLink,
      // },
      refreshPage: {
        readOnly: true,
      },
      closePage: {
        readOnly: true,
      },
      displayControl: {
        ModalContent: DisplayControl,
      },
      submitData: {
        ModalContent: SubmitData,
      },
      readFormData: {
        ModalContent: ReadFormData,
      },
      writeFormData: {
        ModalContent: WriteFormData,
      },
      writeTableData: {
        ModalContent: WriteTableWidget,
      },
      readTableData: {
        ModalContent: ReadTableWidget,
      },
      chooseData: {
        ModalContent: ChooseData,
      },
    };
    return (action && config[action]) || {};
  };

  /**
   * 根据 唯一标识 获取数据位于列表中的索引
   * @param list
   * @param id
   */
  getIndexById = (list: ActionsMeta[], id: string): number => {
    let index = -1;
    list.forEach((item, loopIndex) => {
      if (item.id === id) {
        index = loopIndex;
      }
    });
    return index;
  };

  /**
   * 弹出弹窗提供动作配置补充
   * @param param0
   * @param actionConfig
   */
  perfectConfigInModal = (
    { width, ModalContent },
    actionConfig,
    actionConfigCn
  ): Promise<{ config; configCn }> => {
    return new Promise((resolve, reject) => {
      const modalID = ShowModal({
        title: "配置动作",
        width: "85%",
        children: () => {
          return (
            <div className="p-5">
              <ModalContent
                {...this.props}
                configCn={actionConfigCn}
                config={actionConfig}
                onSuccess={(config, configCn) => {
                  resolve({ config, configCn });
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
   * 根据搜索过滤展示数据
   * @param param0
   */
  filterListAfterSearch = ({ type, actionName }) => {
    const { list } = this.state;
    return list.filter((item) => {
      return (
        (!actionName || (item.actionName || "").includes(actionName)) &&
        (!type || item.actionType === type)
      );
    });
  };

  /**
   * 根据用户输入过滤搜索框的下拉项展示
   * @param value
   * @param option
   */
  filterOption = (value: string, option) => {
    return option.label.toLowerCase().includes(value.toLowerCase());
  };

  onSubmitActionConfig = (nextActionConfig) => {
    this.props.platformCtx.meta.changePageMeta({
      type: "update",
      metaAttr: "actions",
      metaID: nextActionConfig.id || nanoid(),
      data: nextActionConfig,
    });
    console.log(111, nextActionConfig);
    AntMessage.success("动作配置成功");
  };

  /**
   * 新增动作
   * @param index
   */
  handleCreate = (initialValues?, options?) => {
    const { pageMetadata, platformCtx } = this.props;
    const { title = "新增动作" } = options || {};
    ShowModal({
      title,
      width: "80vw",
      children: ({ close }) => {
        return (
          <div>
            <PageActionCreator
              initialValues={initialValues}
              pageMetadata={pageMetadata}
              platformCtx={platformCtx}
              onSubmit={(nextValues) => {
                close();
                this.onSubmitActionConfig(nextValues);
              }}
              onCancel={close}
            />
          </div>
        );
      },
    });
  };

  handleMinus = (id) => {
    // console.log(id);
    // const list = this.state.list.slice();
    // const indexInList = this.getIndexById(list, id);
    // list.splice(indexInList, 1);
    // const listForShow = this.state.listForShow.slice();
    // const indexInListForShow = this.getIndexById(listForShow, id);
    // listForShow.splice(indexInListForShow, 1);
    // this.setState({
    //   list,
    //   listForShow,
    // });
    // this.listFormRef.current?.setFieldsValue({ list: listForShow });
    this.props.platformCtx.meta.changePageMeta({
      type: "rm",
      metaAttr: "actions",
      rmMetaID: id,
    });
  };

  handleSetValue = (id, data) => {
    const list = this.state.list.slice();
    const listForShow = this.state.listForShow.slice();
    const index = this.getIndexById(list, id);
    Object.assign(list[index], data);
    this.setState({
      list,
      listForShow,
    });
    this.listFormRef.current?.setFieldsValue({ list: listForShow });
  };

  handlePerfectActionConfig = (index, record, modalProps) => {
    return new Promise((resolve, reject) => {
      const {
        actionType,
        [actionType]: actionConfig,
        configCn: configCnTitle,
      } = record;
      this.perfectConfigInModal(modalProps, actionConfig, configCnTitle).then(
        ({ config, configCn }) => {
          this.handleSetValue(record.id, {
            [actionType]: config,
            configCn,
          });
          resolve();
        }
      );
    });
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

  handleFinish = (order, record) => {
    const getValidateKeys = () => {
      return ["name", "actionType", "configCn"].map((item) => [
        "list",
        order,
        item,
      ]);
    };
    const validateKeys = getValidateKeys();
    const { id, ...data } = record;
    this.listFormRef.current?.validateFields(validateKeys).then(() => {
      this.props.platformCtx.meta.changePageMeta({
        type: "update",
        metaAttr: "actions",
        metaID: id,
        data,
      });
      AntMessage.success("动作配置成功");
    });
  };

  actionTableColumns = [
    // {
    //   dataIndex: "index",
    //   title: "序号",
    //   width: 70,
    //   align: "center",
    //   render: (_t, _r, index) => index + 1,
    // },
    {
      dataIndex: "actionName",
      width: 139,
      title: "动作名称",
      align: "center",
    },
    // {
    //   dataIndex: "preCheck",
    //   width: 139,
    //   title: "动作前校验",
    //   align: "center",
    // },
    // {
    //   dataIndex: "actionConfig",
    //   width: 136,
    //   title: "动作描述",
    //   align: "center",
    //   render: (_t, _r, _i) => {
    //     return _t.configCn;
    //   },
    // },
    // {
    //   dataIndex: "triggerCondition",
    //   width: 140,
    //   title: "条件",
    //   align: "center",
    // },
    {
      dataIndex: "actionArea",
      width: 80,
      title: "操作",
      align: "center",
      render: (_t, _r, _i) => {
        return (
          <>
            <span
              onClick={() => {
                this.handleCreate(_r, {
                  title: "编辑动作",
                });
              }}
              className="mr-2 cursor-pointer text-blue-400"
            >
              编辑
            </span>
            <span
              onClick={() => {
                this.handleMinus(_r.id);
              }}
              className="mr-2 cursor-pointer text-blue-400"
            >
              删除
            </span>
          </>
        );
      },
    },
  ];

  getActionList = () => {
    const { pageMetadata } = this.props;
    const { actions } = pageMetadata;
    const actionList: ActionsMeta[] = [];
    Object.keys(actions).forEach((actID) => {
      const actionItem = { ...actions[actID] };
      if (!actionItem.id) actionItem.id = actID;
      if (actionItem.id !== "closePage") actionList.push(actionItem);
    });
    return actionList;
  };

  render() {
    const listForShow = this.getActionList();
    // const { listForShow } = this.state;
    return (
      <div className="page-action-selector">
        <Form
          className="search-area mt-2 mb-2 flex"
          layout="inline"
          ref={this.searchFormRef}
        >
          {/* <Form.Item className="w-1/4" name="type">
            <Select
              placeholder="请选择动作类型"
              className="w-full"
              allowClear
              showSearch
              filterOption={this.filterOption}
              options={this.getTypeList()}
            />
          </Form.Item>

          <Form.Item className="w-1/4" name="actionName">
            <Input placeholder="请输入动作名称" />
          </Form.Item>
          <Button type="primary" onClick={this.handleSearch}>
            搜索
          </Button>
          <Button className="ml-2" onClick={this.handleClear}>
            清空
          </Button> */}
          <h5>动作列表</h5>
          <div className="flex"></div>
          <Button
            type="primary"
            className="mr-2"
            onClick={() => this.handleCreate()}
          >
            新增
          </Button>
          {/* <Button type="primary" onClick={this.handleFinish}>
            保存
          </Button> */}
        </Form>
        <div className="px-4 bg-gray-100">
          <div className="flex flex-wrap">
            {listForShow.map((item) => {
              const { actionName, id } = item;
              const onEditItem = () => {
                this.handleCreate(item, {
                  title: "编辑动作",
                });
              };
              return (
                <Tile
                  key={id}
                  onClick={onEditItem}
                  onEdit={onEditItem}
                  onDel={(e) => {
                    this.handleMinus(item.id);
                  }}
                >
                  {actionName}
                </Tile>
              );
            })}
          </div>
        </div>
        {/* <Table
          size="small"
          rowKey="id"
          dataSource={listForShow}
          pagination={false}
          scroll={{ y: 440 }}
          columns={this.actionTableColumns}
        /> */}
      </div>
    );
  }
}
