/* eslint-disable no-param-reassign */
import { LoadingTip } from "@provider-app/shared-ui";
import {
  AppActionsContext,
  VEDispatcher,
  VisualEditorState,
} from "@provider-app/page-visual-editor-engine/core";
import {
  ChangeDataSourceParam,
  ChangeDataSourcesParam,
  ChangeMetadataOptions,
  GetVariableData,
  PlatformDatasource,
  ProviderPageProps,
  WidgetEntity,
} from "@provider-app/platform-access-spec";
import { Modal } from "antd";
import {
  getPageDetailService,
  updatePageService,
  updatePageFile,
} from "@provider-app/provider-app-common/services";
import produce from "immer";
import pick from "lodash/pick";
import React from "react";
import { getAppConfig } from "@provider-app/provider-app-common/config";
import { loadExternalScriptsSync } from "@provider-app/provider-app-common/utils/loadExternalScripts";
import { treeNodeHelper } from "@provider-app/page-visual-editor-engine/utils";
import { StageContext } from "@provider-app/page-visual-editor-engine/utils/stage-context";
import CanvasStage from "./components/PDCanvasStage";
import { PDPropertiesEditor } from "./components/PDPropertiesEditor";
import ToolBar from "./components/PDToolbar";
import WidgetPanel from "./components/PDWidgetPanel";
import {
  createPlatformCtx,
  genBusinessCode,
  genMetaIDStrategy,
  genMetaRefID,
  getVariableDataTool,
  pageContentFilter,
  PlatformContext,
  takeDatasourcesForRemote,
  takeUsedWidgetIDs,
  wrapPageData,
} from "./utils";
import MockPageDSL from "./mock/mock-page-dsl.json";
import { getDSLTemplate } from "./services/getTmpl";

import "./style";

interface VisualEditorAppProps extends VisualEditorState {
  dispatcher: VEDispatcher;
}

class PageDesignerApp extends React.Component<
  VisualEditorAppProps & ProviderPageProps
> {
  state = {
    hoveringPath: [],
    selectedPath: [],
  };

  selectedEntity!: WidgetEntity;

  componentDidCatch(error, errorInfo) {
    // 在顶层尝试捕获异常
    console.log(error, errorInfo);

    Modal.error({
      title: `页面设计器捕捉到错误`,
      content: (
        <div style={{ maxHeight: 300, overflow: "auto" }}>
          {JSON.stringify(errorInfo)}
        </div>
      ),
    });
  }

  componentDidMount = async () => {
    try {
      this.perpareInitData();
    } catch (e) {
      console.error(e);
    }
  };

  /**
   * 更改 page meta 的策略
   * 1. 如果没有传入 metaID，认为是新增行为
   * 2. 如果传入了 metaID，则认为是更新行为
   * 3. 通过 replace 控制是否全量替换更新
   * 4. 通过 relyID 指定该 meta 的被依赖项
   */
  changePageMetaStradegy = (
    options: ChangeMetadataOptions
  ): string | string[] => {
    /** 判断是否有 datasource 的参数 */
    const hasChangeDatasource = (optionTmpl) => {
      return optionTmpl.some((item) => item.metaAttr === "dataSource");
    };

    const isArrayOptions = Array.isArray(options);
    const hasIChangeDatasource = hasChangeDatasource(
      (isArrayOptions && options) || [options]
    );
    if (hasIChangeDatasource) {
      console.error(
        "不能通过 changePageMeta 更改数据源映射数据，请使用 platformCtx.meta.changeDataSource"
      );
      return "";
    }
    const {
      // selectedInfo,
      dispatcher: { ChangePageMeta },
    } = this.props;
    const { id: activeEntityID } = this.selectedEntity;

    const returnMetaIDForEachStep: string[] | string[][] = [];
    const returnMetaIDs: string[] = [];
    const nextOptions: ChangeMetadataOptions = genMetaIDStrategy(options, {
      entityID: activeEntityID,
      forEachCalllback: (metaID) => {
        if (Array.isArray(metaID)) {
          const newArray: string[] = [];
          newArray.push.apply(returnMetaIDs, metaID);
        } else {
          returnMetaIDs.push(metaID);
        }
        returnMetaIDForEachStep.push(metaID as any);
      },
    });

    ChangePageMeta(nextOptions);

    return isArrayOptions ? returnMetaIDs : returnMetaIDForEachStep[0];
  };

  /**
   * 获取 meta
   */
  takeMeta = (options) => {
    const { pageMetadata } = this.props;
    const { metaAttr, metaRefID } = options;
    if (metaRefID) {
      if (Array.isArray(metaRefID)) {
        return pick(pageMetadata[metaAttr], metaRefID);
      }
      return pageMetadata[metaAttr]?.[metaRefID];
    }
    return pageMetadata[metaAttr];
  };

  changeWidgetType = (widgetType: string) => {
    const {
      dispatcher: { ChangeWidgetType },
      // selectedInfo,
    } = this.props;
    const { selectedPath } = this.state;
    // const { treeNodePath, entity } = this.selectedEntity;
    ChangeWidgetType(
      {
        treeNodePath: selectedPath,
        entity: this.selectedEntity,
      },
      widgetType
    );
  };

  /**
   * 响应更新属性绑定数据源的回调
   */
  // onUpdatePropDs = (
  //   option: ChangeDataSourceParam | ChangeDataSourcesParam
  // ): string | string[] => {
  //   const prop = "prop";
  //   const createAndRm = "create&rm";
  //   if (!option) return "";
  //   let rmList: string[] = [];
  //   let createList: PlatformDatasource[] = [];
  //   if (option.type === createAndRm) {
  //     if (option.rmMetaID) {
  //       rmList = [option.rmMetaID];
  //     }
  //     if (option.data) {
  //       createList = [option.data];
  //     }
  //   } else {
  //     if (option.rmMetaIDList) {
  //       rmList = option.rmMetaIDList;
  //     }
  //     if (option.dataList) {
  //       createList = option.dataList;
  //     }
  //   }
  //   const { dataSource } = this.props.pageMetadata;
  //   /** 转成对象格式 */
  //   const nextCreateList = {};
  //   const returnOptions: string[] = [];
  //   createList.forEach((dsItem, idx) => {
  //     const dsRefID = genMetaRefID("dataSource", {
  //       idStrategy: dsItem.id,
  //     });
  //     returnOptions.push(dsRefID);
  //     nextCreateList[dsRefID] = { ...dsItem, createdBy: [prop] };
  //   });
  //   /** 删除 */
  //   const nextDataSource = {};
  //   Object.keys(dataSource).forEach((dsID) => {
  //     const ds = dataSource[dsID];
  //     if (!rmList.includes(dsID)) {
  //       nextDataSource[dsID] = ds;
  //       return;
  //     }
  //     if (ds.createdBy.length === 1 && ds.createdBy[0] === prop) {
  //       return;
  //     }
  //     nextDataSource[dsID] = {
  //       ...ds,
  //       createdBy: ds.createdBy.filter((item) => item !== prop),
  //     };
  //   });
  //   /** 新增 */
  //   Object.keys(nextCreateList).forEach((dsID) => {
  //     if (dsID in nextDataSource) {
  //       const { createdBy: prevCreatedBY } = nextDataSource[dsID];
  //       Object.assign(nextCreateList[dsID], {
  //         createdBy: (prevCreatedBY.includes(prop) && prevCreatedBY) || [
  //           ...prevCreatedBY,
  //           prop,
  //         ],
  //       });
  //     }
  //   });
  //   const {
  //     dispatcher: { ChangePageMeta },
  //   } = this.props;
  //   ChangePageMeta([
  //     {
  //       type: "replace",
  //       metaAttr: "dataSource",
  //       datas: { ...nextDataSource, ...nextCreateList },
  //     },
  //   ]);
  //   if (option.type === createAndRm) {
  //     return returnOptions[0];
  //   }
  //   return returnOptions;
  // };

  /**
   * 获取数据源
   */
  getDatasources = () => {
    return this.props.appContext.payload?.interDatasources;
  };

  /**
   * 获取远端的页面信息数据
   */
  getCurrPageDataDetail = () => {
    const { appContext } = this.props;
    const { pageDataRes } = appContext?.payload as any;
    return pageDataRes;
  };

  /**
   * 获取页面信息
   */
  getPageInfo = () => {
    const { flatLayoutItems, pageMetadata } = this.props;
    const pageDataFormRemote = this.getCurrPageDataDetail();
    // const { pageID, title } = appLocation;
    const submitData = pick(pageDataFormRemote, [
      "id",
      "type",
      "moduleID",
      "name",
      "belongMenus",
    ]);
    const usedWidgets = takeUsedWidgetIDs(flatLayoutItems, pageDataFormRemote);
    const businessCodes = genBusinessCode(flatLayoutItems, pageDataFormRemote);
    const dataSources = takeDatasourcesForRemote(pageMetadata.dataSource);
    return {
      ...submitData,
      usedWidgets,
      businessCodes,
      dataSources,
    };
  };

  /**
   * 获取页面内容
   */
  getPageContent = () => {
    const { layoutInfo, pageMetadata, appLocation, appContext } = this.props;
    const { pageState } = appContext;
    const { pageID, title } = appLocation;
    const pageContent = wrapPageData({
      id: pageID,
      pageID,
      pageState,
      name: title,
      pageMetadata,
      layoutInfo,
    });

    return pageContent;
  };

  /**
   * 准备应用初始化数据，并发进行
   * 1. 获取前端动态资源：所有组件类数据、属性项数据、组件面板数据、属性面板数据、页面可编辑属性项数据
   * 2. 从远端获取页面数据，包括 页面数据、数据源
   * 3. 将「数据源面板」插入到组件类面板中
   * 4. 将数据准备，调用 InitApp 初始化应用
   * 5. 获取页面模版
   */
  perpareInitData = async () => {
    const { dispatcher, appLocation } = this.props;
    const {
      pageID,
      // 从创建页面后，路由传入的模版字段，其他时刻并不存在
      tmpl,
    } = appLocation;
    const { InitApp } = dispatcher;

    const offlineMode = getAppConfig("_offline");
    const platformUIUrl = getAppConfig("platformUIUrl");

    /** 并发获取初始化数据 */
    const [pageDataRes] = await Promise.all([
      !offlineMode && getPageDetailService(pageID),
      loadExternalScriptsSync([platformUIUrl]),
    ]);

    /** 准备初始化数据 */
    const initData: AppActionsContext = {};
    if (offlineMode) {
      // 如果离线开发
      Object.assign(initData, {
        pageContent: MockPageDSL,
      });
    } else {
      const { pageContent } = pageDataRes;
      let pageContentRes = pageContent;
      if (!pageContentRes) {
        // 如果是新创建的页面，则从模版中选取
        pageContentRes = await getDSLTemplate(tmpl);
      }
      // 这里是为了兼容旧创建的页面的过滤器，以后将要移除
      pageContentRes = pageContentFilter(pageContentRes);
      Object.assign(initData, {
        pageContent: pageContentRes,
        payload: {
          pageDataRes,
        },
      });
    }

    InitApp(initData);
  };

  /**
   * 更新页面状态
   * @param nextPageState
   */
  changePageState = (nextPageState) => {
    const {
      dispatcher: { UpdateAppContext },
    } = this.props;
    UpdateAppContext({
      pageState: nextPageState,
    });
  };

  updatePage = (options = {}) => {
    // const {
    //   datasources = this.getDatasources()
    // } = options;
    return new Promise((resolve, reject) => {
      // const interDatasources = datasources;
      const pageContent = this.getPageContent();
      const offlineMode = getAppConfig("_offline");
      if (offlineMode) return resolve({});
      Promise.all([
        updatePageService({
          pageInfoForBN: this.getPageInfo(),
          pageContentForFE: pageContent,
          // extendData: this.wrapDataSourceDataForUpdate(interDatasources),
        }),
        // updatePageFile({
        //   pageInfoForBN: this.getPageInfo(),
        //   pageContentForFE: pageContent,
        // }),
      ])
        .then((res) => {
          resolve(res);
        })
        .catch((e) => {
          reject(e);
        });
    });
  };

  /**
   * 发布页面
   */
  onReleasePage = () => {
    return this.updatePage();
  };

  // /**
  //  * 响应组件添加到画布的事件
  //  */
  // onAddEntity = (entity) => {
  //   if (Array.isArray(entity.varAttr)) {
  //     /**
  //      * 添加控件变量的策略
  //      */
  //     const changeMetaOptions: any[] = [];
  //     entity.varAttr.forEach((varItem) => {
  //       changeMetaOptions.push({
  //         type: "create",
  //         metaAttr: "varRely",
  //         relyID: entity.id,
  //         data: {
  //           type: "widget",
  //           widgetRef: entity.id,
  //           varAttr: varItem,
  //           // eventAttr: entity.eventAttr,
  //         },
  //       });
  //     });
  //     this.changePageMetaStradegy(changeMetaOptions);
  //   }
  // };

  /**
   * 添加控件变量的规则，响应添加
   */
  onAddEntity = (entity, treeNodePath) => {
    this.stageContext.changeSelectedPath(treeNodePath);

    this.changePageMetaStradegy({
      type: "create",
      metaAttr: "varRely",
      relyID: entity.id,
      data: {
        type: "widget",
        widgetRef: entity.id,
        varAttr: entity.varAttr,
        // eventAttr: entity.eventAttr,
      },
    } as any);
  };

  updateEntityStateForSelected = (nextState) => {
    const {
      dispatcher: { UpdateEntityState },
      // selectedInfo,
    } = this.props;
    // const { entity } = this.selectedEntity;
    const { selectedPath } = this.state;
    UpdateEntityState(
      {
        entity: this.selectedEntity,
        treeNodePath: selectedPath,
      },
      nextState
    );
  };

  updateEntityState = (id, nextState) => {
    const { flatLayoutItems } = this.props;
    const entity = flatLayoutItems[id];
    this.props.dispatcher.UpdateEntityState(
      {
        entity,
        treeNodePath: entity.treeNodePath,
      },
      nextState
    );
  };

  getVariableData: any = (options = {}) => {
    const { pageMetadata, flatLayoutItems } = this.props;
    const { varRely, dataSource } = pageMetadata;
    const varCollection = getVariableDataTool({
      dataSource,
      varRely,
      flatLayoutItems,
      ...options,
    });
    return varCollection;
  };

  getPageMeta = (attr) => {
    return attr ? this.props.pageMetadata[attr] : this.props.pageMetadata;
  };

  delEntity = (id) => {
    const { dispatcher, flatLayoutItems } = this.props;
    const entity = flatLayoutItems[id];
    dispatcher.DelEntity(entity.treeNodePath, entity);
  };

  // getSelectedEntity = () => {
  //   const {
  //     id: activeEntityID,
  //     entity: activeEntity,
  //   } = this.props.selectedInfo;
  //   return activeEntity;
  // };

  getPageInfoForCtx = () => {
    const { pageID } = this.props.appLocation;
    return {
      pageID,
    };
  };

  getPageState = () => {
    const { appContext } = this.props;
    const { pageState } = appContext;
    return pageState;
  };

  getAppDescData = () => {
    const pageContent = this.getPageContent();
    return pageContent;
  };

  onUpdateApiConfig = (apiConfigMeta, type = "create") => {
    const { id } = apiConfigMeta;
    const metaIDInfo = {
      [type === "rm" ? "rmMetaID" : "metaID"]: id,
    };
    this.changePageMetaStradegy({
      type,
      metaAttr: "apisConfig",
      data: apiConfigMeta,
      ...metaIDInfo,
    } as any);
  };

  getSelectedEntityForCtx = () => this.selectedEntity;

  changeDataSource: any = () => {};

  /**
   * 由页面设计器提供给属性项使用的平台上下文
   */
  platformCtx = createPlatformCtx({
    changePageMeta: this.changePageMetaStradegy,
    genMetaRefID,
    takeMeta: this.takeMeta,
    changeWidgetType: this.changeWidgetType,
    getVariableData: this.getVariableData,
    getPageMeta: this.getPageMeta,
    changeDataSource: this.changeDataSource,
    getSelectedEntity: this.getSelectedEntityForCtx,
    getPageInfo: this.getPageInfoForCtx,
    getPageState: this.getPageState,
    getPageContent: this.getPageContent,
    // changeEntityState: this.changeEntityState,
  });

  stageContext = {
    hoveringPath: this.state.hoveringPath,
    selectedPath: this.state.selectedPath,
    changeHoveringPath: (nextPath) => {
      this.setState({
        hoveringPath: nextPath,
      });
      this.stageContext.hoveringPath = nextPath;
    },
    changeSelectedPath: (nextPath) => {
      // 选中组件实例
      this.selectedEntity = this.getSelectedEntity(nextPath);
      this.setState({
        selectedPath: nextPath,
      });
      this.stageContext.selectedPath = nextPath;
    },
  };

  getSelectedEntity = (selectedPath) => {
    // const { selectedPath } = this.state;
    selectedPath = selectedPath || this.state.selectedPath;
    const { layoutInfo, flatLayoutItems } = this.props;
    if (selectedPath.length === 0) return null;
    const selectedEntity = treeNodeHelper(layoutInfo, {
      type: "get",
      locatedIndexOfTree: selectedPath,
    });
    const entityMeta = flatLayoutItems[selectedEntity.id];
    const resItem = Object.assign({}, selectedEntity, entityMeta);

    return resItem;
  };

  render() {
    const {
      dispatcher,
      // selectedInfo,
      layoutInfo,
      pageMetadata,
      appContext,
      flatLayoutItems,
      appLocation,
    } = this.props;
    // const { selectedPath } = this.state;
    const { selectedEntity } = this;

    const activeEntityID = selectedEntity?.id;

    // const { id: activeEntityID, entity: activeEntity } = selectedInfo;

    // if (!appContext.ready) {
    //   return <LoadingTip />;
    // }
    return (
      <PlatformContext.Provider value={this.platformCtx}>
        <StageContext.Provider value={this.stageContext}>
          <div className="visual-app bg-white">
            <header className="app-header">
              <ToolBar
                getAppDescData={this.getAppDescData}
                getPageContent={this.getPageContent}
                pageMetadata={pageMetadata}
                flatLayoutItems={flatLayoutItems}
                onReleasePage={this.onReleasePage}
                changePageState={this.changePageState}
                appLocation={appLocation}
                pageState={appContext.pageState}
                updateEntityState={this.updateEntityState}
                delEntity={this.delEntity}
              />
            </header>
            <div
              className="app-content"
              // style={{ top: 0 }}
            >
              <div className="comp-panel">
                <WidgetPanel
                  layoutNodeInfo={layoutInfo}
                  onUpdateApiConfig={this.onUpdateApiConfig}
                  pageMetadata={pageMetadata}
                />
              </div>
              <div className="canvas-container" style={{ height: "100%" }}>
                {!appContext.ready ? (
                  <LoadingTip />
                ) : (
                  <CanvasStage
                    // selectedInfo={selectedInfo}
                    layoutNodeInfo={layoutInfo}
                    pageMetadata={pageMetadata}
                    onAddEntity={this.onAddEntity}
                    onEntityClick={(treeNodePath) => {
                      // console.log(treeNodePath);
                      this.stageContext.changeSelectedPath(treeNodePath);
                    }}
                    onStageClick={() => {
                      // SelectEntity(PageEntity);
                    }}
                    {...dispatcher}
                  />
                )}
              </div>
              <div className="prop-panel">
                {selectedEntity && (
                  <PDPropertiesEditor
                    key={activeEntityID}
                    platformCtx={this.platformCtx}
                    pageMetadata={pageMetadata}
                    selectedEntity={selectedEntity}
                    entityState={selectedEntity?.propState}
                    updateEntityState={this.updateEntityStateForSelected}
                  />
                )}
              </div>
            </div>
          </div>
        </StageContext.Provider>
      </PlatformContext.Provider>
    );
  }
}

// const createPageDesignerApp = () => PageDesignerApp

export default PageDesignerApp;
