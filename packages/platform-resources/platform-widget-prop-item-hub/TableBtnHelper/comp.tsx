import React from "react";
import { Menu, Dropdown } from "antd";
import { PropItemRenderContext } from "@provider-app/platform-access-spec";
import { PlusOutlined, CloseOutlined, DownOutlined } from "@ant-design/icons";
import Sortable from "sortablejs";
import { DropdownWrapper } from "@provider-app/shared-ui";
import {
  getWidgetMetadata,
  getPropItemGroupingData,
} from "@provider-app/provider-app-common/services/widget-loader";
import { makeWidgetEntity } from "@provider-app/page-visual-editor-engine/utils";

type UsingBtn = {
  type: "create" | "update" | "detail" | "delete";
  title: string;
};
type Btn = { type: "create" | "update" | "detail" | "delete"; title: string };
interface TableBtnHelperCompState {
  headerBtns?: UsingBtn[];
  inlineBtns?: UsingBtn[];
  btnList: Btn[];
}

/**
 * 构实例数据
 * @param widgetRef
 * @returns
 */
const prepareData = async (widgetRef, getPropItemMeta) => {
  const [widgetMeta] = await Promise.all([
    getWidgetMetadata(widgetRef),
    getPropItemGroupingData(),
  ]);
  return makeWidgetEntity(widgetMeta, getPropItemMeta);
};
export default class TableBtnHelperComp extends React.Component<
  PropItemRenderContext,
  TableBtnHelperCompState
> {
  constructor(props) {
    super(props);
    this.state = {
      headerBtns: this.setHeaderBtns(),
      inlineBtns: this.setInlineBtns(),
      btnList: [
        { type: "create", title: "新增" },
        { type: "update", title: "修改" },
        { type: "detail", title: "查看" },
        { type: "delete", title: "删除" },
      ],
    };
  }

  setHeaderBtns = () => {
    const { editingWidgetState } = this.props;
    const { headerBtns } = editingWidgetState || {};
    return headerBtns || [];
  };

  setInlineBtns = () => {
    const { editingWidgetState } = this.props;
    const { inlineBtns } = editingWidgetState || {};
    return inlineBtns || [];
  };

  BtnIndexInUsingBtns = ({ place, btn }) => {
    const { type } = btn;
    const usingBtns = this.state[place];
    const index = usingBtns?.findIndex((item) => {
      return item.type === type;
    });
    return index;
  };

  genRenderBtn = async (btn, place) => {
    const { type, title } = btn;
    const widgetEntity = await (prepareData("FormButton") || {});
    const newWidgetEntity = {
      ...widgetEntity,
      propState: {
        ...(widgetEntity.propState || {}),
        title: title || "自定义",
        size: place === "inlineBtns" ? "small" : "middle",
      },
      type,
      title: title || "自定义",
    };
    return newWidgetEntity;
  };

  setBtn = async ({
    place,
    btn,
    mode,
  }: {
    place: "headerBtns" | "inlineBtns";
    btn: Btn;
    mode?: "delete" | "update" | "insert";
  }) => {
    const myIndexInUsingBtns = this.BtnIndexInUsingBtns({ place, btn });
    const nextBtns = this.getBtnsByPlace(place);
    if (myIndexInUsingBtns === -1 || mode === "insert") {
      const newBtn = await this.genRenderBtn(btn, place);
      nextBtns.push(newBtn);
    } else if (mode === "delete") {
      nextBtns.splice(myIndexInUsingBtns, 1);
    } else {
      nextBtns.splice(myIndexInUsingBtns, 1, btn);
    }
    this.onSetBtn(place, nextBtns);
    this.setState(this.genBtnsByPlace(place, nextBtns), () =>
      this.setupSortableHeaderItems(place)
    );
  };

  getBtnsByPlace = (place) => {
    if (place === "headerBtns") {
      return [...this.state.headerBtns];
    }
    if (place === "inlineBtns") {
      return [...this.state.inlineBtns];
    }
    return [];
  };

  genBtnsByPlace = (place, nextBtns) => {
    if (place === "headerBtns") {
      return { headerBtns: nextBtns };
    }
    if (place === "inlineBtns") {
      return { inlineBtns: nextBtns };
    }
    return {};
  };

  setupSortableHeaderItems = (place: "headerBtns" | "inlineBtns") => {
    const sortableListContainer = document.querySelector(
      `#sortable_${place}_list_container`
    ) as HTMLElement;
    if (sortableListContainer) {
      Sortable.create(sortableListContainer, {
        animation: 150,
        ghostClass: "blue-background-class",
        onSort: (evt) => {
          // console.log(evt);
          const { oldIndex = -1, newIndex = -1 } = evt;
          const nextBtns = this.getBtnsByPlace(place);
          const sortItem = nextBtns.splice(oldIndex, 1);
          nextBtns.splice(newIndex, 0, sortItem[0]);

          this.onSetBtn(place, nextBtns);
          this.setState(this.genBtnsByPlace(place, nextBtns));
        },
      });
    }
  };

  onSetBtn = (place, nextState) => {
    const { changeEntityState } = this.props;
    changeEntityState({
      attr: place,
      value: nextState,
    });
  };

  renderBtnSelector = ({ place }) => {
    return (
      <DropdownWrapper
        outside
        overlay={(helper) => {
          return (
            <div className="column-selector-container">
              {this.state.btnList.map((btn) => {
                const { type, title } = btn;
                const isSelected =
                  this.BtnIndexInUsingBtns({ place, btn }) > -1;
                return (
                  <div
                    onClick={() => {
                      if (!isSelected) {
                        this.setBtn({ place, btn });
                      }
                    }}
                    className={`p1-1 list-item ${isSelected ? "disabled" : ""}`}
                    key={type}
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
          <span>{place === "headerBtns" ? "表头" : "行内"}按钮</span>
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

  renderSelectedColumnMenu = (btn, place) => {
    const { platformCtx } = this.props;
    return (
      <Menu>
        <Menu.Item
          key="0"
          onClick={(e) => {
            // "widgetRef": "FormButton",
            platformCtx.selector.openPDPropertiesEditor(
              {
                needHeader: false,
                position: "right",
                width: 300,
                modalType: "side",
              },
              {
                platformCtx,
                pageMetadata: platformCtx.meta.getPageMeta(),
                selectedEntity: btn,
                entityState: btn.propState,
                updateEntityState: (propState) => {
                  this.setBtn({
                    place,
                    btn: {
                      ...btn,
                      propState,
                      title: propState.title,
                    },
                  });
                },
              }
            );
            // const modalID = ShowModal({
            //   title: "编辑按钮",
            //   id: "side",
            //   position: "right",
            //   width: 300,
            //   children: () => {
            //     return <div></div>;
            //   },
            // });
          }}
        >
          <span>编辑按钮</span>
        </Menu.Item>
        {/** TODO：编辑组件，改为在 3.2 实现 */}
        {/* <Menu.Item key="1">
          <span>编辑组件</span>
        </Menu.Item> */}
      </Menu>
    );
  };

  renderSelectedBtnEditor = ({ place }) => {
    const usingBtns = this.state[place];
    return (
      <span
        id={`sortable_${place}_list_container`}
        className="flex sort-btn-list-container"
      >
        {usingBtns.map((btn, idx) => {
          if (!btn) return null;
          // console.log(col);
          const { id, propState } = btn;
          // const isActive = usingColumns.find((item) => item && item.id === id);
          return (
            <div
              className={`column-item idx-${idx}`}
              style={{ color: "inherit" }}
              key={id}
            >
              <Dropdown
                overlay={this.renderSelectedColumnMenu(btn, place)}
                trigger={["click"]}
              >
                <span className="ant-dropdown-link">
                  <DownOutlined className="mr-2" />
                  {propState?.title}
                </span>
              </Dropdown>
              <CloseOutlined
                className="close __action"
                onClick={(e) => {
                  this.setBtn({ place, btn, mode: "delete" });
                }}
              />
            </div>
          );
        })}
      </span>
    );
  };

  renderBtn = ({ place }) => {
    return (
      <div className="column-selector py-4">
        <div className="">{this.renderBtnSelector({ place })}</div>
        {this.renderSelectedBtnEditor({ place })}
      </div>
    );
  };

  render() {
    return (
      <div>
        {this.renderBtn({ place: "headerBtns" })}
        {this.renderBtn({ place: "inlineBtns" })}
      </div>
    );
  }
}
