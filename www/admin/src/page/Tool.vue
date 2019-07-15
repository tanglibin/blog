<template>
    <div class="tool">
        <!-- 工具栏 -->
        <Toolbar @add="showDialog()" @del="del()"></Toolbar>
        
        <!-- 正文内容表格 -->
        <el-table :data="list" @selection-change="selChange" border style="width: 100%">
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column prop="name" label="名称" min-width="100"></el-table-column>
            <el-table-column prop="type" label="类型" min-width="90"></el-table-column>
            <el-table-column prop="version" label="版本" min-width="50"></el-table-column>
            <el-table-column prop="size" label="大小" min-width="60"></el-table-column>
            <el-table-column prop="photo" label="封面文件名称(100*100)" min-width="110"></el-table-column>
            <el-table-column prop="file_url" label="文件地址" min-width="150" :show-overflow-tooltip="true"></el-table-column>
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
        <el-dialog :title="dislogTitle" :visible.sync="isShowDialog" width="800px" :close-on-click-modal="false">
            <el-form :model="formData" label-width="150px">
                <el-form-item label="名称">
                    <el-input v-model="formData.name" placeholder="请输入名称"></el-input>
                </el-form-item>
                <el-form-item label="类型">
                    <el-input v-model="formData.type" placeholder="请输入类型"></el-input>
                </el-form-item>
                <el-form-item label="版本">
                    <el-input v-model="formData.version" placeholder="请输入版本"></el-input>
                </el-form-item>
                <el-form-item label="大小">
                    <el-input v-model="formData.size" placeholder="请输入大小"></el-input>
                </el-form-item>
                <el-form-item label="封面文件名称">
                    <el-input v-model="formData.photo" placeholder="请输入封面文件名称"></el-input>
                </el-form-item>
                <el-form-item label="文件地址">
                    <el-input v-model="formData.file_url" placeholder="请输入文件地址"></el-input>
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
    name: "tool",
    data(){
        return {
            addUrl: 'tool/add',
            delUrl: 'tool/del',
            listUrl: 'tool/list',
            updateUrl: 'tool/update',
        }
    },
    mixins: [myMinix],
    methods: {
        // 获取弹框标题
        getDialogTitle(isEdit){
            return isEdit ? '编辑工具信息' : '新增工具信息'
        }
    }
};
</script>