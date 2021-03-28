export type EditAttr = string | string[]

/**
 * 组件引用属性项的配置项
 */
export interface PropItemRefs {
  /** 引用的属性项的 id */
  propID: string
  /**
   * 1. 该属性项编辑的属性
   * 2. 可以覆盖由属性项元数据中声明的 whichAttr 属性
   * 3. 如果不填，默认可以修改全部属性
   */
  editAttr?: EditAttr
  /** 覆盖属性项定义的默认值 */
  defaultValues?: {
    [editAttr: string]: any
  }
}

/**
 * widget 绑定的属性
 */
export interface WidgetRelyPropItems {
  /** 绑定的属性项 */
  propItemRefs?: PropItemRefs[]
}