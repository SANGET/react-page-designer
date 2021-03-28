import { ProColumns } from '@ant-design/pro-table';
import { ITableType, IValueEnum } from '@provider-app/provider-app-pages/LesseeAuthority/interface';

export const MORE_MENU = [{
  title: "快速创建权限项",
  key: "fast_create_lessee_authority"
}, {
  title: "自定义创建权限项",
  key: "custom_create_lessee_authority"
}];
export const SELECT_ALL = "all";
export const PAGE_SIZE_OPTIONS: string[] = ["10", "20", "30", "40", "50", "100"];
export const DEFAULT_PAGE_SISE = 10;
/** 表结构管理 table 表 操作选项 */

export const TABLE_OPTIONS: ITableType[] = [
  {
    value: "TABLE",
    title: "普通表"
  }, {
    value: "TREE",
    title: "树形表"
  }, {
    value: "AUX_TABLE",
    title: "附属表"
  }
];
export const TABLE_VALUE_ENUM: IValueEnum = {
  TABLE: { text: "普通表" },
  TREE: { text: "树形表" },
  AUX_TABLE: { text: "附属表" }
};
/** 表结构管理 table columns 不包含操作项 */
export const COLUMNS: ProColumns[] = [
  {
    title: '序号',
    dataIndex: 'index',
    valueType: 'index',
    width: 80,
    search: false,
  },
  {
    title: '权限项名称',
    dataIndex: 'name',
    width: 140,
    ellipsis: true,
  },
  {
    title: '权限项编码',
    dataIndex: 'code',
    width: 300,
    search: false,
    ellipsis: true,
  },
  {
    title: '上级',
    dataIndex: 'parentCode',
    width: 300,
    valueEnum: TABLE_VALUE_ENUM,
    ellipsis: true,
  },
  {
    title: 'createType',
    dataIndex: 'createType',
    width: 100,
    search: false,
    ellipsis: true,
  },
  {
    title: '创建时间',
    dataIndex: 'gmtCreate',
    width: 200,
    search: false,
    valueType: 'dateTime',
  },
  {
    title: '最后修改时间',
    dataIndex: 'gmtModified',
    width: 200,
    search: false,
    valueType: 'dateTime',
  },
  {
    title: '最后修改人员',
    dataIndex: 'modifiedUserName',
    width: 140,
    search: false,
  },
];

export const RE = {
  /** 中文、英文、数字、下划线、括号 */

  CENUSB: /^(?!_)(?!.*?_$)[a-zA-Z0-9_()\u4e00-\u9fa5]+$/,

  /** 英文小写、数字、下划线 */

  ENUS: /^[a-z][a-z0-9_]{2,44}$/,

  /** 去除括号 */

  BRACKETS: /[(|)]|[（|）]/g,

  /** 中文、英文、数字，不支持特殊字符 */

  CEN: /^[\u4E00-\u9FA5A-Za-z0-9]+$/
};

export interface IModalData{
  okText : string
  modalTitle: string
}
