/* eslint-disable no-nested-ternary */
/**
 * CanvasStage
 */
import React from "react";
import produce from "immer";
import dropRight from "lodash/dropRight";
import { Debounce } from "@mini-code/base-func";
import {
  TreeNodePath,
  getItemIdx,
  LayoutRenderer,
  makeWidgetEntity,
  makeTempWidgetEntity,
  getItemFromNestingItems,
  putItemInNestArray,
  SortingActionPut,
  SortingActionSwap,
  swapItemInNestArray,
  pullItemInNestArray,
  SortingActionPull,
  setItem2NestingArr,
} from "../../utils";
import {
  WrapperFacOptions,
  DragableItemWrapperFac,
  GetStateContext,
  WrapperItemClickEvent,
  DragItemMove,
} from "../../spec";
import { VEDispatcher, SelectEntityState } from "../../core";

import {
  LayoutInfoActionReducerState,
  EditableWidgetEntity,
} from "../../data-structure";
import DropStageContainer, { DropStageProps } from "./DropStageContainer";

/**
 * 中央舞台组件的 props
 */
export interface CanvasStageProps extends VEDispatcher {
  /** 组件包接入规范  */
  dragableItemWrapper: DragableItemWrapperFac;
  /** 页面的状态 */
  pageEntityState?: {
    style: CSSStyleRule;
  };
  /** 布局信息 */
  layoutNodeInfo: LayoutInfoActionReducerState;
  /** 选中的组件实例 */
  selectedInfo: SelectEntityState;
  accept: string[];
  /** 点击舞台的事件回调 */
  onStageClick?: () => void;
  /** 增加 entity 的回调 */
  onAddEntity?: (entity) => void;
  /** 判断是否可以拖入画布中 */
  triggerCondition?: DropStageProps["triggerCondition"];
}

// const debounceAddTempEntity = new Debounce();

type DragingItemCtx = TreeNodePath;
// interface DragingItemCtx {
//   /** 实时记录拖动元素在画布中的嵌套信息 */
//   treeNodePath: TreeNodePath;
//   /**
//    * 拖动元素的类型
//    * 1. temp：刚拖入到画布中的临时元素，此时还未赋值，被赋值后成为 entity
//    * 2. entity：被赋值 treeNodePath 后的元素
//    */
//   type?: "temp" | "entity";
// }

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

  getNodeItemFromNesting = (treeNodePath: TreeNodePath) => {
    return getItemFromNestingItems(
      this.getLayoutNodeInfo(),
      treeNodePath,
      "body"
    );
  };

  getLayoutNode = ({ treeNodePath }: GetStateContext) => {
    return this.getNodeItemFromNesting(treeNodePath);
  };

  /**
   * 查看组件实例是否被选中
   */
  getSelectedState = ({ id }: GetStateContext) => {
    return this.props.selectedInfo.id === id;
  };

  getEntityProps = ({ treeNodePath }: GetStateContext) => {
    return this.getNodeItemFromNesting(treeNodePath)?.propState;
  };

  addEntityToStage = () => {};

  createTempEntity = (nestInfo) => {
    const dragEntity = makeTempWidgetEntity();
    // this.props.AddTempEntity(dragEntity, {
    //   treeNodePath: nestInfo,
    // });
  };

  /**
   * @description
   * 1. 响应拖放的放的动作的调度器
   * 2. 用于实例化 widgetType
   */
  handleItemDrop = (dragWidgetMeta: EditableWidgetEntity, dropDndCtx?) => {
    const { AddEntity, SelectEntity, onAddEntity } = this.props;
    // // 切断原型链
    const widgetMetaCopy = { ...dragWidgetMeta };
    const treeNodePath = this.draggingItemIdx;
    // /** 是否已经实例化的组件 */
    const isMotify = widgetMetaCopy._state === "active";
    const entity = makeWidgetEntity(widgetMetaCopy);
    this.dropEnd(entity, () => {
      if (!isMotify && treeNodePath) {
        /** 实例化组件类 */
        // const entity = makeWidgetEntity(widgetMetaCopy);
        setTimeout(() => {
          SelectEntity(entity, treeNodePath);
          onAddEntity?.(entity);
        }, 100);
      }
    });
  };

  handleDeleteElement = ({ treeNodePath, entity }) => {
    this.props.DelEntity(treeNodePath, entity);
  };

  /**
   * 点击选择组件实例的处理
   */
  handleSelectEntityForClick: WrapperItemClickEvent = (actionCtx) => {
    const { SelectEntity, selectedInfo } = this.props;
    const { entity, treeNodePath } = actionCtx;
    /** 如果已经被选择，则不需要再触发事件 */
    if (treeNodePath.join("") === selectedInfo.treeNodePath.join("")) return;
    SelectEntity(entity, treeNodePath);
  };

  sortLayoutItems = (
    sortOptions: SortingActionSwap | SortingActionPut | SortingActionPull
  ) => {
    const { layoutNodeInfo, SetLayoutInfo } = this.props;

    const nextLayoutNodeInfo = produce(layoutNodeInfo, (draft) => {
      if (sortOptions.type === "swap") {
        const { sourceItemNestIdx, swapItemNestIdx } = sortOptions;
        if (
          sourceItemNestIdx &&
          swapItemNestIdx &&
          sourceItemNestIdx.length === swapItemNestIdx.length
        ) {
          swapItemInNestArray(draft, sourceItemNestIdx, swapItemNestIdx);

          /** 设置 draggingItemIdx 的类型为 entity */
          this.setDragCtx(swapItemNestIdx);
        } else {
          console.error(`交换的 idx 的长度不一致，请检查调用`);
        }
      } else if (sortOptions.type === "put") {
        const { sourceItemNestIdx, putIdx, putItemNestIdx } = sortOptions;
        const swapItemNestIdx = putItemInNestArray(
          draft,
          sourceItemNestIdx,
          putItemNestIdx,
          putIdx
        );

        /** 设置 draggingItemIdx 的类型为 entity */
        this.setDragCtx(swapItemNestIdx);
      } else if (sortOptions.type === "pull") {
        const { sourceItemNestIdx, toNestIdx } = sortOptions;
        // console.log(sortOptions);
        pullItemInNestArray(draft, sourceItemNestIdx, toNestIdx);

        /** 设置 draggingItemIdx 的类型为 entity */
        this.setDragCtx(toNestIdx);
      }

      return draft;
    });

    this.tempLayoutNodeInfo = nextLayoutNodeInfo;
    this.forceUpdate();

    // SetLayoutInfo(nextLayoutNodeInfo);
  };

  /**
   * 响应元素的拖事件，作用于排序
   */
  handleItemMove: DragItemMove = (
    dragItemNestIdx,
    hoverItemNestIdx,
    options
  ) => {
    const { type, direction } = options || {};
    if (!dragItemNestIdx) {
      /** 防止没有 dragItemNestIdx 而产生坏数据 */
      return;
    }
    const _dragItemNestIdx = this.draggingItemIdx;

    if (!_dragItemNestIdx) {
      console.log(`没有 this.draggingItemIdx，请先调用 dragStart()`);
      return;
    }
    // const _dragItemNestIdx = dragItemNestIdx;
    // if (_dragItemNestIdx.length === 0 && this.draggingItemIdx?.treeNodePath) {
    //   /** 如果是 temp entity，则将 draggingItemIdx treeNodePath 赋值给 _dragItemNestIdx */
    //   _dragItemNestIdx = this.draggingItemIdx?.treeNodePath;
    // }
    /** 取消由进入画布时触发的添加临时组件 */
    // debounceAddTempEntity.cancel();

    // this.createTempEntity(_dragItemNestIdx);
    // const dragEntity = this.getNodeItemFromNesting(_dragItemNestIdx);
    // if (!dragEntity) return;
    this.insertTempItem(hoverItemNestIdx);
    this.forceUpdate();

    // if (type === "sort") {
    //   this.sortLayoutItems({
    //     type: "swap",
    //     sourceItemNestIdx: _dragItemNestIdx,
    //     swapItemNestIdx: hoverItemNestIdx,
    //   });
    // } else if (type === "enter") {
    //   const dragContainerEntity = this.getNodeItemFromNesting(hoverItemNestIdx);
    //   const containerChildLen = dragContainerEntity.body?.length || 0;

    //   /**
    //    * 1. 如果是从上方或者左边进入容器，则将元素插入到容器的第 0 位
    //    * 2. 如果从下方或者右边进入容器，则将元素插入到容器的末尾
    //    */
    //   const putIdx = /top|left/.test(direction) ? 0 : containerChildLen;

    //   this.sortLayoutItems({
    //     type: "put",
    //     sourceItemNestIdx: _dragItemNestIdx,
    //     putItemNestIdx: hoverItemNestIdx,
    //     putIdx,
    //   });
    // } else if (type === "exit") {
    //   const brotherNodeIdx = getItemIdx(hoverItemNestIdx) || 0;
    //   const toLastIdx = /top|left/.test(direction)
    //     ? brotherNodeIdx - 1
    //     : brotherNodeIdx + 1;

    //   this.sortLayoutItems({
    //     type: "pull",
    //     sourceItemNestIdx: _dragItemNestIdx,
    //     toNestIdx: [...dropRight(_dragItemNestIdx, 2), toLastIdx],
    //   });
    // }
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

  handleItemHover = (hoverItemIdx, { type, isContainer }) => {
    /**
     * 1. 处理元素移入
     * 2. 维护 temp 元素的拖拽上下文
     */
    if (!this.draggingItemIdx) {
      this.draggingItemIdx = [hoverItemIdx[0] + 1];
      this.sortLayoutItems({
        type: "swap",
        sourceItemNestIdx: hoverItemIdx,
        swapItemNestIdx: this.draggingItemIdx,
      });
    }
  };

  setDragCtx = (ctx: DragingItemCtx) => {
    if (!this.draggingItemIdx) {
      console.error(`this.draggingItemIdx 为空，请检查调用链路`);
    }
    this.draggingItemIdx = ctx;
  };

  dragStart = (treeNodePath, type: DraggingItemType = "entity", dragItem?) => {
    /** 如果已经有元素在拖起了 */
    if (this.draggingItemIdx) return;
    this.draggingItemType = type;
    this.draggingItemIdx = treeNodePath;
    // this.draggingItemIdx = null;
    this.insertTempItem(treeNodePath);
    this.forceUpdate();
  };

  /**
   * 清理 drag item 的上下文
   */
  dropEnd = (dropItem?, postCallback?) => {
    if (this.draggingItemType === "entity") {
      const { layoutNodeInfo, SetLayoutInfo } = this.props;
      const nextLayoutNodeInfo = produce(layoutNodeInfo, (draft) => {
        if (this.draggingItemIdx) {
          return swapItemInNestArray(
            draft,
            this.sourceDragItemIdx,
            this.draggingItemIdx
          );
        }
        return draft;
      });
      SetLayoutInfo(nextLayoutNodeInfo);
    }

    if (this.draggingItemType === "temp") {
      const { layoutNodeInfo, SetLayoutInfo } = this.props;
      const nextLayoutNodeInfo = produce(layoutNodeInfo, (draft) => {
        if (this.draggingItemIdx) {
          return setItem2NestingArr(draft, this.draggingItemIdx, {
            addItem: dropItem,
            spliceCount: 0,
          });
        }
        return draft;
      });
      // console.log(nextLayoutNodeInfo);
      SetLayoutInfo(nextLayoutNodeInfo);
    }

    postCallback?.();

    this.cleanDragCtx();
  };

  cleanDragCtx = () => {
    this.draggingItemIdx = null;
    this.tempLayoutNodeInfo = null;
    this.draggingItemType = null;
    this.sourceDragItemIdx = null;

    this.forceUpdate();
  };

  insertTempItem = (tempItemNestingIdx) => {
    const dragEntity = makeTempWidgetEntity();
    this.draggingItemIdx = tempItemNestingIdx;
    this.tempLayoutNodeInfo = produce(this.props.layoutNodeInfo, (draft) => {
      const spliceCount = 0;
      return setItem2NestingArr(draft, tempItemNestingIdx, {
        addItem: dragEntity,
        spliceCount,
      });
    });
    return this.tempLayoutNodeInfo;
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
    getSelectedState: this.getSelectedState,
    getEntityProps: this.getEntityProps,
    onItemHover: this.handleItemHover,
    onItemDrag: this.handleItemDrag,
    onItemDrop: this.handleItemDrop,
    onItemMove: this.handleItemMove,
    onDelete: this.handleDeleteElement,
    onItemClick: this.handleSelectEntityForClick,
    updateEntityState: this.props.UpdateEntityState,
  };

  render() {
    const {
      pageEntityState,
      accept,
      onStageClick,
      triggerCondition,
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
            <DropStageContainer
              triggerCondition={triggerCondition}
              accept={accept}
              onEnter={(item, dragOffset) => {
                /**
                 * 临时方案
                 * TODO: 调整
                 */
                const layoutNodeInfoLen = layoutNodeInfo.length;
                this.dragStart([layoutNodeInfoLen], "temp", item);
                /** 设置 dragClass 的 index，用于排序，维护 temp 元素的拖拽生命周期 */
                // this.setDragCtx([layoutNodeInfoLen]);
                // this.createTempEntity(this.draggingItemIdx);
              }}
              onLeave={(item) => {
                /** 移出 item */
                if (this.draggingItemIdx) {
                  this.handleDeleteElement({
                    treeNodePath: this.draggingItemIdx,
                    entity: item,
                  });
                }

                this.dropEnd();
              }}
              onItemDrop={(_dragableItemDef, dropOptions) => {
                if (this.draggingItemIdx) {
                  this.handleItemDrop(_dragableItemDef);
                }

                this.dropEnd();
              }}
              onStageClick={onStageClick}
              style={pageStyle}
            >
              {hasNode ? child : <div>请从左边拖入组件</div>}
            </DropStageContainer>
          )}
        />
      </div>
    );
  }
}

export default CanvasStage;
