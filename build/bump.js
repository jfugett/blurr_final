'use strict';

// we use this to make gulp accessible to our functions
var gulp = null;

// require the semver versioning tool
var bump = require('gulp-bump');

// require stream combiner for easier stream manipulation
var combine = require('stream-combiner');

// include yargs to get the build type
var args = require('yargs').default({type: 'dev'}).argv;

// this is the function that actually does the version bumping
var bumpVersion = function bumpVersion(){
    // get the type argument from the command
    var type = args.type;
    // make sure the command is all lower case
    type = type.toLocaleLowerCase();

    // if this is a dev build we don't need to bump the version
    if(type === 'dev'){
        gulp.notifyHandler('Dev Build', 'Since this is a dev build we won\'t be bump the version');
        return true;
    }
    
    // this horrible regex just makes sure that the passed in version matches semver specs
    var passes = type.match(/^(\d+\.\d+\.\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/);

    // make sure the type is valid
    if(type !== 'patch' &&
        type !== 'major' &&
        type !== 'minor' &&
        type !== 'alpha' &&
        type !== 'beta' &&
        type !== 'release' &&
        type !== 'hotfix' &&
        type !== 'feature' &&
        !passes) {
            throw new Error('That is not a valid build');
    }
    
    // if the version bump is a release type we're just adding a flag to the current version
    if(type === 'alpha' || type === 'beta' || type === 'release' || type === 'hotfix' || type === 'feature'){
        // delete package.json from the cache so we don't get stale values
        delete require.cache[require.resolve('../package.json')];
        
        // load in the fresh package.json
        var packageJson = require('../package.json');
        
        // break the current version based on any existing release flags
        var version = packageJson.version.split('-');
        
        // set the type to the version plus the new release type
        type = version[0] + '-' + type;
        
        // bump the actual version and write it to disk
        var combinedVersion = combine(
            gulp.src(['./package.json', 'bower.json']),
            bump({version: type}),
            gulp.dest('./')
        );
        
        combinedVersion.on('error', gulp.errorHandler);
    } else {
        // here we're either doing a minor, major, or patch bump and we can bump the version in one step
        var combined = combine(
            gulp.src(['./package.json', 'bower.json']),
            bump({type: type}),
            gulp.dest('./')
        );
    
        combined.on('error', gulp.errorHandler);
    }
};

// this is just a generator to allow gulp and the tasks array to be passed in
var generator = function(glp, tasks){

    // assign gulp to our global instance
    gulp = glp;

    // make bumpVersion a public task    
    tasks.bumpVersion = bumpVersion;
    
    return tasks;
};

// export our generator
module.exports = generator;