// 所需Element-ui 的组件配置
import { Container, Header, Aside, Main, Menu, MenuItem, Message, MessageBox, Row, Table, TableColumn, Button, Breadcrumb, BreadcrumbItem, Form, FormItem, Dialog, Input, Select, Option, Loading, Col, DatePicker, Pagination, Radio, Upload} from 'element-ui'
const element = {
    install: function (Vue) {
        Vue.use(Container)//外层容器
        Vue.use(Header)//顶栏容器
        Vue.use(Aside)//侧边栏容器
        Vue.use(Main)//主要区域容器
        Vue.use(Menu)//菜单容器
        Vue.use(MenuItem)//主要区域容器
        Vue.use(Row)//layout行
        Vue.use(Table)//表格
        Vue.use(TableColumn)//表格列
        Vue.use(Button)//按钮
        Vue.use(Breadcrumb)//面包屑
        Vue.use(BreadcrumbItem)//面包屑选项
        Vue.use(Form)//表单
        Vue.use(FormItem)//表单选项
        Vue.use(Dialog)//弹框
        Vue.use(Input)//文本框
        Vue.use(Select)//下拉框
        Vue.use(Option)//下拉框选项
        Vue.use(Col)//流布局
        Vue.use(DatePicker)//日期控件
        Vue.use(Pagination)//分页控件
        Vue.use(Radio)//单选框控件
        Vue.use(Upload)//上传控件
        
        //Loading
        Vue.prototype.$loading = Loading;

        //普通消息提示
        Vue.component(Message.name, Message);
        Vue.prototype.$message = Message;
        //MessageBox 弹框
        Vue.component(MessageBox.name, MessageBox);
        Vue.prototype.$confirm = MessageBox.confirm;
    }
}
export default element;