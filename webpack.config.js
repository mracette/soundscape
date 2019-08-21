const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env) => {
    const isProduction = env === 'production';
    return {
        entry: './src/app.js',
        output: {
            path: path.join(__dirname, 'public'),
            filename: 'bundle.js'
        },
        module: {
            rules: [
                {
                    test: /\.mp3$/,
                    include: path.join(__dirname, 'src/audio/'),
                    loader: 'file-loader',
                    options: {
                        outputPath: 'audio',
                        name: '[name].[ext]'
                    }
                },
                { 
                    test: /\.js$/, 
                    exclude: /node_modules/, 
                    loader: "babel-loader" 
                },                
                {
                    test: /\.s?css$/,
                    use: [{
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            hmr: process.env.NODE_ENV === 'development',
                            name: '[name].[ext]'
                        }
                    },
                    'css-loader',
                    'sass-loader'
                    ]
                },
                {
                    test: /\.gltf$/,
                    include: path.join(__dirname, 'src/models/'),
                    loader: "file-loader",
                    options: {
                        outputPath: 'models',
                        name: '[name].[ext]'
                    }
                },
                {
                    test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'fonts/'
                    }
                }
            ]
        },
        devtool: isProduction ? 'source-map': 'cheap-module-eval-source-map',
        devServer: {
            contentBase: path.join(__dirname, 'public'),
            historyApiFallback: true
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: 'styles.css',
                chinkFilename: 'styles.map.css'
            })
        ]
}}