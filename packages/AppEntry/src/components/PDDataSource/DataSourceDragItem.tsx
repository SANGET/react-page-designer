import React from "react";
import { Collapse } from "antd";
import { DisconnectOutlined, LinkOutlined } from "@ant-design/icons";
import { PlatformDatasource } from "@provider-app/platform-access-spec";

const { Panel } = Collapse;

interface DataSourceDragItemProps {
  /** 内部的数据源格式 */
  interDatasources: PlatformDatasource;
}

/**
 * 根据 columns 包装可以拖拽的元素
 */
export const DataSourceDragItem: React.FC<DataSourceDragItemProps> = ({
  interDatasources,
}) => {
  return (
    <div className="data-source-drag-items">
      <Collapse ghost>
        {Array.isArray(interDatasources) &&
          interDatasources.map((datasourceItem) => {
            const { name: dName, columns, id, createdBy } = datasourceItem;
            return (
              <Panel
                header={
                  <>
                    <span>{dName}</span>
                    {createdBy.includes("page") ? (
                      <LinkOutlined
                        className="ml-1"
                        style={{ verticalAlign: 2 }}
                      />
                    ) : null}
                    {createdBy.includes("prop") ? (
                      <DisconnectOutlined
                        className="ml-1"
                        style={{ verticalAlign: 2 }}
                      />
                    ) : null}
                  </>
                }
                key={id}
              >
                <div className="group p-2">
                  {(columns ? Object.values(columns) : []).map((column) => {
                    const { name: colName, id: columnID } = column;
                    return <p key={columnID}>{colName}</p>;
                  })}
                </div>
              </Panel>
            );
          })}
      </Collapse>
    </div>
  );
};
