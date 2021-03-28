import widgetGroupingData from "@provider-app/access-resources/grouping-data/widget.json";
// import { widgetPanelData } from "@platform-widget-access/register";
// import { ApiMock } from "./api-mock";

// import { getWidgetServer } from "./utils";

export const getWidgetPanelData = async () => {
  // const url = getWidgetServer(`/widget-processor/grouping/widget`);
  // return (await fetch(url, {
  //   method: 'GET'
  // })).json();
  return widgetGroupingData;
};
// export const getWidgetPanelData = ApiMock(widgetPanelData);

// getWidgetPanelData().then(res => {
//   console.log(res);
// });
