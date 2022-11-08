
let bgVideo = document.getElementById("bgvideo");
var VideoPlaying = false;
var video_now;
var video_list;
var video_loading = false;

function setVBtnVis(v){
    document.getElementById("nextBtn").style.display = document.getElementById("soundBtn").style.display = v ? "block" : "none";
}
setVBtnVis(false);

function startVideoPlay(next = false){
    if(!VideoPlaying){
        bgVideo.style.opacity = 1;
        setVBtnVis(true);
        VideoPlaying = true;
        document.getElementById("indextopbox").classList.add("noVisChilds");// 隐藏挡视野的东西
    }
    if(bgVideo.ended || next)
        bgVideo.src = getVideoURL();
    if(!video_loading){
        video_loading = true;
        bgVideo.play().then(re => {
            video_loading = false;
        }).catch(re => {
            video_loading = false;
            startVideoPlay(true);
            
        })
    }
}

function stopVideoPlay(){
    bgVideo.pause();
}

function onPlaystopBtn(){
    if(VideoPlaying){
        stopVideoPlay();
    }else{
        startVideoPlay();
    }
}

function onSoundBtn(){
    config.value.videoSound = !config.value.videoSound;
    config.updata();
    config.save();
}

function getVideoURL(){
    video_now = (video_now + 1) % video_list.length;
    return video_list[video_now]
}

function initVideo(){
    video_list = pageDatas.bgVideos.sort(function(){return Math.random() - 0.5})
    video_now = 0;
    bgVideo.onended = startVideoPlay;
    bgVideo.src = getVideoURL();
    bgVideo.onpause = ()=>{
        bgVideo.style.opacity = 0;
        setVBtnVis(false);
        VideoPlaying = false;
        document.getElementById("indextopbox").classList.remove("noVisChilds");
    }
}
