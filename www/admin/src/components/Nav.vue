<template>
    <div class="nav">
        <el-menu :default-active="$route.path" router>
            <el-menu-item index="/home" style="display:none"></el-menu-item>
            <el-menu-item v-for="(item, index) in navList" :key="index" :index="item.route">
                <i :class="item.icon"></i>
                <span slot="title">{{item.name}}</span>
            </el-menu-item>
        </el-menu>
    </div>
</template>

<script>
export default {
  name: 'leftNav',
  data() {
    return {
      navList: [
        { name: '密匙管理', route: '/key', icon: 'icon-key' },
        { name: 'Banner管理', route: '/banner', icon: 'icon-banner' },
        { name: '日志管理', route: '/journal', icon: 'icon-journal' },
        { name: '工具管理', route: '/tool', icon: 'icon-tool' },
        { name: '足迹管理', route: '/footprint', icon: 'icon-footprint' },
        { name: '相册管理', route: '/album', icon: 'icon-album' },
        { name: '相册随览', route: '/follow', icon: 'icon-follow' },
        { name: '登录日志', route: '/logs', icon: 'icon-log' },
      ]
    };
  }
};
</script>