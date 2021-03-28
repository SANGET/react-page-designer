import React from "react";
import { PropItem, PropItemRenderContext } from "@provider-app/platform-access-spec";
import { QueryTypeComp } from "./comp";
import "./style.scss";

/** 属性项编辑的组件属性 */
const attr = "queryType";
@PropItem({
  id: "prop_query_type",
  label: "查询方式",
  whichAttr: [attr],
  // defaultValues: {
  //   title: '标题'
  // },
})
export default class QueryTypeSpec {
  render(ctx: PropItemRenderContext) {
    const { changeEntityState, editingWidgetState } = ctx;
    const handleChange = (value) => {
      changeEntityState({
        attr,
        value,
      });
    };
    return (
      <div className="prop-query-type">
        <QueryTypeComp
          onChange={handleChange}
          editingWidgetState={editingWidgetState}
        />
      </div>
    );
  }
}
