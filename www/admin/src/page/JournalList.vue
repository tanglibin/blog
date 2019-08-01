<template>
    <div class="journal">
        <!-- 工具栏 -->
        <Toolbar :toolBarLevel="3" @add="$router.push('/journal/add')" @del="del()" @openSearch="showSearch=true"></Toolbar>
        
        <!-- 正文内容表格 -->
        <el-table :data="list" @selection-change="selChange" border style="width: 100%">
            <el-table-column type="index" :index="getIndex" width="50" label=" " align="center"></el-table-column>
            <el-table-column type="selection" width="40" align="center"></el-table-column>
            <el-table-column prop="sid" label="跳转sid" width="130"></el-table-column>
            <el-table-column prop="title" label="标题" min-width="300" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column prop="keyword" label="关键字" min-width="160"></el-table-column>
            <el-table-column prop="tag" label="标签" width="120"></el-table-column>
            <el-table-column prop="push" label="是否推送" width="80">
                <template slot-scope="scope">
                    <span v-if="scope.row.push == 0" class="danger">否</span>
                    <span v-else class="success">是</span>
                </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="70">
                <template slot-scope="scope">
                    <span v-if="scope.row.status == 0" class="danger">待发布</span>
                    <span v-else class="success">已发布</span>
                </template>
            </el-table-column>
            <el-table-column prop="issue_time" label="发布时间" width="160"></el-table-column>
            <el-table-column prop="last_update_time" label="最后更新时间" width="160"></el-table-column>

            <el-table-column label="操作" width="260">
                <template slot-scope="scope">
                    <template v-if="scope.row.status == 0">
                        <el-button type="text" size="small" icon="el-icon-upload2" @click="issueToggle(scope.row)">发布</el-button>
                    </template>
                    <template v-else>
                        <el-button type="text" size="small" icon="el-icon-download" @click="issueToggle(scope.row)">下线</el-button>
                        <el-button type="text" size="small" :icon="'el-icon-'+( scope.row.push == 0 ? 'upload2' : 'download' )" @click="fnPush(scope.row)">{{scope.row.push == 0 ? '推送' : '取消推送'}}</el-button>
                    </template>
                    <el-button type="text" size="small" icon="el-icon-edit" @click="update(scope.row)">编辑</el-button>
                    <el-button type="text" size="small" icon="el-icon-delete" @click="del(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination v-if="pager.totalPages>1" @current-change="changePage" :current-page.sync="pager.currentPage" :page-size="pager.pageSize" :total="pager.count" layout="prev, pager, next, jumper"></el-pagination>


        <!-- 数据过滤弹框 -->
        <el-dialog title="搜索" :visible.sync="showSearch" width="600px" :close-on-click-modal="false">
            <el-form :model="searchData">
                <el-form-item label="标题">
                    <el-input v-model="searchData.title" placeholder="输入标题内容过滤"></el-input>
                </el-form-item>
                <el-form-item label="概要">
                    <el-input v-model="searchData.summary" placeholder="输入概要内容过滤"></el-input>
                </el-form-item>
                <el-form-item label="关键字">
                    <el-input v-model="searchData.keyword" placeholder="输入关键字过滤"></el-input>
                </el-form-item>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="标签">
                            <el-select v-model="searchData.tag_id" placeholder="请选择标签">
                                <el-option v-for="(item, i) in tagList" :key="i" :label="item.name" :value="item.id"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="发布状态">
                            <el-radio v-model="searchData.status" :label="0">待发布</el-radio>
                            <el-radio v-model="searchData.status" :label="1">已发布</el-radio>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="发布时间" v-if="searchData.status==1">
                    <el-date-picker v-model="searchData.range" type="daterange" align="right" value-format="yyyy-MM-dd HH:mm:ss" unlink-panels range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions2"></el-date-picker>
                </el-form-item>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="是否推荐">
                            <el-radio v-model="searchData.push" :label="1">是</el-radio>
                            <el-radio v-model="searchData.push" :label="0">否</el-radio>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="文章类型">
                            <el-radio v-model="searchData.type" :label="0">单章</el-radio>
                            <el-radio v-model="searchData.type" :label="1">多章</el-radio>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <el-row type="flex" justify="end">
                <el-button type="warning" size="medium" @click="searchData={}">重  置</el-button>
                <el-button type="primary" size="medium" @click="search">搜  索</el-button>
            </el-row>
        </el-dialog>
    </div>
</template>

<script>
import Toolbar from '@/components/Toolbar'

export default {
    name: "journal",
    components: {Toolbar},
    data() {
        return {
            list : [],// 数据
            selRowsData : [], //选中数据
            pager:{
                currentPage: 1, //当前页
                count: 0, //总数
                totalPages: 0,//总页数
                pageSize: 10, //每页显示数量
            },
            showSearch: false, //是否显示搜索表单弹框
            searchData:  {}, //搜索表单数据
            tagList: [], //标签数据
            tagRequested: false, //标志标签数据是否请求完成
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
        };
    },
    watch: {
        showSearch(nv){
            nv && !this.tagRequested && this.getTag();
        }
    },
    methods: {
        //选中回调
        selChange(datas){
            this.selRowsData = datas;
        },
        //获取索引值
        getIndex(index){
            return (this.pager.currentPage - 1) *10 + index + 1;
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
                url: 'journal/list',
                data: param,
                success: (result) => {
                    this.list = result.data;
                    this.showSearch = false;
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
        //发布|下线
        issueToggle(rowData){
            let msg = rowData.status == 0 ? '发布' : '下线';
            let targetStatus = [1,0][rowData.status];
            this.$Common.confirm(`此操作将${msg}该日志, 是否继续?`, ()=>{
                //解禁或禁用操作
                this.$Common.sendRequest({
                    url: 'journal/issue',
                    type: 'POST',
                    data: {
                        id: rowData.id,
                        status: targetStatus
                    },
                    success: (result) => {
                        Object.assign(rowData, result);
                    }
                });
            });
        },
        // 推送操作
        fnPush(rowData){
            let msg = rowData.push == 0 ? '推送' : '取消推送';
            let targetStatus = [1,0][rowData.push];
            this.$Common.confirm(`此操作将${msg}该日志, 是否继续?`, ()=>{
                //解禁或禁用操作
                this.$Common.sendRequest({
                    url: 'journal/push',
                    type: 'POST',
                    data: {
                        id: rowData.id,
                        push: targetStatus
                    },
                    success: (result) => {
                        Object.assign(rowData, result);
                    }
                });
            });
        },
        //删除
        del(rowData){
            rowData = rowData ? [rowData] : this.selRowsData;
            if(!rowData.length){
                return this.$Common.message("请选择要删除的数据");
            }
            this.$Common.confirm('此操作将删除选中数据, 是否继续?', ()=>{
                //删除操作
                let ids = rowData.map(item=>item.id);
                this.$Common.sendRequest({
                    url: 'journal/del',
                    type: 'POST',
                    data: {id: ids},
                    success: (result) => {
                        let pager = this.pager;
                        if(pager.currentPage == pager.totalPages && Math.ceil( (pager.count - rowData.length) / pager.pageSize ) < pager.totalPages){
                            pager.currentPage -= 1;
                        }
                        this.getList();
                    }
                });
            });
        },
        //修改
        update(rowData){
            this.$router.push('/journal/edit/'+rowData.id);
        },
        //搜索
        search(){
            this.getList(true);
        },
        /** 获取标签数据*/
        getTag(){
            this.$Common.sendRequest({
                url: 'journal/getTags',
                success: (result) => {
                    this.tagList = result;
                    this.tagRequested = true;
                }
            });
        },
    },
    mounted() {
        this.getList();
    },
};
</script>