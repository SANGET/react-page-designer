import React, { useEffect, useState } from "react";
import {
  Radio,
  Button,
  Input,
  Table,
  message as AntMessage,
  TreeSelect,
} from "antd";
import { CloseModal, ShowModal } from "@deer-ui/core";
import pick from "lodash/pick";
import { VariableItem } from "@provider-app/platform-access-spec";
import { ModalConfigSelector } from "./ModalConfigSelector";
import { ModalConfigEditor } from "./ModalConfigEditor";

const VariableRenderer = ({
  field,
  value,
  matchPair,
  onChange,
  variableList: variableListProp,
}) => {
  // const [variableList, setVariableList] = useState(variableListProp);
  // useEffect(() => {
  //   if (!matchPair || Object.keys(matchPair).length === 0) {
  //     setVariableList(variableListProp);
  //     return;
  //   }
  //   setVariableList(
  //     variableList
  //       .slice()
  //       .map((item) => {
  //         const { children, ...rest } = item;
  //         return {
  //           ...rest,
  //           children:
  //             (Array.isArray(children) &&
  //               children
  //                 .slice()
  //                 .filter(
  //                   ({ value: valueLoop }) =>
  //                     value === valueLoop ||
  //                     !Object.values(matchPair || {}).includes(valueLoop)
  //                 )) ||
  //             [],
  //         };
  //       })
  //       .filter((item) => item.children?.length > 0)
  //   );
  // }, [matchPair]);
  const getVariableList = () => {
    if (!matchPair || Object.keys(matchPair).length === 0) {
      return variableListProp;
    }
    const filterChildren = (children) => {
      return (
        (Array.isArray(children) &&
          children
            .slice()
            .filter(
              ({ value: valueLoop }) =>
                value === valueLoop ||
                !Object.values(matchPair || {}).includes(valueLoop)
            )) ||
        []
      );
    };
    return variableListProp
      .slice()
      .map((item) => {
        const { children, ...rest } = item;
        return {
          ...rest,
          children: filterChildren(children),
        };
      })
      .filter((item) => item.children?.length > 0);
  };
  return React.useMemo(() => {
    return (
      <TreeSelect
        value={value}
        className="w-full variable-selector py-1 cursor-pointer"
        showSearch
        filterTreeNode={(valueFilter, treeNode) => {
          return (
            (treeNode?.title || "").toString().includes(valueFilter) || false
          );
        }}
        onChange={(valueChanged) => {
          if (typeof onChange === "function") {
            onChange({ [field]: valueChanged });
          }
        }}
        treeDefaultExpandAll
        treeData={getVariableList()}
      />
    );
  }, [matchPair]);
};
type PropsVariableMatch = {
  ds?: string;
  fieldList?: string[];
  matchPair?: { [key: string]: string };
  onChange;
  platformCtx;
};
type Datasource = { columnID: string; columnTitle: string }[];
const VariableMatch = ({
  ds,
  fieldList,
  matchPair,
  onChange,
  platformCtx,
}: PropsVariableMatch) => {
  const [variableList, setVariableList] = useState({});
  const [dataSource, setDataSource] = useState<Datasource>([]);
  useEffect(() => {
    platformCtx.meta
      .getVariableData(["pageInput", "system", "page"])
      .then((res) => {
        setVariableList(initVariableList(res));
      });
  }, []);
  useEffect(() => {
    getFieldTitle(ds).then((fields) => {
      setDataSource(
        fieldList?.map((columnID) => ({
          columnID,
          columnTitle: fields[columnID],
        })) || []
      );
    });
  }, [ds]);
  const initVariableList = (variableData) => {
    if (!variableData) {
      return [];
    }
    const constructVarList = (list: VariableItem[]) => {
      return Array.isArray(list)
        ? list.map((item) => constructVarItem(item))
        : [];
    };
    const constructVarItem = (item: VariableItem) => {
      const { id, title } = item;
      return { value: id, title };
    };
    return [
      {
        title: "???????????????",
        value: "customed",
        variableList: variableData.customed,
        disabled: true,
      },
      {
        title: "????????????",
        value: "page",
        variableList: variableData.page,
        disabled: true,
      },
      {
        title: "????????????",
        value: "system",
        variableList: variableData.system,
        disabled: true,
      },
      {
        title: "????????????",
        value: "widget",
        variableList: variableData.widget,
        disabled: true,
      },
      {
        title: "??????????????????",
        value: "pageInput",
        variableList: variableData.pageInput,
        disabled: true,
      },
    ]
      .filter((item) => item.variableList?.length > 0)
      .map((item) => {
        const { variableList: variableListChild, ...rest } = item;
        return { ...rest, children: constructVarList(variableListChild) };
      });
  };
  const getFieldTitle = (tableId): Promise<{ [key: string]: string }> => {
    return new Promise((resolve, reject) => {
      if (!tableId) {
        resolve({});
        return;
      }
      $R_P
        .post({
          url: "/data/v1/tables/tableWithAux",
          data: {
            tables: [
              {
                tableId,
                addWithAuxTable: true,
              },
            ],
          },
        })
        .then((res) => {
          if (res?.code !== "00000") {
            AntMessage.error("???????????????????????????????????????????????????");
            return;
          }
          const result = {};
          res.result.forEach((table) => {
            table.columns.forEach((item) => {
              result[`${table.id}.${item.id}`] = item.name;
            });
          });
          resolve(result);
        });
    });
  };
  return (
    <Table
      dataSource={dataSource}
      rowKey="columnID"
      size="small"
      pagination={false}
      columns={[
        {
          dataIndex: "columnTitle",
          title: "????????????",
          width: 400,
          key: "columnTitle",
        },
        {
          dataIndex: "columnID",
          title: "??????",
          width: 400,
          key: "columnID",
          render: (_t) => {
            return (
              <VariableRenderer
                matchPair={matchPair}
                variableList={variableList}
                value={matchPair?.[_t] || ""}
                field={_t}
                onChange={onChange}
              />
            );
          },
        },
      ]}
    />
  );
};
interface Props {
  platformCtx;
  config;
  onSuccess;
  onCancel;
}
export enum EShowType {
  "TABLE" = 1,
  "TREE" = 2,
  "TREETABLE" = 3,
  "CUSTOMED" = 4,
}
export enum ESelectType {
  "RADIO" = 1,
  "CHECKBOX" = 2,
}

type BasicModal = {
  title: string;
  showType:
    | EShowType.TABLE
    | EShowType.TREE
    | EShowType.TREETABLE
    | EShowType.CUSTOMED;
  selectType: ESelectType.RADIO | ESelectType.CHECKBOX;
  id?: string;
};
type TableModal = BasicModal & {
  ds: string;
  sortColumnInfo: undefined;
  returnValue: string[];
  tagField: string;
  showColumn: string[];
};
export enum EShowSearch {
  "YES" = 1,
  "NO" = 0,
}
type TreeModal = BasicModal & {
  ds: string;
  sortColumnInfo: undefined;
  returnValue: string[];
  tagField: string;
  showColumn: string;
  showSearch: EShowSearch.YES | EShowSearch.NO;
};
type TreeTableModal = BasicModal & {
  treeDs: string;
  treeSortColumnInfo: undefined;
  treeShowColumn: string;
  superiorColumn: string;
  relatedSuperiorColumn: string;
  showSearch: EShowSearch.YES | EShowSearch.NO;
  tableDs: string;
  tableSortColumnInfo: undefined;
  tableReturnValue: [];
  tableShowColumn: string[];
};
interface State {
  createdBy: "modalList" | "config";
  dataChooseRange: undefined;
  matchReturnValue: { [key: string]: string };
  modalConfig?: TableModal | TreeModal | TreeTableModal;
}
export class ChooseData extends React.Component<Props> {
  state: State = {
    createdBy: "modalList",
    dataChooseRange: undefined,
    matchReturnValue: {},
    modalConfig: undefined,
  };

  componentDidMount() {
    this.setState(
      pick(this.props.config, [
        "createdBy",
        "dataChooseRange",
        "matchReturnValue",
        "modalConfig",
      ])
    );
  }

  /** ????????????????????????????????? ds???returnValue */
  getReturn = (modalConfig) => {
    const { showType, returnValue, tableReturnValue, ds, tableDs } =
      modalConfig || {};
    if ([EShowType.TABLE, EShowType.TREE].includes(showType)) {
      return { ds, fieldList: returnValue };
    }
    if (showType === EShowType.TREETABLE) {
      return {
        ds: tableDs,
        fieldList: tableReturnValue,
      };
    }
    return {};
  };

  handleClick = () => {
    const { createdBy, modalConfig } = this.state;

    const handleSuccess = (modal) => {
      this.setState({
        modalConfig: modal,
        matchReturnValue: {},
      });
      CloseModal(modalID);
    };
    const modalID = ShowModal({
      title: "????????????",
      width: 900,
      children: () => {
        return (
          <div className="p-5">
            {createdBy === "modalList" ? (
              <ModalConfigSelector
                selectedModal={modalConfig?.id}
                onSuccess={handleSuccess}
                onCancel={() => {
                  CloseModal(modalID);
                }}
              />
            ) : (
              <ModalConfigEditor
                platformCtx={this.props.platformCtx}
                config={modalConfig}
                onSuccess={handleSuccess}
                onCancel={() => {
                  CloseModal(modalID);
                }}
              />
            )}
          </div>
        );
      },
    });
  };

  handleReset = () => {
    this.setState({
      createdBy: "modalList",
      matchReturnValue: {},
      modalConfig: undefined,
      dataChooseRange: undefined,
    });
  };

  handleCancel = () => {
    this.props.onCancel();
  };

  handleSubmit = () => {
    const { modalConfig, matchReturnValue } = this.state;
    if (!modalConfig) {
      AntMessage.error("???????????????");
      return;
    }
    const isNotEmpty = () => {
      const arr = Object.values(matchReturnValue);
      return arr.length > 0 && arr.some((item) => !!item);
    };
    const amINotEmpty = isNotEmpty();
    if (!amINotEmpty) {
      AntMessage.error("??????????????????");
      return;
    }
    this.props.onSuccess(this.state, modalConfig.title);
  };

  render() {
    const { modalConfig, matchReturnValue, createdBy } = this.state;
    const { ds, fieldList } = this.getReturn(modalConfig);
    return (
      <>
        <div className="row mb-2">
          <span>???????????????</span>
          <Radio.Group
            value={createdBy}
            onChange={(e) => {
              this.setState({
                modalConfig: undefined,
                matchReturnValue: {},
                createdBy: e.target.value,
              });
            }}
          >
            <Radio value="modalList">????????????</Radio>
            <Radio value="config">???????????????</Radio>
          </Radio.Group>
          <Button onClick={this.handleClick} className="ml-3">
            {modalConfig?.title || "????????????"}
          </Button>
        </div>
        <div className="row flex">
          <span>?????????????????????</span>
          <div className="flex">
            <Input placeholder="????????????" />
          </div>
        </div>
        <div>??????????????????</div>
        <VariableMatch
          ds={ds}
          fieldList={fieldList}
          platformCtx={this.props.platformCtx}
          matchPair={matchReturnValue || {}}
          onChange={(changeArea) => {
            this.setState({
              matchReturnValue: {
                ...(matchReturnValue || {}),
                ...changeArea,
              },
            });
          }}
        />
        <div className="float-right p-3">
          <Button htmlType="button" onClick={this.handleReset} className="mr-2">
            ??????
          </Button>
          <Button type="primary" onClick={this.handleSubmit} className="mr-2">
            ??????
          </Button>
          <Button htmlType="button" onClick={this.handleCancel}>
            ??????
          </Button>
        </div>
      </>
    );
  }
}
