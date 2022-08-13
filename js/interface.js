/**
 * 获取字符串前面line行
 * @param {String} str 要操作的字符串
 * @param {Number} line 行数
 * @returns {String} 
 */
function getFirstLine(str, line){
    let index = -1;
    do {
        index = str.indexOf("\n", index + 1);
        line --;
    } while (index != -1 && line > 0);
    return str.substring(0,index == -1 ? str.length : index);
}


loading = {
    va:null,
    
    get v(){
        return this.va;
    },
    set v(a){
        this.va = a;
        document.getElementById("loadingMS").style.opacity = a ? 1 : 0;
        /*if(!a && poperrs){
            openArticle(poperrs);
            poperrs = null;
        }*/
    }
};// 正在加载的数据
pageDatas = {};// 文章数据
var preload = "";// 用于url跳转

// 获取id参数区间
function getIDUrlpos(){
    // 锁定到参数区域
    let st = location.href.indexOf("?");
    if(st == -1) st = location.href.length;
    let ed = location.href.indexOf("#");
    if(ed == -1) ed = location.href.length;
    // 开始
    let t = location.href.indexOf("id=",st);
    if(t == -1 || t >= ed) return [];
    st = t;
    // 结束
    t = location.href.indexOf("&",st);
    if(t != -1 && t < ed) ed = t;
    
    return [st,ed];
}

/**
 * 设置文章ID到URL
 */
function setIDUrl(id){
    let se = getIDUrlpos();
    let st,ed,wh = true;
    if(se.length == 2){
        st = se[0];
        ed = se[1];
    }else{
        let t = location.href.indexOf("?");
        let m = location.href.indexOf("#");
        if(t == -1){// 尚无参数
            if(m != -1) st = ed = m;
            else st = ed = location.href.length;
        }else{// 已有参数
            st = ed = t + 1;
            se = (st + 1) == (m == -1 ? location.href.length : m) ? [] : null;// 标记，需要加“&”
            wh = false;// 标记，需要加问号
        }
    }
    se = location.href.substring(0,st) + (id == null ? "" : (wh ? "?" : "") + "id=" + String(id)) + (se == null ? "&" : "") + location.href.substring(ed);
    if(se != location.href)
        history.replaceState(id,"",se);
}
/*
var poperrs = null;
onpopstate = function(ev){
    switch (ev.state) {
        case -1:
            setWebPage("P-home");
            break;
        case -2:
            setWebPage("P-friend");
            break;
        default:
            if(!openArticle(ev.state));
                poperrs = ev.state;
            break;
    }
}*/
/**
 * 设置顶部图片
 */
nowBGImg = null;
nowBGIurl = "";
function setTopImage(url){
    // document.getElementById("topimage").style.backgroundImage = "url(" + url + ")";
    nowBGImg = new Image();
    nowBGImg.onload = function(){
        if(nowBGIurl == this.src){
            document.getElementById("topimage").style.backgroundImage = `url("${this.src}")`;
            nowBGIurl = "";       
        }
    }
    nowBGIurl = nowBGImg.src = url;

}

/**
 * 加载页面基本数据
 */
function loadPageData(){
    loading.v = true;
    fetch("/datas/articles.json",{"cache": 'no-cache'}).then(re => re.json(),re => re).then(re => {
        pageDatas = re;
        setWebPage("P-home");
        // 加载我的信息
        //document.getElementById("linkIcon").href = 
        document.getElementById("me-head").src = pageDatas.meHead;
        document.getElementById("me-name").innerHTML = pageDatas.meName;
        document.getElementById("me-namelast").innerHTML = pageDatas.meNameLast;
        document.getElementById("me-mess").innerHTML = pageDatas.memess;

        // 显示页码
        let list = document.getElementById("pages");
        list.innerHTML = "";
        
        function create_ent(text,ret){
            let r = document.createElement("a");
            r.appendChild(document.createTextNode(text));
            
            //r.href = "#";
            r.onclick = setPageN;
            r.setAttribute("page",String(ret));
            return r;
        }

        list.appendChild(create_ent("<",-1));
        pageDatas.pageAmount = Math.ceil(pageDatas.articleAmount / pageDatas.pageLength);
        for(let i = 1; i <= pageDatas.pageAmount; i++){
            list.appendChild(create_ent(String(i),i));
        }
        list.appendChild(create_ent(">",-2));
        pageShow();
        
        if(preload != ""){
            openArticle(preload);
        }else{
            loadPage({li: document.getElementById("list")});
        }
    },re => loadPageData());
    loading.v = null;
}

/**
 * 加载列表页面
 * 
 */
function loadPage(arg){
    if(loading.v) return false;
    loading.v = {
        fromd: null,// 用于处理非主页文章加载的问题 
        toli: arg.li,
        st: pageDatas.pageLength * (pageDatas.pagenN - 1),// 第一篇
        ed: Math.min(pageDatas.pageLength * (pageDatas.pagenN - 1) + pageDatas.pageLength,pageDatas.articleAmount),// 最后一篇
        now: pageDatas.pageLength * (pageDatas.pagenN - 1),// 正在进行的那一篇
        run : function(markdown){
            // 处理传回数据
            if(markdown){ // 传来了数据
                loading.v.json.index = loading.v.fromd ? loading.v.fromd[loading.v.now] : pageDatas.articleAmount - loading.v.now - 1;
                loading.v.now += 1;
                
                data = loading.v.json;
                data["markdown"] = getFirstLine(markdown,8);// 只取前几行
                appendItem(data,loading.v.toli);
                hljs.initHighlightingOnLoad();
            }if(loading.v.now >= loading.v.ed){
                loading.v = null;
                if(preload != ""){// 尚未加载主列表
                    preload = "";
                    loadPage({li: document.getElementById("list")});
                }
                return;// 结束条件
            }
            // 请求数据
            fetch(pageDatas.pointerFile.replace("{index}", String(loading.v.fromd ? loading.v.fromd[loading.v.now] : pageDatas.articleAmount - loading.v.now - 1))).then(re => re.json(),re => re).then(re => {// 拿到文字json
                loading.v.json = re;// 记录json
                return fetch(re["markdown"])
            }, re => re).then(re => re.text(),re => re).then(re => {
                loading.v.run(re);// 成功得到页面
            },re => loading.v.run())// 失败重试
        }
    }
    // 移除之前的节点
    arg.li.innerHTML = "";
    if(arg.Ali){// 上面处理的是主页，特殊加载处理
        loading.v.fromd = arg.Ali;
        loading.v.st = 0;
        loading.v.ed = arg.Ali.length;
        loading.v.now = 0;
    }
    loading.v.run(null);
    return true;
}
/**
 * 创建应该显示的标签，存在一个div里
 */
function createMarks(marks){
    let re = document.createElement("div");
    for (i in marks) {
        let ee = document.createElement("span");
        ee.className = "markblock";
        ee.appendChild(document.createTextNode(i));
        ee.style.backgroundColor = marks[i];
        re.appendChild(ee);
    }
    return re;
}

/**
 * 在列表中加入一个项目
 */
function appendItem(data,li){
    let itm = document.createElement("div");
    itm.innerHTML = `<div class='itemimage' style='background-image: url(\"${data.bg}\");'></div>`
    let emt = document.createElement("div");
    // emt.className = "itemtext"
    li.appendChild(itm);
    itm.append(emt);

    emt.className += "itemtext md";
    emt.innerHTML = marked.parse(data.markdown) + '<a class="more">查看更多&gt;&gt;</a>';
    itm.setAttribute("index",data.index);
    itm.onclick = openArticle;// 点击事件

    function createTitle(data){
        let re = document.createElement("div");
        re.innerHTML = '<h1 style="text-align: center;margin: 0">{0}</h1><p style="text-align: right;">{1}</p>'.replace("{0}",data.title).replace("{1}",data.time);
        let ee;

        ee = createMarks(data.mark);
        ee.className = "abstorigtop";
        ee.style.marginTop = "1em";
        ee.style.marginRight = "0.5em";
        re.appendChild(ee);

        return re;
    }
    emt.insertBefore(createTitle(data),emt.children[0]);

}

function init(){
    // 界面初始化
    let text = document.getElementById("topimage").childNodes[0];
    if(text) setTopImage(text.data);
    
    // 跳转文章
    let se = getIDUrlpos();
    if(se.length == 2) preload = location.href.substring(se[0] + 3,se[1]);

    var h = 0;
    document.body.onresize = function(){
        resize ? resize() : 0;
    };
}

/**
 * 更新页码显示
 */
showingPage = null;// 已选的页码
function pageShow(){
    let list = document.getElementById("pages");
    let pge = pageDatas.pagenN;
    if(showingPage) showingPage.className = "";
    list.children[0].style.display = pge == 1 ? "none" : "";// 上一页
    list.children[list.children.length - 1].style.display = pge == list.children.length - 2 ? "none" : "";// 下一页
    (showingPage = list.children[pge]).className = "Select";
}


/**
 * 设置页数
 * 
 * 由按钮元素调用
 */
function setPageN(){
    if(loading.v) return;

    let pge = Number(this.getAttribute("page"));
    switch (pge) {
        case -1:
            pge = pageDatas.pagenN - 1;
            break;
        case -2:
            pge = pageDatas.pagenN + 1;
            break;
    }
    
    pge = Math.max(1,Math.min(pageDatas.pageAmount,pge));
    if(pge != pageDatas.pagenN){
        let lst = pageDatas.pagenN;
        pageDatas.pagenN = pge;
        if(!loadPage({li: document.getElementById("list")})) pageDatas.pagenN = lst;// 加载失败，还是之前页码
        else pageShow();
        
    }
}

webState = null;// 当前的大页面
webNav = null;// 当前的导航项
/**
 * 切换大页面
 */
function setWebPage(page){
    if(webState) webState.style.display = "none";
    if(webNav) webNav.className = "";

    webState = document.getElementById(page);
    if(!webState) return;
    webState.style.display = "";

    switch (page) {
        case "P-home":// 主页
            setIDUrl(null);
            setTopImage(pageDatas.imgHome);
            break;
        case "P-article":// 文章页
            break;
        case "P-friend":// 友链
            setIDUrl(null);
            setTopImage(pageDatas.imgFriend);
            getFrineds();
            break;
    }
    webNav = document.getElementById("N" + page);
    if(webNav)  webNav.className = "Select";
    document.body.scrollIntoView();
}



/**
 * 浏览某页
 * 
 * 由内容按钮元素调用或传入index
 */
function openArticle(inindex){
    if(loading.v) return false;
    let index = typeof inindex == "string" ? inindex : this.getAttribute("index");
    loading.v = {"inindex":index};
    
    fetch(pageDatas.pointerFile.replace("{index}", index)).then(re => re.json(),re => re).then(re => {//解析完成json
        loading.v.json = re;
        return fetch(re["markdown"]);
    },re => re).then(re => re.text(),re => re).then(re => {// 成功得到页面
        document.getElementById("A-box").innerHTML = marked.parse(re);
        document.getElementById("A-title").innerHTML = loading.v.json.title;
        document.getElementById("A-time").innerHTML = loading.v.json.time;
        document.getElementById("A-mark").innerHTML = "";
        document.getElementById("A-mark").appendChild(createMarks(loading.v.json.mark));
        setTopImage(loading.v.json.bg);
        setWebPage("P-article");
        hljs.initHighlightingOnLoad();

        let pageld = {li:document.getElementById("A-list"),Ali:loading.v.json.connect};
        document.getElementById("Alistee").style.display = pageld.Ali.length ? "" : "none";

        // 评论系统
        var gitalk = new Gitalk({
            clientID: '7e29ceda8c49868c79fe',
            clientSecret: 'd2eb8a99d7432ac970a82f07cdac9e9da22b7456',
            repo: 'FFeng123.github.io',
            owner: 'FFeng123',
            admin: ['FFeng123'],
            id: "Article-" + String(loading.v.json.id),
            distractionFreeMode: false,
            title: loading.v.json.title,
            body: "关于 \"" + loading.v.json.title + "\" 的评论",
            language: "zh-CN",

        })
        document.getElementById("A-says").innerHTML = "";
        gitalk.render('A-says');
        // URL
        setIDUrl(loading.v.inindex);

        loading.v = null;
        loadPage(pageld);

    }, re => {
        let iin = loading.v.inindex;
        loading.v = null;
        openArticle(iin);
    });
    return true;
}

friendsIsLoaded = null;
/**
 * 请求友链列表
 * 
 * 与文章加载不干涉，可以同时进行，不必检查loading
 */
function getFrineds(){
    if(friendsIsLoaded) return;

    function createFriendBox(data,id){
        let e = document.createElement("div");
        e.className = "friendBox";
        let li = document.getElementById("F-main");
        e.innerHTML += '<img class="headimage" src="{0}"><div class="row" style="padding: 0.5em;flex-grow: 1;"><p style="font-size: 1.2em" id="me-name">{1}</p><p id="me-namelast">{2}</p></div>'.replace("{0}",data.head).replace("{1}",data.name).replace("{2}",data.nameLast);
        e.setAttribute("index",id);
        e.onclick = function(){
            window.location.replace(friendsIsLoaded[Number(this.getAttribute("index"))].url);
        };
        li.appendChild(e);
    }
    function randomArr(array){
        for (var i = 0; i < array.length; i++) {
            var iRand = parseInt(array.length * Math.random());
            var temp = array[i];
            array[i] = array[iRand];
            array[iRand] = temp;
        }
        return array;
    }
    fetch(pageDatas.friendFile).then(re => re.json(), re => re).then(re => {
        re = randomArr(re);
        friendsIsLoaded = re;
        document.getElementById("F-amount").innerHTML = "后宫佳丽" + String(re.length) + "";
        document.getElementById("F-main").innerHTML = "";
        
        for (let i = 0; i < re.length; i++) {
            createFriendBox(re[i],i);
        }
    },re => getFrineds());
    
}

init();
onload = loadPageData();

alert = console.error = console.log = function(){}// 禁止输出