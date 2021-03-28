import React, { useEffect, useState } from "react";
import { Form as AntdForm, Button, Space, Table } from "antd";
import pick from "lodash/pick";
import {
  getPageListServices,
  getPageDetailService,
} from "@provider-app/provider-app-common/services";

import { SyncOutlined } from "@ant-design/icons";
import { BasicValueMeta, OpenPageInApp } from "@provider-app/platform-access-spec";
import { ValueHelper } from "@provider-app/page-designer-shared/ValueHelper";
import { Formik, ErrorMessage } from "formik";

import { Form, Input, Radio, Select } from "formik-antd";
import * as Yup from "yup";
// import { VarAttrTypeMap } from "../../PageVariableSelector";

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};
const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

interface IOnSuccessParams {
  id: string;
  name: string;
}

interface IProps {
  onSubmit: (item: IOnSuccessParams, name: string) => void;
  onCancel: () => void;
  initValues: OpenPageInApp;
  platformCtx;
  actionId?: string;
}

const OPEN_TYPE_MENU = [
  {
    label: "覆盖当前页面（未实现）",
    value: "replaceCurrentPage",
    key: "replaceCurrentPage",
  },
  { label: "弹窗页面", value: "openModal", key: "openModal" },
  {
    label: "新浏览器tab页（未实现）",
    value: "newTabInBrowser",
    key: "newTabInBrowser",
  },
  {
    label: "应用内页面跳转（未实现）",
    value: "newTabInApp",
    key: "newTabInApp",
  },
];
const PAGE_AREA_MENU = [
  { label: "配置页面", value: "pageInApp", key: "pageInApp" },
  { label: "非配置页面（未实现）", value: "pageOutApp", key: "pageOutApp" },
];
const PAGE_OPR_MENU = [
  { label: "新增", value: "insert", key: "insert" },
  { label: "编辑", value: "update", key: "update" },
  { label: "详情", value: "detail", key: "detail" },
  { label: "空", value: "null", key: "null" },
];
const PAGE_TYPE_MENU = [
  { label: "地址（未实现）", value: "address", key: "address" },
  { label: "功能码（未实现）", value: "funcCode", key: "funcCode" },
];
type PageItem = {
  label: string;
  value: string;
  key: string;
};
type InputVarItem = {
  alias: string;
  id: string;
  varType: string;
};
type FormValues = {
  openType:
    | "replaceCurrentPage"
    | "openModal"
    | "newTabInBrowser"
    | "newTabInApp";
  pageArea: "pageInApp" | "pageOutApp";
  link: string;
  pageType?: "address" | "funcCode";
  // operation?: "insert" | "update" | "detail" | "null";
  // onOk?: string[];
  onCancel?: string[];
};
type InterAction = { label: string; value: string; key: string };

const FormSchema = Yup.object().shape({
  openType: Yup.string().required("打开方式必填"),
  pageArea: Yup.string().required("链接地址必填"),
  link: Yup.string().required("打开链接必填"),
});

const InputVarList = ({
  pageId,
  platformCtx,
  inputVarConfig,
  setBasicValueMeta,
}) => {
  /** 页面对应入参列表 */
  const [inputVarList, setInputVarList] = useState<InputVarItem[]>([]);
  const [listRenderReady, setListRenderReady] = useState<boolean>(false);
  /** 当前页面变量数据 */
  // const variableData = platformCtx.meta.getVariableData();
  // const [variableData, setVariableData] = useState({});
  useEffect(() => {
    updateVarList();
    /** 获取当前页面变量 */
    // setVariableData(platformCtx.meta.getVariableData([]));
  }, [pageId]);

  const updateVarList = async () => {
    setListRenderReady(false);
    const getInputVarOrder = (item) => {
      return item.id.split(".")[2] - 0;
    };
    const { pageContent } = await getPageDetailService(pageId); // eslint-disable-line no-unused-vars
    const varRely = pageContent?.meta?.varRely || {};
    // const { pageInput } = await platformCtx.meta.getVariableData(
    //   ["widget", "system", "page", "customed"],
    //   { varRely }
    // );
    const pageInput: any = [];
    Object.keys(varRely).forEach((key) => {
      if (key.indexOf("pageInput") !== -1) {
        const { title } = varRely[key];
        pageInput.push({ title, id: key });
      }
    });
    // setInputVarList(pageInput);
    console.log(varRely);
    setInputVarList(
      pageInput.sort((a, b) => getInputVarOrder(b) - getInputVarOrder(a))
    );
    setListRenderReady(true);
  };

  return (
    <Table
      dataSource={inputVarList}
      columns={[
        {
          dataIndex: "title",
          key: "title",
          width: 200,
          title: () => {
            return (
              <>
                <span>名称</span>
                <SyncOutlined
                  spin={!listRenderReady}
                  className="ml-1"
                  style={{ verticalAlign: "baseline" }}
                  onClick={updateVarList}
                />
              </>
            );
          },
        },
        // {
        //   dataIndex: "varType",
        //   key: "varType",
        //   title: "类型",
        //   width: 100,
        //   render: (_t) => VarAttrTypeMap[_t],
        // },
        {
          dataIndex: "id",
          key: "id",
          title: "值",
          width: 200,
          render: (_t, _r, _i) => {
            return (
              <ValueHelper
                platformCtx={platformCtx}
                editedState={inputVarConfig[_t] || {}}
                onChange={(changeArea) => {
                  setBasicValueMeta({
                    ...inputVarConfig,
                    [_t]: changeArea,
                  });
                }}
                // variableData={variableData}
              />
            );
          },
        },
      ]}
      rowKey="id"
      size="small"
      pagination={false}
      scroll={{ y: 300 }}
    />
  );
};
export const OpenLink = ({
  onSubmit,
  onCancel,
  initValues: data,
  platformCtx,
  actionId,
}: IProps) => {
  /** 表单数据 */
  // const [form] = Form.useForm<FormValues>();
  /** 配置页面列表 */
  const [pageList, setPageList] = useState<PageItem[]>([]);
  /** 输入参数配置 */
  const [inputVarConfig, setBasicValueMeta] = useState<BasicValueMeta>({});

  // const varItems = platformCtx.meta.getVariableData([], { flat: true });
  // console.log(varItems);

  /**
   * 提交表单数据
   */
  const onFinish = (values) => {
    const { openType, pageArea, link } = values; // eslint-disable-line no-unused-vars
    /** 打开方式 */
    const openTypeCn = OPEN_TYPE_MENU.filter(
      (item) => item.value === openType
    )[0]?.label;
    /** 打开页面 */
    let pageNameCn = link;
    if (pageArea === "pageInApp") {
      pageNameCn = pageList.filter((item) => item.value === link)[0]?.label;
    }
    onSubmit(
      { ...values, paramMatch: inputVarConfig, pageNameCn },
      `以 ${openTypeCn} 打开 ${pageNameCn}`
    );
  };
  useEffect(() => {
    /** 获取应用内列表数据 */
    getPlatformPage();
    /** 初始化表单数据，做些默认值设置 */
    // const values = pick(
    //   data || {
    //     openType: "openModal",
    //     pageArea: "pageInApp",
    //     operation: "insert",
    //     link: "",
    //   },
    //   ["openType", "pageArea", "pageType", "link", "operation"]
    // );
    // setFieldsValue(values);
    setBasicValueMeta(data?.paramMatch || {});
  }, [data]);
  const filterOption = (value, option) => {
    if (!value) return true;
    return option?.label?.toLowerCase()?.includes(value.toLowerCase());
  };
  /**
   * 获取应用内列表数据
   */
  const getPlatformPage = () => {
    getPageListServices({}).then((pageListRes) => {
      let pageListTmpl = pageListRes.result?.data || [];
      if (Array.isArray(pageListTmpl)) {
        pageListTmpl = pageListTmpl.map((item) => {
          return { label: item.name, value: item.id, key: item.id };
        });
      } else {
        pageListTmpl = [];
      }
      setPageList(pageListTmpl);
    });
  };

  const updateInputVar = async (value) => {
    setBasicValueMeta({});
  };

  const defaultFormValue = {
    openType: "openModal",
    pageArea: "pageInApp",
    // operation: "insert",
    link: "",
  };
  const initActions = () => {
    const { actions } = platformCtx.meta.getPageMeta();
    if (!actions) return [];
    const actionList: InterAction[] = [];
    Object.keys(actions).forEach((key) => {
      const {
        [key]: { actionName: label },
      } = actions;
      if (actionId !== key && key !== "closePage") {
        actionList.push({
          label,
          value: key,
          key,
        });
      }
    });
    return actionList;
  };
  const interActions = initActions();
  return (
    <Formik
      initialValues={Object.assign(
        {},
        defaultFormValue,
        data?.openType ? data : {}
      )}
      onSubmit={(values, { setSubmitting }) => {
        onFinish(values);
        setSubmitting(false);
      }}
      validationSchema={FormSchema}
    >
      {({ isSubmitting, setFieldValue, values, resetForm, errors }) => {
        const hasError = Object.keys(errors).length > 0;
        return (
          <Form {...layout} name="open-page">
            <AntdForm.Item label="打开方式" required>
              <Select name="openType" options={OPEN_TYPE_MENU} />
            </AntdForm.Item>
            <AntdForm.Item label="链接地址" required>
              <Radio.Group
                name="pageArea"
                options={PAGE_AREA_MENU}
                onChange={(value) => {
                  if (values.link) setFieldValue("link", "");
                  setBasicValueMeta({});
                }}
              />
            </AntdForm.Item>
            <AntdForm.Item shouldUpdate noStyle>
              {({ getFieldValue }) => {
                // const pageArea = values.pageArea;
                return values.pageArea === "pageInApp" ? (
                  <>
                    <AntdForm.Item label="链接页面" required>
                      <Select
                        name="link"
                        showSearch
                        filterOption={filterOption}
                        onChange={updateInputVar}
                        options={pageList}
                      />
                      <ErrorMessage
                        name="link"
                        component="div"
                        className="error"
                      />
                    </AntdForm.Item>
                    {/* <AntdForm.Item label="操作类型">
                      <Radio.Group
                        name="operation"
                        options={PAGE_OPR_MENU}
                        onChange={(value) => {}}
                      />
                    </AntdForm.Item> */}
                  </>
                ) : (
                  <>
                    <AntdForm.Item label="页面类型" required>
                      <Radio.Group
                        name="pageType"
                        defaultValue="address"
                        options={PAGE_TYPE_MENU}
                      />
                    </AntdForm.Item>
                    <AntdForm.Item label="链接页面" required>
                      <Input
                        name="link"
                        placeholder="请输入页面跳转链接或功能码"
                      />
                      <ErrorMessage
                        name="link"
                        component="div"
                        className="error"
                      />
                    </AntdForm.Item>
                  </>
                );
              }}
            </AntdForm.Item>
            <AntdForm.Item
              noStyle
              shouldUpdate={(prev, current) =>
                prev.link !== current.link || prev.pageArea !== current.pageArea
              }
            >
              {({ getFieldValue }) => {
                if (values.link && values.pageArea === "pageInApp") {
                  return (
                    <>
                      <AntdForm.Item label="传入参数" className="value-hepler">
                        <InputVarList
                          platformCtx={platformCtx}
                          pageId={values.link}
                          inputVarConfig={inputVarConfig}
                          setBasicValueMeta={setBasicValueMeta}
                        />
                      </AntdForm.Item>
                      {/* <AntdForm.Item label="弹窗成功回调">
                        <Select
                          style={{ width: "calc( 100% - 40px )" }}
                          mode="multiple"
                          allowClear
                          name="onOk"
                          options={interActions}
                          onChange={(value) => {}}
                        />
                      </AntdForm.Item> */}
                      <AntdForm.Item label="关闭页面事件">
                        <Select
                          style={{ width: "calc( 100% - 40px )" }}
                          mode="multiple"
                          allowClear
                          name="onCancel"
                          options={interActions}
                          onChange={(value) => {}}
                        />
                      </AntdForm.Item>
                    </>
                  );
                }
                return null;
              }}
            </AntdForm.Item>

            <AntdForm.Item
              {...tailLayout}
              style={{ marginBottom: 0, marginTop: 5 }}
            >
              <Space className="float-right">
                <Button
                  htmlType="reset"
                  onClick={() => resetForm({ values: defaultFormValue })}
                >
                  清空
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  disabled={hasError}
                  loading={isSubmitting}
                >
                  确定
                </Button>
                <Button htmlType="button" onClick={onCancel}>
                  取消
                </Button>
              </Space>
            </AntdForm.Item>
          </Form>
        );
      }}
    </Formik>
  );
};
