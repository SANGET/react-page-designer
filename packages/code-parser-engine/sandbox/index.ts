import ProxySandbox from "./src/proxySandbox";
import { IOptions } from "./src/interfaces";

export default function createSandbox(context: any, options: IOptions) {
  if(window.Proxy) context = new ProxySandbox(context, options = {}).proxy;
  const sandbox = (script: string) => {
    try {
      // eslint-disable-next-line no-new-func
      return new Function('context', `with (context) { return (async function(){ return ${script}})()}`)(context);
    } catch (error) {
      return error;
    }
  };
  sandbox.context = context;
  sandbox.exec = sandbox;
  return sandbox;
}
