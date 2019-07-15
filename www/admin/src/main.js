import Vue from 'vue'
import router from './router'
import App from './App'

//按需加载Element-ui
import 'element-ui/lib/theme-chalk/index.css';
import element from '@/assets/js/element_ui'
Vue.use(element);

//加载全局样式文件
import less from './assets/less/main.less';

// 公共js挂载
import Common from '@/assets/js/common';
Vue.prototype.$Common = Common;

//启动时是否生成生产提示
Vue.config.productionTip = false

//路由拦截为登录
router.beforeEach((to, from, next) => {
    if(to.meta.requireAuth === false){
        return next();
    }
    if (!Common.getCookie('u')) {
        return next({
            path: '/login'
        })
    }
    next();
})

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    components: { App },
    template: '<App/>'
})