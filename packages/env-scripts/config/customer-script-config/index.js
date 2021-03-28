const path = require('path');
const yup = require('yup');
const fs = require('fs');
const chalk = require('react-dev-utils/chalk');
const { configFileName } = require('./config');
const paths = require('../paths');

const overridablePaths = (() => {
  const resShape = {};
  Object.keys(paths).forEach((pathname) => {
    resShape[pathname] = yup.string();
  });
  return resShape;
})();

const customerConfigSchema = yup.object().shape({
  // 用于覆盖原有 paths 配置的配置
  paths: yup.object().shape(overridablePaths).required('缺少 paths'),
  // 用于覆盖原有 webpack 配置的配置
  webpackConfig: yup.object().shape({}),
});

const customerScriptConfig = (() => {
  const configFilePath = path.join(process.cwd(), configFileName);
  if(fs.existsSync(configFilePath)) {
    console.log(chalk.green(`找到自定义配置文件: ${configFilePath}`));
    try {
      const config = require(configFilePath);
      customerConfigSchema.validateSync(config);
      return config;
    } catch(e) {
      console.log(chalk.red(e.message));
      return {};
    }
  } else {
    console.log(`没找到自定义配置文件，将采用内置的配置`);
    return {};
  }
})();

module.exports = {
  paths: customerScriptConfig.paths || {},
  webpackConfig: customerScriptConfig.webpackConfig || {},
  preRun: customerScriptConfig.preRun || {},
  buildExternalsPipeline: customerScriptConfig.buildExternalsPipeline || [],
};
