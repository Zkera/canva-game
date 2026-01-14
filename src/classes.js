class Scene {
    player;
    enemies = new Set();
    enemies_advanced = new Set();
    spawners = new Set();
    static size = {dx: 100, dy: 100};
    ui = new Set();
    OnCreateEnemy = new Set();
    OnCreateEnemyAdvanced = new Set();
    OnAddNewObj = new Set();
    countOfAllEnemies = 0;
    AddNewEnemy(enemy) {
        enemy.DeleteFrom.add(c.enemies);
        this.enemies.add(enemy);
        for(const func of this.OnCreateEnemy) {
            func(enemy);
        }
    }
    AddNewObj(obj, type) {
        switch (type) {
            case "enemy":
                obj.DeleteFrom.add(this.enemies);
                this.enemies.add(obj);
                break;
            case "enemy advanced":
                obj.DeleteFrom.add(this.enemies_advanced);
                this.enemies_advanced.add(obj);
                break
            case "spawner":
                obj.DeleteFrom.add(this.spawners);
                this.spawners.add(obj);
                break
            case "player":
                obj.DeleteFrom.add(this.player);
                this.player.add(obj);
                break
            case "ui":
                obj.DeleteFrom.add(this.ui);
                this.ui.add(obj);
                break
            default:
                console.error("неправильный тип");
                break;
        }
        for (const func of this.OnAddNewObj) {
            func(obj, type);
        }
        obj.parentObject = this;
    }
    AddNewEnemyAdvanced(enemy) {
        enemy.DeleteFrom.add(this.enemies_advanced);
        this.enemies_advanced.add(enemy);
        for(const func of this.OnCreateEnemyAdvanced) {
            func(enemy);
        }
    }
}
class TimeMachine{
    isPlaying = false;
    Update = new Set();
    // ControlledActive = undefined;
    IndependentUpdate = new Set();
    Toggle() {
        this.isPlaying = !this.isPlaying;
        /* if (this.isPlaying) {
            this.MainLoop()
        } */
    }
    MainLoop() {
        if (this.isPlaying) {
            /* for (let toMove of this.ControlledActive) {
                toMove();
            } */
            // this.ControlledActive?();
            // AI.MoveNPC();
            for (const func of this.Update) {
                func();
            }
        }
        for (const func of this.IndependentUpdate) {
                func();
            }
        // GraphicService.AnimationLoop();
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
    OnClick = new Set();
    OnStartWave = new Set();
    AddSpawner = new Set();
    AnyButton = new Set();
    UpdateSpawnersRandomizer = new Set();
    GodMod = new Set();
    debugBtn = new Set();
    InitDebugButton() {
        for(let func of this.debugBtn) {
                    func();
        }
    }
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
    Setup() {
        window.addEventListener("keydown", (e) => {
            if (e.key == "w")        {this.MoveDirection.y = 1}
            else if (e.key == "s")   {this.MoveDirection.y = -1}
            if (e.key == "d")        {this.MoveDirection.x = 1}
            else if (e.key == "a")   {this.MoveDirection.x = -1}
            if (this.MoveDirection.x != 0 || this.MoveDirection.y != 0) {
                // TimeMachine.ControlledActive = this.Controlled;
                for(const func of this.OnMoveStart) {
                    func();
                }
            }
            if (e.key == "F2") {
                this.InitDebugButton();
            }
            if (e.key == "`") {
                for(let func of this.GodMod) {
                    func();
                }
            }
            if (e.key == "e") {
                for(let func of this.OnStartWave) {
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
            if (e.key == "Escape") {
                // window.location.reload();
                this.InitDebugButton();
                
            }
            
            if (e.key != "Alt") {
                for(let func of this.AnyButton) {
                    func();
                }
            }
            // console.log("нажата", e.key);
            
        });
        window.addEventListener("keyup", (e) => {
            if (e.key == "w" && this.MoveDirection.y == 1)    {this.MoveDirection.y = 0}
            if (e.key == "s" && this.MoveDirection.y == -1)    {this.MoveDirection.y = 0}
            // if (e.key == "d" && this.MoveDirection.x == 1)    {this.MoveDirection.x = 0}
            // if (e.key == "a" && this.MoveDirection.x == -1)    {this.MoveDirection.x = 0}
            if (this.MoveDirection.x == 0 && this.MoveDirection.y == 0) {
                // TimeMachine.ControlledActive = new Set();
                for(const func of this.OnMoveEnd) {
                    func();
                }
            }
        });
        window.addEventListener("mousemove", (e) => {
            let screenToWord = {x: e.clientX * Scene.size.dx/ GraphicService.canvas.width,
                y: e.clientY * Scene.size.dy/ GraphicService.canvas.height};
            this.MousePos = screenToWord;
            for (let func of this.MouseDepended) {
                func(this.MousePos);
            }
        });
        window.addEventListener("mousedown", (e) => {
            for (let func of this.OnClick) {
                func();
            }
            for(let func of this.AnyButton) {
                func();
            }
        });
    }
}
class GameObject {
    parentObject;
    sprite;
    angle = 270 // вертикально вверх
    position = {x: 50, y: 50};
    size = {dx: 1, dy: 1};
    speed = 0.1;
    onDamage = new Set();
    onDestroy = new Set();
    DeleteFrom = new Set();
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
        // console.log((newAngle * 180 / Math.PI).toFixed(2), targetPos.y, targetPos.x / (targetPos.x**2 + targetPos.y**2)**0.5);
        
        this.SetAngle(newAngle * 180 / Math.PI);
    }
    DeleteMe() {
        /* Scene.enemies.delete(this);
        Scene.enemies_advanced.delete(this);
        Scene.spawners.delete(this);
        AI.PlayerBullets.delete(this);
        AI.EnemyBullets.delete(this);
         */
        if (this.texts != undefined) {
            for (let text of this.texts) {
            GraphicService.texts.delete(text);
        }
        }
        GraphicService.sprites.delete(this.sprite);
        for (let otkuda of this.DeleteFrom) {
            otkuda.delete(this);
        }
        for (const func of this.onDestroy) {
            func();
        }
        delete this;
        
    }
    health = 10;
    Damage(dam) {
        this.health -= dam;
        if (this.health <= 0) {
            console.log("Убит!");
            
            this.DeleteMe();
        }
        for (const func of this.onDamage) {
            func();
        }
    }
    DistanceTo(pos = {x: 0, y: 0}) {
        return ((pos.x - this.position.x)**2 + (pos.y - this.position.y)**2)**0.5;
    }

    constructor() {
        this.sprite = new SpriteController(this);
    }
}
class Player extends GameObject{

    constructor() {
        super();
        /* this.sprite.SetSrc("./assets/player.png");
        this.sprite.size = {w: 40, h: 40};
        this.speed = 0.2; */
        this.sprite.SetSrc("./assets/test.png");
        this.sprite.countColumns = 10;
        this.sprite.countRows = 1;
        this.sprite.size = {w: 40, h: 40};
        this.speed = 0.2;
        this.sprite.isAnimated = true;
    }
    killCount = 0;
    health = 20;
    bullets = new Set();
    Shoot(enemies) {
        let newBul = new Bullet(this, enemies);
        this.bullets.add(newBul);
        newBul.DeleteFrom.add(this.bullets);
        newBul.sprite.SetSrc("./assets/bullet.png");
        newBul.sprite.size.w = 20;
        newBul.sprite.size.h = 10;
        return newBul;
    };
}
class Bullet extends GameObject {
    // parentIsPlayer = false;
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
            console.log("много целей, одно попадание");
                looser.Damage(this.damage);
                this.DeleteMe();
            } else {
                this.Move({x: 0, y: 1});
            }
        }
        
    }
    constructor(parent, targetObj) {
        super();
        if (typeof targetObj[Symbol.iterator] === 'function') {
            this.isOnlyOneTarget = false;
        }
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
    // static countOfEnemies = 0;
    constructor(parent, target) {
        super();
        // Scene.AddNewEnemy(this);
        this.sprite.SetSrc("./assets/enemy.png");
        this.sprite.size = {w: 40, h: 40};
        this.position = {... parent.position};
        this.angle = parent.angle;
        this.speed = 0.5;
        this.target = target;
        this.parentObject = parent;
        // EnemyBasic.countOfEnemies += 1;
        // this.onDestroy.add(() => { EnemyBasic.countOfEnemies -= 1;});
    }
    LifeInCell() {
        if (this.position.x > Scene.size.dx*1.5 || this.position.x < -Scene.size.dx*0.5 ||
            this.position.y > Scene.size.dy*1.5 || this.position.y < -Scene.size.dy*0.5
        ) {
            this.DeleteMe();
        }
    }
    Shoot() {
        let newBul = new Bullet(this, this.target);
        newBul.sprite.SetSrc("./assets/enemy_bullet.png");
        newBul.sprite.size.w = 20;
        newBul.sprite.size.h = 10;
        console.log("Обычный стреляет");
        
        return newBul;
    }
    bullets = new Set();
    AI() {
        this.randomizedNum += Math.floor(Math.random()*10);
            if (this.randomizedNum > 500) { // начало движения вниз
                this.RotateTo(this.target.position);
                this.Move({x: 0,
                            y: 1 * this.speed
                });
                if (this.randomizedNum > 700) { // сброс движения
                    this.dir = -this.dir;
                    this.randomizedNum = 0;
                    let newBul = this.Shoot();
                    this.bullets.add(newBul);
                    newBul.DeleteFrom.add(this.bullets);
                    /* Mover.Update.add(() => {
                        for(let bullet of this.bullets) {
                            bullet.AI();
                        }
                    }); */
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
        // Scene.AddNewEnemyAdvanced(this);
        this.sprite.SetSrc("./assets/enemy_Advanced.png");
        this.sprite.size = {w: 50, h: 50};
        this.size = {dx: 1.2, dy: 1.2};
        this.speed = 0.8;
        this.position = {... parent.position};
        this.angle = parent.angle;
        this.target = target;
        // EnemyBasic.countOfEnemies += 1;
        // this.onDestroy.add(() => { EnemyBasic.countOfEnemies -= 1;});
    }
    LifeInCell() {
        if (this.position.x > Scene.size.dx*1.5 || this.position.x < -Scene.size.dx*0.5 ||
            this.position.y > Scene.size.dy*1.5 || this.position.y < -Scene.size.dy*0.5
        ) {
            this.DeleteMe();
        }
    }
    Shoot() {
        let newBul = new Bullet(this, this.target);
        newBul.sprite.SetSrc("./assets/enemy_bullet.png");
        newBul.sprite.size.w = 20;
        newBul.sprite.size.h = 10;
        return newBul;
    }
    bullets = new Set();
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
                    /* Mover.Update.add(() => {
                        for(let bullet of this.bullets) {
                            bullet.AI();
                        }  
                    }); */
                } else if (this.distanceFlag == -1 && disToPlayer > 40) {
                    this.distanceFlag = 1;
                    this.dir = -this.dir;
                    this.randomizedNum = 0;
                    let newBull = this.Shoot();
                    this.bullets.add(newBull);
                    newBull.DeleteFrom.add(this.bullets);
                    /* Mover.Update.add(() => {
                        newBull.AI();   
                    }); */
                } else if (this.randomizedNum > 900) { // сброс движения
                    this.distanceFlag = 1;
                    this.dir = -this.dir;
                    this.randomizedNum = 0;
                    let newBull = this.Shoot();
                    this.bullets.add(newBull);
                    newBull.DeleteFrom.add(this.bullets);
                    /* Mover.Update.add(() => {
                        newBull.AI();   
                    }); */
                }
                // разкоменть чтобы весело
                /* let newBull = this.Shoot();
                Mover.Update.add(() => {
                    newBull.AI();
                }) */
            } else {
                this.RotateTo(this.target.position);
                this.Move({x: this.dir * this.speed,
                            y: 0
                });
            }
            this.LifeInCell();
    }
}
/* class AI {
    EnemyBullets = new Set();
    PlayerBullets = new Set();
    AddNewBullet(bullet, isPlayerOwner) {
        if (isPlayerOwner) {
            this.PlayerBullets.add(bullet);
            bullet.DeleteFrom.add(this.PlayerBullets);
        } else {
            this.EnemyBullets.add(bullet);
            bullet.DeleteFrom.add(this.EnemyBullets);
        }
    }
    constructor() {
        InputsManager.AddSpawner.add(() => {
            new Spawner().position = {... Scene.player.position};
        })
    }
    static MoveNPC() {
        for (let bullet of this.EnemyBullets) {
            if (CollisionSystem.checkCollision(bullet, Scene.player)) {
                console.log("Игрок получил урон!");
                Scene.player.Damage(bullet.damage)
                bullet.DeleteMe();
            } else {
                bullet.Move({x: 0, y: 1});
            }
        }
        for (let bullet of this.PlayerBullets) {
            let loser = CollisionSystem.findFirstCollision(bullet, Scene.enemies);
            if (loser != undefined) {
                console.log("Противник получил урон!");
                loser.Damage(bullet.damage);
                bullet.DeleteMe();
            }
            loser = CollisionSystem.findFirstCollision(bullet, Scene.enemies_advanced);
            if (loser != undefined) {
                console.log("Противник получил урон!");
                loser.Damage(bullet.damage);
                bullet.DeleteMe();
            }
            bullet.Move({x: 0, y: 1});
            bullet.LiveInTime();
        }
        for (let enemy of Scene.enemies) {
            enemy.randomizedNum += Math.floor(Math.random()*10);
            if (enemy.randomizedNum > 500) { // начало движения вниз
                enemy.RotateTo(Scene.player.position);
                enemy.Move({x: 0,
                            y: 1 * enemy.speed
                });
                if (enemy.randomizedNum > 700) { // сброс движения
                    enemy.dir = -enemy.dir;
                    enemy.randomizedNum = 0;
                    enemy.Shoot();
                }
            } else {
                enemy.RotateTo(Scene.player.position);
                enemy.Move({x: enemy.dir * enemy.speed,
                            y: 0
                });
            }
            enemy.LifeInCell();
        }
        for (let enemy of Scene.enemies_advanced) {
            enemy.randomizedNum += Math.floor(Math.random()*10);
            if (enemy.randomizedNum > 700) { // начало движения вниз
                enemy.RotateTo(Scene.player.position);
                enemy.Move({x: 0,
                            y: 1 * enemy.speed * enemy.distanceFlag
                    });
                const disToPlayer = enemy.DistanceTo(Scene.player.position);
                if (enemy.distanceFlag == 1 && disToPlayer < 10) {
                    enemy.distanceFlag = -1;
                    enemy.dir = -enemy.dir;
                    enemy.randomizedNum = 0;
                    enemy.Shoot();
                } else if (enemy.distanceFlag == -1 && disToPlayer > 40) {
                    enemy.distanceFlag = 1;
                    enemy.dir = -enemy.dir;
                    enemy.randomizedNum = 0;
                    enemy.Shoot();
                }
                
                if (enemy.randomizedNum > 900) { // сброс движения
                    enemy.dir = -enemy.dir;
                    enemy.randomizedNum = 0;
                    enemy.Shoot();
                }
            } else {
                enemy.RotateTo(Scene.player.position);
                enemy.Move({x: enemy.dir * enemy.speed,
                            y: 0
                });
            }
            enemy.LifeInCell();
        }
    }
} */
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
    size = {w: 200, h: 200};

    isAnimated = false;
    spacing = {dx: 0, dy: 0};
    sizeOfOneSprite = {w: 32, h: 32};

    countRows = 0;
    countColumns = 0;
    // countSprites = 0;

    currentRow = 0;
    currentColumn = -1;
    // currentSprite = -1;

    timeBetweenFrames = 0;
    MaxTimeBetweenFrames = 10;
    parentObject;
    angle;
    GetSprite() {
        const screenX = this.parentObject.position.x * GraphicService.canvas.width/Scene.size.dx;
        const screenY = this.parentObject.position.y * GraphicService.canvas.height/Scene.size.dy;
        if(this.isAnimated) {
            this.NextSprite();
            return [ this.img,
                this.sizeOfOneSprite.w * this.currentColumn + this.spacing.dx * this.currentColumn,
                this.sizeOfOneSprite.h * this.currentRow + this.spacing.dy * this.currentRow,
                this.sizeOfOneSprite.w, this.sizeOfOneSprite.h, // срез
                screenX + this.position.x, // xCenter в пикселях
                screenY + this.position.y, // yCenter в пикселях
                this.size.w, this.size.h, this.parentObject.angle ]; // width, height, angle
        } else {
            return [ this.img, 0, 0, this.img.width, this.img.height, // срез
                screenX + this.position.x, // xCenter в пикселях
                screenY + this.position.y, // yCenter в пикселях
                this.size.w, this.size.h, this.parentObject.angle]; // width, height, angle
        }
    }
    NextSprite() {
        if (this.timeBetweenFrames > 0) {
            this.timeBetweenFrames -= 1;
            return;
        } else {
            // console.log("номер столбца", this.currentColumn);
            
            if (this.currentColumn + 1 >= this.countColumns) {
                this.currentColumn = 0;
            } else {
                this.currentColumn += 1;
            }
            this.timeBetweenFrames = this.MaxTimeBetweenFrames;
        }
        
    }
    SetRowAbsolute(num) {
        if (num > -1 && num < this.countRows) {
            this.countRows = num;
        } else {
            console.error("Не могу найти такую анимацию (строку анимации)");
            
        }
    }
    SetSrc(src) {
        this.img = new Image();
        this.img.src = src;
        GraphicService.sprites.add(this);
    }
    constructor (parent) {
        this.parentObject = parent;
        this.timeBetweenFrames = this.MaxTimeBetweenFrames;
    }
}
class GraphicService {
    static sprites = new Set();
    static texts = new Set();
    static canvas = document.getElementById("canv");
    static ctx = this.canvas.getContext("2d");
    constructor() {
        GraphicService.canvas.width = window.innerWidth;
        GraphicService.canvas.height = window.innerHeight;
        window.addEventListener("resize", () => {
            GraphicService.canvas.width = window.innerWidth;
        GraphicService.canvas.height = window.innerHeight;
        })
    }
    static FromPixelToWord(pos) {
        return {x: pos.x * Scene.size.dx/GraphicService.canvas.width,
                y: pos.y * Scene.size.dy/GraphicService.canvas.height
        }
    }
    /* AddNewGraphicObj(obj, type) {
        if (type == "sprite") {
            this.sprites.add(obj);
            obj.DeleteFrom(this.sprites);
        } else if( type == "text")
        {
            this.texts.add(obj);
            obj.DeleteFrom(this.texts);
        } else {
            console.error("Неверный тип графического объекта");
        }
    } */
    AnimationLoop() {
        GraphicService.ctx.clearRect(0, 0, GraphicService.canvas.width, GraphicService.canvas.height);
        for (const sprite of GraphicService.sprites)
        {
            const [img, sx, sy, sW, sH, xCenter, yCenter, width, height, angle] = sprite.GetSprite();
                // Отладочный вывод
            /* console.log("Угол поворота:", angle, "градусов");
            console.log("Центр:", xCenter, yCenter); */
            GraphicService.ctx.save();
            GraphicService.ctx.translate(xCenter, yCenter);
            GraphicService.ctx.rotate(angle * Math.PI / 180);

            GraphicService.ctx.drawImage(img, sx, sy, sW, sH, -width/2, - height/2, width, height);
            GraphicService.ctx.restore();
            
        }
        for (const textSprite of GraphicService.texts) {
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
    Spawn(target, isAdvanced) {
        let newEnemy = isAdvanced? new EnemyAdvanced(this, target): new EnemyBasic(this, target);
        /* this.countOfEnemies += 1;
        newEnemy.onDestroy.add(() => {
            this.countOfEnemies--;
        }); */
        return newEnemy;
    }
    // countOfEnemies = 0;
    constructor() {
        super();
        /* InputsManager.OnStartWave.add(() => {
            this.Spawn(Scene.player.position);
        }) */
        this.sprite.SetSrc("./assets/spawner.png");
        this.sprite.size = {w: 40, h: 40};
        // Scene.spawners.add(this);
        return this;
    }
}
class RandomizeSpawner extends GameObject {
    position = {x: Scene.size.dx/2, y: Scene.size.dy/2};
    countOfSpawners = 0;
    countOfEnemies = 0;
    allEnemies = new Set();
    TimeBetweenWaves = 0;
    MaxTimeBetweenWaves = 500;
    // spawners
    onStartWave = new Set();
    spawners = new Set();
    IncreaseSpawnersCount(count = 1) {
        this.countOfSpawners = Math.max(Math.min(12, this.countOfSpawners + count), 1);
    }
    UpdateSpawners() {
        this.IncreaseSpawnersCount();
        for (let spawner of this.spawners) {
            spawner.DeleteMe();
        }
        let possiblePos = [];
        for (let i = 1; i < 13; i++) {
            possiblePos.push(i);
        }
        for (let i = 0; i < this.countOfSpawners; i++) {
            
            let newSpawner = new Spawner();
            this.spawners.add(newSpawner);
            newSpawner.DeleteFrom.add(this.spawners);

            let randomNum = Math.floor(Math.random()* possiblePos.length);
            const currentPos = possiblePos.splice(randomNum, 1)[0];
            let currentPosRad = (2* Math.PI) / 12 * currentPos;
                     
            newSpawner.position.x = 40*Math.cos(currentPosRad) + Scene.size.dx/2;
            newSpawner.position.y = 40*Math.sin(currentPosRad) + Scene.size.dy/2;
        }
    }
    target;
    StartWave() {
        for(const spawner of this.spawners) {
            let newEnemy = spawner.Spawn(this.target, Math.floor(Math.random()*10/3) == 3); // 1 к 4
            this.countOfEnemies++;
            this.allEnemies.add(newEnemy);
            newEnemy.DeleteFrom.add(this.allEnemies);
            /* newEnemy.onDestroy.add(() => {
                if (this.countOfEnemies <= 0) {
                    this.TimeBetweenWaves = this.MaxTimeBetweenWaves;
                    console.log("Время между волнами");
                    // Mover.Update.add(this.UpdaterTimer);
                }
            }); */
        }
        for (const func of this.onStartWave) {
            func();
        }
    }
    // UpdaterTimer = () => {this.Timer();};
    Timer() {
        if (this.allEnemies.size > 0) {
            return;
        } 
        if(this.TimeBetweenWaves > 0) {
            this.TimeBetweenWaves--;
            if (this.TimeBetweenWaves == this.MaxTimeBetweenWaves / 2) {
                
                this.UpdateSpawners();
            }
            return;
        }
        if (this.TimeBetweenWaves <= 0) {
            this.TimeBetweenWaves = this.MaxTimeBetweenWaves;
            // TimeMachine.Update.delete(this.UpdaterTimer);
            this.StartWave();
        }
    }
    constructor() {
        super();
        this.TimeBetweenWaves = this.MaxTimeBetweenWaves;
        /* InputsManager.UpdateSpawnersRandomizer.add(() => {
            this.UpdateSpawners();
        });
        InputsManager.OnStartWave.add(() => {
            this.StartWave();
        }); */
        
    }
}
class TextUI extends GameObject{
    constructor () {
        super();
        this.texts = new Array();
        // Scene.ui.add(this);
    }
    
}
class TextController {
    position = {x: 0, y: 0};
    text = "Hello word!";
    size = 40;
    color = "black";
    font = "Roboto";
    constructor(parent) {
        this.parentObject = parent;
        GraphicService.texts.add(this);
    }
    GetText() {
        return [this.text,
            this.parentObject.position.x * GraphicService.canvas.width/Scene.size.dx + this.position.x,
            this.parentObject.position.y * GraphicService.canvas.height/Scene.size.dy + this.position.y,
            this.color, this.size + "px", this.font, this.parentObject.angle];
    }
}
class Button extends GameObject {
    onClick = new Set();
    TryInit(WordPos) {
        if (CollisionSystem.isPointInObject(this, WordPos)) {
            for(const func of this.onClick) {
                func();
            }
        }
    }
}