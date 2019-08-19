const Base = require('./base.js');

module.exports = class extends Base {
    /**登录页面*/
    async entryAction() {
        return this.displayView('entry');
    }

    /**浏览器提示页面*/
    async browserAction() {
        return this.displayView('browser');
    }

    /**404页面*/
    async errorAction() {
        await this.getWidget();
        this.assign('isError', 1);
        return this.displayView('post');
    }
    
    /**首页*/
    async indexAction() {
        let model_banner = this.model('banner');
        let bannerList = await model_banner.cache('banner').select();
        this.assign('bannerList', bannerList);

        let data = await this.getJournalList(1, {}, 5);
        this.assign('journalData', data);
        await this.getWidget();
        return this.displayView('index');
    }

    /**学习笔记*/
    async journalAction() {
        let data = await this.getJournalList();
        this.assign('scrollData', data);
        await this.getWidget();
        return this.displayView('post');
    }

    /**笔记详情内容 */
    async journalDetailAction(){
        let sid = this.get('sid'),
            model1 = this.model('journal_info'),
            info = await model1.alias('j').join({table: 'tag', join: 'left', as: 't', on: ['j.tag_id', 't.id']}).field('j.*, t.name as "tag"').where({sid: sid}).find();

        let model2 = this.model('journal_detail'),
            detail = await model2.where({info_id: info.id}).select();
        
        this.assign('detailData', {info: info, detail: detail});
        this.assign('page_op', { title: info.title + ' - 学习笔记', idx: 1 });

        await this.getWidget(0);
        return this.displayView('journal_detail');
    }

    /**工具*/
    async toolAction() {
        let model = this.model('tool');
        let data = await model.field('name, type, version, photo, size, file_url, create_time').order('create_time desc').cache('tools').select();
        this.assign('tools', data);
        await this.getWidget(0);
        return this.displayView('tool');
    }

    /**相册*/
    async albumAction() {
        let model = this.model('album');
        let data = await model.where({pid: null}).order('create_time desc').cache('album').select();
        this.assign('albums', data);
        return this.displayView('album');
    }

    /**根据sid获取相册或对于照片*/
    async getPhotoAction(){
        let sid = this.get('sid');
        let model = this.model('album');

        let selfData = await model.where({sid: sid}).cache(sid).find();
        if(selfData){
            this.assign('page_op', { title: selfData.name + ' - 我的相册', idx: 4 });
            if(selfData.photos){
                selfData.photos = selfData.photos.split(',');
                this.assign('data', selfData);
                return this.displayView('album_detail');
            }else {
                // 查询子相册
                let list = await model.field(`sid, CONCAT(prefix, cover) as 'cover', name, filming_time`).where({pid: selfData.id}).cache('child_' + sid).order('filming_time desc').select();
                if(list.length){
                    this.assign('albums', list);
                    return this.displayView('album');
                }
            }
        }
        return this.displayView('error');
    }

    /**足迹*/
    async footprintAction() {
        let model = this.model('footprint');
        let list = await model.alias('f').join({
            table: 'album',
            join: 'left',
            as: 'a',
            on: ['f.aid', 'a.id']
        }).field(`a.sid as 'link', CONCAT('[',longitude,',', latitude, ']') AS 'coordinates', a.name as 'title', f.name as 'title2', f.record_date, a.cover as 'img'`).cache('footprint').select();
        this.assign('data', {
            count: list.length,
            list: JSON.stringify(list)
        });
        return this.displayView('footprint');
    }

    /**搜索页面 */
    async searchAction(){
        let parm = this.get(), scrollData;
        let page = parm.page || 1;
        let s = (parm.t || parm.k || '').replace(/\s|delete|truncate/ig,'');
        // 标签过滤
        if(parm.t){
            scrollData = await this.getJournalList(page, {'t.name': s});
        }
        // 关键字过滤
        else if(parm.k){
            scrollData = await this.getJournalList(page, {
                _complex: {
                    'j.title|j.summary': ['like', `%${s}%`],
                    _complex: `find_in_set('${s}', j.keyword)`,
                    _logic: 'or'
                }
            });
        }
        if(parm.page){
            return this.success(scrollData);
        }
        this.assign('scrollData', scrollData);
        await this.getWidget();
        return this.displayView('post');
    }

    /**登录请求*/
    async loginAction(){
        if(this.isPost){
            let data = this.post();
            let {key} = data;
            if(key.length!=4){
                return this._fail('输入错误，请重新输入!', 3);
            }
            let model = this.model('entry');
            let model1 = this.model('login_log');
            let model2 = this.model('login_error');
            let ip = this.ctx.ip;

            // 查询ip登录失败次数， 若大于等于3， 则不予通过访问
            let count = await model2.where({ip: ip, login_type: 0}).count();
            if(count>=3){
                return this._fail('输入错误，请重新输入!', count);
            }

            let info = await model.where({val: key}).find();
            if(think.isEmpty(info)){
                // 记录失败日志
                model1.add({ip: ip, login_type: 0, status: 0, login_time: think.datetime(new Date())});
                // 添加录失败记录表数据
                model2.add({ip: ip, login_type: 0});
                return this._fail('输入错误，请重新输入!', count+1);
            }

            // 记录成功日志
            model1.add({ip: ip, login_type: 0, status: 1, login_time: think.datetime(new Date())});
            // 登录成功删除登录失败记录表数据
            model2.where({ip: ip, login_type: 0}).delete();
            // 登录缓存
            await this.session('key', key);
            return this.success(1);
        }
    }

    /**分页获取日志请求 */
    async getJournalAction(){
        if(this.isGet){
            let page = this.get('page');
            let data = await this.getJournalList(page);
            return this.success(data);
        }
    }
};
