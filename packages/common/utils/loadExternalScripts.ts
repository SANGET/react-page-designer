import { LoadScript } from '@deer-ui/core/utils/load-stuff';

/**
 * 加载外部 scripts
 * @param deferExternalScripts 
 */
export const loadExternalScriptsAsync = (deferExternalScripts) => {
  // console.log(deferExternalScripts);
  if(Array.isArray(deferExternalScripts)) {
    deferExternalScripts.forEach((item) => {
      LoadScript({
        src: item.src ? item.src : item
      });
    });
  }
};

export const loadExternalScriptsSync = (resourcesUrl: string[]) => {
  return new Promise((resolve, reject) => {
    const all: any[] = [];
    if(Array.isArray(resourcesUrl)) {
      resourcesUrl.forEach((url) => {
        const loadItem = new Promise((resolveSub) => {
          LoadScript({
            src: `${resourcesUrl}`,
            onload: () => {
              resolveSub('');
            }
          });
        });
        all.push(loadItem);
      });
    }
    Promise.all(all).then((res) => {
      resolve('');
    });
  });
};
