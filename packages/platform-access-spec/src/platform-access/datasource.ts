/**
 * 定义属性项可以改动的属性
 */

export interface PlatformColumn {
  id: string
  name: string
  /** 数据类型 */
  colDataType: string
  /** 字段 size */
  fieldSize: string
  /** 字段类型 */
  fieldType: string
  /** 字段的名字 */
  fieldCode: string
}

export interface PlatformDatasource {
  /** 该条记录的 id */
  id: string
  /** code */
  code: string
  /** 该条记录关联的表的 id */
  moduleId: string
  /** 名字 */
  name: string
  /** 类型 */
  type: string
  /** columns */
  columns: PlatformColumn[]
  createdBy: 'page'
}

export type PlatformDatasources = PlatformDatasource[]
