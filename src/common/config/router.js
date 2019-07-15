module.exports = [
    [/^tlbgl\/?$/i, 'admin/index/index'], //管理页面
    [/^upload\/?$/i, 'admin/upload/index'], //上传

    [/^([a-zA-Z]+)\/?$/i, 'home/index/:1'],  //存在html文件
    [/^api\/([a-z]+)$/i, 'home/index/:1'], //前台使用接口
    [/^(tp[\d]{11})$/i, 'home/index/getPhoto?sid=:1'], //获取照片或相册
    [/^(ta[\d]{11})$/i, 'home/index/journalDetail?sid=:1'], //获取照片或相册
    
    [/^adminapi\/([a-z]+)\/([a-z]+)$/i, 'admin/:1/:2'], //管理后台使用接口
    [/^([\S]+)$/i, 'home/index/error'] //404页面
];
