const path = require('path')
const webpack = require('webpack')

const env = process.env.NODE_ENV

module.exports = {
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: /node_modules/,
    }],
    postLoaders: [{
      loader: 'transform?brfs',
    }],
  },

  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, './lib'),
  },

  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env)
    })
  ]
}
