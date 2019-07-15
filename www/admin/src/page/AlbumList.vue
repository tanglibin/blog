<template>
    <div class="album">
        <!-- 工具栏 -->
        <Toolbar :toolBarLevel="3" @add="$router.push('/album/add')" @del="del()" @openSearch="showSearch=true"></Toolbar>
        
        <!-- 正文内容表格 -->
        <el-table :data="list" @selection-change="selChange" border style="width: 100%">
            <el-table-column type="index" :index="getIndex" width="50" label=" " align="center"></el-table-column>
            <el-table-column type="selection" width="40" align="center"></el-table-column>
            <el-table-column prop="name" label="名称" min-width="120" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column prop="sid" label="编号" min-width="100" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column prop="cover" label="封面" min-width="160" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column prop="pic_count" label="照片张数" min-width="80" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column prop="prefix" label="相片目录前缀" min-width="100" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column prop="filming_time" label="拍摄时间" min-width="120" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column label="操作" width="180">
                <template slot-scope="scope">
                    <el-button type="text" size="small" icon="el-icon-delete" @click="del(scope.row)">删除</el-button>
                    <el-button type="text" size="small" icon="el-icon-edit" @click="update(scope.row)">编辑</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination v-if="pager.totalPages>1" @current-change="changePage" :current-page.sync="pager.currentPage" :page-size="pager.pageSize" :total="pager.count" layout="prev, pager, next, jumper"></el-pagination>


        <!-- 数据过滤弹框 -->
        <el-dialog title="搜索" :visible.sync="showSearch" width="600px" :close-on-click-modal="false">
            <el-form label-width="120px" :model="searchData">
                <el-form-item label="名称">
                    <el-input v-model="searchData.name" placeholder="输入名称过滤"></el-input>
                </el-form-item>
                <el-form-item label="编号">
                    <el-input v-model="searchData.sid" placeholder="输入编号过滤"></el-input>
                </el-form-item>
                <el-form-item label="封面">
                    <el-input v-model="searchData.cover" placeholder="输入封面过滤"></el-input>
                </el-form-item>
                <el-form-item label="相片目录前缀">
                    <el-input v-model="searchData.prefix" placeholder="输入相片目录前缀过滤"></el-input>
                </el-form-item>
                <el-form-item label="拍摄时间">
                    <el-date-picker v-model="searchData.range" type="daterange" align="right" value-format="yyyy-MM-dd" unlink-panels range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions2"></el-date-picker>
                </el-form-item>
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
    name: "album",
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
                url: 'album/list',
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
                    url: 'album/del',
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
            this.$router.push('/album/edit/'+rowData.id);
        },
        //搜索
        search(){
            this.getList(true);
        },
    },
    mounted() {
        this.getList();
    },
};
</script>