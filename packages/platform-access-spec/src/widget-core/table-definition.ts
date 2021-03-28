export interface ConditionStrategyInput {
  type: 'input'
}

/**
 * 引用的选项数据源
 */
export interface ConditionStrategySelectorDSRef {
  type: 'ref'
  refID: string
}

/**
 * 指定的 options 作为数据源
 */
export interface ConditionStrategySelectorDSOptions {
  type: 'options'
  /** 作为数据源的 options */
  options?: ({
    value: any
    text: string
  })[]
}

export interface ConditionStrategySelector {
  type: 'selector'
  dataSource: ConditionStrategySelectorDSRef | ConditionStrategySelectorDSOptions
}

/**
 * 不展示该字段的查询条件
 */
export interface ConditionStrategyNone {
  type: 'none'
}

export type ConditionStrategy = ConditionStrategyNone | ConditionStrategyInput | ConditionStrategySelector

/**
 * 平台级别的表格的 column 数据结构抽象
 * TODO: 完善渲染策略
 */
export interface PTColumn {
  /** id */
  id: string
  /** 显示给用户看的 title */
  title: string
  /** 数据显示的 index */
  dataIndex: string
  /** 字段唯一标识 */
  fieldID: string
  /** 数据源唯一标识 */
  dsID: string
  /** 字段类型区分 */
  type: 'dsColumn'
  /** 
   * 行数据渲染策略，方案未定
   * TODO: 确定渲染策略
   */
  rowRenderStrategy?: {

  }
  /**
   * 列作为查询条件的渲染策略
   */
  conditionStrategy?: ConditionStrategy
}
