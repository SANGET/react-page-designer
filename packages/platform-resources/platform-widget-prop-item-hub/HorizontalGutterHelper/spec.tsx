import React from "react";
import {
  PropItem,
  PropItemRenderContext,
} from "@provider-app/platform-access-spec";
import { HorizontalGutterComp } from "./comp";

@PropItem({
  id: "prop_horizontal_gutter",
  whichAttr: ["horizontalGutter"],
  label: "列间距",
  defaultValues: {
    horizontalGutter: 16,
  },
})
export default class HorizontalGutterSpec {
  render(ctx: PropItemRenderContext) {
    return (
      <>
        <HorizontalGutterComp {...ctx} />
      </>
    );
  }
}
