import { GenMetaRefID, metaIDSeperator } from "@provider-app/platform-access-spec";


/**
 * 生成 meta 引用 ID，规则
 * 1. [metaAttr].[widgetEntityID].[nanoID]
 */
export const genMetaRefID: GenMetaRefID = (
  metaAttr, 
  options
) => {
  if (!metaAttr) throw Error('请传入 metaAttr，否则逻辑无法进行');
  const { idStrategy } = options || {};
  const _extraInfo = idStrategy ? (Array.isArray(idStrategy) ? idStrategy : [idStrategy]) : null;
  const _extraInfoStr = _extraInfo ? _extraInfo.join(metaIDSeperator) : '';
  let prefix = '';
  /**
   * meta id 生成策略与规则
   */
  switch (metaAttr) {
    case 'dataSource':
      // return this.genDatasourceMetaID();
      // _extraInfoStr = dsID ? dsID : '';
      // return `ds.${dsID}`;
      prefix = 'ds';
      break;
    case 'schema':
      // _relyWidget = true;
      prefix = 'schema';
      break;
      // return `schema.${_extraInfoStr}`;
    case 'varRely':
      // _relyWidget = true;
      prefix = 'var';
      break;
      // return `var.${_extraInfoStr}`
    case 'actions':
      prefix = 'act';
      break;
      // return `act.${_extraInfoStr}`
    default:
  }
  // return `${prefix}.${_extraInfoStr}`;
  const idArr = [
    prefix,
    _extraInfoStr,
  ].filter(i => !!i);
  return idArr.join(metaIDSeperator);
  // return `${prefix}.${activeEntityID}${idStrategy ? `.${idStrategy}` : ''}${nanoID ? `.${nanoID}` : ''}`;
};