import { EditableWidgetMeta } from "@provider-app/platform-access-spec";
import { makeWidgetEntity } from "../../utils";

const flexLayoutMeta = (defaultValues): EditableWidgetMeta => {
  return {
    widgetRef: "FlexLayout",
    icon: "FiLayout",
    dragable: false,
    isContainer: true,
    label: "布局",
    acceptChildStrategy: { strategy: "blackList", "blackList": [] },
    propItemsRely: {
      propItemRefs: [
        {
          propID: "prop_flex_config",
          editAttr: ["span"],
          defaultValues
        }
      ]
    }
  };
};


export const makeLayoutEntity = (getPropItemMeta) => {
  return makeWidgetEntity({
    widgetRef: "FlexLayoutContainer",
    label: "布局容器",
    body: [
      makeWidgetEntity(flexLayoutMeta({
        span: 24
      }), getPropItemMeta),
      makeWidgetEntity(flexLayoutMeta({
        span: 12
      }), getPropItemMeta),
      makeWidgetEntity(flexLayoutMeta({
        span: 12
      }), getPropItemMeta),
    ],
  }, getPropItemMeta);
};