import React, { useState, useEffect } from "react";
import classnames from "classnames";
// import { Button, } from "@provider-app/shared-ui";
import { PlatformCtx, PlatformDatasource } from "@provider-app/platform-access-spec";
import { Input, Select, Button, List, Space, Form as AntdForm } from "antd";
import { ShowModal } from "@deer-ui/core";
import { CloseCircleOutlined, SettingOutlined } from "@ant-design/icons";
import { Formik, ErrorMessage } from "formik";
import { Form, Input as FormikInput } from "formik-antd";
import { ApiCreator } from "./ApiCreator";
/**
 * 已选中的字段
 */
export interface OptionsSelectorData {
  type: string;
  optionsConfig?: { showVal: string; realVal: string }[];
  apiMeta?: any;
}

/**
 * 字段选择器的 props
 */
interface OptionsSelectorProps {
  defaultOptions?: OptionsSelectorData;
  onSubmit: (config: OptionsSelectorData) => void;
  platformCtx: PlatformCtx;
}
// 自定义选项配置
const CustomList = ({ onSubmit, optionsConfig }) => {
  const [optionData, setOptionData] = useState<
    { showVal: string; realVal: string }[]
  >(optionsConfig || [{ showVal: "选项0", realVal: "0" }]);
  return (
    <List
      dataSource={optionData}
      footer={
        <Button
          onClick={() => {
            const data = optionData.concat([]);
            data.push({
              showVal: `选项${data.length}`,
              realVal: `${data.length}`,
            });
            setOptionData(data);
            onSubmit({
              type: "custom",
              optionsConfig: data,
            });
          }}
        >
          添加
        </Button>
      }
      itemLayout="vertical"
      renderItem={(item, index) => (
        <List.Item>
          <Input
            key={item.realVal}
            value={item.showVal}
            onChange={(e) => {
              const { value } = e.target;
              const data = optionData.concat([]);
              const newItem = { showVal: value, realVal: data[index].realVal };
              data.splice(index, 1, newItem);
              setOptionData(data);
              onSubmit({
                type: "custom",
                optionsConfig: data,
              });
            }}
            addonAfter={
              <>
                <SettingOutlined
                  onClick={() => {
                    ShowModal({
                      title: "设置选项",
                      children: ({ close }) => {
                        return (
                          <Formik
                            initialValues={item}
                            onSubmit={(values, { setSubmitting }) => {
                              let data = optionData.concat([]);
                              data = data.filter((option, i) => {
                                return i !== index;
                              });
                              data.splice(index, 0, values);
                              setOptionData(data);
                              onSubmit({
                                type: "custom",
                                optionsConfig: data,
                              });
                              close();
                              setSubmitting(false);
                            }}
                            // validationSchema={FormSchema}
                          >
                            {({
                              isSubmitting,
                              setFieldValue,
                              values,
                              resetForm,
                              errors,
                            }) => {
                              return (
                                <Form
                                  name="setting"
                                  style={{ padding: "10px" }}
                                >
                                  <AntdForm.Item label="显示值" required>
                                    <FormikInput type="text" name="showVal" />
                                  </AntdForm.Item>
                                  <AntdForm.Item label="实际值" required>
                                    <FormikInput type="text" name="realVal" />
                                  </AntdForm.Item>
                                  <AntdForm.Item>
                                    <Button
                                      type="primary"
                                      htmlType="submit"
                                      // disabled={hasError}
                                      loading={isSubmitting}
                                    >
                                      确定
                                    </Button>
                                  </AntdForm.Item>
                                </Form>
                              );
                            }}
                          </Formik>
                        );
                      },
                    });
                  }}
                />
                <CloseCircleOutlined
                  style={{ paddingLeft: "4px" }}
                  onClick={() => {
                    let data = optionData;
                    data = data.filter((option, i) => {
                      return i !== index;
                    });
                    setOptionData(data);
                    onSubmit({
                      type: "custom",
                      optionsConfig: data,
                    });
                  }}
                />
              </>
            }
          />
        </List.Item>
      )}
    ></List>
  );
};

// api选项配置
const ApiDataConfig = ({ onSubmit, platformCtx, defaultApiMeta }) => {
  const [apiName, setApiName] = useState(defaultApiMeta?.name);
  const [columns, setColumns] = useState(defaultApiMeta?.columnsObj || {});
  const [apiMeta, setApiMeta] = useState(defaultApiMeta || {});
  const [apiType, setApiType] = useState(defaultApiMeta?.type || "DICT");
  // const apiMeta = {};
  const getColumns = (columnsObj) => {
    const result = {};
    Object.values(columnsObj).forEach((item) => {
      result[item.fieldCode] = item.name;
    });
    return result;
  };
  return (
    <>
      <div
        className="my-2 px-4 py-2 border cursor-pointer"
        onClick={() => {
          platformCtx?.selector.openDatasourceSelector({
            defaultSelected: (defaultApiMeta && [defaultApiMeta]) || [],
            modalType: "normal",
            position: "top",
            single: true,
            typeSingle: true,
            typeArea: ["TABLE", "DICT"],
            onSubmit: ({ close, interDatasources }) => {
              // 由于是单选的，所以只需要取 0
              const bindedDS = interDatasources[0];
              console.log(bindedDS);
              setApiName(bindedDS.name);
              setApiType(bindedDS.type);
              // settableCode(bindedDS.code);
              const columnsObj = getColumns(bindedDS.columns);
              setColumns(columnsObj);
              const data = Object.assign({}, apiMeta, bindedDS, {
                columnsObj,
              });
              setApiMeta(data);
              onSubmit({
                type: "api",
                apiMeta: data,
              });
              close();
            },
          });
        }}
      >
        {apiName || "点击绑定 API"}
      </div>
      {apiType !== "DICT" ? (
        <>
          <div>
            <AntdForm.Item label="显示值">
              <Select
                defaultValue={defaultApiMeta?.showCode}
                onChange={(value) => {
                  const data = Object.assign({}, apiMeta, { showCode: value });
                  setApiMeta(data);
                  onSubmit({
                    type: "api",
                    apiMeta: data,
                  });
                }}
              >
                {Object.keys(columns).map((key) => (
                  <Select.Option key={key} value={key}>
                    {columns?.[key]}
                  </Select.Option>
                ))}
              </Select>
            </AntdForm.Item>
          </div>
          <div>
            <AntdForm.Item label="实际值">
              <Select
                defaultValue={defaultApiMeta?.realCode}
                onChange={(value) => {
                  const data = Object.assign({}, apiMeta, { realCode: value });
                  setApiMeta(data);
                  onSubmit({
                    type: "api",
                    apiMeta: data,
                  });
                }}
              >
                {Object.keys(columns).map((key) => (
                  <Select.Option key={key} value={key}>
                    {columns?.[key]}
                  </Select.Option>
                ))}
              </Select>
            </AntdForm.Item>
          </div>
        </>
      ) : null}
      <div>
        <AntdForm.Item label="查询参数">
          <div
            onClick={() => {
              ShowModal({
                title: "绑定 API",
                width: "80vw",
                children: ({ close }) => {
                  return (
                    <div className="p-2">
                      <ApiCreator
                        platformCtx={platformCtx}
                        initialValues={{ rangeMap: defaultApiMeta?.params }}
                        onSubmit={(newApiMeta) => {
                          const data = Object.assign({}, apiMeta, {
                            params: newApiMeta?.rangeMap,
                          });
                          setApiMeta(data);
                          onSubmit({
                            type: "api",
                            apiMeta: data,
                          });
                          close();
                        }}
                      />
                    </div>
                  );
                },
              });
            }}
          >
            {defaultApiMeta?.params || apiMeta?.params ? "已配置" : "点击配置"}
          </div>
        </AntdForm.Item>
      </div>
    </>
  );
};

/**
 * 字段选择器
 * @param param0
 */
export const OptionsSelector: React.FC<OptionsSelectorProps> = ({
  defaultOptions,
  onSubmit,
  platformCtx,
}) => {
  const [currentType, setType] = useState(defaultOptions?.type || "custom");
  useEffect(() => {
    if(!defaultOptions){
      onSubmit({
        type: "custom",
        optionsConfig: [{ showVal: "选项0", realVal: "0" }],
      });
    }
  }, []);
  return (
    <div>
      <Select
        style={{ width: "100%" }}
        defaultValue={currentType}
        onChange={(value) => {
          setType(value);
          onSubmit({
            type: value,
            optionsConfig: [{ showVal: "选项0", realVal: "0" }],
            apiMeta: {}
          });
        }}
      >
        <Select.Option key="custom" value="custom">
          自定义
        </Select.Option>
        <Select.Option key="api" value="api">
          API
        </Select.Option>
      </Select>
      {currentType !== "api" ? (
        <div>
          <CustomList
            onSubmit={onSubmit}
            optionsConfig={defaultOptions?.optionsConfig}
          ></CustomList>
        </div>
      ) : (
        <ApiDataConfig
          onSubmit={onSubmit}
          platformCtx={platformCtx}
          defaultApiMeta={defaultOptions?.apiMeta}
        ></ApiDataConfig>
      )}
    </div>
  );
};
