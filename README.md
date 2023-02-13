# abis

Farm fresh Colony ABIs.

## Generating the contract ABIs

First we need to create the relevant contract ABIs and store them in this repo (these are just `.json` files containing information about the contract interfaces. We will be generating them in the `colonyNetwork` repo which is a submodule of this repository.

Make sure you have the correct node version

```bash
nvm use
```

Go into the `vendor/colonyNetwork` subdirectory and check out the correct tag for the latest ColonyNetwork version (here `glwss`):

```bash
cd vendor/colonyNetwork
git checkout glwss
```

Update all git submodules and install all dependencies (see also [this guide](https://docs.colony.io/colonynetwork/quick-start)):

```bash
git submodule update --recursive
npm ci
```

Prepare the token submodule (and delete any existing build artifacts):

```bash
cd lib/colonyToken
npm ci # again, make sure you're running the correct node version (with nvm)
rm -rf build/contracts/*.json # to remove any prior builds
git reset --hard # to recover the pinned (checked in) contracts
npx truffle compile
```

You will need Docker installed and running to compile the contracts. It is however possible to disable Docker for the builds, see [here](https://docs.colony.io/colonynetwork/quick-start) for more information.

Then back in the `vendor/colonyNetwork` submodule:

```bash
rm -rf build/contracts/*.json # to remove any prior builds
npx truffle compile
```

Now we should have all the necessary contract ABIs ready. Next we extract those using the `build` command. Specify the network tag to create the corresponding sub-directory:

```bash
cd ../.. # go back to the colonyJS root folder
npm run build -- -t=glwss
```

That process should be fairly quick. A directory called `abis/glwss` should have been created, containing all the required ABIs for the next version (and more).
