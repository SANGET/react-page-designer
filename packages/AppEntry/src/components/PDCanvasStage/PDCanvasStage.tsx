import React, { useContext } from "react";
import CanvasStage from "@provider-app/page-visual-editor-engine/components/CanvasStage";
import { PDdragableItemOfStageWrapper } from "../PDdragableItemOfStageWrapper";
import { PDDragableItemTypes } from "../../const";
import { getPropItemMeta } from "../../services";

const PDCanvasStage = (props) => {
  const { stageCtx, stageWidth } = props;
  return (
    <div style={{ height: "90vh" }}>
      <div
        className="stage-info text-gray-500 mx-auto"
        style={{ width: stageWidth }}
      >
        x: {stageWidth} px
      </div>
      <CanvasStage
        stageCtx={stageCtx}
        pageEntityState={{ style: { width: stageWidth } }}
        // styleForStage={{ width: 1000 }}
        dragableItemWrapper={PDdragableItemOfStageWrapper}
        getPropItemMeta={getPropItemMeta}
        triggerCondition={(dragItem) => {
          return dragItem && dragItem.type === PDDragableItemTypes.staticWidget;
        }}
        accept={[
          PDDragableItemTypes.containerWidget,
          PDDragableItemTypes.stageRealWidget,
          PDDragableItemTypes.staticWidget,
        ]}
        {...props}
      />
    </div>
  );
};

export default PDCanvasStage;
