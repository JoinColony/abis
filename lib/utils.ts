import { uniqWith } from 'lodash';
import { AbiEvent, AbiFunction, type Abi } from 'abitype';

export type NodeType = 'event' | 'function';

export type AbiNode = AbiEvent | AbiFunction;

const stringifyInputTypes = (node: AbiNode) =>
  JSON.stringify(node.inputs.map(({ type }) => type));

// Some newer versions of the compiler add extra stuff that prevents a deep equal comparison
const nodesAreEqual = (nodeA: AbiNode, nodeB: AbiNode) =>
  nodeA.name === nodeB.name &&
  stringifyInputTypes(nodeA) === stringifyInputTypes(nodeB);

export const joinAbis = (abiA: Abi, abiB: Abi, nodeType: NodeType) => {
  return uniqWith(
    (abiA as AbiNode[]).concat(
      (abiB as AbiNode[]).filter(({ type }: { type: string }) => type === nodeType),
    ),
    nodesAreEqual,
  );
};

