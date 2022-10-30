早就听说 Novel AI 了，画二次元图片的AI，今天我也来体验下。

首先是资源：[50Gib的模型文件](magnet:?xt=urn:btih:5bde442da86265b670a3e5ea3163afad2c6f8ecc&dn=novelaileak&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tr=udp%3A%)

我的电脑是跑不动的，我需要一张可以的显卡。

这样的显卡在哪里找呢？据我所知的，百度飞浆和Google Colab可以白嫖到算卡。

## 白嫖Google Colab

参考[BV1Me4y1S7Fd](https://www.bilibili.com/video/BV1Me4y1S7Fd)上的教程，很轻松的白嫖Google Colab。

这是把那50G的模型中的一部分提取给stable-diffusion-webui来用。


在stable-diffusion-webui的models目录里，

hypernetworks目录装着/stableckpt/modules/modules目录里的文件

Stable-diffusion目录装着/stableckpt/animefull-final-pruned/model.ckpt（命名为 final-pruned.ckpt）和/stableckpt/animevae.pt（命名为 final-pruned.vae.pt）

跟着教程，一次就成功了，然后在小伙伴们的群里大肆宣扬，有个用手机的同学想要自己搭建一个，他是个法师，所以网络上没大问题，但是在Colab上，手机似乎不能拖动文件，除此之外还有很多麻烦，因此，下面的代码出现了：

```python
from google.colab import drive
import os
if(not os.path.exists("/content/drive")):
  drive.mount('/content/drive')

%cd /content

!rm -d -r stable-diffusion-webui
!git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui

!rm -d -r stable-diffusion-webui/models
!cp -r drive/MyDrive/novelai/models stable-diffusion-webui/models

%cd stable-diffusion-webui

!COMMANDLINE_ARGS="--api --share --gradio-debug --gradio-auth hello:1123456" REQS_FILE="requirements.txt" python launch.py
```

一键启动Novel AI服务器，会请求挂载Google网络硬盘，上面的代码假设模型放在了云端硬盘的/novelai/models目录。


之后我利用浏览器抓包，想要写一个程序一直调用AI接口，自动存图，但因为技术的原因，直到最终到Colab的免费额度过期也不清楚它是咋调用的。

说实话这个显存不是很够用，图片开大了会爆显存。

## 百度飞浆

百度这边也有算力，而且我学AI都是用的这边的算力，但是这边不像Google Colab那边这么好调。

Google Colab那边过期了，所以我想试一试百度这边。

```
git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui
```

先拿到stable-diffusion-webui，成功。

然后是模型，对于hypernetworks目录的东西，每个文件都没有超过150Mib的限制，成功。

对于Stable-diffusion的两个文件，每个文件都超了，一个800M，一个4000M，这里就要动动脑子了。

我想到的是用Http服务器来传，反正我有IPV6地址，但是，我没想到百度那边没有IPV6地址。

那么，就用Http服务器+内网穿透，但是，我没想到内网穿透会查备案。

那么，就用Ftp服务器+内网穿透，但是，FTP似乎至少要穿透2个端口，而且也不一定不需要备案。

就在我一筹莫展之际，我想到了，百度上有个叫数据集的东西，这个可以上传数几十G的东西。

这样，模型，成功。

在这之前，换一个有显卡的机器。

可能是因为模型文件很大，关闭环境后的文件保存需要很长时间。体积：5.75GB

万事俱备，直接用之前的代码，启动！

```python
%cd stable-diffusion-webui
!COMMANDLINE_ARGS="--exit" REQS_FILE="requirements.txt" python launch.py

!COMMANDLINE_ARGS="--api --share --gradio-debug --gradio-auth hello:1123456" REQS_FILE="requirements.txt" python launch.py
```

然后就挂了，理论上可以运行，但是百度似乎不想让其他的框架在他上面运行。

无论是用笔记本还是用终端都是会被检测出来的。

败北了。

## Openl

怎能就这样结束，我利用搜索引擎找到了一个我以前不知道的平台，这里可以白嫖到算力。

首先创建一个项目。

为了能利用git把本地的文件推上去，我把我Github上用的公钥添加上去了，然后VScode。

先本地克隆stable-diffusion-webui。

```
git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui
```

上传···

然后就踩坑了。死活也传不上去。

至于为什么呢，根据我查的资料，似乎是为了保护私钥还是什么，只有在已知的主机上才可以使用密钥验证。

这时候需要把Openl加入到已知主机列表里，这时候就体现出Git GUI的作用了，

在项目文件夹内运行（cmd cd到项目，然后执行Git GUI），菜单栏Remote->Fetch from->origin，弹出框填yes。

理论上不用Git GUI也可以，但是，我不会。

接着新坑又来了，还是传不上去。

为什么呢？因为空目录是不能提交的！哈哈哈

不，我的目录不是空的，里面有克隆的stable-diffusion-webui。

这个stable-diffusion-webui因为是克隆下来的，所以是不提交的，啊！

不知道stable-diffusion-webui文件夹里面的东西能不能提交上去，所以把里面的git相关的文件全都删掉，文件夹重命名，装进去模型，提交。

提交之前要先放进提交缓存，这么大的文件，不合适，但是没办法。

vscode走条的时候进行小小的测试，环境能上网，不过很多linux命令不能用，什么wget啦ifconfig啦。

测试网络的程序：

```python
import requests
rd = requests.get(url="https://baidu.com")
print(rd)
```

但是，没关系，用到的命令可以用python写。

```python
import requests
import os
import shutil
def wget(u,f):
    rd = requests.get(url=u)

    with open(f, 'wb') as location:
        shutil.copyfileobj(rd.raw, location)
```

一个简单的wget写好了，为了下载内网映射用到程序。

然后我发现，内网映射程序打不开！

我当然不会忘了给可执行权限，但是无论是i386的还是amd64的还是arm的，统统打不开。

好了。到此结束了。

哦，Git还没提交上。无妨，提交完了也改变不了我败北的结局。

任务管理器Kill Git。.git文件夹，删除。

----

结局，明显。

还是得Google Colab啊。



## 关于 AI

据我测试，Novel AI做出来的效果堪比画师，不仅能够通过提供的文字内容进行图像生成，还能通过图片生成图片，做同人啦、三次元二次元化啦相当棒。

据说这个模型是泄漏出来的，什么时候火山的TTS、百度的文心能泄漏一下啊。

这么好的东西，会不会某一天突然从网络上消失呢？为了防止这种事情发生，我把这50G的模型存到硬盘里了，虽然电脑跑不动，但我相信迟早能有个跑的动的电脑的。

很早之前一直在关注人工智能领域，也稍微学习了一些神经网络知识，但是找来找去都没有看到人工智能有什么大的成果，感觉对人工智能失去了希望，现在，我感觉看到人工智能前方的灿烂。

是要学习逻辑清晰，但是能力有限的程序呢，还是学习玄之又玄，前途无限的程序呢？

呵呵呵，我想全都要，学AI就不写用户界面了么？


