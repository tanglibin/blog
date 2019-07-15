<template>
    <div class="editor" id="editormd">
        <textarea></textarea>
    </div>
</template>

<script>
export default {
    name: 'editor',
    data(){
        return {
            publicPath: `${location.pathname == '/tlbgl'? '../admin': ''}/static/editor/`,
            head: document.getElementsByTagName('head')[0],
            editor: null
        }
    },
    props: {
        value: {
            type: String,
            default: ''
        }
    },
    mounted(){
        this.loadFile().then(this.initEditor);
    },
    methods: {
        //加载文件
        loadFile(){
            const conxt = this;
            return new Promise(function(resolve,reject){
                let link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = conxt.publicPath + 'css/editormd.min.css';
                conxt.head.appendChild(link);

                let script = document.createElement('script');
                script.src = conxt.publicPath + 'editormd.min.js';
                conxt.head.appendChild(script);

                script.onload = resolve;
            });
        },
        //初始化
        initEditor(){
            let cont = this;
            let Editor = editormd('editormd', {
                placeholder:'请输入内容',  //默认显示的文字，这里就不解释了
                width: '100%',
                height: 640,
                htmlDecode : true,
                syncScrolling: 'single',  
                path: this.publicPath + 'lib/',   //你的path路径（原资源文件中lib包在我们项目中所放的位置）
                value: this.value || '',
                theme: 'dark',//工具栏主题
                previewTheme: 'dark',//预览主题
                editorTheme: 'pastel-on-dark',//编辑主题
                saveHTMLToTextarea: true,
                emoji: false,
                taskList: true, 
                imageUpload: true,
                imageUploadURL : "/upload", 
                toolbarIcons(){
                    return editormd.toolbarModes['full']
                },
                onchange(){
                    cont.$emit('input', Editor.getMarkdown());
                    cont.$emit('update:html', Editor.getPreviewedHTML());
                }
            });
            this.editor = Editor;
        }
    }
};
</script>