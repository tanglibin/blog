<template>
    <div class="albumadd">
        <!-- 面包屑 -->
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item :to="{ path: '/album' }">相册管理</el-breadcrumb-item>
            <el-breadcrumb-item>{{ $route.name }}</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 正文表单 -->
        <section class="form-wrap">
            <el-form :model="formData" label-width="120px">
                <el-form-item label="名称">
                    <el-input v-model="formData.name" type="text" placeholder="请输入相册名称"></el-input>
                </el-form-item>
                <el-form-item label="封面">
                    <el-input v-model="formData.cover" type="tex" placeholder="请输入封面文件名称"></el-input>
                </el-form-item>
                <el-row>
                    <el-col :span="4">
                        <el-form-item label="是否存在父目录">
                            <el-radio v-model="hasParent" :label="1">是</el-radio>
                            <el-radio v-model="hasParent" :label="0">否</el-radio>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <template v-if="hasParent">
                            <el-form-item label="父目录" class="contain-add">
                                <el-select v-model="formData.pid" placeholder="请选择父目录" @change="changeParent">
                                    <el-option v-for="(item, i) in parentList" :key="i" :label="item.name" :value="item.id"> </el-option>
                                </el-select>
                                <div class="add-btn" @click="showAddParentDialog=true">+</div>
                            </el-form-item>
                        </template>
                    </el-col>
                </el-row>
                <el-form-item label="相片目录前缀">
                    <el-input v-model="formData.prefix" type="text" placeholder="相片目录前缀"></el-input>
                </el-form-item>
                <el-form-item label="拍摄时间">
                    <el-date-picker v-model="formData.filming_time" type="date" placeholder="选择日期" value-format="yyyy-MM-dd"></el-date-picker>
                </el-form-item>
                <el-form-item label="相片名称">
                    <el-input v-model="formData.photos" type="textarea" placeholder="请输入相片名称,逗号+换行分隔"></el-input>
                </el-form-item>
                <el-row type="flex" justify="start">
                    <el-button type="primary" size="medium" @click="submit(formData)">提 交</el-button>
                </el-row>
            </el-form>
        </section>

        <!-- 新增父目录弹框 -->
        <el-dialog title="新增父目录" :visible.sync="showAddParentDialog" width="400px" :close-on-click-modal="false">
            <el-form :model="parForm">
                <el-form-item label="名称">
                    <el-input v-model="parForm.name" placeholder="请输入名称"></el-input>
                </el-form-item>
                <el-form-item label="封面">
                    <el-input v-model="parForm.cover" placeholder="请输入封面地址"></el-input>
                </el-form-item>
                <el-form-item label="踏足时间">
                    <el-date-picker v-model="parForm.filming_time" type="date" placeholder="选择日期" value-format="yyyy-MM-dd"></el-date-picker>
                </el-form-item>
            </el-form>
            <el-row type="flex" justify="end">
                <el-button type="primary" size="medium" @click="submit(parForm, 1)">提 交</el-button>
            </el-row>
        </el-dialog>

        <!-- 迁移父目录文件 -->
        <el-dialog title="迁移父目录文件" :visible.sync="showMigrateDialog" width="400px" :close-on-click-modal="false">
            <el-form :model="migrateForm">
                <el-form-item label="名称">
                    <el-input v-model="migrateForm.name" placeholder="请输入名称"></el-input>
                </el-form-item>
                <el-form-item label="封面">
                    <el-input v-model="migrateForm.cover" placeholder="请输入封面地址"></el-input>
                </el-form-item>
                <el-form-item label="相片目录前缀">
                    <el-input v-model="migrateForm.prefix" type="text" placeholder="请输入关键字，无需包含标签"></el-input>
                </el-form-item>
            </el-form>
            <el-row type="flex" justify="end">
                <el-button type="primary" size="medium" @click="migrateSubmit()">提 交</el-button>
            </el-row>
        </el-dialog>
    </div>
</template>

<script>
export default {
    name: "albunadd",
    data() {
        return {
            hasParent: 0, //是否存在父目录
            requestEd: false, //父目录是否请求成功
            formData: {},  // 表单对象
            parentList : [], //父目录

            showAddParentDialog: false, //是否展示新增父目录弹框
            parForm: {p: 1}, //新增父目录对象

            showMigrateDialog: false, //是否显示迁移文件弹框
            migrateForm: {}, //迁移对象
        };
    },
    watch: {
        hasParent(nv){
            nv && !this.requestEd && this.getParentList();
        }
    },
    methods: {
        /* 获取父目录数据*/
        getParentList(){
            this.$Common.sendRequest({
                url: 'album/getParent',
                success: (result) => {
                    this.parentList = result;
                    this.requestEd = true;
                }
            });
        },

        /* 修改父目录*/
        changeParent(v){
            let parent = this.parentList.find(item=>{return item.id==v});
            // 在所选的父目录已包含照片的情况下， 要求迁移现有文件
            if(parent.photos){
                this.$Common.confirm('当前所选父目录已包含文件，需对现有文件进行迁移，是否继续?', ()=>{
                    this.showMigrateDialog = true;
                }, ()=>{
                    this.formData.pid = '';
                });
            }
        },

        /** 迁移父目录原有文件 */
        migrateSubmit(){
            let parent = this.parentList.find(item=>{return item.id==this.formData.pid});
            Object.assign(this.migrateForm, {
                pid: parent.id,
                photos: parent.photos,
                filming_time: parent.filming_time,
                pic_count: parent.pic_count
            });

            this.$Common.sendRequest({
                url: 'album/migrate',
                type: 'POST',
                data: this.migrateForm,
                success: ()=>{
                    this.showMigrateDialog = false;
                },
                error: ()=>{
                    this.formData.pid = '';
                }
            });
        },

        /* 提交*/
        submit(data, isParent){
            this.$Common.sendRequest({
                url: 'album/add',
                type: 'POST',
                data: data,
                success: (result) => {
                    // 新增父目录处理
                    if(isParent){
                        this.parentList.unshift(result);
                        this.formData.pid = result.id;
                        this.parForm = {p: 1};
                        this.showAddParentDialog = false;
                        return ;
                    }
                    this.$router.push('/album');
                }
            });
        }
    },
};
</script>