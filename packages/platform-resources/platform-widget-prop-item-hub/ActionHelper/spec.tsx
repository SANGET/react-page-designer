import { ShowModal } from "@provider-app/shared-ui";
import {
  ActionsMeta,
  PropItem,
  PropItemRenderContext,
} from "@provider-app/platform-access-spec";
import React from "react";
import { ThunderboltOutlined, SmallDashOutlined } from "@ant-design/icons";
import { EventGroupPanel, StopByError, OpenLowCode } from "./EventSettingPanel";

import "./style.scss";

const whichAttr = "eventRef";
export type EventsRef = { [key: string]: string[] };
export type InterAction = { label: string; value: string; key: string };
export type HandleCreate = (param1: { eventsRef: EventsRef }) => void;
export type EventConfig = {
  actList?: string[];
  condition?: any;
  stopByError?: StopByError;
};

export type HandleUpdate = (param1: {
  eventID: string;
  eventConfig: EventConfig;
}) => void;

export type HandleRemove = (param1: {
  eventID: string;
  eventsRef: EventsRef;
}) => void;

@PropItem({
  id: "prop_action_config",
  label: "动作设置",
  whichAttr: ["eventRef", "lowCode", "codeConf"],
  useMeta: ["events"],
})
export default class ActionHelperSpec {
  render(ctx: PropItemRenderContext) {
    const {
      editingWidgetState,
      changeEntityState,
      platformCtx: {
        meta: { takeMeta, changePageMeta },
      },
      widgetEntity,
    } = ctx;

    /** 获取页面全部的动作列表 */
    const getInterActions = () => {
      const actions: { [key: string]: ActionsMeta } =
        takeMeta({
          metaAttr: "actions",
        }) || {};
      if (!actions) return [];
      const actionList: InterAction[] = [];
      Object.keys(actions).forEach((key) => {
        const {
          [key]: { actionName: label },
        } = actions;
        actionList.push({
          label,
          value: key,
          key,
        });
      });
      return actionList;
    };
    /** 获取页面全部的事件列表 */
    const interEvents =
      takeMeta({
        metaAttr: "events",
      }) || {};
    /** 组件所支持的事件列表 */
    const { eventAttr: supportEvents = [], id: widgetId } = widgetEntity;
    /**
     * 新增事件，补充组件实例的事件映射列表
     */
    const handleCreate: HandleCreate = (param) => {
      const { eventsRef } = param || {};
      changeEntityState({
        attr: whichAttr,
        value: eventsRef,
      });
    };
    /**
     * 修改事件，更改 pageMetadata.events 中的事件配置数据
     */
    const handleUpdate: HandleUpdate = (param) => {
      const { eventID, eventConfig } = param || {};
      changePageMeta({
        metaAttr: "events",
        type: "update",
        data: eventConfig,
        metaID: eventID,
      });
    };
    const handleRemove: HandleRemove = (param) => {
      const { eventsRef, eventID } = param || {};
      changePageMeta({
        metaAttr: "events",
        type: "rm",
        rmMetaID: eventID,
      });
      changeEntityState({
        attr: whichAttr,
        value: eventsRef,
      });
    };
    const handleSubmit = {
      "create/changePlace": handleCreate,
      update: handleUpdate,
      remove: handleRemove,
    };
    // const openLowCode: OpenLowCode = (eventType) => {
    //   const closeModal = ctx.platformCtx.selector.openLowCodeEditor({
    //     defaultValue: editingWidgetState.codeConf?.[eventType] || undefined,
    //     eventType,
    //     platformCtx: ctx.platformCtx,
    //     onSubmit: (editorSubmitCtx) => {
    //       const value = editingWidgetState.lowCode || {};
    //       changeEntityState({
    //         attr: "codeConf",
    //         value: {
    //           ...value,
    //           [eventType]: {
    //             code: editorSubmitCtx.code,
    //             // simpleCode: editorSubmitCtx.codeSimple?.code,
    //             // params: editorSubmitCtx.codeSimple?.params,
    //             // use: editorSubmitCtx.use,
    //           },
    //         },
    //       });
    //       closeModal();
    //     },
    //   });
    // };
    // const openLowCode: OpenLowCode = (eventType) => {
    //   const closeModal = ctx.platformCtx.selector.openLowCodeEditor({
    //     defaultValue: editingWidgetState.lowCode?.[eventType] || undefined,
    //     eventType,
    //     platformCtx: ctx.platformCtx,
    //     onSubmit: (lowCodeKey) => {
    //       const value = editingWidgetState.lowCode || {};
    //       changeEntityState({
    //         attr: "lowCode",
    //         value: {
    //           ...value,
    //           [eventType]: {
    //             code: lowCodeKey.code,
    //             // simpleCode: lowCodeKey.codeSimple?.code,
    //             // params: lowCodeKey.codeSimple?.params,
    //             // use: lowCodeKey.use,
    //           },
    //         },
    //       });
    //       closeModal();
    //     },
    //   });
    // };
    return (
      <EventGroupPanel
        widgetId={widgetId}
        supportEvents={supportEvents}
        changeEntityState={changeEntityState}
        editingWidgetState={editingWidgetState}
        interActions={getInterActions()}
        interEvents={interEvents}
        defaultConfig={editingWidgetState[whichAttr] || {}}
        onSubmit={(eventSetting) => {
          const { type, ...rest } = eventSetting;
          handleSubmit[type](rest);
        }}
        platformCtx={ctx.platformCtx}
      />
    );
    // return (
    //   <>
    //     {supportEvents.map((supportEvent) => {
    //       if (!supportEvent) return null;
    //       const { type, alias } = supportEvent;
    //       return (
    //         <div
    //           key={type}
    //           onClick={(e) => {
    //             e.stopPropagation();
    //             openLowCode(type);
    //           }}
    //           className="flex px-4 py-2 border cursor-pointer border-b-0"
    //         >
    //           <span>{alias}</span>
    //           <span className="flex"></span>
    //           <ThunderboltOutlined
    //             className={
    //               editingWidgetState.lowCode?.[type] ? "ant-btn-link" : ""
    //             }
    //           />
    //         </div>
    //       );
    //     })}
    //     {/* <div
    //       className="px-4 py-2 border cursor-pointer text-center"
    //       onClick={() => {
    //         ShowModal({
    //           title: "设置动作",
    //           width: 350,
    //           position: "right",
    //           type: "side",
    //           maxHeightable: false,
    //           style: { maxHeight: "100vh" },
    //           children: ({ close }) => {
    //             return (
    //               <EventGroupPanel
    //                 widgetId={widgetId}
    //                 supportEvents={supportEvents}
    //                 changeEntityState={changeEntityState}
    //                 editingWidgetState={editingWidgetState}
    //                 interActions={getInterActions()}
    //                 interEvents={interEvents}
    //                 defaultConfig={editingWidgetState[whichAttr] || {}}
    //                 onSubmit={(eventSetting) => {
    //                   const { type, ...rest } = eventSetting;
    //                   handleSubmit[type](rest);
    //                 }}
    //                 platformCtx={ctx.platformCtx}
    //               />
    //             );
    //           },
    //         });
    //       }}
    //     >
    //       更多
    //     </div> */}
    //   </>
    // );
  }
}
