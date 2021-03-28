/* eslint-disable import/no-dynamic-require */
/* eslint-disable @typescript-eslint/no-var-requires */
// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

require('../config/env');

const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const merge = require('webpack-merge');
const { mkdirp, copySync, rm } = require('fs-extra');
const chalk = require('react-dev-utils/chalk');
const createCompilerOptions = require("../config/webpack.config.platform");
const paths = require('../config/paths');
const { buildExternalsPipeline } = require('../config/customer-script-config');

const buildCoreOutputDir = path.join(paths.appPublic, 'platform-core');

const buildExternalItem = (buildCompilerConfig) => {
  const {
    entry,
    output,
  } = buildCompilerConfig;
  // const coreModulePackageDesc = require(coreModulePackPath);
  // const { version } = coreModulePackageDesc;
  // const filename = `platform-core.v${version}.js`;
  const { path: outputPath, filename } = output;
  const outputFilePath = path.join(outputPath, filename);


  // 判断是否存在已有版本的 core 文件，如果有，则不进行构建
  // const filePath = path.join(buildCoreOutputDir, filename);

  if(!fs.existsSync(outputFilePath)) {
    console.log(chalk.cyan(`未找到 external 模块 ${filename}，系统将进行构建...`));
    const compilerOptions = merge(createCompilerOptions('development'), buildCompilerConfig);
    const coreCompiler = webpack(compilerOptions);
    coreCompiler.run((err, status) => {
      if(err || status.hasErrors()) {
        console.log(`构建 ${filename} 失败：`);
        console.log(chalk.red(status.toString()));
        rm(buildCoreOutputDir, {
          force: true,
          recursive: true
        }, (rmErr) => {});

        process.exit();
      } else {
        console.log(chalk.green(`构建 external 模块 ${filename} 成功`));
      }
    });
  } else {
    console.log(chalk.cyan(`已存在 external 模块 ${filename}...`));
  }
};

if(Array.isArray(buildExternalsPipeline)) {
  buildExternalsPipeline.forEach((buildConfig) => {
    buildExternalItem(buildConfig);
  });
}