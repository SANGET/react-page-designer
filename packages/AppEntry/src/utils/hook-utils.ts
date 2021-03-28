/* eslint-disable react-hooks/rules-of-hooks */
import { GroupPanelData } from "@provider-app/page-visual-editor-engine/components/GroupPanel";
import { EditableWidgetMeta, EditableExpMeta } from "@provider-app/platform-access-spec";
import {
  getCustomEditor,
  getWidgetMetadata,
  getWidgetPanelData,
} from "@provider-app/provider-app-common/services/widget-loader";
import { getExpMetadata } from "@provider-app/provider-app-common/services/exp-loader";
import React, { useState, useEffect } from "react";

export const useResourceFac = <T>(api) => {
  const resourceCache = {};
  return (resID = ""): [boolean, T] => {
    const [ready, setReady] = useState(!!resourceCache[resID]);
    useEffect(() => {
      api(resID).then((res) => {
        resourceCache[resID] = res;
        setReady(true);
      });
    }, []);
    return [ready, resourceCache[resID]];
  };
};

export const useWidgetMeta = useResourceFac<EditableWidgetMeta>(
  getWidgetMetadata
);

export const useExpMeta = useResourceFac<EditableExpMeta[]>(getExpMetadata);

// const widgetMetaCache = {};
// export const useWidgetPanelData = (resID) => {
//   const [ready, setReady] = useState(!!widgetMetaCache[resID]);
//   useEffect(() => {
//     loadPlatformWidgetMeta(resID).then((res) => {
//       console.log(res);
//       widgetMetaCache[resID] = res;
//       setReady(true);
//     });
//   }, []);
//   return [
//     ready, widgetMetaCache[resID]
//   ];
// };
export const useWidgetPanelData = useResourceFac<GroupPanelData>(
  getWidgetPanelData
);

export const useCustomEditor = useResourceFac<GroupPanelData>(getCustomEditor);
// export const useWidgetMeta = (widgetType: string): [boolean, EditableWidgetMeta] => {
//   const [ready, setReady] = useState(!!widgetCache[widgetType]);
//   useEffect(() => {
//     loadPlatformWidgetMeta(widgetType).then((widget) => {
//       widgetCache[widgetType] = widget;
//       setReady(true);
//     });
//   }, []);
//   return [
//     ready, widgetCache[widgetType]
//   ];
// };
