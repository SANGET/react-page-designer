import React, { useState, useEffect } from 'react';
import { Radio, Select } from 'antd';
import classnames from "classnames";
import { ColorPicker } from './ColorPicker';
import { FormItem } from './FormItem';
import { Width } from './Width';
import { BORDER_WIDTH, BORDER_STYLE } from './constants';

const ShowBox = (props)=>{
  const classes = classnames(["w-5 h-4 mt-2 bg-gray-300 box-border border-black", props.className]);
  return <div className={classes}></div>;
};
export const Border = (props) => {
  const [borderType, setBorderType] = useState('border');
  const { value, onChange } = props;
  const getDefaultValue = (key)=>{
    const defaultMap = {
      Width: '0px',
      Style: 'solid',
      Color: '#000'
    };
    return defaultMap[key];
  };
  const getBorder = () => {
    return value.border || '0px solid #000';
  };
  const getIndexByKey = (key) => {
    const borderMap = {
      Width: 0,
      Style: 1,
      Color: 2
    };
    const index = borderMap[key];
    return index;
  };
  const getValueInBorder = (key)=>{
    const index = getIndexByKey(key);
    return getBorder().split(' ')[index];
  };
  const getValueCustomed = (key) => {
    const correctKey = `${borderType}${key}`;
    if(correctKey in value){
      return value[correctKey];
    }
    if('border' in value){
      return getValueInBorder(key);
    }
    return getDefaultValue(key);
  };
  const changeCustomed = (key, attr) => {
    if(borderType === 'border'){
      const index = getIndexByKey(key);
      const borderArr = getBorder().split(' ');
      borderArr[index] = attr;
      const getBorderPrefix = () => {
        const target = {};
        const border = getBorder();
        Object.keys(border).filter(item=>/^border./.test(item)).forEach(item=>{
          target[item] = border[item];
        });
        return target;
      };
      const otherBorder = getBorderPrefix();
      onChange({
        ...value,
        border: borderArr.join(' '),
        ...otherBorder,
        /** 需要同步更改各边框数据 */
        [`borderTop${key}`]: attr,
        [`borderRight${key}`]: attr,
        [`borderBottom${key}`]: attr,
        [`borderLeft${key}`]: attr,
      });

    }else {
      onChange({
        ...value,
        [`${borderType}${key}`]: attr
      });
    }
    
  };
  return (
    <>  
      <Radio.Group value={borderType} onChange={(e)=> setBorderType(e.target.value)}>
        <Radio.Button value="border"><ShowBox className="border-2 mx-1"/></Radio.Button>
        <Radio.Button value="borderTop"><ShowBox className="border-t-2 mx-1"/></Radio.Button>
        <Radio.Button value="borderRight"><ShowBox className="border-r-2 mx-1"/></Radio.Button>
        <Radio.Button value="borderBottom"><ShowBox className="border-b-2 mx-1"/></Radio.Button>
        <Radio.Button value="borderLeft"><ShowBox className="border-l-2 ml-1"/></Radio.Button>
      </Radio.Group>
      <div className="panel p-3 bg-gray-200">
        <FormItem title="颜色" className="mb-2">
          <ColorPicker color={getValueCustomed('Color')} pick={(color) => changeCustomed('Color', color)}/>
        </FormItem>
        <FormItem title="宽" className="mb-2">
          <Width value={getValueCustomed('Width')} onChange={(width)=>changeCustomed('Width', width)} options = {BORDER_WIDTH}/>
        </FormItem>
        <FormItem title="线型" className="mb-2">
          <Select style={{ width: '100%' }} options={BORDER_STYLE} value={getValueCustomed('Style')} onChange={(style)=>changeCustomed('Style', style)}/>
        </FormItem>
      </div>
    </>
  );
};