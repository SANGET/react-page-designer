/** 获取表结构列表数据 */
export async function queryLesseeAuthorityListService(params) {
  return await $R_P.get({
    url: '/auth/v1/authorities/list',
    params,
  });
}

export async function queryLesseeAuthorityService(id) {
  return await $R_P.get({
    url: `/auth/v1/authorities/${id}`,
    params: {},
  });
}

export async function getPageElementInTreeService(params) {
  return await $R_P.get({
    url: `/auth/v1/authorities/getPageElementInTree`,
    data: params,
  });
}

export async function findAuthorityInTreeService(params) {
  return await $R_P.get({
    url: `/auth/v1/authorities/getAuthorityInTree`,
    params,
  });
}

/** 新增表 */
export async function createLesseeAuthorityService(params) {
  return await $R_P.post({
    url: '/auth/v1/authorities/',
    data: params,
  });
}
export async function editLesseeAuthorityService(params, id) {
  return await $R_P.put({
    url: `/auth/v1/authorities/`,
    data: params,
  });
}

export async function createLesseeAuthorityFastService(params) {
  return await $R_P.post({
    url: '/auth/v1/authorities/batchSave',
    data: params,
  });
}

export async function batchDeleteLesseeAuthorityService(id) {
  return await $R_P.del({
    url: `/auth/v1/authorities/batchDelete/`,
    data: id,
  });
}
/** 删除表前确认能否删除 */
export async function allowDeleteLesseeAuthorityService(id) {
  return await $R_P.get({
    url: `/auth/v1/authorities/allowedDeleted/${id}`,
    params: {},
  });
}

/** 删除表 */
export async function deleteLesseeAuthorityService(id) {
  return await $R_P.del({
    url: `/auth/v1/authorities/${id}`,
    data: {},
  });
}

/** 复制表 */
export async function copyLesseeAuthorityService(params) {
  return await $R_P.post({
    url: '/auth/v1/authorities/copy',
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
