虽然是为了Unity学的C#，但是Hello World我觉得还是有必要的。

## 你好世界

从最简单的终端Hello World开始。

实在不想折腾VS Code，把Visual Studio的C#装上了。

```csharp
using System;
namespace hello_dotnet
{
    class main
    {
        static public int Main(string[] args)
        {
            Console.WriteLine("你好世界！");
            string scanstr;
            do
            {
                Console.WriteLine(scanstr = Console.ReadLine());
            } while (scanstr.Length != 0);
            
            return 0;
        }
    }
}
```

Main方法的class可以是任何名字。

## 窗口程序

只写个helloworld就算是不学C#也能写啊，我要再做点其他的事，VS上装的环境是.net桌面开发，我创建个窗口不过分吧。

先创建了一个窗口程序的模版，参照这个模版写程序。

在System.Windows.Forms下，有Application类，它的方法属性都是静态的，这个类简化了编写窗口程序过程。

用宇宙最强IDE在项目里新建一个Windows窗体，我取了个名字叫mainwindow，直接下面的代码，进入窗口的事件循环。

```csharp
Application.EnableVisualStyles();
Application.SetCompatibleTextRenderingDefault(false);
Application.Run(new mainwindow());
```

C#只要是同一个程序集的东西就可以直接拿来用，这里mainwindow类就没导入什么的，很舒服。

创建的窗口是一个空窗口，我要往里加点东西，找了好久，往里加控件需要用到VS里的工具箱（菜单栏>视图>工具箱），布局用的控件感觉不如QT。

在VS的属性里面可以给选中控件绑事件，可以直接选择类的方法或者是双击创建一个方法。

## partial 关键字

如果我想把一个class拆到两个C#源文件里面应该怎么做？

加partial！

partial修饰的class，所有同名的会合成一个（不加partial会重定义错误）。

C#的窗体类，一部分代码需要手动编写，这些代码放在一个cs里面，一部分代码由编辑器根据设计生成，这些代码在另一个cs里，但这些代码都在同一个class里面。

## 资源文件

对于写Unity脚本来说，这里跑题了。

假如我想吧一张图片嵌入到exe里怎么办？

我可以用工具，把图片数据转换文本，转换成类似这样的：`···0x66,0xff,0x66···`，然后放到代码里面作为常量构造Bitmap（位图），但是，我又不是在给单片机写程序，要是非得这样写，我宁可把图片放到exe外面。

在VS里，用.resx文件记录资源文件，在编译时会将这些文件编译进exe。（我的.resx是编辑器生成的，在我给一个图片控件添加图片文件时自动创建的）

VS会给resx文件生成代码，用于访问资源。

生成的代码在`global::`下，我位于`项目/Properties/Resources.resx`的资源文件生成的代码在`global::hello_dotnet.Properties.Resources`，利用代码提示，轻松找到资源。

Resources下面有与资源同名的属性，可以直接取过来用。

虽然资源文件在用的时候是像常量那样取过来用的，但是资源文件并非在启动的时候就加载到内存了，这些与资源同名的属性都是属性访问器，取值相对于执行了方法，这个方法会加载和缓存资源文件，通过IDE跳转过去的具体实现：

```csharp
/// <summary>
///   查找 System.Drawing.Bitmap 类型的本地化资源。
/// </summary>
internal static System.Drawing.Bitmap _1 {
    get {
        object obj = ResourceManager.GetObject("pic1", resourceCulture);
        return ((System.Drawing.Bitmap)(obj));
    }
}
```

我还用一个超大的文件进行了测试，确实没有启动时往内存里加载。

VS的C++也有资源文件的概念，以我之前那时候的计算机水平，到放弃也没整明白。

## 输出类型

在项目属性里面有个叫输出类型的选项，控制台应用程序 会在启动时带着终端启动，windows应用程序不会带终端。

---

![](/datas/images/32-2.jpg)
