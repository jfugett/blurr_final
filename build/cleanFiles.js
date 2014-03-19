'use strict';

// require our cleaning mechanism
var clean = require('gulp-clean');

// define our base object
var cleaner = {};

cleaner.init = function init(gulp, tasks){
    // keep a reference to gulp and tasks
    cleaner.gulp = gulp;
    cleaner.tasks = tasks;

    // setpu our tasks
    cleaner.setupTasks();
};

// this is our task runner
cleaner.run = function run(srcPipe){
    srcPipe.pipe(clean());
};

// this sets up references to our tasks
cleaner.setupTasks = function setupTasks(){
    // shortcut reference
    var tasks = cleaner.tasks;

    tasks._cleanTests = cleaner.tests;
};

// this is a shortcut method used to clean up before running our tests
cleaner.tests = function tests(){
    cleaner.jsHint();
};

// this method cleans out the jsHint results from the last run
cleaner.jsHint = function jsHint(){
    cleaner.run(cleaner.gulp.src('./test_results/jsHint.html'));
};

module.exports = cleaner;