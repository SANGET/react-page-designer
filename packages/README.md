# 页面设计器模块

页面设计器是比较复杂的业务模块，编写的代码量也相对复杂，所以抽离成一个单独的 package 工作区来开发维护。

## 目录结构

- code-editor-engine/ 低代码编辑器
- code-parser-engine/ 低代码解析引擎，后续可能会弃用
- page-visual-editor-engine/ 页面可视化编辑器引擎，页面布局的低层抽象与实现
- PageDesigner/ 页面设计器应用入口，包含产品所需的业务逻辑
