众所周知，RSA是个非常有名的非对称加密算法。我呢正在写的程序需要用到这个算法，而我还没找到靠谱的c++写的这个算法，所以，就要学一下这个算法了。

很久以前看过这个算法的介绍，又是算幂又是取模的，我那数学，直接劝退，这次要用了...


## 轮子
很久以前，经常看到1024位加密，2048位加密什么的，稍微看了下，这个位数越长，越安全，计算越慢。我看C++的 long long 也就32位呗，我拿64个long long 来存？
不不不，我需要高精度。高精度这东西在Github上好多，找个顺手的用吧。


## 密钥的生成和加解密过程
看着查的资料。有p，q，φ(n)，n，e，d这6个量。

首先找两个质数，称它俩为p和q。

然后记p * q为n 。这个N的二进制位数就是加密算法的位数。

记(p - 1) * (q - 1)为φ(n)。这玩意儿不好打，还不能当变量名，我们叫它m吧。

在区间(1, m)随机找一个数，作为e。应该保证它与m互质（为什么呢？之后会用到）。

解方程d * e mod m = 1，求出d，需要整数解。

d和n是私钥。
e和n是公钥。

对于公钥加密 私钥解密

    密文 = 明文 ^ e mod n
    明文 = 密文 ^ d mod n
对于私钥加密 公钥解密

    密文 = 明文 ^ d mod n
    明文 = 密文 ^ e mod n


## 如何计算
首先是p和q的计算，这个算法能够正确需要p和q必须是质数。如何生成质数...

首先要生成一个随机数，然后进行质数判断，如果不是，就再随机。

生成一个随机大数我这样来做。
```c++
BigInteger RSA::BigIntRand(const unsigned int& n) const{
	srand(time(NULL));// 值随机数种子
	BigInteger r;
	for(unsigned int len = 0; len < n; len += 16){
		uint16_t i = (uint16_t)rand();
		r *= 0b10000000000000000;// 这可怜的高精度库居然没有位运算，盲猜是用十进制做的数据存储
		r += i;
	}
	return r;
}
```

然后是质数判断。有一个基于费马小定律的算法叫 [米勒-拉宾素性检验](https://zh.wikipedia.org/wiki/%E7%B1%B3%E5%8B%92-%E6%8B%89%E5%AE%BE%E6%A3%80%E9%AA%8C) ，这样：
```c++
bool RSA::isPrime(BigInteger p)const{
	BigInteger s = p - 1;
	while (s % 2 == 0) {
	   s /= 2;
	}
	for (int i = 0; i < PrimeTestCount; i++) {
	   BigInteger a = BigInteger(rand()) % (p - 1) + 1, temp = s;
	   BigInteger mod = BigModularPow(a, temp, p);
	   while (temp != p - 1 && mod != 1 && mod != p - 1) {
		  mod = BigModularPow(mod, mod, p);
		  temp *= 2;
	   }
	   if (mod != p - 1 && temp % 2 == 0) {
		  return false;
	   }
	}
	return true;
}
```

有了高精度，上面的都不是问题，生成问题都在d和e这里，别说写程序，给我道这样的数学算数题我都算不出来。

e说是随机取，但是考虑到效率，一般都是取65537（二进制10000000000000001），好像是因为0比较多，好算。

就剩下d了，d * e mod m = 1 ，这能咋解？据我搜索，不止一种方法可以解，这里用其中一种办法。

把d写成未知数x，同时设未知数y。

d * e mod m = 1 等价于 x * e + y * m = 1，到这里要请出学oi一辈子没用到的 欧几里得算法 了。

----
欧几里得算法
```c++
int gcd(int a, int b){
    if (a % b==0) return b;
    else return gcd(b, a % b);
}
```
这个算法是拿来算最大公约数的

我有一个朋友对它倒背如流，不过貌似从来没用过...

这个算法用了递归，它递的时候是在不断辗转相除，而归的时候只是做了一件事，传回计算结果（其实还有一件事，递归用到的栈内存需要还回去，总不能直接exit(0)吧）。

其实呢，它往回归的时候是可以带走一些有用的信息的，这就是 扩展欧几里得算法。

```c++
 int ext_gcd(int a, int b, int* x,int* y){
    if( b== 0){
        *x = 1,*y = 0 ;
        return a;
    }
    else{
        int r = ext_gcd(b, a % b, x, y);
        int t = *x;
        *x = *y;
        *y = t - a / b* *y;
        return r;
    }
}
```
c++ 不支持函数多返回值，所以用到了指针。

扩展欧几里德算法可以在计算最大公约数的同时计算出方程ax + by = gcd(a,b)的解。

上述代码中函数的返回值为gcd(a,b)，传入指针的x，y接收方程解。

-----

x * e + y * m = 1 方程的解也就是ext_gcd(e, m, x, y)

但是需要满足gcd(e, m) = 1 ，也就是说 e和m互质。

最终解出来的x可能是个负数，如果是负数的话，应该让 x += m （资料这么说的，也不知道为啥）

这样d也就完成了。

最后加解密也不好算，这个运算是叫模幂运算（算完幂取模），说是用 蒙哥马利算法 来优化，进一步优化，维基百科上说用 "从右到左二位算法" 优化。

最后对着Lua代码抄了便C++代码，没整明白啥意思

```c++
BigInteger RSA::BigModularPow(BigInteger base_, BigInteger exp_, BigInteger mod){// 这里的变量类型应该是加上const&的，但是这个高精度库重载运算符离谱地没加const，找不到重载
	if(mod == BigInt_1){
		return 0;
	}
	BigInteger r = 1;
	// 这地方把base和exp又定义了一遍，考虑到传递来的BigInteger的数据可能是引用传递
	BigInteger base = base_;
	BigInteger exp = exp_;
	while(exp > 0){
		if(exp % 2 == 1){
			r = (r * base) % mod;
		}
		exp /= 2;
		base = (base * base) % mod;
	}
	return r;
}
```

至此整个RSA算法完成！

