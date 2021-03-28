const path = require("path");
const fs = require("fs");
const day = require("dayjs");
const child = require("child_process");
const prettier = require("prettier");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");

/**
 * web 客户端的核心依赖库
 */
const WebClientCoreExternals = {
  react: "ProviderRuntimeCore.React",
  "react-dom": "ProviderRuntimeCore.ReactDOM",
  antd: "ProviderRuntimeCore.antd",
  yup: "ProviderRuntimeCore.yup",
};

/**
 * web 客户端的三方依赖库
 */
const WebClientLibExternals = {
  "@provider-app/shared-ui": "Provider_3_party.SharedUI",
  "@deer-ui/core": "Provider_3_party.DeerUI",
  sortablejs: "Provider_3_party.Sortablejs",
  "@ant-design/pro-table": "Provider_3_party.AntdProTable",
  "@ant-design/pro-form": "Provider_3_party.AntdProForm",
};

/**
 * web 客户端的 icons 依赖库
 */
const WebClientIconsExternals = {
  "@ant-design/icons": "ProviderIcons.AntdIcons",
  "react-icons/ri": "ProviderIcons.ReactIconRI",
  "react-icons/bi": "ProviderIcons.ReactIconBI",
  "react-icons/fi": "ProviderIcons.ReactIconFI",
};

/**
 * 公用的应用配置
 */
const genAppInfoConfig = () => {
  // 获取应用版本
  const appVersion = require(path.resolve(__dirname, "../../package.json"))
    .version;
  return {
    _offline: false,
    appVersion: appVersion,
  };
};

/**
 * 生成环境配置
 */
const genEnvConfig = (configName, extraConfig) => {
  if (!configName) {
    throw Error("必须传入 config name");
  }
  const configVersion = 7;
  const publicConfigPath = path.join(__dirname, `public/${configName}`);

  // 已存在的配置
  let existConfig;
  // 是否环境配置有变动
  let isDiff = true;

  if (fs.existsSync(publicConfigPath)) {
    existConfig = require(publicConfigPath);
    const { _version } = existConfig;

    // 如果版本相同，则不做修改
    isDiff = _version !== configVersion;
  }
  const buildTime = day();

  // 合并配置
  const nextEnvConfig = Object.assign(
    {},
    existConfig,
    {
      _version: configVersion,
    },
    // 无论如何，都需要有构建信息
    genAppInfoConfig(),
    // extraConfig,
    // 如果发生变化，则覆盖原有的环境配置
    isDiff ? extraConfig : {},
  );
  Object.assign(nextEnvConfig, existConfig, { buildTime });
  // 写入配置文件
  fs.writeFileSync(
    publicConfigPath,
    prettier.format(JSON.stringify(nextEnvConfig), {
      parser: "json",
    })
  );
};

/**
 * 复制组件元数据到工程的 public 目录，方便通过异步接口获取
 */
const cpWidgetMeta = () => {
  child.exec("mkdir -p ./public/widget-meta-store");
  child.exec("mkdir -p ./public/exp-meta-store");
  child.exec(
    "cp -r ../platform-resources/provider-widget-access/* ./public/widget-meta-store"
  );
  child.exec(
    "cp -r ../platform-resources/provider-exp-access/* ./public/exp-meta-store"
  );
};

module.exports = {
  paths: {
    srcDir: "src",
    appIndexJs: "index",
    appBuildDir: "dist",
    appHtml: "public/index.html",
    deployHtml: "public/deploy.html",
  },
  // 先构建配置端应用所需要的 externals 模块
  buildExternalsPipeline: [
    {
      entry: path.join(__dirname, "externals-lib/core"),
      output: {
        path: path.join(__dirname, "public/externals-libs"),
        filename: `platform-core.js`,
        library: "ProviderRuntimeCore",
      },
    },
    {
      entry: path.join(__dirname, "externals-lib/lib"),
      output: {
        path: path.join(__dirname, "public/externals-libs"),
        filename: `platform-3-party.js`,
        library: "Provider_3_party",
      },
      externals: WebClientCoreExternals,
    },
    {
      entry: path.join(__dirname, "externals-lib/icons"),
      output: {
        path: path.join(__dirname, "public/externals-libs"),
        filename: `platform-icons.js`,
        library: "ProviderIcons",
      },
      externals: WebClientCoreExternals,
    },
  ],
  // 声明配置端的 externals 的依赖，依赖上面的 buildExternalsPipeline 配置
  webpackConfig: {
    output: {
      publicPath: "./",
    },
    externals: {
      // core
      ...WebClientCoreExternals,

      // lib
      ...WebClientLibExternals,

      // icons
      ...WebClientIconsExternals,

      // ...prodExternals,
      // platform widget
      // '@provider-app/access-resources': "HYC_RESOURCES",
    },
    plugins: [
      new MonacoWebpackPlugin({
        // available options are documented at https://github.com/Microsoft/monaco-editor-webpack-plugin#options
        languages: ["json", "javascript", "typescript"],
      }),
    ],
  },
  preRun: () => {
    // 复制组件 meta 到 public 服务
    cpWidgetMeta();

    genEnvConfig("provider-env-config.dev.json", {
      paasServerUrl: "http://192.168.14.140:6090",
      FEResourceServerUrl: "http://localhost:3000/node-web",
      previewAppEntryUrl: "http://localhost:22110",
      toolHelperUrl: "http://192.168.14.181:6677",
      platformUIUrl: "http://localhost:38000/platform-ui.js",
      externalScripts: [],
    });
    // 生成生成环境的配置
    genEnvConfig("provider-env-config.prod.json", {
      paasServerUrl: "http://192.168.14.140:6090",
      FEResourceServerUrl: "http://192.168.14.166:22010/node-web",
      previewAppEntryUrl: "http://192.168.14.166:22110",
      toolHelperUrl: "http://192.168.14.181:6677",
      externalScripts: [],
      platformUIUrl:
        "http://localhost:38000/platform-ui.js",
    });
  },
};
