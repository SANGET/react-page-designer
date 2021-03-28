import { getWidgetServer } from "./utils";

/**
 * 重新编译组件或属性项
 * @param type 
 */
export const recompiler = (type: 'widget' | 'prop-items') => {
  return new Promise((resolve, reject) => {
    const url = getWidgetServer(`/widget-processor/__recompiler/${type}`);
    fetch(url).then(res => res.json()).then(resolve).catch(reject);
  });
};