import React, { useState, useEffect } from 'react';
// import * as AllIconsAI from "react-icons/ai";
// import * as AllIconsBI from "react-icons/bi";
// import * as AllIconsBS from "react-icons/bs";
// import * as AllIconsCG from "react-icons/cg";
// import * as AllIconsDI from "react-icons/di";
// import * as AllIconsFA from "react-icons/fa";
// import * as AllIconsFC from "react-icons/fc";
// import * as AllIconsFI from "react-icons/fi";
// import * as AllIconsGI from "react-icons/gi";
// import * as AllIconsGO from "react-icons/go";
// import * as AllIconsGR from "react-icons/gr";
// import * as AllIconsHI from "react-icons/hi";
// import * as AllIconsIM from "react-icons/im";
// import * as AllIconsIO from "react-icons/io";
// import * as AllIconsMD from "react-icons/md";
// import * as AllIconsRI from "react-icons/ri";
// import * as AllIconsWI from "react-icons/wi";
// import * as allIcons from "react-icons/all";

// TODO: 将 react icons 的名称填满
export type ReactIconType = 'react-icons/all' |
'react-icons/ri' |
'react-icons/fi' |
'react-icons/bi'

const allIconsCollectionCache = {};
export const loadReactIcon = (reactIconType: ReactIconType) => {
  return new Promise((resolve, reject) => {
    if (allIconsCollectionCache[reactIconType]) resolve(allIconsCollectionCache[reactIconType]);

    switch (reactIconType) {
      // case 'react-icons/all':
      //   import(/* webpackChunkName: "react_icons_all" */'react-icons/all').then(resolve);
      //   break;
      case 'react-icons/ri':
        import(/* webpackChunkName: "react_icons_ri" */'react-icons/ri').then(resolve);
        break;
      case 'react-icons/bi':
        import(/* webpackChunkName: "react_icons_bi" */'react-icons/bi').then(resolve);
        break;
      case 'react-icons/fi':
        import(/* webpackChunkName: "react_icons_bi" */'react-icons/fi').then(resolve);
        break;
      default:
    }
  });
};
export const useIcon = (reactIconType: reactIconType) => {
  const iconsCache = allIconsCollectionCache[reactIconType];
  const [ready, setReady] = useState(!!iconsCache);
  useEffect(() => {
    if (ready) return;
    const r = (icons) => {
      allIconsCollectionCache[reactIconType] = icons;
      setReady(true);
    };
    loadReactIcon(reactIconType)
      .then((icons) => {
        allIconsCollectionCache[reactIconType] = icons;
        setReady(true);
      });
  }, []);
  return [
    ready,
    allIconsCollectionCache[reactIconType]
  ];
};
