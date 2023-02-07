const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
	
    // Get error codes
    // stats: {
    //     errorDetails: true,
    //     children: true
    // }, 

	// optimization: {
	// 	splitChunks: {
	// 		chunks: 'async',
	// 		minSize: 20000,
	// 		minRemainingSize: 0,
	// 		minChunks: 1,
	// 		maxAsyncRequests: 30,
	// 		maxInitialRequests: 30,
	// 		enforceSizeThreshold: 50000,
	// 		cacheGroups: {
	// 			defaultVendors: {
	// 				test: /[\\/]node_modules[\\/]/,
	// 				priority: -10,
	// 				reuseExistingChunk: true,
	// 			},
	// 			default: {
	// 				minChunks: 2,
	// 				priority: -20,
	// 				reuseExistingChunk: true,
	// 			},
	// 		},
	// 	},
	// },

	entry: {
		app: "./src/index.ts",
	},
	
	output: {

		// Cache busting using webpack's filename hashing
        // Update to new webpack hashing
        // filename: "[name].[contenthash].js",
		filename: "[name].[chunkhash].js",
		path: path.resolve(__dirname, "public"),
	},
	
	

	resolve: {

		alias: {
			styles: path.resolve(__dirname, "./src/"),
		},

        // Add `.ts` and `.tsx` as a resolvable extension.
    	extensions: [".ts", ".tsx", ".js"],
		// Add support for TypeScripts fully qualified ESM imports.
		extensionAlias: {
			'.js': ['.js', '.ts'],
			'.cjs': ['.cjs', '.cts'],
			'.mjs': ['.mjs', '.mts']
		}

	},

	module: {
		rules: [
			// {
			// 	test: /\.js$/,
			// 	exclude: /node_modules/,
			// 	use: {
			// 		loader: "swc-loader"
			// 	}

			{ test: /\.([cm]?ts|tsx)$/, loader: "ts-loader" }
			//{ test: /\.([cm]?ts|tsx)$/, loader: "swc-loader" }

			// {
			// 	test: /\.tsx?$/,
			// 	use: 'ts-loader',
			// 	exclude: /node_modules/,
			  
			// },



			// {
            //     test: require.resolve("./node_modules/three/examples/jsm/controls/OrbitControls.js"),
			// 	use: [
			// 		{
			// 			loader: "expose-loader",
			// 			options: {
			// 				exposes: "OrbitControls",
			// 			},
			// 		},
			// 	],
			// },


			// {
            //     test: require.resolve("./node_modules/three/examples/jsm/loaders/OBJLoader.js"),
			// 	use: [
			// 		{
			// 			loader: "expose-loader",
			// 			options: {
			// 				exposes: "OBJLoader",
			// 			},
			// 		},
			// 	],
			// },

			

            // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
            // { test: /\.tsx?$/, loader: "ts-loader" },
            // // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            // { test: /\.js$/, loader: "source-map-loader" },

		],

    },
	plugins: [
		
		new HtmlWebpackPlugin({
			filename: "index.html",
			template: "src/index.html",
		}),
		new HtmlWebpackPlugin({
			filename: "projects.html",
			template: "src/projects.html",
		}),
	],
};
