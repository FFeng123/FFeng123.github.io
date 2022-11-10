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

function loadIcon(){
    document.getElementById("loadingMS").style.opacity = (loading.v2 || loading.v1) ? 1 : 0;
}

config = {
    value:{
        "sakura": !(navigator.userAgent.match(/(iPhone|iPod|Android|ios|iPad)/i)),
        "videoSound": false
    },
    
    save(){
        document.cookie = JSON.stringify(this.value);
    },
    read(){
        let readd;
        try{
            readd = JSON.parse(document.cookie);
        }catch{
            this.save();
            return;
        }
        for(const k in this.value){
            if(readd[k] != null){
                this.value[k] = readd[k];
            }
        }
        this.updata();
    },
    updata(){
        if(Sakura){
            this.value["sakura"] ? startSakura() : stopSakura();
        }
        if(bgVideo){
            bgVideo.volume = this.value["videoSound"] ? 1 : 0;
        }

    }

}

loading = {
    va:null,// 文章
    vb:null,// 列表
    
    get v1(){
        return this.va;
    },
    set v1(a){
        this.va = a;
        loadIcon()
    },
    get v2(){
        return this.vb;
    },
    set v2(a){
        this.vb = a;
        loadIcon()
    }
};// 正在加载的数据

pageDatas = {};// 文章数据
var preload = "";// 用于url跳转

function stopLoad(){
    if(loading){
        loading = 0
    }
}

// 获取id参数区间
function getIDUrl(){
    u = new URL(location.href);
    ss = u.search.substr(1).split("&");
    for(var i = 0;i < ss.length;i++){
        if(ss[i].indexOf("id=") == 0){
          return ss[i].substr(3);
        }
    }
    return "";
}

/**
 * 设置文章ID到URL
 */
function setIDUrl(id){
    u = new URL(location.href);
    ss = u.search.substr(1).split("&");
    gt = false;
    for(var i = 0;i < ss.length;i++){
        if(ss[i].indexOf("id=") == 0){
            ss[i] = "id=" + id;
            gt = true;
            if(id == null){
                ss.splice(i,1);
            }
        }
    }
    if(!gt && id != null){
        ss.push("id=" + id);
    }

    u.search = ss.filter((e)=>{
        return e;
      }).join("&");
    if(u.href != location.href)
        history.replaceState(id,"",u.href);
}
/**
 * 设置顶部图片
 */
nowBGImg = null;
nowBGIurl = "";
function setTopImage(url){
    if(url){
        if (document.getElementById("topimage").style.backgroundImage == ''){
            document.getElementById("topimage").style.backgroundImage =  `url("${nowBGIurl}")`;
        }
        nowBGImg = new Image();
        nowBGImg.onload = function(){
            if(nowBGIurl == this.src){
                document.getElementById("topimage").style.backgroundImage =  `url("${this.src}")`;
                nowBGIurl = "";       
            }
        }
        nowBGIurl = nowBGImg.src = url.substr(0,4) == "http" ? url : "https://ffeng123.github.io/" + url;
        // nowBGIurl = nowBGImg.src = url;
    }else{
        document.getElementById("topimage").style.backgroundImage = '';
    }
}

function setBodyImage(url){
    document.body.style.backgroundImage = `url("${url}")`
}

function setNavMode(f){
    //document.getElementById("navline").style.position = f ? "fixed" : "absolute"
    let nav = document.getElementById("navline")
    f ? nav.classList.add("navlineAmount") : nav.classList.remove("navlineAmount")
}

function showBigImg(img){
    document.getElementById("imgs-img").src = img;
    document.getElementById("imgs-box").style.display = "flex";
}
/**
 * 加载页面基本数据
 */
function loadPageData(){
    // 跳转文章
    let se = getIDUrl();
    if(se != "") preload = se;
    // 缩放事件
    document.body.onresize = function(){
        resize ? resize() : 0;// sakura.js
    };
    // 放大后的突破点击事件
    document.getElementById("imgs-box").onclick = ()=>{
        document.getElementById("imgs-box").style.display = "none"
    }

    fetch("/datas/articles.json",{"cache": 'no-cache'}).then(re => re.json(),re => re).then(re => {
        pageDatas = re;
        setWebPage("P-home");
        // 加载我的信息
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
        // 
        if(preload != ""){
            openArticle(preload);// 加载文章界面
        }else{
            document.getElementById("loadMask").style.display = "none"// 只有进入首页才解除遮挡，文章等到文章加战完成
        }
        
        loadPage({li: document.getElementById("list")});// 加载首页列表
        initVideo();
    },re => {
        document.getElementById("maskTxt").innerHTML = "加载失败，正在重新加载···"
        loadPageData()
    });
    config.read()
}

var homePageListLoaded = false;// 主页列表是否加载完全

/**
 * 加载列表页面
 * 
 */
function loadPage(arg){
    if(loading.v1) {
        loading.v1.newcall = arg// 中断之前的请求，开启新的请求
        return
    }
    loading.v1 = {
        fromd: null,// 用于处理非主页文章加载的问题 
        toli: arg.li,
        st: pageDatas.pageLength * (pageDatas.pagenN - 1),// 第一篇
        ed: Math.min(pageDatas.pageLength * (pageDatas.pagenN - 1) + pageDatas.pageLength,pageDatas.articleAmount),// 最后一篇
        now: pageDatas.pageLength * (pageDatas.pagenN - 1),// 正在进行的那一篇
        run : function(markdown){
            if(loading.v1.newcall){// 中断
                let arg = loading.v1.newcall
                loading.v1 = null
                loadPage(arg)
                return; 
            }
            // 处理传回数据
            if(markdown){ // 传来了数据
                loading.v1.json.index = loading.v1.fromd ? loading.v1.fromd[loading.v1.now] : pageDatas.articleAmount - loading.v1.now - 1;
                loading.v1.now += 1;
                
                data = loading.v1.json;
                data["markdown"] = getFirstLine(markdown,8);// 只取前几行
                appendItem(data,loading.v1.toli);
                hljs.initHighlightingOnLoad();
            }if(loading.v1.now >= loading.v1.ed){// 加载结束条件
                if (loading.v1.fromd == null){// 主列表加载完成
                    homePageListLoaded = true;
                }
                loading.v1 = null;
                if(!homePageListLoaded){// 尚未加载完成主列表
                    loadPage({li: document.getElementById("list")});
                }
                return;// 结束条件
            }
            // 请求数据
            fetch(pageDatas.pointerFile.replace("{index}", String(loading.v1.fromd ? loading.v1.fromd[loading.v1.now] : pageDatas.articleAmount - loading.v1.now - 1))).then(re => re.json(),re => re).then(re => {// 拿到文字json
                loading.v1.json = re;// 记录json
                return fetch(re["markdown"])
            }, re => re).then(re => re.text(),re => re).then(re => {
                loading.v1.run(re);// 成功得到页面
            },{// 失败

            })
        }
    }
    // 移除之前的节点
    arg.li.innerHTML = "";
    if(arg.Ali){// 当加载的不是主页
        loading.v1.fromd = arg.Ali;
        loading.v1.st = 0;
        loading.v1.ed = arg.Ali.length;
        loading.v1.now = 0;
    }else{// 是主页
        homePageListLoaded = false
    }
    loading.v1.run(null);
    return;
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
        pageDatas.pagenN = pge;
        loadPage({li: document.getElementById("list")})
        pageShow();
        
    }
}

webState = null;// 当前的大页面
webNav = null;// 当前的导航项
homesl = 0;// 主页的滚动
/**
 * 切换大页面
 */
function setWebPage(page){
    if(webState){
        if(webState.id == "P-home"){
            homesl = document.scrollingElement.scrollTop;    
        }
        webState.style.display = "none"
    };
    if(webNav) webNav.className = "";
    
    webState = document.getElementById(page);
    if(!webState) return;
    webState.style.display = "";

    switch (page) {
        case "P-home":// 主页
            setIDUrl(null);
            setTopImage("");
            setBodyImage(nowBGIurl = pageDatas.imgHome);
            document.scrollingElement.scrollTop = homesl;
            setNavMode(false);
            if(!homePageListLoaded) reloadPage();
            break;
        case "P-article":// 文章页
            setBodyImage("")
            document.body.scrollIntoView();
            setNavMode(true);
            break;
        case "P-friend":// 友链
            setIDUrl(null);
            setTopImage(pageDatas.imgFriend);
            setBodyImage("")
            getFrineds();
            document.body.scrollIntoView();
            setNavMode(false);
            break;
        case "P-tools":// 工具
            setIDUrl(null);
            setTopImage(pageDatas.imgTools);
            setBodyImage("")
            getToolsList();
            document.body.scrollIntoView();
            setNavMode(false);
            break;
    }

    webNav = document.getElementById("N" + page);
    if(webNav)  webNav.className = "Select";

    // 图片缩放绑定
    for (let i = 0; i < document.images.length; i++) {
        const imge = document.images[i];
        if(imge.className.indexOf("dontimgs") == -1){
            imge.onclick=(e)=>{
                
                showBigImg(e.target.src)
            }
        }
    }
}



/**
 * 浏览某页
 * 
 * 由内容按钮元素调用或传入index
 */
function openArticle(inindex){
    if(loading.v2){
        loading.v2.newcall = inindex;
    }
    let index = typeof inindex == "string" ? inindex : this.getAttribute("index");
    loading.v2 = {"inindex":index};
    function newcallreturn(){
        if(!loading.v2)return true;
        if(loading.v2.newcall){
            let arg = loading.v2.newcall
            loading.v2 = null
            openArticle(arg)
            return true
        }
        return false
    }
    fetch(pageDatas.pointerFile.replace("{index}", index)).then(re => re.json(),re => re).then(re => {//解析完成json
        loading.v2.json = re;
        if(newcallreturn())return;// 中断
        return fetch(re["markdown"]);
    },re => re).then(re => re.text(),re => re).then(re => {// 成功得到页面
        if(newcallreturn())return;// 中断
        document.getElementById("A-box").innerHTML = marked.parse(re);
        document.getElementById("A-title").innerHTML = loading.v2.json.title;
        document.getElementById("A-time").innerHTML = loading.v2.json.time;
        document.getElementById("A-mark").innerHTML = "";
        document.getElementById("A-mark").appendChild(createMarks(loading.v2.json.mark));
        setTopImage(loading.v2.json.bg);
        setWebPage("P-article");
        hljs.initHighlightingOnLoad();

        let pageld = {li:document.getElementById("A-list"),Ali:loading.v2.json.connect};
        document.getElementById("Alistee").style.display = pageld.Ali.length ? "" : "none";
        try{
            // 评论系统
            var gitalk = new Gitalk({
                clientID: '7e29ceda8c49868c79fe',
                clientSecret: 'd2eb8a99d7432ac970a82f07cdac9e9da22b7456',
                repo: 'FFeng123.github.io',
                owner: 'FFeng123',
                admin: ['FFeng123'],
                id: "Article-" + String(loading.v2.json.id),
                distractionFreeMode: false,
                title: loading.v2.json.title,
                body: "关于 \"" + loading.v2.json.title + "\" 的评论",
                language: "zh-CN",

            })
            document.getElementById("A-says").innerHTML = "";
            gitalk.render('A-says');
        }catch(e){// 评论初始化失败
            console.log(e);
        }
        // URL
        setIDUrl(loading.v2.inindex);

        loading.v2 = null;
        loadPage(pageld);
        document.getElementById("loadMask").style.display = "none"

    }, re => {/*失败
        let iin = loading.v2.inindex;
        loading.v2 = null;
        openArticle(iin);*/
    });
    return true;
}

friendsIsLoaded = null;
/**
 * 请求友链列表
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
/**
 * 加载工具列表
 */
var loadedTools = false;
function getToolsList(){
    if(loadedTools) return;
    loadedTools = true;
    
    function openTool(){
        window.open(pageDatas.tools[this.getAttribute("tid")].url);
    }
    function openToolSound(){
        window.open(pageDatas.tools[this.getAttribute("tid")].sound);
    }

    let root = document.getElementById("toolsList");
    for (const i in pageDatas.tools) {
        let toold = pageDatas.tools[i];
        let e = document.createElement("div");
        e.setAttribute("tid",i);
        e.innerHTML = `<div class="toolTitle">${toold.name}</div><div class="toolMess">${toold.mess}</div>`;
        e.style.backgroundImage = `url("${toold.bg}")`;
        e.onclick=openTool;
        if(toold.sound){
            let a = document.createElement("a");
            a.className = "toolhoka";
            a.onclick = openToolSound;
            a.setAttribute("tid",i);
            a.innerHTML = "源码";
            e.appendChild(a);
        }
        root.appendChild(e);
    }
}


function setSakuraState(){
    config.value.sakura = !config.value.sakura
    config.updata()
    config.save()
}

onload = loadPageData();
reloadPage = ()=>{
    loadPage({li: document.getElementById("list")})
}

alert = console.error = console.log = function(){}// 禁止输出