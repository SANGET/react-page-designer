
import { nanoid } from 'nanoid';

enum IDataType {
  NORMAL = "NORMAL",
  PK = "PK",
  QUOTE = "QUOTE",
  DICT = "DICT",
  FK = "FK",
  IMG = "IMG",
  VIDEO = "VIDEO",
  AUDIO = "AUDIO",
  FILE="FILE"
}

const DATATYPE = {
  /** 普通字段 */
  NORMAL: IDataType.NORMAL,
  /** 主键字段 */
  PK: IDataType.PK,
  /** 引用字段 */
  QUOTE: IDataType.QUOTE,
  /** 字典字段 */
  DICT: IDataType.DICT,
  /** 外键字段 */
  FK: IDataType.FK,
  /** 图片 */
  IMG: IDataType.IMG,
  /** 视频 */
  VIDEO: IDataType.VIDEO,
  /** 音频 */
  AUDIO: IDataType.AUDIO,
  /** 文件 */
  FILE: IDataType.FILE
};

/**
 * 模拟生成 row 数据
 */
export const genRowData = (usingColumns, rowCount = 3) => {
  const resData:{[key:string]: string|number}[] = [];
  [...Array(rowCount)].forEach((_, _idx) => {
    const rowItem:{[key:string]: string|number} = {};
    usingColumns.forEach((col, idx) => {
      // const { id, name, fieldCode } = col;
      Object.keys(col).forEach(colKey=>{
        if (Object.prototype.hasOwnProperty.call(col, colKey)) {
          rowItem[colKey] = '';
        }
      });
      rowItem.id = _idx;
    });
    resData.push(rowItem);
  });
  return resData;
};


export const isReferenceField = (dataType) => {
  return [DATATYPE.DICT, DATATYPE.FK, DATATYPE.QUOTE].includes(dataType);
};
/**
 * 模拟生成 row 数据
 */
type Align = 'left'|'right'|'center'
type ShowType = 'showVal' | 'realVal'
type Result = {fieldShowType: ShowType, show: boolean, title: string, dsID: string, fieldID: string, id: string, dataIndex: string, width: string, type: 'dsColumn', align: Align, editable: boolean,}
export const genRenderColumn = (usingColumn): Result => {
  const { id: fieldID, name: title, dsID, colDataType, fieldCode } = usingColumn;
  const id = fieldCode;
  return {
    title, dsID, fieldID,
    id, dataIndex: id,
    width: '150px',
    type: 'dsColumn',
    align: 'left',
    editable: false,
    fieldShowType: isReferenceField(colDataType) ? 'showVal' : 'realVal',
    show: true
  };
};