const Base = require('./base.js');

/**
 * 工具资源
 */
module.exports = class extends Base {

    //查询
    async listAction() {
        let model = this.model('tool');
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

            let model = this.model('tool');
            let insertId = await model.add(data);

            if(insertId){
                data.id = insertId;
                return this.success(data, '新增工具资源数据成功!');
            }
            return this._fail('新增失败，请稍后再试！');
        }
    }

    //修改
    async updateAction(){
        if(this.isPost){
            let data = this.post();
            data.last_update_time = think.datetime(new Date());
            let affectedRows = await this.model('tool').where({id: data.id}).update(data);

            if(affectedRows){
                return this.success(data, '更新工具资源数据成功!');
            }
            return this._fail('更新工具资源数据失败，请稍后再试！');
        }
    }

    //删除
    async delAction(){
        if(this.isPost){
            let data = this.post();
            let model = this.model('tool');
            let affectedRows = await model.where({id: ['IN', data.ids]}).delete();

            if(affectedRows){
                return this.success(affectedRows, '删除工具资源数据成功!');
            }
            return this._fail('删除工具资源数据失败，请稍后再试！');
        }
    }
};
