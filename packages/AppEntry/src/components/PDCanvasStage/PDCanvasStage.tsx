import React from "react";
import CanvasStage from "@provider-app/page-visual-editor-engine/components/CanvasStage";
// import Sortable from "sortablejs";
import { StageContext } from "@provider-app/page-visual-editor-engine/utils/stage-context";
import { PDdragableItemOfStageWrapper } from "../PDdragableItemOfStageWrapper";
import { PDDragableItemTypes } from "../../const";
import { getPropItemMeta } from "../../services";

const PDCanvasStage = (props) => {
  return (
    <StageContext.Consumer>
      {(stageCtx) => {
        return (
          <div style={{ height: "100%" }}>
            <CanvasStage
              stageCtx={stageCtx}
              dragableItemWrapper={PDdragableItemOfStageWrapper}
              getPropItemMeta={getPropItemMeta}
              triggerCondition={(dragItem) => {
                return (
                  dragItem && dragItem.type === PDDragableItemTypes.staticWidget
                );
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
      }}
    </StageContext.Consumer>
  );
};

export default PDCanvasStage;
