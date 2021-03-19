const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
	mode: 'production',
	entry: {
		'content-script': path.join(__dirname, './src/content-script/index.jsx'),
		background: path.join(__dirname, './src/background/background.js'),
	},
	output: {
		path: path.join(__dirname, '/build/'),
		filename: '[name].js',
		publicPath: '',
	},
	optimization: {
		minimize: true,
	},
	plugins: [
		new CopyWebpackPlugin(['./manifest.json', './images/logo_*']),
		new MiniCssExtractPlugin({ filename: 'style.css' }),
		new webpack.DefinePlugin({
			'process.env.npm_package_version': JSON.stringify(
				process.env.npm_package_version
			),
		}),
	],
	module: {
		rules: [
			{
				test: /\.jsx?$/,
				include: [path.resolve(__dirname, 'src')],
				use: [
					{
						loader: 'babel-loader',
					},
				],
			},

			{
				test: /\.json$/,
				exclude: /node_modules/,
			},

			{
				test: /\.css$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader,
					},
					{
						loader: 'css-loader',
					},
				],
			},
			{
				test: /\.scss$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader,
					},
					{
						loader: 'css-loader',
					},
					{
						loader: 'sass-loader',
					},
				],
			},
		],
	},
};
