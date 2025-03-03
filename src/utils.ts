import _ from 'lodash';
import { type AbiEvent, type AbiFunction, type Abi } from 'abitype';

export type MergeType = 'events' | 'functions';

export type AbiNode = AbiEvent | AbiFunction;

const stringifyInputTypes = (node: AbiNode) =>
  JSON.stringify(node.inputs.map(({ type }) => type));

// Some newer versions of the compiler add extra stuff that prevents a deep equal comparison
const nodesAreEqual = (nodeA: AbiNode, nodeB: AbiNode) =>
  nodeA.name === nodeB.name &&
  stringifyInputTypes(nodeA) === stringifyInputTypes(nodeB);

export const joinAbis = (abiA: Abi, abiB: Abi, nodeType: MergeType) => {
  return _.uniqWith(
    (abiA as AbiNode[]).concat(
      (abiB as AbiNode[]).filter(
        ({ type }: { type: string }) => type === nodeType,
      ),
    ),
    nodesAreEqual,
  );
};
