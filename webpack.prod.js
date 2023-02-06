const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = merge(common, {
	
	mode: "production",
	module: {
		rules: [
			{
				test: /\.css$/,
				use: [MiniCssExtractPlugin.loader, "css-loader"],
			},
		],
	},



	optimization: {
		
		innerGraph: true,
		minimize: true,
		minimizer: 
		[
			new TerserPlugin({

				//minify: TerserPlugin.swcMinify,
				// `terserOptions` options will be passed to `swc` (`@swc/core`)
				// Link to options - https://swc.rs/docs/config-js-minify
				//terserOptions: {},

				parallel: true,

				terserOptions: {
					//sourceMap: true,
					//module: true,
					mangle: true,
					compress: true,
				},

				// minify: TerserPlugin.uglifyJsMinify,
				// // `terserOptions` options will be passed to `uglify-js`
				// // Link to options - https://github.com/mishoo/UglifyJS#minify-options
				// terserOptions: {},
			}),
		],

		runtimeChunk: true,
		
		splitChunks: {
			chunks: 'all',
		},

		moduleIds: 'deterministic',
		removeEmptyChunks: true,
		removeAvailableModules: false,
		
	},








	plugins: [
		new MiniCssExtractPlugin({
			filename: "[name].css",
			chunkFilename: "[id].css",
		}),
		new webpack.DefinePlugin({
			"process.env": {
				NODE_ENV: JSON.stringify("production"),
			},
		}),
	],
});
