import { Tab, Tabs } from "@deer-ui/core/tabs";
import React from "react";

import { PageActionSelector } from "./PageActionSelector";
// import { PageAttachedTableSelector } from "./PageAttachedTableSelector";
import { PageEventSelector } from "./PageEventSelector";
import { PageVariableSelector } from "./PageVariableSelector";

// import { PageButtonSelector } from "./PageButtonSelector";
// import { PageEventSelectorForLowCode } from "./PageEventSelectorForLowCode";
// import { PageWidgetSelector } from "./PageWidgetSelector";
// import { PageCommonFuncSelector } from "./PageCommonFuncSelector";

export interface PageConfigContainerProps {
  defaultTab?: number;
  flatLayoutItems;
  pageMetadata;
  platformCtx;
  pageState;
  changePageState;
  updateEntityState;
  delEntity;
}

export const PageConfigContainer: React.FC<PageConfigContainerProps> = (
  props
) => {
  const { defaultTab, ...propForPage } = props;
  return (
    <div className="page-config-container p-5 pt-0" id="pageConfigContainer">
      <Tabs withContent defaultTab={defaultTab}>
        <Tab label="页面动作">
          <PageActionSelector {...propForPage} />
        </Tab>
        <Tab label="变量">
          <PageVariableSelector {...propForPage} />
        </Tab>
        {/* <Tab label="页面事件-低代码">
          <PageEventSelectorForLowCode {...propForPage} />
        </Tab> */}
        {/* <Tab label="页面按钮">
          <PageButtonSelector {...propForPage} />
        </Tab>
        <Tab label="页面控件">
          <PageWidgetSelector {...propForPage} />
        </Tab> */}
        {/* <Tab label="通用函数">
          <PageCommonFuncSelector {...propForPage} />
        </Tab> */}

        {/* <Tab label="页面事件">
          <PageEventSelector {...propForPage} />
        </Tab> */}
        {/* <Tab label="附属表">
          <PageAttachedTableSelector {...propForPage} />
        </Tab> */}
      </Tabs>
    </div>
  );
};
