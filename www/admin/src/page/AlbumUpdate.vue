<template>
    <div class="albumupdate">
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
                <template v-if="!childCount">
                    <el-form-item label="相片目录前缀">
                        <el-input v-model="formData.prefix" type="text" placeholder="相片目录前缀"></el-input>
                    </el-form-item>
                    <el-form-item label="拍摄时间">
                        <el-date-picker v-model="formData.filming_time" type="date" placeholder="选择日期" value-format="yyyy-MM-dd"></el-date-picker>
                    </el-form-item>
                    <el-form-item label="相片名称">
                        <el-input v-model="formData.photos" type="textarea" placeholder="请输入相片名称,逗号+换行分隔"></el-input>
                    </el-form-item>
                </template>
                <el-row type="flex" justify="start">
                    <el-button type="primary" size="medium" @click="submit()">提 交</el-button>
                </el-row>
            </el-form>
        </section>
    </div>
</template>

<script>
export default {
    name: "albumupdate",
    data() {
        return {
            editData: {}, //编辑原始数据
            formData: {}, //表单
            childCount: 0, //子目录条数
        };
    },
    methods: {
        // 获取数据
        getData(){
            this.$Common.sendRequest({
                url: 'album/find',
                data: {id: this.$route.params.id},
                success: (result) => {
                    this.editData = Object.assign({}, result.self);
                    this.formData = result.self;
                    this.childCount = result.childCount;
                },
                error: ()=> {
                    this.$router.go(-1);
                }
            });
        },
        // 修改
        submit(){
            let formData = this.formData, 
                editData = this.editData;

            if(JSON.stringify(formData) == JSON.stringify(editData)){
                return this.$Common.message('当前没有改动！');
            }

            //请求发送
            this.$Common.sendRequest({
                url: 'album/update',
                type: 'POST',
                data: {form: JSON.stringify(formData)},
                success: () => {
                    this.$router.push('/album');
                }
            });
        }
    },
    mounted() {
        this.getData();
    },
};
</script>