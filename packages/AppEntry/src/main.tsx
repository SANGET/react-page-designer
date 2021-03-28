import VisualEditorStoreConnector from "@provider-app/page-visual-editor-engine/core/visual-app-connector";
import { ProviderPageHOC } from "@provider-app/platform-access-spec";
import PageDesigner from "./app";

/**
 * 注册业务组件
 */

const App: ProviderPageHOC = (props) => {
  const { appLocation, pagePath } = props;
  return VisualEditorStoreConnector(PageDesigner, pagePath);
};

export default App;
