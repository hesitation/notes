// 检查函数传入参数个数与定义的参数个数是否匹配；
// 不匹配则抛出异常。  function.length  函数定义时的参数个数
function __mathchArgs__(fn) {
  return function(...args) {
    if(args.length !== fn.length) {
      throw RangeError("Arguments not match!");
    }
    return fn.apply(this, args);
  };
}
// __mathchArgs__函数将add函数进行包装，将add函数中的数据先通过__mathchArgs__进行校验，
// 通过后再调用原来的处理方法处理数据
// __mathchArgs__是通用的，可以检查所有的函数参数是否匹配
var add = __mathchArgs__((x, y, z) => x + y + z);
console.log(add(1, 2, 3));  // ==> 6
console.log(add(4, 5));    // RangeError:  "Arguments not match!"
// -----------------------------------------------------------------------------------------------

// bind()
// 定义一个函数，实现一种变换，将传入其中的函数中参数的顺序颠倒
function __reverseArgs__(fn) {
  return function() {
    var args = Array.prototype.slice.call(arguments);
    console.log(this);
    return fn.apply(this, args.reverse());
  };
}
var foo = function() {console.log(Array.from(arguments));};
var foo2 = __reverseArgs__(foo);
foo2(1, 2, 3, 4);

// -----------------------------------------------------------------------------------------------
// 函数fn本身只能接受两个参数，但是经过__reduce__()函数操作后，可以接收任意多个参数
// 只要传入的函数fn确定，返回的函数也是确定的
function __reduce__(fn) {
  return function(...args) {
    return args.reduce((a, b) => fn(a, b));  // 只能用于对参数进行累计求值的函数
  };
}
function add(x ,y) {return x + y;}      // add本身只能接受两个参数
var addEnhancement = __reduce__(add);   // 经过__reduce__变换后可以接收任意个参数
console.log(addEnhancement(1,5,3,4,2));   //  ==> 15
function mutiply(x, y) {return x * y;}
var mutiplyEhancement = __reduce__(mutiply);
console.log(mutiplyEhancement(1, 2, 3, 4, 5));   // ==> 120

// -----------------------------------------------------------------------------------------------
// 过程抽象提升函数纯度，过程抽象本身是一个纯函数
//
function setColor(el, color) {  // 非纯函数
  el.style.color = color;
}
// 对选中的批量元素进行统一操作，因为调用了setColor()，是非纯函数
function setColors(els, color) {
  Array.from(els).map(function(value) {setColor(value);});
}

// __multi__()抽象一个过程，将传入的函数进行扩展，使其第一个参数接收类数组
// 调用原来的方法fn对每个第一个数组参数中的每个元素执行fn方法
function __multi__(fn) {
  return function(arrayLike, ...args) {
    return Array.from(arrayLike).map(item => fn(item, ...args));
  };
}

function __multi__(fn, a = 2) {
  console.log(arguments[0]);
  return function(arrayLike, ...args) {
    return Array.from(arrayLike).map(function(value) {
      console.log(a);    // 可以访问到外层函数的形参
      return fn(value, ...args)
    });
  };
}

function add(x, y) { return x + y;}
var add2 = __multi__(add);
console.log(add2([1,2,3], 4));  // ==> [5, 6, 7]

setColors(document.querySelectorAll("#div > li"), 'red');

// -----------------------------------------------------------------------------------------------

function add(x, y) {return x + y};
function multiply(x, y) {return x * y};
function concat(arr1, arr2) {return arr1.concat(arr2);}
console.log(add(1, add(2, 3)), multiply(1, multiply(2, multiply(3, 4))),
            concat([1, 2], concat([3, 4], [5, 6])));   //  调用非常麻烦
//  ==> 6
//  ==> 24
//  ==> [1, 2, 3, 4, 5, 6]

// 1. 改写原函数
// 缺点是需要修改原函数的实现，如果功能改变，还需要重写
// 传入rest可变参数，并将其转换为数组
function add(...args) {
  return args.reduce((a, b) => a + b);  // 使用reduce累计求和
}
function multiply(...args) {
  return args.reduce((a, b) => a * b);  // 使用reduce累计求和
}
function concat(...args) {
  return args.reduce((a, b) => a.concat(b));  // 使用reduce累计求和
}
console.log(add(1, 2, 3), multiply(1, 2, 3, 4), concat([1, 2], [3, 4], [5, 6]));

// 2. 利用reduce包装三个函数
// 缺点：需要修改原函数的调用
function reduce(fn, ...args) {
  return args.reduce(fn);   //  <==>  [].reduce(function(a,b) {return a + b})
}

function add(x, y) {return x + y};
function multiply(x, y) {return x * y};
function concat(arr1, arr2) {return arr1.concat(arr2);}

console.log(reduce(add, 1, 2, 3), reduce(multiply, 1, 2, 3, 4),
            reduce(concat,[1, 2], [3, 4], [5, 6]));

// 3.利用bind()将方法add、multiply和concat先传入函数中，覆盖原来的函数
// 再重新调用即可，缺点是需要增加bind()的代码
// 如果不覆盖掉原来的函数，bind()并不会改变原来的函数
function reduce(fn, ...args) {
  return args.reduce(fn);   //  <==>  [].reduce(function(a,b) {return a + b})
}

function add(x, y) {return x + y};
function multiply(x, y) {return x * y};
function concat(arr1, arr2) {return arr1.concat(arr2);}

add1 = reduce.bind(null, add);   //  将参数需要调用的函数先传入进reduce，返回新的方法
multiply = reduce.bind(null, multiply);
concat = reduce.bind(null, concat);
// 执行新方法的调用即可，不用在传原来的第一个参数
console.log(add(1, 2, 3) ,add1(1, 2, 3), multiply(1, 2, 3, 4), concat([1, 2], [3, 4], [5, 6]));


// 4.利用等价函数，在原函数基础上增加功能，使其接收传入可变参数
// 从3中抽象出bind()的过程
function __restArgs__(fn) {
  return function(...args) {
    return args.reduce(fn.bind(this));   // 将所有的参数组成的数组通过reduce方法来进行函数调用
  };                         // reduce中需要传入实际调用的函数
}
function add(x, y) {return x + y};
function multiply(x, y) {return x * y};
function concat(arr1, arr2) {return arr1.concat(arr2);}

var add = __restArgs__(add);
var multiply = __restArgs__(multiply);
var concat = __restArgs__(concat);
console.log(add(1, 2, 3), multiply(1, 2, 3, 4), concat([1, 2], [3, 4], [5, 6]));

// 5.支持异步
function __restArgs__(fn, async) {
  if(async) {
    return function(...args) {
      return args.reduce((a, b) => {
        return Promise.resolve(a).then((v) => fn.call(this, v, b));
      });
    };
  } else {
    return function(...args) {
      return args.reduce(fn.bind(this));
    }
  }
}

function asyncAdd(x, y) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log(`${x} + ${y} = ${x + y}`);
      resolve(x + y)
    }, 1000);
  });
}
asyncAdd = __restArgs__(asyncAdd, true);
asyncAdd(1,2,3,4,5,6).then((v) => console.log(v));


// -----------------------------------------------------------------------------------------------
// 延时执行一个函数
function __delay__(time, fn) {
  return function() {
    var self = this;
    var args = Array.prototype.slice.call(arguments);
    setTimeout(function() {   // 使用了setTimeout，为了使用上层函数的this和arguments，需要将其缓存下来
      return fn.apply(self, args);
    }, time);
  }
}

function add(x) {
  console.log(x);
}

var add = __delay__(3000, add);
add(1);

// -----------------------------------------------------------------------------------------------
// 函数异步化和串行执行
function __delay__(time, fn) {
  return function() {
    var self = this;
    var args = Array.prototype.slice.call(arguments);
    var callback;    // 如果fn有回调函数，用来保存回调函数

    if(fn.length < arguments.length) { // 如果传入的实参大于定义时的参数，说明传入了回调函数
      callback = args[args.length - 1];   // 取出回调函数
      args.length--;    //  从参数中跑出回调函数
    }
    setTimeout(function() {
      var ret = fn.apply(this, args);
      callback && callback(ret);
    }, time);
  };
}

function add(x, y) {return x + y;}

var add = __delay__(2000, add);
console.log(add(2, 3, r => console.log(r)));   // 间隔2s输出5

function output(msg) {console.log(msg);}
output = __delay__(1500, output);

function __pipe__() {    // 依次执行多个pipe方法
  var fnlist = Array.prototype.slice.call(arguments);
  return fnlist.reduceRight((a, b) => () => b(a));
}
// 高阶函数可以组合使用
var outputOneByOne = __pipe__(output.bind(null, 'message 1'),
                              output.bind(null, 'message 2'),
                              output.bind(null, 'message 3'),
                              output.bind(null, 'message 4'))
outputOneByOne();   // 间隔1.5s输出message 1、message 2、message 3、message 4


// -----------------------------------------------------------------------------------------------
// reduce和pipe
// reduce是同步执行，结果一直向下传递
function __reduce__(...fnlist) {
  return function(...args) {
    if(fnlist <= 0) {return;}
    fnlist[0] = fnlist[0].apply(this, args);

    return fnlist.reduce((a, b) => b.call(this, a));
  }
}

function add(x, y) {return x + y;}
function double(x) {return 2 * x;}

var foo = __reduce__(add, double, double, double);
console.log(foo(2, 3));  // ==> 80

// express 的connect中间件，__pipe__()方法可以依次执行异步方法
// express实现的核心代码
function __pipe__(...fnlist) {
  return function(...args) {
    var fn = fnlist.reduceRight((a, b) => (...args) => b.apply(this, [...args, a]));
    return fn.apply(this, args);
  }
}
function taskA(x, next) {
  console.log(`task a: ${x}`);
  setTimeout(next, 2000);   // 2秒后再执行taskB
}
function taskB(next) {
  console.log('task b');
  next();
}
function taskC(next) {
  console.log('task c');
}

var foo2 = __pipe__(taskA, taskB, taskC);
foo2(10);   // ==>先输出task a: 10，等2s后继续输出task b，task c

let app = {
  use: __pipe__
}
app.use(function(req, res, next) {
  ...   // express中间件的加载，利用__pipe__实现异步函数的串行执行
});

// -----------------------------------------------------------------------------------------------
// 高阶函数中的函数拦截应用：throttl避免重复点击
// 实现思路是限流，点击一次后，需要等待timer时间，再次点击才能生效
const btn = document.getElementById('btn');

function throttle(fn, wait) {
  var timer;
  return function(...args) {
    if(!timer) {   // 在timer时间段内不执行下面函数，但是当timer清空后，则执行下列函数
      timer = setTimeout(() => timer=null, wait);   // 执行代码，然后清空timer
      return fn.apply(this, args);
    }
  }
}
// 按钮没500ms点击依次有效
btn.onclick = throttle(function() {
  console.log("button clicked!");
}, 500);

// -----------------------------------------------------------------------------------------------
// debounce避免重复点击
// 思路：如果在
// 点击频次太快，直接将设置好的定时器清除；只有超过时间间隔点击，才会生效
var btn = document.getElementById('btn');

function debounce(fn, delay) {
  var timer = null;
  return function(..args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}
btn.onclick = debounce(function() {
  console.log("button clicked!");
}, 300);

// -----------------------------------------------------------------------------------------------
// multicast实现批量操作DOM元素
function setColor(el, color) {
  return el.style.color = color;
}

// 对整个list进行执行函数fn
function multicast(fn) {
  return function(list, ...args) {
    if(list && list.length !== null) {
      return Array.from(list).map((item) => fn.apply(this, [item, ...args]))
    } else {
      return fn.apply(this, [item, ...args])
    }
  }
}

var setColors = multicast(setColor);
var list = document.querySelectorAll("li: nth-child(2n+1)");
setColors(list, 'red');
