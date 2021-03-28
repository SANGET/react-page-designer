import React from "react";
import { Table, Button, Space } from "antd";
import { BasicValueMeta } from "@provider-app/platform-access-spec";
// import { ValueHelper } from "../../PDInfraUI";

export interface IProps {
  onSuccess: (param1: PChangeFields | null, title: string) => void;
  onCancel;
  changeFields;
  platformCtx;
  tableId;
}
interface ChangeFieldsValue extends BasicValueMeta {
  tableName: string;
  columnName: string;
}
type PChangeFields = { [key: string]: ChangeFieldsValue };
export interface IState {
  changeFields: PChangeFields;
  treeList;
  treeMap;
  variableData;
  unShowSystemColList: string[];
}
export class ChangeFields extends React.PureComponent<IProps, IState> {
  state: IState = {
    treeList: [],
    treeMap: {},
    changeFields: {},
    variableData: {},
    unShowSystemColList: [],
  };

  componentDidMount() {
    this.getColumnList();
    this.setState({
      changeFields: this.props.changeFields || {},
    });
    this.props.platformCtx.meta.getVariableData([]).then((variableData) => {
      this.setState({ variableData });
    });
  }

  getColumnList = () => {
    return new Promise((resolve, reject) => {
      $R_P
        .post({
          url: "/data/v1/tables/tableWithAux",
          data: {
            tables: [
              {
                tableId: this.props.tableId,
                addWithAuxTable: true,
              },
            ],
          },
        })
        .then((res) => {
          const treeList = this.constructTableList(res?.result || []);
          const treeMap = this.constructTreeMap(treeList);
          this.setState(
            {
              treeList,
              treeMap,
              unShowSystemColList: treeList.map((item) => item.id),
            },
            () => {
              resolve(true);
            }
          );
        });
    });
  };

  constructTreeMap = (list) => {
    const map = {};
    list.forEach((table) => {
      const { id: tableId, children } = table;
      map[tableId] = table;
      children.forEach((column) => {
        const { columnId } = column;
        map[`${tableId}.${columnId}`] = column;
      });
    });
    return map;
  };

  constructTableList = (tables) => {
    const list = tables.map((item) => {
      const { name: tableName, id: tableId, code: tableCode } = item;
      return {
        tableCode,
        tableName,
        tableId,
        name: tableName,
        id: tableId,
        children: this.constructColumnList(item.columns, {
          tableId,
          tableName,
        }),
      };
    });
    return list;
  };

  constructColumnList = (columns, { tableId, tableName }) => {
    const list = columns.map((item) => {
      const {
        name: columnName,
        id: columnId,
        code: columnCode,
        species,
      } = item;
      return {
        id: columnId,
        columnName,
        columnId,
        columnCode,
        tableId,
        tableName,
        name: columnName,
        species,
      };
    });
    return list;
  };

  handleSetValue = (_r, changeArea) => {
    const { tableId, columnId, tableName, columnName } = _r;
    const { changeFields } = this.state;
    const notEmpty =
      Object.values(changeArea).filter((item) => !!item).length > 0;
    if (notEmpty) {
      this.setState({
        changeFields: {
          ...changeFields,
          [`${tableId}.${columnId}`]: { ...changeArea, tableName, columnName },
        },
      });
    } else {
      const { [`${tableId}.${columnId}`]: currentOne, ...rest } = changeFields;
      this.setState({
        changeFields: rest,
      });
    }
  };

  handleReset = () => {
    this.getColumnList();
    this.setState({
      changeFields: {},
    });
  };

  handleCancel = () => {
    this.props.onCancel();
  };

  handleSubmit = () => {
    const { changeFields } = this.state;
    if (Object.values(changeFields).length === 0) {
      this.props.onSuccess(null, "");
    }
    const submitTitle = this.getSubmitTitle();
    this.props.onSuccess(changeFields, submitTitle);
  };

  getSubmitTitle = () => {
    const { changeFields } = this.state;
    const list: string[] = [];

    Object.keys(changeFields).forEach((key) => {
      const { tableName, columnName } = changeFields[key];
      list.push(`${tableName}.${columnName}`);
    });

    return list.join("，");
  };

  filterDatasource = (treeList, unShowSystemColList) => {
    const list = treeList.map(({ children, ...rest }) => {
      return {
        ...rest,
        children: children.filter(
          (item) =>
            !(item.species || "").includes("SYS") ||
            !unShowSystemColList.includes(item.tableId)
        ),
      };
    });
    return list;
  };

  render() {
    const {
      treeList,
      changeFields,
      variableData,
      unShowSystemColList,
    } = this.state;
    return (
      <>
        <Table
          size="small"
          scroll={{ y: 440 }}
          columns={[
            {
              dataIndex: "name",
              key: "name",
              title: "字段名",
            },
            {
              dataIndex: "valueConfig",
              key: "valueConfig",
              title: "值",
              render: (_t, _r) => {
                const { tableId, columnId } = _r;
                return columnId ? (
                  <ValueHelper
                    platformCtx={this.props.platformCtx}
                    variableData={variableData}
                    editedState={changeFields[`${tableId}.${columnId}`] || {}}
                    onChange={(changeArea) => {
                      this.handleSetValue(_r, changeArea);
                    }}
                  />
                ) : (
                  <Button
                    className="float-right"
                    onClick={() => {
                      if (unShowSystemColList.includes(tableId)) {
                        this.setState({
                          unShowSystemColList: unShowSystemColList.filter(
                            (item) => item !== tableId
                          ),
                        });
                      } else {
                        this.setState({
                          unShowSystemColList: [
                            tableId,
                            ...unShowSystemColList,
                          ],
                        });
                      }
                    }}
                  >
                    {`${
                      unShowSystemColList.includes(tableId) ? "显示" : "隐藏"
                    }系统字段`}
                  </Button>
                );
              },
            },
          ]}
          rowKey="id"
          dataSource={this.filterDatasource(treeList, unShowSystemColList)}
          pagination={false}
        />
        <Space className="float-right" style={{ height: 52 }}>
          <Button onClick={this.handleReset}>清空</Button>
          <Button type="primary" onClick={this.handleSubmit}>
            确定
          </Button>
          <Button onClick={this.handleCancel}>取消</Button>
        </Space>
      </>
    );
  }
}
