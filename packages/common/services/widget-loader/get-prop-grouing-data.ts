import propItemGroupingData from "@provider-app/access-resources/grouping-data/prop-items.json";
// // import { propItemGroupingData } from "@platform-widget-access/register";
// import { ApiMock } from "./api-mock";

import { getWidgetServer } from "./utils";

// // export const getPropItemGroupingData = ApiMock(propItemGroupingData);
// export const getPropItemGroupingData = ApiMock({});

const groupDataCache = null;

export const getPropItemGroupingData = async () => {
  // if(!groupDataCache) {
  //   const url = getWidgetServer(`/widget-processor/grouping/prop-items`);
  //   groupDataCache = (await fetch(url, {
  //     method: 'GET'
  //   })).json();
  // }
  return propItemGroupingData;
};