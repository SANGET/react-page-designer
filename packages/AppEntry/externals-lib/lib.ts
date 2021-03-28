// 平台模块依赖
import * as DeerUI from "@deer-ui/core";
import * as SharedUI from "@provider-app/shared-ui";

import * as Sortablejs from "sortablejs";

import * as AntdProTable from "@ant-design/pro-table";
import * as AntdProForm from "@ant-design/pro-form";
import * as Formik from "formik";
import * as FormikAntd from "formik-antd";

/**
 * 注册给外部组件使用的类库
 */
export {
  DeerUI,
  SharedUI,
  Sortablejs,

  // antd
  AntdProTable,
  AntdProForm,
  Formik,
  FormikAntd,
};
