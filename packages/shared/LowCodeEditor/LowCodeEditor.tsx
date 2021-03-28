import React, { Suspense } from "react";
import { Button } from "antd";
import { LowCodeSubmitOptions } from "@provider-app/platform-access-spec";
import { getDefaultLowcodeSnipet } from "@provider-app/provider-app-common/services";
import { LoadingTip } from "@provider-app/shared-ui";

// import MonacoEditor from "react-monaco-editor";
const MonacoEditor = React.lazy(() => import("react-monaco-editor"));

export interface LowCodeEditorProps {
  onSubmit?: (submitOptions: LowCodeSubmitOptions) => void;
  defaultValue?: {
    code: string;
  };
  language?: string;
  width?: string;
  height?: string;
  options?: {};
}

export class LowCodeEditor extends React.Component<
  LowCodeEditorProps,
  {
    code: string;
    ready: boolean;
  }
> {
  constructor(props) {
    super(props);
    const { defaultValue } = this.props;
    const defCode = defaultValue?.code || "";
    this.state = {
      code: defCode,
      ready: !!defCode,
    };
  }

  async componentDidMount() {
    if (!this.state.code) {
      const defaultCode = await getDefaultLowcodeSnipet();
      this.setState({
        code: defaultCode,
        ready: true,
      });
    }
  }

  onChange = (newValue, e) => {
    // console.log("onChange", newValue, e);
    this.setState({
      code: newValue,
    });
  };

  editorWillMount = (monaco) => {
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2016,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      typeRoots: ["node_modules/@types"],
      jsx: monaco.languages.typescript.JsxEmit.React,
      jsxFactory: "JSXAlone.createElement",
    });
  };

  editorDidMount = (editor, monaco) => {
    // editor.setPosition({ column: 1, lineNumber: 3 });
    editor.focus();
  };

  onSubmit = () => {
    const { code } = this.state;
    this.props.onSubmit?.({
      code,
    });
  };

  render() {
    const { code, ready } = this.state;
    const {
      language = "javascript",
      width = "800",
      height = "600",
      options = {
        selectOnLineNumbers: true,
        insertSpaces: false,
        tabSize: 2,
      },
    } = this.props;
    return (
      <Suspense fallback={<LoadingTip />}>
        <div className="low-code-editor" id="LowCodeEditorContainer">
          <Button onClick={this.onSubmit}>保存</Button>
          {ready && (
            <div className="flex">
              <div className="method-selector"></div>
              <div className="">
                <MonacoEditor
                  width={width}
                  height={height}
                  language={language}
                  // theme="vs-dark"
                  value={code}
                  options={options}
                  onChange={this.onChange}
                  editorDidMount={this.editorDidMount}
                  editorWillMount={this.editorWillMount}
                />
              </div>
            </div>
          )}
        </div>
      </Suspense>
    );
  }
}
