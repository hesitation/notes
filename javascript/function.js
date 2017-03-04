// 倒计时功能
function countDown(count, interval, callback) {
  if(count < 0) {return;}

  callback(count);

// update()间隔interval执行一次，回调count
  setTimeout(function update() {
    if(--count > 0) {
      setTimeout(update, interval);
    }
    callback(count);
  }, interval);
}
countDown(10, 1000, t => console.log(t));

// -----------------------------------------------------------------------------------------------
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

// 实现一个函数，对传入的所有数值进行求和
// 将arguments转化为数组，利用数组的reduce()方法
function addAll() {
  // var args = Array.prototype.slice.call(arguments)，将类数组对象拷贝进一个数组中
  // var args = [].slice.call(arguments)  ，另外一种写法
  var args = Array.from(arguments);

  return args.reduce((x, y) => x + y);
}
console.log(addAll(1, 2, 3, 4));   //  ==> 10

// -----------------------------------------------------------------------------------------------

// JavaScript函数设计中经常让参数允许有不同类型的值
function setStyle(el, property, value) {
  if(typeof el === "string") {
    el = document.querySelector(el);
  }
  if(typeof property === "object") {  // 如果传入一个对象，只传两个参数
    for(var key in property) {
      setStyle(el, key, property[key]);
    }
  } else {
    el.style[property] = value;   // 传入一个属性，一个值
  }
}
setStyle('div', 'color', 'red');  //  一次设置一个属性
setStyle('div', {'fontSize': '16px', 'backgroundColor': 'lightgray'});  // 一次性设置多个属性

// -----------------------------------------------------------------------------------------------

// rest参数：...args 表示参数是传入实参组成的一个数组
let addAll = (...args) => args.reduce((a, b) => a + b);
console.log(addAll(2, 1, 3, 5));   // ==> 11
console.log(addAll.length);   //  ==> 0，rest参数不计算在function.length属性中

// 对象的deepCopy，src代表拷贝的源对象
// 将一个对象的所有属性拷贝到另一个对象中
function deepCopy(des, src) {
  if(!src || typeof src !== 'object') {
    return des;
  }
  for(var key in src) {
    let obj = src[key];
    if(obj && typeof obj === 'object') {  // 如果存在，并且属性值是对象
      des[key] = des[key] || {};   // 在要拷贝的对象中初始化存放obj对象的属性
      deepCopy(des[key], obj);  // 递归调用深拷贝
    } else {
      des[key] = src[key];
    }
  }
  return des;
}
// 上面的方法存在扩展性不足，只能将一个对象拷贝到des中
// 利用rest参数，将参数设置为可变，再利用reduce处理传入的每个对象
// reduce的函数体是如何操作两个参数，并且将其操作结果保存到第一个参数中
function merge(des, ...objs) {
  return [des, ...objs].reduce((a, b) => deepCopy(a, b));
}
console.log(merge({x: 1}, {y: 2}, {z: 3}));   //  ==> {x: 1, y: 2, z:3}

// ES5模拟实现rest参数
// 利用函数变换，抽象出参数转换的过程，使其可以应用到所有函数上
function __rest__(fn) {
  var len = fn.length;
  return function() {
    // args是函数定义时固定的参数，索引是0~fn.length-1，转化为一个数组
    var args = Array.prototype.slice.call(arguments, 0, len -1);
    console.log(args);
    // rest 是超出定义时的参数，将其转化为数组，索引从fn.length-1 开始
    var rest = Array.prototype.slice.call(arguments, len -1);
    console.log(rest);
    // 将改装好的参数应用到原函数上
    return fn.apply(this, args.concat([rest]));  // concat方法会把最外层的数组打开，合并
  };
}
var add = __rest__(function(args) {   // 如果去掉__rest__，则必须传入数组才有效
  return args.reduce((a, b) => a + b);
});
console.log(add(1, 2, 3, 4, 5));

// -----------------------------------------------------------------------------------------------

// 默认参数default args
// ES5写法，利用 || 的短路特性
function showMessage(message) {
  message = message || "default message";   //  利用||操作符的短路特性
  console.log(message);
}
showMessage();                // ==> "default message"
showMessage("hello world!");   //  ==>"hello world!"

//ES6实现了默认参数，必须将默认参数放在普通参数后面，并且默认参数不计入function.length属性
function showMsg(msg="defalut message") {
  console.log(msg);
}
showMessage();                // ==> "default message"
showMessage("hello world!");   //  ==>"hello world!"

// -----------------------------------------------------------------------------------------------

// for循环开了10个定时器，第一个是0s执行，第二个定时器1s后执行，第三个定时器3秒后执行
for(var i=0; i<10; i++) {
  setTimeout(function() {
    console.log(i);   // 异步调用时，循环早已结束，此时i=10
  }, 1000 * i);    // 此处的i在循环时确定，i=0时，设置一个立即执行的定时器；i=1时，设置一个1s后执行的定时器
}

for(var i=0; i<10; i++) {
  (function(i) {
    setTimeout(function() {
      console.log(i);
    }, 1000 * i);
  })(i);
}

// let声明的是块级作用域
for(let i=0; i<10; i++) {
  setTimeout(function() {
    console.log(i);
  }, 1000 * i);
}

for(var i=0; i<10; i++) {
  setTimeout((function() {
    console.log(i);
  }).bind(null, i), 1000 * i);
}

// -----------------------------------------------------------------------------------------------

// 闭包与私有数据
var MyClass = (function() {
  var privateData = "privateData";

  function Class() {
    this.publicData = "publicData";
  }
  Class.prototype.getData = function() {
    return privateData;
  };

  return Class;
})();
var obj = new MyClass();
console.log(obj.privateData);    //  ==> undefined
console.log(obj.publicData);    // ==> "publicData"
console.log(obj.getData());    //  ==>  "privateData"

// ES6的块级作用域

let Class;
{
  var privateData = "privateData";
  Class = function() {
    this.publicData = "publicData";
  };
  Class.prototype.getData = function() {
    return privateData;
  };
}
var obj = new MyClass();
console.log(obj.privateData);    //  ==> undefined
console.log(obj.publicData);    // ==> "publicData"
console.log(obj.getData());    //  ==>  "privateData"


// -----------------------------------------------------------------------------------------------

function Point2D(x, y) {
  this.x = x;
  this.y = y;
}
Point2D.prototype.showLength = function() {
  var length = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
  console.log(length);
};
Point2D.prototype.showLengthAsync = function() {
  var self = this;   // 将this的值保存下来，传入异步函数

  setTimeout(function() {  // setTimeout是异步函数，在调用回调函数时没有指定匿名函数的this，
      self.showLength();  //因为回调函数没有指定this，非严格模式下默认指向全局对象
  }, 1000);
};

var x = 30, y = 40;
var p = new Point2D(3, 4);
var f = Point2D.prototype.showLength;

console.log(f());    // ==> 50，Point2D.prototype.showLength()的调用者f是外层变量，与Point2D同级，此时函数内的this应该指向包含x、y、f、Point2D的对象，所以this.x=30, this.y=40
setTimeout(p.showLength.bind(p), 500);   //  ==> 延时500ms后输出5
p.showLengthAsync();    // ==> 延时1000ms后输出5


Point2D.prototype.showLengthAsync = function() {
  setTimeout( () => self.showLength(), 1000);
};


// -----------------------------------------------------------------------------------------------
//  call()
function Point2D(x, y) {
  this.x = x;
  this.y = y;
}
Point2D.prototype.showLength = function() {
  var length = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
  console.log(length);
};

var p = new Point2D(1, 1);
console.log(p.showLength());  // ==> 1.4142...   调用p.length方法的是p对象本身，所以this.x和this.y均等于1

var obj = {x: 3, y: 4};
console.log(p.showLength.call(obj));   // ==> 5  使用函数p.showLength的call()方法改变函数调用时this的指向，使其指向对象obj，所以this.x=3，this.y=4

function foo() {
  // 使用Array.prototype.slice函数的call()方法指定函数调用时的this指向arguments对象，将其切分为数组
  var args = Array.prototype.slice.call(arguments);

  console.log(Array.isArray(arguments));  // false
  console.log(Array.isArray(args));   //  true
}

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
// bind()
function add(x, y) {
  return x + y;
}
// call()和apply()会立即执行；bind()方法会返回一个函数对象
console.log(add.call(null, 1, 2));   // ==> 3 ，使用call()方法在全局对象下对传入的参数1,2执行函数
console.log(add.apply(null, [1, 2]));   // ==> 3 apply()方法在全局对象下对传入的参数1,2执行函数
console.log(add.bind(null, 1, 2));   // ==> function () { [native code] }， 返回一个函数
// 传入两个参数
let add1 = add.bind(null, 1, 2);  // bind()方法执行时，将1和2对应传递给x,y。再调用返回的函数时，不用再传递参数
console.log(add1());         //  ==> 3  为传递参数，直接调用，使用bind()时传入的参数值

// 传入一个参数
let add2 = add.bind(null, 1);   //bind()时只传递一个参数1给x，在调用返回函数时只需炫迪一个参数给y即可
console.log(add2(3));    //  ==> 4  只需传递一个参数给y即可

// 不传递参数
let add3 = add.bind(null);    //调用bind()时不传递参数，在调用返回函数时要传递2个参数
console.log(add3(2, 3));   // ==> 5  需要传递两个参数，与调用原函数没有区别。。。不建议使用


function setBodyState(state) {
  document.body.className = state;
}
setBodyState.call(null, 'state1');   // 立即执行setBodyState函数，将document.body.className设置为'state1'。this值为null表示在全局对象下执行该函数
setTimeout(setBodyState.bind(null, 'state2'), 1500);  // 执行bind()方法，返回一个函数作为回调函数，并且将需要向它传递的'state2'作为参数。1500ms后立即执行返回的函数即可，无需再传入参数


// -----------------------------------------------------------------------------------------------
// setInterval()，注意清除定时器
// 倒计时效果
const ball = document.getElementById('ball');
ball.addEventListener('click', function() {
  var startTime = Date.now();

  var dId = setInterval(function() {
    var t = 10 - Math.round((Date.now() - startTime) / 1000);
    ball.innerHTML = t;
    if(t <= 0) {clearInterval(tId);}
  }, 1000);
});

// -----------------------------------------------------------------------------------------------
// Promise
// 异步回调的嵌套
setTimeout(function() {
  console.log(1);
  setTimeout(function() {
    console.log(2);
    setTimeout(function() {
      console.log(3);
    }, 1000);
  }, 1000);
}, 1000);

// Promise
function wait(time) {
  return new Promise(function(resolve, reject) {
    setTimeout(resolve, time);
  });
}
// wait(1000).then(function() {
//   console.log(4);
//   return wait(2000);
// }).then(function() {
//   console.log(5);
//   return wait(1000);
// }).then(function() {
//   console.log(6);
// });

// ES7的async/await
(async function() {
  await wait(1000);
  console.log(1);
  await wait(1000);
  console.log(2);
  await wait(1000);
  console.log(3);
})();

// -----------------------------------------------------------------------------------------------
// 使用Function处理不规范的JSON
// JSON规定key和value都必须使用双引号
var brokenJSON = "{a: 1, b:2, c: 'message'}";

function parseData(data) {
  return (new Function('return ' + data))();
}
try {   // JSON.parse()只能解析正规的JSON字符串
  console.log(JSON.parse(brokenJSON));
} catch(ex) {
  console.log(ex.message);
  console.log(parseData(brokenJSON));   // {a:1, b:2, c: "message"}
}
// 利用Function()动态构造函数，但是会有注入危险，并且效率低
// 如果对外暴露接口，会有注入的危险
let add = new Function('x', 'y', 'return x + y');
console.log(add(1, 2));

// -----------------------------------------------------------------------------------------------
// 纯函数：一个函数如果输入参数确定，在任何时间、地点其输出结果是唯一确定的，函数称为纯函数
// 纯函数：无时序、无副作用、幂等、无关时序（不依赖于外部环境，不改变外部环境，输入参数一定的情况下，每次的输出肯定相同

function add(x, y) {return x + y;}   // 纯函数

// 不是纯函数，对于确定的输入，其输出结果并不唯一确定；但是并没有副作用，不影响外部
function random(min, max) {
  return Math.floor((max - min) * Math.random + min);
}

let count = 0;   //  不是，每次调用addCount()，count的值都会改变
function addCount() {
  count++;
}

function setBgColor(color) {      // 不是纯函数，操作了外部环境（DOM）
  document.body.backgroundColor = color;
}

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






























// -----------------------------------------------------------------------------------------------
