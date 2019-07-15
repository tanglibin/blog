import Vue from 'vue'
import Router from 'vue-router'

//错误页面
import Error from '@/page/Error'
//管理后台容器页面
import Container from '@/components/Container'
//子页面路由分发
import ChildView from '@/page/ChildView'
//登录
import Login from '@/page/Login'
//首页
import Home from '@/page/Home'
//密匙
import Key from '@/page/Key'
//Banner管理
import Banner from '@/page/Banner'
//日志管理
import JournalList from '@/page/JournalList'
import JournalUpdate from '@/page/JournalUpdate'
//工具
import Tool from '@/page/Tool'
//足迹
import Footprint from '@/page/Footprint'
//相册
import AlbumList from '@/page/AlbumList'
import AlbumAdd from '@/page/AlbumAdd'
import AlbumUpdate from '@/page/AlbumUpdate'
//随览
import Follow from '@/page/Follow'
//登录日志
import Logs from '@/page/Logs'



Vue.use(Router);
export default new Router({
    routes: [{
        path: '/',
        component: Container,
        redirect: '/home',
        children: [
            { path: 'home', component: Home, name: "首页" },
            { path: 'key', component: Key, name: "密钥管理" },
            { path: 'banner', component: Banner, name: "Banner管理" },
            { path: 'journal', component: ChildView, redirect: '/',
                children: [
                    { path: '/', component: JournalList, name: "日志管理" },
                    { path: 'add', component: JournalUpdate, name: "新增日志" },
                    { path: 'edit/:id', component: JournalUpdate, name: "编辑日志" }
                ]
            },
            { path: 'tool', component: Tool, name: "工具管理" },
            { path: 'footprint', component: Footprint, name: "足迹管理" },
            { path: 'album', component: ChildView, redirect: '/',
                children: [
                    { path: '/', component: AlbumList, name: "相册管理" },
                    { path: 'add', component: AlbumAdd, name: "新增相册" },
                    { path: 'edit/:id', component: AlbumUpdate, name: "编辑相册" }
                ]
            },
            { path: 'follow', component: Follow, name: "相册随览" },
            { path: 'logs', component: Logs, name: "登录日志" },
        ]},
        {
            path: '/login',
            component: Login,
            meta: {
                requireAuth: false,  // 添加该字段，表示进入这个路由是不需要登录的
            },
            name: "登录"
        },
        {
            path: '*',
            meta: {
                requireAuth: false,  // 添加该字段，表示进入这个路由是不需要登录的
            },
            component: Error
        }
    ]
});