import Toolbar from '@/components/Toolbar';
export default {
    components: {Toolbar},
    data() {
        return {
            list : [],// 数据
            selRowsData : [], //选中数据
            isShowDialog: false, //是否显示弹框
            dislogTitle: '', //弹框标题
            formData: {}, //表单数据对象
            curRowData: null, //缓存修改数据对象, 用于修改后直接页面更新
        };
    },
    methods: {
        //选中回调
        selChange(datas){
            this.selRowsData = datas;
        },
        //显示弹框
        showDialog(rowData){
            const isEdit = Boolean(rowData);
            //.vue中定义获取标题方法
            this.dislogTitle = this.getDialogTitle(isEdit);
            //清空数据
            this.formData = {};
            //数据填充
            isEdit && (this.formData = Object.assign({}, rowData), this.curRowData = rowData);
            //弹框显示
            this.isShowDialog = true;
        },
        //弹框内提交
        submit(){
            this.formData.id ? this.update() : this.add();
        },
        //新增
        add(){
            this.$Common.sendRequest({
                url: this.addUrl,//在.vue 文件中定义
                type: 'POST',
                data: this.formData,
                success: (result) => {
                    this.fnAdd ? this.fnAdd() : this.list.unshift(result);
                    //关闭弹框
                    this.isShowDialog = false;
                }
            });
        },
        //修改
        update(){
            if(JSON.stringify(this.formData) == JSON.stringify(this.curRowData)){
                return this.$Common.message("当前没有修改任何数据");
            }
            this.$Common.sendRequest({
                url: this.updateUrl,//在.vue 文件中定义
                type: 'POST',
                data: this.formData,
                success: (result) => {
                    Object.assign(this.curRowData, this.formData, result);
                    //关闭弹框
                    this.isShowDialog = false;
                    // 修改回调
                    this.fnUpdate && this.fnUpdate();
                }
            });
        },
        //删除
        del(rowData){
            rowData = rowData ? [rowData] : this.selRowsData;
            if(!rowData.length){
                return this.$Common.message("请选择要删除的数据");
            }
            this.$Common.confirm('此操作将删除选中数据, 是否继续?', ()=>{
                let ids = rowData.map(item => item.id);
                this.$Common.sendRequest({
                    url: this.delUrl,//在.vue 文件中定义
                    type: 'POST',
                    data: {ids: ids},
                    success: () => {
                        this.fnDel ? this.fnDel(rowData.length) : (this.list = this.list.filter(item => !ids.includes(item.id)));
                    }
                });
            });
        },
        // 获取数据集
        getList(){
            this.$Common.sendRequest({
                url: this.listUrl,//在.vue 文件中定义
                success: (result) => {
                    this.list = result;
                }
            });
        },
    },
    mounted() {
        this.getList();
    },
}