import React from "react";
import { Menu, Dropdown } from "antd";
import {
  PlatformDatasource,
  PropItemRenderContext,
  PTColumn,
} from "@provider-app/platform-access-spec";
import {
  CloseModal,
  DropdownWrapper,
  ShowModal,
} from "@provider-app/shared-ui";
import { PlusOutlined, CloseOutlined, DownOutlined } from "@ant-design/icons";
import Sortable from "sortablejs";
import { genRenderColumn, isReferenceField } from "./utils";
import { ColumnEditableItems } from "./ColumnEditableItems";
import { RangeListCreator } from "./RangeListCreator";
import "./style.scss";

export type DSColumn = {
  type: "dsColumn";
  fieldCode: string;
  tableTitle: string;
  fieldShowType: "realVal" | "showVal";
  colDataType: "string";
};

interface TableDSHelperCompProps extends PropItemRenderContext {
  whichAttr: string;
}
type SortField = { fieldID: string; dsID: string; sort: "ASC" | "DESC" };

type RangeItem = { field: string; realVal: string; variable; exp };
interface TableEditorState {
  rangeMeta?: RangeItem[];
  datasourceMeta: PlatformDatasource[];
  usingColumns: PTColumn[];
  sortInfo: SortField[];
}

const takeTableInfo = (_tableInfo) => {
  return _tableInfo.map((item) => item.name).join("，");
};

const takeRangeInfo = (_rangeInfo) => {
  return _rangeInfo.map((item) => `${item.field}`).join("; ");
};

export default class TableDSHelperComp extends React.Component<
  TableDSHelperCompProps,
  TableEditorState
> {
  constructor(props) {
    super(props);

    const datasourceMeta = this.takeDS();
    const rangeMeta = this.takeRange();
    this.state = {
      rangeMeta,
      datasourceMeta,
      usingColumns: this.setUsingColumns(),
      sortInfo: this.setSortInfo(),
    };
  }

  componentDidMount() {
    this.setupSortableColumnItems();
  }

  setupSortableColumnItems = () => {
    const sortableListContainer = document.querySelector(
      "#sortable_list_container"
    ) as HTMLElement;
    if (sortableListContainer) {
      Sortable.create(sortableListContainer, {
        animation: 150,
        ghostClass: "blue-background-class",
        onSort: (evt) => {
          // console.log(evt);
          const { oldIndex = -1, newIndex = -1 } = evt;
          this.setState(({ usingColumns }) => {
            const nextState = [...usingColumns];
            const sortItem = nextState.splice(oldIndex, 1);
            nextState.splice(newIndex, 0, sortItem[0]);

            this.onSetCol(nextState);

            return {
              usingColumns: nextState,
            };
          });
        },
      });
    }
  };

  takeDS = () => {
    const { platformCtx, editingWidgetState } = this.props;
    const { ds } = editingWidgetState;
    if (!ds) return null;
    const { takeMeta } = platformCtx.meta;
    const dsMeta = takeMeta({
      metaAttr: "dataSource",
      metaRefID: ds,
    });
    return Object.values(dsMeta);
  };

  takeRange = () => {
    const { editingWidgetState } = this.props;
    const { rangeList } = editingWidgetState;
    if (!rangeList) return [];
    return rangeList;
  };

  ColIndexInUsingColumns = (col) => {
    const { id: fieldID, dsID } = col;
    const { usingColumns } = this.state;
    return usingColumns.findIndex((item) => {
      return (
        item.type === "dsColumn" &&
        item.fieldID === fieldID &&
        item.dsID === dsID
      );
    });
  };

  setCol = (item) => {
    const { usingColumns } = this.state;
    const myIndexInUsingColumns = this.ColIndexInUsingColumns(item);
    const nextState = [...usingColumns];
    if (myIndexInUsingColumns === -1) {
      nextState.push(genRenderColumn(item));
    } else {
      nextState.splice(myIndexInUsingColumns, 1);
    }
    this.setState(
      {
        usingColumns: nextState,
      },
      () => this.setupSortableColumnItems()
    );

    this.onSetCol(nextState);
  };

  onSetCol = (nextState) => {
    const { changeEntityState } = this.props;
    changeEntityState({
      attr: "columns",
      value: nextState,
    });
  };

  setUsingColumns = () => {
    const { editingWidgetState } = this.props;
    const { columns } = editingWidgetState || {};
    return columns || [];
  };

  setSortInfo = () => {
    const { editingWidgetState } = this.props;
    const { sortInfo } = editingWidgetState || {};
    return sortInfo || [];
  };

  renderColumnSelector = () => {
    const { datasourceMeta } = this.state;
    if (!datasourceMeta) return null;
    return (
      <DropdownWrapper
        outside
        overlay={(helper) => {
          return (
            <div className="column-selector-container" style={{ height: 300 }}>
              {(Array.isArray(datasourceMeta) &&
                datasourceMeta.map((ds) => {
                  const { columns, name: tableTitle } = ds;
                  return (
                    <div className="list-item" key={ds.id}>
                      <div className="disabled">{tableTitle}</div>
                      {Object.values(columns || {}).map((col, idx) => {
                        const { name, id } = col;
                        const isSelected =
                          this.ColIndexInUsingColumns(col) > -1;
                        return (
                          <div
                            onClick={() => {
                              // if (!isSelected) {
                              this.setCol(col);
                              // }
                            }}
                            className={`p1-1 list-item ${
                              isSelected ? "text-gray-500" : ""
                            }`}
                            key={id}
                          >
                            {`${tableTitle}.${name}`}
                          </div>
                        );
                      }) || null}
                    </div>
                  );
                })) ||
                null}
            </div>
          );
        }}
      >
        <span className="title flex items-center">
          <span>显示字段</span>
          <PlusOutlined
            style={{
              display: "inline-block",
              // fontSize: 16
            }}
          />
        </span>
      </DropdownWrapper>
    );
  };

  constructColumnAttr = (column) => {
    const { type } = column;
    if (type === "dsColumn") {
      return this.constructDsColumnAttr(column);
    }
    return {};
  };

  getDataShowType = ({ fieldShowType, colDataType }) => {
    const amIReferenceField = isReferenceField(colDataType);
    return amIReferenceField ? fieldShowType : "realVal";
  };

  getTargetDs = (dsID) => {
    const { datasourceMeta } = this.state;
    return datasourceMeta.find((item) => {
      return item.id === dsID;
    });
  };

  constructDsColumnAttr = (column) => {
    // TODO 数据源会支持带入附属表，需要改动
    const { dsID, fieldID } = column;
    const datasourceMeta = this.getTargetDs(dsID);
    const { fieldCode, colDataType } = datasourceMeta?.columns[fieldID] || {};
    const { fieldShowType } = column;
    const newDataShowType = this.getDataShowType({
      colDataType,
      fieldShowType,
    });
    return Object.assign({}, column, {
      tableTitle: datasourceMeta?.name,
      fieldCode,
      fieldShowType: newDataShowType,
      colDataType,
    });
  };

  updateCol = (item, id) => {
    const { usingColumns } = this.state;
    const itemIdx = usingColumns.findIndex((col) => col.id === id);
    const nextState = [...usingColumns];
    nextState.splice(itemIdx, 1, item);
    this.setState(
      {
        usingColumns: nextState,
      },
      () => this.setupSortableColumnItems()
    );
    this.onSetCol(nextState);
  };

  renderSelectedColumnMenu = (col, id) => {
    return (
      <Menu>
        <Menu.Item
          key="0"
          onClick={(e) => {
            const modalID = ShowModal({
              title: "编辑列",
              type: "side",
              position: "right",
              width: 300,
              children: () => {
                return (
                  <div>
                    <ColumnEditableItems
                      defaultValue={this.constructColumnAttr(col)}
                      onChange={(column) => {
                        this.updateCol(column, col.id);
                        CloseModal(modalID);
                      }}
                    />
                  </div>
                );
              },
            });
          }}
        >
          <span>编辑列</span>
        </Menu.Item>
        {/** TODO：编辑组件，改为在 3.2 实现 */}
        {/* <Menu.Item key="1">
          <span>编辑组件</span>
        </Menu.Item> */}
      </Menu>
    );
  };

  renderSelectedColumnEditor = () => {
    const { usingColumns, datasourceMeta } = this.state;
    if (!datasourceMeta) return null;
    return (
      <span id="sortable_list_container" className="flex">
        {usingColumns.map((col, idx) => {
          if (!col) return null;
          // console.log(col);
          const { id, title } = col;
          // const isActive = usingColumns.find((item) => item && item.id === id);
          return (
            <div
              className={`column-item idx-${idx}`}
              style={{ color: "inherit" }}
              key={id}
            >
              <Dropdown
                overlay={this.renderSelectedColumnMenu(col, id)}
                trigger={["click"]}
              >
                <span className="ant-dropdown-link">
                  <DownOutlined className="mr-2" />
                  {title}
                </span>
              </Dropdown>
              <CloseOutlined
                className="close __action"
                onClick={(e) => {
                  this.setCol({ id: col.fieldID, dsID: col.dsID });
                }}
              />
            </div>
          );
        })}
      </span>
    );
  };

  /**
   * column 的渲染器
   * TODO: 完善更强的 column 的数据结构抽象
   */
  renderSetColumn = () => {
    const { datasourceMeta } = this.state;
    if (!datasourceMeta) return null;
    return (
      <div className="column-selector py-2">
        <div className="mb10">{this.renderColumnSelector()}</div>
        {this.renderSelectedColumnEditor()}
      </div>
    );
  };

  takeSortInfo = (dsInMeta: [], sortInfo) => {
    const constructDs = () => {
      const result = {};
      dsInMeta?.forEach((ds) => {
        const { name: dsTitle, columns } = ds;
        Object.values(columns || {}).forEach((column) => {
          const { name: columnTitle, id: fieldID, dsID } = column;
          result[`${dsID}.${fieldID}`] = `${dsTitle}.${columnTitle}`;
        });
      });
      return result;
    };
    const titleMap = constructDs();
    return sortInfo
      ?.map((item) => {
        const { dsID, fieldID, sort } = item;
        const title = titleMap[`${dsID}.${fieldID}`];
        const titleSort = { DESC: "降序", ASC: "升序" }[sort];
        return `${title}: ${titleSort}; `;
      })
      .join("");
  };

  /**
   * 排序字段的渲染器
   */
  renderSortList = () => {
    const { datasourceMeta, sortInfo } = this.state;
    const { platformCtx, changeEntityState } = this.props;
    if (!datasourceMeta) return null;
    console.log(sortInfo);
    return (
      <div className="mb10">
        <div className="prop-label mb5">排序字段</div>
        <div className="prop-content">
          <span
            className="__label bg_default t_white cursor-pointer w-full"
            onClick={() => {
              platformCtx.selector.openFieldSortHelper({
                defaultValue: sortInfo,
                datasource: datasourceMeta,
                onSubmit: (sortInfoTmpl) => {
                  if (!Array.isArray(sortInfoTmpl) || sortInfoTmpl.length === 0)
                    return;
                  this.setState(
                    {
                      sortInfo: sortInfoTmpl,
                    },
                    () => {
                      changeEntityState({
                        attr: "sortInfo",
                        value: sortInfoTmpl,
                      });
                    }
                  );
                },
              });
            }}
          >
            {sortInfo?.length > 0
              ? this.takeSortInfo(datasourceMeta, sortInfo)
              : "点击配置排序字段"}
          </span>
        </div>
      </div>
    );
  };

  setDatasourceMetaForSelf = (datasourceMeta) => {
    this.setState({
      datasourceMeta,
    });
  };

  setRangeMetaForSelf = (rangeMeta) => {
    this.setState({
      rangeMeta,
    });
  };

  render() {
    const {
      changeEntityState,
      whichAttr,
      editingWidgetState,
      platformCtx,
    } = this.props;

    const { changeDataSource } = platformCtx.meta;

    const { datasourceMeta, rangeMeta } = this.state;
    // console.log(datasourceMeta);
    // 选项数据源的引用
    const DSOptionsRef = editingWidgetState[whichAttr] as string[] | undefined;

    const dsBinder = (
      <div
        className="px-4 py-2 border cursor-pointer"
        onClick={() => {
          platformCtx.selector.openDatasourceSelector({
            defaultSelected: Array.isArray(datasourceMeta)
              ? datasourceMeta
              : [],
            modalType: "normal",
            position: "top",
            single: true,
            typeArea: ["TABLE"],
            onSubmit: ({ close, interDatasources }) => {
              if (
                !Array.isArray(interDatasources) ||
                interDatasources.length === 0
              ) {
                close();
                return;
              }
              if (DSOptionsRef && DSOptionsRef[0] !== interDatasources[0].id) {
                this.setState(
                  {
                    usingColumns: [],
                  },
                  () => {
                    changeEntityState({
                      attr: "columns",
                      value: [],
                    });
                  }
                );
              }
              close();
              const nextMetaID = changeDataSource({
                type: "create/batch&rm/batch",
                rmMetaIDList: DSOptionsRef,
                dataList: interDatasources,
              });
              changeEntityState({
                attr: whichAttr,
                value: nextMetaID,
              });
              this.setDatasourceMetaForSelf(interDatasources);
            },
          });
        }}
      >
        {datasourceMeta ? takeTableInfo(datasourceMeta) : "点击绑定"}
      </div>
    );

    const rangeBinder = (
      <>
        <div className="label mb5 mt5"> 配置查询条件映射 </div>
        <div
          className="px-4 py-2 border cursor-pointer"
          onClick={() => {
            const modalID = ShowModal({
              title: "配置查询条件映射",
              width: "80vw",
              children: () => {
                return (
                  <div className="p-2">
                    <RangeListCreator
                      platformCtx={platformCtx}
                      initialValues={rangeMeta}
                      onSubmit={(rangeList) => {
                        changeEntityState({
                          attr: "rangeList",
                          value: rangeList,
                        });
                        this.setRangeMetaForSelf(rangeList);
                        CloseModal(modalID);
                      }}
                    />
                  </div>
                );
              },
            });
          }}
        >
          {rangeMeta?.length > 0
            ? takeRangeInfo(rangeMeta)
            : "点击配置查询条件映射"}
        </div>
      </>
    );

    return (
      <div>
        {dsBinder}
        {rangeBinder}
        {this.renderSetColumn()}
        {/* {this.renderSortList()} */}
      </div>
    );
  }
}
