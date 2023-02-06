const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const webpack = require("webpack");

module.exports = merge(common, {
	mode: "development",
	devServer: {
		static: "./",
		hot: true,
		open: true,
		port: 9000,
	},


	stats: {
        errorDetails: true,
        children: true
    },

	devtool: "inline-source-map",

	module: {
		rules: [
			{
				test: /\.css$/,
				use: ["style-loader", "css-loader"],
			},
		],
	},
	
	plugins: [
		//    new webpack.HotModuleReplacementPlugin()
		new webpack.DefinePlugin({
			"process.env": {
				NODE_ENV: JSON.stringify("development"),
			},
		}),
	],
});
