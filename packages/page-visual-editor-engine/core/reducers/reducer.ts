import { combineReducers } from "redux";

// import {
//   // entitiesStateStoreReducer,
//   selectedInfoReducer,
//   // getEntityDefaultState,
// } from './canvas-state';
import { pageMetadataReducer, appContextReducer } from './page-state';
import {
  layoutInfoReducer,
  // flatLayoutItemsReducer
} from "./layout-info";
import { FlatLayoutItems } from "../../data-structure";

/**
 * 将 reducer 合成
 */
const VisualEditorStateReducer = combineReducers({
  // entitiesStateStore: entitiesStateStoreReducer,
  // selectedInfo: selectedInfoReducer,
  layoutInfo: layoutInfoReducer,
  // flatLayoutItems: flatLayoutItemsReducer,
  pageMetadata: pageMetadataReducer,
  appContext: appContextReducer,
});

export default VisualEditorStateReducer;

interface StateByMerge {
  flatLayoutItems: FlatLayoutItems
}

export type VisualEditorState = ReturnType<typeof VisualEditorStateReducer> & StateByMerge
