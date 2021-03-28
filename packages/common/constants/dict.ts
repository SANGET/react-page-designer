export const MESSAGE = {
  GETDICTIONARYLIST_FAILED: '获取字典列表数据失败，请联系技术人员',
  GETLISTOFDICTIONARY_FAILED: '获取字典详情数据失败，请联系技术人员',
  GETLISTOFDICTIONARYCHILD_FAILED: '获取子字典详情数据失败，请联系技术人员',
  DELETECHILDOFDICTIONARY_SUCCESS: '字典子项删除成功！',
  DELETEDICTIONARY_SUCCESS: '字典删除成功！',
  MOVECHILD_FAILED: '更改排序失败',
  MOVECHILD_SUCCESS: '更改排序成功',
  ADDDICTIONARY_FAILED: '字典新增失败',
  ADDDICTIONARY_SUCCESS: '字典新增成功',
  DELETEDICTIONARY_FAILED: '删除字典失败，请联系技术人员',
  EDITDICTIONARY_SUCCESS: '字典修改成功',
  EDITCHILDOFDICTIONARY_SUCCESS: '配置子项成功',
  EDITCHILDOFDICTIONARY_FAILED: '配置子项失败，请联系技术人员'
};
export enum MODAL_TITLE {
  ADD = '新增字典',
  EDIT = '编辑字典',
  EDIT_CHILD = '配置子项'
}
export enum DEF_VALUE {
  RENDERBGCOLOR = '#fff',
  RENDERFONTCOLOR = '#000'
}
export enum DICTIONARY_KEY {
  ID = 'id',
  NAME = 'name',
  DESC = 'description',
  CHILD = 'children',
}
export enum DICTIONARY_CHILD_KEY {
  ID = 'id',
  NAME = 'name',
  CHILD = 'children',
  CODE = 'code',
  RENDERBGCOLOR = 'renderBgColor',
  RENDERFONTCOLOR = 'renderFontColor',
  PID = 'pid',
  EDITABLE = 'editable'
}
