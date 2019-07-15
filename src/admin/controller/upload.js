const Base = require('./base.js');
const path = require('path');

module.exports = class extends Base {

    //入口Action
    async indexAction() {
        let query = this.ctx.query || {},
            fs = require('fs'),
            themefile = this.file('upfile'),
            filepath = themefile.path,//为防止上传的时候因文件名重复而覆盖同名已上传文件，path是MD5方式产生的随机名称
            uploadpath = 'www/static/upload/' + (query.type ? 'cover' : ('content/' + think.datetime(new Date(), 'YYYYMMDD')));
        
        think.mkdir(uploadpath);//创建该目录

        let basename = path.basename(filepath);
        basename = +new Date() + (basename.match(/\.([a-z]+)$/)[0]);
        
        uploadpath = uploadpath + '/' + basename;
        fs.renameSync(filepath, uploadpath);

        //这里暂时就仅区分获取配置及上传文件
        return this.json(
            {
                success: 1,                                //上传状态，上传成功时必须返回SUCCESS
                message: '上传成功',                        //提示
                url: uploadpath.replace(/^www\//i, '/'),   //返回的地址
                title: basename,                           //新文件名
                original: themefile.name,                  //原始文件名
                type:  themefile.type,                     //文件类型
            }
        );
    }
};
