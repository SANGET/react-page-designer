import { EditableWidgetMeta } from "@hyc/platform-access-spec";
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
    propItemsRely: {
      propItemRefs: [
      {
        "propID": "prop_grid_value",
        "editAttr": ["grid", "hGutter", "vGutter"],
        "defaultValues": { 
          "grid": [{ "span": 24 }, { "span": 12 }, { "span": 12 }],
          hGutter: 0,
          vGutter: 0
         }
      },
      {
        "propID": "prop_horizontal_gutter",
        "editAttr": ["hGutter"],
        "defaultValues": { "hGutter": 0 }
      },
      {
        "propID": "prop_vertical_gutter",
        "editAttr": ["vGutter"],
        "defaultValues": { "vGutter": 0 }
      },
      {
        "propID": "prop_style",
        "editAttr": ["style"],
        "defaultValues": { "style": { "width": "100%", "height": "120px", "margin": "0px", "padding": "0px", "backgroundColor": "transparent" } }
        
      }
    ] }
  }, getPropItemMeta);
};