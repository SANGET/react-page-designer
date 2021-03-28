import { PlatformCtx } from "@provider-app/platform-access-spec";
import React from "react";
import { ClosePageModal } from "./LowCodeFunSources/closePageModal";
import { DataBackfill } from "./LowCodeFunSources/dataBackfill";
import { DeleteData } from "./LowCodeFunSources/deleteData";
import { GetDataParams } from "./LowCodeFunSources/getDataParams";
import { GetSelectData } from "./LowCodeFunSources/getSelectData";
import { ModifyData } from "./LowCodeFunSources/modifyData";
import { OpenLinkPage } from "./LowCodeFunSources/openLinkPage";
import { OpenSelectModal } from "./LowCodeFunSources/openSelectModal";
import { SubmitDataParams } from "./LowCodeFunSources/submitDataParams";
import { TableInit } from "./LowCodeFunSources/tableInit";
import { CommonCodes } from "./LowCodeFunSources/commonCodes";

interface IProps {
  insertValue: (code: string) => void;
  metaCtx: PlatformCtx["meta"];
  platformCtx?: PlatformCtx;
  pageState?: any;
  businessCodeParam?: { pageId: string; widgetId: string };
}
export const LowCodeTemplate = (props: IProps) => {
  const {
    insertValue,
    metaCtx,
    platformCtx,
    pageState,
    businessCodeParam,
  } = props;
  return [
    {
      title: "表格初始化",
      desc: "表格初始化",
      params: (
        <TableInit
          insertValue={insertValue}
          metaCtx={metaCtx}
          pageState={pageState}
        />
      ),
      mark: "表格初始化",
    },
    {
      title: "数据提交",
      desc: "数据提交",
      params: (
        <SubmitDataParams
          insertValue={insertValue}
          metaCtx={metaCtx}
          pageState={pageState}
          businessCodeParam={businessCodeParam || {}}
        />
      ),
      mark: "数据提交",
    },
    {
      title: "数据删除",
      desc: "数据删除",
      params: (
        <DeleteData
          insertValue={insertValue}
          metaCtx={metaCtx}
          platformCtx={platformCtx}
          pageState={pageState}
          businessCodeParam={businessCodeParam || {}}
        />
      ),
      mark: "数据删除",
    },
    {
      title: "数据查询",
      desc: "数据查询",
      params: (
        <GetDataParams
          insertValue={insertValue}
          metaCtx={metaCtx}
          platformCtx={platformCtx}
          pageState={pageState}
          businessCodeParam={businessCodeParam || {}}
        />
      ),
      mark: "数据查询",
    },
    {
      title: "数据编辑",
      desc: "数据编辑",
      params: (
        <ModifyData
          insertValue={insertValue}
          metaCtx={metaCtx}
          pageState={pageState}
          businessCodeParam={businessCodeParam || {}}
        />
      ),
      mark: "数据编辑",
    },
    {
      title: "数据回填",
      desc: "数据回填",
      params: (
        <DataBackfill
          insertValue={insertValue}
          metaCtx={metaCtx}
          platformCtx={platformCtx}
          pageState={pageState}
          businessCodeParam={businessCodeParam || {}}
        />
      ),
      mark: "数据回填",
    },
    {
      title: "下拉数据源选择",
      desc: "下拉数据源选择",
      params: (
        <GetSelectData
          insertValue={insertValue}
          metaCtx={metaCtx}
          platformCtx={platformCtx}
          pageState={pageState}
          businessCodeParam={businessCodeParam || {}}
        />
      ),
      mark: "下拉数据源选择",
    },
    {
      title: "打开弹窗页面",
      desc: "打开弹窗",
      params: (
        <OpenLinkPage
          insertValue={insertValue}
          metaCtx={metaCtx}
          pageState={pageState}
        />
      ),
      mark: "打开弹窗",
    },
    {
      title: "关闭弹窗页面",
      desc: "关闭弹窗页面",
      params: <ClosePageModal insertValue={insertValue} />,
      mark: "关闭弹窗页面",
    },
    {
      title: "打开弹窗选择",
      desc: "打开弹窗选择",
      params: (
        <OpenSelectModal
          insertValue={insertValue}
          metaCtx={metaCtx}
          pageState={pageState}
          businessCodeParam={businessCodeParam || {}}
        />
      ),
      mark: "打开弹窗选择",
    },
    {
      title: "通用函数",
      desc: "通用函数",
      params: (
        <CommonCodes
          insertValue={insertValue}
          platformCtx={platformCtx}
          businessCodeParam={businessCodeParam || {}}
        />
      ),
      mark: "通用函数",
    },
  ];
};
