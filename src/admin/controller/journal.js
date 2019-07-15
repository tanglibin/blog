const Base = require('./base.js');

/**
 * 日志管理
 */
module.exports = class extends Base {

    //查询
    async listAction() {
        if(this.isPost){
            let data = this.post(), param = {};
            // 过滤推送
            if(data.push){
                param['push'] = data.push;
            }
            // 过滤类型
            if(data.type){
                param['type'] = data.type;
            }
            //过滤状态
            if(data.status){
                param['status'] = data.status;
            }
            //起始时间
            if(data.range){
                data.range = data.range.split(',');
                let endTime = data.range[1].replace('00:00:00', '23:59:59');
                param['issue_time'] = {'>': data.range[0], '<': endTime};
            }
            //模糊过滤标题
            if(data.title){
                param['title'] = ['like', `%${data.title}%`];
            }
            //模糊过滤概要
            if(data.summary){
                param['summary'] = ['like', `%${data.summary}%`];
            }
            //模糊过滤关键字
            if(data.keyword){
                param['keyword'] = ['like', `%${data.keyword}%`];
            }
            let model = this.model('journal_info');

            let list = await model.alias('j').join({
                table: 'tag',
                join: 'left',
                as: 't',
                on: ['j.tag_id', 't.id']
            }).field('j.*, t.name as "tag"').where(param).order('last_update_time desc').page(data.currentPage, data.pagesize).countSelect();
            return this.success(list);
        }
    }


    //根据id获取详情数据
    async findAction(){
        let id = this.ctx.param('id');
        let model_info = this.model('journal_info');
        let info = await model_info.where({id: id, status: 0}).find();
        if(think.isEmpty(info)){
            return this._fail('非法请求！');
        }

        let model_detail = this.model('journal_detail').db(model_info.db());
        let detail = await model_detail.where({info_id: id}).field('id, info_id, chapter_title, content, create_time').order('create_time asc').select();

        return this.success({
            info: info,
            detail : detail
        });
    }

    //发布|下线
    async issueAction(){
        if(this.isPost){
            let data = this.post();
            let model = this.model('journal_info');
            let param = {id: data.id};

            //若为发布，如果不存在发布时间，则进行填充，如果之前已经发布过，则略过处理
            if(data.status == 1){
                let info = await model.where(param).find();
                if(!info.issue_time){
                    data.issue_time = think.datetime(new Date());
                }
            }
            let affectedRows = await model.where(param).update(data);
            if(affectedRows){
                return this.success(data, '日志状态更新成功!');
            }
            return this._fail('日志状态更新，请稍后再试！');
        }
    }
    //推送操作
    async pushAction(){
        if(this.isPost){
            let data = this.post();
            let model = this.model('journal_info');

            let affectedRows = await model.where({id: data.id}).update({push: data.push});
            if(affectedRows){
                return this.success(data, '日志推送状态更新成功!');
            }
            return this._fail('日志推送状态更新，请稍后再试！');
        }
    }

    //删除日志
    async delAction(){
        if(this.isPost){
            let data = this.post();

            let model_info = this.model('journal_info');

            //事务管理，删除数据
            const result = await model_info.transaction(async () => {
                let r1 = await model_info.where({id: ['IN', data.id]}).delete();
                const model_detail = this.model('journal_detail').db(model_info.db());
                let r2 = await model_detail.where({info_id: ['IN', data.id]}).delete();
                let r3 = await this.model('tag').db(model_detail.db()).where({id: ['IN', data.id]}).decrement('count'); //将tag数量减 1;
                return r1 && r2 && r3;
            })
            if(result){
                return this.success(1, '日志删除成功!');
            }
            return this._fail('日志删除失败，请稍后再试！');
        }
    }

    //删除章节
    async delchapAction(){
        const id = this.ctx.param('id');
        const infoid = this.ctx.param('infoid');
        const model = this.model('journal_detail');

        //事务管理，删除数据
        const result = await model.transaction(async () => {
            let r1 = await model.where({id: id}).delete();
            const model_info = this.model('journal_info').db(model.db());
            let r2 = await model_info.where({id: infoid}).update({last_update_time: think.datetime(new Date())});
            return r1 && r2;
        })

        if(result){
            return this.success(result, '删除章节成功!');
        }
        return this._fail('删除章节失败，请稍后再试！');
    }

    //新增
    async addAction() {
        if(this.isPost){
            let data = this.post(),
                info = JSON.parse(data.info),
                detail = JSON.parse(data.detail),
                date = new Date(),
                dateStr = think.datetime(date),
                model_info = this.model('journal_info');

            //如果当前选的发布状态，则设置发布时间
            if(info.status == 1){
                info.issue_time = dateStr;
            }
            //创建时间
            info.create_time = dateStr;
            info.last_update_time = dateStr;
            // 生成id
            info.sid = (think.datetime(date, 'YYYYMMDD') + (+date)).replace(/^([\d]{2})([\d]{6})([\d]{5})([\d]{5})([\d]{3})$/, 'ta$2$4');
            //事务管理，新增数据
            const infoId = await model_info.transaction(async () => {
                const insertId = await model_info.add(info);

                detail.info_id = insertId;
                detail.create_time = dateStr;
                detail.last_update_time = dateStr;
                // 通过 db 方法让 user_cate 模型复用当前模型的数据库连接
                const model_detail = this.model('journal_detail').db(model_info.db());
                let result = await model_detail.add(detail);

                const tagFlag = await this.model('tag').db(model_detail.db()).where({id: info.tag_id}).increment('count'); //将数量加 1;

                if(!result || !tagFlag){
                    return false;
                }
                return insertId;
            })

            if(infoId){
                return this.success(infoId, '新增日志成功!');
            }
            return this._fail('新增失败，请稍后再试！');
        }
    }

    //修改
    async updateAction(){
        if(this.isPost){
            let data = this.post();
            let info = JSON.parse(data.info || '{}');
            let now = think.datetime(new Date());
            let model_info = this.model('journal_info');
            let flg1 = 1, flg2 = 1;

            //手动开启事务
            await model_info.startTrans();

            //更新最后更新时间
            info.last_update_time = now;
            //填充发布时间
            if(info.status == 1 && !info.issue_time){
                info.issue_time = now;
            }
            flg1 = await model_info.where({id: info.id}).update(info);

            //详情
            if(flg1 && data.detail){
                let detail = JSON.parse(data.detail);
                let model_detail = this.model('journal_detail').db(model_info.db());
                detail.last_update_time = now;
                delete detail.create_time;
                delete detail.title;
                //修改章节
                if(detail.id){

                    flg2 = await model_detail.where({id: detail.id}).update(detail);
                }
                //新增章节
                else {
                    detail.create_time = now;
                    flg2 = await model_detail.add(detail);
                }
            }

            if(flg1 && flg2){
                //提交事务
                await model_info.commit();
                return this.success(flg2, '日志信息更新成功!');
            }
            //回滚事务
            await model_info.rollback();
            return this._fail('日志更新失败，请稍后再试！');
        }
    }

    // 获取标签数据
    async getTagsAction(){
        let model = this.model('tag');
        let list = await model.order('create_time desc').select();
        return this.success(list);
    }

    // 新增标签
    async addTagAction(){
        if(this.isPost){
            let data = this.post();
            //创建时间填充
            const time = think.datetime(new Date());
            data.create_time = time;

            let model = this.model('tag');
            let insertId = await model.add(data);

            if(insertId){
                data.id = insertId;
                return this.success(data);
            }
            return this._fail('标签新增失败，请稍后再试！');
        }
    }
};
