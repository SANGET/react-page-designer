import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CaretRightOutlined,
  DeleteOutlined,
  PlusSquareOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import {
  ChangeEntityState,
  metaIDSeperator,
  PlatformCtx,
} from "@provider-app/platform-access-spec";
import { Collapse, Form, Input, Radio, Select } from "antd";
import { nanoid } from "nanoid";
import React, { useState } from "react";
import { EventConfig, EventsRef, InterAction } from "./spec";

const { Panel } = Collapse;

export enum StopByError {
  no,
  yes,
}
export type ParamOnCreate = {
  type: "create/changePlace";
  eventsRef: EventsRef;
};
export type ParamOnUpdate = {
  type: "update";
  eventConfig: EventConfig;
  eventID: string;
};
export type ParamOnDelete = {
  type: "remove";
  eventsRef: EventsRef;
  eventID: string;
};
export type InterEvent = {
  actList: string[];
  condition?: any;
  stopByError: StopByError;
};
export type InterEvents = { [key: string]: InterEvent };
export interface PEventGroupPanel {
  widgetId: string;
  supportEvents: { alias: string; type: string }[];
  interActions: InterAction[];
  interEvents: InterEvents;
  defaultConfig: { [key: string]: string[] };
  onSubmit: (param1: ParamOnCreate | ParamOnUpdate | ParamOnDelete) => void;
  platformCtx: PlatformCtx;
  changeEntityState: ChangeEntityState;
  editingWidgetState: any;
}
export type HandleCreateEvent = (eventType: string) => void;

export type OpenLowCode = (eventType: string) => void;
export type HandleDeleteEvent = (eventType: string, eventID: string) => void;
export type HandleUpdateEvent = (
  eventType: string,
  eventID: string,
  updateArea: EventConfig
) => void;
export type HandleChangeEventPlace = (
  eventType: string,
  eventID1: string,
  eventID2: string
) => void;

const layout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

export interface PEventConfigItem {
  eventConfig: InterEvent;
  interActions: InterAction[];
  onUpdate: (param: { actList: string[] }) => void;
}

/**
 * 单一事件项
 */
const EventConfigItem: React.FC<PEventConfigItem> = ({
  eventConfig,
  interActions,
  onUpdate,
}) => {
  return (
    <div className="action-config-item">
      <Select
        mode="multiple"
        dropdownMatchSelectWidth={100}
        allowClear
        options={interActions}
        value={eventConfig.actList || []}
        onChange={(value) => {
          onUpdate({
            actList: value,
          });
        }}
      />
    </div>
  );
  // return (
  //   <Form {...layout} className="card-item">
  //     <Form.Item label="执行动作">
  //       <Select
  //         mode="multiple"
  //         allowClear
  //         options={interActions}
  //         value={eventConfig.actList || []}
  //         onChange={(value) => {
  //           onUpdate({
  //             actList: value,
  //           });
  //         }}
  //       />
  //     </Form.Item>
  //     {/* <Form.Item label="执行条件">
  //       <Input placeholder="暂不支持" />
  //     </Form.Item> */}
  //     {/* <Form.Item label="异常则中断执行">
  //       <Radio.Group>
  //         <Radio value={StopByError.yes}>是</Radio>
  //         <Radio value={StopByError.no}>否</Radio>
  //       </Radio.Group>
  //     </Form.Item> */}
  //   </Form>
  // );
};
export interface PEventPanelHeader {
  title: string;
  iconRenderer: () => React.ReactNode;
  onHeaderClick?: (e) => void;
}
/**
 * 事件列表
 */
export const EventPanelHeader: React.FC<PEventPanelHeader> = ({
  title,
  iconRenderer,
  onHeaderClick,
}) => {
  return (
    <div className="flex items-center" onClick={(e) => onHeaderClick?.(e)}>
      <span>{title}</span>
      <span className="flex"></span>
      {iconRenderer?.()}
    </div>
  );
};
export interface PEventRefRenderer {
  refList: string[];
  onDeleteEvent: (param: string) => void;
  interActions: InterAction[];
  interEvents: InterEvents;
  onUpdateEvent: (eventID: string, updateArea: EventConfig) => void;
  onChangeEventPlace: (eventID1: string, eventID2: string) => void;
  activeKeys: string[];
  onSetActiveKeys: (param: string[]) => void;
}
/**
 * 列表标题
 */
export const EventRefRenderer: React.FC<PEventRefRenderer> = ({
  refList,
  onDeleteEvent,
  interActions,
  interEvents,
  onUpdateEvent,
  onChangeEventPlace,
  activeKeys,
  onSetActiveKeys,
}) => {
  return (
    <div className="action-trigger-item px-2 py-1">
      {(refList || []).map((event, order) => (
        <div
          key={event}
          className="flex items-center my-2 pb-2"
          style={{ borderBottom: "1px solid #EEE" }}
        >
          <span className="mr-2">动作 {order + 1}</span>
          <EventConfigItem
            eventConfig={interEvents[event] || {}}
            interActions={interActions}
            onUpdate={(updateArea) => {
              onUpdateEvent(event, updateArea);
            }}
          />
          <span className="flex"></span>
          <DeleteOutlined
            className="p-1"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteEvent(event);
            }}
          />
        </div>
      ))}
    </div>
  );
};
/**
 * 事件编辑面板
 */
export const EventGroupPanel: React.FC<PEventGroupPanel> = ({
  widgetId,
  supportEvents,
  interActions,
  interEvents,
  defaultConfig,
  changeEntityState,
  editingWidgetState,
  onSubmit,
  platformCtx,
}) => {
  const [eventsRef, setEventsRef] = useState(defaultConfig);
  const [eventsConfig, setEventsConfig] = useState(interEvents);
  /** 控制事件组的展开（回填时默认展开第一项，新增事件时需要展开当前事件组） */
  const [activeGroup, setActiveGroup] = useState<string[]>([]);
  /** 控制组内事件的展开（新增时，需要展开该事件） */
  const [activekeys, setActiveKeys] = useState({});
  /** 新增事件，一般都是新增组件上的事件引用 */
  const handleCreateEvent: HandleCreateEvent = (eventType) => {
    /** 创建事件唯一标识 */
    const getNewEventId = () => {
      return ["event", widgetId, eventType, nanoid(8)].join(metaIDSeperator);
    };
    const newEventId = getNewEventId();
    const eventsRefInCreate = {
      ...eventsRef,
      [eventType]: [newEventId, ...(eventsRef[eventType] || [])],
    };
    /** 当前面板的数据更新 */
    setEventsRef(eventsRefInCreate);
    /** 通知页面进行事件数据更新 */
    onSubmit({
      type: "create/changePlace",
      eventsRef: eventsRefInCreate,
    });
    /** 展开当前事件组 */
    // setActiveGroup(eventType);
    /** 展开当前事件 */
    setActiveKeys({
      ...activekeys,
      [eventType]: [newEventId, ...(activekeys[eventType] || [])],
    });
  };

  /** 删除，需要删除 pageMetadata.events 的对应数据，以及组件实例上的事件引用 */
  const handleDeleteEvent: HandleDeleteEvent = (eventType, eventID) => {
    /** 1.删除组件实例上的事件引用 */
    const eventRefInDelete = {
      ...eventsRef,
      [eventType]: eventsRef[eventType].filter((item) => item !== eventID),
    };
    setEventsRef(eventRefInDelete);
    /** 2.删除 pageMetadata.events 的对应数据 */
    const {
      [eventID]: eventConfigInDelete,
      ...eventsConfigRest
    } = eventsConfig;
    setEventsConfig(eventsConfigRest);
    onSubmit({
      type: "remove",
      eventsRef: eventRefInDelete,
      eventID,
    });
  };

  /** 修改，需要修改 pageMetadata.events 的对应数据 */
  const handleUpdateEvent: HandleUpdateEvent = (
    eventType,
    eventID,
    updateArea
  ) => {
    const eventConfigInUpdate = {
      ...(eventsConfig[eventID] || {}),
      ...updateArea,
    };
    const eventsConfigInUpdate = {
      ...eventsConfig,
      [eventID]: eventConfigInUpdate,
    };
    setEventsConfig(eventsConfigInUpdate);
    onSubmit({
      type: "update",
      eventID,
      eventConfig: eventConfigInUpdate,
    });
  };
  /** 更改事件位置 */
  const handleChangeEventPlace: HandleChangeEventPlace = (
    eventType,
    eventID1,
    eventID2
  ) => {
    const eventsRefTmpl = eventsRef[eventType].slice();
    const index1 = eventsRefTmpl.findIndex((item) => item === eventID1);
    const index2 = eventsRefTmpl.findIndex((item) => item === eventID2);
    eventsRefTmpl.splice(index1, 1, eventID2);
    eventsRefTmpl.splice(index2, 1, eventID1);
    const eventsRefInChangePlace = {
      ...eventsRef,
      [eventType]: eventsRefTmpl,
    };
    setEventsRef(eventsRefInChangePlace);
    onSubmit({
      type: "create/changePlace",
      eventsRef: eventsRefInChangePlace,
    });
  };
  return (
    <div className="event-setting-panel">
      {supportEvents.length > 0 ? (
        <Collapse
          // activeKey={activeGroup}
          // accordion
          onChange={(activeGroups) => {
            // console.log(activeGroups);
            setActiveGroup(activeGroups as string[]);
          }}
          className="support-events-panel"
        >
          {supportEvents.map((supportEvent) => {
            const addedEvent = eventsRef[supportEvent.type]?.length || 0;
            return (
              <Panel
                header={
                  <EventPanelHeader
                    // onHeaderClick={() => {
                    //   setActiveGroup(
                    //     supportEvent.type === activeGroup
                    //       ? ""
                    //       : supportEvent.type
                    //   );
                    // }}
                    iconRenderer={() => {
                      return (
                        <>
                          <span className="mr-2">{addedEvent}</span>
                          <PlusSquareOutlined
                            onClick={(e) => {
                              if (
                                activeGroup.indexOf(supportEvent.type) !== -1
                              ) {
                                e.stopPropagation();
                              }
                              handleCreateEvent(supportEvent.type);
                            }}
                          />
                        </>
                      );
                    }}
                    title={supportEvent.alias}
                  />
                }
                key={supportEvent.type}
              >
                <EventRefRenderer
                  activeKeys={activekeys[supportEvent.type] || []}
                  onSetActiveKeys={(activekeysTmpl) => {
                    setActiveKeys({
                      ...activekeys,
                      [supportEvent.type]: activekeysTmpl,
                    });
                  }}
                  refList={eventsRef[supportEvent.type]}
                  onDeleteEvent={(event) =>
                    handleDeleteEvent(supportEvent.type, event)
                  }
                  interActions={interActions}
                  interEvents={eventsConfig}
                  onUpdateEvent={(eventID, updateArea) => {
                    handleUpdateEvent(supportEvent.type, eventID, updateArea);
                  }}
                  onChangeEventPlace={(eventID1, eventID2) => {
                    handleChangeEventPlace(
                      supportEvent.type,
                      eventID1,
                      eventID2
                    );
                  }}
                />
              </Panel>
            );
          })}
        </Collapse>
      ) : null}
    </div>
  );
};
