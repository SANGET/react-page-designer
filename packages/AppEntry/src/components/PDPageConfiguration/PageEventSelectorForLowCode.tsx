import { ThunderboltOutlined } from "@ant-design/icons";
import { Table } from "antd";
import React, { useState } from "react";

type Event = {
  type: "event";
  id: string;
  eventType: string;
};
export type EventRef = { [key: string]: string[] };
export type OpenLowCode = (eventType: string) => void;

export const PageEventSelectorForLowCode = ({
  pageState,
  changePageState,
  platformCtx,
}) => {
  const [eventRef, setEventRef] = useState<EventRef>(pageState.eventRef);

  // useEffect(() => {
  //   initList();
  // }, []);
  const getList = (eventsRef: EventRef): Event[] => {
    const eventList = [
      { alias: "加载事件", type: "onPageLoad" },
      { alias: "页面状态更新事件", type: "onPageUpdate" },
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
      };
    });
  };

  const openLowCode: OpenLowCode = (eventType) => {
    const closeModal = platformCtx.selector.openLowCodeImporter({
      defaultValue:
        (pageState.lowCode && pageState.lowCode[eventType]) || undefined,
      eventType,
      platformCtx,
      onSubmit: (lowCodeKey) => {
        const value = pageState.lowCode || {};
        changePageState({
          ...pageState,
          lowCode: {
            ...value,
            [eventType]: {
              code: lowCodeKey.code,
              simpleCode: lowCodeKey.codeSimple?.code,
              params: lowCodeKey.codeSimple?.params,
              use: lowCodeKey.use,
            },
          },
        });
        closeModal();
      },
    });
  };

  const columns = [
    {
      title: "动作",
      dataIndex: "alias",
      key: "actList",
      width: 300,
      render: (_t, _r) => {
        const { id } = _r;
        return _t;
      },
    },
    {
      title: "操作",
      dataIndex: "id",
      key: "action",
      width: 120,
      render: (_t, _r, order) => {
        const { id, eventType, type } = _r;
        return (
          <ThunderboltOutlined
            onClick={(e) => {
              e.stopPropagation();
              openLowCode(eventType);
            }}
          />
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
    />
  );
};
