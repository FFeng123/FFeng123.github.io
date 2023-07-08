新电脑里面装的 RTX4060，我知道的GPU除了拿来打游戏就是跑AI，打游戏用GPU来渲染画面，跑AI用GPU来算向量，这两个似乎也没什么共通之处，肯定不是只能做这两种事情。



稍微搜了一下，是可以用在一般的计算上面的。



我看到了希望，开始学习CUDA吧，目标是并行百万状态机。



## 开始



CUDA得装上。我要跑AI，CUDA早就装好了。



然后，CMD里瞧一瞧显卡状态：



```bash
nvidia-smi

+---------------------------------------------------------------------------------------+
| NVIDIA-SMI 536.23                 Driver Version: 536.23       CUDA Version: 12.2     |
|-----------------------------------------+----------------------+----------------------+
| GPU  Name                     TCC/WDDM  | Bus-Id        Disp.A | Volatile Uncorr. ECC |
| Fan  Temp   Perf          Pwr:Usage/Cap |         Memory-Usage | GPU-Util  Compute M. |
|                                         |                      |               MIG M. |
|=========================================+======================+======================|
|   0  NVIDIA GeForce RTX 4060 ...  WDDM  | 00000000:01:00.0 Off |                  N/A |
| N/A   53C    P0              43W / 115W |   5030MiB /  8188MiB |     67%      Default |
|                                         |                      |                  N/A |
+-----------------------------------------+----------------------+----------------------+

+---------------------------------------------------------------------------------------+
| Processes:                                                                            |
|  GPU   GI   CI        PID   Type   Process name                            GPU Memory |
|        ID   ID                                                             Usage      |
|=======================================================================================|
|    0   N/A  N/A     10664      C   ...RVC-beta-v2-0618\runtime\python.exe    N/A      |
|    0   N/A  N/A     12184    C+G   F:\Steam\steam.exe                        N/A      |
+---------------------------------------------------------------------------------------+
```

（得到上面的信息的时候我正在训练RVC模型）



这样只能看到概况，更详细的，它到底能跑多少线程，到底多少核心嘛：

```bash
"C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v11.8\extras\demo_suite\deviceQuery.exe"
Starting...

 CUDA Device Query (Runtime API) version (CUDART static linking)

Detected 1 CUDA Capable device(s)

Device 0: "NVIDIA GeForce RTX 4060 Laptop GPU"
  CUDA Driver Version / Runtime Version          12.2 / 11.8
  CUDA Capability Major/Minor version number:    8.9
  Total amount of global memory:                 8188 MBytes (8585216000 bytes)
MapSMtoCores for SM 8.9 is undefined.  Default to use 128 Cores/SM
MapSMtoCores for SM 8.9 is undefined.  Default to use 128 Cores/SM
  (24) Multiprocessors, (128) CUDA Cores/MP:     3072 CUDA Cores
  GPU Max Clock rate:                            2370 MHz (2.37 GHz)
  Memory Clock rate:                             8001 Mhz
  Memory Bus Width:                              128-bit
  L2 Cache Size:                                 33554432 bytes
  Maximum Texture Dimension Size (x,y,z)         1D=(131072), 2D=(131072, 65536), 3D=(16384, 16384, 16384)
  Maximum Layered 1D Texture Size, (num) layers  1D=(32768), 2048 layers
  Maximum Layered 2D Texture Size, (num) layers  2D=(32768, 32768), 2048 layers
  Total amount of constant memory:               zu bytes
  Total amount of shared memory per block:       zu bytes
  Total number of registers available per block: 65536
  Warp size:                                     32
  Maximum number of threads per multiprocessor:  1536
  Maximum number of threads per block:           1024
  Max dimension size of a thread block (x,y,z): (1024, 1024, 64)
  Max dimension size of a grid size    (x,y,z): (2147483647, 65535, 65535)
  Maximum memory pitch:                          zu bytes
  Texture alignment:                             zu bytes
  Concurrent copy and kernel execution:          Yes with 1 copy engine(s)
  Run time limit on kernels:                     Yes
  Integrated GPU sharing Host Memory:            No
  Support host page-locked memory mapping:       Yes
  Alignment requirement for Surfaces:            Yes
  Device has ECC support:                        Disabled
  CUDA Device Driver Mode (TCC or WDDM):         WDDM (Windows Display Driver Model)
  Device supports Unified Addressing (UVA):      Yes
  Device supports Compute Preemption:            Yes
  Supports Cooperative Kernel Launch:            Yes
  Supports MultiDevice Co-op Kernel Launch:      No
  Device PCI Domain ID / Bus ID / location ID:   0 / 1 / 0
  Compute Mode:
     < Default (multiple host threads can use ::cudaSetDevice() with device simultaneously) >

deviceQuery, CUDA Driver = CUDART, CUDA Driver Version = 12.2, CUDA Runtime Version = 11.8, NumDevs = 1, Device0 = NVIDIA GeForce RTX 4060 Laptop GPU
Result = PASS
```

上述信息可得：

- SM数量：24

- 流处理器数量：24*128 = 3072
  
  

## 基本概念

进行CUDA编程，基本概念最好熟悉一下啦。



如图，硬件层面的GPU组成：



![GPU](/datas/images/47-2.jpg)



但是在编程时不会用到上面的概念，而是下面这样：



![CUDA](/datas/images/47-3.jpg)



申请一个块，块里面装着（x，y，z）这么多个线程，至于xyz最大多大嘛，上面的信息说我的是`(1024, 1024, 64)`。



到执行的时候，Block会直接丢给GPU让它去想办法运行。



当然上述都是简化的。~~不简化的我也不明白~~



## 环境搭建



好了，东拼西凑，弄清了基本概念，接下来准备写代码的环境。



虽说其他语言也不是不可以，但我选C++。



正当我打算装环境的时候，我发现，似乎已经装好了。



只要正常安装了CUDA，VS上面啥都不用动就可以直接新建CUDA Runtime项目。



### 小插曲：VS社区版许可证过期？



离谱，社区版说我许可证过期。



通过以管理员权限运行和VS同目录的`DDConfigCA.exe`解决。



猜测是文件夹权限问题。

---

新建项目，直接编译运行···



没出意外。



## 分析自带的HelloWorld



现在还啥都不会，看看新建项目带的HelloWorld吧。



这个项目整了两个数组，然后丢给GPU相加，然后拿回来结果输出。



没什么意思的main:

```c++
int main()
{
    // 造两个数组存需要计算的数，一个数组存结果
    const int arraySize = 5;
    const int a[arraySize] = { 1, 2, 3, 4, 5 };
    const int b[arraySize] = { 10, 20, 30, 40, 50 };
    int c[arraySize] = { 0 };

    // 核心操作
    cudaError_t cudaStatus = addWithCuda(c, a, b, arraySize);
    if (cudaStatus != cudaSuccess) {
        fprintf(stderr, "addWithCuda failed!");
        return 1;
    }

    printf("{1,2,3,4,5} + {10,20,30,40,50} = {%d,%d,%d,%d,%d}\n",
        c[0], c[1], c[2], c[3], c[4]);

    // 翻译：cudaDeviceReset必须在退出之前调用，以便分析和跟踪工具(如Nsight和Visual Profiler)显示完整的跟踪。
    // cudaDeviceReset must be called before exiting in order for profiling and
    // tracing tools such as Nsight and Visual Profiler to show complete traces.
    cudaStatus = cudaDeviceReset();
    if (cudaStatus != cudaSuccess) {
        fprintf(stderr, "cudaDeviceReset failed!");
        return 1;
    }

    return 0;
}
```

有意思的，我去掉了错误处理代码：

```c++
void addWithCuda(int *c, const int *a, const int *b, unsigned int size)
{
    int *dev_a = 0;
    int *dev_b = 0;
    int *dev_c = 0;

    // 选择一个GPU。
    cudaSetDevice(0);

    // 让GPU分配显存
    cudaMalloc((void**)&dev_c, size * sizeof(int));
    cudaMalloc((void**)&dev_a, size * sizeof(int));
    cudaMalloc((void**)&dev_b, size * sizeof(int));

    // 往显存复制东西
    cudaMemcpy(dev_a, a, size * sizeof(int), cudaMemcpyHostToDevice);
    cudaMemcpy(dev_b, b, size * sizeof(int), cudaMemcpyHostToDevice);

    // 创建 一个 block，每个block的大小是（size，1，1）
    // addKernel是代码中定义的一个函数
    addKernel<<<1, size>>>(dev_c, dev_a, dev_b);

    // Check for any errors launching the kernel
    cudaGetLastError();

    // cudaDeviceSynchronize waits for the kernel to finish, and returns
    // any errors encountered during the launch.
    cudaDeviceSynchronize();

    // 复制回来
    cudaStatus = cudaMemcpy(c, dev_c, size * sizeof(int), cudaMemcpyDeviceToHost);

    // 释放内存    
    // cudaFree可以释放不能释放的指针，因为它有返回错误
    cudaFree(dev_c);
    cudaFree(dev_a);
    cudaFree(dev_b);
}
```

哇，好简单。



但是正式开始写之前还是先尽可能多地整明白东西把。



## 修饰符



注意到，这个项目中，代码文件的的扩名为`.cu`，新增修饰符是不是和这个有关不清楚，但写程序新增的这几个修饰符很必要。



对于函数，可以用这些修饰符修饰：

- `__host__`：只能在CPU上跑的函数

- `__device__`：只能在GPU上跑的函数，只能被GPU的其他函数调用，不能作为线程的启动函数，这种函数总是inline，强制不inline的话加`__noinline__`修饰

- `__global__`：只能在GPU上跑的函数，不能被GPU的其他函数调用，这种函数不能有返回值

- `__device__`和 `__global__`的组合：多了些限制，不支持递归、不能声明静态变量、`不能有自变量的一个变量数字`(编程指南这样说，啥意思不明白)

- `__host__`和`__device__`的组合：函数同时编译到CPU和GPU。

对于变量，可以用这些修饰符修饰：

* `__device__`：修饰全局变量，只能在GPU上用的全局变量。有办法在CPU这边读写。
* `__shared__`：修饰局部变量，让变量在block之内的不同线程间共享，修饰后变量不能赋初始值
* `__constant__`：修饰全局变量，只能在GPU上用的全局常量。有办法在CPU这边读写。（没错，常量可写）
  
  

  之所以有`__device__ 还有 __constant__`，是因为`__constant__` 不会被GPU线程写，可以放在高速缓存中。



---



这些皮毛很简单，但编程指南里接下来就是些晦涩的东西了，我看下面有什么纹理内存比全局内存高效······基础概念还不懂······







## 
