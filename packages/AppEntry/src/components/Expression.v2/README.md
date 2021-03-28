# 表达式接入指南

## 调用方式

```ts
const closeModal = platformCtx.selector.openExpressionImporter({
  defaultValue: exp,
  defaultVariableList: []
  onSubmit: (newExp) => {
    closeModal();
  },
});
```

调用方的前置条件是需要获取到 platformCtx，并通过调用 platformCtx.selector.openExpressionImporter 打开表达式的编辑器弹窗。参数如下：

```ts
interface ISubmitRes {
  /** 编辑器内容，表达式文本 */
  code: string | null;
  /**
   * 表达式用到的变量数组
   * @field 变量标识，在文本中体现，与变量 ID 关联
   * @value 变量 ID
   */
  variable: { field: string; value: string }[];
}

type VariableType = 'system' | 'page' | 'pageInput' | 'widget';

type VariableDataType = 'number' | 'string' | 'date' | 'dateTime' | 'numberArray' | 'stringArray' | 'dateArray' | 'dateTimeArray';

type VariableItem = {
  title: string
  code: string
  id: string
  alias?: string
  varType: VariableDataType
  realVal?: number | string
  type: VariableType
}

interface IDefaultVariableListChildren extends VariableItem {
  value: string;
}

interface IDefaultVariableList {
  title: string;
  value: string;
  disabled: boolean;
  children: IDefaultVariableListChildren[];
}

interface IProps {
  /** 提交回调函数 */
  onSubmit: (ISubmitRes) => void;
  /** 编辑器默认值，常用于编辑 */
  defaultValue?: ISubmitRes;
  /** 默认的变量列表 */
  defaultVariableList?: IDefaultVariableList
}
```

> defaultVariableList 可不传，编辑器就会通过 metaCtx.getVariableData(["page", "pageInput"]) 获取所有变量，metaCtx 在平台上下文中可以获取 metaCtx: PlatformCtx["meta"]

ISubmitRes 示例：

```ts
let res = {
  code: "HY.LENGTH(widget$qOTaRFsm$realVal)",
  variable: [{ field: "widget$qOTaRFsm$realVal", value: "qOTaRFsm.realVal" }],
};
/**  */
```

field 生成规则：

``` ts
/** type: 变量类型 */
/** id: 变量 ID */
`${type}$${id?.replace(/(\.)/g, "$").replace(/-/g, "__")}`
```

## 应用端使用

应用端如何计算，应用端通过 variable 对应关系获取系统中真实的变量值(因为应用端变量是树的形式，不能直接传入所有变量到 JS 沙箱)，暂定方案：

```ts
import createSandbox from "@engine/js-sandbox";
/** 函数库数组 */
import { HY_METHODS } from "@library/expression-methods";

const HY = HY_METHODS.reduce((a, b) => {
  a[b.name] = b.execute;
  return a;
}, {});
/** 模拟从应用端获取到的真实值 */
const debugCodeValue = { widget$qOTaRFsm$realVal: "test" };

/** 通过所需变量真实值和函数库生成执行环境 */
const sandbox = createSandbox({ ...debugCodeValue, HY }, {});
/** 执行具体代码 */
const res = await sandbox("HY.LENGTH(widget$qOTaRFsm$realVal)");
console.log("执行结果: ", res);
```
