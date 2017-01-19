var injection = require('allcountjs');

injection.bindFactory('port', 9080);
injection.bindFactory('dbUrl', 'mongodb://localhost:27017/crm');

injection.bindFactory('gitRepoUrl', 'app-config');

injection.bindMultiple('viewPaths', ['myViewPathProvider']);
injection.bindFactory('myViewPathProvider', function () {
    return [__dirname + '/views'];
});

var server = injection.inject('allcountServerStartup');
server.startup(function (errors) {
    if (errors) {
        throw new Error(errors.join('\n'));
    }
});