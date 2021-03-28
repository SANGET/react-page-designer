import { PageMetadata } from "@provider-app/platform-access-spec";
import { ChangeMetadataOptions, PlatformDatasource } from ".";
import { GenMetaRefID, TakeMeta } from "..";

export interface OnDatasourceSelectorSubmitOptions {
  /** 关闭当前弹窗 */
  close: () => void
  /** 内部的数据源结构 */
  interDatasources
  /** 从远端选择回来的数据源 */
  selectedDSFromRemote
}
type DataSourceType = 'TABLE' | 'DICT'
export interface OpenDatasourceSelectorOptions {
  /** 弹出的类型 */
  modalType: 'normal' | 'side'
  /** 弹出的位置 */
  position?: 'left' | 'right' | 'top' | 'bottom';
  /** 选择数据源的类型 */
  typeArea: DataSourceType[]
  /** 默认选择的数据源的项 */
  defaultSelected: PlatformDatasource[]
  /** 数据源选择器选择后的回调 */
  onSubmit: (submitOptions: OnDatasourceSelectorSubmitOptions) => void
  /** 是否单选 */
  single?: boolean
  /** 是否只能选择单一范围的数据 */
  typeSingle?: boolean
}

export interface OnExpressionImporterSubmitOptions {
  /** 关闭当前弹窗 */
  id: string | null;
}

interface IDefaultVariableListChildren extends VariableItem {
  value: string;
}
export interface IDefaultVariableList {
  title: string;
  value: string;
  disabled: boolean;
  children: IDefaultVariableListChildren[];
}

export interface OpenExpressionImporterOptions {
  defaultValue: OnExpressionImporterSubmitOptions | null;
  onSubmit: (submitOptions: OnExpressionImporterSubmitOptions | null) => void;
  defaultVariableList?: IDefaultVariableList[];
}
export interface OpenLowCodeImporterOptions {
  defaultValue?: { code: string; simpleCode: string; params: any; use: string };
  eventType: string;
  onSubmit: (submitOptions: OnLowCodeImporterSubmitOptions) => void;
  platformCtx?: PlatformCtx;
}
export interface OnOpenFieldSortHelperSubmitOption {
  fieldID: string;
  dsID: string;
  sort: 'ASC'|'DESC'
}

export interface LowCodeSubmitOptions {
  code: string;
}

export interface OnLowCodeImporterSubmitOptions {
  code: string | null;
  codeId: string;
  use: string;
  codeSimple: {code:string,params?:any} | undefined;
}
export interface OpenFieldSortHelperOptions {
  defaultValue: OnOpenFieldSortHelperSubmitOption[]
  datasource: PlatformDatasource[]
  onSubmit: (submitOptions: OnOpenFieldSortHelperSubmitOption[])=>void
}

export interface OpenPDPropertiesEditorOptions { 
  key?: string;
  platformCtx: PlatformCtx;
  pageMetadata: PageMetadata
  selectedEntity
  entityState
  updateEntityState
}
export interface OpenLowCodeEditorOptions {
  /** 提交 */
  onSubmit: (submitCtx: LowCodeSubmitOptions) => void
  modalSetting: {}
  /** 默认值 */
  defaultValue: {
    code: string
  }
  /** 事件类型 */
  eventType: string
}
export type OpenLowCodeEditor = (options: OpenLowCodeEditorOptions) => () => void
export type ModalOptions = { 
  /** 是否需要头部 */
  needHeader?: boolean;
  /** 是否使用 esc 按键关闭 modal */
  modalType?: 'normal' | 'side';
  /** modeType == 'side' 时弹出的方向 */
  position?: 'left' | 'right' | 'top' | 'bottom';
  /** 宽度 */
  width?: string | number;
}

export type OpenDatasourceSelector = (options: OpenDatasourceSelectorOptions) => () => void
export type OpenExpressionImporter = (options: OpenExpressionImporterOptions) => () => void
export type OpenLowCodeImporter = (options: OpenLowCodeImporterOptions) => () => void
export type OpenFieldSortHelper = (options: OpenFieldSortHelperOptions) => () => void
export type OpenPDPropertiesEditor = (modalOptions: ModalOptions,options: OpenPDPropertiesEditorOptions) => () => void 
export type ChangeWidgetType = (widgetType: string) => void

export type VariableType = 'system'|'page'|'pageInput'|'widget'

export type VariableDataType = 'number'|'string'|'date'|'dateTime'|'numberArray'|'stringArray'|'dateArray'|'dateTimeArray'

export interface VariableItem {
  title: string
  code: string
  id: string
  alias?: string
  varType: VariableDataType
  realVal?: number|string
  type?: VariableType
  wholeTitle?: string
}

export type VariableOptions = {
  /** 是否返回扁平结构 */
  flat?: boolean
  varRely?
  flatLayoutItems?
  inType?: string[]
  inEditable?: boolean
  inFlat?: boolean
}

export type GetVariableData = (options?: VariableOptions) => VariableItem[]
// export type GetVariableData = (filter?: VariableType[], options?: VariableOptions) => Promise<{[key: string]: VariableItem[]}>
export type ChangeDataSourceParam = {type: 'create&rm', data?: PlatformDatasource, rmMetaID?: string}
export type ChangeDataSourcesParam = {type: 'create/batch&rm/batch', dataList?: PlatformDatasource[], rmMetaIDList?: string[]}
export type ChangeDataSource = (param: ChangeDataSourceParam| ChangeDataSourcesParam) => string | string[]
export type GetSelectedEntity = () => {id:string}

export type GetPageInfo = ()=> {pageID:string}
export type GetPageState = ()=>any
export type GetPageMeta = (param?: string)=> any
export type GetPageContent = ()=> any

/**
 * 平台提供的 UI 上下文，提供以下能力
 * 1. 使用平台的 UI
 * 2. 更改页面的元数据
 * 3. 更改组件实例的默认属性
 */
export interface PlatformCtx {
  /** 可以使用平台提供的 UI 展示能力 */
  ui: {
    showMsg: (ctx: { msg: string, type: 'success' | 'error' }) => void
    PDPropertiesEditor
  }
  /** 由页面设计器提供的选择器 */
  selector: {
    openDatasourceSelector: OpenDatasourceSelector
    openExpressionImporter: OpenExpressionImporter
    openLowCodeImporter: OpenLowCodeImporter
    openLowCodeEditor: OpenLowCodeEditor
    openFieldSortHelper: OpenFieldSortHelper
    openPDPropertiesEditor: OpenPDPropertiesEditor
  }
  /** 对于页面元数据的操作 */
  meta: {
    /** 更改页面的 meta 数据，如果没有该数据，则返回新创建的 metaID */
    changePageMeta: (options: ChangeMetadataOptions) => string | string[]
    /** 获取 meta */
    takeMeta: TakeMeta
    /** 生成 meta 引用的 ID */
    genMetaRefID: GenMetaRefID
    /** 更改组件的类型 */
    changeWidgetType: ChangeWidgetType
    /** 获取变量数据 */
    getVariableData: GetVariableData
    /** 更改 widget state */
    // changeEntityState: ChangeEntityState
    /** 更改数据源绑定 */
    changeDataSource: ChangeDataSource
    getPageMeta: GetPageMeta
    getSelectedEntity: GetSelectedEntity
    getPageInfo: GetPageInfo
    getPageState: GetPageState
    getPageContent: GetPageContent
  }
}
