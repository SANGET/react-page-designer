export const APIMethods = ["POST", "GET", "PUT", "DELETE", "PATCH", "JSONP"];

export interface MetadataItem {
  /** 元数据字段 */
  // filed: string
  /** 字段类型 */
  type: 'string' | 'number' | 'dict'
  /** 是否必须 */
  required?: boolean
}

/**
 * API 的元数据
 */
export interface DSMetaTypeOfApi {
  /** 类型 */
  type: 'api'
  /** 名字 */
  name: string
  /** 描述 */
  desc?: string
  /** 资源的路径 */
  resourcePath: string
  /** 资源类型，表单提交 or 查询 */
  resourceType: 'form' | 'query'
  /** 请求结构 */
  reqSchema: Record<string, MetadataItem>
  /** 返回结构 */
  resSchema: Record<string, MetadataItem>
}

export type Datasource = DSMetaTypeOfApi