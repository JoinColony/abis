import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { resolve as resolvePath, basename } from 'path';
import { promisify } from 'util';
import rimraf from 'rimraf';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import fg from 'fast-glob';
import { sync as mkdirpSync } from 'mkdirp';
import _ from 'lodash';

const LATEST_TAG = 'glwss3';

const DEPLOY_CONTRACTS = ['MetaTxToken', 'TokenAuthority'];

const ARTIFACTS_DIR = resolvePath(
  __dirname,
  '../vendor/colonyNetwork/build/contracts',
);

const OUTPUT_DIR = resolvePath(__dirname, '../dist/versions');
const EVENTS_DIR = resolvePath(__dirname, '../dist/events');

// Simplified event ABI node
type Event = {
  inputs: { name: string; type: string }[];
  name: string;
  type: 'event';
};

const stringifyInputTypes = (event: Event) =>
  JSON.stringify(event.inputs.map(({ type }) => type));

// Some newer versions of the compiler add extra stuff that prevents a deep equal comparison
const eventsAreEqual = (eventA: Event, eventB: Event) =>
  eventA.name === eventB.name &&
  stringifyInputTypes(eventA) === stringifyInputTypes(eventB);

// This builds artificial ABIs that contain all events across all versions of a versioned contract. Exact duplicates are discarded
const buildEventsAbis = async () => {
  const eventsAbis: Record<string, Event[]> = {};
  readdirSync(OUTPUT_DIR).forEach((tag: string) => {
    readdirSync(resolvePath(OUTPUT_DIR, tag)).forEach((filename) => {
      const file = resolvePath(OUTPUT_DIR, tag, filename);
      const contractName = basename(file, '.json');
      try {
        statSync(file);
        const { abi } = JSON.parse(readFileSync(file).toString());
        if (!eventsAbis[contractName]) {
          eventsAbis[contractName] = [];
        }
        eventsAbis[contractName] = _.uniqWith(
          eventsAbis[contractName].concat(
            abi.filter(({ type }: { type: string }) => type === 'event'),
          ),
          eventsAreEqual,
        );
      } catch {
        // ignore
      }
    });
  });
  Object.entries(eventsAbis).forEach(([contractName, events]) => {
    const abi = {
      contractName,
      abi: events,
    };
    mkdirpSync(EVENTS_DIR);
    writeFileSync(
      resolvePath(EVENTS_DIR, `${contractName}Events.json`),
      JSON.stringify(abi),
    );
  });
};

const extract = async () => {
  const { argv } = yargs(hideBin(process.argv)).options({
    inputDir: { alias: 'i', type: 'string', default: ARTIFACTS_DIR },
    tag: { alias: 't', type: 'string', default: LATEST_TAG },
  });

  const args = await argv;
  let { inputDir } = args;
  const { tag } = args;

  if (inputDir !== ARTIFACTS_DIR) {
    inputDir = resolvePath(process.cwd(), inputDir);
  }
  const inputDirToken = resolvePath(
    inputDir,
    '../../lib/colonyToken/build/contracts',
  );

  const outputDir = resolvePath(OUTPUT_DIR, tag);
  await promisify(rimraf)(outputDir);
  mkdirpSync(outputDir);

  const inputArtifacts = await fg(`${inputDir}/*.json`);
  const inputTokenArtifacts = await fg(`${inputDirToken}/*.json`);
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
  if (tag === LATEST_TAG) {
        buildEventsAbis();
    }
};

extract();
