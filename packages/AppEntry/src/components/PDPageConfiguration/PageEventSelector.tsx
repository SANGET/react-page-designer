import React, { useState } from "react";
import { Table, Select, Input, Radio } from "antd";
import { nanoid } from "nanoid";
import {
  PlusSquareOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";

export enum StopByError {
  no,
  yes,
}
export type EventConfig = {
  actList?: string[];
  condition?: any;
  stopByError?: StopByError;
};
export type InterAction = { label: string; value: string; key: string };
type Action = { type: "action"; id: string; eventType: string };
type Event = {
  type: "event";
  children: Action[];
  id: string;
  eventType: string;
};
export type HandleCreateEvent = (eventType: string) => void;
export type HandleUpdateEvent = (
  eventID: string,
  updateArea: EventConfig
) => void;
export type HandleDeleteEvent = (eventType: string, eventID: string) => void;
export type HandleChangeEventPlace = (
  eventType: string,
  eventID1: string,
  eventID2: string
) => void;
export type EventRef = { [key: string]: string[] };

export const PageEventSelector = ({
  pageState,
  pageMetadata,
  changePageState,
  platformCtx: {
    meta: { changePageMeta, getPageMeta },
  },
}) => {
  const [eventRef, setEventRef] = useState<EventRef>(pageState.eventRef);
  const [events, setEvents] = useState(pageMetadata.events);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const { actions } = pageMetadata;

  // useEffect(() => {
  //   initList();
  // }, []);
  const getList = (eventsRef: EventRef): Event[] => {
    const eventList = [
      { alias: "加载事件", type: "onPageLoad" },
      { alias: "销毁事件", type: "onPageDestroy" },
      { alias: "窗口大小调整事件", type: "onPageResize" },
    ];
    return eventList.map((item) => {
      const { alias, type } = item;
      return {
        type: "event",
        id: type,
        eventType: type,
        alias,
        children: (eventsRef[type] || []).map((child: string) => ({
          type: "action",
          id: child,
          eventType: type,
        })),
      };
    });
  };
  const initActions = () => {
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
  /** 新增事件，一般都是新增组件上的事件引用 */
  const handleCreateEvent: HandleCreateEvent = (eventType) => {
    /** 创建事件唯一标识 */
    const getNewEventId = () => {
      return `event.page.${eventType}.${nanoid(8)}`;
    };
    const newEventId = getNewEventId();
    const eventsRefInCreate = {
      ...eventRef,
      [eventType]: [newEventId, ...(eventRef[eventType] || [])],
    };
    changePageState({
      ...pageState,
      eventRef: eventsRefInCreate,
    });
    setEventRef(eventsRefInCreate);
    setExpandedKeys(
      expandedKeys.includes(eventType)
        ? expandedKeys
        : [eventType, ...expandedKeys]
    );
  };
  /** 修改，需要修改 pageMetadata.events 的对应数据 */
  const handleUpdateEvent: HandleUpdateEvent = (eventID, updateArea) => {
    const eventInUpdate = {
      ...(events[eventID] || {}),
      ...updateArea,
    };
    const eventsInUpdate = {
      ...events,
      [eventID]: eventInUpdate,
    };
    setEvents(eventsInUpdate);
    changePageMeta({
      metaAttr: "events",
      type: "update",
      data: eventInUpdate,
      metaID: eventID,
    });
    getPageMeta("events");
  };
  /** 更改事件位置 */
  const handleChangeEventPlace: HandleChangeEventPlace = (
    eventType,
    eventID1,
    eventID2
  ) => {
    /** 互换位置 */
    const eventsRefTmpl = eventRef[eventType].slice();
    const index1 = eventsRefTmpl.findIndex((item) => item === eventID1);
    const index2 = eventsRefTmpl.findIndex((item) => item === eventID2);
    eventsRefTmpl.splice(index1, 1, eventID2);
    eventsRefTmpl.splice(index2, 1, eventID1);
    const eventsRefInChangePlace = {
      ...eventRef,
      [eventType]: eventsRefTmpl,
    };
    setEventRef(eventsRefInChangePlace);
    changePageState({
      ...pageState,
      eventRef: eventsRefInChangePlace,
    });
  };

  /** 删除，需要删除 pageMetadata.events 的对应数据，以及组件实例上的事件引用 */
  const handleDeleteEvent: HandleDeleteEvent = (eventType, eventID) => {
    /** 1.删除组件实例上的事件引用 */
    const eventRefInDelete = {
      ...eventRef,
      [eventType]: eventRef[eventType].filter((item) => item !== eventID),
    };
    changePageState({
      ...pageState,
      eventRef: eventRefInDelete,
    });
    setEventRef(eventRefInDelete);
    if (eventRefInDelete[eventType].length === 0) {
      setExpandedKeys(expandedKeys.filter((item) => item !== eventType));
    }
    /** 2.删除 pageMetadata.events 的对应数据 */
    const { [eventID]: eventInDelete, ...eventsRest } = events;
    changePageMeta({
      metaAttr: "events",
      type: "rm",
      rmMetaID: eventID,
    });
    setEvents(eventsRest);
  };

  const interActions = initActions();
  const columns = [
    {
      title: "动作",
      dataIndex: "alias",
      key: "actList",
      width: 300,
      render: (_t, _r) => {
        const { id } = _r;
        return _r.type === "event" ? (
          _t
        ) : (
          <Select
            style={{ width: "calc( 100% - 40px )" }}
            mode="multiple"
            allowClear
            options={interActions}
            value={events[id]?.actList || []}
            onChange={(value) => {
              handleUpdateEvent(id, {
                actList: value,
              });
            }}
          />
        );
      },
    },
    {
      title: "条件",
      dataIndex: "id",
      key: "condition",
      width: 200,
      render: (_t, _r) => {
        return _r.type === "event" ? null : <Input placeholder="暂不支持" />;
      },
    },
    {
      title: "异常则中断执行",
      dataIndex: "id",
      key: "stopByError",
      width: 200,
      render: (_t, _r) => {
        return _r.type === "event" ? null : (
          <Radio.Group
            value={events[_t]?.stopByError || StopByError.no}
            onChange={(e) => {
              handleUpdateEvent(_t, {
                stopByError: e.target.value,
              });
            }}
          >
            <Radio value={StopByError.yes}>是</Radio>
            <Radio value={StopByError.no}>否</Radio>
          </Radio.Group>
        );
      },
    },
    {
      title: "操作",
      dataIndex: "id",
      key: "action",
      width: 120,
      render: (_t, _r, order) => {
        const { id, eventType, type } = _r;
        const list = eventRef[eventType] || [];
        return type === "event" ? (
          <PlusSquareOutlined
            onClick={(e) => {
              handleCreateEvent(eventType);
            }}
          />
        ) : (
          <>
            <DeleteOutlined
              className="p-1"
              onClick={(e) => {
                handleDeleteEvent(eventType, id);
              }}
            />
            {order > 0 ? (
              <ArrowUpOutlined
                className="p-1"
                onClick={(e) => {
                  e.stopPropagation();
                  handleChangeEventPlace(eventType, id, list[order - 1]);
                }}
              />
            ) : null}
            {list.length > 0 && order < list.length - 1 ? (
              <ArrowDownOutlined
                className="p-1"
                onClick={(e) => {
                  e.stopPropagation();
                  handleChangeEventPlace(eventType, id, list[order + 1]);
                }}
              />
            ) : null}
          </>
        );
      },
    },
  ];
  return (
    <Table
      dataSource={getList(eventRef)}
      columns={columns}
      rowKey="id"
      size="small"
      scroll={{ y: 440 }}
      pagination={false}
      expandable={{
        expandedRowKeys: expandedKeys,
        onExpand: (expand, row) => {
          const { id } = row;
          setExpandedKeys(
            expand
              ? [id, ...expandedKeys]
              : expandedKeys.filter((item) => item !== id)
          );
        },
      }}
    />
  );
};
