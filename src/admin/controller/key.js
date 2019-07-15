const Base = require('./base.js');

module.exports = class extends Base {
    //获取数据
    async getDataAction() {
        let data = await this.model('entry').find();
        return this.success(data);
    }

    // 更新key值
    async updateAction() {
        if (this.isPost) {
            let data = this.post();
            //最后更新时间填充
            data.last_update_time = think.datetime(new Date());

            let model = this.model('entry');
            let affectedRows;
            if (data.id) {
                affectedRows = await model.where({ id: data.id }).update(data);
            } else {
                affectedRows = await model.add(data);
            }
            if (affectedRows) {
                return this.success(1, '数据更新成功!');
            }
            return this._fail('数据更新失败，请稍后再试！');
        }
    }
};
