import React from "react";
import { DropdownWrapper } from "@deer-ui/core";
import { Tabs, Button, message as AntMessage, Modal } from "antd";
import { PlusOutlined, ExclamationCircleOutlined } from "@ant-design/icons";

const { TabPane } = Tabs;
const TABLE = "TABLE";
const PAGE = "page";
type Props = {
  platformCtx;
  pageMetadata;
  onSuccess;
  onCancel;
  config;
};
type scopeItem = {
  field: string;
  condition: string;
  realVal: string;
  exp: string;
  var: string;
};
type dsChild = {
  value: string;
  key: string;
  title: string;
  disabled?: boolean;
  children?: dsChild[];
};
type ds = {
  title: string;
  value: string;
  key: string;
  disabled: boolean;
  columns: PD.TableColumn[];
  children?: dsChild[];
};
type State = {
  tableArea: { [key: string]: { queryList: scopeItem[]; queryExp: string } };
  tableMap: {
    [key: string]: ds;
  };
  errorMsg: string;
  activeKey: string;
  variableData: unknown;
};

type DropdownTableProp = {
  tableArea: { [key: string]: { queryList: scopeItem[]; queryExp: string } };
  tableMap: {
    [key: string]: ds;
  };
  handleCreateTable;
};
/**
 * 展示“数据源 +” 的下拉项
 */
const DropdownTable = ({
  tableMap,
  tableArea,
  handleCreateTable,
}: DropdownTableProp) => {
  const tableInUsingTables = (tableID) => {
    return tableID in tableArea;
  };
  return (
    <DropdownWrapper
      outside
      overlay={(helper) => {
        return (
          <div className="column-selector-container">
            {Object.values(tableMap).map((table) => {
              const { value, title } = table;
              const isSelected = tableInUsingTables(value);
              return (
                <div
                  onClick={() => {
                    if (isSelected) return;
                    handleCreateTable(value);
                  }}
                  className={`p1-1 list-item ${isSelected ? "disabled" : ""}`}
                  key={value}
                >
                  {`${title}`}
                </div>
              );
            }) || null}
          </div>
        );
      }}
    >
      <span className="title flex items-center">
        <span>数据源</span>
        <PlusOutlined
          className="ml-1"
          style={{
            display: "inline-block",
            // fontSize: 16
          }}
        />
      </span>
    </DropdownWrapper>
  );
};
export class WriteFormData extends React.Component<Props, State> {
  state: State = {
    tableArea: {},
    tableMap: {},
    errorMsg: "",
    activeKey: "",
    variableData: {},
  };

  /** 构建字段列表中的字段数据 */
  constructColumns = (columns: PD.TableColumn[]) => {
    return Object.values(columns || {}).map((column) => ({
      value: `${column.dsID}.${column.id}`,
      key: `${column.dsID}.${column.id}`,
      title: column.name,
    }));
  };

  /** 构建字段列表中的表数据 */
  constrcutDs = (datasource) => {
    const { name: title, id: value, columns } = datasource;
    return {
      title,
      value,
      key: value,
      disabled: true,
      columns,
    };
  };
  /** 过滤数据源中的表数据 */

  getTable = (dataSource: PD.DatasourcesInMeta) => {
    const result: PD.TableDatasouce[] = [];
    Object.values(dataSource).forEach((item) => {
      /** 只展示用户手动添加的数据表 */
      if (item.type === TABLE && item.createdBy.includes(PAGE)) {
        result.push(item);
      }
    });
    return result;
  };

  /**
   * 拼接能提供配置的数据源数据
   * 如果表没有附属表的话，则表的下一级就是字段列表；
   * 如果表有附属表的话，则表的下一级会是 字段（内容为字段列表）、所含有的附属表....
   */
  getDsMap = () => {
    // TODO: 目前只能根据 tableCode 形成上下文关系
    const result = {};
    const map: { [key: string]: ds } = {};
    const {
      dataSource,
    }: { dataSource: PD.DatasourcesInMeta } = this.props.pageMetadata;
    const tableList = this.getTable(dataSource);
    tableList.forEach((table) => {
      if (!table) return;
      map[table.code] = this.constrcutDs(table);
    });
    tableList.forEach((prevTable) => {
      const { code, id } = prevTable;
      const { [code]: table } = map;
      if (table) {
        const mainTableCode = prevTable.auxTable?.mainTableCode;
        if (!mainTableCode) {
          result[id] = table;
          return;
        }
        const parent = map[mainTableCode];
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(table);
        } else {
          result[id] = table;
        }
      }
    });
    Object.values(map).forEach((table) => {
      const children = this.constructColumns(table.columns);
      if (Array.isArray(table.children) && table.children.length > 0) {
        table.children.unshift({
          title: `${table.title}.字段`,
          key: `${table.value}.columns`,
          disabled: true,
          value: `${table.value}.columns`,
          children,
        });
      } else {
        table.children = children;
      }
    });
    return result;
  };

  componentDidMount() {
    this.setState({
      tableArea: this.props.config || {},
      tableMap: this.getDsMap(),
      activeKey: Object.keys(this.props.config || {})[0] || "",
    });
    /** 整表读取只对应能配置 页面输入参数变量 和 页面变量，和 系统变量 */
    this.props.platformCtx.meta
      .getVariableData(["customed", "widget"])
      .then((variableData) => {
        this.setState({ variableData });
      });
  }

  /** 新增数据源配置 */
  handleCreateTable = (tableID) => {
    this.setState(
      {
        tableArea: {
          ...this.state.tableArea,
          [tableID]: { queryList: [], queryExp: "" },
        },
      },
      () => {
        const { tableArea, errorMsg } = this.state;
        const tableAreaKeys = Object.keys(tableArea);
        if (tableAreaKeys.length === 1 || !errorMsg) {
          this.setState({ activeKey: tableID });
        }
      }
    );
  };

  /** tab栏提供的操作，目前只有删除，新增走定制开发，具体参看 DropdownTable */
  handleEditTab = (targetKey, action) => {
    this[action]?.(targetKey);
  };

  /** 删除数据源则删除引用即可 */
  remove = (targetKey: string) => {
    const { [targetKey]: sth, ...rest } = this.state.tableArea;
    this.setState({
      tableArea: rest,
    });
  };

  /** 判断表配置中是否有配置表达式 */
  hasEmptyScopeExp = () => {
    return Object.values(this.state.tableArea).some(({ queryExp }) => {
      return !queryExp;
    });
  };

  /** 判断用户是否要删除对应数据表查询范围配置 */
  askToDeleteEmptyScope = (callback) => {
    /** 允许删除 */
    Modal.confirm({
      title: "存在没有配置（表达式）的数据源查询范围，不予保存，请确认",
      icon: <ExclamationCircleOutlined />,
      okText: "确定",
      cancelText: "取消",
      onOk: () => {
        if (typeof callback !== "function") return;
        callback();
      },
    });
  };

  /** 过滤非空配置 */
  filterScopeWithoutEmpty = () => {
    const { tableArea } = this.state;
    const result = {};
    Object.keys(tableArea).forEach((tableID) => {
      const config = tableArea[tableID];
      if (!config || !config.queryExp) return;
      result[tableID] = config;
    });
    return result;
  };

  /** 数据提交 */
  handleSubmit = () => {
    const hasEmptyScopeExp = this.hasEmptyScopeExp();
    if (hasEmptyScopeExp) {
      this.askToDeleteEmptyScope(() => {
        const config = this.filterScopeWithoutEmpty();
        if (Object.keys(config).length === 0) {
          this.props.onSuccess(undefined, "");
          return;
        }
        this.props.onSuccess(config, "已配置");
      });
    } else {
      this.props.onSuccess(this.state.tableArea, "已配置");
    }
  };

  render() {
    const {
      tableArea,
      tableMap,
      errorMsg,
      activeKey,
      variableData,
    } = this.state;
    if (Object.values(tableMap).length === 0) {
      return (
        <span className="text-red ">
          暂无数据源可供选择，请从页面设计器左侧数据源面板进行选择添加
        </span>
      );
    }
    return (
      <>
        {Object.keys(tableArea).length === 0 ? (
          <DropdownTable
            tableMap={tableMap}
            tableArea={tableArea}
            handleCreateTable={this.handleCreateTable}
          />
        ) : (
          <Tabs
            size="small"
            activeKey={activeKey}
            addIcon={
              <div className="p-2">
                <DropdownTable
                  tableMap={tableMap}
                  tableArea={tableArea}
                  handleCreateTable={this.handleCreateTable}
                />
              </div>
            }
            onChange={(activeKeyTmpl) => {
              if (activeKeyTmpl === activeKey) return;
              if (!errorMsg) {
                this.setState({ activeKey: activeKeyTmpl });
                return;
              }
              AntMessage.error(errorMsg);
            }}
            tabPosition="left"
            onEdit={this.handleEditTab}
            type="editable-card"
          >
            {Object.keys(tableArea).map((tableID) => {
              const { title, children } = tableMap[tableID];
              return (
                <TabPane tab={title} key={tableID} closable={true}>
                  {this.props.platformCtx.selector.renderDataSearchEditor({
                    variableData,
                    platformCtx: this.props.platformCtx,
                    defaultValue: tableArea[tableID],
                    fields: children,
                    updateCurrentConfig: ({
                      queryList,
                      queryExp,
                      errorMsg: errorMsgForTable,
                    }) => {
                      this.setState((prevState) => {
                        const { tableArea: tableAreaPrev } = prevState;
                        return {
                          tableArea: {
                            ...tableAreaPrev,
                            [tableID]: { queryList, queryExp },
                          },
                          errorMsg: errorMsgForTable,
                        };
                      });
                    },
                  })}
                </TabPane>
              );
              // return <></>;
            })}
          </Tabs>
        )}
        <div className="w-full flex pt-2 px-2">
          <span className="flex"></span>
          {(errorMsg && (
            <span className="text-red-700 mt-2 mr-2">{errorMsg}</span>
          )) ||
            null}
          <Button
            type="primary"
            className="mr-2 "
            onClick={this.handleSubmit}
            disabled={Object.keys(tableArea).length === 0 || !!errorMsg}
          >
            确定
          </Button>
          <Button onClick={this.props.onCancel}>取消</Button>
        </div>
      </>
    );
  }
}
