export interface MenuDataType {
  /** 菜单名 */
  title: string
  /** icon */
  icon: string
  /** 菜单 id，用于 react 的 key */
  id: string
  /** 导航将要到达的 path */
  path?: string
  /** children，如果有，则认为点击没有跳转功能 */
  child?: MenuDataType[]
}

/**
 * icon 参考 https://fontawesome.com/icons?d=gallery&q=data&m=free
 */
export const ProviderAppMenuData: MenuDataType[] = [
  {
    title: '页面建模',
    icon: 'crop-alt',
    id: '1',
    // path: '/menu-manager',
    child: [
      {
        title: '页面管理',
        id: '12',
        icon: '',
        path: '/page-manager'
      },
      {
        title: '弹窗选择',
        id: '13',
        icon: '',
        path: '/popup-window-selector'
      },
    ]
  },
  {
    // path: '/menu-manager',
    icon: 'database',
    title: '数据建模',
    id: '2',
    child: [
      {
        title: '表结构管理',
        id: '21',
        icon: '',
        path: '/TableStruct'
      },
      {
        title: '字典管理',
        id: '22',
        icon: '',
        path: '/dictionary-manager'
      },
      {
        title: '其他数据源',
        id: '23',
        icon: '',
      },
    ]
  },
  {
    title: '系统管理',
    icon: 'cog',
    id: '3213123',
    // path: '/menu-manager',
    child: [
      {
        title: '菜单管理',
        id: '1415rwqtqr',
        icon: '',
        path: '/menu-manager'
      },
    ]
  },
  {
    title: '权限管理',
    id: '123qwe',
    icon: 'robot',
    child: [
      {
        title: '权限树管理',
        id: '123qweasd',
        icon: '',
        path: '/auth-distributor'
      }, {
        title: '权限项管理',
        id: '1416rwqtqr',
        icon: '',
        path: '/lessee-authority'
      }
    ]
  }
];
