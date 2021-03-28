import { loadPropItemMetadata } from "@provider-app/provider-app-common/services/widget-loader";

let propItemData;

loadPropItemMetadata().then((_propItemData) => {
  propItemData = _propItemData;
});

export const getPropItemMeta = (propItemID) => {
  if (!propItemData) {
    console.error(`没有属性项配置，请检查代码`);
  }
  // console.log(propItemData[propItemID]);
  return propItemData?.[propItemID];
};