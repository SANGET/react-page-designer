import React from "react";
import { List, Radio } from "antd";
import actionList from "./action-list-register";

import "./style.scss";

interface ActionConfigCreatorProps {
  pageMetadata;
  platformCtx;
  onSubmit;
  onCancel;
  initialValues;
}

export class ActionConfigCreator extends React.Component<ActionConfigCreatorProps> {
  state = {
    selectedConfigType: "",
  };

  constructor(props) {
    super(props);
    const { initialValues } = this.props;
    if (initialValues) {
      this.state.selectedConfigType = initialValues?.actionConfig?.type;
    }
  }

  selectConfig = (type) => {
    this.setState({
      selectedConfigType: type,
    });
  };

  render() {
    const { selectedConfigType } = this.state;
    const {
      pageMetadata,
      platformCtx,
      initialValues,
      onSubmit,
      onCancel,
    } = this.props;
    const prevConfig = initialValues?.actionConfig?.config;
    const selectedConfig = actionList.find(
      (item) => item.type === selectedConfigType
    );
    return (
      <div className="action-config-creator flex">
        <div className="action-list w-2/12">
          <List
            dataSource={actionList}
            renderItem={(config) => {
              const { label, type } = config;
              const isSelected = type === selectedConfigType;
              return (
                <div
                  className={`list-item px-4 py-3${
                    isSelected ? " active bg-gray-200" : ""
                  }`}
                  onClick={(e) => this.selectConfig(type)}
                >
                  {label}
                </div>
              );
            }}
          />
        </div>
        <div className="action-config-panel w-10/12 p-4">
          {selectedConfig?.component ? (
            <selectedConfig.component
              initValues={prevConfig}
              actionId={initialValues?.id}
              pageMetadata={pageMetadata}
              platformCtx={platformCtx}
              onSubmit={(config, configCn) => {
                onSubmit({
                  config,
                  type: selectedConfigType,
                  label: selectedConfig.label,
                });
              }}
              onCancel={() => {
                onCancel?.();
              }}
            />
          ) : (
            <div>请选择左边的配置选</div>
          )}
        </div>
      </div>
    );
  }
}
