'use strict';

// include the file system for file manipulation
var fs = require('fs');

// include lodash for templating
var _ = require('lodash');

// here we get the main template
var template = fs.readFileSync('./build/reporterTemplate.html');

// now we get the outer template that has all of the html body
var outerTemplate = fs.readFileSync('./build/reporterOuterTemplate.html');

var jsHintReporter = {
    // this is where the output will be sent
    outputFile: './test_results/jsHint.html',

    // this function is used to write the output to the destination
    writeOutput: function writeOutput(output){
        // wrap this in a try catch just so it doesn't shut down on us
        try{
            fs.appendFileSync(jsHintReporter.outputFile, output);
        } catch(error) {
            console.log(error);
        }
    },


    // this function takes the results and builds up the html body
    reporter: function (results) {
        // compile the main template using the results
        var compiled = _.template(template, null, {'variable': 'results'});
        var body = compiled(results);

        // wrap the output inside the outer template
        compiled = _.template(outerTemplate, null, {'variable': 'body'});
        var output = compiled(body);

        // send the output to be written
        jsHintReporter.writeOutput(output);
    },
};

module.exports = jsHintReporter;