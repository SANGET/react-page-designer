# 低代码配置器模块

## 模块说明

- 低代码配置器

## 目录结构

- `LowCodeFunSources` - 专家模式的函数配置模板集合
  - `closePageModal.tsx` - 关闭弹窗页面 参数配置器+完整逻辑代码片段
  - `dataBackfill.tsx` - 数据回填 参数配置器+完整逻辑代码片段
  - `deleteData.tsx` - 数据删除 参数配置器+完整逻辑代码片段
  - `getDataParams.tsx` - 数据查询 参数配置器+完整逻辑代码片段
  - `getSeletData.tsx` - 下拉数据源 参数配置器+完整逻辑代码片段
  - `modifyData.tsx` - 数据编辑 参数配置器+完整逻辑代码片段
  - `openLinkPage.tsx` - 打开弹窗页面 参数配置器+完整逻辑代码片段
  - `openSelectModal.tsx` - 打开弹窗选择 参数配置器+完整逻辑代码片段
  - `submitDataParams.tsx` - 数据提交 参数配置器+完整逻辑代码片段
  - `tableInit.tsx` - 表格初始化 参数配置器+完整逻辑代码片段
- `LowCodeFunSourcesSimple` - 简单版的函数配置模板集合
  - `dataBackfillSimple.tsx` - 数据回填简版 参数配置器+调用HYCLIB库的代码片段
  - `deleteDataSimple.tsx` - 数据删除简版 参数配置器+调用HYCLIB库的代码片段
  - `getDataParamsSimple.tsx` - 数据查询简版 参数配置器+调用HYCLIB库的代码片段
  - `getSeletDataSimple.tsx` - 下拉数据源简版 参数配置器+调用HYCLIB库的代码片段
  - `modifyDataSimple.tsx` - 数据编辑简版 参数配置器+调用HYCLIB库的代码片段
  - `openLinkPageSimple.tsx` - 打开弹窗页面简版 参数配置器+调用HYCLIB库的代码片段
  - `openSelectModalSimple.tsx` - 打开弹窗选择简版 参数配置器+调用HYCLIB库的代码片段
  - `submitDataParamsSimple.tsx` - 数据提交简版 参数配置器+调用HYCLIB库的代码片段
  - `tableInitQuerySimple.tsx` - 表格初始化查询简版 参数配置器+调用HYCLIB库的代码片段
  - `tableInitSimple.tsx` - 表格初始化简版 参数配置器+调用HYCLIB库的代码片段
- `index.tsx` - 入口文件
- `LowCodeConfig.tsx` - 低代码配置器主文件
- `LowCodeConfigSimple.tsx` - 低代码配置器简单版主文件
- `LowCodeTemplate.tsx` - 专家模式的函数模板列表
- `LowCodeTemplateSimple.tsx` - 简单版的函数模板列表

## 调用低代码配置器的方法

```ts
const closeModal = platformCtx.selector.openLowCodeImporter({
      defaultValue: { code: "", simpleCode: "", params: {}, use: "func" },// 可以不传
      eventType: "onClick", // 事件类型
      platformCtx, // 平台上下文
      onSubmit: (lowCodeKey) => {
        // 这里获取到配置好的低代码片段
        // lowCodeKey 的内部格式{code:string,codeSimple:{code:string,params:any},use:string}
        
        closeModal();// 关闭代码配置器弹窗
      },
    });
```

## 目前接入过的位置

1. 页面事件-低代码
2. 页面设置/页面事件-低代码
3. 控件属性里面的 动作设置
