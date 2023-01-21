React，一个UI库。

React Native，使用React写出原生的东西。

和Electron，把Web页面当作桌面程序运行有点异曲同工之妙，但是区别挺大的。

Electron嘛，可以理解成一个轻便的浏览器，React Native嘛，是把React Native的组件转换成安卓原生的组件渲染（假装这个库不支持苹果~~因为我不喜欢苹果~~），用个什么引擎运行javascript脚本。

所以，React Native库完全不能像Electron一样把网页直接拿来渲染。

React Native摸不到安卓底层，很多东西没有（比如传感器），这需要写java代码给React Native调用。

React Native不写原生代码的话只能做到漂亮的UI+网络操作。

但是看看我写的稀碎的安卓界面交互，React Native，可以。

## 环境搭建

首先，需要魔法上网，好多东西都是从谷歌下的。

React Native目前要求Nodejs v14+，win7只能安装到v13，所以需要win8或更高版本的操作系统。

因为和安卓扯上关系了，还要Java SDK和Android SDK。

目前Java SDK要求v11+，Android SDK要求31版本的。

Android SDK的话，安装好Android Studio直接去SDK Manager找就好了。

Android SDK还需要手动设置一下环境变量，好让之后编译项目的时候能找到：

对着官方文档，`PATH`变量加上这些：

```
%ANDROID_SDK_ROOT%\platform-tools
%ANDROID_SDK_ROOT%\emulator
%ANDROID_SDK_ROOT%\tools
%ANDROID_SDK_ROOT%\tools\bin
```

然后加一个`ANDROID_SDK_ROOT`变量，填SDK的绝对目录。

安装React Native嘛，直接找npm就好了：

```
npm install -g react-native
npm install -g yarn # 后面会用到，npm的替代品，顺手装上。
```

装好了创建项目：

```
npx react-native init 项目名
```

（helloworld居然是保留字段！？？）

完了之后会创建一个项目名的目录，CD进去，有很多东西，先编译运行试试环境。

在此之前，先用adb把手机或者模拟器连上。

```
yarn react-native run-android
```

这个命令会同时启动一个叫Metro的东西，这是用于往手机上动态发送页面的，方便调试。

不出意外，漫长的等待之后手机会运行一个app。

（学习每个东西的时候我在这里都会出意外，这次是因为执行之后ctrl+c了一次，java的编译器并没有ctrl+c掉，两次的编译器同时编译，导致编译失败···）

`yarn start`可以单独启动Metro。

## Hello World

嗯，什么都可以没有，这个不能少。

打开index.js，这是nodejs的入口代码。

```
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
```

这个我懂，React不是组件化的嘛，这就是把App这个组件作为根组件，启动应用嘛。

去把根组件改成HelloWorld呗。

直接打开App.tsx，看不懂的全都删除，加上我想写的东西：

```tsx
import React from 'react';
import {
  Text,
  View,
} from 'react-native';

function App(): JSX.Element {
    return(
      <View>
        <Text>
          你好世界！
        </Text>
      </View>
    );
}

export default App;
```

ctrl+s保存文件的一瞬间，Metro就把页面发给手机了，瞬间看到效果。

## 调试

Web开发的各种BUG都很好解决啦，前提是得有调试器。

Metro在手机连接的时候会同时在电脑上打开一个网页，利用浏览器进行调试。

我不想用浏览器调试，官方有提供独立的调试器，但它死活安不上，这个依赖Electron，虽然我以前安装过Electron，但它非得再装一遍，二进制文件下载不下来，好在可以[去Github下载](https://github.com/jhen0409/react-native-debugger/releases)

~~现阶段的我还不会用这东西~~

---

能写HelloWorld离真正能写出东西还差得远呢，还要继续学习···

~~但是我不能整功夫捣鼓它了，我要抽出时间卷文化课~~



