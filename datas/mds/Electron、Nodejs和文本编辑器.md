早就听说过node.js了，主要拿来写服务器的，之前开崩铁私服玩，那个私服服务端就是node.js写的来着。

Electron，一个可以直接把web代码拿过来当桌面程序用的东西，我在去年写变声软件时已经接触到了。

Electron嘛，是跑在node.js上的。今天想写一个小项目，就试试用Electron写吧。

## 关于项目

虽然在我的服务器上搭了个网盘服务，电脑手机都可以直接访问可以同步文件，但是如果我想要写文章之类的话，电脑同步好说，直接挂载Webdav，也还算稳定，手机的话就麻烦了，还要挪文件。

而且手机上感觉也没什么好用的编辑器。

所以，我要写一个编辑器，用web写，同时照顾到移动端和桌面端，服务端用golang写，储存文件时同时在本地多个文件夹里面存（因为我总感觉这个机顶盒服务器不稳定，万一哪天出问题了会丢数据，同时存在Emmc和Sdcard里面，双保险）。

2022年最后一天，肝一天，写完了。

界面写的像VS Code，还有标题栏呢，感觉做成桌面软件会很不错。

所以，Electron！

## Electron

直接上Electron加载网页，加载出来就有模有样的，然后只需要解决以下问题，这就是个完整的桌面应用了。

- 修改退出登录按钮的逻辑，使其可以退出应用
- 修改关闭页面事件的逻辑，在浏览器里不能调用异步保存，只能询问是否关闭，但是Electron可以异步保存。
- 自动登录，打开软件还要输密码，反正自己用，干脆自动登录
- 标题栏可拖动

再进阶一些。

- 加载失败的页面，Electron加载网页可能会失败，比如网线断了？。
- 失败时重新加载按钮

好，开始敲代码！

## 修改原来的页面

上面简单的问题，只需要稍稍修改原来的页面就能解决。

Electron里有主线程和渲染进程，主线程等渲染线程加载完页面之后直接上挂脚本就完了呗，像是油猴脚本一样。


```javascript
win.webContents.on('did-finish-load', () => {
    // 挂脚本
    win.webContents.executeJavaScript(`
        // 这里是挂上去的脚本
`)
```

至于标题栏拖动，则需要Electron的一个css：`-webkit-app-region: drag;`

挂css的脚本放在刚才挂的脚本里面：

```javascript
const styleElement = document.createElement('style');
styleElement.innerHTML = \`${addcss}\`;
document.head.appendChild(styleElement);
```

大功告成！

## 进阶

直接监听加载失败事件

```javascript
win.webContents.on("did-fail-load",()=>{
    win.on('did-finish-load',()=>{
        // 错误页面加载完成
    })
    win.loadFile("loadfail.html");
    });
```

但是即便加载失败did-finish-load也会触发，需要在之前挂上去的脚本里面加点检查代码，防止报错（不加也没关系啦，编译出来谁也看不到，也不会崩，JavaScript的好处）。

至于重新加载按钮嘛，这就牵扯到进程间通信了，不得不说，[官方文档](https://www.electronjs.org/zh/docs/latest/)写的很好。

在主进程里：

```
const { ipcMain } = require('electron')
// 重启事件
ipcMain.on('restart', ()=>{
    // 重新加载页面
})
```

在渲染进程里：

```
const { ipcRenderer } = require('electron')
ipcRenderer.send('restart')
```

但是渲染进程里不允许使用nodejs对象，上面渲染进程的代码不能被执行，需要用到preload脚本进行`require('electron')`暴露接口给渲染进程的其他脚本用。

### preload脚本

首先需要告诉preload脚本是什么：

```
const path = require('path');
const win = new BrowserWindow({
    webPreferences:{
        preload: path.join(__dirname, 'preload.js'),
    }
})
```

至于为什么要`path.join`，我发现直接上相对目录会报错，要求写绝对目录。

然后preload.js暴漏一个方法：

```
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('reStart',() => ipcRenderer.send('restart'))
```

重启直接`window.reStart()`就好了。

---

## 打包

打包，跟着官方走就好了嘛。

windows7最高支持node.js的 `13.XXX` 版本，这个版本能用Electron，但是不能打包，我打包的时候报`??`空合并运算符不支持。

换windows10就没问题了。

```
npm install --save-dev @electron-forge/cli
npx electron-forge import
```

可能会提示没装git之类的东西，提示什么装什么就好了。

接下来设置要把图标打包进去。

forge.config.js加点东西:

```json
module.exports = {
  packagerConfig: {
	  icon: "icon"
  }
}
```

图标可以填相对目录，不加扩展名，要求`.ico`格式

然后打包，`npm run make`

不出意外就能打包一个安装文件。但是我的出意外了，生成不出来安装文件。安装文件可以自己造啊，况且我也不需要，`out`目录里面找一找就能找到生成的文件。

## Golang的文件打开模式

Golang打开文件时有很多方法：（多个方法用按位且并一起）

```go
const (
	// 下面三个选一个
	O_RDONLY int = syscall.O_RDONLY // 只读
	O_WRONLY int = syscall.O_WRONLY // 只写.
	O_RDWR   int = syscall.O_RDWR   // 读写
	// 附加的
	O_APPEND int = syscall.O_APPEND // 从文件末尾开始写
	O_CREATE int = syscall.O_CREAT  // 没有则创建
	O_EXCL   int = syscall.O_EXCL   // 和O_CREATE一起用，文件必须不存在
	O_SYNC   int = syscall.O_SYNC   // 使用同步IO
	O_TRUNC  int = syscall.O_TRUNC  // 删除文件内容从头开始写
)

```

最初的我并没有看完这些方法，程序写完之后，莫名其妙删了字符保存之后依然有。

我还特意问了AI，O_WRONLY 会截断文件嘛？他给我说会截断。

回忆被AI坑的经历，我还是决定回来看看，嗯，没加`O_TRUNC`，又被AI坑了。

---

写完这个，感觉有种nodejs毕业了的感觉。虽然可能Golang更高效一些，但感觉庞大的项目还是更适合nodejs来写呢，我要不要学一下nodejs呢？。

（感觉给机顶盒装nodejs环境又得折腾半天，还是golang交叉编译香）