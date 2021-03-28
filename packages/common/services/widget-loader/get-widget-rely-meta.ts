// import propItemGroupingData from "@provider-app/access-resources/provider-widget-access";
// import { WidgetTypeMetadataCollection } from "@provider-app/platform-access-spec";
// import * as MetaCollection from "@platform-widget-access/register/rely-meta";
// import { ApiMock } from "./api-mock";
import { WidgetMeta } from "@provider-app/platform-access-spec";
import { getWidgetServer, loadScript } from "./utils";

const MetaCollection = {};

/**
 * 创建组件集合
 */
const createWidgetMetaColl = () => {
  const res = {};
  /** 将数组转换成 collection 数据机构 */
  Object.keys(MetaCollection).forEach((metaKey) => {
    const meta = MetaCollection[metaKey];
    res[meta.widgetRef] = meta;
  });
  return res;
};

export const widgetMetadataCollection: WidgetTypeMetadataCollection = createWidgetMetaColl();

const widgetMetadataCache = {};

export const getWidgetMetadataSync = (widgetRef: string) => widgetMetadataCache[widgetRef];

export const getWidgetMetadata = (widgetRef): Promise<WidgetMeta> => {
  return new Promise((resolve, reject) => {
    if(widgetMetadataCache[widgetRef]) {
      resolve(widgetMetadataCache[widgetRef]);
    } else if(!widgetRef) {
      reject(false);
    } else {
      // const modulePath = `@provider-app/access-resources/provider-widget-access/${widgetRef}.json`;
      // console.log(modulePath);
      // import(modulePath).then((module) => {
      //   console.log(module);
      //   resolve(module);
      // });
      // const url = getWidgetServer(`./widget-meta-store/provider-widget-access/${widgetRef}.json`);

      const url = `./widget-meta-store/${widgetRef}.meta.json`;
      fetch(url).then((res) => res.json()).then((res) => {
        widgetMetadataCache[widgetRef] = res;
        resolve(res);
      });
    }
  });
};
// export const getWidgetMetadata = ApiMock(widgetMetadataCollection);
