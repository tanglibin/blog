const Base = require('./base.js');

/**
 * 首页
 */
module.exports = class extends Base {

    //获取完整统计数据
    async sumAction(){
        let model1 = this.model('journal_info');
        const result = await model1.transaction(async () => {
            let c1 = await model1.count();

            let model2 = this.model('tool').db(model1.db());
            let c2 = await model2.count();

            let model3 = this.model('album').db(model2.db());
            let c3 = await model3.sum('pic_count');

            let model4 = this.model('footprint').db(model3.db());
            let c4 = await model4.count();

            return {
                journal: c1,
                tool: c2,
                album: c3,
                footprint: c4
            }
        })
        return this.success(result);
    }

    //获取月份统计数据
    async chatAction(){
        let year = this.ctx.param('year');
        let model = this.model('journal_info');
        let list = await model.query("select "+
                    "ifnull(sum(case date_format(b.create_time,'%m') when 01 then 1 else 0 end ),0) '1', "+
                    "ifnull(sum(case date_format(b.create_time,'%m') when 02 then 1 else 0 end ),0) '2', "+
                    "ifnull(sum(case date_format(b.create_time,'%m') when 03 then 1 else 0 end ),0) '3', "+
                    "ifnull(sum(case date_format(b.create_time,'%m') when 04 then 1 else 0 end ),0) '4', "+
                    "ifnull(sum(case date_format(b.create_time,'%m') when 05 then 1 else 0 end ),0) '5', "+
                    "ifnull(sum(case date_format(b.create_time,'%m') when 06 then 1 else 0 end ),0) '6', "+
                    "ifnull(sum(case date_format(b.create_time,'%m') when 07 then 1 else 0 end ),0) '7', "+
                    "ifnull(sum(case date_format(b.create_time,'%m') when 08 then 1 else 0 end ),0) '8', "+
                    "ifnull(sum(case date_format(b.create_time,'%m') when 09 then 1 else 0 end ),0) '9', "+
                    "ifnull(sum(case date_format(b.create_time,'%m') when 10 then 1 else 0 end ),0) '10',"+
                    "ifnull(sum(case date_format(b.create_time,'%m') when 11 then 1 else 0 end ),0) '11',"+
                    "ifnull(sum(case date_format(b.create_time,'%m') when 12 then 1 else 0 end ),0) '12' "+
                    `from journal_info b where date_format(b.create_time,'%Y') = ${year}`);
        return this.success(list[0]);
    }
};
