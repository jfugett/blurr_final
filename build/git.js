'use strict';

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
    
    tasks.update = git.update;
    
    tasks.commit = git.commit;
    
    tasks.startFeature = git.startFeature;
    
    tasks.finishFeature = git.finishFeature;
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
    var cmd = 'git add --all';
    exec(cmd, git.gulp.execCB(cb));
};

// this method handles the commiting of files to the current branch
git.commitFiles = function commitFiles(message, cb){
    var cmd = 'git commit -m "' + message + '"';
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
                console.log('Current Branch: ' + result);
                cb(err, result);
            });
        },
        // show the current status in short form
        function showStatus(cb){
            git.getBranchStatus(function callback(err, result){
                console.log('Status: ' + result);
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
                    git.gulp.errorHandler(new Error('You must be on the development branch to start a new feature'));
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
                    git.gulp.errorHandler(new Error('You have modified files, please commit or stash them first'));
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

// this method calls the pull branch private method to update the current branch
git.update = function update(){
    git.pullBranch(git.gulp.baseCB(function(err, result){
        console.log(result);
    }));
};

// this method adds all modified files not in .gitignroe and creates a commit with a properly formated message
git.commit = function commit(callback){
    // this will hold our commit message
    var message = '';
    
    // questions we'll prompt the user with
    var questions = [
        {
            type: 'list',
            name: 'type',
            message: 'What type of commit is this?',
            choices: [
                'feat',
                'fix',
                'docs',
                'style',
                'refactor',
                'perf',
                'test',
                'chore'
            ]
        },
        {
            type: 'input',
            name: 'scope',
            message: 'What area was this change in?'
        },
        {
            type: 'input',
            name: 'subject',
            message: 'Brief description of this commit'
        },
        {
            type: 'input',
            name: 'body',
            message: 'Please detail your change(s) (You can force a newline by adding \\n)'
        },
        {
            type: 'input',
            name: 'breaks',
            message: 'What does this change break? (Separate values with commas)'
        },
        {
            type: 'input',
            name: 'closes',
            message: 'What issues does this change close? (Seperate values with commas)\r\nExample: [Closes: #67719970], [Finishes: #67719983]'
        }
    ];
    
    // we use async here to ensure everything runs in the right order
    async.series([
        // pull the current branch so that it's up to date
        function updateCurrentBranch(cb){
            git.pullBranch(git.gulp.baseCB(cb));
        },
        // make sure the current branch isn't development or master as these shouldn't be committed to directly
        function checkBranch(cb){
            git.getCurrentBranch(function(err, result){
                result = result.trim();
                
                if(result === 'development' || result === 'master'){
                    git.gulp.errorHandler(new Error('You can\'t commit directly to development or master'));
                }
                
                cb(err, result);
            });
        },
        // run the tests and make the build to ensure the commit has the appropriate files and doesn't break the build
        function performBuild(cb){
            git.gulp.start('build');
            
            cb(null, true);
        },
        // add any modified, new, or deleted files to the git staging area
        function addModifiedFiles(cb){
            console.log('add');
            git.addFiles(git.gulp.baseCB(cb));
        },
        // get the responses from the user that are needed to build up the formatted commit message
        // this message format is based off of industry standards and allows parsing for the changelog
        function promptUser(cb){
            console.log('prompt');
            inquirer.prompt(questions, function(answers){
                message = answers.type;
                message += '(' + answers.scope + '): ';
                message += answers.subject;
                message += '\r\n\r\n';
                
                var body = answers.body.replace(/\\n /g, '\r\n');
                body = body.replace(/\\n/g, '\r\n');
                
                message += body;
                message += '\r\n\r\n';
                
                var breaks = answers.breaks.replace(/, /g, ',');
                breaks = breaks.replace(/,/g, '\r\n');
                breaks = breaks.trim();
                
                var closes = answers.closes.replace(/, /g, ',');
                closes = closes.replace(/,/g, '\r\n');
                closes = closes.trim();

                if(breaks !== ''){
                    message += breaks;
                    message += '\r\n\r\n';
                }
                if(closes !== ''){
                    message += closes;
                }
                
                message = message.replace('"', '\\"');
                
                cb(null, true);
            });
        },
        // commit the files
        function commitAddedFiles(cb){
            git.commitFiles(message, git.gulp.baseCB(cb));
        },
        // push the files to the remote
        function pushCommit(cb){
            git.pushFiles(git.gulp.baseCB(cb));
        }
    ], function(err, result){
        if(err){
            git.gulp.errorHandler(new Error(err));
        }
        
        callback(err, result);
    });
};

// this method finishes a started feature and submits a pull request to merge the changes into development
git.finishFeature = function finishFeature(){
    // these are the questions we'll prompt the user for
    var questions = [
        {
            type: 'list',
            name: 'type',
            message: 'What type of feature is this?',
            choices: [
                'major',
                'minor',
                'patch'
            ]
        }
    ];
    
    // we'll need access to buildType and the current branch between subtasks
    var buildType = '';
    var currentBranch = '';
    
    async.series([
        //make sure the current branch is a feature branch
        function isFeatureBranch(cb){
            git.getCurrentBranch(function callback(err, result){
                result = result.trim();

                if(result.substr(0, 8) !== 'feature-'){
                    git.gulp.errorHandler(new Error('You\'re not currently working on a feature!'));
                    cb('You\'re not currently working on a feature!');
                    return;
                }
                
                currentBranch = result;
                
                cb(err, result);
            });
        },
        // here we find out if the feature is a major, minor, or patch type
        function promptUser(cb){
            inquirer.prompt(questions, function(answers){
                buildType = answers.type;
                
                cb(null, true);
            });
        },
        // here we bump the version based on the previous answer
        function bumpVersion(cb){
            git.tasks._bump(buildType);
            
            cb(null, true);
        },
        // here we push the build to the server
        function commitBuild(cb){
            git.commit(git.gulp.baseCB(cb));
        },
        // here we issue the pull request to github
        function sendPullRequest(cb){
            // set the source branch to the branch we're currently working on
            var src = currentBranch;
            
            // set the destination branch to development
            var dest = 'development';
            
            // normalize the feature name for humans
            var featureName = src.substr(8, src.length - 8);
            featureName = featureName.replace('-', ' ');
            
            var message = 'Finished Feature ' + featureName;

            var options = {
                src: src,
                dest: dest,
                message: message
            };

            git.pullRequest(options, function(err, results){
                if(err){
                    console.log(err.res);
                    err = err.res;
                    git.gulp.errorHandler(new Error(err));
                }
                
                cb(err, results);
            });
        },
        // now we checkout the development branch so that the user can move on to the next feature or hot fix
        function checkoutDev(cb){
            git.checkoutBranch('development', git.gulp.baseCB(cb));
        }
    ]);
};

// this method handles starting a new hot fix branch
git.startHotFix = function startHotFix(){
    var fixName = '';
    
    // questions to use for prompting the user
    var questions = [
        {
            type: 'input',
            name: 'hotfix_name',
            message: 'What is the name of this hotfix?'
        }
    ];
    
    // this is the logic for creating a new hotfix branch
    async.series([
        // make sure the current branch is master
        function checkCurrentBranch(cb){
            git.getCurrentBranch(function callback(err, result){
                result = result.trim();
                
                if(result !== 'master'){
                    git.gulp.errorHandler(new Error('You must be on the master branch to start a new hot fix'));
                    cb('Not on master branch', null);
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
                    git.gulp.errorHandler(new Error('You have modified files, please commit or stash them first'));
                    cb('Modified Files', null);
                    return;
                }
                
                cb(err, result);
            });
        },
        // prompt the user for the hot fix name
        function getFixName(cb){
            //prompt the user with the previous questions
            inquirer.prompt(questions, function(answers){
                // get the hot fix name from the users response
                fixName = answers.fix_name;
                // make the hot fix name all lower case for consistency
                fixName = fixName.toLowerCase();
                // replace any spaces or other odd characters with a hyphen
                fixName = fixName.replace(/[^a-z0-9\-]/g, '-');
                // add the hotfix prefix to the name
                fixName = 'hotfix-' + fixName;
                
                cb(null, true);
            });
        },
        function createRemote(cb){
            // create the remote branch and check it out
            git.createRemoteBranch(fixName, git.gulp.baseCB(cb));
        }
    ]);
};

// this method handles starting a new relese branch
git.startRelease = function startRelease(){
    var releaseName = '';
    
    // questions to use for prompting the user
    var questions = [
        {
            type: 'input',
            name: 'release_name',
            message: 'What is the name of this release?'
        }
    ];
    
    // this is the logic for creating a new release branch
    async.series([
        // make sure the current branch is development
        function checkCurrentBranch(cb){
            git.getCurrentBranch(function callback(err, result){
                result = result.trim();
                
                if(result !== 'development'){
                    git.gulp.errorHandler(new Error('You must be on the development branch to start a new release'));
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
                    git.gulp.errorHandler(new Error('You have modified files, please commit or stash them first'));
                    cb('Modified Files', null);
                    return;
                }
                
                cb(err, result);
            });
        },
        // prompt the user for the release name
        function getReleaseName(cb){
            //prompt the user with the previous questions
            inquirer.prompt(questions, function(answers){
                // get the release name from the users response
                releaseName = answers.fix_name;
                // make the release name all lower case for consistency
                releaseName = releaseName.toLowerCase();
                // replace any spaces or other odd characters with a hyphen
                releaseName = releaseName.replace(/[^a-z0-9\-]/g, '-');
                // add the release prefix to the name
                releaseName = 'release-' + releaseName;
                
                cb(null, true);
            });
        },
        function createRemote(cb){
            // create the remote branch and check it out
            git.createRemoteBranch(releaseName, git.gulp.baseCB(cb));
        }
    ]);
};

// this method finishes a started hotfix and submits a pull request to merge the changes into master
git.finishHotFix = function finishHotFix(){
    // we'll need access to buildType and the current branch between subtasks
    var buildType = 'patch';
    var currentBranch = '';
    
    async.series([
        //make sure the current branch is a hotfix branch
        function isHotFixBranch(cb){
            git.getCurrentBranch(function callback(err, result){
                result = result.trim();

                console.log(result);
                if(result.substr(0, 7) !== 'hotfix-'){
                    git.gulp.errorHandler(new Error('You\'re not currently working on a hot fix!'));
                    cb('You\'re not currently working on a hotfix!');
                    return;
                }
                
                currentBranch = result;
                
                cb(err, result);
            });
        },
        // here we bump the version based on the previous answer
        function bumpVersion(cb){
            git.tasks._bump(buildType);
            
            cb(null, true);
        },
        // here we push the build to the server
        function commitBuild(cb){
            git.commit(git.gulp.baseCB(cb));
        },
        // here we issue the pull request to github
        function sendPullRequest(cb){
            // set the source branch to the branch we're currently working on
            var src = currentBranch;
            
            // set the destination branch to master
            var dest = 'master';
            
            // normalize the feature name for humans
            var fixName = src.substr(7, src.length - 7);
            fixName = fixName.replace('-', ' ');
            
            var message = 'Finished Hot Fix ' + fixName;

            var options = {
                src: src,
                dest: dest,
                message: message
            };

            git.pullRequest(options, function(err, results){
                if(err){
                    console.log(err.res);
                    err = err.res;
                    git.gulp.errorHandler(new Error(err));
                }
                
                cb(err, results);
            });
        },
        // now we checkout the development branch so that the user can move on to the next feature or hot fix
        function checkoutDev(cb){
            git.checkoutBranch('development', git.gulp.baseCB(cb));
        }
    ]);
};

// this method finishes a started release and submits a pull request to merge the changes into master
git.finishRelease = function finishRelease(){
    // these are the questions we'll prompt the user for
    var questions = [
        {
            type: 'list',
            name: 'type',
            message: 'What type of release is this?',
            choices: [
                'major',
                'minor'
            ]
        }
    ];
    
    // we'll need access to buildType and the current branch between subtasks
    var buildType = '';
    var currentBranch = '';
    
    async.series([
        //make sure the current branch is a release branch
        function isReleaseBranch(cb){
            git.getCurrentBranch(function callback(err, result){
                result = result.trim();

                if(result.substr(0, 8) !== 'release-'){
                    git.gulp.errorHandler(new Error('You\'re not currently working on a release!'));
                    cb('You\'re not currently working on a release!');
                    return;
                }
                
                currentBranch = result;
                
                cb(err, result);
            });
        },
        // here we find out if the release is a major or minor release
        function promptUser(cb){
            inquirer.prompt(questions, function(answers){
                buildType = answers.type;
                
                cb(null, true);
            });
        },
        // here we bump the version based on the previous answer
        function bumpVersion(cb){
            git.tasks._bump(buildType);
            
            cb(null, true);
        },
        // here we push the build to the server
        function commitBuild(cb){
            git.commit(git.gulp.baseCB(cb));
        },
        // here we issue the pull request to github
        function sendPullRequest(cb){
            // set the source branch to the branch we're currently working on
            var src = currentBranch;
            
            // set the destination branch to master
            var dest = 'master';
            
            // normalize the release name for humans
            var releaseName = src.substr(8, src.length - 8);
            releaseName = releaseName.replace('-', ' ');
            
            var message = 'Finished Release ' + releaseName;

            var options = {
                src: src,
                dest: dest,
                message: message
            };

            git.pullRequest(options, function(err, results){
                if(err){
                    console.log(err.res);
                    err = err.res;
                    git.gulp.errorHandler(new Error(err));
                }
                
                cb(err, results);
            });
        },
        // now we checkout the development branch so that the user can move on to the next feature or hot fix
        function checkoutDev(cb){
            git.checkoutBranch('development', git.gulp.baseCB(cb));
        }
    ]);
};

module.exports = git;