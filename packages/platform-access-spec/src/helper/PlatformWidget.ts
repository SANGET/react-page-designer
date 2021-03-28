// import deepmerge from 'deepmerge';
import { PlatformWidgetMeta } from "..";
import { mergeDeep } from '../deepmerge';

/**
 * 定义平台组件的 decorator
 * @param widgetMeta 
 */
export const PlatformWidget = (widgetMeta: PlatformWidgetMeta) => {
  const resData = { ...widgetMeta };
  return (SrouceClass): any => {
    SrouceClass.prototype.__widget_meta = resData;
    // Reflect.defineMetadata();
    return SrouceClass;
    // return mergeDeep<PlatformWidgetMeta>(resData, SrouceClass);
    // return Object.assign(resData, new SrouceClass());
  };
};
