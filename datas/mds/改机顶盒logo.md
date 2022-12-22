机顶盒重启几次就需要重置，否则开不了机让我很苦恼，于是我用终端各处找可疑文件，成功解决这个问题，除此以外找到了修改logo的方法。

## Recovery日志

我找到了Recovery模式的日志，位于`/cache/recovery`，关于清除的数据，日志里面提到，擦除了 `/dev/data`和`/dev/cache`这两个文件，除此之外还操作了`/dev/block/env`这个文件。

抱着试一试的心态，我cat了一下`/dev/block/env`，这不是Uboot的环境变量嘛。

同时`/dev/block`还有很多其他有趣的文件。

## /dev/block

这个目录是linux上面的块状存储设备的目录，像是硬盘什么的就会被以文件的形式放在这里。

我ls了一下：

```
ffeng@p201_iptv:/dev/block # ls -l
brw------- root     root     179,  12 2015-01-01 08:00 boot
brw------- root     root     179,  16 2015-01-01 08:00 bootfiles
brw------- root     root     179,   1 2015-01-01 08:00 bootloader
brw------- root     root     179,   3 2015-01-01 08:00 cache
brw------- root     root     179,   9 2015-01-01 08:00 crypt
brw------- root     root     179,  15 2015-01-01 08:00 ctc
brw------- root     root     179,  17 2015-01-01 08:00 data
brw------- root     root     179,   4 2015-01-01 08:00 env
brw------- root     root     179,  11 2015-01-01 08:00 instaboot
brw-rw-rw- root     root     179,   5 2015-01-01 08:00 logo
brw------- root     root       7,   0 2015-01-01 08:00 loop0
brw------- root     root       7,   1 2015-01-01 08:00 loop1
brw------- root     root       7,   2 2015-01-01 08:00 loop2
brw------- root     root       7,   3 2015-01-01 08:00 loop3
brw------- root     root       7,   4 2015-01-01 08:00 loop4
brw------- root     root       7,   5 2015-01-01 08:00 loop5
brw------- root     root       7,   6 2015-01-01 08:00 loop6
brw------- root     root       7,   7 2015-01-01 08:00 loop7
brw------- root     root     179,  10 2015-01-01 08:00 misc
brw------- root     root     179,   0 2015-01-01 08:00 mmcblk0
brw------- root     root     179,  32 2015-01-01 08:00 mmcblk0boot0
brw------- root     root     179,  64 2015-01-01 08:00 mmcblk0boot1
brw------- root     root     179,  96 2015-01-01 08:00 mmcblk0rpmb
brw------- root     root     179,  14 2015-01-01 08:00 params
drwxr-xr-x root     root              2015-01-01 08:00 platform
brw------- root     root     179,   6 2015-01-01 08:00 recovery
brw------- root     root     179,   2 2015-01-01 08:00 reserved
brw------- root     root     179,   7 2015-01-01 08:00 rsv
brw------- root     root     179,  13 2015-01-01 08:00 system
brw------- root     root     179,   8 2015-01-01 08:00 tee
drwxr--r-- root     root              2015-01-01 08:00 vold
brw------- root     root     253,   0 2015-01-01 08:00 zram0
```

这些文件居然还都是可读可写的。

似乎可以从这里直接修改到bootloader，不过我的技术实力就这样，改bootloader就算了，logo倒是可以试一试。

## 修改Logo

首先，把`/dev/block/logo`这个文件复制下来，发给电脑。

我直接`cat /dev/block/logo > /sdcard/logo.bin`然后用ftp来取文件。

这个文件正正好好 32mb - 1b。

![](/datas/images/38-2.png)

猜测，这个文件头记录了文件名和文件数据的对应关系，研究了许久，没弄明白文件头具体什么意思，或许这是一个文件系统也说不定。

我往文件后面翻，找到了一大块不是0的区域，这一块的开头是`BM`（此时的我没有注意到，文件前面就有BM），我曾经接触过bmp文件，所以知道BM是bmp位图文件的文件标识。我查找下一个BM，然后将两个BM中间夹着的数据另存出来，之前开机的图片呈现在我面前。

所以，看不懂前面也没关系，接下来只要替换掉这些数据就完成了吧。

我比较好奇，于是查找了所有BM，把这个文件的所有位图都提取出来了，这些文件被紧挨着放在一起，根本不需要知道起始位置和结束位置，看BM就知道了。

![](/datas/images/38-3.png)

提取出来的开机logo是一张 1920*1080 24位 的位图，我直接上Photoshop，画了一张格式一样的图片，结果我的比他的文件短8个字节，我的bmp文件头记录的文件长度比他的长2个字节（bmp文件的第3到10字节表示文件长度），怎么办呢？

```
他的结尾：9E 9D 97 96 90 8D 00 00 00 00 00 00 00 00 00 00
我的结尾：21 18 16 1F 16 13 00 00 -- -- -- -- -- -- -- --
```

直接，我的bmp文件头记录长度改成他的，然后文件后面补0，和他的一样长。

根据测试，文件依然可以打开。

覆盖原有数据，重新放到盒子上面，cat回去`cat /sdcard/logo.bin > /dev/block/logo`

reboot，完成！

![](/datas/images/38-1.jpg)

## 重置问题

这个问题嘛，其实我早就找到原因了，但只是觉得不对，没再研究。

我在翻`/data`的时候，发现了`/data/property/persist.sys.boot.fail_count`文件，他里面写了： `1`。

是谁把`persist.sys.boot.fail_count`文件放在这里的呢？是`/system/bin/ext_bootfail.sh`，他的名字足以说明一切。

`ext_bootfail.sh`里面写了个计数器，开机boot失败的时候执行一次，每次`persist.sys.boot.fail_count`加一，到达3的时候，`echo 1 > /bootfiles/bootfail.flag`

我先是重启了好几次，似乎都没有出发boot失败，计数器都没有增加，于是我执行`echo 1 > /bootfiles/bootfail.flag`，试了两次，每一次都需要重置。

秉着尽可能不破坏原系统的原则（虽然已经破坏的差不多了），我仅仅把echo那一行注释了。

解决！



