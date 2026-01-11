let nScene = new Scene();
let Tm = new TimeMachine();
let Im = new InputsManager();
let Ai = new AI();
let Cs = new CollisionSystem();
let Gs = new GraphicService();
Im.debugBtn.add(() => {Tm.Toggle();});
Im.Setup();

nScene.player = new Player();
nScene.player.onDestroy.add(() => {Tm.Toggle();});
let WelcomeText = new TextUI();
WelcomeText.position = {x: 50, y: 50};
WelcomeText.angle = 0;
WelcomeText.texts.push(new TextController(WelcomeText));
WelcomeText.texts[0].text = "ЛКМ - выстрел";
WelcomeText.texts[0].size = 100;
WelcomeText.texts[0].color = "white";
WelcomeText.texts[0].position.y = 30;
WelcomeText.texts.push(new TextController(WelcomeText));
WelcomeText.texts[1].text = "wasd - движение";
WelcomeText.texts[1].size = 100;
WelcomeText.texts[1].color = "white";
WelcomeText.texts[1].position.y = 100;
InputsManager.AnyButton.add(() => {
    WelcomeText.DeleteMe();
})

nScene.player.onDestroy.add(() => {
    let EndGameMenu = new TextUI();
    EndGameMenu.position = {x: 50, y: 50};
    EndGameMenu.angle = 0;
    EndGameMenu.texts.push(new TextController(EndGameMenu));
    EndGameMenu.texts[0].text = "Game Over";
    EndGameMenu.texts[0].size = 100;
    EndGameMenu.texts[0].color = "red";
    InputsManager.AnyButton.add(() => {
        window.location.reload();
    });
});
new Spawner().position = {x: 50, y: 10};

let HealthBar = new TextUI();
HealthBar.texts.push(new TextController(HealthBar));
HealthBar.texts[0].text = "Health";
HealthBar.texts[0].size = 50;
HealthBar.texts[0].color = "red";
HealthBar.texts[0].position.x = -75; // к сожалению в пикселях
HealthBar.texts.push(new TextController(HealthBar));
nScene.player.onDamage.add(() => {
    HealthBar.texts[1].text = nScene.player.health;});
HealthBar.texts[1].text = nScene.player.health;
HealthBar.texts[1].size = 50;
HealthBar.texts[1].color = "red";
HealthBar.texts[1].position.x = 75; // к сожалению в пикселях
HealthBar.position = {x: 20, y: 10};
HealthBar.angle = 0;

let CounterBar = new TextUI();
CounterBar.texts.push(new TextController(CounterBar));
CounterBar.texts[0].text = "Count";
CounterBar.texts[0].size = 45;
CounterBar.texts[0].color = "green";
CounterBar.texts[0].position.x = -75; // к сожалению в пикселях
CounterBar.texts.push(new TextController(CounterBar));
Scene.OnCreateEnemy.add((enemy) => {
    enemy.onDestroy.add(() => {
        nScene.player.killCount++;
        CounterBar.texts[1].text = nScene.player.killCount;
    });
});
Scene.OnCreateEnemyAdvanced.add((enemy) => {
    enemy.onDestroy.add(() => {
        nScene.player.killCount += 2;
        CounterBar.texts[1].text = nScene.player.killCount;
    });
});
CounterBar.texts[1].text = nScene.player.killCount;
CounterBar.texts[1].size = 45;
CounterBar.texts[1].color = "green";
CounterBar.texts[1].position.x = 75; // к сожалению в пикселях
CounterBar.position = {x: 80, y: 10};
CounterBar.angle = 0;


let Rs = new RandomizeSpawner();
let Starter = () => {
    Rs.StartWave();
    InputsManager.AnyButton.delete(Starter);
};
InputsManager.AnyButton.add(Starter);
// Показалось, что столкновения считаются не правильно
/* Rs.onStartWave.add(() => {
    for (const enemy of Scene.enemies) {
        enemy.onDestroy.add(() => {
            Im.InitDebugButton();
        });
    }
}); */

Tm.Toggle();
Tm.MainLoop();
