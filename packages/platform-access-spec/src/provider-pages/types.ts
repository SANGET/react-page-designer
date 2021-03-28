/**
 * 子应用的 props
 */
export interface ProviderPageProps {
  /** 页面的验证信息 */
  pageAuthInfo
  /** 当前页面的 path */
  pagePath: string
  /** 应用的 location */
  appLocation
}

/**
 * 子应用的配型
 */
export type ProviderPage = React.ElementType<ProviderPageProps>

/**
 * HOC 子应用
 */
export type ProviderPageHOC<T = any> = (props: ProviderPageProps) => React.ElementType<T>

export type ProviderPageChild<T = any> = ProviderPage | ProviderPageHOC<T>
