import { getAppConfig } from "../../config";

interface UpdatePageParams {
  /** 给后端的页面数据 */
  pageInfoForBN;
  /** 前端维护的页面内容 */
  pageContentForFE;
  extendData?;
}

/**
 * 更新页面
 */
export async function updatePageService({
  pageInfoForBN,
  pageContentForFE,
  extendData = {},
}: UpdatePageParams) {
  if (!pageInfoForBN) {
    return console.error("请传入 pageInfoForBN");
  }
  const updatePageData = Object.assign({}, pageInfoForBN, extendData, {
    pageContent: JSON.stringify(pageContentForFE),
  });
  console.log("updatePageData", updatePageData);
  console.log("pageContentForFE", pageContentForFE);
  // console.log('pageContentForFEStr', JSON.stringify(pageContentForFE));
  return await $R_P.put({
    url: `/page/v1/pages/${pageInfoForBN.id}`,
    data: updatePageData,
    options: {
      showSuccessTip: true,
    },
  });
}

/**
 * nest 更新页面文件组件
 */
export async function updatePageFile({
  pageInfoForBN,
  pageContentForFE,
  extendData = {},
}: UpdatePageParams) {
  if (!pageInfoForBN) {
    return console.error("请传入 pageInfoForBN");
  }
  pageContentForFE.name = pageInfoForBN.name;
  const updatePageData = Object.assign({}, pageInfoForBN, extendData, {
    pageContent: JSON.stringify(pageContentForFE),
  });
  return await $R_P.post({
    url: `${window.$AppConfig.FEResourceServerUrl}/generate-page/${$R_P.urlManager.currLessee}/${$R_P.urlManager.currApp}`,
    data: updatePageData,
    options: {
      showSuccessTip: true,
    },
  });
}

/**
 * 获取页面详情
 */
export async function getPageDetailService(pageID: string) {
  const pageData = await $R_P.get(`/page/v1/pages/${pageID}`);
  // 为了兼容未来的字段更改
  const { result } = pageData;
  if (!result) return {};
  let pageContent;
  try {
    pageContent = JSON.parse(result.pageContent);
  } catch (e) {
    console.log("暂无数据");
  }
  result.pageContent = pageContent;
  return result;
}

export async function getDataSourceDetail(tableID) {
  const resData = await $R_P.get({
    url: `/data/v1/tables/${tableID}`,
  });

  return resData?.result;
}

export async function generatePageCode({
  pageDSL,
  pageID,
}) {
  const url = getAppConfig("FEResourceServerUrl");
  const { currApp, currLessee } = $R_P.urlManager;
  const resData = await $R_P.post({
    url: `${url}/preview-app/live`,
    data: {
      appCode: currApp,
      lessee: currLessee,
      pageDSL,
      pageID,
    }
  });

  return resData?.result;
}

export async function getDefaultLowcodeSnipet() {
  const url = getAppConfig("FEResourceServerUrl");
  const resData = await $R_P.get(`${url}/lowcode-provider`);

  return resData?.result;
}
