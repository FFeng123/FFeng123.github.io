/**
 * 切换大页面
 */
var webState;
function setWebPage(page){
    if(webState) webState.style.display = "none";
    if(webNav) webNav.className = "";

    webState = document.getElementById(page);
    if(!webState) return;
    webState.style.display = "";

    switch (page) {
        case "P-home":// 主页
            setTopImage(document.getElementById("topimage").childNodes[0].data);
            break;
        case "P-article":// 文章页
            break;
        case "P-settings":// 设置页
            setTopImage("/images/friend.jpg");
            getFrineds();
            break;
    }
    webNav = document.getElementById("N" + page);
    if(webNav)  webNav.className = "Select";
}

function init(){

}