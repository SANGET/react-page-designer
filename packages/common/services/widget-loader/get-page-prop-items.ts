// import { ApiMock } from "./api-mock";

import { getWidgetServer, loadScript } from "./utils";

export const getPropItemData = () => {
  return new Promise((resolve, reject) => {
    const scriptSrc = getWidgetServer(`/compiler/prop-items/prop-item.for-page.js`);
    loadScript('AllPropItems', scriptSrc).then(resolve).catch(reject);
  });
};