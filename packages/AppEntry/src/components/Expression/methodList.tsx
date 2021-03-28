import React from "react";
import { Row, Col, Collapse, List, Descriptions } from "antd";
import { SHOW_FUNCTION_FIELD, HY_METHODS_TYPE } from "./constants";
import { IHyMethod } from "./interface";

interface IProps {
  curFunction;
  methodsTree;
  selectMethod;
}

const { Panel } = Collapse;
export const MethodList: React.FC<IProps> = (props) => {
  const { curFunction, methodsTree, selectMethod } = props;
  return (
    <Row>
      <Col span={5} style={{ visibility: "hidden" }}>
        <section className="expression-option">
          <h4>函数</h4>
          <div className="expression-option-body">
            <Collapse bordered={false}>
              {Object.keys(methodsTree).map((type) => (
                <Panel key={type} header={`${HY_METHODS_TYPE[type]}函数`}>
                  <List
                    size="small"
                    bordered={false}
                    dataSource={methodsTree[type]}
                    renderItem={(item: IHyMethod) => (
                      <List.Item
                        onClick={() => {
                          selectMethod(item);
                        }}
                      >
                        {item.name}
                      </List.Item>
                    )}
                  />
                </Panel>
              ))}
            </Collapse>
          </div>
        </section>
      </Col>
      <Col span={7} style={{ visibility: "hidden" }}>
        <section className="expression-option">
          <h4>函数描述</h4>
          <div className="expression-option-body" style={{ padding: 10 }}>
            {curFunction && (
              <Descriptions column={1}>
                <Descriptions.Item
                  key="describe"
                  label={SHOW_FUNCTION_FIELD.describe}
                >
                  {curFunction.describe || "待完善"}
                </Descriptions.Item>
                <Descriptions.Item
                  key="usage"
                  label={SHOW_FUNCTION_FIELD.usage}
                >
                  {curFunction.usage || "待完善"}
                </Descriptions.Item>
                <Descriptions.Item
                  key="example"
                  label={SHOW_FUNCTION_FIELD.example}
                >
                  {curFunction.example || "待完善"}
                </Descriptions.Item>
              </Descriptions>
            )}
          </div>
        </section>
      </Col>
    </Row>
  );
};
