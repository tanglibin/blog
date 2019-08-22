<template>
    <div class="footprint">
        <!-- 工具栏 -->
        <Toolbar @add="showDialog()" @del="del()"></Toolbar>
        
        <!-- 正文内容表格 -->
        <el-table :data="list" @selection-change="selChange" border style="width: 100%">
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column label="地点" min-width="100">
                <template slot-scope="scope">
                    <span v-text="scope.row.album_name || scope.row.name"></span>
                </template>
            </el-table-column>
            <el-table-column prop="filming_time" label="打卡时间" min-width="80">
                <template slot-scope="scope">
                    <span v-text="scope.row.filming_time || scope.row.record_date"></span>
                </template>
            </el-table-column>
            <el-table-column prop="lng" label="经度" min-width="90"></el-table-column>
            <el-table-column prop="lat" label="纬度" min-width="50"></el-table-column>
            <el-table-column prop="last_update_time" label="最后更新时间" width="180"></el-table-column>
            <el-table-column prop="create_time" label="创建时间" width="180"></el-table-column>
            <el-table-column label="操作" width="140">
                <template slot-scope="scope">
                    <el-button type="text" size="small" icon="el-icon-delete" @click="del(scope.row)">删除</el-button>
                    <el-button type="text" size="small" icon="el-icon-edit" @click="showDialog(scope.row)">编辑</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination v-if="pager.totalPages>1" @current-change="changePage" :current-page.sync="pager.currentPage" :page-size="pager.pageSize" :total="pager.count" layout="prev, pager, next, jumper"></el-pagination>

        <!-- 弹框 -->
        <el-dialog :title="dislogTitle" :visible.sync="isShowDialog" width="600px" :close-on-click-modal="false">
            <el-form :model="formData" label-width="150px">
                <el-form-item label="相册" v-if="!formData.id">
                    <el-select v-model="albumDataIndex" placeholder="请选择相册" @change="changeAlbum">
                        <el-option v-for="(item, i) in albumList" :key="i" :label="item.name" :value="i"></el-option>
                    </el-select>
                </el-form-item>
                <template v-if="formData.id ? !formData.aid : albumDataIndex===''">
                    <el-form-item label="名称">
                        <el-input v-model="formData.name" placeholder="请输入城市名称"></el-input>
                    </el-form-item>
                    <el-form-item label="时间">
                        <el-date-picker v-model="formData.record_date" type="date" placeholder="选择记录日期" value-format="yyyy-MM-dd"></el-date-picker>
                    </el-form-item>
                </template>
                <el-form-item label="经度">
                    <el-input v-model="formData.lng" placeholder="请输入经度"></el-input>
                </el-form-item>
                <el-form-item label="纬度">
                    <el-input v-model="formData.lat" placeholder="请输入纬度"></el-input>
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
    name: "footprint",
    data(){
        return {
            addUrl: 'footprint/add',
            delUrl: 'footprint/del',
            listUrl: 'footprint/list',
            updateUrl: 'footprint/update',
            pager:{
                currentPage: 1, //当前页
                count: 0, //总数
                totalPages: 0,//总页数
                pageSize: 10, //每页显示数量
            },
            requestAlbumed: false, //是否请求相册数据成功
            albumList: [],
            albumDataIndex: ''
        }
    },
    watch: {
        isShowDialog(nv){
            nv && !this.requestAlbumed && this.getAlbum();
            if(!nv){
                setTimeout(()=>{
                    this.albumDataIndex = '';
                    this.formData = {};
                }, 800)
            }
        }
    },
    mixins: [myMinix],
    methods: {
        // 获取弹框标题
        getDialogTitle(isEdit){
            return isEdit ? '编辑足迹信息' : '新增足迹信息'
        },
        //翻页
        changePage(currentPage){
             this.pager.currentPage = currentPage;
             this.getList();
        },
        // 获取数据
        getList(){
            let {currentPage, pageSize} = this.pager;
            this.$Common.sendRequest({
                url: this.listUrl,//在.vue 文件中定义
                data: {currentPage, pageSize},
                success: (result) => {
                    this.list = result.data;
                    //刷新分页数据
                    let {count, totalPages, pageSize, currentPage} = result;
                    this.pager = {count, totalPages, pageSize, currentPage};
                }
            });
        },
        // 新增
        fnAdd(){
            this.albumDataIndex = '';
            this.getList();
        },
        // 删除
        fnDel(len){
            let pager = this.pager;
            if(pager.currentPage == pager.totalPages && Math.ceil( (pager.count - len) / pager.pageSize ) < pager.totalPages){
                pager.currentPage -= 1;
            }
            this.getList();
        },
        // 获取相册数据
        getAlbum(){
            this.$Common.sendRequest({
                url: 'album/getParent',
                success: (result) => {
                    this.albumList = result;
                    this.requestAlbumed = true;

                    let aid = this.formData.aid;
                    // 编辑默认选中
                    if(result.length && aid){
                        this.albumDataIndex = result.findIndex(item=>item.id == aid);
                    }
                }
            });
        },
        // 修改相册选择
        changeAlbum(v){
            const album = this.albumList[v];
            this.formData.aid = album.id;
        }
    }
};
</script>