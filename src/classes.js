class Scene {
    static player;
    static enemies = new Set();
    static enemies_advanced = new Set();
    static spawners = new Set();
    static size = {dx: 100, dy: 100};
    static ui = new Set();
    static OnCreateEnemy = new Set();
    static OnCreateEnemyAdvanced = new Set();
    static AddNewEnemy(enemy) {
        Scene.enemies.add(enemy);
        for(const func of Scene.OnCreateEnemy) {
            func(enemy);
        }
    }
    static AddNewEnemyAdvanced(enemy) {
        Scene.enemies_advanced.add(enemy);
        for(const func of Scene.OnCreateEnemyAdvanced) {
            func(enemy);
        }
    }
}
class TimeMachine{
    isPlaying = false;
    static Update = new Set();
    static ControlledActive = new Set();
    Toggle() {
        this.isPlaying = !this.isPlaying;
        /* if (this.isPlaying) {
            this.MainLoop()
        } */
    }
    MainLoop() {
        if (this.isPlaying) {
            for (let toMove of TimeMachine.ControlledActive) {
                toMove();
            }
            AI.MoveNPC();
            for (const func of TimeMachine.Update) {
                func();
            }
        }
        
        GraphicService.AnimationLoop();
        
        window.requestAnimationFrame(() => {this.MainLoop();});

    }
}
class InputsManager {
    static MoveDirection = {x: 0, y: 0};
    static Controlled = new Set();
    static MouseDepended = new Set();
    static MousePos = {x: 0, y: 0};
    static OnClick = new Set();
    static OnStartWave = new Set();
    static AddSpawner = new Set();
    static AnyButton = new Set();
    static UpdateSpawnersRandomizer = new Set();
    static GodMod = new Set();
    debugBtn = new Set();
    InitDebugButton() {
        for(let func of this.debugBtn) {
                    func();
        }
    }
    static GetMoveVector() {
        let norm = {x: 0, y: 0};
        if (InputsManager.MoveDirection.x != 0 || InputsManager.MoveDirection.y != 0) {
            norm.x = InputsManager.MoveDirection.x / ((InputsManager.MoveDirection.x)**2 + (InputsManager.MoveDirection.y)**2)**0.5;
            norm.y = InputsManager.MoveDirection.y / ((InputsManager.MoveDirection.x)**2 + (InputsManager.MoveDirection.y)**2)**0.5;
        }
        return norm;
    }
    Setup() {
        window.addEventListener("keydown", (e) => {
            if (e.key == "w")        {InputsManager.MoveDirection.y = 1}
            else if (e.key == "s")   {InputsManager.MoveDirection.y = -1}
            if (e.key == "d")        {InputsManager.MoveDirection.x = 1}
            else if (e.key == "a")   {InputsManager.MoveDirection.x = -1}
            if (InputsManager.MoveDirection.x != 0 || InputsManager.MoveDirection.y != 0) {
                TimeMachine.ControlledActive = InputsManager.Controlled;
            }
            if (e.key == "F2") {
                this.InitDebugButton();
            }
            if (e.key == "`") {
                for(let func of InputsManager.GodMod) {
                    func();
                }
            }
            if (e.key == "e") {
                for(let func of InputsManager.OnStartWave) {
                    func();
                }
            }
            if (e.key == "f") {
                for(let func of InputsManager.UpdateSpawnersRandomizer) {
                    func();
                }
            }
            if (e.key == "t") {
                for(let func of InputsManager.AddSpawner) {
                    func();
                }
            }
            if (e.key == "Escape") {
                // window.location.reload();
                this.InitDebugButton();
                
            }
            
            for(let func of InputsManager.AnyButton) {
                func();
            }
            console.log("нажата", e.key);
            
        });
        window.addEventListener("keyup", (e) => {
            if (e.key == "w" && InputsManager.MoveDirection.y == 1)    {InputsManager.MoveDirection.y = 0}
            if (e.key == "s" && InputsManager.MoveDirection.y == -1)    {InputsManager.MoveDirection.y = 0}
            // if (e.key == "d" && InputsManager.MoveDirection.x == 1)    {InputsManager.MoveDirection.x = 0}
            // if (e.key == "a" && InputsManager.MoveDirection.x == -1)    {InputsManager.MoveDirection.x = 0}
            if (InputsManager.MoveDirection.x == 0 && InputsManager.MoveDirection.y == 0) {
                TimeMachine.ControlledActive = new Set();
                
            }
        });
        window.addEventListener("mousemove", (e) => {
            let screenToWord = {x: e.clientX * Scene.size.dx/ GraphicService.canvas.width,
                y: e.clientY * Scene.size.dy/ GraphicService.canvas.height};
            InputsManager.MousePos = screenToWord;
            for (let func of InputsManager.MouseDepended) {
                func();
            }
        });
        window.addEventListener("mousedown", (e) => {
            for (let func of InputsManager.OnClick) {
                func();
            }
            for(let func of InputsManager.AnyButton) {
                func();
            }
        });
    }
}
class Object {
    sprite;
    angle = 270 // вертикально вверх
    position = {x: 50, y: 50};
    size = {dx: 1, dy: 1};
    speed = 0.1;
    onDamage = new Set();
    onDestroy = new Set();
    Move(dir /* dir = {x: 0, y: 1} */) {
        const angleRad = this.angle * Math.PI / 180;
        
        const moveY = (Math.cos(angleRad) * dir.x + Math.sin(angleRad) * dir.y) * this.speed;
        const moveX = (-Math.sin(angleRad) * dir.x + Math.cos(angleRad) * dir.y) * this.speed;
        
        this.position.x += moveX;
        this.position.y += moveY;
        
        /* console.log("сдвинулся", {
            x: Math.round(this.position.x * 100000) / 100000,
            y: Math.round(this.position.y * 100000) / 100000
        }); */
    }
    Rotate(an) {
        if (an+this.angle > 360) {
            this.angle = an+this.angle - 360;
        } else if (an+this.angle < 0) {
            this.angle = an+this.angle + 360;
        } else {
            this.angle = an+this.angle;
        }
        console.log("новый угол", this.angle);
        
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
        Scene.enemies.delete(this);
        Scene.enemies_advanced.delete(this);
        Scene.spawners.delete(this);
        AI.PlayerBullets.delete(this);
        AI.EnemyBullets.delete(this);
        GraphicService.sprites.delete(this.sprite);
        if (this.texts != undefined) {
            for (let text of this.texts) {
            GraphicService.texts.delete(text);
        }
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
class Player extends Object{
    constructor() {
        super();
        Scene.player = this;
        this.sprite.SetSrc("./assets/player.png");
        this.sprite.size = {w: 40, h: 40};
        this.speed = 0.2;
        InputsManager.MouseDepended.add(() => { this.RotateTo(InputsManager.MousePos);});
        InputsManager.Controlled.add(() => {
            
            this.RotateTo(InputsManager.MousePos);
            this.Move(InputsManager.GetMoveVector());
        });
        InputsManager.OnClick.add(() => {
            this.Shoot();
        });
        InputsManager.GodMod.add(() => {
            this.Damage = () => {};
        });
    }
    killCount = 0;
    health = 20;
    Shoot() {
        let newBul = new Bullet(true);
        newBul.sprite.SetSrc("./assets/bullet.png");
        newBul.sprite.size.w = 20;
        newBul.sprite.size.h = 10;
        newBul.angle = this.angle;
        newBul.position = {... this.position};
    }
}
class Bullet extends Object {
    parentIsPlayer = false;
    damage = 4;
    lifeTime = 250;
    parent;
    speed = 0.5
    LifeOld() {
        this.lifeTime--;
        if (this.lifeTime <= 0) {
            if (this.parentIsPlayer) {
                /* AI.PlayerBullets.delete(this);
                GraphicService.sprites.delete(this.sprite); */
                this.DeleteMe();
                console.log("Удаление пули игрока", this.lifeTime);
            } else {
                console.log("Удаление пули врага", this.lifeTime);
            }
            delete this;
        }
    }
    LiveInTime() {
        this.lifeTime--;
        if (this.lifeTime <= 0) {this.DeleteMe();}
    }
    constructor(parentIsPlayer) {
        super();
        this.parentIsPlayer = parentIsPlayer;
        if (parentIsPlayer) {
            AI.PlayerBullets.add(this);
        } else {
            AI.EnemyBullets.add(this);
        }
    }
}
class EnemyBasic extends Object {
    health = 1;
    randomizedNum = 0;
    dir = 1;
    static countOfEnemies = 0;
    constructor(pos, angle) {
        super();
        Scene.AddNewEnemy(this);
        this.sprite.SetSrc("./assets/enemy.png");
        this.sprite.size = {w: 40, h: 40};
        this.position = pos;
        this.angle = angle;
        this.speed = 0.5;
        EnemyBasic.countOfEnemies += 1;
        this.onDestroy.add(() => { EnemyBasic.countOfEnemies -= 1;});
    }
    LifeInCell() {
        if (this.position.x > Scene.size.dx*1.5 || this.position.x < -Scene.size.dx*0.5 ||
            this.position.y > Scene.size.dy*1.5 || this.position.y < -Scene.size.dy*0.5
        ) {
            this.DeleteMe();
        }
    }
    Shoot() {
        let newBul = new Bullet(false);
        newBul.sprite.SetSrc("./assets/enemy_bullet.png");
        newBul.sprite.size.w = 20;
        newBul.sprite.size.h = 10;
        newBul.angle = this.angle;
        newBul.position = {... this.position};
    }
}
class EnemyAdvanced extends Object {
    health = 8;
    randomizedNum = 0;
    dir = 1;
    distanceFlag = 1;
    static countOfEnemies = 0;
    constructor(pos, angle) {
        super();
        Scene.AddNewEnemyAdvanced(this);
        this.sprite.SetSrc("./assets/enemy_Advanced.png");
        this.sprite.size = {w: 50, h: 50};
        this.size = {dx: 1.2, dy: 1.2};
        this.position = pos;
        this.angle = angle;
        this.speed = 0.8;
        EnemyBasic.countOfEnemies += 1;
        this.onDestroy.add(() => { EnemyBasic.countOfEnemies -= 1;});
    }
    LifeInCell() {
        if (this.position.x > Scene.size.dx*1.5 || this.position.x < -Scene.size.dx*0.5 ||
            this.position.y > Scene.size.dy*1.5 || this.position.y < -Scene.size.dy*0.5
        ) {
            this.DeleteMe();
        }
    }
    Shoot() {
        let newBul = new Bullet(false);
        newBul.sprite.SetSrc("./assets/enemy_bullet.png");
        newBul.sprite.size.w = 20;
        newBul.sprite.size.h = 10;
        newBul.angle = this.angle;
        newBul.position = {... this.position};
    }
}
class RandomizeSpawner extends Object {
    position = {x: Scene.size.dx/2, y: Scene.size.dy/2};
    count = 2;
    TimeBetweenWaves = 0;
    MaxTimeBetweenWaves = 500;
    onStartWave = new Set();
    IncreaseSpawnersCount(count = 1) {
        this.count = Math.max(Math.min(12, this.count + count), 1);
    }
    UpdateSpawners() {
        for (let spawner of Scene.spawners) {
            spawner.DeleteMe();
        }
        let possiblePos = [];
        for (let i = 1; i < 13; i++) {
            possiblePos.push(i);
        }
        for (let i = 0; i < this.count; i++) {
            let newSpawner = new Spawner();
            let randomNum = Math.floor(Math.random()* possiblePos.length);
            let test = possiblePos.splice(randomNum, 1)[0] ;
            let currentPosRad = (2* Math.PI) / 12 * test;
            if (test == undefined) {
                console.log(randomNum, possiblePos);
                
            }            
            newSpawner.position.x = 40*Math.cos(currentPosRad) + Scene.size.dx/2;
            newSpawner.position.y = 40*Math.sin(currentPosRad) + Scene.size.dy/2;
        }
        this.IncreaseSpawnersCount();
    }
    StartWave() {
        for(const spawner of Scene.spawners) {
            let newEnemy = spawner.Spawn(Scene.player.position, Math.floor(Math.random()*10/3) == 3); // 1 к 4
            newEnemy.onDestroy.add(() => {
                if (EnemyBasic.countOfEnemies <= 0) {
                    this.TimeBetweenWaves = this.MaxTimeBetweenWaves;
                    console.log("Время между волнами");
                    TimeMachine.Update.add(this.UpdaterTimer);
                }
            });
        }
        for (const func of this.onStartWave) {
            func();
        }
    }
    UpdaterTimer = () => {this.Timer();};
    Timer() {
        this.TimeBetweenWaves--;
        if (this.TimeBetweenWaves == this.MaxTimeBetweenWaves / 2) {
            this.UpdateSpawners();
        }
        if (this.TimeBetweenWaves <= 0) {
            TimeMachine.Update.delete(this.UpdaterTimer);
            this.StartWave();
        }
    }
    constructor() {
        super();
        InputsManager.UpdateSpawnersRandomizer.add(() => {
            this.UpdateSpawners();
        });
        InputsManager.OnStartWave.add(() => {
            this.StartWave();
        });
        
    }
}
class AI {
    static EnemyBullets = new Set();
    static PlayerBullets = new Set();
    constructor() {
        InputsManager.AddSpawner.add(() => {
            new Spawner().position = {... Scene.player.position};
        })
    }
    static MoveNPC() {
        for (let bullet of AI.EnemyBullets) {
            if (CollisionSystem.checkCollision(bullet, Scene.player)) {
                console.log("Игрок получил урон!");
                Scene.player.Damage(bullet.damage)
                bullet.DeleteMe();
            } else {
                bullet.Move({x: 0, y: 1});

            }
        }
        for (let bullet of AI.PlayerBullets) {
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
    sizeOfOneSprite = 0;
    countRows = 0;
    countColumns = 0;
    countSprites = 0;
    currentSprite = 0;
    parentObject;
    GetSprite() {
        const screenX = this.parentObject.position.x * GraphicService.canvas.width/Scene.size.dx;
        const screenY = this.parentObject.position.y * GraphicService.canvas.height/Scene.size.dy;
        if(this.isAnimated) {

        } else {
            return [ this.img, 0, 0, this.img.width, this.img.height,
                screenX + this.position.x, // xCenter в пикселях
                screenY + this.position.y, // yCenter в пикселях
                this.size.w, this.size.h, this.parentObject.angle]; // width, height, angle
        }
    }
    SetSrc(src) {
        this.img = new Image();
        this.img.src = src;
        GraphicService.sprites.add(this);
    }
    constructor (parent) {
        this.parentObject = parent;
        
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
    static AnimationLoop() {
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
class Spawner extends Object {
    Spawn(targetPos, isAdvanced) {
        let newEnemy = isAdvanced? new EnemyAdvanced(): new EnemyBasic();
        newEnemy.position = {... this.position};
        newEnemy.RotateTo(targetPos);
        return newEnemy;
    }
    constructor() {
        super();
        /* InputsManager.OnStartWave.add(() => {
            this.Spawn(Scene.player.position);
        }) */
        this.sprite.SetSrc("./assets/spawner.png");
        this.sprite.size = {w: 40, h: 40};
        Scene.spawners.add(this);
        return this;
    }
}
class TextUI extends Object{
    constructor () {
        super();
        this.texts = new Array();
        Scene.ui.add(this);
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