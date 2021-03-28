/* eslint-disable no-param-reassign */
/**
 * 这里是根据具体业务的处理filter
 */

import { RequestClass, resolveUrl } from "@mini-code/request";
import { message as AntdMessage } from 'antd';

// import { clearDefaultParams, onNavigate, redirectToRoot } from "@hyc/multiple-tab-router";
import { authStore } from "../auth/actions";
import { HttpBusinessCodeMap } from "./http-business-code-map";

/**
 * 后端返回的数据结构
 */
export interface ResStruct {
  code: string
  message: string
  results?: any
  result?: any
}

const urlPrefix = 'paas';
let baseReqUrl = '';

/**
 * 设置请求平台服务的 api 地址
 */
export const setPlatformApiUrl = (paasServerUrl: string) => {
  baseReqUrl = resolveUrl(paasServerUrl, urlPrefix);
  $R.setConfig({
    baseUrl: baseReqUrl
  });
};

/**
 * 根据业务扩展的 http 请求工具的类型
 */
export interface RExtend extends RequestClass<ResStruct, RequestOptions> {
  urlManager: typeof urlManager
}

interface BusinessTip {
  /** 提示的类型 */
  type?: 'error' | 'success' | 'info'
  /** 弹出的提示的类型，是顶部提示或者是右上角提示 */
  tipType?: 'toast' | 'notify'
  /** 当业务编码等于 xx 的时候显示，如果为空，则认为不是成功的业务码都弹出 */
  whenCodeEq?: string
}

export interface RequestOptions {
  /** 是否显示成功的信息 */
  showSuccessTip?: boolean
  /** 业务提示 */
  businessTip?: BusinessTip
}

const $R = new RequestClass({
  // baseUrl: `${baseReqUrl}`
}) as RExtend;

/**
 * URL 管理器，根据实际业务需求设置 URL
 */
class UrlManager {
  currLessee = ''

  currApp = ''

  /** 登录后需要设置 */
  setLessee = (lessee: string) => {
    this.currLessee = lessee;
    this.setRequestBaseUrl();
  }

  /** 选择应用后需要设置 */
  setApp = (app: string) => {
    this.currApp = app;
    this.setRequestBaseUrl();
  }

  /** 登出的时候需要设置 */
  reset = () => {
    this.currApp = '';
    this.currLessee = '';
    /** 清除默认 params */
    // clearDefaultParams();
    $R.setConfig({
      baseUrl: baseReqUrl
    });
  }

  getUrl = () => {
    return resolveUrl(baseReqUrl, this.currLessee, this.currApp);
  }

  setRequestBaseUrl = () => {
    $R.setConfig({
      baseUrl: this.getUrl()
    });
  }
}

const urlManager = new UrlManager();

$R.urlManager = urlManager;

const resetHttpReqHelper = () => {
  $R_P.urlManager.reset();
};

/**
 * 前端应该与服务端的接口分离
 * 通过此方法实现对接远端需要的 request 数据
 */
// const beforeReq = (beforeData) => {
//   console.log('beforeData', beforeData);
//   return beforeData;
// };

/**
 * 前端应该与服务端的接口分离
 * 通过此方法实现对接 response 数据
 */
// const afterRes = (resData, other) => {
//   console.log('resData', resData);
//   console.log('other', other);
//   return resData;
// };

/** 使用 $R 的中间件 */
// $R.useAfter([afterRes]);

const getUrlFormRes = (resDetail) => {
  const reqUrlInfo = resDetail.__originRes.url;
  return reqUrlInfo;
};

const getReqPrefix = (resDetail) => {
  const reqUrl = getUrlFormRes(resDetail);
  const prefix = reqUrl.replace(/https?:\/\//, '').split('/')[1];
  // console.log(prefix);
  return prefix;
};

/**
 * 统一处理 http 业务码的函数
 * 1. 如果有 showSuccessTip 配置，则解析完成后退出流程
 * 2. 如果有 businessTip 配置，则解析完成后退出流程
 * 3. 默认的 http 处理，这里根据时机情况再做调整
 */
function handleRes({ res, resDetail }) {
  // return console.log('resData', resData);
  const { code, msg } = res;
  const { businessTip, showSuccessTip } = resDetail.__originReq;
  if (showSuccessTip) {
    if (code === HttpBusinessCodeMap.success) {
      AntdMessage.success(msg);
      return null;
    }
  }
  if (businessTip) {
    const { whenCodeEq, type = 'info' } = businessTip as BusinessTip;
    if (code === whenCodeEq) {
      const antdMsgFunc = AntdMessage[type] || AntdMessage.info;
      const reqPrefix = getReqPrefix(resDetail);
      antdMsgFunc(`${reqPrefix}: ${msg}`);
      return null;
    }
  }
  /** 如果没有配置，默认所有错误都弹出 */
  switch (code) {
    case HttpBusinessCodeMap.success:
      // console.log('成功');
      break;
    case 'A0300':
      // console.log(resData);
      // 处理没找到应用的业务逻辑
      AntdMessage.error(`${getReqPrefix(resDetail)}服务: ${msg}`);
      // redirectToRoot();
      authStore.setState({ isLogin: false });
      resetHttpReqHelper();
      // onNavigate({
      //   type: 'PUSH',
      //   path: '/login',
      //   useDefaultParams: false
      // });
      break;
    default:
      // TODO: 完善请求
      AntdMessage.error(`${getReqPrefix(resDetail)}服务: ${msg}`);
  }
  return null;
}

const handleErr = (e) => {
  console.log(e);
};

/**
 * 监听 $R res 处理函数
 */
$R.on('onRes', handleRes);

/** 处理网络异常 */
$R.on("onErr", handleErr);

const $request = $R;

export { $request, $R };

export type $Request = typeof $R

declare global {
  const $R_P: typeof $R;
  interface Window {
    /** Request helper for Provider app，简写 R_P，$ 是全局变量前缀, 生产工具的 HTTP 请求助手 */
    $R_P: $Request;
  }
}

/**
 * 定义不可被更改的 $R_P 属性
 */
Object.defineProperties(window, {
  $R_P: {
    get() {
      return $R;
    },
    set() {
      return false;
    }
  }
});
