# Circulation Manager Administrative Interface

This is the E-kirjasto fork of the [The Palace Project](https://thepalaceproject.org) Palace Manager Administrative Interface (which is a fork of
[Library Simplified](http://www.librarysimplified.org/) Circulation Manager Administrative Interface).

## Set Up

This package may be used in a local build of the E-kirjasto [Circulation Manager](https://github.com/NatLibFi/ekirjasto-circulation), or it may be run against a remote Circulation Manager.

This project uses Node.js 18. We recommend the latest version of Node.js 18.

You have a number of options for installing Node.js. One convenient way on macOS is to use Homebrew and nvm to manage Node.js versions.

Install Homebrew if you have not already:

```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Install nvm using Homebrew:

```
brew install nvm
```

Install and use the latest version of Node.js 18, e.g. 18.14.2 with nvm:

```
nvm install 18.14.2
nvm use 18.14.2
```

Alternatively, you can use `nodenv` on macOS:

```
brew install nodenv
nodenv install 18.14.2
nodenv global 18.14.2
```

If you have different projects requiring different Node.js versions, you can use nodenv to set a local version for the project by navigating to the root directory of ekirjasto-circulation-admin and executing `nodenv local 18.14.2`.

You can also use the `n` npm package to manage Node.js versions, or simply install the Node.js binary directly.

This project uses the latest version of npm. You can update npm with `npm update -g npm`. You can confirm the versions of Node.js and npm you are using with `node --version` and `npm --version`.

Once you have installed the correct versions of Node.js and npm, run `npm i` to install all dependencies.

#### Use npm-Published Version in a Local Circulation Manager

Suggested local folder setup:

- `/[path to project folder]/ekirjasto-circulation`

To use the published version with your circulation manager, run `npm install` from `api/admin` in the `ekirjasto-circulation` local installed repository.

#### Use Local Development Version in a Local Circulation Manager

Follow the Circulation Manager README instructions before setting up this repository.

Suggested local folder setup:

- `/[path to project folder]/ekirjasto-circulation`
- `/[path to project folder]/ekirjasto-circulation-admin`

If you're working on the administrative interface and want to test local changes, you can link your local clone of this repository to your local circulation manager. These steps will allow you to work on the front-end administrative interface and see updates while developing.

1. Run `npm link` in this `ekirjasto-circulation-admin` repository,
2. run `npm link @natlibfi/ekirjasto-circulation-admin` from `api/admin` in the `ekirjasto-circulation` repository (which is where package.json is located),
3. run the circulation manager using `python app.py` at the root in the `ekirjasto-circulation` repository,
4. run the web interface using `npm run dev` at the root of this `ekirjasto-circulation-admin` repository,
5. use docker-compose in the `ekirjasto-circulation` repository to run PostgreSQL, OpenSearch etc.
6. visit `localhost:6500/admin/`.

Webpack will take care of compiling and updating any new changes made locally for development. Just hard refresh the page (command + shift + R) to see updates without having to restart either the `ekirjasto-circulation` or `ekirjasto-circulation-admin` servers.

#### Use Local Development Version with a Remote Circulation Manager

This front-end may be run locally in development against a remote Circulation Manager back-end. This removes the need to build a local Circulation Manager from source in order to work on the front-end.

1. Run `npm run dev-server -- --env=backend=[url]` in this `ekirjasto-circulation-admin` repository.

   Example: `npm run dev-server -- --env=backend=https://gorgon.tpp-qa.lyrasistechnology.org`

   Note: The tortured syntax here results from going through npm and webpack. The first `--` separates arguments intended for npm from arguments intended for the script that npm runs. In this case the script executes webpack, which allows an environment object to be supplied on the command line using `--env`. Properties of the environment object are specified using the `--env=[property]=[value]` syntax.

1. Visit `http://localhost:8080/admin/`.
1. Log in using credentials for the CM back-end. Content from that Circulation Manager should appear.

This works by running a local proxy server. HTML pages received from the Circulation Manager that load assets from the `ekirjasto-circulation-admin` package on jsdelivr are rewritten to load them from the local webpack build instead.

Webpack will take care of compiling and updating any new changes made locally for development. Hot module replacement and live reloading are enabled, so the browser will automatically update as changes are made.

## Web Catalog

The Circulation Manager administrative interface relies on the [OPDS Web Catalog](https://github.com/ThePalaceProject/web-opds-client) as its base React component and application. For more information, please check out that repository.

## Publishing a New Release

This package is [published to NPM](https://www.npmjs.com/package/@natlibfi/ekirjasto-circulation-admin). To publish a new version, create a new release in GitHub. For new version numbers, you can refer to [Semantic Versioning](https://semver.org/) (major.minor.patch). The NPM build and publish will be done by GitHub Actions.

## Accessibility

In order to develop user interfaces that are accessible to everyone, there are tools added to the workflow. Besides the Typescript `tslint-react-a11y` plugin, `react-axe` is also installed for local development. Using that module while running the app uses a lot of resources so it should be only when specifically testing for accessibility and not while actively developing new features or fixing bugs.

In order to run the app with `react-axe`, run `npm run dev-test-axe`. This will add a local global variable `process.env.TEST_AXE` (through webpack) that will trigger `react-axe` in `/src/index.tsx`. The output will be seen in the _browser's_ console terminal.

## Tests

### Unit Tests

Like the codebase, all the unit tests are written in Typescript. Tests are written for all React components as well as redux and utility functions. Older tests are run using mocha and these tests can be found in the `__tests__` folders littered throughout the `src` tree. All new tests should be written using jest and placed in the `tests/jest` directory. The directory structure in `tests/jest` should mirror the structure in `src`.

To run the tests, perform `npm test`.

We use GitHub Actions for continuous integration. Any pull requests submitted must have tests and those tests must pass on GitHub Actions.

#### E-kirjasto Unit Tests

E-kirjasto-specific Jest tests are in folder `/src/finland/tests`. To run them locally, use command `npm test-finland`.

### Nightwatch

_(NOTE: Nightwatch is currently not configured for the E-kirjasto fork.)_

There are end-to-end tests that run on Nightwatch. This selenium-based test runner allows us to include integration tests for logging into the admin and clicking through different pages.

To set up credentials and run the tests, check out the [README](/tests/README.md) in `/tests/.

## Debugging

The [Redux DevTools browser extension](https://github.com/reduxjs/redux-devtools/tree/main/extension) may be used to easily inspect app states and state transitions.

## License

```
Copyright © 2021 The New York Public Library, Astor, Lenox, and Tilden Foundations

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
