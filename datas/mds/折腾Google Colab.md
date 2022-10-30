昨天在Openl上，因为打不开内网映射，败北了，但是，我不知道，stable-diffusion-webui人家根本就不需要内网映射！stable-diffusion-webui基于Gradio，人家有服务器，不需要！但是我也懒得折腾了，そこまで。

一般限时都是在晚上零点的时候刷新，colab也不例外，只不过不是天朝的零点，是漂亮国的零点。

虽说限额了，但也仅仅限制了显卡，没有显卡的机器也是可以用的。

这上面的机器似乎都是16G的运存，这么大的运存，能干什么呢？

colab的笔记本是有Root权限的，想什么就能干什么。

Minecraft服务器，安排！

## Minecraft Server

众所周知，colab的机器在断开之后就删除数据了，开游戏服务器存不下来数据啊。

~~可以不断往另一个机器上备份~~

可以挂上谷歌网络硬盘，把服务器运行在网络硬盘上啊！

于是，就有了下面的代码：

```python
# 挂载网络硬盘
from google.colab import drive
drive.mount('/content/drive')
%cd /content/drive/MyDrive
# 进入服务器文件夹
!mkdir minecraftServer
%cd minecraftServer
# 安装java
!apt-get install openjdk-17-jdk
# 下载服务器核心
!wget https://download.getbukkit.org/spigot/spigot-1.19.2.jar
# 下载内网映射工具并赋予可执行权限
!wget https://nyat-static.globalslb.net/natfrp/client/0.42.0-sakura-4/frpc_linux_386
!chmod +x frpc_linux_386
# 创建启动脚本并赋予可执行权限
!rm start.sh
!echo "killall java" >> start.sh
!echo "./frpc_linux_386 -f 启动参数 &" >> start.sh
!echo "java -Xms15000M -Xmx15000M -jar "spigot-1.19.2.jar" --nogui" >> start.sh
!chmod +x start.sh
# 同意MC服务器协议
!echo "eula=true" > eula.txt
```

这样，环境就建好了，内网映射使用的是[SakuraFrp](https://www.natfrp.com/)，需要注册帐号并创建隧道，复制启动参数过来。

这个脚本应该每一次开环境都运行一次（实际上以后启动只需要挂载网络硬盘和安装Java，但是全都执行一边也不费时间。）

想要启动服务器，只需要：`!./start.sh`

之后按照建Minecraft服务器的常规操作，没有正版的话再关掉正版验证。

非得要用内网映射反向代理嘛？有没有办法其他办法？

```python
import requests
rd = requests.get(url="http://api6.ipify.org?format=json")
print(rd)
```

以上代码测试IPV6，很遗憾，我没办法了。

我越来越感觉现阶段IPV6没用了。什么时候才能普及啊！

colab挂的时间长了会自动断开，需要时不时点点它，所以，自动点击安排上。

```javascript
setInterval(()=>{
  document.querySelector("#top-toolbar > colab-connect-button").shadowRoot.querySelector("#connect").click();
}, 30000)
```

这句话在浏览器控制台上执行，每隔30000毫秒点一次右上角的连接。

## Novel AI

我发现colab是在11：00的时候刷新时长，已经11点了。

再回来Novel AI。

尽管昨天写了一键开Novel AI服务器的代码，但是，我还想更懒，为什么每一次开环境都要git clone一次，复制文件一次呢？这种东西放到网络硬盘里不就好了嘛。

所以。

简单粗暴，直接克隆到网络硬盘里。

```python
from google.colab import drive
drive.mount('/content/drive')
%cd /content/drive/MyDrive/
!git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui
```

继续按照昨天的一键代码，不过目录在网络硬盘里面。

```python
# 复制模型文件
!rm -d -r stable-diffusion-webui/models
!cp -r novelai/models stable-diffusion-webui/models
%cd stable-diffusion-webui
```

就大功告成了！

启动的话，以后每一次都是这个代码：

```python
from google.colab import drive
import os
if(not os.path.exists("/content/drive")):
  drive.mount('/content/drive')

%cd /content/drive/MyDrive/stable-diffusion-webui

!COMMANDLINE_ARGS="--api --share --gradio-debug --gradio-auth hello:1123456" REQS_FILE="requirements.txt" python launch.py
```

完成！

妈呀？网络硬盘直接空间占用80%+！？

要不我还是考虑每次启动都重新复制文件吧。



