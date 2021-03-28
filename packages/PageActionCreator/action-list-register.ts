import React from "react";

import {
  OpenLink,
  SubmitToApi,
  RequestList,
  LowCodeEditorAction,
  RequestRelatedRecord,
  FormInit,
  // SubmitData,
  // ChooseData,
  // ChangeVariables,
  // WriteFormData,
  // ReadFormData,
} from "./action-template";

interface ActionConfigItem {
  label: string;
  type: string;
  component: React.ElementType;
}

const actionList: ActionConfigItem[] = [
  {
    label: "提交数据到 API",
    type: "submit2api",
    component: SubmitToApi,
  },
  {
    label: "打开链接",
    type: "openPage",
    component: OpenLink,
  },
  {
    label: "列表数据查询",
    type: "requestList",
    component: RequestList,
  },
  {
    label: "数据联动",
    type: "requestRelatedRecord",
    component: RequestRelatedRecord,
  },
  {
    label: "编辑表单初始化",
    type: "formInit",
    component: FormInit,
  },
  {
    label: "代码片段",
    type: "codeSnippet",
    component: LowCodeEditorAction,
  }
  // {
  //   label: "刷新控件（未实现）",
  //   value: "refreshControl",
  //   type: "refreshControl",
  // },
  // { label: "赋值给变量", value: "changeVariables", type: "changeVariables" },
  // {
  //   label: "数据提交",
  //   value: "submitData",
  //   type: "submitData",
  //   component: SubmitData,
  // },
  // {
  //   label: "数据选择",
  //   value: "chooseData",
  //   type: "chooseData",
  //   component: ChooseData
  // },
  // // { label: "显示隐藏", value: "displayControl", type: "displayControl" },
  // // { label: "刷新页面", value: "refreshPage", type: "refreshPage" },
  // // { label: "关闭页面", value: "closePage", type: "closePage" },
  // {
  //   label: "整表读取",
  //   value: "readFormData",
  //   type: "readFormData",
  //   component: ReadFormData
  // },
  // {
  //   label: "整表回写",
  //   value: "writeFormData",
  //   type: "writeFormData",
  //   component: WriteFormData
  // },
  // { label: "表格查询", value: "readTableData", type: "readTableData" },
  // { label: "表格回写", value: "writeTableData", type: "writeTableData" },
];

export default actionList;
