Essentia Node
============

A Ess full node for building applications and services with Node.js. A node is extensible and can be configured to run additional services. At the minimum a node has an interface to [ESSX Core (essd)](https://github.com/essentiaone/essx) for more advanced address queries. Additional services can be enabled to make a node more useful such as exposing new APIs, running a block explorer and wallet service.

## Usages

### As a standalone server

```bash
git clone https://github.com/essentiaone/essx-node
cd essx-node
npm install
./bin/essx-node start
```

When running the start command, it will seek for a .ess folder with a ess.conf file.
If it doesn't exist, it will create it, with basic task to connect to essd.

## Prerequisites
- Docker
- Ess Core (essd) with support for additional indexing *(see above)*
- Node.js v8+
- ~20GB of disk storage
- ~1GB of RAM

## License

Code released under [the MIT license](https://github.com/essentiaone/essx-node/blob/master/LICENSE).

Copyright 2019 Essentia.

Copyright 2016-2018 Dash Core Group, Inc.

- bitcoin: Copyright (c) 2009-2015 Bitcoin Core Developers (MIT License)
