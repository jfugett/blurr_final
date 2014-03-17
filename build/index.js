'use strict';

var builder = {};

builder.init = function init(gulp){
    builder.gulp = gulp;
    builder.tasks = {};
    
    builder.setupTasks();
    
    builder.includeTasks();
    
    return builder.tasks;
};

builder.setupTasks = function setupTasks(){
    var tasks = builder.tasks;
    
    tasks.default = builder.dev;
    
    tasks.dev = builder.dev;
    
    tasks.test = builder.test;
    
    tasks.build = builder.build;
};

builder.includeTasks = function includeTasks(){
    require('./help').init(builder.gulp, builder.tasks);
};

builder.dev = function dev(){
    console.log('dev method called');
};

builder.test = function test(){
    console.log('test method called');
};

builder.build = function build(){
    console.log('build method called');
};

module.exports = builder;