const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  mode: 'production',
  entry: {
    'content-script': path.join(__dirname, './src/content-script/main.jsx'),
    background: path.join(__dirname, './src/background/background.js')
  },
  output: {
    path: path.join(__dirname, '/build/'),
    filename: '[name].js',
    publicPath: ''
  },
  optimization: {
    minimize: true
  },
  plugins: [
    new CopyWebpackPlugin([ { from: './manifest.json' } ]),
    new MiniCssExtractPlugin({ filename: 'style.css' })
  ],
  resolve: {
    alias: {
      'react': 'preact-compat',
      'react-dom': 'preact-compat'
    }
  },
  module: {
    rules: [{
      test: /\.jsx?$/,
      include: [
        path.resolve(__dirname, 'src')
      ],
      use: [{
        loader: 'babel-loader'
      }]
    },

    {
      test: /\.json$/,
      exclude: /node_modules/
    },

    {
      test: /\.css$/,
      use: [{
        loader: MiniCssExtractPlugin.loader
      },
      {
        loader: 'css-loader'
      }
      ]
    },
    {
      test: /\.scss$/,
      use: [{
        loader: MiniCssExtractPlugin.loader
      },
      {
        loader: 'css-loader'
      }, {
        loader: 'sass-loader'
      }
      ]
    }
    ]
  }
}
