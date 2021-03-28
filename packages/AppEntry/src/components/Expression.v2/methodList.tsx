import React, { useState } from "react";
import { Row, Col, Collapse, List, Descriptions, Spin } from "antd";
import { EditableExpMeta, IExpMethod } from "@provider-app/platform-access-spec";

interface IProps {
  ready: boolean;
  data: EditableExpMeta[];
  onSelect: (name: string, isAsync?: boolean) => void;
}

const { Panel } = Collapse;

export const MethodList: React.FC<IProps> = (props) => {
  const [focusFunc, setFocusFunc] = useState<IExpMethod | null>(null);
  const { ready, data, onSelect } = props;
  return (
    <Spin spinning={!ready}>
      <Row gutter={8}>
        <Col span={8}>
          <section className="expression-option">
            <h4>预置函数</h4>
            <div className="expression-option-body">
              <Collapse bordered={false}>
                {data?.length
                  ? data.map((type) => (
                      <Panel key={type.key} header={type.title}>
                        <List
                          size="small"
                          bordered={false}
                          dataSource={type.items}
                          renderItem={(method) => (
                            <List.Item
                              onClick={() => {
                                if (typeof onSelect === "function") {
                                  onSelect(method.name, method.isAsync);
                                }
                              }}
                              onMouseOver={() => {
                                setFocusFunc(method);
                              }}
                            >
                              {method.name}
                            </List.Item>
                          )}
                        />
                      </Panel>
                    ))
                  : ""}
              </Collapse>
            </div>
          </section>
        </Col>
        <Col span={16}>
          <section className="expression-option">
            <h4>预置函数详情</h4>
            <div className="expression-option-body" style={{ padding: 10 }}>
              {focusFunc && (
                <Descriptions column={1}>
                  <Descriptions.Item key="example" label="示例">
                    {focusFunc.example || ""}
                  </Descriptions.Item>
                  <Descriptions.Item key="usage" label="用法">
                    {focusFunc.usage || ""}
                  </Descriptions.Item>
                  <Descriptions.Item key="desc" label="描述">
                    {focusFunc.desc || ""}
                  </Descriptions.Item>
                </Descriptions>
              )}
            </div>
          </section>
        </Col>
      </Row>
    </Spin>
  );
};
