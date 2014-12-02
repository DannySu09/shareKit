module.exports = function(config){
    config.set({
        basePath: './',
        files: [
            'tests/karma.html',
            'node_modules/chai/chai.js',
            'node_modules/mocha/mocha.js',
            'node_modules/mocha/mocha.css',
            'node_modules/sinon/pkg/sinon.js',
            'tests/testBuild.js'
        ],
        preprocessors: {
            'tests/karma.html':['html2js']
        },
        frameworks: ['mocha'],
        browsers: ['PhantomJS']
    });
};