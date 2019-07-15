const Base = require('./base.js');

/**
 * 相册管理
 */
module.exports = class extends Base {

    /**查询 */
    async listAction() {
        if(this.isPost){
            let data = this.post(), param = {};
            // 过滤编号
            if(data.sid){
                param['sid'] = data.sid;
            }
            //过滤封面
            if(data.cover){
                param['cover'] = data.cover;
            }
            // 过滤前缀
            if(data.prefix){
                param['prefix'] = data.prefix;
            }
            //起始时间
            if(data.range){
                data.range = data.range.split(',');
                param['filming_time'] = {'>=': data.range[0], '<=': data.range[1]};
            }
            //模糊过滤名称
            if(data.name){
                param['name'] = ['like', `%${data.name}%`];
            }
            let model = this.model('album');
            let list = await model.where(param).order('create_time desc').page(data.currentPage, data.pagesize).countSelect();
            return this.success(list);
        }
    }

    /**删除 */
    async delAction(){
        if(this.isPost){
            let data = this.post();

            let model = this.model('album');
            let r1 = await model.where({id: ['IN', data.id], pid: ['IN', data.id], _logic: 'OR'}).delete();
            if(r1){
                return this.success(1, '删除成功!');
            }
            return this._fail('删除失败，请稍后再试！');
        }
    }

    /**查询父目录*/
    async getParentAction() {
        let model = this.model('album');
        let list = await model.where({pid: null}).order('create_time desc').select();
        return this.success(list);
    }
    
    /**新增*/
    async addAction() {
        if(this.isPost){
            let data = this.getAddData(this.post()),
                model = this.model('album');
            data.pic_count = data.photos ? data.photos.split(',').length : 0;
            let result = await model.add(data);
            if(result){
                data.id = result;
                return this.success(data, '新增相册成功!');
            }
            return this._fail('新增失败，请稍后再试！');
        }
    }

    /**新增数据获取*/
    getAddData(data) {
        let date = new Date(),
            sid = (think.datetime(date, 'YYYYMMDD') + (+date)).replace(/^([\d]{2})([\d]{6})([\d]{5})([\d]{5})([\d]{3})$/, 'tp$2$4');
        data.create_time = think.datetime(date);
        data.sid = sid;
        return data;
    }

    /**迁移当前目录下文件 */
    async migrateAction(){
        if(this.isPost){
            let data = this.getAddData(this.post()),
                model = this.model('album');
            
            const result = await model.transaction(async () => {
                let r1 = await model.add(data);
                let r2 = await model.where({id: data.pid}).update({filming_time: null, photos: null, prefix: null, pic_count: 0});

                return r1 && r2;
            })
            if(result){
                return this.success(1, '迁移成功，需到七牛更改图片前缀');
            }
            return this._fail('迁移失败，请稍后再试！');
        }
    }

    //根据id获取详情数据
    async findAction(){
        let id = this.ctx.param('id');
        let model = this.model('album');
        let self = await model.where({id: id}).find();
        if(think.isEmpty(self)){
            return this._fail('非法请求！');
        }
        let childCount = await model.where({pid: id}).count('id');
        return this.success({
            self: self,
            childCount : childCount
        });
    }

    /**修改*/
    async updateAction() {
        if(this.isPost){
            let data = this.post();
            data = JSON.parse(data.form);
            let model = this.model('album');
            data.pic_count = data.photos ? data.photos.split(',').length : 0;
            let result = await model.where({id: data.id}).update(data);
            if(result){
                return this.success(1, '修改成功!');
            }
            return this._fail('修改失败，请稍后再试！');
        }
    }
};
