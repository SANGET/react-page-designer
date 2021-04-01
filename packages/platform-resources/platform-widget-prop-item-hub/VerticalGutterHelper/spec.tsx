import React from "react";
import {
  PropItem,
  PropItemRenderContext,
} from "@provider-app/platform-access-spec";
import { VerticalGutterComp } from "./comp";

@PropItem({
  id: "prop_vertical_gutter",
  whichAttr: ["verticalGutter"],
  label: "行间距",
  defaultValues: {
    verticalGutter: 16,
  },
})
export default class VerticalGutterSpec {
  render(ctx: PropItemRenderContext) {
    return (
      <>
        <VerticalGutterComp {...ctx} />
      </>
    );
  }
}
