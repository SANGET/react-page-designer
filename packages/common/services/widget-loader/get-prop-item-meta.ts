// import * as PropItems from "@provider-app/access-resources/platform-widget-prop-item-hub";
// import { ApiMock } from "./api-mock";

// import { getWidgetServer, loadScript } from "./utils";

// // const PropItemComps = {};

// /**
//  * 创建属性项集合
//  */
// const createPropItemColl = () => {
//   const res = {};
//   /** 将数组转换成 collection 数据机构 */
//   Object.keys(PropItemComps).forEach((compDef) => {
//     const { id } = PropItemComps[compDef];
//     res[id] = PropItemComps[compDef];
//   });
//   return res;
// };

// /**
//  */

// export const getPropItemData = ApiMock(propItemsCollection);
export const loadPropItemMetadata = () => {
// export const getPropItemData = () => {
  return new Promise((resolve, reject) => {
    // const scriptSrc = getWidgetServer(`/compiler/prop-items/prop-item.all.js`);
    // loadScript('AllPropItems', scriptSrc).then(resolve).catch(reject);
    import("@provider-app/access-resources/platform-widget-prop-item-hub").then((module) => {
      resolve(module.default);
    });
  });
};
