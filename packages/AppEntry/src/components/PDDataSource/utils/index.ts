import { PlatformColumn, PlatformDatasource } from '@provider-app/platform-access-spec';
import { message as AntdMessage } from 'antd';
import pick from 'lodash/pick';

type RemoteDSData = {id: string, name: string, type: string, auxTable: {containAuxTable?:boolean}}
/**
 * 提取由后端返回的，前端需要的 columns
 */
export type Species = 'SYS' | 'BIS' | 'SYS_TMPL' | 'BIS_TMPL'
type RemoteTableColumn = {id: string, name: string, dataType: string, fieldSize: string, fieldType: string,  code: string, species:Species }
export const takeColumnsData = (columns: RemoteTableColumn[], dsID: string): {[key:string]: PlatformColumn} => {
  const result = {};
  columns.forEach((column) => {
    // console.log('column', column);
    result[column.id] = {
      id: column.id,
      name: column.name,
      colDataType: column.dataType,
      fieldSize: column.fieldSize,
      fieldType: column.fieldType,
      fieldCode: column.code,
      species: column.species,
      dsID
    };
  });
  return result;
};
type CurrentAux = {containAuxTable?: boolean};
type RemoteAux = {mainTableCode?:string};
type Aux = {containAuxTable?: boolean, mainTableCode?:string}
type GetAuxTableConfig = (currentAux: CurrentAux, remoteAux: RemoteAux) => {auxTable: Aux}|Record<never, never>
/** 获得 auxTable 的配置 */
const getAuxTableConfig: GetAuxTableConfig = (currentAuxTable, remoteAuxTable) => {
  const { containAuxTable } = currentAuxTable || {};
  const { mainTableCode } = remoteAuxTable || {};
  const result: Aux = {};
  if(containAuxTable){
    result.containAuxTable = containAuxTable;
  }
  if(mainTableCode){
    result.mainTableCode = mainTableCode;
  }
  if(Object.values(result).length > 0){
    return { auxTable: result };
  }
  return {};
};
/**
 * 从后端返回的数据提取前端需要用到的数据
 */
export const takeTableField = (datasourceData, currentConfig): PlatformDatasource => {
  const resData = Object.assign({}, pick(
    datasourceData, [
      'name',
      'id',
      'moduleId',
      'code',
    ]
  ), {
    ...getAuxTableConfig(currentConfig?.auxTable, datasourceData.auxTable),
    tableType: datasourceData.type,
    columns: takeColumnsData(datasourceData.columns, datasourceData.id)
  });
  return resData;
};

/**
 * 从
 * @param datas 
 */
export const takeTable = async (tableList: RemoteDSData[]) => {
  if(tableList.length === 0){
    return {
      decorativeData: [],
      remoteData: []
    };
  }
  /** 获取请求表数据参数 */
  const getTablesParam = () => {
    return tableList.map(item=>({
      tableId: item.id,
      addWithAuxTable: item.auxTable?.containAuxTable || false
    }));
  };
  /** 获取剩余的表配置 */
  const getTableConfig = () => {
    const res = {};
    tableList.forEach(item=>{
      const { id, auxTable } = item;
      res[id] = { auxTable };
    });
    return res;
  };
  /** 拼接表格索引 */
  // const getTablesOrder = () =>{
  //   const map = {};
  //   tableList.forEach(item=>{
  //     const { id, order } = item;
  //     map[id] = order;
  //   });
  //   return map;
  // };
  const { code, result } = await $R_P.post({
    url: '/data/v1/tables/tableWithAux',
    data: { tables: getTablesParam() }
  });
  if(code !== '00000') {
    AntdMessage.error('获取数据表数据失败，请联系技术人员');
    return {
      decorativeData: [],
      remoteData: []
    };
  }
  // const orderMap = getTablesOrder();
  // const res = {};
  // result.forEach(item=>{
  //   const { id } = item;
  //   const order = orderMap[id];
  //   res[order] = takeTableField(item);
  // });
  // return res;
  const tableConfig = getTableConfig();
  return {
    decorativeData: result.map(item=>({ ... takeTableField(item, tableConfig[item.id]) })),
    remoteData: result
  };
};
/**
 * 提取由后端返回的，前端需要的 columns
 */
export const takeDictItems = (dsID) => {
  return {
    code: { name: '编码', code: 'code', id: 'code', dsID },
    name: { name: '名称', code: 'name', id: 'name', dsID },
    pid: { name: '父编码', code: 'pid', id: 'pid', dsID }
  };
};
/**
 * 从后端返回的字典数据提取前端需要用到的数据
 */
type RemoteDictData = {name: string, code: string, id: string}
export const takeDictField = (datasourceData:RemoteDictData): PlatformDatasource => {
  const { name, id, code } = datasourceData;
  return { name, id, code, type: 'DICT',
    columns: takeDictItems(datasourceData.id)
  };
};
const makeTypeForList = (list, type) => {
  return Array.isArray(list) ? list.map(item=>({
    ...item,
    type
  })) : [];
};

export const wrapInterDatasource = async (remoteDSData) => {
  const tableList: RemoteDSData[] = []; const nextDictList: PlatformDatasource[] = []; const remoteDictList: RemoteDSData[] = [];
  if(remoteDSData.length > 0){
    remoteDSData.forEach((data) => {
      if (!data) return;
      switch (data.type) {
        case 'TABLE':
          tableList.push(data);
          break;
        case 'DICT':
          remoteDictList.push(data);
          nextDictList.push(takeDictField(data));
          break;
        default:
          break;
      }
    });
  }
  const {
    decorativeData: nextTableList,
    remoteData: remoteTableList
  } = await takeTable(tableList);
  const result = {
    decorativeData: [
      ...makeTypeForList(nextTableList, 'TABLE'), 
      ...makeTypeForList(nextDictList, 'DICT')],
    remoteData: [...remoteTableList, ...remoteDictList]
  };
  console.log(result);
  return result;
};