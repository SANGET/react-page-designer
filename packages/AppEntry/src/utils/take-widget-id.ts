import { FlatLayoutItems } from "@provider-app/page-visual-editor-engine/data-structure";
import { PageMetadata } from "@provider-app/platform-access-spec";
import { WidgetTypes } from "@provider-app/provider-app-common/config/widgetTypes";

/**
 * 后端需要的组件 ID 数据格式
 */
export interface PageUsedWidget {
  widgetId: string
  name?: string
  pid?: string
  /** 对应前端的 WidgetTypes */
  type?: number

  code?: string
}

const splice32 = (code = '') => {
  return code.slice(0, 32);
};

/**
 * 提取 widget id，用于生成权限项
 */
export const takeUsedWidgetIDs = (
  flatLayoutItems: FlatLayoutItems,
  pageDataFormRemote
): PageUsedWidget[] => {
  const { id: pageID, name } = pageDataFormRemote;
  const pageUsedWidget: PageUsedWidget[] = [];
  Object.keys(flatLayoutItems).forEach(widgetID => {
    const widgetItem = flatLayoutItems[widgetID];
    // console.log('widgetItem', widgetItem);
    const _widgetType = /button/gi.test(widgetItem.widgetRef) ? WidgetTypes.button : WidgetTypes.other;
    pageUsedWidget.push({
      // 32 位以内的 UI_ID
      widgetId: `__${pageID}__${widgetID}`,
      name: widgetItem.label,
      pid: pageID,
      type: _widgetType,
    });
  });
  return [
    {
      widgetId: pageID,
      type: WidgetTypes.page,
      name
    },
    ...pageUsedWidget
  ];
};

export const genBusinessCode = (
  flatLayoutItems: FlatLayoutItems,
  pageDataFormRemote
) => {
  const { id: pageID, name } = pageDataFormRemote;
  const businessCodes: PageUsedWidget[] = [];
  Object.keys(flatLayoutItems).forEach(widgetID => {
    const widgetItem = flatLayoutItems[widgetID];
    // console.log('widgetItem', widgetItem);
    // const isButton = /button/gi.test(widgetItem.widgetRef);
    // if (isButton) {
    if(widgetItem.label) {

      businessCodes.push({
        // 32 位以内的 UI_ID
        widgetId: splice32(`__${pageID}__${widgetID}`),
        name: widgetItem.label,
        code: splice32(`__${pageID}__${widgetID}`)
      });
    }
  });
  businessCodes.push({
    // 32 位以内的 UI_ID
    widgetId: `__${pageID}__PageId`,
    name: `页面事件`,
    code: `__${pageID}__PageId`
  });
  businessCodes.push({
    // 32 位以内的 UI_ID
    widgetId: `__${pageID}__CFId`,
    name: `页面事件`,
    code: `__${pageID}__CFId`
  });
  return businessCodes;
  // return [
  //   {
  //     widgetId: `__${pageID}__`,
  //     name,
  //     code: `queryPerson`
  //   }
  // ];

};

export const genDataSources = (
  pageMetadata: PageMetadata,
) => {
  const { dataSource } = pageMetadata;
  const dataSources: [] = [];
  Object.keys(flatLayoutItems).forEach(widgetID => {
    const metaItem = dataSource[metaID];
    // console.log('metaItem', metaItem);
    dataSources.push({
      // 32 位以内的 UI_ID
      datasourceId: metaItem.tableInfo.id,
      datasourceType: 'TABLE',
    });
  });
  return dataSources;
  // return [
  //   {
  //     widgetId: `__${pageID}__`,
  //     name,
  //     code: `queryPerson`
  //   }
  // ];
};
