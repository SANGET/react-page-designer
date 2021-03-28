import produce from 'immer';
import deepmerge from 'deepmerge';
import { PageMetadata } from '@provider-app/platform-access-spec';
import {
  INIT_APP, InitAppAction, DEL_ENTITY, DelEntityAction,
  ADD_ENTITY, AddEntityAction, UPDATE_APP, UpdateAppAction, ChangeMetadataAction, CHANGE_METADATA
} from "../actions";
import { PageState } from "../../data-structure";
import { mergeDeep } from './deepmerge';

const DefaultPageMeta: PageMetadata = {
  apisConfig: {},
  events: {},
  widgetCounter: 0,
  dataSource: {},
  pageInterface: {},
  linkage: {},
  schema: {},
  actions: {},
  varRely: {},
  _rely: {}
};

/**
 * 删除 pageMetadata 的某项数据
 * @param pageMetadata
 * @param delID
 * 
 * TODO: 根据 _rely 依赖关系删除
 */
const delMetaData = (pageMetadata, delID) => {
  if (!pageMetadata) return;
  Object.keys(pageMetadata).forEach((metaID) => {
    if (metaID.indexOf(delID) !== -1) {
      Reflect.deleteProperty(pageMetadata, metaID);
    }
  });
};

// export function pageStateReducer(
//   state: {},
//   action: InitAppAction | AddEntityAction | ChangeMetadataAction | DelEntityAction
// ) {
//   switch (action.type) {
//     case INIT_APP:
      
//       break;
  
//     default:
//       break;
//   }
// }

/**
 * 组件选择状态管理。如果组件未被实例化，则实例化后被选择
 */
export function pageMetadataReducer(
  state: PageMetadata = DefaultPageMeta,
  action: InitAppAction | AddEntityAction | ChangeMetadataAction | DelEntityAction
): PageMetadata {
  switch (action.type) {
    case INIT_APP:
      const {
        pageContent, initMeta
      } = action;
      // return produce(pageContent, (draft) => {
      //   /**
      //    * 合并默认 meta 和由外部传入的 meta
      //    */
      //   const metaFormInit = draft?.meta;
      // });
      return deepmerge.all([DefaultPageMeta, initMeta || {}, pageContent?.meta || {}]);
    case ADD_ENTITY:
      return produce(state, (draft) => {
        draft.widgetCounter += 1;
        return draft;
      });
    case DEL_ENTITY:
      return produce(state, (draft) => {
        const { entity: delE } = action;
        const { id: delEntityID } = delE;

        // 删除变量
        delMetaData(draft.varRely, delEntityID);

        // 删除动作
        delMetaData(draft.actions, delEntityID);

        // 删除数据源
        delMetaData(draft.dataSource, delEntityID);

        // 删除 schema
        delMetaData(draft.schema, delEntityID);
        return draft;
      });
    case CHANGE_METADATA:
      return produce(state, (draft) => {
        const relyAnalysis = (metaID, relyID) => {
          /** 将依赖关系记录在 _rely 中 */
          if(!draft._rely) draft._rely = {};
          if(!draft._rely[metaID]) draft._rely[metaID] = [];
          if(relyID) draft._rely[metaID].push(relyID);
        };
        const { changeDatas } = action;
        for (let i = 0; i < changeDatas.length; i++) {
          const changeData = changeDatas[i];
          // .forEach((changeData) => {

          /**
           * 为什么那么多 if/else？
           * 由于 ts 对 switch case 的检查的问题，需要通过 if/else 的方式来做类型检查
           * 网上的解决方案也是采用 if/else 的方式来处理，参考：https://javascript.info/switch
           * 
           * TODO: 后续优化此实现
           */
          const { metaAttr } = changeData;
          if (!draft[metaAttr]) {
            console.error('尝试修改了不存在的 meta，请检查代码');
            draft[metaAttr] = {};
          }

          if(changeData.type === 'create' || changeData.type === 'create&rm') {
            /** 创建新 meta 或删除旧 meta */
            const {
              data, metaID, relyID
              // data, datas, metaAttr, metaID, rmMetaID, replace, relyID
            } = changeData;

            if(changeData.type === 'create&rm') {
              /** 创建新 meta 并删除旧 meta */
              const { rmMetaID } = changeData;
              Reflect.deleteProperty(draft[metaAttr], rmMetaID);
            }

            let _metaID;
            if (metaID) {
              _metaID = metaID;
            } else {
              console.error(`并未传入 metaID，系统默认将 ${metaAttr} 的属性的数量 + 1 作为 metaID`);
              const newDataRefID = Object.keys(draft[metaAttr]).length + 1;
              _metaID = newDataRefID;
            }

            /** 依赖分析 */
            relyAnalysis(_metaID, relyID);
            
            draft[metaAttr][_metaID] = data;
          }

          if(changeData.type === 'replace') {
            /** 替换旧 meta */
            const { datas } = changeData;
            if(!datas) {
              console.error(`在 replace 模式下需要指定 datas`);
            }
            draft[metaAttr] = datas;
          }

          if(changeData.type === 'update') {
            /** 更新 meta item */
            const { metaID, data } = changeData;
            if(!metaID) {
              console.error(`在更新时没有传入对应的 metaID，请检查调用链路`);
            } else {
              draft[metaAttr][metaID] = data;
            }
          }

          if(changeData.type === 'update/batch') {
            /** 批量更新 meta items */
            const { datas } = changeData;
            Object.assign(draft[metaAttr], datas);
          }

          if(changeData.type === 'rm') {
            const { rmMetaID } = changeData;
            Reflect.deleteProperty(draft[metaAttr], rmMetaID);
          }

          if(changeData.type === 'create/batch&rm/batch') {
            const { rmMetaIDList, datas } = changeData;
            draft[metaAttr] = datas;
            if(Array.isArray(rmMetaIDList)) rmMetaIDList.forEach(rmMetaID => {
              Reflect.deleteProperty(draft[metaAttr], rmMetaID);
            });
          }

          // switch (type) {
          //   case 'create':
          //     const {
          //       metaAttr, data
          //       // data, datas, metaAttr, metaID, rmMetaID, replace, relyID
          //     } = changeData;
          //     if (!draft[metaAttr]) {
          //       console.error('尝试修改了不存在的 meta，请检查代码');
          //       draft[metaAttr] = {};
          //     }
          //     break;
          //   case 'replace':
          //     const {
          //       datas
          //     } = changeData;
          //     if(!datas) {
          //       console.error(`在 replace 模式下需要指定 datas`);
          //     }
          //     draft[metaAttr] = datas;
          //     return draft;
          //     // break;
          //   case 'rm':
          //     Reflect.deleteProperty(draft[metaAttr], rmMetaID);
          //     break;
          //   case 'create&rm':
              
          //     break;
          //   case 'update':
              
          //     break;
          //   case 'update/batch':
          //     Object.assign(draft[metaAttr], datas);
          //     break;
          // }
          /** 如果是 replace 模式，则直接替换整个 meta */
          // if(replace) {
          //   if(!datas) {
          //     console.error(`在 replace 模式下需要指定 datas`);
          //   }
          //   draft[metaAttr] = datas;
          //   return draft;
          // }
          // if(datas) {
          //   Object.assign(draft[metaAttr], datas);
          // }
          // if (!draft[metaAttr]) {
          //   console.error('尝试修改了不存在的 meta，请检查代码');
          //   draft[metaAttr] = {};
          // }
          // if (metaID) {
          //   draft[metaAttr][metaID] = data;
  
          //   /** 将依赖关系记录在 _rely 中 */
          //   if(!draft._rely) draft._rely = {};
          //   if(!draft._rely[metaID]) draft._rely[metaID] = [];
          //   if(relyID) draft._rely[metaID].push(relyID);
          // } else {
          //   console.error(`并未传入 metaID，系统默认将 ${metaAttr} 的属性的数量 + 1 作为 metaID`);
          //   const newDataRefID = Object.keys(draft[metaAttr]).length + 1;
          //   Object.assign(draft[metaAttr], {
          //     [`${metaAttr}.${newDataRefID}`]: data
          //   });
          // }
          // if (rmMetaID && draft[metaAttr]) {
          //   Reflect.deleteProperty(draft[metaAttr], rmMetaID);
          // }
        }
        return draft;
      });
    default:
      return state;
  }
}

export interface AppContext {
  /** App 是否做好准备 */
  ready: boolean
  pageState: PageState
  /** 页面元数据 */
  payload?: {
    [payloadKey: string]: any
    /** 默认的 meta */
    defaultMeta?: any
  }
}

const defaultPageState: PageState = {
  eventRef: {}
};

/**
 * 整个应用的上下文数据
 */
export function appContextReducer(
  state: AppContext = {
    ready: false,
    pageState: defaultPageState
  },
  action: InitAppAction | UpdateAppAction
): AppContext {
  switch (action.type) {
    case INIT_APP:
      const {
        payload, pageContent,
        name, id
      } = action;
      return {
        ready: true,
        pageState: pageContent?.pageState || defaultPageState,
        payload,
      };
    case UPDATE_APP:
      const { type, ...otherState } = action;
      return produce(state, (draftState) => {
        mergeDeep(draftState, otherState);
        // Object.assign(draftState, otherState);
        // const nextStateVal = deepmerge(draftState, otherState);
        return draftState;
      });
    default:
      return state;
  }
}
