// import { PlatformWidgetDesc } from '@provider-app/platform-access-spec';
// import * as Widgets from '../refs-widget';

import { getWidgetServer, loadScript } from "../utils";

// import { getUICompHOC } from './getUIComp';

/**
 * 获取组件实例
 */
// export const getWidget = getUICompHOC<PlatformWidgetDesc>(Widgets);
// export const getWidget = getUICompHOC<PlatformWidgetDesc>({});

export const getWidget = (widgetRef: string) => {
  return new Promise((resolve, reject) => {
    if(!widgetRef) {
      return reject(`没有传入widgetRef，请检查代码`);
    }
    const scriptSrc = getWidgetServer(`/compiler/widgets/${widgetRef}/index.js?t=${widgetRef}`);
    return loadScript(widgetRef, scriptSrc).then(resolve).catch(reject);
  });
};
