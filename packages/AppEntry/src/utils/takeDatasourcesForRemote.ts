import { PageMetadata } from "@provider-app/platform-access-spec";

export const takeDatasourcesForRemote = (ds: PageMetadata['dataSource']) => {
  return Object.values(ds).map((dsItem) => {
    return {
      datasourceId: dsItem.id,
      datasourceType: dsItem.type
    };
  });
};

/**
 * 包装更新页面的数据源的数据结构
 * @param dataSourcesFormRemote
 */
// const wrapDataSourceDataForUpdate = (dataSourcesFormRemote) => {
//   const dataSourcesItems = dataSourcesFormRemote.map((tableData) => {
//     return {
//       datasourceId: tableData.id,
//       datasourceType: tableData.type
//     };
//   });
//   return {
//     dataSources: dataSourcesItems
//   };
// }