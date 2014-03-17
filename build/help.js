'use strict';

var lister = require('gulp-task-listing');

var help = {};

help.init = function init(gulp, tasks){
    help.gulp = gulp;
    
    help.tasks = tasks;
    
    help.setupTasks();
    
    return help.tasks;
};

help.setupTasks = function setupTasks(){
    help.tasks.help = lister;
};

module.exports = help;