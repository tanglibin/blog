const Base = require('./base.js');

/**
 * 登录注销
 */
module.exports = class extends Base {

    //登录
    async loginAction(){
        if(this.isPost){
            let data = this.post();
            let {username, password} = data;
            let model = this.model('user');
            let model1 = this.model('login_log');
            let model2 = this.model('login_error');
            let ip = this.ctx.ip;

            // 查询ip登录失败次数， 若大于等于3， 则不予通过访问
            let count = await model2.where({ip: ip, login_type: 1}).count();
            if(count>=3){
                return this._fail('用户名或密码错误，请重新输入!', {errTime: count});
            }

            let info = await model.where({username, password}).find();
            if(think.isEmpty(info)){
                // 记录失败日志
                model1.add({ip: ip, login_type: 1, status: 0, login_time: think.datetime(new Date())});
                // 添加录失败记录表数据
                model2.add({ip: ip, login_type: 1});
                return this._fail('用户名或密码错误，请重新输入!', {errTime: count+1});
            }

            // 记录成功日志
            model1.add({ip: ip, login_type: 1, status: 1, login_time: think.datetime(new Date())});
            // 登录成功删除登录失败记录表数据
            model2.where({ip: ip, login_type: 1}).delete();

            await this.session('username', info.username);
            return this.success(1, '登录成功！');
        }
    }

    //注销
    async logoutAction(){
        await this.session('username', '');
        return this.redirect('/tlbgl/#/login');
    }
};
