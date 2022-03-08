const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const env = process.env.NODE_ENV;
const isDev = env === 'development';

module.exports = {
	mode: env,
	watch: true,
	devtool: 'inline-source-map',
	entry: {
		'content-script': path.join(__dirname, './src/content-script/index.jsx'),
		background: path.join(__dirname, './src/background/background.js'),
	},
	output: {
		path: path.join(__dirname, isDev ? '/dev/' : '/dist/'),
		filename: '[name].js',
		publicPath: '',
	},
	stats: 'minimal',
	...(isDev
		? {
				watch: true,
				devtool: 'inline-source-map',
		  }
		: {
				optimization: {
					minimize: true,
				},
		  }),
	plugins: [
		new CopyPlugin({
			patterns: ['./manifest.json', './images/logo_*'],
		}),
		new MiniCssExtractPlugin({ filename: 'style.css' }),
		new webpack.DefinePlugin({
			'process.env.npm_package_version': JSON.stringify(
				process.env.npm_package_version
			),
		}),
		new webpack.ProgressPlugin(),
		new CleanWebpackPlugin(),
	],
	module: {
		rules: [
			{
				test: /\.jsx?$/,
				include: [path.resolve(__dirname, 'src')],
				loader: 'babel-loader',
			},
			{
				test: /\.scss|.css$/,
				use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
			},
			{
				test: /\.(png|svg|jpg|jpeg|gif)$/i,
				type: 'asset/resource',
			},
		],
	},
};
