const path = require('path');

module.exports = {
    entry: './static/scripts/index.js',
    output: {
        filename: 'index.min.js',
        path: path.resolve(__dirname, 'build/static/scripts/')
    },
    optimization: {
        minimize: false
    }
};