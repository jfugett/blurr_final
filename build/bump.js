'use strict';

// require the semver versioning tool
var bump = require('gulp-bump');

// require stream combiner for easier stream manipulation
var combine = require('stream-combiner');

// require the file system module so we can read the package.json
var fs = require('fs');

// this is our base object
var bumper = {};

// this method gives us access to our dependencies
bumper.init = function init(gulp, tasks){
    // assign references so we have access to them
    bumper.gulp = gulp;
    bumper.tasks = tasks;

    // setup the tasks for this object
    bumper.setupTasks();
};

// this method assigns the tasks to the public tasks
bumper.setupTasks = function setupTasks(){
    // just a shortcut reference
    var tasks = bumper.tasks;

    tasks.bumpVersion = bumper.bumpVersion;

    tasks.getVersion = bumper.getVersion;

    tasks._bump = bumper._bump;

    tasks._version = bumper._version;
};

// this method handles user input on what type of version bump it is
bumper.bumpVersion = function bumpVersion(){
    // get the type of bump from the command line
    var args = require('yargs').default({type: 'dev'}).argv;
    var type = args.type;

    bumper._bump(type);
};

// this method just outputs the current version to the console
bumper.getVersion = function getVersion(){
    var version = bumper._version();

    console.log('Blurr Version: ' + version);
};

// this method does the actual work of bumping the version
bumper._bump = function _bump(type){
    // make sure the type is in all lower case
    type = type.toLowerCase();

    // if this is a dev build we don't need to bump the version
    if(type === 'dev'){
        bumper.gulp.notifyHandler('Dev Build', 'Since this is a dev build we won\'t bump the version');
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

    // if the version bump is a release type we're just adding a flag to the semver
    if(type === 'alpha' || type === 'beta' || type === 'release' || type === 'hotfix' || type === 'feature'){
        // get the current version
        var version = bumper._version();

        // strip off any existing flags
        version = version.split('-');

        // add the new flag to the version
        type = version[0] + '-' + type;

        // bump the actual version and write it to disk
        var combinedVersion = combine(
            bumper.gulp.src(['./package.json', 'bower.json']),
            bump({version: type}),
            bumper.gulp.dest('./')
        );

        combinedVersion.on('error', bumper.gulp.errorHandler);
    } else {
        // here we're either doing a minor, major, or patch bump and we can bump the version in one step
        var combined = combine(
            bumper.gulp.src(['./package.json', 'bower.json']),
            bump({type: type}),
            bumper.gulp.dest('./')
        );

        combined.on('error', bumper.gulp.errorHandler);
    }
};

// this method reads the version from the package.json file
bumper._version = function _version(){
    var contents = fs.readFileSync('./package.json', 'utf8');
    var packageJson = JSON.parse(contents);

    return packageJson.version;
};

// export our main object
module.exports = bumper;