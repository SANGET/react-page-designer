# 配置端工程说明

1. 平台组件，由工具开发者提供
2. 布局组件，由工具开发者提供
3. 业务组件模版制作，由工具使用者，包括的功能由
  a. N个平台组件 + API 制作成模版
  b. 组件之间的联动
  c. ...

## 1. 前置知识

### 1.1. 技术选型

- 基础语言
  - typescripts
  - scss
- 样式库
  - tailwindcss 重要，基础布局
  - antd.css：UI 库样式
  - deer-ui.css：通用弹窗、下拉器 UI
  - react-icons：项目所用的 icons
- 渲染层
  - react
  - redux
  - antd
  - react-dnd 页面设计拖拽技术的基础
- 数据验证
  - yup
- 请求库
  - @mini-code/request
- 基础库
  - lodash
  - dayjs 日期处理
- 工程构建
  - yarn：[yarn workspace 基本概念](https://blog.csdn.net/i10630226/article/details/99702447)
  - @provider-app/platform-env-scripts 封装过的 react 前端工程脚手架
    - webpack
    - react-scripts

---

## 2. 工程结构（Architecture）

### 2.1. 术语

| 术语 | 说明 |
| -- | -- |
| 业务模块 | 配置端中的，除了页面设计器之外的通用资源管理模块 |
| 页面设计器 | 设计页面布局、样式的模块 |

### 2.2. 目录结构

- `__test__/` - 测试目录，可以放在任意目录
- `.vscode/` - 编辑器配置
- `dist/` - 打包构建后的文件存放目录
- `docs/` - 文档
- `externals/` - 运行时依赖声明
- `packages/` - 工作区
  - `AppEntry` __配置前端入口👈__
  - `common` 公共模块
    - `config` 公共配置
    - `constants` 公共常量
    - `services` 公共数据请求服务
      - `biz-modules-apis` 业务模块的 APIs
      - `widget-loader` 组件加载器
  - `shared-ui` - 配置端中共享的 UI
  - `multiple-tab-router` - 多 tab 路由模块
  - `platform-access-spec` - 页面设计器接入规则，用于属性项的接入
  - `platform-resources` - 属性项、组件分组信息、属性项分组信息
    - `grouping-data` 分组数据
    - `platform-widget-prop-item-hub` 属性项
    - `provider-widget-access` 组件接入元数据
  - `page-designer-modules` - __页面设计器模块🤘__
    - `code-editor-engine` 代码编辑器模块，提供低代码、表达式的基础能力
    - `code-parser-engine` 代码解析模块
    - `page-visual-editor-engine` __页面设计器引擎__，提供基础的布局拖拽的能力
    - `PageDesigner` __页面设计器模块__，包含支持产品的业务代码
      - `components` 模块内相关组件
        - `PDDataSource` __数据源模块__，提供数据源树展示和数据源选择能力
          - `DataSourceSelector` 数据源弹窗
          - `DictSelector` 数据源弹窗-字典选择
          - `TableSelector` 数据源弹窗-表选择
          - `DataSourceDragItem` 数据源树展示
        - `PDInfraUI` 页面设计器内公用组件
          - `DataSearchEditor` 数据检索范围编辑器
          - `FieldSortHelper` 字段排序配置器
          - `ModuleTreeRenderer` 模块树组件
          - `ValueHelper` 值 配置器
        - `PDPageConfiguration` 页面设置模块
          - `ChangeFields` 页面动作-数据提交之字段设值编辑器模块
          - `ChangeVariables` 页面动作-变量赋值编辑器模块
          - `ChooseData` 页面动作-数据选择编辑器模块
          - `DisplayControl` 页面动作-控件显示编辑器模块
          - `ModalConfigEditor` 页面动作-数据选择之弹窗配置编辑器模块
          - `ModalConfigSelector` 页面动作-数据选择之弹窗选择器模块
          - `OpenLink` 页面动作-打开链接 编辑器模块
          - `PageActionSelector` 页面动作 设计器模块
          - `PageAttachedTableSelector` 页面附属表 设计器模块
          - `PageButtonSelector` 页面按钮 设计器模块
          - `PageConfigContainer` 页面设置 容器
          - `PageEventSelector` 页面事件 设计器模块
          - `PageEventSelectorForLowCode` 页面事件 低代码接入模块
          - `PageVariableEditor` 页面变量编辑器
          - `PageVariableSelector` 页面变量展示容器
          - `PageWidgetSelector` 页面组件展示容器
          - `ReadFormData` 页面动作-整表读取配置器
          - `ReadTableWidget` 页面动作-表格查询
          - `SubmitData` 页面动作-数据提交
          - `WriteFormData` 页面动作-整表回写
          - `WriteTableWidget` 页面动作-表格编辑
  - `provider-app-biz-pages` - 配置端业务模块集合，__支持业务扩展__
    - `AuthDistributor` 权限树管理
      - `components` 组件
        - `AuthItemTree` 权限项树
        - `AuthList` 权限树数据列表
        - `AuthShowTree` 权限树
        - `AuthTree` 底层权限树型组件
      - `pages` 
        - `BatchCreateAuth` 批量新增权限树
        - `CreateAuth` 新建权限树
    - `DictionaryManager` 字典管理
    - 
    - `Dashboard` 首页的应用管理
    - `...` 更多，可以查看目录中的 README.md 获取更多信息
- `scripts` - 工程脚本
- `.eslintignore` - eslint 中`需忽略的项`配置
- `.eslintrc` - eslint 配置
- `.gitignore` - git 中`需忽略的项`配置
- `jest.config.js` - jest 配置
- `package.json` - 工程 package json 配置
- `README.md` - 工程总说明文档
- `tsconfig.json` - typescript 配置
- `tailwind.config.js` - tailwindcss 配置

---

## 3. 开发（Develop）

### 3.1. 组件对接

在 `./packages/platform-resources/grouping-data/widget.json` 中按需添加组件：

```json
{
  "itemsGroups": [
    {
      "title": "表单组件",
      "type": "",
      "items": [
        "FormInput",
        ...
      ]
    },
    ...
  ],
  ...
}
```

在目录 `./packages/platform-resources/provider-widget-access` 下添加对应组件配置文件，xx.meta.json（如 FormInput.meta.json)，配置大致如下：

```json
{
  "label": "文本框", // 组件标题(组件树中展示用)
  "icon": "FiEdit2", // 组件图标（来源为 ProviderIcons）
  "widgetRef": "FormInput", // 组件的引用
  "wGroupType": "formController", // 组件类别
  "eventAttr": [ // 组件支持的事件类型
    { "alias": "值改变事件", "type": "onChange" },
    ...
  ],
  "varAttr": [ // 组件在运行期对外提供的变量数据
    { "alias": "实际值", "attr": "realVal", "type": "string" },
    ...
  ],
  "propItemsRely": { // 组件在配置端能被配置的属性
    "propItemRefs": [
      { 
        "propID": "prop_widget_coding", // 引用的属性项的 id
        "editAttr": ["widgetCode"],// 该属性项编辑的属性
        "defaultValues": { // 覆盖属性项定义的默认值
          "title": "文本框" 
        } 
      },  ...
    ]
  }
}
```

---

## 4. 环境配置

环境配置路径：`packages/AppEntry/public/provider-env-config.${env}.json`，`${env}` 为 `dev` | `prod`，对应开发与生产环境。

说明：

```json
{
  // 配置的版本
  "_version": 1,
  // 离线开发时使用
  "_offline": false,
  // 应用版本号
  "appVersion": "",
  // 构建时间
  "buildTime": "",
  // 前端资源服务
  "FEResourceServerUrl": "http://localhost:3000/node-web",
  // PaaS 地址
  "paasServerUrl": "http://192.168.14.140:6090",
  // 预览的地址
  "previewAppEntryUrl": "http://localhost:22110",
  // 帮助中心的地址
  "toolHelperUrl": "http://192.168.14.181:6677",
  // 加载外部库
  "externalScripts": [
    // 平台组件库
    "http://localhost:22110/platform-ui.js"
  ]
}
```

### 4.1. 配置使用

通过 window.$AppConfig 获取

```ts
window.$AppConfig.FEResourceServerUrl
```

通过 store 获取

```ts
import store from 'store'

const res = store.get('FEResourceServerUrl')
```

## 5. 错误排查、处理

### 5.1. 依赖错误

`duplicate-identifier-LibraryManagedAttributes` 重复的标识 `LibraryManagedAttributes`。由于 @types/react 重复引用了不同版本导致的错误。解决方法是依赖同一个 @types/react 包。

---

## 6. 测试

### 6.1. 运行测试用例

```shell
yarn test
```

### 6.2. 编写测试用例

基于 `jest`。

TODO

---

## 7. 其他

### 7.1. 查看 npm 包的依赖关系

通过 npm 自带的工具 `npm ls [package name]` 可以查看包的依赖关系，例如：

```shell
# 分析整个工程对于 react 的依赖关系
npm ls react
```

## 8. 属性项接入

参考 `packages/platform-resources/platform-widget-prop-item-hub`

## 9. 平台组件接入

### 9.1. 步骤

1. 准备平台组件（查看平台组件工程）
2. 接入到配置端
   1. 编写平台组件接入元数据（参考 `packages/platform-resources/provider-widget-access`）
   2. 编写组件分组信息（参考 `packages/platform-resources/grouping-data`）
