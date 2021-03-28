interface IType {
  [key: string]: string | number
}
interface IConfig {
  id?: string
  pid?: string
  children?: string

  mapping?: IType
  nodeDecorator?: (node) => void
}

/**
 * constrcut 方法
 * 根据提供的 id, pid 和 children 将一个个节点构建成一棵或者多棵树
 * @param nodes 节点对象
 * @param config 配置对象
 */
export function construct(nodes: any[], config?: IConfig) {
  const id = config && config.id || 'id';
  const pid = config && config.pid || 'pid';
  const children = config && config.children || 'children';
  const mapping = config && config.mapping || {};
  const nodeDecorator = config && config.nodeDecorator || null;
  const idMap = {};
  const jsonTree: IConfig[] = [];

  nodes.forEach((node) => { node && (idMap[node[id]] = node); });
  nodes.forEach((node) => {
    if (node) {
      /** 额外的修饰效果 */
      if(nodeDecorator) {
        nodeDecorator(node);
      }
      Object.keys(mapping).map((item) => {
        // eslint-disable-next-line no-param-reassign
        node[item] = node[mapping[item]];
        return node;
      });
      const parent = idMap[node[pid]];
      if (parent) {
        !parent[children] && (parent[children] = []);
        parent[children].push(node);
      } else {
        jsonTree.push(node);
      }
    }
  });
  return jsonTree;
}

export {
  construct as contructTree
};

/**
 * destruct 方法
 * 根据配置的 id, pid 和 children 把解构化的树型对象拆解为一个个节点
 * @param forest 单个或者多个树型对象
 * @param config 配置
 */
export function destruct(forest: {[key: string]: string }[] | unknown, config?: IConfig) {
  const id = config && config.id || 'id';
  const pid = config && config.pid || 'pid';
  const children = config && config.children || 'children';

  function flatTree(tree) {
    const queue = [tree];
    const result: {[key: string]: string }[] = [];
    while (queue.length) {
      let currentNode = queue.shift() || {};
      // eslint-disable-next-line no-prototype-builtins
      if (currentNode.hasOwnProperty(id)) {
        // eslint-disable-next-line no-prototype-builtins
        if (!currentNode.hasOwnProperty(pid)) {
          currentNode = { ...currentNode, [pid]: null };
        }
        if (currentNode[children]) {
          currentNode[children].forEach((v) => { v && queue.push({ ...v, [pid]: currentNode[id] }); });
        }
        result.push(currentNode);
        delete currentNode[children];
      } else {
        throw new Error('you need to specify the [id] of the json tree');
      }
    }
    return result;
  }

  if (Array.isArray(forest)) {
    return forest.map((v) => flatTree(v)).reduce((pre, cur) => pre.concat(cur));
  }
  return flatTree(forest);
}

export default {
  construct,
  destruct,
};
