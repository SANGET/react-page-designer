import React from 'react';
import { InputNumber } from 'antd';
import classnames from "classnames";
import './style.scss';

export const InputNumberWithSuffix = (props)=>{
  const { className, Suffix, ...restProps } = props;
  const classes = classnames(["flex input-number-with-suffix", className]);
  return (
    <div className={classes}>
      <span className="flex">
        <InputNumber style={{ width: '100%' }} {...restProps}/>
      </span>
      <span className="suffix">{Suffix}</span>
    </div>
  );
};