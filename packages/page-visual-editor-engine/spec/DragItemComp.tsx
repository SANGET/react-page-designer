/* eslint-disable no-lonely-if */
import React, { useState, useRef } from "react";
import { useDrag, useDrop, XYCoord } from "react-dnd";
import clas from "classnames";
import { TargetType } from "dnd-core";
import { TreeNodePath, getItemParentIdx } from "../utils";
import {
  DnDContext,
  DragableItemTypes,
  DragItemActions,
  OveringDirection,
} from ".";
import { DragableItemType, DropCollectType } from "../data-structure";

type DefaultDragableWidgetType = Record<string, unknown>;

/**
 * 作用于 dragItem 传递到 drop 容器的参数配置
 */
interface DraggedItemInfo<D = DefaultDragableWidgetType> {
  treeNodePath?: TreeNodePath;
  parentIdx?: TreeNodePath;
  type: string | symbol;
  dragableWidgetType: DragableItemType & D;
  wrapper?: (child, wrapperCtx: { ref; classNames }) => React.ElementType;
}

type OmitHtmlAttr = "children" | "id";
type HtmlAttr = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  keyof DragItemActions | keyof DraggedItemInfo | OmitHtmlAttr
>;

export interface DragItemCompProps<D = DefaultDragableWidgetType, C = any>
  extends DraggedItemInfo<D>,
    DragItemActions,
    HtmlAttr {
  id: string;
  /** 用于排序时判断排序位置的 pixel */
  thresholds?: number;
  component?: string | React.ElementType;
  children: React.ReactChild;
  accept: TargetType;
  /** 是否为容器 */
  isContainer?: boolean;
  /** 拖动排序的方向，x 轴 ｜ y 轴 */
  sortDirection?: "x" | "y";
  treeNodePath?: TreeNodePath;
  /** 是否可排序 */
  sortable?: boolean;
  dragable?: boolean;
}

/** 被其他可拖拽元素覆盖的信息 */
const overingInfo = {
  direction: "",
};

/**
 * 拖拽容器
 */
export const DragItemComp: React.FC<DragItemCompProps> = ({
  children,
  dragableWidgetType,
  style,
  type,
  component: Comp = "div",
  className,
  sortable,
  dragable,
  sortDirection = "y",
  treeNodePath,
  isContainer,
  // thresholds = 0.3,
  accept,
  wrapper,
  onItemHover,
  onItemMove,
  onItemDrop,
  onItemDrag,
  onItemEnter,
  onItemLeave,
  ...other
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [overingDirection, setOveringDirection] = useState<OveringDirection>(
    ""
  );

  const [{ isOverCurrent, canDrop }, drop] = useDrop<
    DragableItemType,
    void,
    DropCollectType
  >({
    accept,
    drop: (item, monitor) => {
      /**
       * 使用文档参考: https://react-dnd.github.io/react-dnd/docs/api/use-drop
       */
      const {
        dragableWidgetType: dragedItemType,
        treeNodePath: dragItemNodePath,
      } = item;
      // const dropItemData = monitor.getD`
      /**
       * isOverCurrent 判断是否拖动在容器内
       */
      if (isOverCurrent) {
        setTimeout(() => {
          if (onItemDrop && treeNodePath) {
            const dropTargetCtx: DnDContext = {
              dropItemNodePath: [...treeNodePath],
              dragItemNodePath: [...(dragItemNodePath || [])],
              isDropItemContainer: isContainer,
              overingDirection,
            };
            onItemDrop({ ...dragedItemType }, dropTargetCtx);
          }
        });
      }
    },
    // canDrop: ({ dragableWidgetType: widgetType }, monitor) => {
    //   /** 不允许放到自身 */
    //   return widgetType.id !== id;
    // },
    collect: (monitor) => {
      return {
        // isOver: !!monitor.isOver(),
        isOver: monitor.isOver(),
        isOverCurrent: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop(),
      };
    },
    hover: (dragItem, monitor) => {
      if (!ref.current || !treeNodePath?.join("")) {
        return;
      }

      const dragItemNodePath = dragItem.treeNodePath || [];
      const hoverIndex = [...treeNodePath];

      // Don't replace items with themselves
      if (dragItemNodePath.join("") === hoverIndex.join("")) {
        return;
      }
      // onItemHover?.(hoverIndex);
      dragItem.parentIdx =
        dragItem.parentIdx || getItemParentIdx(dragItemNodePath);

      const dragIndex = [...dragItemNodePath];

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      // const hoverBoundingHeight = ref.current?.offsetHeight / 2;
      // const hoverBoundingWidth = ref.current?.offsetWidth / 2;

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      // Get vertical middle
      const hoverMiddleX =
        (hoverBoundingRect.right - hoverBoundingRect.left) / 2;

      // Get horizontal middle
      // const hoverMiddleX =
      //   (hoverBoundingRect.right - hoverBoundingRect.left) / 2;

      /** 可交换的边界 */
      // const topBoundary = hoverMiddleY - hoverBoundingHeight * thresholds;
      // const buttonBoundary = hoverMiddleY + hoverBoundingHeight * thresholds;
      // const leftBoundary = hoverMiddleX - hoverBoundingWidth * thresholds;
      // const rightBoundary = hoverMiddleX + hoverBoundingWidth * thresholds;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      const hoverClientX = (clientOffset as XYCoord).x - hoverBoundingRect.left;

      /** 是否拖动的元素的 index 小于被 hover 的元素 */
      const isDragIdxLessThenHoveringItem =
        +dragIndex.join("") < +hoverIndex.join("");

      /** 是否拖动的元素的 index 大于被 hover 的元素 */
      const isDragIdxGreeterThenHoveringItem = !isDragIdxLessThenHoveringItem;
      const dragItemDiffOffset = monitor.getDifferenceFromInitialOffset();

      if (!dragItemDiffOffset) return;

      if (sortDirection === "x") {
        if (
          // Dragging to left
          (isDragIdxLessThenHoveringItem && hoverClientX < hoverMiddleX) ||
          // Dragging to right
          (isDragIdxGreeterThenHoveringItem && hoverClientX > hoverMiddleX)
        ) {
          return;
        }
      } else {
        // const clientY = (clientOffset as XYCoord).y;
        // 如果拖到了容器内
        // if (isContainer) {
        //   if (dragItem.parentIdx?.join("") !== hoverIndex.join("")) {
        //     dragItem.parentIdx = hoverIndex;
        //     // onItemEnter?.(hoverIndex);
        //   }
        //   return;
        // }

        const atTop = hoverClientY < hoverMiddleY;
        const atBottom = hoverClientY > hoverMiddleY;

        if (atTop) {
          setOveringDirection("top");
        }
        if (atBottom) {
          setOveringDirection("bottom");
        }
        return;

        // 如果不是容器，只是纯粹做swap
        // if (
        //   (isDragIdxLessThenHoveringItem && atTop) ||
        //   (isDragIdxGreeterThenHoveringItem && atBottom)
        // ) {
        //   return;
        // }

        // dragItem.parentIdx = null;
        // Time to actually perform the action
        // onItemMove?.(dragIndex, hoverIndex);
      }

      // Note: we're mutating the monitor dragItem here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      // eslint-disable-next-line no-param-reassign
      dragItem.treeNodePath = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    item: {
      dragableWidgetType,
      type,
      isContainer,
      treeNodePath,
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    begin: (item) => {
      const dragCtx = {
        dragableWidgetType,
        type,
        isContainer,
        treeNodePath,
      };
      onItemDrag?.(dragCtx, treeNodePath);
    },
  });

  const classes = clas(className, [
    isOverCurrent ? `overing ${overingDirection}` : "",
    isDragging && "isDragging",
  ]);

  if (dragable === false) {
    drop(ref);
  } else if (sortable) {
    /** 如果需要排序功能，则需要 drop 包装 */
    drag(drop(ref));
  } else {
    drag(ref);
  }

  // return (
  //   <Comp {...other} className={classes} ref={ref}>
  //     {children}
  //   </Comp>
  // );

  return wrapper ? (
    wrapper(children, {
      ref,
      classNames: classes,
    })
  ) : (
    <div {...other} className={classes} ref={ref}>
      {children}
    </div>
  );
};

export default DragItemComp;
