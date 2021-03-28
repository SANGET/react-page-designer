import React from "react";
import { Space, Collapse, List, Tag, Tooltip, Empty } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { VARIABLE_TYPE, VAR_WIDGET_TYPE } from "./constants";
import { TVariableItem } from "./interface";

interface IProps {
  variableTree;
  variableVisible;
  initVariableEdit;
  setVariableVisible;
  debugCodeValue;
  selectVariable;
}

const { Panel } = Collapse;
export const VariableList: React.FC<IProps> = (props) => {
  const {
    variableTree,
    setVariableVisible,
    debugCodeValue,
    selectVariable,
  } = props;

  return (
    <section className="expression-option">
      <h4>可用变量</h4>
      <div className="expression-option-body">
        {Object.keys(variableTree).length > 0 ? (
          <Collapse defaultActiveKey={["1"]} bordered={false}>
            {Object.keys(variableTree).map((type) => (
              <Panel
                header={
                  <Space className="expression-option-title">
                    <span>{VARIABLE_TYPE[type]}</span>
                    {type === "widget" && (
                      <Tooltip title="暂时只支持文本框">
                        <QuestionCircleOutlined />
                      </Tooltip>
                    )}
                  </Space>
                }
                key={type}
              >
                <List
                  size="small"
                  bordered={false}
                  dataSource={variableTree[type]}
                  renderItem={(item: TVariableItem) => (
                    <List.Item
                      onClick={() => {
                        selectVariable(item);
                      }}
                      actions={[
                        <Tag color="processing">
                          {VAR_WIDGET_TYPE[item.widgetRef] || "暂不支持类型"}
                        </Tag>,
                        <Tag
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          {debugCodeValue[item.field] || "编辑"}
                        </Tag>,
                      ]}
                    >
                      <span>{item.title}</span>
                    </List.Item>
                  )}
                />
              </Panel>
            ))}
          </Collapse>
        ) : (
          <div style={{ paddingTop: 20 }}>
            <Empty description="未获取到变量，请检查页面是否保存" />
          </div>
        )}
      </div>
    </section>
  );
};
