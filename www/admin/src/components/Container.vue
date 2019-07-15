<template>
    <div class="container">
        <el-container>
            <el-header><HeaderBar></HeaderBar></el-header>
            <el-container class="container">
                <el-aside :style="{height: adaptHeight}"><LeftNav></LeftNav></el-aside>
                <el-main :style="{height: adaptHeight}"><router-view/></el-main>
            </el-container>
        </el-container>
    </div>
</template>

<script>
//头部
import HeaderBar from '@/components/Header'
//菜单
import LeftNav from '@/components/Nav'

export default {
    name: "container",
    data(){
        return {
            adaptHeight : document.body.clientHeight - 60 + 'px'
        }
    },
    mounted() {
        window.onresize = () => this.adaptHeight = document.body.clientHeight - 60 + 'px';
    },
    components: { HeaderBar, LeftNav},
};
</script>