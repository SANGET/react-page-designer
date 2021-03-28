/* eslint-disable no-nested-ternary */
/**
 * CanvasStage
 */
import React from "react";
import produce from "immer";
import { Modal } from "antd";
import {
  TreeNodePath,
  LayoutRenderer,
  makeWidgetEntity,
  treeNodeHelper,
  GetPropItemMeta,
} from "../../utils";
import {
  WrapperFacOptions,
  DragableItemWrapperFac,
  GetStateContext,
  WrapperItemClickEvent,
  DragItemMove,
  OnItemDrop,
} from "../../spec";
import { VEDispatcher, SelectEntityState } from "../../core";

import {
  LayoutInfoActionReducerState,
  EditableWidgetEntity,
} from "../../data-structure";
import DropStageContainer, { DropStageProps } from "./DropStageContainer";
import { makeLayoutEntity } from "./make-layout-entity";
import { StageContextRes } from "../../utils/stage-context";

/**
 * 中央舞台组件的 props
 */
export interface CanvasStageProps extends VEDispatcher {
  /** 组件包接入规范  */
  dragableItemWrapper: DragableItemWrapperFac;
  /** 获取属性项的 meta 数据 */
  getPropItemMeta: GetPropItemMeta;
  /** 页面的状态 */
  pageEntityState?: {
    style: CSSStyleRule;
  };
  /** 布局信息 */
  layoutNodeInfo: LayoutInfoActionReducerState;
  /** 选中的组件实例 */
  // selectedInfo: SelectEntityState;
  accept: string[];
  stageCtx: StageContextRes;
  /** 点击舞台的事件回调 */
  onStageClick?: () => void;
  onItemHover?: (treeNodePath) => void;
  onEntityClick?: (treeNodePath) => void;
  /** 增加 entity 的回调 */
  onAddEntity?: (entity, locatedIndexOfTreeForSelect) => void;
}

// const debounceAddTempEntity = new Debounce();

type DragingItemCtx = TreeNodePath;

type DraggingItemType = "temp" | "entity" | null;

/**
 * 中央舞台组件
 */
class CanvasStage extends React.Component<CanvasStageProps> {
  /**
   * drag item 的 idx
   */
  draggingItemIdx: DragingItemCtx | null = null;

  /** 被拖起来的源 item */
  sourceDragItemIdx: DragingItemCtx | null = null;

  /** 被拖起来的源 item */
  hoveringItemIdx: DragingItemCtx | null = null;

  draggingItemType: DraggingItemType = null;

  /**
   * 用于拖拽排序时，临时产生的布局信息
   */
  tempLayoutNodeInfo: LayoutInfoActionReducerState | null = null;

  componentDidCatch(error, errorInfo) {
    console.log(error, errorInfo);
    Modal.error({
      title: `组件渲染错误`,
      content: (
        <div style={{ maxHeight: 300, overflow: "auto" }}>
          {JSON.stringify(errorInfo)}
        </div>
      ),
    });
  }

  getNodeItemFromNesting = (locatedIndexOfTree: TreeNodePath) => {
    return treeNodeHelper(this.getLayoutNodeInfo(), {
      type: "get",
      locatedIndexOfTree,
    });
  };

  getLayoutNode = ({ treeNodePath }: GetStateContext) => {
    return this.getNodeItemFromNesting(treeNodePath);
  };

  getEntityProps = ({ treeNodePath }: GetStateContext) => {
    return this.getNodeItemFromNesting(treeNodePath)?.propState;
  };

  /**
   * @description
   * 1. 响应拖放的放的动作的调度器
   * 2. 用于实例化 widgetType
   */
  handleItemDrop: OnItemDrop = (
    dragWidgetMeta: EditableWidgetEntity,
    dropDndCtx
  ) => {
    const {
      layoutNodeInfo,
      getPropItemMeta,
      SetLayoutInfo,
      // SelectEntity,
      onAddEntity,
    } = this.props;
    const {
      dragItemNodePath,
      dropItemNodePath,
      overingDirection,
      isDropItemContainer,
    } = dropDndCtx;
    // // 切断原型链
    const widgetMetaCopy = { ...dragWidgetMeta };
    // const treeNodePath = this.draggingItemIdx;
    const isTop2BottomHover = overingDirection === "bottom";
    const isTop2BottomSort = dragItemNodePath.join() < dropItemNodePath.join();

    // /** 是否已实例化的组件 */
    const isWidgetEntity = widgetMetaCopy._state === "active";
    let entity = !isWidgetEntity
      ? makeWidgetEntity(widgetMetaCopy, getPropItemMeta)
      : widgetMetaCopy;

    let locatedIndexOfTreeForSelect: number[] = [];

    const getPut2Index = (nextLayoutNodeInfo) => {
      let put2Index = 0;
      if (isTop2BottomHover) {
        const containerList = treeNodeHelper(nextLayoutNodeInfo, {
          type: "get",
          locatedIndexOfTree: dropItemNodePath,
        });
        if (containerList?.body) {
          put2Index = containerList?.body.length;
        }
      }
      return put2Index;
    };

    if (isDropItemContainer) {
      // 拖入容器
      let nextLayoutNodeInfo = layoutNodeInfo;
      if (isWidgetEntity) {
        locatedIndexOfTreeForSelect = dragItemNodePath;
        // const targetNode = treeNodeHelper(nextLayoutNodeInfo, {
        //   type: "get",
        //   locatedIndexOfTree: dragItemNodePath,
        // });
        const put2Index = getPut2Index(layoutNodeInfo);
        if (isTop2BottomSort) {
          // 如果是拖到最顶部，则先插入元素，然后删除拖动的元素
          nextLayoutNodeInfo = treeNodeHelper(nextLayoutNodeInfo, {
            type: "set",
            spliceCount: 0,
            locatedIndexOfTree: [...dropItemNodePath, put2Index],
            addItem: entity,
          });
          nextLayoutNodeInfo = treeNodeHelper(nextLayoutNodeInfo, {
            type: "set",
            spliceCount: 1,
            locatedIndexOfTree: dragItemNodePath,
          });
        } else {
          // 如果是拖到最低部，先删掉拖动的元素，然后插入元素
          nextLayoutNodeInfo = treeNodeHelper(nextLayoutNodeInfo, {
            type: "set",
            spliceCount: 1,
            locatedIndexOfTree: dragItemNodePath,
          });
          nextLayoutNodeInfo = treeNodeHelper(nextLayoutNodeInfo, {
            type: "set",
            spliceCount: 0,
            locatedIndexOfTree: [...dropItemNodePath, put2Index],
            addItem: entity,
          });
        }
      } else {
        const put2Index = getPut2Index(layoutNodeInfo);
        locatedIndexOfTreeForSelect = [...dropItemNodePath, put2Index];
        if (entity.widgetRef === "FlexLayout") {
          entity = makeLayoutEntity(getPropItemMeta);
          /** 布局组件的特殊处理 */
          nextLayoutNodeInfo = treeNodeHelper(nextLayoutNodeInfo, {
            type: "set",
            spliceCount: 0,
            locatedIndexOfTree: locatedIndexOfTreeForSelect,
            addItem: entity,
          });
        } else {
          nextLayoutNodeInfo = treeNodeHelper(nextLayoutNodeInfo, {
            type: "set",
            spliceCount: 0,
            locatedIndexOfTree: locatedIndexOfTreeForSelect,
            addItem: entity,
          });
        }
      }

      SetLayoutInfo(nextLayoutNodeInfo);
    } else {
      let nextLayoutNodeInfo = layoutNodeInfo;
      if (isWidgetEntity) {
        // TODO: 这里的排序有 bug
        // 拖拽排序
        if (
          overingDirection === "bottom" &&
          dragItemNodePath.join() > dropItemNodePath.join()
        ) {
          /// 无需排序的情况
          return;
        }
        if (
          overingDirection === "top" &&
          dragItemNodePath.join() < dropItemNodePath.join()
        ) {
          /// 无需排序的情况
          return;
        }
        locatedIndexOfTreeForSelect = dropItemNodePath;
        nextLayoutNodeInfo = treeNodeHelper(nextLayoutNodeInfo, {
          type: "set",
          spliceCount: 1,
          locatedIndexOfTree: dragItemNodePath,
        });
        nextLayoutNodeInfo = treeNodeHelper(nextLayoutNodeInfo, {
          type: "set",
          spliceCount: 0,
          locatedIndexOfTree: dropItemNodePath,
          addItem: entity,
        });
      } else if (entity.widgetRef === "FlexLayout") {
        locatedIndexOfTreeForSelect = dropItemNodePath;
        const layoutEntities = makeLayoutEntity(getPropItemMeta);
        /** 布局组件的特殊处理 */
        nextLayoutNodeInfo = treeNodeHelper(nextLayoutNodeInfo, {
          type: "set",
          spliceCount: 0,
          locatedIndexOfTree: dropItemNodePath,
          addItem: layoutEntities,
        });
      } else {
        locatedIndexOfTreeForSelect = dropItemNodePath;
        nextLayoutNodeInfo = treeNodeHelper(nextLayoutNodeInfo, {
          type: "set",
          spliceCount: 0,
          locatedIndexOfTree: dropItemNodePath,
          addItem: entity,
        });
      }

      SetLayoutInfo(nextLayoutNodeInfo);
    }

    onAddEntity?.(entity, locatedIndexOfTreeForSelect);
    setTimeout(() => {
      // SelectEntity(entity, locatedIndexOfTreeForSelect);
    });
  };

  handleDeleteElement = ({ treeNodePath, entity }) => {
    this.props.DelEntity(treeNodePath, entity);
  };

  /**
   * 点击选择组件实例的处理
   */
  handleSelectEntityForClick: WrapperItemClickEvent = (actionCtx) => {
    const { entity, treeNodePath } = actionCtx;
    const { onEntityClick } = this.props;
    onEntityClick?.(treeNodePath);
    // const { SelectEntity, selectedInfo } = this.props;
    // /** 如果已经被选择，则不需要再触发事件 */
    // if (treeNodePath.join("") === selectedInfo.treeNodePath.join("")) return;
    // SelectEntity(entity, treeNodePath);
  };

  /**
   * 响应元素的拖事件，作用于排序
   */
  handleItemMove: DragItemMove = (dragItemNestIdx, hoverItemNestIdx) => {
    if (!dragItemNestIdx) {
      return;
    }

    // this.insertTempItem(hoverItemNestIdx);
    this.forceUpdate();
  };

  /**
   * 维护 dragging item 上下文
   * @param dragCtx
   */
  handleItemDrag = (dragItem, dragCtx) => {
    // this.setDragCtx(dragCtx.treeNodePath);
    // this.createTempEntity(dragCtx.treeNodePath);
    this.sourceDragItemIdx = dragCtx;
    this.dragStart(dragCtx, "entity");
  };

  handleItemEnter = (containerIdx) => {
    // this.insertTempItem([...containerIdx, 0]);
    // this.forceUpdate();
  };

  dragStart = (treeNodePath, type: DraggingItemType = "entity", dragItem?) => {
    /** 如果已经有元素在拖起了 */
    if (this.draggingItemIdx) return;
    this.draggingItemType = type;
    this.draggingItemIdx = treeNodePath;
    // this.draggingItemIdx = null;
    // this.insertTempItem(treeNodePath);
    this.forceUpdate();
  };

  getLayoutNodeInfo = () => {
    if (this.tempLayoutNodeInfo) {
      return this.tempLayoutNodeInfo;
    }
    return this.props.layoutNodeInfo;
  };

  /**
   * 接入标准的上下文
   */
  wrapperContext: WrapperFacOptions = {
    getLayoutNode: this.getLayoutNode,
    getEntityProps: this.getEntityProps,
    onItemDrag: this.handleItemDrag,
    onItemDrop: this.handleItemDrop,
    onItemMove: this.handleItemMove,
    onDelete: this.handleDeleteElement,
    onItemEnter: this.handleItemEnter,
    onItemClick: this.handleSelectEntityForClick,
    updateEntityState: this.props.UpdateEntityState,
    stageCtx: this.props.stageCtx,
  };

  render() {
    const {
      pageEntityState,
      // accept,
      onStageClick,
      dragableItemWrapper,
    } = this.props;
    // console.log(layoutNodeInfo);
    const layoutNodeInfo = this.getLayoutNodeInfo();
    const hasNode = layoutNodeInfo.length > 0;

    const pageStyle = pageEntityState?.style;

    return (
      <div className="canvas-stage-container">
        <LayoutRenderer
          layoutNode={layoutNodeInfo}
          componentRenderer={dragableItemWrapper(this.wrapperContext)}
          RootRender={(child) => (
            <DropStageContainer onStageClick={onStageClick} style={pageStyle}>
              {hasNode ? child : <div>请从左边拖入组件</div>}
            </DropStageContainer>
          )}
        />
      </div>
    );
  }
}

export default CanvasStage;
