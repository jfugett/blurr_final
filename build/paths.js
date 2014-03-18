'use strict';

var paths = {};

// base paths usually used to write files back out
paths.server = './server/';
paths.build = './build/';
paths.cli = './cli/';
paths.client = './client/';
paths.deploy = './deploy/';
paths.monitor = './monitor/';
paths.scaffold = './scaffold/';
paths.tests = './tests/';
paths.workers = './workers/';

// primary paths to our javascript files
paths.jsServer = './server/**/*.js';
paths.jsBuild = './build/**/**.js';
paths.jsCLI = './cli/**/*.js';
paths.jsClient = './client/**/*.js';
paths.jsDeploy = './deploy/**/*.js';
paths.jsMonitor = './monitor/**/*.js';
paths.jsScaffold = './scaffold/**/*.js';
paths.jsTests = './tests/**/*.js';
paths.jsWorkers = './workers/**/*.js';

module.exports = paths;