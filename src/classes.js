class Scene {
    player;
    static size = {dx: 160, dy: 90};
    static center = {x: Scene.size.dx/2, y: Scene.size.dy/2};
    Tm = new TimeMachine();
    Im = new InputsManager();
    Gs = new GraphicService();
    Rs = new RandomizeSpawner();
    onSetup = new CustomEvent();
    onStart = new CustomEvent();
    isConfigured = false;
    Stop() {
        this.Tm.EndOfWork();
        this.Im.isDeactivated = true;
    }
    Start() {
        if (!this.isConfigured) {
            this.Setup();
            this.onSetup.Init();
            this.isConfigured = true;
        }
        this.onStart.Init();
        // this.Im.isDeactivated = false;
        
        this.Tm.TurnOn();
        this.Tm.Update.add(() => {
            return this.Im.Activate();
        });
    }
    /**
     * Создаёт кнопку
     * @param {string} src  - Если не стандартная кнопка и нужен другой спрайт
     * @returns 
     */
    AddButton(src) {
    // HitCheck? -> for (onClick) -> DelayedTriggering ... -> for(atTrigger)
        const SRC = src == undefined? "./assets/button.png": src;
        let nButton = new Button;
        nButton.sprite.SetSrc(SRC);
        nButton.onClick.add(() => {
        this.Tm.Update.add(() => {
            return nButton.DelayedTriggering();
        });
        });
        this.Im.OnClick.add((mousePos) => {        
            nButton.HitCheck(mousePos);
        });
        this.Gs.AddNewSprite(nButton.sprite);

        this.Im.MouseDepended.add((pos) => {
            if (/* nButton.sprite.currentColumn != 3 &&  */CollisionSystem.isPointInObject(nButton, pos)) {
                nButton.sprite.NextSpriteAbs(1);
            } else if (nButton.sprite.currentColumn == 1) {
                nButton.sprite.NextSpriteAbs(0);
            }
        });
        return nButton;
    }
    BaseSetup() {
        this.Im.Setup();
        this.Tm.IndependentUpdate.add(() => {
            this.Gs.AnimationLoop();
        });
        this.Tm.Update.add(() => {
            if (this.Im.MoveDirection.x != 0 || this.Im.MoveDirection.y != 0) {
                this.Im.InitMoving(this.Im.GetMoveVector(), this.Im.MousePos);
            }
        });
    }
    /**
     * обычный игровой объект выступающий в роле простой картинки
     * @param {string} Src  -   Путь к спрайту
     * @returns обычный игровой объект
     */
    AddSymbol(Src) {
        let nSymbol = new GameObject();
        nSymbol.CreateSprite();
        nSymbol.sprite.SetSrc(Src);
        nSymbol.angle = 0;
        /* nSymbol.sprite.size.w = nSymbol.sprite.img.width;
        nSymbol.sprite.size.h = nSymbol.sprite.img.height; */
        nSymbol.sprite.size.h = Scene.size.dy;
        nSymbol.sprite.size.w = Scene.size.dx;
        this.Gs.AddNewSprite(nSymbol.sprite);

        
        return nSymbol;
    }
}
class TimeMachine{
    isPlaying = false;
    Update = new CustomEvent();
    IndependentUpdate = new Set();
    STOPTHISSHITT = false;
    TurnOn() {
        this.isPlaying = true;
        this.MainLoop();
    }
    TurnOff() {
        this.isPlaying = false;
    }
    Toggle() {
        this.isPlaying = !this.isPlaying;
    }
    EndOfWork() {
        this.STOPTHISSHITT = true;
        this.isPlaying = false;
    }
    MainLoop() {
        if (this.isPlaying) {
           /*  for (const func of this.Update) {
                func();
            } */
           this.Update.Init();
        }
        for (const func of this.IndependentUpdate) {
                func();
            }
        if (this.STOPTHISSHITT) {
            this.STOPTHISSHITT = false;
            return;
        }
        window.requestAnimationFrame(() => {this.MainLoop();});

    }
}
class InputsManager {
    OnMoveStart = new Set();
    OnMoveEnd = new Set();
    MoveDirection = {x: 0, y: 0};
    Controlled = new Set();
    MouseDepended = new Set();
    MousePos = {x: 0, y: 0};
    OnClick = new CustomEvent();
    afterStartWave = new Set();
    AddSpawner = new Set();
    AnyButton = new CustomEvent();
    UpdateSpawnersRandomizer = new Set();
    GodMod = new Set();
    pauseButton = new CustomEvent();
    KillAll = new CustomEvent();
    isDeactivated = true;
    TestBtn = new CustomEvent();
    TestBtnTwo = new CustomEvent();
    GetMoveVector() {
        let norm = {x: 0, y: 0};
        if (this.MoveDirection.x != 0 || this.MoveDirection.y != 0) {
            norm.x = this.MoveDirection.x / ((this.MoveDirection.x)**2 + (this.MoveDirection.y)**2)**0.5;
            norm.y = this.MoveDirection.y / ((this.MoveDirection.x)**2 + (this.MoveDirection.y)**2)**0.5;
        }
        return norm;
    }
    InitMoving(move, dir) {
        for (const func of this.Controlled) {
            func(move, dir);
        }
    }
    
    timer = 10;
    Activate() {
        if (this.timer <= 0) {
            this.isDeactivated = false;
            return "stop";
        } else {
            this.timer--;
        }

    }
    Setup() {
        window.addEventListener("keydown", (e) => {
            if (this.isDeactivated) {
                // console.log("НЕактивный ипут");
                return;}
            // console.log("Активный ипут") ;
            
            if (e.key == "w")        {this.MoveDirection.y = 1}
            else if (e.key == "s")   {this.MoveDirection.y = -1}
            if (e.key == "d")        {this.MoveDirection.x = 1}
            else if (e.key == "a")   {this.MoveDirection.x = -1}
            if (this.MoveDirection.x != 0 || this.MoveDirection.y != 0) {
                for(const func of this.OnMoveStart) {
                    func();
                }
            }
            if (e.key == "F2") {
                this.TestBtn.Init();
            }
            if (e.key == "F9") {
                this.TestBtnTwo.Init();
            }
            if (e.key == "`") {
                for(let func of this.GodMod) {
                    func();
                }
            }
            if (e.key == "e") {
                for(let func of this.afterStartWave) {
                    func();
                }
            }
            if (e.key == "f") {
                for(let func of this.UpdateSpawnersRandomizer) {
                    func();
                }
            }
            if (e.key == "t") {
                for(let func of this.AddSpawner) {
                    func();
                }
            }
            if (e.key == 'y') {this.KillAll.Init();}
            if (e.key == "Escape") {
                this.pauseButton.Init();
            }
            
            if (e.key != "Alt") {
                /* for(let func of this.AnyButton) {
                    func();
                } */
               this.AnyButton.Init();
            }
        });
        window.addEventListener("keyup", (e) => {
            if (this.isDeactivated) {return;}
            if (e.key == "w" && this.MoveDirection.y == 1)    {this.MoveDirection.y = 0}
            if (e.key == "s" && this.MoveDirection.y == -1)    {this.MoveDirection.y = 0}
            if (this.MoveDirection.x == 0 && this.MoveDirection.y == 0) {
                for(const func of this.OnMoveEnd) {
                    func();
                }
            }
        });
        window.addEventListener("mousemove", (e) => {
            if (this.isDeactivated) {return;}
            let screenToWord = {x: e.clientX * Scene.size.dx/ GraphicService.canvas.width,
                y: e.clientY * Scene.size.dy/ GraphicService.canvas.height};
            this.MousePos = screenToWord;
            for (let func of this.MouseDepended) {
                func(this.MousePos);
            }
        });
        window.addEventListener("mousedown", (e) => {
            if (this.isDeactivated) {return;}
           this.OnClick.Init(this.MousePos);
           this.AnyButton.Init();
        });
    }
}
class GameObject {
    parentObject;
    sprite;
    angle = 270 // вертикально вверх
    position;
    size = {dx: 2.5, dy: 2.5};
    speed = 0.1;
    onDamage = new Set();
    onDestroy = new Set();
    DeleteFrom = new Set();
    isDead = false;
    cheatOn = false;
    Move(dir /* dir = {x: 0, y: 1} */) {
        const angleRad = this.angle * Math.PI / 180;
        
        const moveY = (Math.cos(angleRad) * dir.x + Math.sin(angleRad) * dir.y) * this.speed;
        const moveX = (-Math.sin(angleRad) * dir.x + Math.cos(angleRad) * dir.y) * this.speed;
        
        this.position.x += moveX;
        this.position.y += moveY;
        
    }
    Rotate(an) {
        if (an+this.angle > 360) {
            this.angle = an+this.angle - 360;
        } else if (an+this.angle < 0) {
            this.angle = an+this.angle + 360;
        } else {
            this.angle = an+this.angle;
        }
        
    }
    SetAngle(newAngle) {
        if (newAngle > 360 || newAngle < 0) {
            console.error("Неправильный угол");
            return;
        }
        this.angle = newAngle;
    }
    RotateTo(vecPos) {
        let targetPos = {...vecPos};
        targetPos.x -= this.position.x;
        targetPos.y -= this.position.y;
        // переворот оси если больше/меньше pi/2
        targetPos.x *= targetPos.y < 0? -1: 1;
        let newAngle = Math.acos(targetPos.x / (targetPos.x**2 + targetPos.y**2)**0.5);
        // сдвиг на 180 градусов если больше/меньше pi/2
        newAngle += targetPos.y < 0? Math.PI: 0; 
        
        this.SetAngle(newAngle * 180 / Math.PI);
    }
    /**
     * Удаляет объект и всё с ним связанное.
     * Работает только если в DeleteFrom указаны все списки
     * где хранятся ссылки на объект
     */
    DeleteMe() {
        for (let otkuda of this.DeleteFrom) {
            otkuda.delete(this);
        }
        for (const func of this.onDestroy) {
            func();
        }
        this.isDead = true;
        delete this;
        
    }
    health = 10;
    Damage(dam) {
        if (this.cheatOn) {return;}
        this.health -= dam;
        if (this.health <= 0) {
            this.DeleteMe();
        }
        for (const func of this.onDamage) {
            func();
        }
    }
    DistanceTo(pos = {x: 0, y: 0}) {
        return ((pos.x - this.position.x)**2 + (pos.y - this.position.y)**2)**0.5;
    }
    CreateSprite() {
        this.sprite = new SpriteController(this);
        // this.sprite.size = {w: 5, h: 5};
        this.onDestroy.add(() => {
            this.sprite.DeleteMe();
        });
    }
    constructor() {
        this.position = {...Scene.center};
    }
}
class Player extends GameObject{
    constructor() {
        super();
        this.CreateSprite();
        this.sprite.SetSrc("./assets/player.png", "./assets/игрок.png");
        this.sprite.countColumns = 2;
        this.sprite.countRows = 2;
        
        this.sprite.angle = 90;
        this.sprite.size.w *= 1.5;
        this.sprite.size.h *= 1.5;
        this.speed = 0.2;
        this.sprite.isAnimated = true;
        this.sprite.isMap = true;
    }
    killCount = 0;
    health = 20;
    bullets = new Set();
    onShoot = new Set();
    Shoot(enemies) {
        let newBul = new Bullet(this, enemies);
        this.bullets.add(newBul);
        newBul.DeleteFrom.add(this.bullets);
        newBul.sprite.SetSrc("./assets/bullet.png");
        for (const func of this.onShoot) {
            func(newBul);
        }
        return newBul;
    };
}
class Bullet extends GameObject {
    targetObj;
    isOnlyOneTarget = true;
    damage = 4;
    lifeTime = 250;
    speed = 0.5
    AI() {
        this.lifeTime--;
        if (this.lifeTime <= 0) {this.DeleteMe();}
        if (this.isOnlyOneTarget) {
            
            if (CollisionSystem.checkCollision(this, this.targetObj)) {
                this.targetObj.Damage(this.damage);
                this.DeleteMe();
            } else {
                this.Move({x: 0, y: 1});
            }
        } else {
            const looser = CollisionSystem.findFirstCollision(this, this.targetObj);
            if (looser != undefined) {
                looser.Damage(this.damage);
                this.DeleteMe();
            } else {
                this.Move({x: 0, y: 1});
            }
        }
        
    }
    constructor(parent, targetObj) {
        super();
        this.CreateSprite();
        if (typeof targetObj[Symbol.iterator] === 'function') {
            this.isOnlyOneTarget = false;
        }
        this.sprite.size.w *= 0.4;
        this.sprite.size.h *= 0.2;
        this.size.dx *= 0.4;
        this.size.dy *= 0.2;
        this.angle = parent.angle;
        this.position = {... parent.position};
        this.targetObj = targetObj;
        this.parentObject = parent;
    }
}
class EnemyBasic extends GameObject {
    health = 1;
    randomizedNum = 0;
    dir = 1;
    target;
    price = 1;
    constructor(parent, target) {
        super();
        this.CreateSprite();
        this.sprite.SetSrc("./assets/enemy.png", "./assets/враг.png");
        this.sprite.isMap = true;
        this.sprite.countRows = 1;
        this.sprite.countColumns = 2;
        this.sprite.size.w *= 1.2;
        this.sprite.size.h *= 1.2;
        this.sprite.angle = 90;
        // this.sprite.size = {w: 10, h: 10};
        this.position = {... parent.position};
        this.angle = parent.angle;
        this.speed = 0.5;
        this.target = target;
        this.parentObject = parent;
    }
    LifeInCell() {
        if (this.position.x > Scene.size.dx*1.5 || this.position.x < -Scene.size.dx*0.5 ||
            this.position.y > Scene.size.dy*1.5 || this.position.y < -Scene.size.dy*0.5
        ) {
            this.DeleteMe();
        }
    }
    onShoot = new Set();
    Shoot() {
        let newBul = new Bullet(this, this.target);
        newBul.sprite.SetSrc("./assets/enemy_bullet.png");
        for (const func of this.onShoot) {
            func(newBul);
        }
        this.bullets.add(newBul);
        newBul.DeleteFrom.add(this.bullets);
        return newBul;
    }
    bullets = new Set();
    AI() {
        this.randomizedNum += Math.floor(Math.random()*10);
            if (this.randomizedNum > 500) { // начало движения вниз
                this.sprite.NextSpriteAbs(1);
                this.RotateTo(this.target.position);
                this.Move({x: 0,
                            y: 1 * this.speed
                });
                if (this.randomizedNum > 700) { // сброс движения
                    this.dir = -this.dir;
                    this.randomizedNum = 0;
                    this.Shoot();
                    this.sprite.NextSpriteAbs(0);
                }
            } else {
                this.RotateTo(this.target.position);
                this.Move({x: this.dir * this.speed,
                            y: 0
                });
            }
            this.LifeInCell();
    }
}
class EnemyAdvanced extends GameObject {
    health = 8;
    price = 3;
    randomizedNum = 0;
    dir = 1;
    distanceFlag = 1;
    target;
    constructor(parent, target) {
        super();
        this.CreateSprite();
        this.sprite.SetSrc("./assets/enemy_advanced.png");
        this.sprite.size.w *= 1.2;
        this.sprite.size.h *= 1.2;
        this.size.dx *= 1.2;
        this.size.dy *= 1.2;
        this.speed = 0.8;
        this.position = {... parent.position};
        this.angle = parent.angle;
        this.target = target;
    }
    LifeInCell() {
        if (this.position.x > Scene.size.dx*1.5 || this.position.x < -Scene.size.dx*0.5 ||
            this.position.y > Scene.size.dy*1.5 || this.position.y < -Scene.size.dy*0.5
        ) {
            this.DeleteMe();
        }
    }
    onShoot = new CustomEvent();
    bullets = new Set();
    Shoot() {
        let newBul = new Bullet(this, this.target);
        newBul.sprite.SetSrc("./assets/enemy_bullet.png");
        this.onShoot.Init(newBul);
        return newBul;
    }
    AI() {
        this.randomizedNum += Math.floor(Math.random()*10);
            if (this.randomizedNum > 700) { // начало движения вниз
                this.RotateTo(this.target.position);
                this.Move({x: 0,
                            y: 1 * this.speed * this.distanceFlag
                    });
                const disToPlayer = this.DistanceTo(this.target.position);
                if (this.distanceFlag == 1 && disToPlayer < 10) {
                    this.distanceFlag = -1;
                    this.dir = -this.dir;
                    this.randomizedNum = 0;
                    let newBull = this.Shoot();
                    this.bullets.add(newBull);
                    newBull.DeleteFrom.add(this.bullets);
                } else if (this.distanceFlag == -1 && disToPlayer > 40) {
                    this.distanceFlag = 1;
                    this.dir = -this.dir;
                    this.randomizedNum = 0;
                    let newBull = this.Shoot();
                    this.bullets.add(newBull);
                    newBull.DeleteFrom.add(this.bullets);
                } else if (this.randomizedNum > 900) { // сброс движения
                    this.distanceFlag = 1;
                    this.dir = -this.dir;
                    this.randomizedNum = 0;
                    let newBull = this.Shoot();
                    this.bullets.add(newBull);
                    newBull.DeleteFrom.add(this.bullets);
                }
            } else {
                this.RotateTo(this.target.position);
                this.Move({x: this.dir * this.speed,
                            y: 0
                });
            }
            this.LifeInCell();
    }
}
class CollisionSystem {
    // Статическое множество объектов
    static Objects = new Set();

    /**
     * Проверка столкновений всех объектов в системе
     * @returns {Array} Массив пар столкнувшихся объектов
     */
    static checkAllCollisions() {
        const collisions = [];
        const objects = Array.from(this.Objects);
        
        for (let i = 0; i < objects.length; i++) {
            for (let j = i + 1; j < objects.length; j++) {
                if (this.checkCollision(objects[i], objects[j])) {
                    collisions.push([objects[i], objects[j]]);
                }
            }
        }
        
        return collisions;
    }
    static isPointInObject(object, pointPos) {
        const pointX = pointPos.x;
        const pointY = pointPos.y;
        const { position, angle, size } = object;
        const { dx, dy } = size;
        
        // Преобразуем угол в радианы
        const angleRad = angle * Math.PI / 180;
        
        // Находим разницу между точкой и центром прямоугольника
        const deltaX = pointX - position.x;
        const deltaY = pointY - position.y;
        
        // Поворачиваем точку обратно (чтобы прямоугольник стал выровненным по осям)
        const cos = Math.cos(-angleRad);
        const sin = Math.sin(-angleRad);
        
        // Применяем обратное вращение к точке
        const rotatedX = deltaX * cos - deltaY * sin;
        const rotatedY = deltaX * sin + deltaY * cos;
        
        // Проверяем, находится ли точка внутри выровненного прямоугольника
        return Math.abs(rotatedX) <= dx && Math.abs(rotatedY) <= dy;
    }
    /**
     * Проверка столкновения одного объекта с набором других объектов
     * @param {Object} object - Объект для проверки
     * @param {Set} objectSet - Набор объектов для проверки (по умолчанию все объекты системы)
     * @param {boolean} excludeSelf - Исключить сам объект из проверки (если он есть в наборе)
     * @returns {Array} Массив объектов, с которыми произошло столкновение
     */
    static checkCollisionsWithSet(object, objectSet = this.Objects, excludeSelf = true) {
        const collisions = [];
        
        for (const other of objectSet) {
            // Пропускаем проверку с самим собой, если нужно
            if (excludeSelf && object === other) continue;
            
            if (this.checkCollision(object, other)) {
                collisions.push(other);
            }
        }
        
        return collisions;
    }

    /**
     * Проверка столкновения одного объекта с первым найденным объектом из набора
     * @param {Object} object - Объект для проверки
     * @param {Set} objectSet - Набор объектов для проверки
     * @param {boolean} excludeSelf - Исключить сам объект из проверки
     * @returns {Object|null} Первый объект, с которым произошло столкновение, или null
     */
    static findFirstCollision(object, objectSet = this.Objects, excludeSelf = true) {
        for (const other of objectSet) {
            if (excludeSelf && object === other) continue;
            
            if (this.checkCollision(object, other)) {
                return other;
            }
        }
        
        return null;
    }

    /**
     * Проверка, сталкивается ли объект с любым объектом из набора
     * @param {Object} object - Объект для проверки
     * @param {Set} objectSet - Набор объектов для проверки
     * @param {boolean} excludeSelf - Исключить сам объект из проверки
     * @returns {boolean} true если есть хотя бы одно столкновение
     */
    static hasCollisionWithSet(object, objectSet = this.Objects, excludeSelf = true) {
        for (const other of objectSet) {
            if (excludeSelf && object === other) continue;
            console.log(object, other);
            
            if (this.checkCollision(object, other)) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Проверка столкновения двух объектов методом разделяющей оси (SAT)
     * @param {Object} objA - Первый объект
     * @param {Object} objB - Второй объект
     * @returns {boolean} true если объекты пересекаются
     */
    static checkCollision(objA, objB) {
        // Получаем вершины обоих прямоугольников
        const verticesA = this.getVertices(objA);
        const verticesB = this.getVertices(objB);
        
        // Получаем оси для проверки
        const axes = [
            ...this.getAxes(verticesA),
            ...this.getAxes(verticesB)
        ];
        
        // Проверяем проекции на всех осях
        for (const axis of axes) {
            if (!this.overlapOnAxis(verticesA, verticesB, axis)) {
                return false; // Найдена разделяющая ось
            }
        }
        
        return true; // Столкновение обнаружено
    }

    /**
     * Получение вершин повернутого прямоугольника
     * @param {Object} obj - Объект с position, angle и size
     * @returns {Array} Массив вершин в мировых координатах
     */
    static getVertices(obj) {
        const { position, angle, size } = obj;
        const { dx, dy } = size;
        
        // Угол в радианах (преобразуем 0-верх в математическую систему)
        const angleRad = (angle) * Math.PI / 180;
        
        // Матрица поворота
        const cos = Math.cos(angleRad);
        const sin = Math.sin(angleRad);
        
        // Локальные координаты вершин (относительно центра)
        const localVertices = [
            { x: -dx, y: -dy },
            { x: dx, y: -dy },
            { x: dx, y: dy },
            { x: -dx, y: dy }
        ];
        
        // Преобразуем в мировые координаты с учетом поворота
        return localVertices.map(v => ({
            x: position.x + (v.x * cos - v.y * sin),
            y: position.y + (v.x * sin + v.y * cos)
        }));
    }

    /**
     * Получение нормалей к сторонам прямоугольника (оси для проекции)
     * @param {Array} vertices - Вершины прямоугольника
     * @returns {Array} Массив осей (нормалей)
     */
    static getAxes(vertices) {
        const axes = [];
        
        for (let i = 0; i < vertices.length; i++) {
            const p1 = vertices[i];
            const p2 = vertices[(i + 1) % vertices.length];
            
            // Вектор стороны
            const edge = {
                x: p2.x - p1.x,
                y: p2.y - p1.y
            };
            
            // Нормаль к стороне (перпендикулярный вектор)
            const normal = {
                x: -edge.y,
                y: edge.x
            };
            
            // Нормализуем вектор
            const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
            axes.push({
                x: normal.x / length,
                y: normal.y / length
            });
        }
        
        return axes;
    }

    /**
     * Проверка пересечения проекций на оси
     * @param {Array} vertA - Вершины первого объекта
     * @param {Array} vertB - Вершины второго объекта
     * @param {Object} axis - Ось для проекции
     * @returns {boolean} true если проекции пересекаются
     */
    static overlapOnAxis(vertA, vertB, axis) {
        // Проекции вершин первого объекта
        const projA = vertA.map(v => this.dot(v, axis));
        const minA = Math.min(...projA);
        const maxA = Math.max(...projA);
        
        // Проекции вершин второго объекта
        const projB = vertB.map(v => this.dot(v, axis));
        const minB = Math.min(...projB);
        const maxB = Math.max(...projB);
        
        // Проверка пересечения интервалов
        return !(maxA < minB || maxB < minA);
    }

    /**
     * Скалярное произведение векторов
     * @param {Object} v1 - Первый вектор
     * @param {Object} v2 - Второй вектор
     * @returns {number} Скалярное произведение
     */
    static dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;
    }
}
class SpriteController {
    img;
    position = {x: 0, y: 0};
    size = {w: 5, h: 5};

    isAnimated = false;
    isMap = false;
    spacing = {dx: 0, dy: 0};
    sizeOfOneSprite = {w: 1024, h: 1024};

    countRows = 0;
    countColumns = 0;

    currentRow = 0;
    currentColumn = -1;

    timeBetweenFrames = 0;
    MaxTimeBetweenFrames = 10;
    parentObject;
    angle = 0;
    DeleteFrom;
    isAbsoluteSize = false;

    isHidden = false;
    imgSwitch = [];
    imgNum = false;

    SwitchImg() {
        this.imgNum = !this.imgNum;
        if (this.imgNum) {
            this.img = this.imgSwitch[1];
        } else {
            this.img = this.imgSwitch[0];
        }
    }
    GetSprite() {
        const mulX = GraphicService.canvas.width/Scene.size.dx;
        const mulY = GraphicService.canvas.height/Scene.size.dy;
        const screenX = this.parentObject.position.x * mulX;
        const screenY = this.parentObject.position.y * mulY;
        if(this.isMap) {
            if (this.isAnimated) {this.AnimationTimer();}
            return [ this.img,
                this.sizeOfOneSprite.w * this.currentColumn + this.spacing.dx * this.currentColumn,
                this.sizeOfOneSprite.h * this.currentRow + this.spacing.dy * this.currentRow,
                this.sizeOfOneSprite.w, this.sizeOfOneSprite.h, // срез
                screenX + this.position.x, // xCenter в пикселях
                screenY + this.position.y, // yCenter в пикселях
                this.size.w * mulX, this.size.h * mulY, this.parentObject.angle + this.angle ]; // width, height, angle
        } else {
            return [ this.img, 0, 0, this.img.width, this.img.height, // срез
                screenX + this.position.x, // xCenter в пикселях
                screenY + this.position.y, // yCenter в пикселях
                this.size.w * mulX, this.size.h * mulY, this.parentObject.angle + this.angle]; // width, height, angle
        }
    }
    AnimationTimer() {
        if (this.timeBetweenFrames > 0) {
            this.timeBetweenFrames -= 1;
            return;
        } else {
            this.NextSprite();
            this.timeBetweenFrames = this.MaxTimeBetweenFrames;
        }
        
    }
    NextSprite(step = 1) {
        if (this.currentColumn + step >= this.countColumns) {
            this.currentColumn = 0;
        } else if (this.currentColumn + step < 0) {
            this.currentColumn = this.currentColumn + step + this.countColumns;
        } else {
            this.currentColumn += 1;
        }
    }
    NextSpriteAbs(num) {
        if (num > this.countColumns || num < 0) {
            console.error("Нет такого спрайта в Карте спрайтов");
        }
        this.currentColumn = num;
    }
    SetRowAbs(num) {
        if (num > -1 && num < this.countRows) {
            this.currentRow = num;
        } else {
            console.error("Не могу найти такую анимацию (строку анимации)", num, this.countRows);
        }
    }
    SetSrc(src0, src1) {
        if (src1 == undefined) {
            delete this.img; 
            this.img = new Image();
            this.img.src = src0;
        } else {
            this.imgSwitch = [];
            this.imgSwitch.push(new Image());
            this.imgSwitch.push(new Image());
            this.imgSwitch[0].src = src0;
            this.imgSwitch[1].src = src1;
            this.img = this.imgSwitch[0];
        }
        
    }
    DeleteMe() {
        if(this.DeleteFrom == undefined) {
            console.error("Графический сервис не определён для этого спрайта или был неправильно подключен", this.constructor.name, this.parentObject.constructor.name);
        }
        
        this.DeleteFrom.delete(this);
    }
    constructor (parent) {
        this.parentObject = parent;
        this.timeBetweenFrames = this.MaxTimeBetweenFrames;
    }
}
class GraphicService {
    sprites = new Set();
    texts = new Set();
    static canvas;
    static ctx;
    constructor() {
        if (GraphicService.canvas == undefined) {
            GraphicService.canvas = document.getElementById("canv");
            GraphicService.ctx = GraphicService.canvas.getContext("2d");
            GraphicService.canvas.width = window.innerWidth;
            GraphicService.canvas.height = window.innerHeight;
            window.addEventListener("resize", () => {
                GraphicService.canvas.width = window.innerWidth;
            GraphicService.canvas.height = window.innerHeight;
            });
        }
    }
    /* static FromPixelToWord(pos) {
        return {x: pos.x * Scene.size.dx/GraphicService.canvas.width,
                y: pos.y * Scene.size.dy/GraphicService.canvas.height
        }
    } */
    AddNewSprite(sprite) {
        this.sprites.add(sprite);
        sprite.DeleteFrom = this.sprites;
    }
    AddNewTextUI(newTexts) {
        for (let text of newTexts.texts) {
            this.texts.add(text);
            text.DeleteFrom = this.texts;
        }
    }
    AnimationLoop() {
        GraphicService.ctx.clearRect(0, 0, GraphicService.canvas.width, GraphicService.canvas.height);
        for (const sprite of this.sprites)
        {
            if (sprite.isHidden) { continue; }
            const [img, sx, sy, sW, sH, xCenter, yCenter, width, height, angle] = sprite.GetSprite();
            GraphicService.ctx.save();
            GraphicService.ctx.translate(xCenter, yCenter);
            GraphicService.ctx.rotate(angle * Math.PI / 180);

            GraphicService.ctx.drawImage(img, sx, sy, sW, sH, -width/2, - height/2, width, height);
            GraphicService.ctx.restore();
        }
        for (const textSprite of this.texts) {
            const [text, xCenter, yCenter, color, font, size, angle] = textSprite.GetText();
            GraphicService.ctx.save();
            GraphicService.ctx.translate(xCenter, yCenter);
            GraphicService.ctx.rotate(angle * Math.PI / 180);
            GraphicService.ctx.textAlign = 'center';
            GraphicService.ctx.textBaseline = 'middle';

            GraphicService.ctx.fillStyle = color;
            GraphicService.ctx.font = font + " " + size;
            GraphicService.ctx.fillText(text, 0, 0);
            GraphicService.ctx.restore();
        }
    }
}
class Spawner extends GameObject {
    Spawn(target, isAdvanced, isBoss) {
        this.sprite.NextSpriteAbs(1);
        let newEnemy = isAdvanced? new EnemyAdvanced(this, target): new EnemyBasic(this, target);
        newEnemy = isBoss? new Boss(this, target): newEnemy;
        return newEnemy;
    }
    constructor() {
        super();
        this.CreateSprite();
        this.sprite.SetSrc("./assets/spawner.png", "./assets/спавнер.png");
        this.sprite.isMap = true;
        this.sprite.countRows = 1;
        this.sprite.countColumns = 2;
        this.sprite.size.w *= 1.2;
        this.sprite.size.h *= 1.2;
        this.sprite.angle = 90;
        this.sprite.NextSpriteAbs(0);
        return this;
    }
}
class RandomizeSpawner extends GameObject {
    position = {x: Scene.size.dx/2, y: Scene.size.dy/2};
    countOfSpawners = 0;
    countOfEnemies = 0;
    allEnemies = new Set();
    TimeBetweenWaves = 0;
    MaxTimeBetweenWaves = 800;
    afterStartWave = new Set();
    onStartWaveForEveryone = new CustomEvent();
    beforeWave = new CustomEvent();
    spawners = new Set();
    chance = 8;
    BossFight = false;
    IncreaseSpawnersCount(count = 1) {
        this.countOfSpawners = Math.max(Math.min(13, this.countOfSpawners + count), 1);
        if (this.BossFight) {
            this.countOfSpawners = 1;
            this.BossFight = false;
        }
        if (this.countOfSpawners == 13) {
            this.countOfSpawners = 1;
            this.BossFight = true;
        }
    }
    UpdateSpawners() {
        this.IncreaseSpawnersCount();
        
        for (let spawner of this.spawners) {
            spawner.DeleteMe();
        }
        if (this.BossFight) {
            let newSpawner = new Spawner();
            this.spawners.add(newSpawner);
            newSpawner.DeleteFrom.add(this.spawners);
            this.position.y = -5;
            return;
        }
        let possiblePos = [];
        for (let i = 1; i < 13; i++) {
            possiblePos.push(i);
        }
        for (let i = 0; i < this.countOfSpawners; i++) {
            
            let newSpawner = new Spawner();
            this.spawners.add(newSpawner);
            newSpawner.DeleteFrom.add(this.spawners);

            const randomNum = Math.floor(Math.random()* possiblePos.length);
            const currentPos = possiblePos.splice(randomNum, 1)[0];
            const currentPosRad = (2* Math.PI) / 12 * currentPos;
                     
            newSpawner.position.x = 40*Math.cos(currentPosRad) + Scene.size.dx/2;
            newSpawner.position.y = 40*Math.sin(currentPosRad) + Scene.size.dy/2;
        }
    }
    spawnerUpdateFlag = false;
    target;
    StartWave() {
        if (this.BossFight) {
            for(const spawner of this.spawners) {
                let newEnemy = spawner.Spawn(this.target, true, true); // 1 к 4
                this.countOfEnemies++;
                this.allEnemies.add(newEnemy);
                newEnemy.DeleteFrom.add(this.allEnemies);
            }
        } else {
            for(const spawner of this.spawners) {
            let newEnemy = spawner.Spawn(this.target, Math.floor(Math.random()*10%(this.chance)) == 0); // 1 к 4
            this.countOfEnemies++;
            this.allEnemies.add(newEnemy);
            newEnemy.DeleteFrom.add(this.allEnemies);
            this.onStartWaveForEveryone.Init(newEnemy);
        }
        }
        
        if (this.chance > 4) {
            this.chance--;
        }
        this.spawnerUpdateFlag = false;
        for (const func of this.afterStartWave) {
            func();
        }
    }
    Timer() {
        if (this.allEnemies.size > 0) {
            return;
        } 
        if(this.TimeBetweenWaves > 0) {
            this.TimeBetweenWaves--;
            if (!this.spawnerUpdateFlag && this.TimeBetweenWaves <= this.MaxTimeBetweenWaves / 2) {
                this.spawnerUpdateFlag = true;
                this.UpdateSpawners();
                this.beforeWave.Init();
            }
            return;
        }
        if (this.TimeBetweenWaves <= 0) {
            this.TimeBetweenWaves = this.MaxTimeBetweenWaves;
            this.StartWave();
        }
    }
    constructor() {
        super();
        this.TimeBetweenWaves = this.MaxTimeBetweenWaves;
    }
}
class TextUI extends GameObject{
    constructor () {
        super();
        this.sprite = undefined;
        this.texts = new Array();
        this.onDestroy.add(() => {
            for(let text of this.texts) {
                text.DeleteMe();
            }
        });
    }
    
}
class TextController {
    position = {x: 0, y: 0};
    text = "Hello word!";
    size = 5;
    color = "black";
    font = "Roboto";
    DeleteFrom;
    constructor(parent) {
        this.parentObject = parent;
        // GraphicService.texts.add(this);
    }
    DeleteMe() {
        this.DeleteFrom.delete(this);
    }
    GetText() {
        const mulX = GraphicService.canvas.width/Scene.size.dx;
        const mulY = GraphicService.canvas.height/Scene.size.dy;
        const sizeMul = Math.min(mulX*0.4, mulY*0.6);
        
        return [this.text,
            (this.parentObject.position.x + this.position.x) * mulX,
            (this.parentObject.position.y + this.position.y) * mulY,
            this.color, this.size* sizeMul+ "px", this.font, this.parentObject.angle];
    }
}
class Button extends GameObject {
    onClick = new CustomEvent();
    atTrigger = new CustomEvent();
    HitCheck(WordPos) {
        if (CollisionSystem.isPointInObject(this, WordPos)) {
            this.onClick.Init();
        }
    }
    timeBetweenClicks = 0;
    MaxTimeBetweenClicks = 35;
    constructor() {
        super();
        this.CreateSprite();
        this.sprite.SetSrc("./assets/label.png");
        this.sprite.size.w *= 6;
        this.sprite.size.h *= 2;
        this.size.dx *= 6;
        this.size.dy *= 2;
        this.sprite.countColumns = 3;
        this.sprite.countRows = 1;
        this.sprite.isMap = true;

        this.sprite.spacing = {dx: 3, dy: 0};
        this.sprite.sizeOfOneSprite = {w: 2347, h: 890};
        // this.sprite.isAnimated = true;
        this.sprite.NextSprite();

        this.angle = 0;
        this.onClick.add(() => {
            if (this.timeBetweenClicks > 0) {
                return;
            }
            this.sprite.NextSpriteAbs(2);
            this.timeBetweenClicks = this.MaxTimeBetweenClicks;

        });
    }
    DelayedTriggering() {
        if (this.timeBetweenClicks == 0) {
            this.sprite.NextSprite();
            this.atTrigger.Init();
            return "stop";
        }
        this.timeBetweenClicks--;
    }
}
class CustomEvent {
    listeners = new Set();
    deleteAfterTriggering = false;
    add(func) {
        this.listeners.add(func);
    }
    delete(func) {
        this.listeners.delete(func);
    }
    Init(param) {
        let copyForIter = new Set(this.listeners);
        if (copyForIter.size === 0) {
            return;
        }         
        for (let func of copyForIter) {
            const result = func(param);
            if (result == "stop" || this.deleteAfterTriggering) {
                this.listeners.delete(func);
            } 
        }
    }
    [Symbol.iterator]() {
        let iter = this.listeners.values();
        let res;
        return {
            next: () => {
                res = iter.next();
                if (!res.done) {
                    return {value: res.value, done: false};
                } else {
                    return {done: true};
                }
            }
        }
    }
}
class Healer extends GameObject{
    health = 1;
    damage = -6;
    constructor(parent) {
        super();
        this.CreateSprite();
        this.sprite.SetSrc("./assets./aid.png");
        this.position = {... parent.position};
        this.angle = 0;
    }
    target;
    AI() {
        if (CollisionSystem.checkCollision(this, this.target)) {
            this.target.Damage(this.damage);
            this.DeleteMe();
            return "stop";
        }
    }
}
class Boss extends GameObject{
    health = 20;
    price = 5;
    randomizedNum = 0;
    dir = 1;
    distanceFlag = 1;
    target;
    maxFi = 0;
    minFi = -90;
    fi = 0;
    rad = 120;
    speed = 0.8;
    angularSpeed = 360/(2*Math.PI*this.rad / this.speed);
    constructor(parent, target) {
        super();
        this.CreateSprite();
        this.sprite.SetSrc("./assets/enemy_Advanced.png");
        this.sprite.size.w *= 1.5;
        this.sprite.size.h *= 1.5;
        this.size.dx *= 1.5;
        this.size.dy *= 1.5;
        // this.speed = 1;
        // this.position = {... parent.position};
        this.angle = parent.angle;
        this.target = target;

        /* this.position.y = Scene.center.y;
        this.position.x = 0; */
    }
    LifeInCell() {
        if (this.position.x > Scene.size.dx*3 || this.position.x < -Scene.size.dx*3 ||
            this.position.y > Scene.size.dy*3 || this.position.y < -Scene.size.dy*3
        ) {
            this.DeleteMe();
        }
    }
    onShoot = new CustomEvent();
    bullets = new Set();
    countOfShoots = 0;
    maxCountOfShoots = 2;
    countOfShootsTwo = 0;
    maxCountOfShootsTwo = 4;
    randomizedNumTwo = 0;
    Shoot() {
        if (this.dir == 1) {
            for (let i = 0; i < 12; i++) {
                this.Rotate(30);
                let newBul = new Bullet(this, this.target);
                newBul.sprite.SetSrc("./assets/enemy_bullet.png");
                this.onShoot.Init(newBul);
            }
        } else {
            let newBul = new Bullet(this, this.target);
            newBul.sprite.SetSrc("./assets/enemy_bullet.png");
            this.onShoot.Init(newBul);
        }
    }
    isBuffed = false
    AI() {
        if (this.health < 12 && !this.isBuffed) {
            this.isBuffed = true;
            this.speed *= 1.4;
            this.maxCountOfShoots += 1;
            this.angularSpeed = 360/(2*Math.PI*this.rad / this.speed);
        }
        if (this.dir == 1) {
            if (this.fi > -85 && this.fi < -5) {
                this.randomizedNum += Math.random()*10%10;
            }
            this.position.x = Math.cos((this.fi + 135)* Math.PI/180) * this.rad + Scene.center.x;
            this.position.y = -Math.sin((this.fi + 135)* Math.PI/180) * this.rad + Scene.center.y/2 + this.rad;
            if (this.randomizedNum > 350 && this.countOfShoots < this.maxCountOfShoots) {
                console.log(this.fi);
                this.countOfShoots++;
                this.randomizedNum = 0;
                
                // this.RotateTo(this.target);
                this.Shoot();
            }
            if (this.fi < this.maxFi) {
                this.fi += this.angularSpeed;
            } else {
                this.fi = this.minFi;
                this.position.y = Scene.center.y*1.5;
                this.countOfShoots = 0;
                this.randomizedNum = 0;
                this.dir = -1;
            }
        } else {
            // едем понизу
            this.randomizedNumTwo += Math.random()*10%10;
            if (this.randomizedNumTwo > 200 && this.countOfShootsTwo < this.maxCountOfShootsTwo) {
                this.countOfShootsTwo++;
                this.Shoot();
                this.randomizedNumTwo = 0;
            }
            this.position.x += this.speed;

            if (this.position.x > Scene.size.dx) {
                this.dir = 1;
                this.randomizedNumTwo = 0;
                this.countOfShootsTwo = 0;
            }
        }
            
        // this.LifeInCell();
    }
}