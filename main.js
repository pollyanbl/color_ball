// 获取页面中的 <p> 元素，用于显示剩余彩球数
const para = document.querySelector('p');
// 初始化弹球计数器
let count = 0;

// 获取页面中的 <canvas> 元素并设置画布的宽高
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const width = canvas.width = window.innerWidth;
const height = canvas.height = window.innerHeight;

// 生成指定范围内的随机整数的函数
function random(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

// 生成随机 RGB 颜色值的函数
function randomColor() {
  return 'rgb(' + random(0, 255) + ',' + random(0, 255) + ',' + random(0, 255) + ')';
}

// 定义 Shape 构造器，作为所有形状对象的基类
function Shape(x, y, velX, velY, exists) {
  this.x = x;       // X 坐标
  this.y = y;       // Y 坐标
  this.velX = velX; // X 方向速度
  this.velY = velY; // Y 方向速度
  this.exists = exists; // 形状是否存在
}

// 定义 Ball 构造器，继承自 Shape，表示一个彩球
function Ball(x, y, velX, velY, exists, color, size) {
  // 调用 Shape 构造器
  Shape.call(this, x, y, velX, velY, exists);

  this.color = color; // 彩球颜色
  this.size = size;   // 彩球大小
}

// 设置 Ball 的原型链，使其继承自 Shape
Ball.prototype = Object.create(Shape.prototype);
Ball.prototype.constructor = Ball;

// 定义彩球绘制函数
Ball.prototype.draw = function() {
  ctx.beginPath();       // 开始绘制路径
  ctx.fillStyle = this.color; // 设置填充颜色
  ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI); // 绘制圆形
  ctx.fill();            // 填充圆形
};

// 定义彩球更新函数，用于更新彩球的位置
Ball.prototype.update = function() {
  // 检测并处理彩球与画布边界的碰撞
  if ((this.x + this.size) >= width) {
    this.velX = -(this.velX);
  }
  if ((this.x - this.size) <= 0) {
    this.velX = -(this.velX);
  }
  if ((this.y + this.size) >= height) {
    this.velY = -(this.velY);
  }
  if ((this.y - this.size) <= 0) {
    this.velY = -(this.velY);
  }
  // 更新彩球的位置
  this.x += this.velX;
  this.y += this.velY;
};

// 定义碰撞检测函数，用于检测彩球之间的碰撞并改变颜色
Ball.prototype.collisionDetect = function() {
  for (var j = 0; j < balls.length; j++) {
    if (this !== balls[j]) {
      const dx = this.x - balls[j].x;
      const dy = this.y - balls[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      // 如果两个彩球相撞，则改变它们的颜色
      if (distance < this.size + balls[j].size && balls[j].exists) {
        balls[j].color = this.color = randomColor();
      }
    }
  }
};

// 定义 EvilCircle 构造器，继承自 Shape，表示一个由玩家控制的恶魔圈
function EvilCircle(x, y, exists) {
  // 调用 Shape 构造器
  Shape.call(this, x, y, 20, 20, exists);

  this.color = 'white'; // 恶魔圈颜色
  this.size = 10;       // 恶魔圈大小
}

// 设置 EvilCircle 的原型链，使其继承自 Shape
EvilCircle.prototype = Object.create(Shape.prototype);
EvilCircle.prototype.constructor = EvilCircle;

// 定义 EvilCircle 绘制方法
EvilCircle.prototype.draw = function() {
  ctx.beginPath();        // 开始绘制路径
  ctx.strokeStyle = this.color; // 设置线条颜色
  ctx.lineWidth = 3;      // 设置线条宽度
  ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI); // 绘制圆形
  ctx.stroke();           // 绘制线条
};

// 定义 EvilCircle 的边缘检测方法，确保恶魔圈不会离开画布
EvilCircle.prototype.checkBounds = function() {
  // 检测并处理恶魔圈与画布边界的碰撞
  if ((this.x + this.size) >= width) {
    this.x -= this.size; // 向左移动恶魔圈
  }
  if ((this.x - this.size) <= 0) {
    this.x += this.size; // 向右移动恶魔圈
  }
  if ((this.y + this.size) >= height) {
    this.y -= this.size; // 向上移动恶魔圈
  }
  if ((this.y - this.size) <= 0) {
    this.y += this.size; // 向下移动恶魔圈
  }
};

// 定义 EvilCircle 控制设置方法，允许玩家使用键盘控制恶魔圈
EvilCircle.prototype.setControls = function() {
  window.onkeydown = e => {
    // 根据按下的键来移动恶魔圈
    switch (e.key) {
      case 'a':
      case 'A':
      case 'ArrowLeft': // 向左移动
        this.x -= this.velX;
        break;
      case 'd':
      case 'D':
      case 'ArrowRight': // 向右移动
        this.x += this.velX;
        break;
      case 'w':
      case 'W':
      case 'ArrowUp': // 向上移动
        this.y -= this.velY;
        break;
      case 's':
      case 'S':
      case 'ArrowDown': // 向下移动
        this.y += this.velY;
        break;
    }
  };
};

// 定义 EvilCircle 冲突检测函数，用于检测恶魔圈与彩球的碰撞
EvilCircle.prototype.collisionDetect = function() {
  for (let j = 0; j < balls.length; j++) {
    if (balls[j].exists) { // 如果彩球存在
      const dx = this.x - balls[j].x;
      const dy = this.y - balls[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      // 如果恶魔圈与彩球碰撞，则彩球消失，计数器减一
      if (distance < this.size + balls[j].size) {
        balls[j].exists = false;
        count--;
        para.textContent = '剩余彩球数：' + count; // 更新页面上的彩球数显示
      }
    }
  }
};

// 初始化一个空数组来保存所有的彩球
const balls = [];

// 循环创建并添加彩球到数组中，直到达到25个
while (balls.length < 25) {
  const size = random(10, 20); // 随机生成彩球的大小
  // 创建一个新的彩球实例，位置和速度都是随机的
  let ball = new Ball(
    random(0 + size, width - size), // X 坐标
    random(0 + size, height - size), // Y 坐标
    random(-7, 7), // X 方向速度
    random(-7, 7), // Y 方向速度
    true, // 彩球存在
    randomColor(), // 随机颜色
    size // 彩球大小
  );
  balls.push(ball); // 将彩球添加到数组中
  count++; // 更新彩球计数器
  para.textContent = '剩余彩球数：' + count; // 更新页面上的彩球数显示
}

// 创建一个新的恶魔圈实例，位置是随机的
let evil = new EvilCircle(random(0, width), random(0, height), true);
evil.setControls(); // 设置恶魔圈的控制方法

// 定义一个循环函数，用于不断地重绘画布和更新彩球和恶魔圈的位置
function loop() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'; // 设置画布的背景颜色为半透明的黑色
  ctx.fillRect(0, 0, width, height); // 绘制画布的背景

  // 遍历所有彩球，如果彩球存在，则绘制、更新位置和检测碰撞
  for (let i = 0; i < balls.length; i++) {
    if (balls[i].exists) {
      balls[i].draw();
      balls[i].update();
      balls[i].collisionDetect();
    }
  }

  // 绘制恶魔圈
  evil.draw();
  // 检测恶魔圈是否超出画布边界
  evil.checkBounds();
  // 检测恶魔圈与彩球的碰撞
  evil.collisionDetect();

    // 使用 requestAnimationFrame() 方法来循环调用 loop 函数，创建一个平滑的动画循环
    requestAnimationFrame(loop);
  }
  
  // 调用 loop 函数以启动动画循环
  loop();
  