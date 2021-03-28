import React from "react";
import { PropItem, PropItemRenderContext } from "@provider-app/platform-access-spec";
import { ValueHelper } from "./comp";

@PropItem({
  id: "prop_real_time_value",
  label: "值",
  whichAttr: ["realVal", "exp", "variable", "timeMode", "timeType"],
  defaultValues: {
     "timeMode": "fullTime" ,
     "timeType": "stamp"
  }
})
export default class TimeValueHelperSpec {
  render(ctx: PropItemRenderContext) {
    return <ValueHelper {...ctx} />;
  }
}