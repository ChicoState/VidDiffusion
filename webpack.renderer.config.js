const rules = require('./webpack.rules');
const path = require('path')

rules.push({
    test: /\.css$/,
    include: path.resolve(__dirname, 'src'),
    use: ['style-loader', 'css-loader', 'postcss-loader'],
});

module.exports = {
    // Put your normal webpack config below here
    externals: {
        "react-native": true,
    },
    module: {
        rules,
    },
};
