const loadWidgetCache = {};

const isDev = process.env.NODE_ENV === 'development';

/**
 * 用于加载 script
 */
export const loadScript = (scriptID, scriptSrc, cache = !isDev) => {
  return new Promise((resolve, reject) => {
    const widgetScriptID = `___widget_id_${scriptID}`;
    const widgetLoadState = loadWidgetCache[scriptID];
    if(cache && widgetLoadState && widgetLoadState.done) {
      resolve(true);
    } else {
      loadWidgetCache[scriptID] = {
        done: false
      };
      const script = document.createElement('script');
      script.id = widgetScriptID;
      script.src = scriptSrc;
      script.onload = () => {
        resolve(true);
        loadWidgetCache[scriptID] = {
          done: true
        };
      };
      document.head.appendChild(script);
    }
  });
};

let widgetServerUrl = null;

/**
 * 设置组件服务器的地址
 * @param apiUrl 
 */
export const setupWidgetServer = (apiUrl: string) => {
  widgetServerUrl = apiUrl;
};

/**
 * 获取组件服务地址
 */
export const getWidgetServer = (path?: string) => {
  if(!widgetServerUrl) {
    console.error(`尚未设置 widgetServerUrl，请先调用 setupWidgetServer(apiUrl)`);
  }
  return `${widgetServerUrl}${path}`;
};