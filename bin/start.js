const path = require('path');
const start = require('../lib/scaffold/start');
const params = require('../essx-node.json');

const options = {};
options.path = path.resolve(__dirname, '../');
options.config = params;

start(options);