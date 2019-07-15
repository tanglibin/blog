const Base = require('./base.js');

/**
 * 随览管理
 */
module.exports = class extends Base {

    //查询
    async listAction() {
        let model = this.model('follow');
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

            let model = this.model('follow');
            let insertId = await model.add(data);

            if(insertId){
                data.id = insertId;
                return this.success(data, '新增随览成功!');
            }
            return this._fail('新增失败，请稍后再试！');
        }
    }

    //修改
    async updateAction(){
        if(this.isPost){
            let data = this.post();
            let affectedRows = await this.model('follow').where({id: data.id}).update(data);

            if(affectedRows){
                return this.success(data, '更新随览信息成功!');
            }
            return this._fail('更新随览信息失败，请稍后再试！');
        }
    }

    //删除
    async delAction(){
        if(this.isPost){
            let data = this.post();
            let model = this.model('follow');
            let affectedRows = await model.where({id: ['IN', data.ids]}).delete();

            if(affectedRows){
                return this.success(affectedRows, '删除随览数据成功!');
            }
            return this._fail('删除随览数据失败，请稍后再试！');
        }
    }
};
