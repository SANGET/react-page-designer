import React from "react";
import produce, { setAutoFreeze } from "immer";
import {
  Provider as ReduxProvider,
  connect,
  ConnectedProps,
} from "react-redux";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import createStore from "./store";
import { AllDispatcherActions } from "./actions";
import { VisualEditorState } from "./reducers/reducer";
import { flatArrayToNode } from "../utils";

/**
 * 合并页面设计器引擎的状态
 * 1. 根据选中的组件的 id，动态挂载 widget entity
 */
const mapVisualStateToProps = (state: VisualEditorState) => {
  const { layoutInfo } = state;
  const flatLayoutItems = flatArrayToNode(layoutInfo);
  // const { id } = selectedInfo;
  // const nextSelectedInfo = Object.assign({}, selectedInfo, {
  //   entity: flatLayoutItems[id],
  // });
  return {
    ...state,
    // selectedInfo: nextSelectedInfo,
    flatLayoutItems,
  };
};

/**
 * 过滤所有 string 类型的 action，并且做 memoried
 */
const dispatcherCache = {};
export const mapVisualDispatchToProps = (appKey) => (dispatch) => {
  const AllDispatcherActionsCopy = { ...AllDispatcherActions };
  if (!dispatcherCache[appKey]) {
    const tempActions = (function () {
      const obj = {};
      Object.keys(AllDispatcherActionsCopy).forEach((item) => {
        const _dispatch = AllDispatcherActionsCopy[item];
        if (typeof _dispatch === "function") {
          obj[item] = (...args) => {
            dispatch(_dispatch(...args));
          };
        }
      });
      return obj;
    })();

    dispatcherCache[appKey] = {
      dispatcher: tempActions,
    };
  }
  return dispatcherCache[appKey];
};

// type PropsFromRedux = ConnectedProps<typeof connector>

/**
 * @important
 * @author zxj
 * @description 重要的连接器，通过 HOC 的方式支持返回多个 redux connector 实例
 */
const ConnectedAppStore: {
  [key: string]: React.ElementType;
} = {};

const Connector = (ConnectApp, appKey = "123") => {
  if (!appKey) {
    throw Error("appKey 是必须且唯一的，请检查调用");
  }
  let ConnectorChild = ConnectedAppStore[appKey];
  if (!ConnectorChild) {
    const appStore = createStore(appKey);
    // console.log(object);
    const connector = connect(
      mapVisualStateToProps,
      mapVisualDispatchToProps(appKey)
    );
    const Comp = connector(ConnectApp);
    ConnectorChild = (props) => {
      return (
        <DndProvider backend={HTML5Backend}>
          <ReduxProvider store={appStore}>
            <Comp {...props} appKey={appKey} />
          </ReduxProvider>
        </DndProvider>
      );
    };
    ConnectedAppStore[appKey] = ConnectorChild;
  }
  return ConnectorChild;
};

export default Connector;
