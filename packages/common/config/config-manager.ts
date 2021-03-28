/* eslint-disable no-redeclare */
import * as yup from 'yup';
import store from 'store';

const providerAppConfigSchema = yup.object().shape({
  FEResourceServerUrl: yup.string().required('FEResourceServerUrl 是必须的'),
  paasServerUrl: yup.string().required('paasServerUrl 是必须的'),
  previewAppEntryUrl: yup.string().required('previewAppEntryUrl 是必须的'),
});

/**
 * 配置端的配置管理工具
 */

const AppConfig = {
  "FEResourceServerUrl": "",
  "paasServerUrl": "",
  // "toolHelperUrl": "",
  "previewAppEntryUrl": "",
  "appVersion": "",
  // 平台组件地址
  "platformUIUrl": "",
  "_offline": ""
};

export const configAlias = {
  "FEResourceServerUrl": "前端资源服务",
  "paasServerUrl": "PaaS 服务",
  "previewAppEntryUrl": "应用预览地址",
  "appVersion": "应用版本号",
  "buildTime": "构建时间",
  // "toolHelperUrl": "帮助中心",
};

type AppConfigType = typeof AppConfig

export function getAppConfig(): AppConfigType

/**
 * 获取 app 配置
 * @param configKey
 */
export function getAppConfig(configKey: keyof AppConfigType): string

export function getAppConfig(configKey?: keyof AppConfigType) {
  return configKey ? AppConfig[configKey] : AppConfig;
}

/**
 * 设置 app 配置
 * @param nextConfig
 */
export const setAppConfig = (nextConfig) => {
  // 验证环境配置是否合法
  providerAppConfigSchema.validateSync(nextConfig);

  Object.keys(nextConfig).forEach((field) => {
    store.set(field, nextConfig[field]);
  });
  // return configKey ? AppConfig[configKey] : AppConfig;
  Object.assign(AppConfig, nextConfig);
  window.$AppConfig = nextConfig;
};
