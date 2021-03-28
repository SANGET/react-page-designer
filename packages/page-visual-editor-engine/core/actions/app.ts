/**
 * @author zxj
 *
 * 应用的 action，需要留有足够的扩展空间
 */

import { ChangeMetadataOption, ChangeMetadataOptions } from "@provider-app/platform-access-spec";
import { BasePageData, PageState } from "../../data-structure";

export interface AppActionsContext {
  pageState?: PageState
  pageContent?: BasePageData
  payload?: any
  name?: string
  id?: string
  /** 初始化的 meta */
  initMeta?: any
}

export const INIT_APP = 'app/init';
export interface InitAppAction extends AppActionsContext {
  type: typeof INIT_APP
}

/**
 * 初始化应用数据
 */
export const InitApp = (actionPayload: AppActionsContext): InitAppAction => {
  return {
    type: INIT_APP,
    ...actionPayload
  };
};

export interface UpdateAppAction extends AppActionsContext {
  type: typeof UPDATE_APP
}
export const UPDATE_APP = 'app/update';
/**
 * 更新 app context 数据
 */
export const UpdateAppContext = (actionPayload: AppActionsContext): UpdateAppAction => {
  return {
    type: UPDATE_APP,
    ...actionPayload,
  };
};

export const UNMOUNT_APP = 'app/unmount';
export interface UnmountAppAction {
  type: typeof UNMOUNT_APP
}

/**
 * 初始化应用数据
 */
export const UnmountApp = (): UnmountAppAction => {
  return {
    type: UNMOUNT_APP,
  };
};

export const CHANGE_METADATA = 'app/change-metadata';

export type ChangeMetadataAction = {
  type: typeof CHANGE_METADATA
  changeDatas: ChangeMetadataOption[]
}


/**
 * 初始化应用数据
 */
export const ChangePageMeta = (options: ChangeMetadataOptions): ChangeMetadataAction => {
  const changeDatas = Array.isArray(options) ? options : [options];
  return {
    type: CHANGE_METADATA,
    changeDatas
  };
};
