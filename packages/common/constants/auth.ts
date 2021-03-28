import { ColumnType } from 'antd/lib/table';
import dayjs from 'dayjs';

export enum TEMINAL_TYPE {
  CS = 'CS',
  BS = 'BS',
  PHONE = 'PHONE'
}
export const TERMINAL_TYPE_MENU = [
  { label: "BS客户端", value: TEMINAL_TYPE.BS, key: TEMINAL_TYPE.BS },
  { label: "CS客户端", value: TEMINAL_TYPE.CS, key: TEMINAL_TYPE.CS },
  { label: "手机移动客户端", value: TEMINAL_TYPE.PHONE, key: TEMINAL_TYPE.PHONE }
];
export const TABLE_COLUMNS: ColumnType<ITableItem>[] = [
  {
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    width: 80,
    render: (text, _, index) => index + 1
  },
  {
    title: '权限树名称',
    dataIndex: 'name',
    key: 'name',
    width: 200,
    ellipsis: true
  },
  {
    title: '权限编码',
    key: 'authorityCode',
    dataIndex: 'authorityCode',
    width: 150,
  },
  {
    title: '上级',
    key: 'parentName',
    dataIndex: 'parentName',
    ellipsis: true,
    width: 180,
  },
  {
    title: '终端',
    dataIndex: 'terminalType',
    key: 'terminalType',
    width: 180,
    render: (text) => {
      return TERMINAL_TYPE_MENU.reduce((a, b) => {
        a[b.value] = b.label;
        return a;
      }, {})[text];
    }
  },
  {
    title: '最后修改时间',
    dataIndex: 'gmtModified',
    key: 'gmtModified',
    width: 210,
    render: (date) => {
      return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
    }
  },
  {
    title: '创建人',
    dataIndex: 'createdUserName',
    key: 'createdUserName',
    width: 120
  }
];

export const SELECT_ALL = "all";

export const MORE_MENU = [{
  title: "快速创建权限树",
  key: "createAuthoritySpeedy"
}, {
  title: "自定义创建权限树",
  key: "createAuthority"
}];
export enum MORE_MENU_TYPE {
  "CREATEAUTHORITY" = "createAuthority",
  "CREATEAUTHORITYSPEEDY" = "createAuthoritySpeedy"
}

export enum MESSAGE {
  ALLOW_DELETE_FAILED = '无法删除数据，请联系技术人员',
  NOT_ALLOW_DELETE = '不允许删除',
  MAY_I_DELETE = '请确认是否删除？',
  NO_RECORD_TO_BATCH_CREATE = '无选中数据，不进行快捷新增操作'
}

export enum EXPAND_TYPE {
  EXPAND_ALL,
  EXPAND_VALUES
}
