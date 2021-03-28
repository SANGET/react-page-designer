import { PlatformCtx } from "@provider-app/platform-access-spec";
import React, { useEffect, useState } from "react";
import { ClosePageModal } from "./LowCodeFunSources/closePageModal";
import { DataBackfillSimple } from "./LowCodeFunSourcesSimple/dataBackfillSimple";
import { DeleteDataSimple } from "./LowCodeFunSourcesSimple/deleteDataSimple";
import { GetDataParamsSimple } from "./LowCodeFunSourcesSimple/getDataParamsSimple";
import { GetSelectDataSimple } from "./LowCodeFunSourcesSimple/getSelectDataSimple";
import { ModifyDataSimple } from "./LowCodeFunSourcesSimple/modifyDataSimple";
import { OpenLinkPageSimple } from "./LowCodeFunSourcesSimple/openLinkPageSimple";
import { OpenSelectModalSimple } from "./LowCodeFunSourcesSimple/openSelectModalSimple";
import { SubmitDataParamsSimple } from "./LowCodeFunSourcesSimple/submitDataParamsSimple";
import { TableInitQuerySimple } from "./LowCodeFunSourcesSimple/tableInitQuerySimple";
import { TableInitSimple } from "./LowCodeFunSourcesSimple/tableInitSimple";

interface IProps {
  insertValue: (code: string, params?: any) => void;
  metaCtx: PlatformCtx["meta"];
  platformCtx?: PlatformCtx;
  pageState?: any;
  businessCodeParam?: { pageId: string; widgetId: string };
  params?: any;
}
export const LowCodeTemplateSimple = (props: IProps) => {
  const {
    insertValue,
    metaCtx,
    platformCtx,
    businessCodeParam,
    params,
  } = props;
  const [pageState, setpageState] = useState<any>();
  useEffect(() => {
    setpageState(props.pageState);
  }, [props.pageState]);
  return [
    {
      title: "表格初始化(简版)",
      desc: "简单表格初始化",
      params: (
        <TableInitSimple
          insertValue={insertValue}
          pageState={pageState}
          params={
            params?.lowCodeTitle === "表格初始化(简版)" ? params : undefined
          }
        />
      ),
      mark: "简单表格初始化",
    },
    {
      title: "表格初始化查询(最简版)",
      desc: "简单表格初始化",
      params: (
        <TableInitQuerySimple
          insertValue={insertValue}
          platformCtx={platformCtx}
          pageState={pageState}
          businessCodeParam={businessCodeParam || {}}
          params={
            params?.lowCodeTitle === "表格初始化查询(最简版)"
              ? params
              : undefined
          }
        />
      ),
      mark: "简单表格初始化",
    },
    {
      title: "数据提交（简版）",
      desc: "数据提交",
      params: (
        <SubmitDataParamsSimple
          insertValue={insertValue}
          metaCtx={metaCtx}
          pageState={pageState}
          businessCodeParam={businessCodeParam || {}}
        />
      ),
      mark: "数据提交",
    },
    {
      title: "数据删除（简版）",
      desc: "数据删除",
      params: (
        <DeleteDataSimple
          insertValue={insertValue}
          metaCtx={metaCtx}
          platformCtx={platformCtx}
          pageState={pageState}
          businessCodeParam={businessCodeParam || {}}
          params={
            params?.lowCodeTitle === "数据删除（简版）" ? params : undefined
          }
        />
      ),
      mark: "数据删除",
    },
    {
      title: "数据查询（简版）",
      desc: "数据查询",
      params: (
        <GetDataParamsSimple
          insertValue={insertValue}
          metaCtx={metaCtx}
          platformCtx={platformCtx}
          pageState={pageState}
          params={
            params?.lowCodeTitle === "数据查询（简版）" ? params : undefined
          }
          businessCodeParam={businessCodeParam || {}}
        />
      ),
      mark: "数据查询",
    },
    {
      title: "数据编辑（简版）",
      desc: "数据编辑",
      params: (
        <ModifyDataSimple
          insertValue={insertValue}
          metaCtx={metaCtx}
          pageState={pageState}
          businessCodeParam={businessCodeParam || {}}
        />
      ),
      mark: "数据编辑",
    },
    {
      title: "数据回填（简版）",
      desc: "数据回填",
      params: (
        <DataBackfillSimple
          insertValue={insertValue}
          metaCtx={metaCtx}
          platformCtx={platformCtx}
          pageState={pageState}
          businessCodeParam={businessCodeParam || {}}
          params={
            params?.lowCodeTitle === "数据回填（简版）" ? params : undefined
          }
        />
      ),
      mark: "数据回填",
    },
    {
      title: "下拉数据源选择（简版）",
      desc: "下拉数据源选择",
      params: (
        <GetSelectDataSimple
          insertValue={insertValue}
          metaCtx={metaCtx}
          platformCtx={platformCtx}
          pageState={pageState}
          businessCodeParam={businessCodeParam || {}}
          params={
            params?.lowCodeTitle === "下拉数据源选择（简版）"
              ? params
              : undefined
          }
        />
      ),
      mark: "下拉数据源选择",
    },
    {
      title: "打开弹窗页面（简版）",
      desc: "打开弹窗",
      params: (
        <OpenLinkPageSimple
          insertValue={insertValue}
          pageState={pageState}
          params={
            params?.lowCodeTitle === "打开弹窗页面（简版）" ? params : undefined
          }
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
      title: "打开弹窗选择（简版）",
      desc: "打开弹窗选择",
      params: (
        <OpenSelectModalSimple
          insertValue={insertValue}
          metaCtx={metaCtx}
          pageState={pageState}
          params={
            params?.lowCodeTitle === "打开弹窗选择（简版）" ? params : undefined
          }
        />
      ),
      mark: "打开弹窗选择",
    },
  ];
};
