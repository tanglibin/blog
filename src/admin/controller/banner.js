const Base = require('./base.js');

/**
 * Banner管理
 */
module.exports = class extends Base {

    //查询
    async listAction() {
        let model = this.model('banner');
        let list = await model.order('create_time desc').select();
        return this.success(list);
    }

    //新增
    async addAction() {
        if(this.isPost){
            let data = this.post();
            //创建/最后更新时间填充
            const time = think.datetime(new Date());
            data.create_time = time;
            data.last_update_time = time;

            let model = this.model('banner');
            let insertId = await model.add(data);

            if(insertId){
                data.id = insertId;
                return this.success(data, '新增Banner成功!');
            }
            return this._fail('新增失败，请稍后再试！');
        }
    }

    //修改
    async updateAction(){
        if(this.isPost){
            let data = this.post();
            data.last_update_time = think.datetime(new Date());
            let affectedRows = await this.model('banner').where({id: data.id}).update(data);

            if(affectedRows){
                return this.success(data, '更新Banner信息成功!');
            }
            return this._fail('更新Banner信息失败，请稍后再试！');
        }
    }

    //删除
    async delAction(){
        if(this.isPost){
            let data = this.post();
            let model = this.model('banner');
            let affectedRows = await model.where({id: ['IN', data.ids]}).delete();

            if(affectedRows){
                return this.success(affectedRows, '删除Banner数据成功!');
            }
            return this._fail('删除Banner数据失败，请稍后再试！');
        }
    }
};
