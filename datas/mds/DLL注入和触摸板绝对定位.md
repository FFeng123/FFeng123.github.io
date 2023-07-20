想玩会儿osu!，看看我的触摸板，假如它能像数位板一样绝对定位就好了···



搜了一下，没找到什么东西，但是将关键词翻译成英文之后搜到了一个项目 [AbsoluteTouchEx](https://github.com/apsun/AbsoluteTouchEx)，它通过往WInAPI上挂钩子，实现触摸板的绝对定位。



不知道是不是我Win11的问题，这个程序似乎并不管用，但是的确挂上钩子了。



感觉像是程序的问题，几K的代码，我来研究一下这个项目吧。



Windows的可执行文件在运行的时候会需要加载动态库文件，这些动态库里面装了编译好的代码，用于扩展程序功能。



## 取代正常的DLL



`各DLL和可执行文件是相对独立的，只使用暴露的接口交互。`



针对于这一点，找到一个DLL，查看它有哪些接口，直接编译一个接口相同的DLL。



此处有两个目的，



- 自己编译的DLL进入了虚拟内存空间，可以执行我们希望执行的代码。

- 可以返回希望返回的值，比如，软件询问是否激活，直接返回True。
  
  

据说steam的游戏好多都是这样破解的。



## 加载一个新DLL



莫名其妙的DLL程序肯定不会去加载的，就算加载了也不会执行里面的代码（除了加载卸载的时候会去执行一下DllMain）。



微软有一个Detours库，用来注入挂钩子什么的，这是一个好东西。



首先`DetourCreateProcessWithDllExA`这个函数，用于执行一个可执行文件，并给它注入DLL，这个DLL会在可执行文件代码执行之前执行，所以可以安全地整活。



所有核心代码都在这个DLL里面。



注入DLL的位数需要和可执行文件一致，否则DLL会被注入到一个辅助进程中运行，这样和主进程是不同的虚拟内存空间，无法达到目的。



DLL内可使用`DetourIsHelperProcess`函数看一下自己是不是被注入对了，如果被注入和辅助进程会返回True。



`DetourCreateProcessWithDllExA`注入DLL似乎是修改了可执行文件的PE头，为了兼容性，需要在DLL中执行一下`DetourRestoreAfterWith`。



挂钩子似乎需要修改只读的内存，为了能写只读内存，执行`DetourTransactionBegin`。



然后就可以开始挂钩子了。



`DetourAttach`是用来挂钩子的函数，要知道，只要是同一个函数，DLL中拿到的和主程序拿到的指针是一样的，假如我们在DLL这边修改了指针指向的内容，主程序那边执行的内容就会变。



`DetourAttach`这个函数传入两个参数，一个是要挂钩子的函数，第二个是我们的函数，我们的函数应当与原函数签名一致，以便接收参数和给返回值。



第一个传入参数的类型是**指向函数指针的指针**，过后这个**指向函数的指针**会发生变化，因为原函数挂钩子导致它的代码发生了变化，本DLL需要调用挂钩子之前的代码，所以挂钩子的同时对原来的代码进行了备份，变化之后的指针指向备份的代码。



例如要对`CreateWindowExW`挂钩子，监听窗口创建。



```c++
static decltype(CreateWindowExW) *g_originalCreateWindowExW = CreateWindowExW;

static HWND WINAPI
AT_CreateWindowExWHook(···){
    // 希望执行的代码
    return g_originalCreateWindowExW(···)
}

BOOL APIENTRY DllMain(HINSTANCE hModule, DWORD dwReason, PVOID lpReserved){
    if (DetourIsHelperProcess()) {
        return TRUE;
    }
    switch (dwReason) {
    case DLL_PROCESS_ATTACH:
        DetourRestoreAfterWith();
        DetourTransactionBegin();
        DetourAttach((void **)&g_originalCreateWindowExW, AT_CreateWindowExWHook);
    case DLL_PROCESS_DETACH:
        DetourTransactionBegin();
        DetourDetach((void **)&g_originalCreateWindowExW, AT_CreateWindowExWHook);
    }
    return True;
}
```



看好多地方以及这个项目中都使用了 `DetourUpdateThread(GetCurrentThread());`，我很好奇这是干嘛的，于是去翻了翻源代码，结果是，这句话什么都没做：

```c++
LONG WINAPI DetourUpdateThread(_In_ HANDLE hThread){
    ···
    // Silently (and safely) drop any attempt to suspend our own thread.
    if (hThread == GetCurrentThread()) {
        return NO_ERROR;
    }
    ···
}
```

## 

---



调试了一上午程序，在其他情况似乎都没问题，但是osu!中系统好像没有将触摸板的原始数据发过来，谜之WindowsAPI，我没什么办法，结果还是不能拿触摸板玩osu!，但是学到了DLL注入。




