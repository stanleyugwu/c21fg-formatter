const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    entry: path.resolve(__dirname, 'src','index.js'),
    output:{
        path: path.resolve(__dirname,'public'),
        filename:'bundle.js'
    },
    module:{
        rules:[
            {
                test:/\.js$/i,
                use:['babel-loader'],
                exclude:/node_modules/
            },
            {
                test:/\.css$/i,
                use: [MiniCssExtractPlugin.loader,'css-loader','postcss-loader']
            },
            {
                test:/\.(png|jpg|jpeg|svg|gif|tif|ico)$/i,
                use:['url-loader']
            }
        ]
    },
    plugins:[
        new HtmlWebpackPlugin({
           template:path.resolve(__dirname,'src','index.html'),
           inject:'body'
        }),
        new MiniCssExtractPlugin({
            filename:'bundle.css',
        })
    ],
    devServer: {
        contentBase: path.join(__dirname, 'public'),
        watchContentBase:true,
        historyApiFallback: true
    }
}