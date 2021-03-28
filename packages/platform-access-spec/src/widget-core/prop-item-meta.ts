/**
 * 属性项，重要节点含义说明：
 * 1. whichAttr：属性项将编辑多少属性，平台将分析该属性，将其组装为一个对象通过 render 传入
 * 2. useMeta：使用了哪些页面元数据
 */
export interface PropItemMeta<G = string> {
  /** 该属性项的唯一标识 ID */
  readonly id: string
  // /** 被 widget 引用的属性名字 */
  // readonly name: string
  /** prop item 的分组信息 */
  readonly pGroupType?: G
  /** 属性项上方的显示名 */
  readonly label: string
  /**
   * 1. 需要编辑的组件实例状态的哪些属性；
   * 2. 如果指定的是数组，则传入到属性项的 widgetEntityState 为包含所有定义的对象结构；
   * 3. 可以被组件元数据的 editAttr 定义覆盖；
   */
  readonly whichAttr: string | string[]
  /** 是否使用 meta */
  readonly useMeta?: string | string[]
  /**
   * 1. 属性项给予组件实例的默认值
   * 2. 会被组件元数据的 defaultValues 中覆盖
   */
  readonly defaultValue?: any
  /** 多个属性的默认值 */
  readonly defaultValues?: {
    [whichAttr: string]: any
  }
  readonly tip?: string
}
