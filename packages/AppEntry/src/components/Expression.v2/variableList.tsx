import React from "react";
import {
  Space,
  Collapse,
  List,
  Tag,
  Tooltip,
  Empty,
  Tree,
  message,
} from "antd";
import { VariableItem } from "@provider-app/platform-access-spec";

interface IProps {
  variableTree;
  selectVariable;
}

const { Panel } = Collapse;
export const VariableList: React.FC<IProps> = (props) => {
  const { variableTree, selectVariable } = props;
  console.log("variableTree", variableTree);
  return (
    <section className="expression-option">
      <h4>可用变量</h4>
      <div className="expression-option-body" style={{ padding: 12 }}>
        {variableTree?.length > 0 ? (
          <Tree
            showLine={true}
            treeData={variableTree}
            onSelect={(_, { node, selected }) => {
              console.log(node);
              if (node.type) {
                if (node.type === "page") {
                  message.info("暂不支持");
                } else {
                  selectVariable(node);
                }
              }
            }}
          />
        ) : (
          // <Collapse defaultActiveKey={["1"]} bordered={false}>
          //   {variableTree.map((type) => (
          //     <Panel
          //       header={
          //         <Space className="expression-option-title">
          //           <span>{type.title}</span>
          //         </Space>
          //       }
          //       extra={
          //         type.id === "page" ? (
          //           <Tag color="warning">应用端暂不支持</Tag>
          //         ) : (
          //           ""
          //         )
          //       }
          //       key={type.id}
          //     >
          //       <List
          //         size="small"
          //         bordered={false}
          //         dataSource={type.children}
          //         renderItem={(item: VariableItem) => (
          //           <List.Item
          //             key={item.id}
          //             onClick={() => {
          //               selectVariable(item);
          //             }}
          //           >
          //             <span>{item.title}</span>
          //           </List.Item>
          //         )}
          //       />
          //     </Panel>
          //   ))}
          // </Collapse>
          <div style={{ paddingTop: 20 }}>
            <Empty description="未获取到变量" />
          </div>
        )}
      </div>
    </section>
  );
};
