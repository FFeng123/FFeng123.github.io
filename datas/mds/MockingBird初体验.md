[MockingBird](https://github.com/babysor/MockingBird) ，一个专门拟声的AI项目。

很久一起我就想试一试了，今天就来尝试一波。

首先，我没有训练数据，所以不能训练，也不需要训练，有别人训练好的模型。

## 得到模型

别人训练好的模型在百度网盘上面，百度网盘P2P打开直接跑满带宽，很快就下完了。

在它下载的期间，我去看了看Readme，这个不训练模型的话是不需要显卡的，所以我先在本地搭一下环境吧。

python以前有装，所以直接用pip下载依赖就可以了，结果不是那么如意，失败了，下载依赖失败了，不是网络问题，报错乱七八糟也懒得看，所以，google colab。

别的都好说，问题是这半个G大小的模型怎么拿到谷歌上面去，我的魔法上传文件要好几个小时。

此时，我独创的一个文件传输大法出现了。

### 文件传输大法

colab不支持IPV6，[SakuraFrp](https://www.natfrp.com/)安排内网映射。

在本地CMD打开http服务器。

```
python -m http.server
```

然后本地的8000端口映射出去，最近可能因为备案的问题，SakuraFrp所有国内节点不允许用http穿透，但是国外的可以。

在完成内网映射之后，在colab上用wget命令获取文件。

## Colab环境安装

启动MockingBird的Web服务之后需要内网映射，所以还得用反向代理。

依然是一键化：

```python
%cd /content/
!git clone https://github.com/babysor/MockingBird.git
%cd MockingBird
!apt-get install ffmpeg
!pip install -r requirements.txt
!pip install webrtcvad-wheels
!pip install fastapi
!pip install loguru
!wget https://nyat-static.globalslb.net/natfrp/client/0.42.0-sakura-4/frpc_linux_386
!chmod +x frpc_linux_386
!echo "./frpc_linux_386 -f XXX &" > start.sh# 内网映射
!echo "python web.py --port 8000" >> start.sh
!chmod +x start.sh
```

之后需要把上传的模型放入MockingBird/synthesizer/saved_models

开启用这个：

```python
!./start.sh
```

## 效果

效果嘛~~仁者见仁智者见智~~

<audio>
  <source src="/datas/res/25-1.wav" type="audio/wav">
</audio>
<audio>
  <source src="/datas/res/25-2.wav" type="audio/wav">
</audio>

![界面](/datas/images/25-2.png)


这算是文字转语言，它还有个音色迁移的功能，我觉得效果也不会很好，所以就这样吧。~~主要是懒~~


