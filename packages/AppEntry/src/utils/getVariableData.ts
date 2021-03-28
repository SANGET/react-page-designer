
import * as WidgetVarGen from '../var-generator';

const PAGEINPUT = 'pageInput';
const PAGE = 'page';
const WIDGET = 'widget';
const CUSTOMED = 'customed';

type BasicVarItem = {title: string, code?: string, varType?: string, id: string, pid?: string, wholeTitle?: string, key: string}
type PageVarItem = BasicVarItem & {type: typeof PAGE}
type InputVarItem = BasicVarItem & {type: typeof PAGEINPUT, realVal: string, alias?: string}
type WidgetVarItem = BasicVarItem & {type: typeof WIDGET}
type VarItem = PageVarItem | InputVarItem | WidgetVarItem | BasicVarItem
interface GetVariableDataToolOptions {
  varRely
  flatLayoutItems
  dataSource
  inType?: string[],
  inEditable?: boolean
  inFlag?: boolean
  inFlat?: boolean
}
type GetVariableDataTool = (options: GetVariableDataToolOptions) => VarItem[]
type GetPageVariable = () => PageVarItem[]
type GetInputVariable = (param: {varRely}) => InputVarItem[]
type GetWidgetVariable = (param: {varRely, flatLayoutItems, dataSource }) => WidgetVarItem[]
/**
* 获取变量数据
*/
/** 获取页面变量 */
const getPageVar: GetPageVariable = () => {
  return [
    { code: 'var_page_name', title: '页面名称', wholeTitle: '页面名称', id: 'var_page_name', key: 'var_page_name', varType: 'string', type: PAGE, pid: PAGE },
    { code: 'var_page_code', wholeTitle: '页面编码', title: '页面编码', id: 'var_page_code', key: 'var_page_code', varType: 'string', type: PAGE, pid: PAGE },
  ];
};
/**
   * 获取变量项索引
   * @param item 变量项
   */
 const getOrder = (item) => {
  return item.id.split("_")[2] - 0;
};

/**
 * 对列表数据进行排序，由于新增按钮在表头，所以按 唯一标识中的索引值 降序处理
 */
const sortList = (list) => {
    return list.sort((a, b) => {
      return getOrder(b) - getOrder(a);
    });
  };

/** 获取输入参数变量 */
const getInputVar: GetInputVariable = ({ varRely }) => {
  if(!varRely) return [
    { title: '页面模式', wholeTitle: '页面模式', type: PAGEINPUT, varType: 'string', realVal: 'insert', code: 'var.page.mode', id: 'var_pageInput_0_mode', key: 'var_pageInput_0_mode', pid: PAGEINPUT }
  ];
  const result = Object.keys(varRely).filter(id => {
    const { type } = varRely[id] || {};
    return type === PAGEINPUT;
  }).map(id=>{
    const { type, alias, varType, code, realVal, title } = varRely[id] || {};
    return { code, type, varType, alias, id, realVal, title, pid: PAGEINPUT, key: id, wholeTitle: title };
  });
  return sortList(result);
};


const getWidgetId = (widgetEntity) => widgetEntity?.id;
const getWidgetTitle = (widgetEntity) => widgetEntity?.propState?.title || '控件';
const getWidgetCode = (widgetEntity) => widgetEntity?.propState?.widgetCode || '$';
/**
 * 默认的控件变量获取方式（直接根据 varAttr 进行数据转换）
 * @param varItem 
 * @param context 
 * @returns 
 */
const getWidgetAttrDefault = (varItem, context) => {
  const { widgetEntity } = context;
  const id = getWidgetId(widgetEntity);
  const title = getWidgetTitle(widgetEntity);
  const widgetCode = getWidgetCode(widgetEntity);
  const { alias, attr, type: varType, editable } = varItem;
  const code = `${widgetCode}.${attr}`;
  return [{
    code, varType, type: WIDGET,
    title: alias,
    wholeTitle: `${title}_${alias}`,
    id: `${id}_${attr}`,
    key: `${id}_${attr}`,
    pid: id,
    editable: !!editable
  }];
};
/** 
 * 将控件作为变量中的一员
 */
const getCurrentWidgetAsVar = (widgetEntity): BasicVarItem => {
  const id = getWidgetId(widgetEntity);
  const title = getWidgetTitle(widgetEntity);
  const widgetCode = getWidgetCode(widgetEntity);
  return { code: widgetCode, title, wholeTitle: title, id, pid: WIDGET, key: id };
};
/** 控件的逐个变量获取 */
const getVarItem = (varItem, context) => {
  const group = context?.widgetEntity?.group;
  const attr = varItem?.attr;
  const getVarFunc = WidgetVarGen?.[group]?.[attr] || getWidgetAttrDefault;
  return getVarFunc(varItem, context);
};
/** 
 * 获取控件变量（内部拼接版）
 */
const getWidgetVarPlus = (context, param) => {
  const { varAttr, widgetEntity } = param;
  /** 控件对应变量 */
  if(!Array.isArray(varAttr)){
    return [];  
  }
  /** 获取控件对应的变量 */
  const widgetVar = getCurrentWidgetAsVar(widgetEntity);
  const list = [widgetVar];
  varAttr.forEach((varItem) => {
    const widgetVarAttr = getVarItem(varItem, { ...context, widgetEntity });
    Array.prototype.push.apply(list, widgetVarAttr);
  });
  return list;
};
/** 
 * 获取控件变量
 */
const getWidgetVar: GetWidgetVariable = ({ varRely, flatLayoutItems, dataSource }) => {
  if(!varRely) return [];
  const result = [];
  Object.keys(varRely).filter(varID=>{
    const { type, widgetRef } = varRely[varID] || {};
    const { propState } = flatLayoutItems[widgetRef] || {};
    /** 是控件变量 */
    return type === WIDGET && 
    /** 有对应的控件类型 */
    widgetRef && 
    /** 有具现化的控件实例 */
    flatLayoutItems[widgetRef] && 
    /** 并且有对应的控件配置 */
    propState;
  }).forEach(varID => {
    const { varAttr, widgetRef } = varRely[varID] || {};
    /** 获取对应控件数据 */
    const widgetEntity = flatLayoutItems[widgetRef];
    const target = getWidgetVarPlus({ dataSource }, { varAttr, widgetEntity });
    Array.prototype.push.apply(result, target);
  });
  return result;
};
/** 获取自定义变量 */
const getCustomedVar = () => {
  return [];
};
/**
 * 现有变量类型及其处理方式
 */
const VAR_FUNC_LIST = [
  { type: CUSTOMED, func: getCustomedVar },
  { type: WIDGET, func: getWidgetVar },
  { type: PAGE, func: getPageVar },
  { type: PAGEINPUT, func: getInputVar },
];

/** 
 * 初始化顶级变量列表
 */
const getAllInitValues = () => {
  return [
    { id: CUSTOMED, title: '自定义变量', wholeTitle: '自定义变量', key: CUSTOMED },
    { id: WIDGET, title: '控件变量', key: WIDGET, wholeTitle: '控件变量' },
    { id: PAGE, title: '页面变量', key: PAGE, wholeTitle: '页面变量' },
    { id: PAGEINPUT, title: '输入参数变量', key: PAGEINPUT, wholeTitle: '输入参数变量' },
  ];
};
/** 进行变量数据过滤 */
const filterFunc = (inType) => {
  return VAR_FUNC_LIST.filter(({ type }) => inType.includes(type));
};
/**
 * 获取完整变量数据列表
 * @param param 
 * @returns 
 */
const getAllVar = (param) => {
  const { varRely, flatLayoutItems, dataSource } = param;
  /** 初始化顶级变量列表 */
  const list = getAllInitValues();
  VAR_FUNC_LIST.forEach(({ func })=>{
    const result = func({ varRely, flatLayoutItems, dataSource });
    Array.prototype.push.apply(list, result);
  });
  return list;
};
/**
 * 获取有过滤前提下的初始化变量数据
 * @param inType 
 * @returns 
 */
const getFilterInitValues = (inType)=>{
  if(!Array.isArray(inType) || inType.length === 1) return [];
  const initValues = getAllInitValues();
  return initValues.filter(item=>inType.includes(item.id));
};
/**
 * 返回 type 指定类型的变量数据
 * @param inType 
 * @param param 
 * @returns 
 */
const getFilterVar = (inType, param) => {
  const { varRely, flatLayoutItems, dataSource } = param;
  /** 初始化顶级变量列表 */
  const list = getFilterInitValues(inType);
  /** 过滤能进行数据获取的变量获取方法 */
  const funcList = filterFunc(inType);
  funcList.forEach(({ func })=>{
    const result = func({ varRely, flatLayoutItems, dataSource });
    Array.prototype.push.apply(list, result);
  });
  return list;
};
/**
 * 根据 type 进行数据过滤
 * @param inType 
 * @param param 
 * @returns 
 */
const getVarBYType = (inType, param) => {
  let list:VarItem[] = [];
  if(!Array.isArray(inType) || inType.length === 0){
    list = getAllVar(param);
  }else {
    list = getFilterVar(inType, param);  
  }
  return list;
};
/**
 * 只返回表单变量（可编辑变量），ps：仍带有上下级数据
 * @param inEditable 
 * @param list 
 * @returns 
 */
const filterVarBYEditable = (inEditable, list) => {
  if(inEditable === undefined) return list;
  return list.filter(item=>{
    return !item.type || /** 父级不参与过滤 */
    !!item.editable === !!inEditable;
  });
};
/**
 * 平铺下不需要父级无效节点
 * @param inFlat 
 * @param list 
 * @returns 
 */
const filterVarBYFlat = (inFlat, list)=>{
  if(!inFlat) return list;
  return list.filter(item => item.type);
};
/**
 * 对外的获取变量方法
 * @param context 
 * @returns 
 */
export const getVariableDataTool: GetVariableDataTool = (context) => {
  const { inType, inEditable, inFlat, ...param } = context;
  /** 支持按 type 过滤 */
  let list = getVarBYType(inType, param);
  /** 支持按 editable 过滤 */
  list = filterVarBYEditable(inEditable, list);
  /** 根据 Flat 去除多余数据节点 */
  list = filterVarBYFlat(inFlat, list);
  return list;
};