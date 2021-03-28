/**
 * 此入口仅用于启动独立应用，需要应用该应用，请通过 ./src/app.tsx
 */
import React from "react";
import ReactDOM from "react-dom";

import { setAppConfig } from "@provider-app/provider-app-common/config/config-manager";
// import PageDesigner from "./main";
import reportWebVitals from "./reportWebVitals";
import { setPlatformApiUrl } from "./services";
// import "../services";

const env = process.env.NODE_ENV;
const { paasServerUrl, FEResourceServerUrl, previewAppEntryUrl } = process.env;

const envConfigFromProcess = {
  paasServerUrl,
  FEResourceServerUrl,
  previewAppEntryUrl,
};

const removeLoadingBG = () => {
  const loaderDOM = document.querySelector("#loadingBg");
  if (!loaderDOM || !loaderDOM.parentNode) return;
  loaderDOM.classList.add("loaded");
  loaderDOM.parentNode.removeChild(loaderDOM);
  // setTimeout(() => {
  // }, 100);
};

/**
 * 根据程序环境获取环境配置的地址
 */
const getEnvConfigUrl = () => {
  const _env = env === "development" ? "dev" : "prod";
  return `./provider-env-config.${_env}.json?${Date.now()}`;
};

fetch(getEnvConfigUrl())
  .then((res) => res.json())
  .then(async (config) => {
    try {
      const { default: App } = await import(
        /* webpackChunkName: "provider_app_entry" */ "./main"
      );

      // 合并环境配置
      Object.keys(envConfigFromProcess).forEach((envKey) => {
        const envVal = envConfigFromProcess[envKey];
        // Object.assign(config, envConfigFromProcess);
        if (envVal) config[envKey] = envVal;
      });

      // 设置应用配置
      setAppConfig(config);

      // 设置平台的 API url
      setPlatformApiUrl(config.paasServerUrl);

      // 异步加载外部 script
      // await loadExternalScriptsSync(config.externalScripts);
      removeLoadingBG();

      // 渲染页面
      const P = App({});
      ReactDOM.render(
        <div>
          <P
            appLocation={{
              pageID: "123",
            }}
          />
          {/* {PageDesigner({
        appLocation: {},
      })} */}
        </div>,
        document.querySelector("#Main")
      );

      reportWebVitals();
    } catch (err) {
      console.log("程序启动错误，请检查");
      console.log(err);
    }
  });

// const bootstrap = () => {
//   const P = PageDesigner({});
//   ReactDOM.render(
//     <div>
//       <P
//         appLocation={{
//           pageID: "123",
//         }}
//       />
//       {/* {PageDesigner({
//         appLocation: {},
//       })} */}
//     </div>,
//     document.querySelector("#Main")
//   );
// };

// bootstrap();
