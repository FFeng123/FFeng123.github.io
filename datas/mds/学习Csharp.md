c sharp，一个面向对象的高级语言，作为微软 .net框架的一部分。

和Java比起来，内存使用更少，执行效率稍微高一点，同样也可以跨平台。

我之所以要学C#，是因为接下来打算学一下Unity，Unity的脚本需要C#来编写。

C#的跨平台得益于dotnet core跨平台，目前C#似乎已经可以编写安卓APP了，但是因为需要集成.net core，所以应用体积会大得多。

Unity也需要dotnet core吧，但是游戏动不动几百上千兆，这点大小也没什么。

## 与C++的对比

有其他语言的基础，两天学习一门语言不是梦。

C#就像是不允许定义函数和全局变量的C++。

### 零零碎碎的小语法

像是定义变量、循环、条件判断、命名空间什么的很多很多与C++完全相同。

不一样的都行东西很少。

- 在C++里面的导入命名空间`using namespace XXX;`，namespace省了，C#写成`using XXX`，using也就只有导入命名空间这一功能了。
- C++的迭代器语法糖，`for(type var : array);`在C#有专门一个语法，`foreach(type var in array)`。
- C#有多维数组这种类型（不像C++，数组的数组叫做二维数组），在方括号加逗号就可以定义和索引多维数组，像是这样`int[,] a = new int[2,3]{{1,2,3},{4,5,6}};a[1,2] == 6;`
- 多了两个个运算符，`??`二元运算符，空合并运算符，如果前者为null，返回后者，反之前者，还有`?.`空条件运算符，和`.`功能相同，但会避免null对象抛异常，对象为空返回null。

### 引用类型和值类型

C++中的所有类型（包括class，struct这样的），在进行传递时都是进行值复制，在C#看来，这些都是值类型。

在C#中的所有基本类型（像long、char这样的你一眼看过去就知道多大的类型，指针是整数它也算）是值类型。

C#中所有类（包括自己定义的class和语言带的String、ArrayList、dynamic什么的）都是引用类型，在C++看来就是`#define Type Type*`，传递的时候传递指针，避免复制对象，64位的内存指针总比不知道到底多大的对象复制快吧。

这一点在Javascript、Java什么的语言上都是一样的，倒不如说，是C++太过底层了才会把所有类型都当值类型。

顺带一提，struct在C#里是值类型。

### Nullable和Dynamic

Nullable，可空类型，一个模版类，Nullable\<type\>，给一个类型做包装，使其可以被设置为null（正常人应该不会去给引用类型包装吧），值类型转换引用类型的一种方法。

像是这样，`Nullable<int> a = null;`

C#贴心的准备了语法糖：`int? a = null`与上面意思相同。

dynamic，动态类型，让一个变量变得像python、js这样的脚本语言的变量一样。

像是这样：`dynamic a = 123;a = "456";a = null;`。

感觉这个也就解析json的时候有点用。

### 指针

C#依然有这玩儿，使用着玩儿的代码被认为是不安全代码，需要在方法上加上`unsafe`关键字修饰。

说实话总感觉用这玩意影响内存回收。

### 面向对象

面向对象这方面与C++有些区别。

首先C#不支持多继承，也因此可以用base访问到父类。

与C++相同，可以使用成员初始化列表（构造函数后面加冒号，用于初始化的代码），如果父类没有默认构造函数（参数为空的构造函数），就需要吧`base(...)`放进去。

C#有以下封装修饰：

|       关键字        |                作用                |
| ------------------ | ---------------------------------- |
| public             | 公开，和C++相同，谁都可以访问         |
| private            | 私有，和C++相同，只有此类内部可以访问 |
| protected          | 保护，和C++相同，此类和子类可以访问   |
| internal           | 私有内部，程序集内类可以访问          |
| protected internal | 保护内部，程序集内类和子类可以访问    |

最终生成在同一个文件里面的代码是同一程序集，每个dll、exe文件是同一个程序集。

#### 多态

和C++一样，可以用virtual声明虚方法，可以根据类继承关系重写方法。

以抽象方法取代C++的纯虚方法。

在给方法加`abstract`抽象关键字时，类上也要加上抽象关键字。

在重写虚方法和抽象方法时需要加上`override`关键字。

### 接口

比C++多了个接口的概念，接口像class和struct一样可以声明方法和属性，但是不能实现。

class可以继承多个接口，class继承接口之后需要实现接口中定义的方法。

接口默认修饰符是`public`，而且不能改，因为留接口就是给调用的，禁止访问就没意义了。

### 属性访问器

给C++类做封装，给成员变量加get、set是很麻烦的事情，C#提供了访问器这一工具，像JS里面的一样。

在声明属性（成员变量）时，可以顺手添加访问器：

```csharp
private int statevalue;
public int State{
    get{
        return statevalue;
    }
    set{
        statevalue = value;
    }
}
```

访问器也可以加抽象修饰。

### 索引器

C#似乎不能重载方括号运算符，但是C#提供了更好用的，叫索引器的东西

```csharp
public dynamic this[string index1,int index2]{
    get{
        ··· 
    }
    set{
        ···
    }
}
```
### 委托

C#虽然支持指针，但是不推荐使用，就像C++的`goto`一样，那么C++指向函数的指针就应该在C#中有取代物，这就是委托（Delegate）。

C++中，保存函数指针的变量的类型一般需要`typedef`出来，像是声明指针类型，C#中委托也需要声明类型。

delegate像是class、struct、enum关键字，指定声明的类型是委托。

像是这样声明一个委托`public delegate void FuncDelegate(string s);`，FuncDelegate是一个类型，不是一个方法。

然后这样就得到一个指向函数的指针：

```csharp
public delegate void FuncDelegate(string s);
void Func(string s){
    ···
}
···{
    FuncDelegate fd = new FuncDelegate(Func);
    fd("abc");
}
```

两个相同类型的委托可以使用加法运算符相加，这样在调用的时候可以同时调用多个函数，称为委托多播。

使用委托，可以做到像是绑定事件啦，回调函数什么的，但当使用委托做事件的时候可能会遇到一个问题：

```csharp
class Obj{
    public delegate void eventDelegate(string s);
    public eventDelegate event1;
}
Obj A = new Obj();
// 现在外部可以绑定事件了：
A.event1 += new eventDelegate(Func);

// 但是外部可以调用这个事件：
A.event1();
```

虽然可以使用封装的方式解决这个问题，但是过于麻烦了，C#提供了`event`这个关键字，加了这个关键字的委托在外部不允许调用。

（我看教程把事件整那么麻烦，不就是个event和委托的应用嘛。）

### 泛型

和C++一样，有泛型这个东西，写起来比C++的方便。

只需要在声明类、函数、接口什么的的时候在名称后面加上尖括号，尖括号里面写类型占位符，免去了C++的`template<typename T>`
像是这样：`public int Func<T>(T a, int i);`

### 模板类

命名空间System.Collection里提供了一些数据结构，写程序不可缺的东西。

|     类      |           |
| ---------- | --------- |
| ArrayList  | 线性数组   |
| BitArray   | 位数组     |
| Hashtable  | 哈希表     |
| Queue      | 队列       |
| SortedList | 有序键值对 |
| Stack      | 栈         |

可惜这些数据结构的数据类型都是动态类型（Dynamic），官方也说不建议使用这些数据结构，取而代之的是命名空间System.Collections.Generic的数据结构：

|                  类                  |                                             |
| ----------------------------------- | ------------------------------------------- |
| Dictionary\<TKey,TValue\>           | 哈希表                                      |
| HashSet\<T\>                        | 哈希集合                                    |
| LinkedList\<T\>                     | 双链表                                      |
| List\<T\>                           | 线性数组                                    |
| PriorityQueue\<TElement,TPriority\> | 优先队列                                    |
| Queue\<T\>                          | 队列                                        |
| SortedDictionary\<TKey,TValue\>     | 有序键值对                                   |
| SortedList\<TKey,TValue\>           | 有序键值对（Key需要实现 IComparer\<T\> 接口） |
| SortedSet\<T\>                      | 有序数组                                    |
| Stack\<T\>                          | 栈                                          |

参见[微软.Net文档](https://learn.microsoft.com/zh-cn/dotnet/api/system.collections.generic)。

讲真的比起~~赌狗~~哈希表我更喜欢稍微慢一点的红黑树。

### 匿名函数

作为一个成熟的语言，怎能没有匿名函数？

指向匿名函数的指针需要用委托对象来存，匿名函数有两种方法声明：

```csharp
public delegate void FuncType(int i);

···

FuncType funcvar;// 存委托的变量
// 第一种写法
funcvar = delegate(int x){
    ···
};
// 第二种写法
funcvar = (int x) =>{
    ···
}

```

### 类型转换

C++风格的类型转换不能用了：`int(···)`
C语言风格的还是能用的：`(int)···`

C#也提供了一些转换的方法，

Convert类下面有一些静态方法可以做简单类型的转换。
简单类型有`Parse`方法可以从字符串转换，比如int`int.Parse("123")`，失败会抛出错误，有不抛错误的版本`TryParse`。

Convert类在将浮点数转换为整数时，如果浮点不整，那么将会返回最近的偶数（就离谱）。

类转换时使用`as`关键字，如果兼容，将会转换类型，不兼容返回null，像是`Class1 var = obj as Class1;`这样。

### ref和out修饰方法参数

ref和out的结果都是使传入方法的左值可以被修改。

对于引用类型，加不加修饰都可以修改传入的参数。
对于值类型，默认值传递，不能修改。

ref关键字修饰参数，使其无论如何都是引用传递。

out关键字修饰参数，与ref相同，在需要方法多返回时使用这个修饰，为了代码的可读性。

方法定义使用了out，传参时也要使用out，像是这样：

```csharp
public void func(out int a){
    a = 1;
}
···
int a;
func(out a);
```

## Unity

这样语言上就没什么大问题了，虽然还缺一些实践，但已经可以开始研究Unity的API了。

要想写出来的代码之后不用回头重写，先充分看懂API是很有必要的。

程序语言，果然，学的越多学的就越快啊。

游戏引擎也是大同小异吧，学过Godot的话学Unity应该也不困难吧？
