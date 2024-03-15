Android逆向，为什么突然搞安卓逆向呢？

因为学校要求每学期都要进行校园跑，而校园跑非常之严格(╬▔皿▔)╯



此次安卓安卓逆向的目标就算用于记录跑步的APP，XX体育。

这次不是破解成功就是体育挂科。



## 试探

首先我尝试对APK解包，这个APK似乎并没有怎么加密···

这个软件似乎是使用WEEX（一个用Web做移动软件的框架）做的，所以重点代码逻辑大概是写在JavaScript里面。

JavaScript呢，除了把大量JS源码都编译到少量几个JS里面了，似乎也没有其他什么额外的操作了，没有混淆。

### 巨量JS代码的格式化

VS Code在代码多到一定数量的时候格式化似乎就不干活了，安装`Prettier - Code formatter`这个扩展可以解决。

---

理论上我是可以通过分析JS来达到目的的，但是上百外的代码量，这个方法似乎行不通。≡(▔﹏▔)≡



接下来就网络抓包喽，跑几圈，看看客户端怎么和服务器通信的，如果遇到有加密的信息就看源码。



[Reqable](https://github.com/reqable/reqable-app)这个软件，可以在手机上抓包。



但是即便在手机上装了证书后似乎也抓不到Https包，似乎从安卓7.0开始需要在软件的清单文件内声明才会使用安装的证书。



## 反编译、修改、重编译



我把APK反编译，然后修改清单文件，最后再重新编译签名，这样就能让软件使用抓包的证书了。



[ApkTool](https://apktool.org/)是个好东西。

Java我不是很熟悉，在我的电脑上，`ApkTool.jar`可以直接在控制台内执行，但是控制台不会等待程序结束，并且程序没有输出。

需要使用`java -jar ApkTool.jar`才能正确使用。



下面的操作需要安装JDK并手动将bin目录配置到环境变量。



### 反编译



`java -jar apktool.jar d xxty.apk -only-main-classes`



这个命令可以解包，此处`-only-main-classes`是必要的，这个APK里面似乎代码有加密，不加会报错。



### 修改



按照Reqable里面的说法：

`AndroidManifest.xml`修改:

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest>
  <application android:networkSecurityConfig="@xml/network_security_config">
    ...
  </application>
</manifest>
```

创建`res/xml/network_security_config.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <base-config cleartextTrafficPermitted="true">
    <trust-anchors>
      <certificates src="system" />
      <certificates src="user" />
    </trust-anchors>
  </base-config>
</network-security-config>
```



### 编译

此步操作目录不能有中文。

`java -jar apktool.jar b -f xxty -o xxty.apk -only-main-classes`



这个命令再打包回APK，此时还不能安装



### 签名



APK需要签名才能安装，签名是一件挺简单的事情。

生成密钥：`keytool -genkey -alias ffeng -keyalg RSA -keysize 2048 -validity 36500 -keystore key.keystore`

签名：`jarsigner -verbose -keystore key.keystore xxty.apk ffeng`

此处`ffeng`是证书别名，~~不理解这个别名有什么意义~~

---

因为重新签名了，签名和之前不一样了，软件不能覆盖安装，要先卸载后安装。



很顺利，软件安装后也能正常使用，经过测试，包也能抓到了ψ(｀∇´)ψ



## 抓包



天色已晚，窗外还下着蒙蒙细雨，这个软件跑步还需要戴着手环，我先看了一下登录的接口。



这个软件的API，比我们学校网站的API好一万倍。ヾ(≧▽≦*)o

这个软件API的API非常统一，全部使用Json交换数据，偶尔看到几个乱七八糟的请求是调用第三方地图API的，和我的目标无关。

鉴权也十分简单，登录拿Token，从此Token放在请求开头。



请求模式上非常简单，但我在看登录请求时遇到了问题。



### 账号和密码的加密



游戏才刚刚开始。



Json交换数据这一点方便了很多，不用在解数据包上浪费时间。

在登录时会向服务器发送客户端的OS版本、厂商、软件版本以及账号密码，其中账号密码似乎是经过加密的。



账号和密码看上去都是Base64，解码后是一串长度为16字节的二进制数据。



密码猜测可能是哈希算法，但试了所有的算法并没有找到算法。



这个APP中账号和密码就是我们登录学校网站的账号密码，APP的服务器在登录时应该会去找学校网站服务器，所以这个密码不应该是哈希算法。



这时候应该怎么办？~~我不玩了~~ 当然是逆向翻源码！( •̀ ω •́ )✧

JS挺多的，找不到怎么办？一顿乱搜，找到了这样的代码，`a.default.aesMinEncrypt(this.loginId)`，

再往上，`a = r(s("fa7d"))`线索到这里就断了，密钥是什么，继续，搜`aesMinEncrypt`，只有一个地方有定义，

```javascript
s = i.enc.Utf8.parse("XXXXXXXXKey"),
a = i.enc.Utf8.parse("XXXXXXXX_Iv"),
```



结束φ(゜▽゜*)♪



---



我有理由怀疑后端使用了OpenSSO，因为它莫名其妙调用了一个叫`isOpenSSO`的接口，什么也没发送，什么也没接收，推测使用Java写的，然后用了Nginx。~~要不要SQL注入一下~~



在3月4日的晚上，我完成了上面的事情，但是第二天借手环抓包，借不出来手环，似乎是因为现在学校还没安排校园跑的事情。



虽然说这个软件在技术上似乎没什么反逆向，但是在技术以外的地方确实起到了一定的反逆向作用（不让借手环）。



中间了写了写借手环的接口和，项目停滞到了3月12日，通知说可以开始校园跑了，虽然显示的目标公里数还是0，但通知说可以跑，和上学期要求一样。



## 跑步数据



本来打算跑一圈，看看正确的数据长什么样子，借手环走了一圈，给我显示速度不合格，但已经足够了。



这个软件在开始跑步时告诉服务器开始跑了，服务器返回一个ID，在跑步结束之后客户端将整个过程的轨迹信息和结算发回服务器。



拿到数据我先来了个重放攻击，除了ID改了，时间什么的都原封不动发回去，我居然多了一条不合格记录。

再改掉速度和距离，我有了一条合格记录 \^o^/



跑步这一块数据几乎不校验，轨迹信息就是当作文件上传上去的，接口名字就叫`updateFiles`，估计服务器就完全不看，客户端想看的时候服务器就发下来，这次跑步的结果就只看结算信息。



我写程序的疏忽，发给服务器的日期格式错了，直接给服务器搞出BUG了，看跑步记录没有记录，但是公里数确实给我算上了。￣へ￣



---



首次安卓逆向，圆满结束！



与此同时，我用找到的接口写了一个APP  ( •̀ ω •́ )✧