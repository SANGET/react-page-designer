import { PlatformCtx } from "@provider-app/platform-access-spec";

export interface ActionTemplateComponentProps<T> {
  /** platformCtx */
  platformCtx: PlatformCtx;
  /** pageMetadata */
  pageMetadata;
  /** 点击提交 */
  onSubmit: (options: T) => void;
  /** 点击取消 */
  onCancel: () => void;
  /** 回填的配置的值 */
  initValues;
}