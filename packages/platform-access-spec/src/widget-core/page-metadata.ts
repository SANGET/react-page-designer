
/**
 * 变量 item 的类型
 */

import { PlatformDatasource } from "../platform-access";

export interface VarAttrType {
  /** 该属性变量的别名 */
  alias: string
  /** 该属性变量的别名 */
  attr: string
  /** 变量类型 */
  type: 'string' | 'number' | 'array' | 'date' | 'dateTime' | 'stringArray' | 'numberArray' | 'dateArray' | 'dateTimeArray'
}

export interface EventAttrType {
  /** 该事件变量的别名 */
  alias: string
  /** 事件类型 */
  type: 'onClick'|'onDbClick'|'onMouseIn'|'onMouseOut'|'onChange'|'onQuery'|'onRowCheck'|'onRowDbClick'|'onRowClick'|'onCellDbClick'|'onCellClick' | 'onRowBlur' | 'onCellBlur'
}

/**
 * 依赖控件的变量
 */
export interface WidgetVarRely {
  /** 组件类型的变量 */
  type: 'widget'
  /** 依赖的控件的 ID */
  widgetRef: string
  /** 变量存储的实体 */
  varAttr: VarAttrType[]
}

/**
 * 依赖数据源的变量
 */
export interface DSVarRely {
  type: 'ds'
  varAttr: any
}

/**
 * 输入参数变量
 */
export interface PageInputVarRely {
  type: 'pageInput'
  /** 变量描述信息 */
  alias?: string
  /** 变量值 */
  realVal?: string|number
  /** 变量数据类型 */
  varType: string
  /** 变量编码，由配置人员定义 */
  code: string
  /** 变量名称：由配置人员定义 */
  title: string
}

export interface MetaStorage<D = any> {
  [metaID: string]: D
}

export interface SchemaMeta {
  column
  tableInfo
}

export interface BasicValueMeta {
  exp?: null|string,
  realVal?: string|null,
  variable?: string|null,
}
/**
 * 基础动作数据
 */
export interface BasicActionsMeta {
  name: string
}
/**
 * 动作：打开链接
 */
export interface BasicOpenPageConfig {
  link: string
  openType: 'openModal'| 'replaceCurrentPage'|'newTabInBrowser'|'newTabInApp'
}
export interface OpenPageInApp extends BasicOpenPageConfig {
  pageArea: 'pageInApp'
  // operation: 'insert' | 'update' | 'detail' | 'null'
  paramMatch: {[key: string]: BasicValueMeta}
  // onOk?: string[];
  onCancel?: string[];
}

export interface OpenPage extends BasicActionsMeta {
  actionType: 'openPage'
  openPage: OpenPageInApp
  configCn: string
}

/**
 * 动作：变量赋值
 */
export interface ChangeVariables extends BasicActionsMeta {
  actionType: 'changeVariables'
  changeVariables: {[key: string]: BasicValueMeta}
  configCn: string
}
/**
 * 动作：数据提交
 */
export interface BasicSubmitDataItem {
  tableId: string
  tableName: string
  tableCode: string
  id: string
}
export interface ChangeField extends BasicValueMeta {
  columnName: string
  tableName: string
}
export interface InsertSubmitDataItem extends BasicSubmitDataItem{
  operateType:  'insert'
  changeFieldsTitle: string
  changeFields: {[key: string]: ChangeField}
}
export interface UpdateSubmitDataItem extends BasicSubmitDataItem{
  operateType:  'update'
  changeRange: null
  changeFieldsTitle: string
  changeFields: {[key: string]: ChangeField}
}
export interface DeleteSubmitDataItem extends BasicSubmitDataItem{
  operateType:  'delete'
  changeRange: null
  changeFieldsTitle: string
  changeFields: {[key: string]: ChangeField}
}
export interface SubmitData extends BasicActionsMeta {
  actionType: "submitData"
  configCn: string
  submitData: (InsertSubmitDataItem|DeleteSubmitDataItem|UpdateSubmitDataItem)[]
}
export interface DisplayControlConfig {
  hideControl: string[], showControl: string[]
}
/**
 * 控件显示隐藏
 */
export interface DisplayControl extends BasicActionsMeta {
  actionType: "displayControl"
  displayControl: DisplayControlConfig
  configCn: string
}
/**
 * 刷新页面
 */
export interface RefreshPage extends BasicActionsMeta {
  actionType: "refreshPage"
  configCn: ''
}
/**
 * 关闭页面
 */
export interface ClosePage extends BasicActionsMeta {
  actionType: "closePage"
  configCn: ''
}
/**
 * 整表读取
 */
export interface ReadFormData extends BasicActionsMeta {
  actionType: "readFormData"
  configCn: ''
}
/**
 * 整表读取
 */
export interface WriteFormData extends BasicActionsMeta {
  actionType: "writeFormData"
  configCn: ''
}
/**
 * 表格回写
 */
export interface WriteTableData extends BasicActionsMeta {
  actionType: 'writeTableData'
  configCn: ''
  writeTableData: {control: string[]}
}
/**
 * 表格读取
 */
export interface ReadTableData extends BasicActionsMeta {
  actionType: 'readTableData'
  configCn: ''
  readTableData: {control: string[]}
}

/**
 * 动作
 */
export type ActionsMeta = OpenPage | ChangeVariables | SubmitData | DisplayControl | RefreshPage | ClosePage | ReadFormData | WriteFormData | WriteTableData | ReadTableData
/**
 * 表达式
 */
export type expMeta = { code: string, relation: { id: string; varType: string; type: string }[], methods: string[] }
/**
 * TODO: 事件类型
 */
export interface EventsMeta {
  actList: string[]
}
export type VarMeta = WidgetVarRely | DSVarRely | PageInputVarRely

export type DSMeta = PlatformDatasource

export interface ApiConfigMeta {
  /** id */
  id: string
  /** API 地址 */
  url: string
  /** api 的名称 */
  name: string
  /** api 的名称 */
  method: 'POST' | 'GET' | 'PUT' | 'DELETE' | 'PATCH' | 'JSONP'
  /** api 备注 */
  desc?: string
}

/**
 * 页面的元数据
 */
export interface PageMetadata {
  /** API 的配置 */
  apisConfig: MetaStorage<ApiConfigMeta>
  /** 记录 widget 的数量 */
  widgetCounter: number
  /** 页面标准接口 */
  pageInterface: MetaStorage
  /** 联动 meta */
  linkage: MetaStorage
  /** 记录数据源 */
  dataSource: MetaStorage<DSMeta>
  /** 用于存储页面的表单的数据模型 */
  schema: MetaStorage<SchemaMeta>
  /** 动作 meta */
  actions: MetaStorage<ActionsMeta>
  /** 表达式 meta */
  exp: MetaStorage<ActionsMeta>
  /** 变量 meta */
  varRely: MetaStorage<VarMeta>
  /** 事件 meta */
  events: MetaStorage<EventsMeta>
  /** meta 依赖收集器，用于记录每一条 meta 被依赖的情况 */
  _rely: {
    [metaID: string]: string[]
  }
}
