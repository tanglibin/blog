const path = require('path');

module.exports = class extends think.Controller {
    constructor(...args) {
        super(...args);
        this.VIEW_PATH = path.join(think.ROOT_PATH, 'www', 'home', 'dist');
    }

    async __before() {
        // 拦截未登录
        let key = await this.session('key');
        let { action } = this.ctx;
        if (!key && !/login|entry|browser/.test(action)) {
            this.ctx.redirect('entry.html');
        }
        // 获取页面信息
        this.getPageOP();
        this.assign('currentYear', (new Date()).getFullYear());
    }

    async displayView(name) {
        return this.display(path.join(this.VIEW_PATH, name + '.html'));
    }

    /**请求失败*/
    async _fail(msg, data) {
        return this.fail(500, msg, data);
    }

    /**如果相应的Action不存在则调用该方法*/
    async __call(){
        this.ctx.redirect('error.html');
    }

    /**获取当前页面标题等信息*/
    getPageOP() {
        const { action } = this.ctx;
        if (/^(getPhoto|entry|browser)$/.test(action)) {
            return;
        }
        const obj = {
            index: { title: '首页', idx: 0 },
            journal: { title: '学习笔记', idx: 1 },
            tool: { title: '工具下载', idx: 2 },
            footprint: { title: '我的足迹', idx: 3 },
            album: { title: '我的相册', idx: 4 },
            search: { title: '搜索'},
            error: { title: '页面不存在'},
        }
        this.assign('page_op', obj[action]);
    }

    /**获取日志数据 */
    async getJournalList(page=1, where={}){
        let model = this.model('journal_info');
        let data = await model.alias('j').join({
            table: 'tag',
            join: 'left',
            as: 't',
            on: ['j.tag_id', 't.id']
        }).field('j.*, t.name as "tag"').where(Object.assign({'j.status': 1}, where)).order('issue_time desc').page(page, 10).countSelect();
        return data;
    }

    /** 获取小组件数据汇总 */
    async getWidget(flg=1){
        await this.getAuthorAndRandom();
        flg && await this.getPushAndTag();
    }

    /**获取运行天数及笔记数量 */
    async getAuthorAndRandom(){
        let publishDateTime = 1562688000000, //2019-07-10
            day = Math.floor((+new Date() - publishDateTime)/ 86400000),
            count = await this.model('journal_info').where({status: 1}).cache('journal-count').count(),
            follow = await this.model('follow').cache('follow').select();
        this.assign('authorData', {day: day, count: count});
        this.assign('follow', follow);
    }

    /**获取猜你喜欢及标签云 */
    async getPushAndTag(){
        let push = await this.model('journal_info').where({status: 1, push: 1}).cache('journal-push').order('issue_time desc').select(),
            tag = await this.model('tag').where('count>=1').cache('tag').select();
        this.assign('pushList', push);
        this.assign('tagList', tag);
    }
};
