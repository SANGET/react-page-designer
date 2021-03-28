/**
 * 命名采用 VE 前缀，代表 visual editor
 */
import * as AppActions from './app';
import * as CanvasActions from './canvas';
import * as EntityStateActions from './entity-state';

export * from './app';
export * from './canvas';
export * from './entity-state';

export const AllDispatcherActions = {
  ...AppActions,
  ...CanvasActions,
  ...EntityStateActions,
};

export {
  AppActions,
  CanvasActions,
  EntityStateActions,
};

/**
 * 操作画布的 actions
 */
export interface VEAppDispatcher {
  InitApp: typeof AppActions['InitApp']
  UnmountApp: typeof AppActions['UnmountApp']
  UpdateAppContext: typeof AppActions['UpdateAppContext']
  ChangePageMeta: typeof AppActions['ChangePageMeta']
}

/**
 * 操作实例状态的 actions
 */
export interface VEEntityStateDispatcher {
  InitEntityState: typeof EntityStateActions['InitEntityState']
  UpdateEntityState: typeof EntityStateActions['UpdateEntityState']
  ChangeWidgetType: typeof EntityStateActions['ChangeWidgetType']
}

/**
 * 操作实例状态的 actions
 */
export interface VECanvasDispatcher {
  SetLayoutInfo: typeof CanvasActions['SetLayoutInfo']
  SortingEntity: typeof CanvasActions['SortingEntity']
  DelEntity: typeof CanvasActions['DelEntity']
  AddEntity: typeof CanvasActions['AddEntity']
  AddTempEntity: typeof CanvasActions['AddTempEntity']
  SelectEntity: typeof CanvasActions['SelectEntity']
  ChangeEntity: typeof CanvasActions['SelectEntity']
}

export interface VEDispatcher extends VEAppDispatcher, VEEntityStateDispatcher, VECanvasDispatcher{}
