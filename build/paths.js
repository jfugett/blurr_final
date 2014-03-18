'use strict';

var paths = {};

paths.jsHintServer = './server/**/*.js';
paths.jsHintBuild = ['gulpfile.js', './build/**/**.js'];
paths.jsHintCLI = './cli/**/*.js';
paths.jsHintClient = './client/**/*.js';
paths.jsHintDeploy = './deploy/**/*.js';
paths.jsHintMonitor = './monitor/**/*.js';
paths.jsHintScaffold = './scaffold/**/*.js';
paths.jsHintTests = './tests/**/*.js';
paths.jsHintWorkers = './workers/**/*.js';

module.exports = paths;