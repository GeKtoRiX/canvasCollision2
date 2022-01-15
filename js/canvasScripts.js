// Получение доступа к холсту и его настройка.
var htmlCanvas001 = document.getElementById("canvas001");
var canvas001 = htmlCanvas001.getContext(`2d`);
htmlCanvas001.style.backgroundColor = `black`;
htmlCanvas001.width = window.innerWidth - 4;
htmlCanvas001.height = window.innerHeight - 4;

// Уравнивание размера холста в соответсвии с размерами окна браузера.
window.addEventListener(`resize`, function () {
  htmlCanvas001.width = window.innerWidth;
  htmlCanvas001.height = window.innerHeight;
  init();
});

// Переменные.
var mouse = {
  x: htmlCanvas001.width / 4,
  y: htmlCanvas001.height / 4,
};
// Переменные управления гравитацией и кол-вом генерируемых шаров.
var ballsNum = 200;
var gravity = 1;
var friction = 0.8;
var lineWidthArc = 2;

addEventListener(`mousemove`, function (event) {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
});
// Получение случайного числа min max.
function randomIntFromRage(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
// Получение расстояния между элементами через теорему пифагора.
function getDistance(x1, y1, x2, y2) {
  // Расстояние между двумя элементами по x координате.
  let xDistance = x2 - x1;
  // Расстояние между двумя элементами по y координате.
  let yDistance = y2 - y1;
  // Получение гипотенузы двух элементов.
  return Math.hypot(xDistance, yDistance); // Math.pow(xDistance, 2) + Math.pow(yDistance, 2))
}
// Вращение окружностей до горизонтальной плоскости x.
function rotate(velocity, angle) {
  const rotateVelocities = {
    x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
    y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle),
  };

  return rotateVelocities;
}
// Реализация эффекта отталкивания окружностей друг от друга.
function resolveCollision(particle, otherParticle) {
  // Разница в ускорении по координате x.
  const xVelocityDiff = particle.velocity.x - otherParticle.velocity.x;
  // Разница в ускорении по координате y.
  const yVelocityDiff = particle.velocity.y - otherParticle.velocity.y;
  // Расстояние между координатами x.
  const xDist = otherParticle.x - particle.x;
  // Расстояние между координатами y.
  const yDist = otherParticle.y - particle.y;
  // Предотвращение перекрытия окружностей путем высчитывания расстояния до столкновения центров окружности.
  if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {
    // Получение арктангентс угла разницы координат x y.
    const angle = -Math.atan2(
      otherParticle.y - particle.y,
      otherParticle.x - particle.x
    );
    // Получение 'массы' окружностей.
    const m1 = particle.mass;
    const m2 = otherParticle.mass;
    // Вращение окружностей на angle градусов для высчитывания векторов отскока по координате x.
    const u1 = rotate(particle.velocity, angle);
    const u2 = rotate(otherParticle.velocity, angle);
    // Вектора движения при отскоке окружностей друг от друга.
    const v1 = {
      x: (u1.x * (m1 - m2)) / (m1 + m2) + (u2.x * 2 * m2) / (m1 + m2),
      y: u1.y,
    };
    const v2 = {
      x: (u2.x * (m2 - m1)) / (m1 + m2) + (u1.x * 2 * m2) / (m1 + m2),
      y: u2.y,
    };
    // Обратное вразение окружностей для возврата в исходное положение.
    const vFinal1 = rotate(v1, -angle);
    const vFinal2 = rotate(v2, -angle);
    // Изменение вектора скорости окружностей.
    particle.velocity.x = vFinal1.x;
    particle.velocity.y = vFinal1.y;
    otherParticle.velocity.x = vFinal2.x;
    otherParticle.velocity.y = vFinal2.y;
  }
}
// Объект отрисовки окружностей.
function Particle(x, y, radius, color) {
  this.x = x;
  this.y = y;
  this.velocity = {
    x: (Math.random() - 0.5) * 3,
    y: (Math.random() - 0.5) * 3,
  };
  this.radius = radius;
  this.mass = 1;
  this.color = color;
  this.opacity = 0.7;

  this.draw = function () {
    canvas001.beginPath();
    canvas001.fillStyle = "hsl(" + this.color + ", 50%, 50%)";
    canvas001.strokeStyle = "white";
    canvas001.lineWidth = lineWidthArc;
    canvas001.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    canvas001.save();
    canvas001.globalAlpha = this.opacity;
    canvas001.fill();
    canvas001.stroke();
    canvas001.restore();
    canvas001.closePath();
  };

  this.update = (particles) => {
    this.draw();
    for (let i = 0; i < particles.length; i++) {
      if (this === particles[i]) continue;
      // Расстояние между окружностями,без учета радиусов, по центрам их окружностей.
      if (
        getDistance(this.x, this.y, particles[i].x, particles[i].y) -
        this.radius * 2 <
        0
      ) {
        resolveCollision(this, particles[i]);
      }
    }
    if (
      this.x - this.radius <= 0 ||
      this.x + this.radius >= htmlCanvas001.width
    ) {
      this.velocity.x = -this.velocity.x;
    } else if (
      this.y - this.radius <= 0 ||
      this.y + this.radius >= htmlCanvas001.height
    ) {
      this.velocity.y = -this.velocity.y;
    }
    if (
      getDistance(mouse.x, mouse.y, this.x, this.y) <= 70 &&
      this.opacity <= 0.7
    ) {
      this.opacity += 0.3;
    } else if (this.opacity > 0) {
      this.opacity -= 0.002;
      this.opacity = Math.max(0, this.opacity);
    }
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  };
}
// Рекурсионная функция отрисовки кадров.
function animate() {
  canvas001.clearRect(0, 0, htmlCanvas001.width, htmlCanvas001.height);
  particles.forEach((particle) => {
    particle.update(particles);
  });
  requestAnimationFrame(animate);
}
let particles;
// Заполнение массива окружностями.
function init() {
  // Радиус всех окружностей в массиве.
  const radius = 25;
  // Присвоение переменной particles нового массива.
  particles = [];
  // Создание окружностей на холсте.
  for (let i = 0; i <= ballsNum; i++) {
    // Случайная координата центра окружности.
    let x = randomIntFromRage(radius, htmlCanvas001.width - radius);
    let y = randomIntFromRage(radius, htmlCanvas001.height - radius);
    // Случайный цвет заливки окружности.
    const randomCol = Math.random() * 360;
    // Первый элемент помещается в массив без сверок с остальными окружностями.
    if (i !== 0) {
      // Второй и далее объекты, помещаемые в массив.
      for (let j = 0; j < particles.length; j++) {
        // Проверка радиусов двух окружностей на соприкоснование.
        if (
          getDistance(x, y, particles[j].x, particles[j].y) - radius * 2 <
          0
        ) {
          // При соприкосновении окружностей случайно выбирается другая координата.
          x = randomIntFromRage(radius, htmlCanvas001.width - radius);
          y = randomIntFromRage(radius, htmlCanvas001.height - radius);
          // Обнуление цикла путем изменения значения счетчика.
          j = -1;
        }
      }
    }
    // Помещение объекта в массив окружностей.
    particles.push(new Particle(x, y, radius, randomCol));
  }
}
init();
animate();
