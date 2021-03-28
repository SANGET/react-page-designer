
type VarItem = {title: string, code?: string, varType?: string, id: string, pid?: string, wholeTitle?: string, type?: 'widget', key: string, editable?:boolean}
/** 获取控件唯一标识 */
const getWidgetId = (widgetEntity) => widgetEntity?.id;

/** 获取控件标题 */
const getWidgetTitle = (widgetEntity) => widgetEntity?.propState?.title || '控件';

/** 获取控件编码 */
const getWidgetCode = (widgetEntity) => widgetEntity?.propState?.widgetCode || '$';

/** 获取控件数据源唯一标识 */
const getWidgetDs = (widgetEntity) => widgetEntity?.propState?.ds || null;

/** 
 * 获取控件数据源字段列表对应的编码和标题集
 */
const getColumnsInDS = (DS) => {
  const columns = DS?.columns || {};
  return Object.values(columns).map((column)=>{
    const { name, fieldCode } = column || {};
    return { title: name, code: fieldCode };
  });
};
/**
 * 以当前 varAttr 作为父级挂载节点
 * @param varItem 
 * @param context 
 * @returns 
 */
const genCurrentAttrAsVar = (varItem, context) => {
  const { widgetEntity } = context;
  const id = getWidgetId(widgetEntity);
  const widgetCode = getWidgetCode(widgetEntity);
  const { alias, attr } = varItem;
  return { code: `${widgetCode}.${attr}`, wholeTitle: alias, title: alias, id: `${id}_${attr}`, key: `${id}_${attr}`, pid: id };
};
/**
 * 对外暴露方法
 * @param varItem 
 * @param context 
 * @returns 
 */
export const selectedRows = (varItem, context) => {
  const { widgetEntity, dataSource } = context;
  /** 获取数据源唯一标识 */
  const ds = getWidgetDs(widgetEntity);
  if(!ds) return [];
  /** 生成父级节点 */
  const attrVar = genCurrentAttrAsVar(varItem, context);
  const list:VarItem[] = [attrVar];
  /** 获取列信息 */
  const columns = getColumnsInDS(dataSource[ds]);
  const { alias, attr, editable } = varItem;
  const id = getWidgetId(widgetEntity);
  const widgetCode = getWidgetCode(widgetEntity);
  const widgetTitle = getWidgetTitle(widgetEntity);
  columns.forEach(column=>{
    const { title, code } = column;
    list.push({
      code: `${widgetCode}.${attr}.${code}`, title, wholeTitle: `${widgetTitle}_${alias}_${title}`, editable,
      id: `${id}_${attr}.${code}`, pid: `${id}_${attr}`, type: 'widget', key: `${id}_${attr}.${code}`
    });
  });
  return list;
};