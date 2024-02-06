写JavaScript就永远不会遇到C++那样令人头疼的构建···吗？



写JavaScript偶遇了C++···



但凡和C++有关的稍微大一点的库或是软件，从来没有成功过，这不，今天又又又又失败了···



## 起因



JavaScript虽然效率很低，但它很好用，我想用[MediaPipe](https://github.com/google/mediapipe)写一个从摄像机计算手部动作的程序，之前在浏览器里面测试已经没什么问题了。



这个计算手部动作的程序我当然是打算用Nodejs来写啦，但是Nodejs里面并没有MediaStream和WebRT什么的东西，于是我很自然地装上了[node-webrtc](https://github.com/node-webrtc/node-webrtc)。



程序很成功地跑起来了，也成功发起了连接服务器地请求，但是服务器那边报错了，说客户端没有H264的解码器···



稍微查了一下，只需要在构建配置里面加一句启用H264再构建一遍就好啦（错误的开始）



## VS的问题



不知道是之前丢环境变量的原因还是什么原因，CMake找不到Visual Studio，查了好久没找到原因···



最后的最后，发现安装器可以点击修复，就好了。



## 目录名的问题



不要中文目录！这个我很清楚，但是好久都没有踩这个坑了，由渐渐开始用中文名了。



隐约想起刚买来笔记本时，开机用户名填的中文，后面又用PE改成英文了···



在我构建了三个多小时后，突然报了一个Python错误（构建C++的JavaScript库居然要用Python···），是和ASCII有关的···



## 又是VS的问题



我把文件名改了，顺便复制到一个更快的硬盘上了（之前三个多小时是有硬盘瓶颈），临时文件记录似乎使用的是绝对目录，改了名就要删掉临时文件重新开始构建···



这次构建了不到两个小时，又是Python，它又报错了，打开报错的Python文件，里面只写了2019和2017两个版本，我用的2022，于是我加上了2022。



结果还是报错，好在不用从头开始构建，报错还是找不到，我看了看源码，我的VS没装默认位置，加了个`vs2022_install`环境变量，好了，换其他报错了···



## Windows SDK的问题



接着它报，找不到Windows SDK的错···



看了看源码，加上了`WINDOWSSDKDIR`这个环境变量。



接着又报在SDK目录内找不到`api-ms-win-downlevel-kernel32-l2-1-0.dll`这个文件，它想要`10.0.19041.0`版本的SDK，我比他高比他低都有装，没办法，去装了个`10.0.19041.0`版本的SDK，但是它还是报这个错误···



于是我直接去[dll-files](https://www.dll-files.com/)找了个DLL丢进去了，堵住它的嘴了···



## 不知道哪的问题



后面就似乎开始构建ffmpeg了，没多久开始给我刷屏，刷像这样的东西:

```shell
  注意: 包含文件:        F:\node-webrtc\build\external\libwebrtc\download\src\api/video/color_space.h
  注意: 包含文件:         F:\node-webrtc\build\external\libwebrtc\download\src\api/video/hdr_metadata.h
  注意: 包含文件:        F:\node-webrtc\build\external\libwebrtc\download\src\api/video/video_content_type.h
  注意: 包含文件:        F:\node-webrtc\build\external\libwebrtc\download\src\api/video/video_rotation.h
  注意: 包含文件:        F:\node-webrtc\build\external\libwebrtc\download\src\api/video/video_timing.h
  注意: 包含文件:      F:\node-webrtc\build\external\libwebrtc\download\src\api/scoped_refptr.h
  注意: 包含文件:     F:\node-webrtc\build\external\libwebrtc\download\src\api/video/video_frame_buffer.h
  注意: 包含文件:    F:\node-webrtc\build\external\libwebrtc\download\src\api/video_codecs/video_decoder.h
```



最后告诉我`Build failed`



## 真正的问题



最后的报错信息说，让我去看看 https://bugs.webrtc.org/9213#c13



这里面似乎在说，用MSVC就是开不了H264···



## 结论



不要尝试去构建库，官方构建的就是最好了，历史越久越是这样。



---



接下来我要考虑换一下技术路线了，我不想再构建了啊——



因为是从摄像头RTSP协议封装转换的WebRTC封装，H264是避不开的，不用nodejs干脆用浏览器内核去跑是一个办法，用Python似乎也是办法···

