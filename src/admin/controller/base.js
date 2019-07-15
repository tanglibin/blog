module.exports = class extends think.Controller {
    async __before() {
        const { controller, action } = this.ctx;
        if (controller === 'user' && action === 'login') {
            return;
        }
        let username = await this.session('username');
        if (!username) {
            if (this.isAjax()) {
                return this._fail('请先登录', null, 401);
            }
        }
        if (!this.isAjax()) {
            this.assign('loginName', username);
        }
    }

    /**
       * 如果相应的Action不存在则调用该方法
       */
    async __call() {
        return this._fail('接口不存在', null, 404);
    }

    /**
     * 请求失败
     */
    async _fail(msg, data, code = 500) {
        return this.fail(code, msg, data);
    }
};
