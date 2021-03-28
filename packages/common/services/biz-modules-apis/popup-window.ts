/** 获取表结构列表数据 */
export async function queryPopupWindowListService(params) {
  return await $R_P.get({
    url: '/page/v1/popupwindows',
    params,
  });
}

/** 新增表 */
export async function createPopupWindowService(params) {
  return await $R_P.post({
    url: '/page/v1/popupwindows',
    data: params,
  });
}

export async function editPopupWindowService(params, id) {
  return await $R_P.put({
    url: `/page/v1/popupwindows/${id}`,
    data: params,
  });
}

/** 删除表前确认能否删除 */
export async function checkAssociatedPopupWindowService(id) {
  return await $R_P.get({
    url: `/page/v1/popupwindows/associated/${id}`,
    params: {},
  });
}

export async function queryPopupWindowService(id) {
  return await $R_P.get({
    url: `/page/v1/popupwindows/${id}`,
    params: {},
  });
}

/** 删除表 */
export async function deletePopupWindowService(id) {
  return await $R_P.del({
    url: `/page/v1/popupwindows/${id}`,
    data: {},
  });
}

/** 复制表 */
export async function copyPopupWindowService(params) {
  return await $R_P.post({
    url: '/data/v1/tables/copy',
    data: params,
  });
}

/** 查询 菜单 */
export async function queryMenusListService(params) {
  return await $R_P.get({
    url: `/page/v1/menus/list`,
    params
  });
}

/** 新增菜单 */
export async function createMenuService(params) {
  return await $R_P.post({
    url: `/page/v1/menus/`,
    data: params
  });
}

export async function getTablesList() {
  return await $R_P.get({
    url: `/data/v1/tables/list`,
  });
}

export async function queryTablesList() {
  return await $R_P.get({
    url: `/data/v1/tables/list`,
  });
}

export async function getTableInfo(id) {
  return await $R_P.get({
    url: `/data/v1/tables/${id}`,
    params: {},
  });
}/** 查询模块列表 */
