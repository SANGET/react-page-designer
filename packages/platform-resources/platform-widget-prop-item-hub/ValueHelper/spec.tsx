import React from "react";
import { PropItem, PropItemRenderContext } from "@provider-app/platform-access-spec";
import { ValueHelper } from "./comp";

@PropItem({
  id: "prop_real_value",
  label: "值",
  whichAttr: ["realVal", "exp", "variable"],
})
export default class ValueHelperSpec {
  render(ctx: PropItemRenderContext) {
    return <ValueHelper {...ctx} />;
  }
}
