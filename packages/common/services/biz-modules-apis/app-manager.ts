/**
 * 应用管理 API
 */
import { getAppConfig } from "@provider-app/provider-app-common/config/config-manager";

/**
 * 获取应用
 */

export async function GetApplication() {
  return await $R_P.get({
    url: "/manage/v1/applications",
    // options: {
    //   businessTip: {
    //     type: 'success',
    //     whenCodeEq: '00000'
    //   }
    // }
  });
}

/**
 * 创建应用
 */
export async function CreateApplication(data) {
  // return await $R_P.post('/manage/v1/applications', data, {
  //   businessTip: {
  //     type: 'error',
  //   }
  // });
  return await $R_P.post({
    url: "/manage/v1/applications",
    data,
    options: {
      showSuccessTip: true,
    },
  });
}

/**
 * 删除应用
 */
export async function DelApplication(appID) {
  return await $R_P.del(`/manage/v1/applications/${appID}`);
}

/**
 * 预览
 * @param appID
 */
export async function previewAppService(appID: string, appDescData) {
  // console.log(appDescData)
  const lessee = $R_P.urlManager.currLessee;
  // const lessee = $R_P.config.commonHeaders;
  const url = getAppConfig("FEResourceServerUrl");
  const paasServerUrl = getAppConfig("paasServerUrl");

  return $R_P.get({
    url: `${paasServerUrl}/paas/${lessee}/manage/v1/applications/preview/${appID}`,
  });

  // return await $R_P.post({
  //   url: `${url}/preview-app?lessee=${lessee}&appCode=${appID}&token=${$R_P.config.commonHeaders.Authorization}&pageID=${appDescData.id}`,
  //   data: {
  //     appDescData,
  //   },
  // });
}
// export async function previewAppService(appID: string) {
//   const lessee = $R_P.urlManager.currLessee;
//   const paasServerUrl = getAppConfig('paasServerUrl');

//   return await $R_P.get({
//     url: `${paasServerUrl}/paas/${lessee}/manage/v1/applications/preview/${appID}`,
//   });
// }

function checkStatus(res) {
  console.log(res);
  if (res.status >= 200 && res.status < 300) {
    return res;
  }
  return res.text();
}

function checkCode(res) {
  if (typeof res === "string") {
    throw new Error(res);
  }
  return res;
}

export async function downloadBackEnd(appAccessCode: string, fileName: string) {
  return fetch(
    `${$R_P.config.baseUrl}/manage/v1/applications/export/${appAccessCode}`,
    {
      headers: $R_P.config.commonHeaders,
    }
  )
    .then(checkStatus)
    .then(checkCode)
    .then((res) =>
      res.blob().then((blob) => {
        const a = document.createElement("a");
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = `${fileName}.zip`;
        a.click();
        window.URL.revokeObjectURL(url);
      })
    );
}

export async function downloadFrontEnd() {
  return fetch(
    `${window.$AppConfig.FEResourceServerUrl}/release-app/download/${$R_P.urlManager.currLessee}`,
    {
      method: "GET",
      headers: $R_P.config.commonHeaders,
    }
  )
    .then(checkStatus)
    .then(checkCode)
    .then((res) =>
      res.blob().then((blob) => {
        const a = document.createElement("a");
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = `${$R_P.urlManager.currLessee}.tar.gz`;
        a.click();
        window.URL.revokeObjectURL(url);
      })
    );
}

export async function downloadFrontEndForApp(appCode, fileName, appName) {
  return fetch(
    `${window.$AppConfig.FEResourceServerUrl}/app-exporter?lesseeCode=${$R_P.urlManager.currLessee}&applicationCode=${appCode}&appName=${appName}`,
    {
      method: "GET",
      headers: $R_P.config.commonHeaders,
    }
  )
    .then(checkStatus)
    .then(checkCode)
    .then((res) =>
      res.blob().then((blob) => {
        const a = document.createElement("a");
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = `${fileName}.tar.gz`;
        a.click();
        window.URL.revokeObjectURL(url);
      })
    );
}

export async function compileApp(data) {
  const { appCode } = data;
  await Promise.all([
    $R_P.get({
      url: `${window.$AppConfig.FEResourceServerUrl}/release-app/compile/${$R_P.urlManager.currLessee}/${appCode}`,
      options: {
        showSuccessTip: true,
      },
    }),
    $R_P.get({
      url: `${window.$AppConfig.FEResourceServerUrl}/low-code/compile/${$R_P.urlManager.currLessee}/${appCode}`,
      options: {
        showSuccessTip: true,
      },
    }),
  ]);
}

export async function compoundApp(data) {
  const { appCode } = data;
  await $R_P.post({
    url: `${window.$AppConfig.FEResourceServerUrl}/low-code/compound/${$R_P.urlManager.currLessee}`,
    options: {
      showSuccessTip: true,
    },
  });
}
