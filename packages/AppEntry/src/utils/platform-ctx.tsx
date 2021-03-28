import { CloseModal, ShowModal } from "@deer-ui/core";
import { PlatformCtx } from "@provider-app/platform-access-spec";
import { message } from "antd";
import React from "react";
import { LowCodeEditor } from "@provider-app/page-designer-shared/LowCodeEditor";
// import { Expression } from "../components/Expression";
import { PDPropertiesEditor } from "../components/PDPropertiesEditor";
import { Expression } from "../components/Expression.v2";
import { LowCodeConfig } from "../components/LowCodeConfig";
import { DataSourceSelector } from "../components/PDDataSource";
import { DataSearchEditor, FieldSortHelper } from "../components/PDInfraUI";

/**
 * 平台提供给的上下文
 */
export const createPlatformCtx = (
  metaCtx: PlatformCtx["meta"]
): PlatformCtx => {
  return {
    ui: {
      showMsg: (ctx) => {
        const { msg, type } = ctx;
        message[type](msg);
      },
    },
    meta: metaCtx,
    selector: {
      openDatasourceSelector: (options) => {
        const {
          defaultSelected,
          modalType,
          position,
          typeArea,
          single,
          onSubmit,
          typeSingle,
        } = options;
        const ModalID = ShowModal({
          title: "数据源选择",
          type: modalType,
          position,
          width: "85%",
          children: ({ close }) => {
            return (
              <DataSourceSelector
                bindedDataSources={defaultSelected}
                typeArea={typeArea}
                single={single}
                typeSingle={typeSingle}
                onSubmit={(selectedDSFromRemote, interDatasources) => {
                  onSubmit({ close, interDatasources, selectedDSFromRemote });
                }}
              />
            );
          },
        });
        return () => {
          CloseModal(ModalID);
        };
      },
      openExpressionImporter: (options) => {
        const { defaultValue, defaultVariableList, onSubmit } = options;
        const modalID = ShowModal({
          title: "表达式编辑",
          width: "85%",
          children: () => {
            return (
              <Expression
                defaultValue={defaultValue}
                defaultVariableList={defaultVariableList}
                metaCtx={metaCtx}
                onSubmit={onSubmit}
              />
            );
          },
        });
        return () => {
          CloseModal(modalID);
        };
      },
      openLowCodeImporter: (options) => {
        const { defaultValue, onSubmit, eventType, platformCtx } = options;
        const modalID = ShowModal({
          title: "低代码配置",
          width: "85%",
          children: () => {
            return (
              <LowCodeConfig
                defaultValue={defaultValue}
                eventType={eventType}
                metaCtx={metaCtx}
                platformCtx={platformCtx}
                onSubmit={onSubmit}
              />
            );
          },
        });
        return () => {
          CloseModal(modalID);
        };
      },
      openLowCodeEditor: (options) => {
        const { defaultValue, onSubmit, ...other } = options;
        const modalID = ShowModal({
          title: "低代编辑器",
          width: "60%",
          children: () => {
            return (
              <LowCodeEditor
                defaultValue={defaultValue}
                onSubmit={onSubmit}
                {...other}
              />
            );
          },
        });
        return () => {
          CloseModal(modalID);
        };
      },
      openFieldSortHelper: (options) => {
        const { defaultValue, datasource, onSubmit } = options;
        const ModalID = ShowModal({
          title: "排序字段选择",
          width: "85%",
          children: ({ close }) => {
            return (
              <div className="p-4">
                <FieldSortHelper
                  bindedFields={defaultValue}
                  bindedDs={datasource}
                  onSubmit={(bindedFields) => {
                    onSubmit(bindedFields);
                    CloseModal(ModalID);
                  }}
                  onCancel={() => {
                    CloseModal(ModalID);
                  }}
                />
              </div>
            );
          },
        });
        return () => {
          CloseModal(ModalID);
        };
      },
      renderDataSearchEditor: (options) => {
        return (
          <DataSearchEditor
            platformCtx={options.platformCtx}
            fields={options.fields}
            variableData={options.variableData}
            defaultValue={options.defaultValue}
            updateCurrentConfig={options.updateCurrentConfig}
          />
        );
      },
      openPDPropertiesEditor: (modalOptions, options) => {
        const {
          key,
          platformCtx,
          pageMetadata,
          selectedEntity,
          entityState,
          updateEntityState,
        } = options;
        const modalID = ShowModal({
          ...modalOptions,
          children: () => {
            return (
              <PDPropertiesEditor
                key={key}
                platformCtx={platformCtx}
                pageMetadata={pageMetadata}
                selectedEntity={selectedEntity}
                entityState={entityState}
                updateEntityState={updateEntityState}
              />
            );
          },
        });
        return () => {
          CloseModal(modalID);
        };
      },
    },
  };
};

export const PlatformContext = React.createContext<PlatformCtx>();
