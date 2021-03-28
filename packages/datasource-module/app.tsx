import { PageMetadata } from "@provider-app/platform-access-spec";
import React from "react";
import { Button, List } from "antd";
import { ShowModal } from "@deer-ui/core";
import { FiEdit, FiDelete } from "react-icons/fi";
import { ApiCreator } from "./ApiCreator";
import { MetaCreator } from "./MetaCreator";
import { PlatformContext } from "../AppEntry/src/utils";

import "./style.scss";

interface ApiGeneratorProps {
  apiConfigMeta: PageMetadata["apisConfig"];
  onSubmit;
  onDel;
}

interface ApiGeneratorState {}

export class ApiGenerator extends React.Component<
  ApiGeneratorProps,
  ApiGeneratorState
> {
  state = {};

  render() {
    return (
      <PlatformContext.Consumer>
        {(platformCtx) => {
          const { apiConfigMeta = {}, onDel, onSubmit } = this.props;
          const apiKeys = Object.keys(apiConfigMeta);
          return (
            <div className="api-generator">
              <div className="add-api py-2">
                <Button
                  onClick={(e) => {
                    ShowModal({
                      title: "添加 API",
                      children: ({ close }) => {
                        return (
                          <ApiCreator
                            platformCtx={platformCtx}
                            onSubmit={(values) => {
                              onSubmit(values);
                              close();
                            }}
                          />
                        );
                      },
                    });
                  }}
                >
                  添加 API
                </Button>
                <Button
                  onClick={(e) => {
                    ShowModal({
                      title: "添加元数据",
                      children: ({ close }) => {
                        return (
                          <MetaCreator
                            platformCtx={platformCtx}
                            onSubmit={(values) => {
                              onSubmit(values);
                              close();
                            }}
                          />
                        );
                      },
                    });
                  }}
                >
                  添加元数据
                </Button>
              </div>
              <div className="api-group">
                {apiKeys.map((apiID) => {
                  const apiItem = apiConfigMeta[apiID];
                  return (
                    <div
                      key={apiID}
                      className="api-item flex items-center px-4 py-2 border border-gray-300 mb-2 bg-gray-100"
                    >
                      {apiItem.name}
                      <span className="flex"></span>
                      <FiEdit
                        className="ml-2"
                        onClick={(e) => {
                          ShowModal({
                            title: "编辑 API",
                            children: ({ close }) => {
                              return (
                                <ApiCreator
                                  platformCtx={platformCtx}
                                  initialValues={apiItem}
                                  onSubmit={(values) => {
                                    onSubmit(values);
                                    close();
                                  }}
                                />
                              );
                            },
                          });
                        }}
                      />
                      <FiDelete
                        className="ml-2"
                        onClick={(e) => {
                          onDel(apiItem);
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }}
      </PlatformContext.Consumer>
    );
  }
}
