'use strict';

// include gulp here
var gulp = require('gulp');

// include lodash to make life easy
var _ = require('lodash');

// this just requires our main gulp configuration file
// we do it this way simply for testability
var tasks = require('./build').init(gulp);

// this just loops through the tasks array
// assigning each task as a gulp tasks so they're publically available
_.forIn(tasks, function taskIterator(value, key){
    gulp.task(key, value);
});