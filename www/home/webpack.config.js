const Path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const OptimizeCss = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const utils = require('./build/utils');
const PublicPath = process.env.NODE_ENV== 'development' ? '/' : '/home/dist/';
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports={
    mode: 'development',
     //入口文件的配置项
    entry: utils.entries(),

    //出口文件的配置项
    output:{
        //输出的路径
        path:Path.resolve(__dirname, 'dist'),
        //输出的文件名称
        filename : "static/js/[contenthash:8].js",
        //设置静态文件出口公用路径，也就是前缀, 一般为ip加端口，这里为了方便，也为了跟上面配置devServer 时统一，就使用localhost, 这样原来的相对路径改为了绝对路径，这样来讲速度更快。如果这里使用的是还是相对的../, 则热更新会失效
        publicPath: PublicPath
    },

    //模块：例如解读CSS,图片如何转换，压缩
    module:{
        rules: [
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"]
            },
            {
                test: /\.less$/,
                use: [MiniCssExtractPlugin.loader, "css-loader", "less-loader"]
            },
            {
                test: /\.(jpg|png|gif|ico|JPG|PNG)$/,
                use : [
                    {
                        loader: "url-loader",
                        options: {
                            //名称
                            name: "[hash:8].[ext]",
                            //以此数值为大小区分节点，单位为字节(b), 小于该大小，进行base64转码并插入到js文件，大于则进行拷贝
                            limit: 4000,
                            //指定输出目录，不指定则为跟目录
                            outputPath: "static/image/"
                        }
                    }
                ]
            },
            {
                test: /\.js$/,
                use: "babel-loader",
                //过滤掉node_modules
                exclude: /node_modules/
            }
        ]
    },
    //插件，用于生产模版和各项功能
    plugins:[
        //清空dist目录
        new CleanWebpackPlugin(['dist']),
        //分离css
        new MiniCssExtractPlugin({
            filename: "static/css/[contenthash:8].css",
            chunkFilename: "[id].css"
        }),
        //压缩html
        ...utils.htmlPlugin(),
        //css 压缩
        new OptimizeCss({
            assetNameRegExp: /\.style\.css$/g, //正则表达式，用于匹配需要优化或者压缩的资源名。默认值是 /\.css$/g
            cssProcessor: require('cssnano'), //用于压缩和优化CSS 的处理器，默认是 cssnano.这是一个函数，应该按照 cssnano.process 接口(接受一个CSS和options参数，返回一个Promise)
            cssProcessorOptions: { discardComments: { removeAll: true } },//传递给cssProcessor的插件选项
            canPrint: true //表示插件能够在console中打印信息，默认值是true
        }),
        //gzip压缩
        new CompressionWebpackPlugin({
            algorithm: 'gzip',
            test: new RegExp('\\.(js|css)$'),
            threshold: 10240,
            minRatio: 0.8
        }),
        new CopyWebpackPlugin([
            {
                from: Path.resolve(__dirname, './static'),
                to: 'static/'
            }
        ])
    ],
    optimization: {
        minimizer: [
            new OptimizeCss({}),
            new UglifyJsPlugin({
                uglifyOptions: {
                    ecma: 6,
                    cache: true,
                    parallel: true
                }
            })
        ]
    },
    //配置webpack开发服务功能
    devServer:{
        //设置基本目录结构
        contentBase:Path.resolve(__dirname,'dist'),
        //服务器的IP地址，可以使用IP也可以使用localhost
        host:'localhost',
        //服务端压缩是否开启
        compress:true,
        //配置服务端口号
        port:8888
    }
}