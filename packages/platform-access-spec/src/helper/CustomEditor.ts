// import deepmerge from 'deepmerge';
import { CustomEditorMeta } from "..";
import { mergeDeep } from '../deepmerge';

export const CustomEditor = (meta: CustomEditorMeta) => {
  const resData = { ...meta };
  return (SrouceClass): any => {
    return mergeDeep<CustomEditorMeta>(resData, new SrouceClass(meta));
  };
};
