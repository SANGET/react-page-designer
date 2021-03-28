let widgetMetadataCache = [];

export const getExpMetadata = () => {
  return new Promise((resolve, reject) => {
    if (widgetMetadataCache?.length > 0) {
      resolve(widgetMetadataCache);
    } else {
      const url = `./exp-meta-store/meta.json`;
      fetch(url)
        .then((res) => res.json())
        .then((res) => {
          widgetMetadataCache = res;
          resolve(res);
        });
    }
  });
};
