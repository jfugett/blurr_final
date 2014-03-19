// include the files system utility so we can read our build configuration file
var fs = require('fs');

module.exports = function configReader(){
    // read the contents of our config file
    var contents = fs.readFileSync('./build/config.json', 'utf8');
    var config = JSON.parse(contents);

    // return the configuration object
    return config;
};