MMD([MikuMikuDanc](https://zh.moegirl.org.cn/MikuMikuDance))，一个3D动画软件，不具备建模功能，做动画不如Maya，渲染谁都不如，但是它简单。

## 起因

在[模型屋](https://www.aplaybox.com/u/680828836/model)看到了原神官方发的模型，借此，处了学过的Maya，也想学学Blender之类的软件。

下载到的模型文件后缀名是**pmx**，未曾见过的模型格式，导入Blender需要安装一个叫[mmd_tools](https://github.com/powroupi/blender_mmd_tools)的插件。

这样就能成功导入到Blender了，但是我并不会用Blender，出各种离谱问题，此时我将目光投向了**mmd_tools**的**mmd**。

MMD是一个软件。

## 拼拼凑凑

先百度搞到一些VMD文件。

.pmx是模型文件，是带有骨骼蒙皮和材质纹理的模型。

.vmd是动画文件，存储着动画关键帧。

这俩文件往MMD里面一拖，模型就动起来了。

直接渲染就完了，所见即所得，渲染和不渲染看到的没有一点区别（所以说它渲染的好~~垃圾~~）

## 关于骨骼

刚开始我还有一些难以置信，为什么能够正确的给模型加上动画。

我发现，
模型绑定的时候似乎有一套规范，人物模型的绑定中，骨骼的名称和方向什么的是固定的。

因为动画文件应用在模型上的时候是通过骨骼名称进行应用的。

物理演算还没有了解，看起来很简单的样子。

之前用Maya物理演算，把每个顶点当成一个球进行演算，巨卡无比，但是正常人似乎是给模型绑上一些用于模拟物理计算的骨骼，对骨骼进行演算。

## 最后

用MMD让我感觉建人物模型也不是很难，我要不要好好学学Blender呢？


<video controls>
    <source src="/datas/res/29-1.mp4">
</video>

<video controls>
    <source src="/datas/res/29-2.mp4">
</video>
