import { getDataSourceDetail } from "@provider-app/provider-app-common/services";

/**
 * 通过 datasourceId 包装 request 请求
 */
export const dataSourceDetailWrapper = (
  dataSourcesFromRemote: any[] = []
) => {
  const getDataPromise: Promise[] = [];
  dataSourcesFromRemote.forEach((dataS) => {
    const p = getDataSourceDetail(dataS.id);
    getDataPromise.push(p);
  });
  return Promise.all([...getDataPromise]);
};

/**
 * 通过 datasourceId 从远端获取完整的包括 columns 的数据
 * @param dataSourcesFromRemote
 */
// export const takeDatasources = (
//   dataSourcesFromRemote: any[]
// ): Promise<PlatformDatasource> => {
//   return new Promise((resolve, reject) => {
//     dataSourceDetailWrapper(dataSourcesFromRemote)
//       .then((remoteDSData) => {
//         const nextState: PlatformDatasource = wrapInterDatasource(remoteDSData);
//         resolve(nextState);
//       })
//       .catch(reject);
//   });
// };
