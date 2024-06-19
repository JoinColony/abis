import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { resolve as resolvePath, basename } from 'path';
import { promisify } from 'util';
import rimraf from 'rimraf';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import fg from 'fast-glob';
import { sync as mkdirpSync } from 'mkdirp';
import _ from 'lodash';

import { latest as LATEST_TAG } from '../dist/versions.json';

const DEPLOY_CONTRACTS = ['MetaTxToken', 'TokenAuthority'];

const ARTIFACTS_DIR = resolvePath(
  __dirname,
  '../vendor/colonyNetwork/artifacts/contracts',
);

const ARTIFACTS_DIR_TOKEN = resolvePath(
  __dirname,
  '../vendor/colonyNetwork/artifacts/colonyToken',
);

const OUTPUT_DIR = resolvePath(__dirname, '../dist/versions');

// Simplified ABI node for events or functions
type AbiNode = {
  inputs: { name: string; type: string }[];
  name: string;
  type: 'event' | 'function';
};

const stringifyInputTypes = (node: AbiNode) =>
  JSON.stringify(node.inputs.map(({ type }) => type));

// Capitalize the first letter of a string
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Some newer versions of the compiler add extra stuff that prevents a deep equal comparison
const nodesAreEqual = (nodeA: AbiNode, nodeB: AbiNode) =>
  nodeA.name === nodeB.name &&
  stringifyInputTypes(nodeA) === stringifyInputTypes(nodeB);

// This builds artificial ABIs that contain all nodes of a certain type across all versions of a versioned contract. Exact duplicates are discarded
const buildJoinedAbis = async (tag: string, nodeType: string) => {
  const targetDir =
    tag === 'next'
      ? resolvePath(__dirname, `../dist/${nodeType}s/next`)
      : resolvePath(__dirname, `../dist/${nodeType}s`);
  const nodeAbis: Record<string, AbiNode[]> = {};
  readdirSync(OUTPUT_DIR).forEach((tag: string) => {
    readdirSync(resolvePath(OUTPUT_DIR, tag)).forEach((filename) => {
      const file = resolvePath(OUTPUT_DIR, tag, filename);
      const contractName = basename(file, '.json');
      try {
        statSync(file);
        const { abi } = JSON.parse(readFileSync(file).toString());
        if (!nodeAbis[contractName]) {
          nodeAbis[contractName] = [];
        }
        nodeAbis[contractName] = _.uniqWith(
          nodeAbis[contractName].concat(
            abi.filter(({ type }: { type: string }) => type === nodeType),
          ),
          nodesAreEqual,
        );
      } catch(err) {
        console.error(err);
        // ignore
      }
    });
  });
  Object.entries(nodeAbis).forEach(([contractName, abi]) => {
    const result = {
      contractName,
      abi,
    };
    mkdirpSync(targetDir);
    writeFileSync(
      resolvePath(targetDir, `${contractName}${capitalize(nodeType)}s.json`),
      JSON.stringify(result),
    );
  });
};

const extract = async () => {
  const { argv } = yargs(hideBin(process.argv)).options({
    tag: { alias: 't', type: 'string', default: LATEST_TAG },
  });

  const args = await argv;
  const { tag } = args;


  const outputDir = resolvePath(OUTPUT_DIR, tag);
  await promisify(rimraf)(outputDir);
  mkdirpSync(outputDir);

  const inputArtifacts = await fg(`${ARTIFACTS_DIR}/**/!(*.dbg).json`);
  const inputTokenArtifacts = await fg(`${ARTIFACTS_DIR_TOKEN}/**/!(*.dbg).json`);
  const inputFiles = inputArtifacts.concat(inputTokenArtifacts);
  inputFiles.forEach((file) => {
    const { abi, contractName, bytecode, devdoc, userdoc } = JSON.parse(
      readFileSync(file).toString(),
    );
    const content = DEPLOY_CONTRACTS.includes(contractName)
      ? { contractName, abi, bytecode, devdoc, userdoc }
      : { contractName, abi, devdoc, userdoc };
    writeFileSync(
      resolvePath(outputDir, basename(file)),
      JSON.stringify(content, null, 4),
    );
  });
  if (tag === LATEST_TAG || tag === 'next') {
        buildJoinedAbis(tag, 'event');
        buildJoinedAbis(tag, 'function');
    }
};

extract();
