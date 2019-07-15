<template>
    <div class="toolbar">
        <!-- 面包屑 -->
        <el-breadcrumb separator="/">
            <el-breadcrumb-item>{{ $route.name }}</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 工具栏 -->
        <el-row class="tool-bar" type="flex" justify="start" v-if="toolBarLevel">
            <el-button type="warning" icon="el-icon-delete" size="mini" @click="$emit('del')">删除选中</el-button>
            <el-button type="primary" icon="el-icon-circle-plus-outline" size="mini" @click="$emit('add')" v-if="toolBarLevel>=2">新增</el-button>
            <el-button type="success" icon="el-icon-search" size="mini" @click="$emit('openSearch')" v-if="toolBarLevel==3">搜索</el-button>
        </el-row>
    </div>
</template>

<script>
export default {
    name: "toolbar",
    props: {
        toolBarLevel: { //操作按钮级别。 可选值【 0：不展示， 1：展示删除选中； 2：展示删除+新增；3：展示删除+新增+搜索】
            type: Number,
            default: 2
        }
    }
};
</script>