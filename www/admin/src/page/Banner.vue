<template>
    <div class="banner">
        <!-- 工具栏 -->
        <Toolbar @add="showDialog()" @del="del()"></Toolbar>
        
        <!-- 正文内容表格 -->
        <el-table :data="list" @selection-change="selChange" border style="width: 100%">
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column prop="title" label="标题" min-width="100"></el-table-column>
            <el-table-column prop="pic" label="图片地址" min-width="80"></el-table-column>
            <el-table-column prop="sid" label="跳转sid" min-width="90"></el-table-column>
            <el-table-column prop="last_update_time" label="最后更新时间" width="180"></el-table-column>
            <el-table-column prop="create_time" label="创建时间" width="180"></el-table-column>
            <el-table-column label="操作" width="140">
                <template slot-scope="scope">
                    <el-button type="text" size="small" icon="el-icon-delete" @click="del(scope.row)">删除</el-button>
                    <el-button type="text" size="small" icon="el-icon-edit" @click="showDialog(scope.row)">编辑</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 弹框 -->
        <el-dialog :title="dislogTitle" :visible.sync="isShowDialog" width="400px" :close-on-click-modal="false">
            <el-form :model="formData">
                <el-form-item label="标题">
                    <el-input v-model="formData.title" placeholder="请输入标题"></el-input>
                </el-form-item>
                <el-form-item label="图片地址">
                    <el-input v-model="formData.pic" placeholder="请输入图片地址"></el-input>
                </el-form-item>
                <el-form-item label="跳转sid">
                    <el-input v-model="formData.sid" placeholder="请输入跳转sid"></el-input>
                </el-form-item>
            </el-form>
            <el-row type="flex" justify="end">
                <el-button type="primary" size="medium" @click="submit">提 交</el-button>
            </el-row>
        </el-dialog>
    </div>
</template>

<script>
import myMinix from '@/assets/js/minix';
export default {
    name: "banner",
    data(){
        return {
            addUrl: 'banner/add',
            delUrl: 'banner/del',
            listUrl: 'banner/list',
            updateUrl: 'banner/update',
        }
    },
    mixins: [myMinix],
    methods: {
        // 获取弹框标题
        getDialogTitle(isEdit){
            return isEdit ? '编辑Banner' : '新增Banner'
        }
    }
};
</script>