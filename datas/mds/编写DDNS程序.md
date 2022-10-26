因为疫情，学校又又又放假了，这是10.24的事情了。

我用[每步动态二级域名](http://www.meibu.com/)解析IPV6地址，虽然好，但是它的DDNS程序只在Windows平台上有，Linux上没有，所以，我要开始写程序了。

## 准备工作

首先，需要得到自己的IP地址，办法有很多，比如，最可靠就是找网卡获取IP地址，但是这种方法很麻烦，还不能移植（windows和linux上的方法不同），一个简单的方法是访问一个服务器，然后让这个服务器返回访问的IPV6地址。

直接百度IPV6，随便找一个能看到IPV6地址的网站，F12，Network。

![](/datas/images/19-2.png)

比如这个：
`http://ds.v6ns.jp2.test-ipv6.com/ip/?callback=_jqjsp&testdomain=test-ipv6.com&testname=test_v6ns`
稍微处理一下：
`http://ds.v6ns.jp2.test-ipv6.com/ip/`
可惜它的返回值带个`callback()`，我懒得处理字符串。

找来找去就是这个了： `http://api6.ipify.org`，这个直接返回ipv6的地址，但是不知道可不可能出现请求失败的情况，我也懒得判断是否返回了一个ipv6字符串，所以加个参数，用下面这个：
`http://api6.ipify.org?format=json`
返回的格式是`{"ip":"XXX"}`，直接json解析就可以了。

这个地方可以用https协议，但是在Linux上莫名连不上，干脆直接用http了。

接下来是把ipv6地址提交上去。

![](/datas/images/19-3.png)

直接提交ip，然后捕捉数据包。

得到如下API：

GET http://www.meibu.com/ipv6zdz.asp

| 参数 |  类型   | 必须 |      说明      |
| ---- | ------ | ---- | ------------- |
| ipv6 | string | 是   | 提交的IPV6地址 |
| name | string | 是   | 域名帐号       |
| pwd  | string | 是   | 密码           |

状态码永远是200
返回值是给人看的字符串，成功的时候返回`\nok`。

（话说http协议明文传输帐号密码真的好嘛？）

## 开始造程序

首先我在Windows上写代码，需要调试，然后最终要编译到Linux上面。

首先不要c/c++，首先socket跨平台是个难题，再者，对我也是个难题。

Python不能编译，我不喜欢，pass。

Java吃内存，效率低，小程序也不是很适合，我的Java水平也就停留在写MC插件上。

最终，就Golang吧。

我机器上面的Goland似乎打不开了，所以用VSCode写代码。

我记得最初就是想用VSCode写Golang代码，但是VSCode上关于Golang的工具程序死活下不下来，这次利用魔法成功安装了GO环境。

说实话Go的Json解析真的麻烦，还要用结构体，就算是一个键值的json数据也要用Json。~~还不如我直接切割字符串呢。~~

上面的API直接拼这样的一个字符串： `"http://www.meibu.com/ipv6zdz.asp?ipv6=%s&name=%s&pwd=%s"`

总是往API上提交地址我觉得不是很好，所以程序只在IP变化的时候提交IP，这么写了，但是我发现这样的话，如果被别处提交一次IP，这个IP就在IP下次改变之前是错误的了。所以干脆一直隔一定时间提交。

这个API的返回值似乎不是打算给机器看的，貌似是打算给人看的，所以我用`strings.Contains(restr, "ok")`（判断是否存在子串）判断是否成功。

完美！

## 部署

首先linux的Go环境。

```
sudo apt-get install golang
```

然后编译二进制文件。（当然Go是支持不编译运行的。）

```
cd ddns/
go build .
```

编译出来了，但是我想让它不依赖linux终端，开机自启。

接下来把它注册为系统服务，成为守护进程，开机自启。

### 低版本的Linux

对于ubuntu16，有一个 /etc/rc.local 文件，这是一个脚本文件，开机时由root运行，直接把想要自启的程序写进去就可以了（需要root权限），比如我加这样一行：

```
/home/ffeng/auto-start.sh
```

然后在/home/ffeng/auto-start.sh里面写：

```
#!/bin/sh
cd /home/ffeng/
ddns/ddns > ddns/log.out & # 此处的&是必要的，起到不等待进程运行结束，继续向下执行的作用
```

创建 auto-start.sh 的目的是以后加启动项方便。

auto-start.sh 需要设置可执行权限。

### 高版本的Linux

对于ubuntu20，/etc/rc.local 没了，有个叫systemd的东西管理着系统服务。

创建 /usr/lib/systemd/system/auto-start.service 文件，这将会添加一个服务用于启动开机启动项，里面写：

```
[Unit]
Description=AutoStart
Requires=network-online.target #依赖网络服务
After=network-online.target # 在网络服务启动之后启动

[Service]
Type=forking
ExecStart=/bin/bash /home/ffeng/auto-start.sh
[Install]
WantedBy=multi-user.target
```

执行：

```
sudo systemctl daemon-reload # 重新加载配置
sudo systemctl start auto-start # 启动服务
sudo systemctl enable auto-start # 服务开机自启
```

重启测试：

```
sudo reboot
```


不要问我为什么知道两种办法。
因为我莫名其妙把ubuntu16弄坏了之后装了ubuntu20。

## 关于ipv6

我有一个安卓版本很低的手机，没有SM卡，wifi里也不显示IPV6地址，但是可以通过IPV6测试，并且能够访问ipv6地址，我的域名也能正常解析进去。

还有一个手机似乎也不支持IPV6，但是无论是Wifi还是蜂窝数据都能正常访问IPV6地址。

还有一个支持IPV6的手机，不用说，成功了。

但是，我问了两个同学，一个没有SM卡，不支持IPV6，不能通过IPV6测试，不能访问IPV6地址，域名会显示无法解析，地址会显示不可达。
另一个有SM卡，无论是Wifi还是流量，都不能访问IPV6地址，域名无法解析，地址不可达。

这就麻烦了。
