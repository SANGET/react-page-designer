/**
 * 查询权限树，列表
 * @param params 条件
 */
export async function getShowAuthorities(params) {
  return await $R_P.get({
    url: `/auth/v1/showAuthorities/list/`,
    params,
  });
}
/**
 * 查询权限树，树
 * @param params 条件
 */
export async function getShowAuthoritiesTree(params) {
  return await $R_P.get({
    url: `/auth/v1/showAuthorities/getAuthorityInTree`,
    params
  });
}

/**
 * 创建权限树
 * @param params 条件
 */
export async function createShowAuth(data) {
  return await $R_P.post({
    url: `/auth/v1/showAuthorities/`,
    data
  });
}

/**
 * 创建权限树
 * @param params 条件
 */
export async function updateShowAuth(data) {
  return await $R_P.put({
    url: `/auth/v1/showAuthorities/`,
    data
  });
}
/**
 * 查询权限项，树
 * @param params 条件
 */
export async function getAuthorityItemsTree(params) {
  return await $R_P.get({
    url: `/auth/v1/showAuthorities/getTaggedAuthorityTree`,
    params
  });
}

/**
 * 查询权限展示树，详情
 * @param params 条件
 */
export async function getShowAuthDetail({ id }) {
  return await $R_P.get({
    url: `/auth/v1/showAuthorities/${id}`
  });
}

/**
 * 是否允许删除权限展示树
 * @param params 条件
 */
export async function allowDeleteShowAuth({ id }) {
  return await $R_P.get({
    url: `/auth/v1/showAuthorities/allowDelete/${id}`
  });
}

/**
 * 删除权限展示树
 * @param params
 */
export async function deleteShowAuth(data: string[]) {
  return await $R_P.del({
    url: `/auth/v1/showAuthorities/batchDelete`,
    data
  });
}

/**
 * 批量新增权限展示树数据
 * @param params
 */
export async function batchCreateAuth(data) {
  return await $R_P.post({
    url: `/auth/v1/showAuthorities/batchSave`,
    data
  });
}
