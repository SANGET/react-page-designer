import { toBase64Str } from '@mini-code/request/url-resolve';
import { getAppConfig } from "./config-manager";

interface Options {
  appName: string
  pageID: string
  app: string
  pageName: string
  lessee?: string
}

const toQueryString = (params) => {
  let res = '';
  Object.keys(params).forEach((key) => {
    const val = params[key];
    if (val) {
      // 这里将传入应用端的参数都转 base64，避免中文编码的问题
      res += `&${key}=${toBase64Str(typeof val === 'object' ? JSON.stringify(val) : val)}`;
    }
  });
  return res;
};

/**
 * 获取预览地址
 */
export const getAppPreviewUrl = (options?: Options) => {
  const {
    appName = '测试应用',
    pageID,
    pageName,
    app,
  } = options || {};
  const appEntryUrl = getAppConfig(`previewAppEntryUrl`);

  const queryParamUrl = toQueryString({
    appName,
    pageName: { [`/page~${pageID}`]: pageName },
    lessee: $R_P.urlManager.currLessee,
    app,
  });
  // console.log(`${appEntryUrl}/#/${defaultPath ? 'page' : ''}?${queryParamUrl}`);
  return `${appEntryUrl}/${app}/#/page~${pageID}?${queryParamUrl}`;
  // return `${appEntryUrl}/#/${defaultPath ? 'page' : ''}?${queryParamUrl}`;
};
