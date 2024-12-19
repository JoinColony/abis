import { uniqWith } from 'lodash';

export type NodeType = 'event' | 'function';

// Simplified ABI node for events or functions
export type AbiNode = {
  inputs: { name: string; type: string }[];
  name: string;
  type: NodeType;
};

const stringifyInputTypes = (node: AbiNode) =>
  JSON.stringify(node.inputs.map(({ type }) => type));

// Some newer versions of the compiler add extra stuff that prevents a deep equal comparison
const nodesAreEqual = (nodeA: AbiNode, nodeB: AbiNode) =>
  nodeA.name === nodeB.name &&
  stringifyInputTypes(nodeA) === stringifyInputTypes(nodeB);

export const joinAbis = (abiA: AbiNode[], abiB: AbiNode[], nodeType: NodeType) => {
  return uniqWith(
    abiA.concat(
      abiB.filter(({ type }: { type: string }) => type === nodeType),
    ),
    nodesAreEqual,
  );
};

