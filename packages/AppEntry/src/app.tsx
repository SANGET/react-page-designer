/* eslint-disable no-param-reassign */
import { LoadingTip } from "@provider-app/shared-ui";
import {
  AppActionsContext,
  VEDispatcher,
  VisualEditorState,
} from "@provider-app/page-visual-editor-engine/core";
import {
  ChangeMetadataOptions,
  ProviderPageProps,
  WidgetEntity,
} from "@provider-app/platform-access-spec";
import { Modal } from "antd";
import classnames from "classnames";
import {
  getPageDetailService,
  updatePageService,
} from "@provider-app/provider-app-common/services";
import produce from "immer";
import pick from "lodash/pick";
import React from "react";
import { getAppConfig } from "@provider-app/provider-app-common/config";
import { loadExternalScriptsSync } from "@provider-app/provider-app-common/utils/loadExternalScripts";
import {
  treeNodeHelper,
  TreeNodePath,
} from "@provider-app/page-visual-editor-engine/utils";
import {
  defaultStageWidth,
  StageContext,
  StageContextRes,
} from "@provider-app/page-visual-editor-engine/utils/stage-context";
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

const StageStateManager = ({
  layoutNodeInfo,
  onUpdateApiConfig,
  stageWidth,
  onSubmitAPIMeta,
  onAddEntity,
  handleDeleteEntity,
  changeSelectedPath,
  selectedPath,
  pageMetadata,
  appContext,
  getPageContent,
  dispatcher,
}) => {
  const [hoveringPath, setHoveringPath] = React.useState<TreeNodePath>([]);
  const stageCtx: StageContextRes = {
    changeHoveringPath: (nextPath) => setHoveringPath(nextPath),
    changeSelectedPath,
    hoveringPath,
    selectedPath,
  };
  return (
    <>
      <div className="comp-panel">
        <WidgetPanel
          layoutNodeInfo={layoutNodeInfo}
          onUpdateApiConfig={onUpdateApiConfig}
          onSubmitAPIMeta={onSubmitAPIMeta}
          pageMetadata={pageMetadata}
          getPageContent={getPageContent}
          stageCtx={stageCtx}
        />
      </div>
      <div className="canvas-container" style={{ height: "100%" }}>
        {!appContext.ready ? (
          <LoadingTip />
        ) : (
          <CanvasStage
            // selectedInfo={selectedInfo}
            layoutNodeInfo={layoutNodeInfo}
            pageMetadata={pageMetadata}
            onAddEntity={onAddEntity}
            stageCtx={stageCtx}
            stageWidth={stageWidth}
            onEntityClick={(treePath) => {
              changeSelectedPath(treePath);
            }}
            onStageClick={() => {
              // SelectEntity(PageEntity);
              setHoveringPath([]);
              changeSelectedPath([]);
            }}
            onDeleteEntity={handleDeleteEntity}
            {...dispatcher}
          />
        )}
      </div>
    </>
  );
};

class PageDesignerApp extends React.Component<
  VisualEditorAppProps & ProviderPageProps
> {
  state = {
    selectedPath: [],
    stageWidth: defaultStageWidth,
  };

  selectedEntity!: WidgetEntity;

  componentDidCatch(error, errorInfo) {
    // ???????????????????????????
    console.log(error, errorInfo);

    Modal.error({
      title: `??????????????????????????????`,
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

  changeStageWidth = (nextVal) => {
    this.setState({
      stageWidth: nextVal,
    });
  };

  /**
   * ?????? page meta ?????????
   * 1. ?????????????????? metaID????????????????????????
   * 2. ??????????????? metaID???????????????????????????
   * 3. ?????? replace ??????????????????????????????
   * 4. ?????? relyID ????????? meta ???????????????
   */
  changePageMetaStradegy = (
    options: ChangeMetadataOptions
  ): string | string[] => {
    /** ??????????????? datasource ????????? */
    const hasChangeDatasource = (optionTmpl) => {
      return optionTmpl.some((item) => item.metaAttr === "dataSource");
    };

    const isArrayOptions = Array.isArray(options);
    const hasIChangeDatasource = hasChangeDatasource(
      (isArrayOptions && options) || [options]
    );
    if (hasIChangeDatasource) {
      console.error(
        "???????????? changePageMeta ??????????????????????????????????????? platformCtx.meta.changeDataSource"
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
   * ?????? meta
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
   * ??????????????????????????????????????????
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
  //   /** ?????????????????? */
  //   const nextCreateList = {};
  //   const returnOptions: string[] = [];
  //   createList.forEach((dsItem, idx) => {
  //     const dsRefID = genMetaRefID("dataSource", {
  //       idStrategy: dsItem.id,
  //     });
  //     returnOptions.push(dsRefID);
  //     nextCreateList[dsRefID] = { ...dsItem, createdBy: [prop] };
  //   });
  //   /** ?????? */
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
  //   /** ?????? */
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
   * ???????????????
   */
  getDatasources = () => {
    return this.props.appContext.payload?.interDatasources;
  };

  /**
   * ?????????????????????????????????
   */
  getCurrPageDataDetail = () => {
    const { appContext } = this.props;
    const { pageDataRes } = appContext?.payload as any;
    return pageDataRes;
  };

  /**
   * ??????????????????
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
   * ??????????????????
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
   * ??????????????????????????????????????????
   * 1. ?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
   * 2. ???????????????????????????????????? ????????????????????????
   * 3. ???????????????????????????????????????????????????
   * 4. ???????????????????????? InitApp ???????????????
   * 5. ??????????????????
   */
  perpareInitData = async () => {
    const { dispatcher, appLocation } = this.props;
    const {
      pageID,
      // ???????????????????????????????????????????????????????????????????????????
      tmpl,
    } = appLocation;
    const { InitApp } = dispatcher;

    const offlineMode = getAppConfig("_offline");
    const platformUIUrl = getAppConfig("platformUIUrl");

    /** ??????????????????????????? */
    const [pageDataRes] = await Promise.all([
      !offlineMode && getPageDetailService(pageID),
      loadExternalScriptsSync([platformUIUrl]),
    ]);

    /** ????????????????????? */
    const initData: AppActionsContext = {};
    if (offlineMode) {
      // ??????????????????
      Object.assign(initData, {
        pageContent: MockPageDSL,
      });
    } else {
      const { pageContent } = pageDataRes;
      let pageContentRes = pageContent;
      if (!pageContentRes) {
        // ???????????????????????????????????????????????????
        pageContentRes = await getDSLTemplate(tmpl);
      }
      // ????????????????????????????????????????????????????????????????????????
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
   * ??????????????????
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
   * ????????????
   */
  onReleasePage = () => {
    return this.updatePage();
  };

  // /**
  //  * ????????????????????????????????????
  //  */
  // onAddEntity = (entity) => {
  //   if (Array.isArray(entity.varAttr)) {
  //     /**
  //      * ???????????????????????????
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
   * ??????????????????????????????????????????
   */
  onAddEntity = (entity, treeNodePath) => {
    this.changeSelectedPath(treeNodePath);

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
   * ????????????????????????????????????????????????????????????
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

  changeSelectedPath = (nextPath) => {
    // ??????????????????
    this.selectedEntity = this.getSelectedEntity(nextPath);
    this.setState({
      selectedPath: nextPath,
    });
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

  onSubmitAPIMeta = (apiConfigMeta, type = "create") => {
    const { id } = apiConfigMeta;
    const metaIDInfo = {
      [type === "rm" ? "rmMetaID" : "metaID"]: id,
    };
    this.changePageMetaStradegy({
      type,
      metaAttr: "apiMeta",
      data: apiConfigMeta,
      ...metaIDInfo,
    });
  };

  /**
   * ????????????
   * @param treeNodePath
   * @param entity
   */
  handleDeleteEntity = (treeNodePath, entity) => {
    this.props.dispatcher.DelEntity(treeNodePath, entity);
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
    const { stageWidth } = this.state;
    // const { selectedPath } = this.state;
    const { selectedEntity } = this;

    const activeEntityID = selectedEntity?.id;

    const selectedItem = !!selectedEntity;

    const appClasses = classnames([
      "app-content",
      selectedItem && "has-selected-item",
    ]);

    // const { id: activeEntityID, entity: activeEntity } = selectedInfo;

    // if (!appContext.ready) {
    //   return <LoadingTip />;
    // }
    return (
      <PlatformContext.Provider value={this.platformCtx}>
        <div className="visual-app bg-white">
          <header className="app-header">
            <ToolBar
              getAppDescData={this.getAppDescData}
              getPageContent={this.getPageContent}
              changeStageWidth={this.changeStageWidth}
              pageMetadata={pageMetadata}
              stageWidth={stageWidth}
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
            className={appClasses}
            // style={{ top: 0 }}
          >
            <StageStateManager
              selectedPath={this.state.selectedPath}
              changeSelectedPath={this.changeSelectedPath}
              getPageContent={this.getPageContent}
              layoutNodeInfo={layoutInfo}
              stageWidth={stageWidth}
              onUpdateApiConfig={this.onUpdateApiConfig}
              onSubmitAPIMeta={this.onSubmitAPIMeta}
              onAddEntity={this.onAddEntity}
              handleDeleteEntity={this.handleDeleteEntity}
              pageMetadata={pageMetadata}
              appContext={appContext}
              dispatcher={dispatcher}
            />
            {selectedItem && (
              <div className="prop-panel">
                <PDPropertiesEditor
                  key={activeEntityID}
                  platformCtx={this.platformCtx}
                  pageMetadata={pageMetadata}
                  selectedEntity={selectedEntity}
                  entityState={selectedEntity?.propState}
                  updateEntityState={this.updateEntityStateForSelected}
                />
              </div>
            )}
          </div>
        </div>
      </PlatformContext.Provider>
    );
  }
}

// const createPageDesignerApp = () => PageDesignerApp

export default PageDesignerApp;
