export default {
    methods: {
        /** 对应vue mounted钩子*/
        ready(){
            //编辑状态获取数据
            this.editId = this.$route.params.id;
            this.editId && this.getDataById();
            // 获取标签数据
            this.getTag();
        },

        /**封面上传成功 */
        uploaded({url}){
            this.formData.info.cover_url = url;
        },

        /** 获取日志数据*/
        getDataById(){
            this.$Common.sendRequest({
                url: 'journal/find',
                data: {id: this.editId},
                success: (result) => {
                    this.chapter_title_list = result.detail;
                    this.editData = Object.assign({}, result);
                    this.formData = {info: Object.assign({}, result.info), detail:{}};
                    //再次赋值，规避富文本总是填充不到值的问题
                    this.formData.detail = Object.assign({title: 0}, result.detail[0]);
                },
                error: ()=> {
                    this.$router.go(-1);
                }
            });
        },

        /** 获取标签数据*/
        getTag(){
            this.$Common.sendRequest({
                url: 'journal/getTags',
                success: (result) => {
                    this.tagList = result;
                }
            });
        },

        /** 新增标签*/
        addTag(){
            this.$Common.sendRequest({
                url: 'journal/addTag',//在.vue 文件中定义
                type: 'POST',
                data: this.tagForm,
                success: (result) => {
                    this.tagList.unshift(result);// 添加至下拉
                    this.tagForm = {};//清空弹框输入内容
                    this.formData.info.tag_id = result.id;// 下拉内选中
                    this.changeTag(result.id);
                    this.isShowDialog = false;//关闭弹框
                }
            });
        },

        /**更换标签 */
        changeTag(val){
            let tag = this.tagList.find(item => item.id==val),
                keyword = this.formData.info.keyword || '';
            this.formData.info.keyword = tag.name + ',' + keyword;
        },

        /*切换章节标题*/
        changeChapTitle(val){
            let detailData_1 = this.editData.detail,
                detailData_2 = this.formData.detail,
                select = detailData_1[val] || {};
            //页面更新填充标题及内容
            detailData_2.id = select.id || '';
            detailData_2.chapter_title = select.chapter_title || '';
            this.$refs.editor.editor.setValue(select.content || '');
        },

        /**
         * 修改, 不管是否为多章节类型，一次修改提交只能修改一章
         * @param flg {Boolean} 是否完成编辑
         */
        update(flg){
            let formData = this.formData, 
                editData = this.editData,
                param = {};

            //判断当前选中章节有无修改即可
            let curDetail = formData.detail,
                detail = editData.detail[curDetail.title];
            //detail 没值则为新增章节
            if(!detail){
                delete curDetail.id;
                param.detail = JSON.stringify(curDetail);
            }else if(detail.chapter_title != curDetail.chapter_title || detail.content != curDetail.content){
                param.detail = JSON.stringify(curDetail);
            }

            //判断当前是否有改动，若无则提交
            if(JSON.stringify(param) == '{}' && (JSON.stringify(editData.info) == JSON.stringify(formData.info))){
                return this.$Common.message('当前没有改动！');
            }
            param.info = JSON.stringify(formData.info);

            //请求发送
            this.$Common.sendRequest({
                url: 'journal/update',
                type: 'POST',
                data: param,
                success: (result) => {
                    if(flg){
                        return this.$router.push('/journal');
                    }
                    if(detail){
                        Object.assign(detail, curDetail);
                    }else{
                        editData.detail.push(Object.assign({}, curDetail, {id: result}));
                        this.chapter_title_list = editData.detail;
                        curDetail.title = editData.detail.length - 1;
                        this.changeChapTitle(curDetail.title);
                    }
                }
            });
        },
        
        /**
         * 新增提交
         * @param flg {Boolean} 是否完成编辑  
         */
        add(flg){
            let formData = this.formData;
            //请求发送
            this.$Common.sendRequest({
                url: 'journal/add',
                type: 'POST',
                data: {info: JSON.stringify(formData.info), detail: JSON.stringify(formData.detail)},
                success: (result) => {
                    let route = flg ? '/journal' : '/journal/edit/' + result;
                    this.$router.push(route);
                }
            });
        },


        /*删除章节*/
        deleteChap(){
            let editData = this.editData,
                isSingle = editData.detail.length == 1, //是否仅剩一章
                msgPix = isSingle ? '日志' : '章节';
            this.$Common.confirm(`此操作将删除该${msgPix}, 是否继续?`, ()=>{
                if(isSingle){
                    this.$Common.sendRequest({
                        url: 'journal/del',
                        type: 'POST',
                        data: {id: [editData.info.id]},
                        success: () => {
                            this.$router.push('/journal');
                        }
                    });
                }else{
                    let _detail = this.formData.detail;
                    this.$Common.sendRequest({
                        url: 'journal/delchap',
                        data: {id: _detail.id, infoid: editData.info.id},
                        success: () => {
                            let index = _detail.title;
                            editData.detail.splice(index, 1);
                            this.chapter_title_list = editData.detail;
                            _detail.title = 0;
                            this.changeChapTitle(0);
                        }
                    });
                }
            });
        },

        /** 提交 */
        submit(flg){
            this.formData.info.keyword = this.formData.info.keyword.toLocaleLowerCase();
            this.editId ? this.update(flg) : this.add(flg);
        },
        
    },
};