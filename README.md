# svg-to-excalidraw

Library to convert SVG to Excalidraw’s file format.

[![npm][npmshield]][npmpackage] [![JavaScript Style Guide][standardshield]][standard] [![license][licenseshield]][license]

## :book: Table of contents

- [:floppy_disk: Installation][installation]
- [:beginner: Usage][usage]
- [:game_die: Running tests][running-tests]
- [:busts_in_silhouette: Contributing][contributing]
- [:1234: Versioning][versioning]

## :floppy_disk: Installation

```bash
npm install svg-to-excalidraw --save # or yarn add svg-to-excalidraw
```

## :beginner: Usage

TODO.

## :game_die: Running tests

TODO.

## :busts_in_silhouette: Contributing

See [CONTRIBUTING.md][contribute].

## :1234: Versioning

This project uses [SemVer][semver] for versioning. For the versions available, see the [tags on this repository][repotags].

[npmshield]: https://img.shields.io/npm/v/svg-to-excalidraw.svg
[npmpackage]: https://www.npmjs.com/package/svg-to-excalidraw
[standardshield]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[standard]: https://standardjs.com
[licenseshield]: https://img.shields.io/github/license/mashape/apistatus.svg
[license]: https://github.com/excalidraw/svg-to-excalidraw/blob/main/LICENSE
[installation]: #floppy_disk-installation
[usage]: #beginner-usage
[running-tests]: #game_die-running-tests
[contributing]: #busts_in_silhouette-contributing
[contribute]: https://github.com/excalidraw/svg-to-excalidraw/blob/main/CONTRIBUTING.md
[versioning]: #1234-versioning
[semver]: http://semver.org
[repotags]: https://github.com/excalidraw/svg-to-excalidraw/tags

### :building_construction: Local Development

#### Building the Project

```bash
npm run build # builds the project
# or
npm run build:watch # builds project whenever a file is updated.
```

#### Running dev pages locally

There are a number of pages that exist in the `dev` folder that help in local development. These files need to be served, but a local dev serve is provided via the [serve library](https://github.com/vercel/serve).

```bash
npm run dev:serve
# open up a browser page to localhost:5000/dev
```
