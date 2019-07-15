const Path = require('path');
// glob是webpack安装时依赖的一个第三方模块，还模块允许你使用 *等符号, 例如lib/*.js就是获取lib文件夹下的所有js后缀名的文件
const glob = require('glob');
// 取得相应的页面路径
const PAGE_PATH = Path.resolve(__dirname, '../src')
// 用于做相应的merge处理
const merge = require('webpack-merge');
const HtmlPlugin= require('html-webpack-plugin');

//html跟js对应关系配置： html文件名称: 需要加载的js文件名称
let chunks = {
    template: ['blog'],
    entry: ['blog'],
    browser: ['blog'],
}

//多入口配置,通过glob模块读取src/js文件夹下的所有对应文件夹下的js后缀文件，如果该文件存在,那么就作为入口处理
exports.entries = function() {
    const entryFiles = glob.sync(PAGE_PATH + '/js/*.js');
    let map = {};
    entryFiles.forEach((filePath) => {
        var filename = filePath.substring(filePath.lastIndexOf('\/') + 1, filePath.lastIndexOf('.'))
        map[filename] = filePath
    })
    return map
}

//多页面输出配置, 与上面的多页面入口配置相同，读取src/html文件夹下的对应的html后缀文件，然后放入数组中
exports.htmlPlugin = function() {
    let entryHtml = glob.sync(PAGE_PATH + '/html/**/*.html');
    return entryHtml.map((filePath) => {
        let filename = filePath.substring(filePath.lastIndexOf('\/') + 1, filePath.lastIndexOf('.'))
        let conf = {
            // 模板来源
            template: filePath,
            // 文件名称
            filename: filename + '.html',
            // 页面模板需要加对应的js脚本，如果不加这行则每个页面都会引入所有的js脚本
            chunks: (chunks[filename] ? [...chunks[filename]] : []),
            inject: false,
        }
        if (process.env.NODE_ENV === 'production') {
            conf = merge(conf, {
                minify:{
                    removeComments: true,//注释
                    collapseWhitespace: true, //换行符
                    minifyCSS: true, //内联样式
                    minifyJS: true, //内联js
                    removeScriptTypeAttributes: true, //去掉script标签的type属性，只要浏览器没有设置为比如vbscript或者其他解析方式，就没问题
                    removeStyleLinkTypeAttributes: true, //去掉style和link标签的type属性。
                    removeAttributeQuotes:true, //去除属性上的引号
                    removeEmptyAttributes:true //去除空属性
                },
                chunksSortMode: 'dependency'
            })
        }
        return new HtmlPlugin(conf)
    })
}