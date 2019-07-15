import less from '../css/blog.less'

let Pathname = location.pathname.match(/^\/([a-z0-9]+)*(\.html)?$/),
      Doc = document,
      Win = window,
      JQ = $;
Pathname = Pathname ? (Pathname[1] || 'index') : 'error';

/**控制台输出网站信息 */
function myConsole(){
    let _s = (bc, fc) => {
        bc = bc || '#222';
        fc = fc || '#fadfa3';
        return 'color:' + fc + ';background-color:' + bc + ';line-height:32px;padding: 0 8px;font-size:14px;';
    };
    let _c = (t) => {
        console.log(t, _s(), _s('#fadfa3', '#333'));
    };
    _c('%c联系邮箱%ctony@tlbin.com');
    _c('%c网站地址%chttps://www.tlbin.com');
}

/**发送请求 */
function sendRequest(op){
    op.dataType = 'json';
    op.url = '/api/' + op.url;
    JQ.ajax(op);
}


/**初始化延迟加载图片 */
function initLazyImg(){
    JQ('.lazy-img').lazyload({
        effect: 'fadeIn',
        effectspeed: 200,
        failure_limit: 1,
        threshold: 20
    });
}


/**初始化回到顶部按钮 */
function initTopBtn(){
    let btn = JQ('#top_btn'), body = JQ('html,body');
    JQ(Win).on('scroll', ()=>{
        btn.toggleClass('visible', Win.pageYOffset >= 100);
    });
    btn.on('click', ()=>{
        body.animate({ scrollTop: 0 });
    })
}


/**头部搜索 */
function search({keyCode, target}){
    if(keyCode != 13){
        return ;
    }
    target = JQ(target);
    let val = target.val().trim(), ts = search;
    if(!val || val == ts.val){
        return ;
    }
    ts.val = val;
    Win.location.href = '/search.html?k=' + val;
}


/** 初始化首页的轮播 */
function initSlider(){
    let banner = JQ('#banner'),
        random = JQ('#random');
    banner.length && banner.wowSlider({
        effect: 'cube',
        duration: 20 * 100,
        delay: 2000,
        width: 716,
        height: 298,
        autoPlay: true,
        stopOnHover: false,
        loop: false,
        bullets: 0,
        caption: true,
        captionEffect: 'slide',
        controls: 0,
        onBeforeStep: 0,
        images: 0
    });
    random.length && random.nivoSlider({ 
        boxCols:7,
        boxRows:5,
        pauseTime:3000,
        effect:'random',
        controlNav:false,
        directionNav:true,
        pauseOnHover:true,
        animSpeed:600,
        prevText:'&lt;',
        nextText:'&gt;',
        slices:15,
    });
}


/**初始化滚动加载 */
function initScrollLoad(){
    let loadBox = JQ('#scroll_load');
    if(!loadBox.length){
        return ;
    }

    let page = 2, //需要请求的页码
        endOrIng = 0, //标识正在请求中或已加载完所有数据
        url = Pathname == 'search' ? `search${Win.location.search}` : 'getJournal',
        wrap = JQ('#post_box'),
        body = document.body;
    
    // 获取数据
    let getData = ()=>{
        // 改变标识状态&显示loading
        endOrIng = 1;
        loadBox.show();
        // 请求
        sendRequest({
            type: 'GET',
            url: url,
            data: {page: page},
            success: ({data :{data, totalPages}})=>{
                let html = [];
                data.forEach(item => {
                    html.push(`<article class='excerpt'><div class='item-title'><a href='/${item.sid}.html'><span class='tag-type'>${item.tag}</span><span class='title-txt'>${item.title}</span></a></div><a class='pic-block' href='/${item.sid}.html'><img  class='lazy-img' data-original='${item.cover_url}' /></a><div class='right-box'><div class='summary-text'>${item.summary}</div><div class='right-btn'><i class='icon-timer'></i><span class='date-txt'>${item.issue_time.substr(0, 10)}</span></div></div></article>`);
                })
                wrap.append(html.join(''));

                // 数据已加载完成
                if(page == totalPages){
                    loadBox.addClass('complete-load').html('别再拉啦，我也是有底线的~');
                }else{
                    loadBox.hide();
                    page ++;
                    endOrIng = 0;
                }
                // 生成数据后，初始化图片延迟加载
                initLazyImg();
            }
        })
    }
    
    // 绑定滚动加载事件
    JQ(Win).on('scroll', ()=>{
        !endOrIng && Win.pageYOffset >= (body.scrollHeight - body.clientHeight - 200) && getData();
    });
}


/**章节目录固定位置显示 */
function initCatalog(){
    let dom = JQ('#catalog');
    if(!dom.length){
        return ;
    }
    JQ(Win).on('scroll', ()=>{
        dom.toggleClass('fixed-catalog', Win.pageYOffset >= 780);
    });
}

/**登陆页面按键登录处理 */
function enteryKeyDown({keyCode, key}){
    let ts = enteryKeyDown;
    ts.keys = ts.keys || [];
    let len = ts.keys.length;
    // 已输入4位，请求中，拦截执行
    if(len == 4){
        return ;
    }
    // 元素获取保存
    ts.dotBox = ts.dotBox = JQ('#dot_box');
    ts.lodBox = ts.lodBox = JQ('#sprite_box');
    ts.dotChild = ts.dotBox = ts.dotBox.find('>.dot');
    ts.dom = ts.dom || JQ('#dot_box>.dot');

    // 登录失败，清空内容方法
    ts.clean = ts.clean || (()=>{
        ts.keys = [];
        ts.dotChild.removeClass('on');
    });

    // 仅通过字母,数字
    if((keyCode>= 48 && keyCode<=57) || (keyCode>= 65 && keyCode<=90) || (keyCode>= 96 && keyCode<=105)){
        // 更新保存输入数据，并更新页面展示
        ts.keys.push(key);
        len = ts.keys.length;
        ts.dotChild.removeClass('on').filter(`:lt(${len})`).addClass('on');
        // 输入满4位，进行登录处理
        if(len == 4){
            // 已经错过3次，直接拦截请求
            if(localStorage.getItem('et')){
                return ts.clean();
            }
            // 显示loading
            ts.dotBox.hide();
            ts.lodBox.show();
            // 执行请求
            sendRequest({
                url: 'login',
                type: 'POST',
                data: {key: ts.keys.join('')},
                success: (result)=>{
                    // 成功
                    if(result.errno == 0){
                        Win.location.href = '/';
                    }else {
                        ts.clean();
                        ts.lodBox.hide();
                        ts.dotBox.show();
                        if(result.data == 3){
                            localStorage.setItem('et', 1);
                        }
                    }
                }
            });
        }
    }
}


$(function(){
    if(Pathname == 'entry'){
        JQ(Doc).on('keydown', enteryKeyDown);
    }else{
        //初始化延迟加载图片
        initLazyImg();

        // 绑定头部搜索按钮按键事件
        JQ(Doc).on('keydown', '.search-input', search);
        
        // 初始化回到顶部按钮
        initTopBtn();

        //初始化轮播
        initSlider();

        // 首页及学习笔记页面，初始化滚动加载
        if(/index|journal|search/.test(Pathname)){
            initScrollLoad();
        }
        // 日志详情页面，若是多章节，滚动时固定章节目录
        else if(/^ta([\d]{11})$/.test(Pathname)){
            initCatalog();
        }
    }
})
myConsole();