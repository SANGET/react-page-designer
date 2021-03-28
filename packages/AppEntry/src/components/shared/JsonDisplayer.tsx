import { loadPropItemMetadata } from "@provider-app/provider-app-common/services/widget-loader";
import React from "react";

export function syntaxHighlight(json) {
  json = json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    function (match) {
      let cls = "number";
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = "key";
        } else {
          cls = "string";
        }
      } else if (/true|false/.test(match)) {
        cls = "boolean";
      } else if (/null/.test(match)) {
        cls = "null";
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

export const prepareData = async () => {
  const [propItemData] = await Promise.all([loadPropItemMetadata()]);

  return propItemData;
};

export const JSONDisplayer = ({ jsonData }) => {
  return (
    <pre
      dangerouslySetInnerHTML={{
        __html: syntaxHighlight(JSON.stringify(jsonData, null, 2)),
      }}
    ></pre>
  );
};
