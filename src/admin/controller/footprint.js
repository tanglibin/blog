const Base = require('./base.js');

/**
 * 足迹管理
 */
module.exports = class extends Base {

    //查询
    async listAction() {
        let data = this.get()
        let model = this.model('footprint');
        let list = await model.alias('f').join({
            table: 'album',
            join: 'left',
            as: 'a',
            on: ['f.aid', 'a.id']
          }).field('f.*, a.name, a.filming_time').order('f.create_time desc').page(data.currentPage, data.pagesize).countSelect();
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

            let model = this.model('footprint');
            let insertId = await model.add(data);

            if(insertId){
                return this.success(insertId, '新增足迹数据成功!');
            }
            return this._fail('新增失败，请稍后再试！');
        }
    }

    //修改
    async updateAction(){
        if(this.isPost){
            let data = this.post();
            data.last_update_time = think.datetime(new Date());
            let affectedRows = await this.model('footprint').where({id: data.id}).update(data);

            if(affectedRows){
                return this.success(data, '更新足迹数据成功!');
            }
            return this._fail('更新足迹数据失败，请稍后再试！');
        }
    }

    //删除
    async delAction(){
        if(this.isPost){
            let data = this.post();
            let model = this.model('footprint');
            let affectedRows = await model.where({id: ['IN', data.ids]}).delete();

            if(affectedRows){
                return this.success(affectedRows, '删除足迹数据成功!');
            }
            return this._fail('删除足迹数据失败，请稍后再试！');
        }
    }
};
