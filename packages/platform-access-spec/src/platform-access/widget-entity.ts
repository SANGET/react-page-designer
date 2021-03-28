/// //////////////// widget ///////////////////
import { WidgetEntityState, WidgetMeta } from "..";
import { TEMP_ENTITY_ID } from "./const";

export interface AcceptChildSetting {
  /** 接受的类型的策略，白名单还是黑名单 */
  strategy: 'blackList' | 'whiteList'
  /** 拒绝接受的子组件的黑明白 */
  blackList?: string[]
  /** 接受的子组件的白名单 */
  whiteList?: string[]
}

interface DragableWidgetBaseType {
  /** 接受子内容的策略，布局组件的基础 */
  acceptChildStrategy?: AcceptChildSetting
  dragable?: boolean
  isContainer?: boolean
}

/**
 * 在页面设计器中加载的平台组件的元数据
 * 
 * 1. 可被编辑属性的组件的定义
 * 2. 用于存储组件的元数据信息
 * 3. 是否可以被内嵌（作为是否布局组件的标识）
 */
export interface EditableWidgetMeta<G = string> extends DragableWidgetBaseType, WidgetMeta {
  icon?: string
}

/// //////////////// widget entity ///////////////////

/**
 * 组件实例信息
 */
export interface WidgetEntity extends EditableWidgetMeta {
  /** 实例 id */
  id: string
  /** 父级 id */
  parentID?: string
  /** 组件实例是否可被删除 */
  deletable?: boolean
  /** 子元素 */
  body?: WidgetEntity[]
  /** 存储组件实例的状态 */
  propState?: WidgetEntityState
  /** 实例化后的状态 */
  // _state: string
  _state: 'active' | 'disable' | typeof TEMP_ENTITY_ID
}

/**
 * 组件实例状态
 */
// export interface WidgetEntityState {
//   value?: any
//   [str: string]: any;
// }

/// //////////////// temp widget entity 临时组件实例 ///////////////////

/**
 * 由于拖动产生的临时 entity
 */
export interface TempWidgetEntityType {
  id: string
  /** 标志性为临时实例 */
  _state: typeof TEMP_ENTITY_ID
}

/**
 * 组件类集合
 */
export interface WidgetTypeMetadataCollection {
  [id: string]: EditableWidgetMeta
}
