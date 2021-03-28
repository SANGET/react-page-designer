import template from '../mock/mock-page-dsl.json';
import blankTmpl from '../dsl-templates/blank.json';

/**
 * 页面内容数据过滤，为了兼容旧页面
 */
export const pageContentFilter = (pageContent) => {
  const tmpl = blankTmpl;
  // 从远端获取模版
  const returePageContent = pageContent || tmpl;

  if(Array.isArray(returePageContent.content)) {
    if(returePageContent.content.length > 1) {
      // 旧页面在最外层并没有 pageContainer，所以长度将 > 1，所以以此为依据，进入数据转换流程
      returePageContent.content = [
        Object.assign({}, tmpl.content[0], {
          body: pageContent.content
        })
      ];
    }
    if(returePageContent.content.length === 0) {
      // 旧页面在最外层并没有 pageContainer，所以长度将 > 1，所以以此为依据，进入数据转换流程
      returePageContent.content = [
        Object.assign({}, tmpl.content[0], {
          body: pageContent.content
        })
      ];
    }
    // if(returePageContent.content[0].eventAttr?.length === 0) {
    //   // 另外旧的页面，最外层的 eventAttr 为空数组，所以也需要转换
    //   Reflect.deleteProperty(returePageContent.content[0], 'eventAttr');
    //   Reflect.deleteProperty(returePageContent.content[0], 'varAttr');
    // }
    if(!returePageContent.content[0].eventAttr || returePageContent.content[0].eventAttr?.length === 0) {
      // 另外旧的页面，最外层的 eventAttr 为空数组，所以也需要转换
      returePageContent.content[0].eventAttr = tmpl.content[0].eventAttr;
      returePageContent.content[0].varAttr = tmpl.content[0].varAttr;
    }
    if(!returePageContent.content[0].propState) {
      returePageContent.content[0].propState = {};
    }
  }
  return returePageContent;
};