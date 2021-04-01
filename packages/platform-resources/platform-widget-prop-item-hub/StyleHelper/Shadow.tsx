import React, { useState, useEffect } from 'react';
import { Dropdown, Button, Menu } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { SHADOW, CUSTOMED, NO_SHADOW, BLUR } from './constants';
import { Width } from './Width';
import { ColorPicker } from './ColorPicker';
import { FormItem } from './FormItem';

export const Shadow = (props) => {
  const { value = NO_SHADOW, onChange } = props;
  const [customed, setCustomed] = useState(false);
  /** 初始化，是否展开自定义数据 */
  useEffect(()=>{
    if(value in SHADOW) return; 
    setCustomed(true);
  },[]);
  /** 用户选择固定数据 */
  const clickShadowPanel = (shadow) => {
    onChange(shadow);
    setCustomed(false);
  };
  /** 回显选中数据 */
  const getShadowSelectedKeys = () => {
    if(SHADOW[value]) return [value];
    return [CUSTOMED];
  };
  /** 用户决定自定义数据  */
  const clickCustomed = () => {
    setCustomed(true);
  };
  /** 渲染展示区域 */
  const getShadowShowValue = () => {
    if(value in SHADOW) return SHADOW[value];
    return '自定义';
  };
  const shadowShowValue = getShadowShowValue();
  /** 可选择面板 */
  const ShadowPanel = (
    <Menu className="horizontal-gutter-menu" selectedKeys={getShadowSelectedKeys()}>
      {Object.keys(SHADOW).map(key=>(
        <Menu.Item key={key} onClick={()=>{clickShadowPanel(key);}}>{SHADOW[key]}</Menu.Item>
      ))}
      {/* 自定义，各方向边距不统一 */}
      <Menu.Item key={CUSTOMED} onClick={clickCustomed}>自定义</Menu.Item>
    </Menu>
  );
  /** 自定义时获取对应数据 */
  const getIndexByKeyInCustomed = (key)=>{
    const keyMapIndex = {
      color: 4,
      hShadow: 0,
      vShadow: 1,
      blur: 2,
      spread: 3
    };
    const index = keyMapIndex[key];
    return index;
  };
  const getValueCustomed = (key) => {
    const index = getIndexByKeyInCustomed(key);
    if(index < 4) return value.split(' ')[index];
    /** 颜色这一位会比较特别，可能是 #fff 也可能是 rgba(31, 56, 88, 0.2) */
    return value.replace(/([^\s]*\s){4}/g,'');    
  };
  /** 自定义模式下的数据更改 */
  const changeCustomed = (key, attr) => {
    const index = getIndexByKeyInCustomed(key);
    let shadow = value;
    if(index < 4){
      const valueArr = value.split(' ');
      valueArr[index] = attr;
      shadow = valueArr.join(' ');
    }else {
      const untilColor = value.split(' ').slice(0,4);
      untilColor.push(attr);
      shadow = untilColor.join(' ');
    }
    onChange(shadow);
  };
  return (
    <>
      <Dropdown
        overlay={ShadowPanel}
      >
        <Button className="w-full flex">
          <span className="w-11/12 text-left">{shadowShowValue}</span>
          <DownOutlined/>
        </Button>
      </Dropdown>
      {customed && (
        <div className="mt-2 bg-gray-200 p-3">
          <FormItem title="颜色"  className="mb-2">
            <ColorPicker color={getValueCustomed('color')} pick={(color) => changeCustomed('color', color)}/>
          </FormItem>
          <FormItem title="X" className="mb-2">
            <Width value={getValueCustomed('hShadow')} onChange={(hShadow)=>changeCustomed('hShadow', hShadow)} options={BLUR} />
          </FormItem>
          <FormItem title="Y" className="mb-2">
            <Width value={getValueCustomed('vShadow')} onChange={(vShadow)=>changeCustomed('vShadow', vShadow)} options={BLUR} />
          </FormItem>
          <FormItem title="Blur" className="mb-2">
            <Width value={getValueCustomed('blur')} onChange={(blur)=>changeCustomed('blur', blur)} options={BLUR} />
          </FormItem>
          <FormItem title="Spread" className="mb-2">
            <Width value={getValueCustomed('spread')} onChange={(spread)=>changeCustomed('spread', spread)} options={BLUR} />
          </FormItem>
        </div>
      )}
    </>
  );
};