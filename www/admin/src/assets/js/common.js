import Vue from 'vue'
import axios from 'axios';

const Common = {
    /**
     * Confirm 确认框
     * @param {String} msg 消息内容
     * @param {Function} callback  选择'确定'按钮回调
     * @param {Function} err  选择'取消'按钮回调
     */
    confirm: (msg, callback, err) => {
        Vue.prototype.$confirm(msg, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(callback).catch(err || (() => {}));
    },

    /**消息提示*/
    message: (msg) => {
        if(this.ing){
            return ;
        }
        Vue.prototype.$message(msg)
        this.ing = true;
        setTimeout(() => {
            this.ing = false;
        }, 300);
    },

    /**
     * 设置Cookie
     * @param {String} name 名称
     * @param {String} val  值
     * @param {Number} daley 保存时长(s)
     */
    setCookie(name, val, daley){
        let exdate = new Date();
        exdate.setTime(exdate.getTime() + (daley * 1000));
        document.cookie = (name + '=' + escape(val) + (isNaN(daley) ? '' : ';expires=' + exdate.toGMTString()));
    },

    /**
     * 获取Cookie
     * @param {String} name 名称
     */
    getCookie(name){
        let arr = document.cookie.match(new RegExp('(^| )' + name + '=([^;]*)(;|$)'));
        if(arr != null) return unescape(arr[2]);
        return null;
    },

    /**
     * 服务端请求
     * @param op {Object} 请求配置参数
     */
    sendRequest: (op) => {
        let loading;
        let axiosParam = {
            url: '/adminapi/' + op.url,
            method: op.type || 'get',
            headers: { 'X-Requested-With': 'XMLHttpRequest' },
            //响应之前
            transformResponse: [function(data) {
                // 对 data 进行任意转换处理
                loading.close();
                return data;
            }]
        }

        //请求参数添加
        if (op.data) {
            var params = new URLSearchParams();
            for (let key in op.data) {
                params.append(key, op.data[key]);
            }
            if (axiosParam.method == 'get') {
                axiosParam.params = params;
            } else {
                axiosParam.data = params;
            }
        }

        new Promise(function(resolve, reject) {
            //显示loading
            loading = Vue.prototype.$loading.service({ background: "rgba(0,0,0,0.6)" });
            //请求发送
            axios(axiosParam).then(result => {
                result = JSON.parse(result.data);
                result.errno === 0 ? resolve(result) : reject(result);
            }).catch(reject);

        }).then(({ data, errmsg }) => {
            errmsg && Common.message(errmsg);
            op.success(data);

        }).catch(({ errno, data, errmsg='网络异常，请稍后再试~！'})=>{
            Common.message(errmsg);
            errno == 401 ? document.getElementById('app').__vue__.$router.push('/login') : (op.error && op.error(data));
        });
    },

    /**
     * 校验用户名输入是否合法
     */
    validUserName: (username) => /[a-z0-9]+/.test(username),

    /**日期返回选择工具方法 */
    dataRangeShort: (picker) => {
        const end = new Date();
        const start = new Date();
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
        picker.$emit('pick', [start, end]);
    }
};

export default Common;