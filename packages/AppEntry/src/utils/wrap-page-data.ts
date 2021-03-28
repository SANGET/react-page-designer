import produce from 'immer';
import { BasePageData } from "@provider-app/page-visual-editor-engine/data-structure";

export const wrapPageData = ({
  id,
  name = '测试',
  pageID,
  pageState,
  type = 2,
  pageMetadata,
  layoutInfo,
}): BasePageData => {
  // console.log(pageMetadata, layoutInfo, entitiesStateStore);

  return {
    content: layoutInfo,
    id,
    name,
    pageState,
    pageID,
    meta: {
      ...pageMetadata,
    }
  };
};
