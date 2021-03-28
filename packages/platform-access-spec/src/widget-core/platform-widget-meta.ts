import { EventAttrType, VarAttrType } from '.';
import { WidgetRelyPropItems } from './widget-prop-item-rely';

/**
 * 组件实例状态
 */
export interface WidgetEntityState {
  value?: any
  title?: string
}

export interface WidgetEditablePropMeta {
  /** 属性的类型 */
  type: 'string' | 'number' | 'boolean' | 'struct' | 'any'
  /** 属性的别名 */
  alias?: string
}

export interface WidgetEditableProps {
  // title: WidgetEditablePropMeta
  [propName: string]: WidgetEditablePropMeta
}

export interface WidgetMeta<G = string> {
  /** 组件类面板的显示名 */
  label: string
  /** 组件类面板的显示名 */
  desc?: string
  /** 默认的 propState */
  defaultProps?: Record<string, any>
  /** widget 的分组信息 */
  wGroupType?: G
  /** 绑定可编辑的属性 */
  propItemsRely: WidgetRelyPropItems
  /** 引用定义了的组件，对应组件的 name */
  widgetRef: string
  /** 可以提升为变量的属性的集合 */
  varAttr?: VarAttrType[]
  /**
   * 自定义编辑器，规则：
   * 1. 必须已经在开发项中开发
   * 2. 通过字符串找到对应的自定义编辑器
   */
  propEditor?: string
  /** 事件的入口定义 */
  eventAttr?: EventAttrType[]
}

/**
 * 来自应用运行时传入的上下文
 */
export type WidgetEventHandler = () => void

export type PlatformWidgetRender = (
  widgetState: WidgetEntityState, 
  eventHandler: Record<string, WidgetEventHandler>
) => JSX.Element

/**
 * 平台组件 meta
 */
export interface PlatformWidgetMeta {
  /** 组件的名称 */
  name: string
  /** 组件的所有事件回调 */
  eventAttr?: {
    [eventName: string]: {
      /** 回调向外输出的状态的数据结构 */
      outState: any
    }
  },
  /** 
   * 可编辑的属性，用于告诉平台，该组件有多少属性可以被编辑
   * 1. 暂时未开放
   * 2. TODO: 需要一套校验可编辑属性的规则的工具 
   */
  editableProps: WidgetEditableProps
}

/**
 * 平台组件定义
 */
export interface PlatformWidgetComp {
  /** 挂载时的回调 */
  didMount?: () => void
  /** 被卸载时的回调 */
  didUnmount?: () => void
  /** 用于渲染的组件 */
  render: PlatformWidgetRender
}

export interface PlatformWidgetDesc extends PlatformWidgetMeta, PlatformWidgetComp {
  
}

/**
 * 不符合预期的组件
 */
export interface UnexpectedWidgetMeta {
  /** 未符合预期 */
  unexpected: true
}

export interface CustomEditorMeta {
  name: string
}
