const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: path.resolve(__dirname, 'src','index.js'),
    output:{
        path: path.resolve(__dirname,'public'),
        filename:'bundle.js'
    },
    module:{
        rules:[
            {
                test:/\.js$/,
                use:['babel-loader'],
                exclude:/node_modules/
            },
            {
                test:/\.css$/,
                use:['style-loader','css-loader']
            }
        ]
    },
    plugins:[
        new HtmlWebpackPlugin({
           template:path.resolve(__dirname,'src','index.html'),
           inject:'body'
        })
    ],
    devServer: {
        contentBase: path.join(__dirname, 'public'),
        watchContentBase:true,
        historyApiFallback: true
    }
}