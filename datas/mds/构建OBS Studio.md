OBS Studio是个好东西，性能好、功能全、还开源。



我因懂得都懂的原因需要调节麦克风的延迟好使音画同步，当然软件有这个功能，但是我要填的值不在区间内。



好在软件开源，在测试过取值区间的范围之后，我直接在Github搜索值，成功找到了限制代码，我只需要修改这一行代码再编译就好了，我编译这种大型的项目从来没成功过，但是换电脑了啊，最新的操作系统，我相信不会出什么意外。



## 编译



啥也不改，照着官方说明，装上QT，下载好依赖，build，失败。



回头看看，漏了一步，需要执行一个ps脚本下载依赖。



执行脚本，失败，多半网络问题。



不要在这里折腾了，试试简单粗暴逆向吧。



## 逆向



逆向，说的高大上，实际上我啥也不会，只能拿个十六进制编辑器搜索整数值。



一个一个试，十六进制正着倒着都试了一遍，要不改了没用，要不改了打不开软件。



啥也不会，注定失败。



## Github  Actions



结果还得自己构建。但是我可以用上Github的虚拟机。



看了一下[OBS Studio](https://github.com/obsproject/obs-studio)项目，里面是有构建的动作的，似乎当推文件的时候就会自动构造。



改了一下代码，等了很久很久，构建完了，成功了，但是啥也没得到。虚拟机上的文件我看不到。



经过好几次莽撞失败删库再fork，动了动脑子，好好看了看前人的经验。



“原来发布Releases是需要Token的！”



在账户上创建密钥，然后赋值给环境变量···



紧接着又是失败，上传项目时失败了，调用的 `JasonEtco/upload-to-release@master`，报错说容器操作在windows上不能用。



找来找去，最终在build任务里添加以下代码结束战斗。



```yaml
      - name: Create Release
        id: create_release
        uses: actions/create-release@v1
        env:
         GITHUB_TOKEN: ${{ secrets.TOKEN }}
        with:
         tag_name: "r-test"
         release_name: Release Test
         draft: false
         prerelease: false
      - name: Upload Release Asset
        id: upload-release-asset
        uses: actions/upload-release-asset@v1
        env:
         GITHUB_TOKEN: ${{ secrets.TOKEN }}
        with:
         upload_url: ${{ steps.create_release.outputs.upload_url }}
         asset_path: ${{ env.FILE_NAME }}
         asset_name: win.zip
         asset_content_type: application/zip
```



我发现，同样一份代码，macOS上和Linux比WIndow编译快。



## 但战斗还未结束



同步偏移这个属性，用于控制音画同步，往正调，能调20秒，声音慢20秒，往倒着调，只能调0.95秒，正着调实现盲猜音频缓冲区加长，至于倒着调，我的想法是让视频和其他音轨缓冲区加长，但可能不是这样实现的，因为我调成较大的负数之后声音就没有了。



嗯，没错，解决往里填数的问题还没完。



去主仓库的问题里看了下，视频和音频的同步似乎相当复杂，这不是我能解决的问题。



没成功，但···至少我现在对Actions略知一二了。



音频同步，再想其他办法吧···
