
import { PageMetadata } from "./page-metadata";

type MetaAttr = keyof PageMetadata

export interface NextEntityState {
  /** 目标属性 */
  attr: string
  /** 属性的值 */
  value: any
}

export type NextEntityStateType = NextEntityState | NextEntityState[]

export type ChangeEntityState = (nextEntityState: NextEntityStateType) => void

export interface TakeMetaOptions {
  /** meta 的 attr */
  metaAttr: MetaAttr
  /** meta 的引用 ID */
  metaRefID?: string
}

/**
 * TODO: 加强返回结果的类型检查
 */
export type TakeMeta = (options: TakeMetaOptions) => unknown

export type GenMetaRefID = (
  /** 编辑的 meta 属性 */
  metaAttr: MetaAttr,
  /** 生成的 options */
  options?: {
    /** 生成 id 的策略，将通过 . 分割传入的每一项策略 */
    idStrategy?: string | string[]
  }
) => string

