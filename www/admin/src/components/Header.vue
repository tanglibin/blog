<template>
    <el-row type="flex" justify="space-between" align="middle">
        <router-link to="/home"><i class="icon-computer-logo"></i></router-link>
        <el-row type="flex" class="user-skin" align="middle" @click.native="logout">
            <span v-text="username"></span>
            <i class="icon-avatar"></i>
        </el-row>
    </el-row>
</template>

<script>
import Common from '../assets/js/common';
export default {
    name: "headerBar",
    data() {
        return {
            username : this.$Common.getCookie('u')
        };
    },
    methods: {
        //退出登录
        logout(){
            Common.confirm('此操作将注销登录, 是否继续?', ()=>{
                Common.sendRequest({
                    url: 'user/logout',
                    success: (result) => {}
                });
            });
        }
    }
};
</script>