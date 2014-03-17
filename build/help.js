'use strict';

// this is the module that handles listing out the tasks in a better format
var lister = require('gulp-task-listing');

// this is our base object
var help = {};

// this function just makes gulp and the tasks object available to the other items
help.init = function init(gulp, tasks){
    // keep a reference to gulp
    help.gulp = gulp;
    
    // keep a reference to the tasks object
    help.tasks = tasks;
    
    // setup the base tasks
    help.setupTasks();
    
    // return the tasks incase they need to be used again
    return help.tasks;
};

// this method adds the help task to the tasks array
help.setupTasks = function setupTasks(){
    help.tasks.help = lister;
};

// export our object
module.exports = help;