<template>
    <div class="logs">
        <!-- 工具栏 -->
        <div class="toolbar">
            <!-- 面包屑 -->
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $route.name }}</el-breadcrumb-item>
            </el-breadcrumb>

            <!-- 工具栏 -->
            <el-row class="tool-bar" type="flex" justify="start">
                <el-button type="warning" size="mini" @click="truncate">清空数据</el-button>
                <el-button type="primary" size="mini" @click="showUnlockPop=true">解锁IP</el-button>
                <el-button type="success" size="mini" @click="showSearchPop=true">搜索</el-button>
            </el-row>
        </div>
        
        <!-- 正文内容表格 -->
        <el-table :data="list" border style="width: 100%">
            <el-table-column prop="ip" label="IP" min-width="100"></el-table-column>
            <el-table-column prop="login_type" label="登录端" min-width="100">
                <template slot-scope="scope">
                    <span v-if="scope.row.login_type == 0" class="success">前台</span>
                    <span v-else class="danger">后台</span>
                </template>
            </el-table-column>
            <el-table-column prop="status" label="登录状态" min-width="100">
                <template slot-scope="scope">
                    <span v-if="scope.row.status == 1" class="success">成功</span>
                    <span v-else class="danger">失败</span>
                </template>
            </el-table-column>
            <el-table-column prop="login_time" label="登录时间" min-width="180"></el-table-column>
        </el-table>
        <el-pagination v-if="pager.totalPages>1" @current-change="changePage" :current-page.sync="pager.currentPage" :page-size="pager.pageSize" :total="pager.count" layout="prev, pager, next, jumper"></el-pagination>


        <!-- 数据过滤弹框 -->
        <el-dialog title="搜索" :visible.sync="showSearchPop" width="600px" :close-on-click-modal="false">
            <el-form :model="searchData">
                <el-form-item label="IP">
                    <el-input v-model="searchData.ip" placeholder="请输入IP"></el-input>
                </el-form-item>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="登录端">
                            <el-radio v-model="searchData.login_type" :label="0">前台</el-radio>
                            <el-radio v-model="searchData.login_type" :label="1">后台</el-radio>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="登录状态">
                            <el-radio v-model="searchData.status" :label="0">失败</el-radio>
                            <el-radio v-model="searchData.status" :label="1">成功</el-radio>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="登录时间">
                    <el-date-picker v-model="searchData.range" type="daterange" align="right" value-format="yyyy-MM-dd HH:mm:ss" unlink-panels range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions2"></el-date-picker>
                </el-form-item>
            </el-form>
            <el-row type="flex" justify="end">
                <el-button type="warning" size="medium" @click="searchData={}">重  置</el-button>
                <el-button type="primary" size="medium" @click="search">搜  索</el-button>
            </el-row>
        </el-dialog>

        <!-- 解锁IP，IP输入弹框 -->
        <el-dialog title="解锁IP" :visible.sync="showUnlockPop" width="400px" :close-on-click-modal="false">
            <el-form :model="unLockData" label-width="60px">
                <el-form-item label="IP">
                    <el-input v-model="unLockData.ip" placeholder="请输入IP"></el-input>
                </el-form-item>
            </el-form>
            <el-row type="flex" justify="end">
                <el-button type="primary" size="medium" @click="unlock">解 锁</el-button>
            </el-row>
        </el-dialog>
    </div>
</template>

<script>
export default {
    name: "logs",
    data(){
        return {
            showUnlockPop: false, //是否展示解锁IP，IP输入弹框
            showSearchPop: false, //是否展示搜索过滤内容填写弹框
            list : [],// 数据
            pager:{
                currentPage: 1, //当前页
                count: 0, //总数
                totalPages: 0,//总页数
                pageSize: 10, //每页显示数量
            },
            unLockData: {}, //解锁数据表单
            searchData: {}, //搜索数据表单
            pickerOptions2: {
                shortcuts: [{
                    text: '最近一周',
                    onClick(picker) {
                        this.$Common.dataRangeShort(picker, 7);
                    }
                }, {
                    text: '最近一个月',
                    onClick(picker) {
                        this.$Common.dataRangeShort(picker, 30);
                    }
                }, {
                    text: '最近三个月',
                    onClick(picker) {
                        this.$Common.dataRangeShort(picker, 90);
                    }
                }]
            },
        }
    },
    mounted() {
        this.getList();
    },
    methods: {
        // 搜索
        search(){
            this.getList(true);
        },
        //获取数据
        getList(isSearch){
            let param = {currentPage: 1, pageSize: 10};
            if(!isSearch){
                let {currentPage, pageSize} = this.pager;
                param = {currentPage, pageSize};
            }
            param = Object.assign({}, this.searchData, param);
            
            this.$Common.sendRequest({
                type: "POST",
                url: 'logs/list',
                data: param,
                success: (result) => {
                    this.list = result.data;
                    this.showSearchPop = false;
                    //刷新分页数据
                    let {count, totalPages, pageSize, currentPage} = result;
                    this.pager = {count, totalPages, pageSize, currentPage};
                }
            });
        },
        //翻页
        changePage(currentPage){
             this.pager.currentPage = currentPage;
             this.getList();
        },
        // 解锁IP
        unlock(){
            this.$Common.sendRequest({
                type: "POST",
                url: 'logs/unlock',
                data: this.unLockData,
                success: ()=>{
                    this.showUnlockPop = false;
                }
            });
        },
        // 清空数据
        truncate(){
            this.$Common.sendRequest({
                url: 'logs/truncate',
                success: ()=>{
                    this.list = [];
                    this.pager.totalPages = 0;
                }
            });
        },
    }
};
</script>