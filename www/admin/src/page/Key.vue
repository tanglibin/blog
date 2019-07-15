<template>
    <div class="keywrap">
        <toolbar :toolBarLevel="0"></toolbar>
        <el-form :model="formData">
            <el-form-item label="密钥值">
                <el-input v-model="formData.val" placeholder="请输入4位密钥"></el-input>
            </el-form-item>
        </el-form>
        <el-row type="flex" justify="start">
            <el-button type="primary" size="medium" @click="update">提 交</el-button>
        </el-row>
    </div>
</template>

<script>
import Toolbar from '@/components/Toolbar'
export default {
    name: "key",
    components: {Toolbar},
    data() {
        return {
            formData: {}, //表单数据对象
        };
    },
    methods: {
        getData(){
            this.$Common.sendRequest({
                url: 'key/getData',
                success: (result) => {
                    this.formData = result;
                }
            });
        },
        update(){
            this.$Common.sendRequest({
                url: 'key/update',
                type: 'POST',
                data: this.formData
            });
        }
    },
    mounted() {
        this.getData();
    },
};
</script>