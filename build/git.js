'use strict';

// include the gutil module
var gutil = require('gulp-util');

// include the exec module so that we can call shell commands
var exec = require('child_process').exec;

// include async to handle callback hell
var async = require('async');

// include inquirer to get information back from the user
var inquirer = require('inquirer');

// include the pull request library to create a pull request on github
var pr = require('pull-request');

// this is our base object
var git = {};

// this method handles the initial setup
git.init = function init(gulp, tasks){
    // keep a reference to gulp
    git.gulp = gulp;
    
    // keep a reference to the tasks object
    git.tasks = tasks;
    
    // setup the git tasks
    git.setupTasks();
    
    // return the tasks object in case it needs to be reused
    return git.tasks;
};

// this sets up the public tasks that need to be available on the command line
git.setupTasks = function setupTasks(){
    // just a shortcut reference
    var tasks = git.tasks;
    
    tasks.gitInfo = git.gitInfo;
    
    tasks.startFeature = git.startFeature;
};

// this gets the current branch and then calls the callback function with it
git.getCurrentBranch = function getCurrentBranch(cb){
    var cmd = 'git rev-parse --abbrev-ref HEAD';
    exec(cmd, git.gulp.execCB(cb));
};

// this gets the current branch status and then calls the callback function with it
git.getBranchStatus = function getBranchStatus(cb){
    var cmd = 'git status -s';
    exec(cmd, git.gulp.execCB(cb));
};

// this does a pull on thecurrent branch and then returns true on success with the callback
git.pullBranch = function pullBranch(cb){
    var cmd = 'git pull';
    exec(cmd, git.gulp.execCB(cb));
};

// this method creates a new local branch and pushes it out as a remote branch
git.createRemoteBranch = function createRemoteBranch(branchName, cb){
    var cmd = 'git checkout -b ' + branchName + '; git push origin -u ' + branchName;
    exec(cmd, git.gulp.execCB(cb));
};

// this method checks out a specified branch
git.checkoutBranch = function checkoutBranch(branchName, cb){
    var cmd = 'git checkout ' + branchName;
    exec(cmd, git.gulp.execCB(cb));
};

// this method adds files to the git staging area that aren't in the .gitignore (also handles removals)
git.addFiles = function addFiles(cb){
    var cmd = 'git add -all';
    exec(cmd, git.gulp.execCB(cb));
};

// this method handles the commiting of files to the current branch
git.commitFiles = function commitFiles(message, cb){
    var cmd = 'git commit -m ' + message;
    exec(cmd, git.gulp.execCB(cb));
};

// this method pushes the files to the remote branch
git.pushFiles = function pushFiles(cb){
    var cmd = 'git push';
    exec(cmd, git.gulp.execCB(cb));
};

// this method creates a pull request on github
git.pullRequest = function pullRequest(options, cb){
    // title of the pull request
    var title = 'Requesting Merge of ' + options.src + ' to ' + options.dest;
    
    // the repository that the pull request is coming from
    var from = {
        user: 'jfugett',
        repo: 'blurr',
        branch: options.src
    };
    
    // the repository that the pull request is going to
    var to = {
        user: 'jfugett',
        repo: 'blurr',
        branch: options.dest
    };
    
    // the message to be added to the pull request
    var message = {
        title: title,
        body: options.message
    };
    
    // authorization token since it's a private repository
    var auth = {
        auth: {
            type: 'oauth',
            token: '77f251f1c924a5a1dc3cf6f2ce9a0761f3a42618'
        }
    };
    
    // run the actual command
    pr.pull(from, to, message, auth, cb);
};

// this method returns the current branch name and a shortened version of the git status
git.gitInfo = function gitInfo(){
    async.series([
        // show the current branch
        function showCurrentBranch(cb){
            git.getCurrentBranch(function callback(err, result){
                gutil.log(gutil.colors.green('Current Branch: ') + result);
                cb(err, result);
            });
        },
        // show the current status in short form
        function showStatus(cb){
            git.getBranchStatus(function callback(err, result){
                gutil.log(gutil.colors.green('Status: ') + result);
                cb(err, result);
            });
        }
    ]);
};

// this method handles starting a new feature branch
git.startFeature = function startFeature(){
    var featureName = '';
    
    // questions to use for prompting the user
    var questions = [
        {
            type: 'input',
            name: 'feature_name',
            message: 'What is the name of this feature?'
        }
    ];
    
    // this is the logic for creating a new feature branch
    async.series([
        // make sure the current branch is development
        function checkCurrentBranch(cb){
            git.getCurrentBranch(function callback(err, result){
                result = result.trim();
                
                if(result !== 'development'){
                    git.gulp.errorHandler('You must be on the development branch to start a new feature');
                    cb('Not on development branch', null);
                    return;
                }
                
                cb(err, result);
            });
        },
        // make sure there aren't any modified files
        function checkStatus(cb){
            git.getBranchStatus(function callback(err, result){
                result = result.trim();
                
                if(result !== ''){
                    git.gulp.errorHandler('You have modified files, please commit or stash them first');
                    cb('Modified Files', null);
                    return;
                }
                
                cb(err, result);
            });
        },
        // prompt the user for the feature name
        function getFeatureName(cb){
            //prompt the user with the previous questions
            inquirer.prompt(questions, function(answers){
                // get the feature name from the users response
                featureName = answers.feature_name;
                // make the feature name all lower case for consistency
                featureName = featureName.toLowerCase();
                // replace any spaces or other odd characters with a hyphen
                featureName = featureName.replace(/[^a-z0-9\-]/g, '-');
                // add the feature prefix to the feature name
                featureName = 'feature-' + featureName;
                
                cb(null, true);
            });
        },
        function createRemote(cb){
            // create the remote branch and check it out
            git.createRemoteBranch(featureName, git.gulp.baseCB(cb));
        }
    ]);
};

module.exports = git;

// // this runs the standard gulp build which includes tests to prevent a user from breaking the build
// var runBuild = function runBuild(cb){
//     var cmd = 'gulp build';
//     exec(cmd, standardExecCallback(cb));
// };

// // this runs the standard gulp bumpVersion which bumps the version of all necessary files
// var bumpVersion = function bumpVersion(type, cb){
//     var cmd = 'gulp bumpVersion --type ' + type;
//     exec(cmd, standardExecCallback(cb));
// };

// // this method handles starting a new hot fix branch
// var startHotFix = function startHotFix(){
//     // this will hold the name of the new hot fix
//     var fixName = '';
    
//     // this holds the options for inquirer to prompt the user
//     var questions = [
//         {
//             type: 'input',
//             name: 'fix_name',
//             message: 'What is the name of this hotfix?'
//         }
//     ];
    
//     // this handles the logic of creation the new hot fix branch
//     async.series([
//         function(cb){
//             // makes sure the current branch is master
//             getCurrentBranch(function(err, result){
//                 result = result.trim();
//                 if(result !== 'master'){
//                     gutil.log('You are not on the master branch!');
//                     gutil.log('Please commit or stash any changes you have');
//                     gutil.log('then checkout the master branch');
                    
//                     gulp.errorHandler('Not on master branch');
//                     return;
//                 }
                
//                 cb(err, result);
//             });
//         },
//         function(cb){
//             // makes sure you don't have any modified files
//             getBranchStatus(function(err, result){
//                 if(result !== ''){
//                     gutil.log('You have modified files in your git branch.');
//                     gutil.log('Please either stash your changes, revert them, or commit them first');
                    
//                     gulp.errorHandler('Modified Files');
//                     return;
//                 }
                
//                 cb(err, result);
//             });
//         },
//         function(cb){
//             // prompt the user for the feature name
//             inquirer.prompt(questions, function(answers){
//                 // changes non-alphanumerics to hyphens just to be safe
//                 fixName = answers.fix_name.replace(/[^a-z0-9\-]/gi, '-');
//                 fixName = 'hotfix-' + fixName;
                
//                 cb(null, true);
//             });
//         },
//         function(cb){
//             // creates the remote branch and checks it out
//             createRemoteBranch(fixName, standardCallback(cb));
//         }
//     ]);
// };

// // this method handles starting a new release branch
// var startRelease = function startRelease(){
//     // this will hold the name of the new feature
//     var releaseName = '';
    
//     // this holds the options for inquirer to prompt the user
//     var questions = [
//         {
//             type: 'input',
//             name: 'release_name',
//             message: 'What is the name of this release?'
//         }
//     ];
    
//     // this handles the logic of creation the new feature branch
//     async.series([
//         function(cb){
//             // makes sure the current branch is development
//             getCurrentBranch(function(err, result){
//                 result = result.trim();
//                 if(result !== 'development'){
//                     gutil.log('You are not on the development branch!');
//                     gutil.log('Please commit or stash any changes you have');
//                     gutil.log('then checkout development branch');
                    
//                     gulp.errorHandler('Not on development branch');
//                     return;
//                 }
                
//                 cb(err, result);
//             });
//         },
//         function(cb){
//             // makes sure you don't have any modified files
//             getBranchStatus(function(err, result){
//                 if(result !== ''){
//                     gutil.log('You have modified files in your git branch.');
//                     gutil.log('Please either stash your changes, revert them, or commit them first');
                    
//                     gulp.errorHandler('Modified Files');
//                     return;
//                 }
                
//                 cb(err, result);
//             });
//         },
//         function(cb){
//             // prompt the user for the feature name
//             inquirer.prompt(questions, function(answers){
//                 // changes non-alphanumerics to hyphens just to be safe
//                 releaseName = answers.release_name.replace(/[^a-z0-9\-]/gi, '-');
//                 releaseName = 'release-' + releaseName;
                
//                 cb(null, true);
//             });
//         },
//         function(cb){
//             // creates the remote branch and checks it out
//             createRemoteBranch(releaseName, standardCallback(cb));
//         }
//     ]);
// };

// // this method calls the method to update the branch
// var update = function update(){
//     // pull any changes on the current branch and output the results
//     pullBranch(standardCallback(function(){}));
// };

// // this method adds all modified files not in .gitignore and creates a commit with the proper format
// var commit = function commit(callback){
//     // this will hold our commit message
//     var message = '';
    
//     // these are the questions we will prompt the user for
//     var questions = [
//         {
//             type: 'list',
//             name: 'type',
//             message: 'What type of commit is this?',
//             choices: [
//                 'feat',
//                 'fix',
//                 'docs',
//                 'style',
//                 'refactor',
//                 'perf',
//                 'test',
//                 'chore'
//             ]
//         },
//         {
//             type: 'input',
//             name: 'scope',
//             message: 'What area was this change in?',
//         },
//         {
//             type: 'input',
//             name: 'subject',
//             message: 'What is a brief description of this commit?'
//         },
//         {
//             type: 'input',
//             name: 'body',
//             message: 'Please detail your change(s) (You can force a newline by adding \\n)'
//         },
//         {
//             type: 'input',
//             name: 'breaks',
//             message: 'What does this change break? (Separate values with commas)'
//         },
//         {
//             type: 'input',
//             name: 'closes',
//             message: 'What issues does this change close? (Separate values with commas)'
//         }
//     ];
    
//     // we use async here to ensure everything runs in the appropriate order
//     async.series([
//         // pull the current branch
//         function(cb){
//             pullBranch(standardCallback(cb));
//         },
//         // makes sure the current branch isn't development or master
//         function(cb){
//             getCurrentBranch(function(err, result){
//                 result = result.trim();
//                 if(result === 'development' || result === 'master'){
//                     gutil.log('You can\'t commit directly to development or master');
//                     gutil.log('Please create a feature or hotfix branch instead');
//                     gutil.log('This will then be merged into the appropriate place with a pull request');
                    
//                     gulp.errorHandler('Can\'t commit directly to development or master', null);
//                     return;
//                 }
                
//                 cb(err, result);
//             });
//         },
//         // run the tests and make the build to ensure the commit has the appropriate files and doesn't break the build
//         function(cb){
//             runBuild(standardCallback(cb));
//         },
//         // add any modified, new, or deleted files to the git staging area
//         function(cb){
//             addFiles(standardCallback(cb));
//         },
//         // get the responses from the user that are needed to build up the formatted commit message
//         // this message format is based off of industry standards and allows parsing for the changelog
//         function(cb){
//             inquirer.prompt(questions, function(answers){
//                 message = answers.type;
//                 message += '(' + answers.scope + '): ';
//                 message += answers.subject;
//                 message += '\n\n';
                
//                 var body = answers.body.replace(/\\n /g, '\r\n');
//                 body = body.replace(/\\n/g, '\r\n');
                
//                 message += body;
//                 message += '\r\r\n\n';
                
//                 var breaks = answers.breaks.replace(/, /g, ',');
//                 breaks = breaks.replace(/,/g, '\r\n');
//                 breaks = breaks.trim();
                
//                 var closes = answers.closes.replace(/, /g, ',');
//                 closes = closes.replace(/,/g, '\r\n');
//                 closes = closes.trim();

//                 if(breaks !== ''){
//                     message += breaks;
//                     message += '\r\n\r\n';
//                 }
//                 if(closes !== ''){
//                     message += closes;
//                 }
                
//                 cb(null, true);
//             });
//         },
//         // commit the actual files
//         function(cb){
//             commitFiles(message, standardCallback(cb));
//         },
//         // push the files to the remote server
//         function(cb){
//             pushFiles(standardCallback(cb));
//         }
//     ], function(err, results){
//         if(typeof callback === 'function'){
//             if(err){
//                 gulp.errorHandler(err);
//                 callback(err, null);
//                 return;
//             }
            
//             callback(err, results);
//         }
//     });
// };

// var finishFeature = function finishFeature(){
//     // these are the questions we will prompt the user for
//     var questions = [
//         {
//             type: 'list',
//             name: 'type',
//             message: 'What type of feature is this?',
//             choices: [
//                 'major',
//                 'minor',
//                 'patch',
//                 'dev'
//             ]
//         }
//     ];
    
//     var buildType = '';
//     var currentBranch = '';

//     async.series([
//         // makes sure the current branch is a feature branch
//         function(cb){
//             getCurrentBranch(function(err, result){
//                 result = result.trim();
//                 if(result.substring(0, 8) !== 'feature-'){
//                     gutil.log('You\'re not currently working on a feature branch!');
//                     gutil.log('Either checkout the branch you wanted to work on or start a new feature');
                    
//                     gulp.errorHandler('You\'re not currently working on a feature!', null);
//                     return;
//                 }
                
//                 currentBranch = result;
                
//                 cb(err, result);
//             });
//         },
//         // here we ask whether the build is a major, minor, or patch type feature
//         function(cb){
//             inquirer.prompt(questions, function(answers){
//                 buildType = answers.type;
                
//                 cb(null, true);
//             });
//         },
//         // here we bump the version based on the answer before
//         function(cb){
//             bumpVersion(buildType, standardCallback(cb));
//         },
//         // here we push the build to the server
//         function(cb){
//             commit(cb);
//         },
//         // here we issue the pull request to github
//         function(cb){
//             var src = currentBranch;
//             var dest = 'development';
//             var featureName = src.substr(8, src.length - 8);
//             featureName = featureName.replace('-', ' ');

//             var message = 'Finished Feature ' + featureName;

//             var options = {
//                 src: src,
//                 dest: dest,
//                 message: message
//             };

//             pullRequest(options, function(err, results){
//                 if(err){
//                     err = err.res.body;
//                     gulp.errorHandler(err);
//                 }
                
//                 gutil.log(results);    
//                 cb(err, results);
//             });
//         },
//         // now we checkout the development branch so that the user can move on to the next feature or hot fix
//         function(cb){
//             checkoutBranch('development', standardCallback(cb));
//         }
//     ]);
// };

// var finishHotFix = function finishFeature(){
//     // these are the questions we will prompt the user for
//     var buildType = 'patch';
//     var currentBranch = '';
    
//     async.series([
//         // makes sure the current branch is a feature branch
//         function(cb){
//             getCurrentBranch(function(err, result){
//                 result = result.trim();
//                 if(result.substring(0, 7) !== 'hotfix-'){
//                     gutil.log('You\'re not currently working on a hotfix branch!');
//                     gutil.log('Either checkout the branch you wanted to work on or start a new hotfix');
                    
//                     gulp.errorHandler('You\'re not currently working on a hotfix!', null);
//                     return;
//                 }
                
//                 currentBranch = result;
                
//                 cb(err, result);
//             });
//         },
//         // here we bump the version since it's a hotfix we know it's a patch
//         function(cb){
//             bumpVersion(buildType, standardCallback(cb));
//         },
//         // here we push the build to the server
//         function(cb){
//             commit(cb);
//         },
//         // here we issue the pull request to github
//         function(cb){
//             var src = currentBranch;
//             var dest = 'master';
//             var featureName = src.substr(7, src.length - 7);
//             featureName = featureName.replace('-', ' ');

//             var message = 'Finished Feature ' + featureName;

//             var options = {
//                 src: src,
//                 dest: dest,
//                 message: message
//             };

//             pullRequest(options, function(err, results){
//                 if(err){
//                     err = err.res.body;
//                     gulp.errorHandler(err);
//                 }
                
//                 gutil.log(results);    
//                 cb(err, results);
//             });
//         },
//         // now we checkout the development branch so that the user can move on to the next feature or hot fix
//         function(cb){
//             checkoutBranch('development', standardCallback(cb));
//         }
//     ]);
// };

// var finishRelease = function finishRelease(){
//     // these are the questions we will prompt the user for
//     var questions = [
//         {
//             type: 'list',
//             name: 'type',
//             message: 'What type of release is this?',
//             choices: [
//                 'major',
//                 'minor'
//             ]
//         }
//     ];
    
//     var buildType = '';
//     var currentBranch = '';

//     async.series([
//         // makes sure the current branch is a feature branch
//         function(cb){
//             getCurrentBranch(function(err, result){
//                 result = result.trim();
//                 if(result.substring(0, 8) !== 'release-'){
//                     gutil.log('You\'re not currently working on a release branch!');
//                     gutil.log('Either checkout the branch you wanted to work on or start a new release');
                    
//                     gulp.errorHandler('You\'re not currently working on a release!', null);
//                     return;
//                 }
                
//                 currentBranch = result;
                
//                 cb(err, result);
//             });
//         },
//         // here we ask whether the build is a major, minor, or patch type feature
//         function(cb){
//             inquirer.prompt(questions, function(answers){
//                 buildType = answers.type;
                
//                 cb(null, true);
//             });
//         },
//         // here we bump the version based on the answer before
//         function(cb){
//             bumpVersion(buildType, standardCallback(cb));
//         },
//         // here we push the build to the server
//         function(cb){
//             commit(cb);
//         },
//         // here we issue the pull request to github
//         function(cb){
//             var src = currentBranch;
//             var dest = 'master';
//             var releaseName = src.substr(8, src.length - 8);
//             releaseName = releaseName.replace('-', ' ');

//             var message = 'Finished Release ' + releaseName;

//             var options = {
//                 src: src,
//                 dest: dest,
//                 message: message
//             };

//             pullRequest(options, function(err, results){
//                 if(err){
//                     err = err.res.body;
//                     gulp.errorHandler(err);
//                 }
                
//                 gutil.log(results);    
//                 cb(err, results);
//             });
//         },
//         // now we checkout the development branch so that the user can move on to the next feature or hot fix
//         function(cb){
//             checkoutBranch('development', standardCallback(cb));
//         }
//     ]);
// };

// var generator = function generator(glp, tasks){
//     // assign gulp to our global variable
//     gulp = glp;
    
//     // make gitInfo a public task
//     tasks.gitInfo = gitInfo;
    
//     // make startFeature a public task
//     tasks.startFeature = startFeature;
    
//     // make update a public task
//     tasks.update = update;
    
//     // make commit a public task
//     tasks.commit = commit;
    
//     // make finish feature a public task
//     tasks.finishFeature = finishFeature;
    
//     // make startHotFix a public task
//     tasks.startHotFix = startHotFix;
    
//     // make finishHotfix a public task
//     tasks.finishHotFix = finishHotFix;
    
//     // make startRelease a public task
//     tasks.startRelease = startRelease;
    
//     return tasks;
// };

// module.exports = generator;