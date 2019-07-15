<template>
    <div class="journalupdate">
        <!-- 面包屑 -->
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item :to="{ path: '/journal' }">日志管理</el-breadcrumb-item>
            <el-breadcrumb-item>{{ $route.name }}</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 正文表单 -->
        <section class="form-wrap">
            <el-form :model="formData">
                <el-form-item label="标题">
                    <el-input v-model="formData.info.title" type="text" placeholder="请输入概要标题"></el-input>
                </el-form-item>
                <el-form-item label="概要">
                    <el-input v-model="formData.info.summary" type="textarea" placeholder="请输入概要内容"></el-input>
                </el-form-item>
                <el-form-item label="关键字">
                    <el-input v-model="formData.info.keyword" type="text" placeholder="请输入关键字，无需包含标签"></el-input>
                </el-form-item>
                <el-row>
                    <el-col :span="6">
                        <el-form-item label="标签" class="contain-add">
                            <el-select v-model="formData.info.tag_id" placeholder="请选择标签" @change="changeTag">
                                <el-option v-for="(item, i) in tagList" :key="i" :label="item.name" :value="item.id"></el-option>
                            </el-select>
                            <div class="add-btn" @click="isShowDialog=true">+</div>
                        </el-form-item>
                    </el-col>
                    <el-col :span="11">
                        <el-row>
                            <el-col :span="18">
                                <el-form-item label="封面地址" class="contain-add">
                                    <el-input v-model="formData.info.cover_url" type="text" placeholder="请输入封面地址"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="2">
                                <el-upload :show-file-list="false" name="upfile" :on-success="uploaded" :action="'/upload?type=up-cover'"><el-button>上传封面</el-button></el-upload>
                            </el-col>
                        </el-row>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="6">
                        <el-form-item label="是否推荐">
                            <el-radio v-model="formData.info.push" :label="1">是</el-radio>
                            <el-radio v-model="formData.info.push" :label="0">否</el-radio>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="是否发布">
                            <el-radio v-model="formData.info.status" :label="1">是</el-radio>
                            <el-radio v-model="formData.info.status" :label="0">否</el-radio>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="文章类型">
                            <el-radio v-model="formData.info.type" :label="0">单章</el-radio>
                            <el-radio v-model="formData.info.type" :label="1">多章</el-radio>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="章节标题" v-if="formData.info.type==1">
                    <input class="chapter-title-enter" type="text" v-model="formData.detail.chapter_title">
                    <el-select v-model="formData.detail.title" clearable placeholder="请选择章节标题" @change="changeChapTitle">
                        <el-option v-for="(item, index) in chapter_title_list" :key="index" :label="item.chapter_title" :value="index"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="内容">
                    <editor v-model="formData.detail.content" :html.sync="formData.detail.content_html" ref="editor"></editor>
                </el-form-item>
                <el-row type="flex" justify="end">
                    <el-button type="warning" size="medium" @click="deleteChap" v-show="formData.detail.id">删除章节</el-button>
                    <el-button type="primary" size="medium" @click="submit()" v-show="formData.info.status == 0">保存章节</el-button>
                    <el-button type="primary" size="medium" @click="submit(1)">完成编辑</el-button>
                </el-row>
            </el-form>
        </section>

        <!-- 新增标签弹框 -->
        <el-dialog title="新增标签" :visible.sync="isShowDialog" width="400px" :close-on-click-modal="false">
            <el-form :model="tagForm">
                <el-form-item label="标签名称">
                    <el-input v-model="tagForm.name" placeholder="请输入标题"></el-input>
                </el-form-item>
            </el-form>
            <el-row type="flex" justify="end">
                <el-button type="primary" size="medium" @click="addTag">提 交</el-button>
            </el-row>
        </el-dialog>
    </div>
</template>

<script>
import Editor from '@/components/Editor'
import myMinix from '@/assets/js/journal_update';
export default {
    name: "journalupdate",
    components: {Editor},
    mixins: [myMinix],
    data() {
        return {
            editId: null, //日志id，编辑时传递
            editData: {}, //编辑原始数据
            formData: {  // 表单对象
                info: {  //概要部分
                    status: 0,
                    push: 0,
                    type: 0,
                    keyword: '',
                    cover_url: ''
                },
                detail: {//详情部分
                    content: ''
                }
            },
            chapter_title_list : [], //章节标题下拉选项数据

            tagList: [], //标签数据
            isShowDialog: false, //是否显示新增标签弹框
            tagForm: {}, //新增标签表单对象
        };
    },
    watch: {
        //路由变化时执行
        '$route'(to, from) {
            this.ready();
        },
    },
    mounted() {
        this.ready();
    },
};
</script>