/**
 * 可拖拽项包装器的定义
 */
import { WidgetEntityState } from '@provider-app/platform-access-spec';
import {
  TreeNodePath,
  LayoutWrapperContext
} from '../../utils';
import { VEDispatcher } from '../../core/actions';
import { EditableWidgetEntity } from '../../data-structure';
import { StageContextRes } from '../../utils/stage-context';

/**
 * DnD 的回调的 context
 */
export interface DnDContext {
  dragItemNodePath: TreeNodePath
  dropItemNodePath: TreeNodePath
  overingDirection: OveringDirection
  isDropItemContainer?: boolean
  // dropTargetItem: EditableWidgetEntity
}

export type DragItemConfig = any;

export type OnItemDrop = (dragItem, dndContext: DnDContext) => void
export type OnItemDrag = (dragItem, itemIdx?: TreeNodePath) => void
export type OnItemHover = (hoverIdx: TreeNodePath) => void

export type OveringDirection = "top" | "bottom" | 'left' | 'right'

interface DragItemMoveInfo {
  /** 
   * 移动的类型
   * 1. enter 移入容器
   * 2. exit 移出容器
   * 3. sort 普通排序
   */
  type: 'enter' | 'exit' | 'sort'
  /** 移动的方向 */
  direction: OveringDirection
}
export type DragItemMove = (dragIndex: TreeNodePath, hoverIndex: TreeNodePath) => void
export type CancelDrag = (originalIndex: number) => void

export interface GetStateContext {
  treeNodePath: TreeNodePath
  idx: number
  id: string
}

/**
 * 包装器的元素的事件回调上下文
 */
interface ActionCtx {
  entity: EditableWidgetEntity
  idx: number
  treeNodePath: TreeNodePath
}

export type GetEntityProps = (ctx: GetStateContext) => WidgetEntityState | undefined
export type GetSelectedState = (ctx: GetStateContext) => boolean
export type GetLayoutNode = (ctx: GetStateContext) => EditableWidgetEntity
export type WrapperItemClickEvent = (actionCtx: ActionCtx) => void
export type WrapperItemDeleteEvent = (actionCtx: ActionCtx) => void
export type OnItemEnter = (parentContainerIdx) => void
export type OnItemLeave = (parentContainerIdx) => void

/**
 * 可拖拽元素的 actions
 */
export interface DragItemActions {
  /** 响应组件的“放”事件 */
  onItemDrop?: OnItemDrop
  /** 响应组件的“拖”事件 */
  onItemDrag?: OnItemDrag
  /** 响应组件的“hover”事件 */
  onItemHover?: OnItemHover
  /** 响应组件的“被拖动”的事件 */
  onItemMove?: DragItemMove
  onItemEnter?: OnItemEnter
  onItemLeave?: OnItemLeave
}

export interface WrapperFacContext {
  /** 获取组件实例的 props */
  getEntityProps: GetEntityProps
  /** 扁平的 node 结构 */
  getLayoutNode: GetLayoutNode
  updateEntityState: VEDispatcher['UpdateEntityState']
  getStageCtx: () => StageContextRes
}

/**
 * 包装器的元素的 action
 */
export interface WrapperFacActions extends DragItemActions {
  /** 响应组件点击事件 */
  onDelete: WrapperItemDeleteEvent
  /** 响应组件点击事件 */
  onItemClick: WrapperItemClickEvent
}

/**
 * 包装器的 options
 */
export type WrapperFacOptions = WrapperFacContext & WrapperFacActions

/**
 * 可拖拽包装器的定义
 */
export type DragableItemWrapperFac = (
  wrapperFacOptions: WrapperFacOptions
) => (
  props: LayoutWrapperContext
) => JSX.Element | null
