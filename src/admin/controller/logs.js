const Base = require('./base.js');

/**
 * 登录日志
 */
module.exports = class extends Base {

    //查询
    async listAction() {
        if(this.isPost){
            let data = this.post(), param = {};
            // 登录端
            if(data.login_type){
                param['login_type'] = data.login_type;
            }
            //过滤状态
            if(data.status){
                param['status'] = data.status;
            }
            // 过滤类型
            if(data.ip){
                param['ip'] = data.ip;
            }
            
            //起始时间
            if(data.range){
                data.range = data.range.split(',');
                let endTime = data.range[1].replace('00:00:00', '23:59:59');
                param['issue_time'] = {'>': data.range[0], '<': endTime};
            }
            
            let model = this.model('login_log');
            let list = await model.where(param).order('login_time desc').page(data.currentPage, data.pagesize).countSelect();
            return this.success(list);
        }
    }

    // 解锁IP
    async unlockAction(){
        if(this.isPost){
            let data = this.post();
            let model = this.model('login_error');
            let flg = await model.where(data).delete();
            if(flg){
                return this.success(1, '解锁成功!');
            }
            return this._fail('解锁失败，请稍后再试！');
        }
    }

    //清空日志数据
    async truncateAction(){
        let model = this.model('login_log');
        await model.execute('truncate table login_log');
        return this.success(1, '清空成功!');
    }
};
