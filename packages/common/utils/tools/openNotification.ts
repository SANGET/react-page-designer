import { notification, Modal } from 'antd';

const { confirm } = Modal;
/** 弹出提示 */
type IStatus = "success" | "info" | "warning" | "error"
export const openNotification = (type: IStatus, msg = "", description = "") => {
  notification?.[type]?.({
    message: msg,
    description
  });
};
/**
 * 更改表列表为 下拉框组件支持的数据格式
 * @param tables 表列表
 * @returns selectMenu 下拉框列表
 */
interface ITable {
  code: string
  name: string
  id: string
}

interface IDeleteConfirmParam {
  title?: string
  okText?: string
  cancelText?: string
  onOk?: ()=>void
  onCancel?: ()=>void
}
/**
 * 删除询问框
 *
 * @param {string} title 询问框标题
 * @param {string} okText 确定按钮名称
 * @param {string} cancelText 取消按钮名称
 * @param {function} onOk 点确定按钮执行的操作
 * @param {function} onCancel 点取消按钮执行的操作
 * @returns {void}
 */
export const deleteConfirm = (param: IDeleteConfirmParam): void => {
  const {
    title = '是否确定删除？', cancelText = '取消', okText = '确定', onOk, onCancel
  } = param || {};
  confirm({
    title,
    cancelText,
    okText,
    onOk() {
      onOk?.();
    },
    onCancel() {
      onCancel?.();
    },
  });
};
export const getlabelByMenuList = (menu: ISELECTSMENU[], value?: string): string => {
  return menu.filter((item) => item.value === value)[0]?.label || '';
};
