let gameScene = new Scene();
gameScene.Setup = () => {
    let Tm = gameScene.Tm;
    let Im = gameScene.Im;
    let Cs = gameScene.Cs;
    let Gs = gameScene.Gs;
    let Rs = gameScene.Rs;
    // настройка импутов
    Im.debugBtn.add(() => {Tm.Toggle();});
    Im.Setup();
    Tm.IndependentUpdate.add(() => {
        Gs.AnimationLoop();
    });
    Tm.Update.add(() => {
        if (Im.MoveDirection.x != 0 || Im.MoveDirection.y != 0) {
            Im.InitMoving(Im.GetMoveVector(), Im.MousePos);
        }
    });

    // настройка игрока
    gameScene.player = new Player();
    gameScene.player.onDestroy.add(() => {Tm.Toggle();});
    Gs.AddNewSprite(gameScene.player.sprite);
    Im.MouseDepended.add((pos) => {gameScene.player.RotateTo(pos);});
    Im.Controlled.add((move, dir) => {
        gameScene.player.RotateTo(dir);
        gameScene.player.Move(move);
    });
    Im.GodMod.add(() => {
        gameScene.player.Damage = () => {};
    });
    Im.OnClick.add(() => {
        Gs.AddNewSprite(gameScene.player.Shoot(Rs.allEnemies).sprite);
    });
    Tm.Update.add(() => {
        for(let bullet of gameScene.player.bullets) {
            bullet.AI();
        }
    });

    // настройка врагов 
    Rs.target = gameScene.player;
    // при запуске волны
    Rs.onStartWave.add(() => {
        // для каждого врага
        for(const enemy of Rs.allEnemies) {
            //  при его выстреле
            enemy.onShoot.add((bullet) => {
                // добавляем спрайт пули
                // в список отрисовки
                Gs.AddNewSprite(bullet.sprite);
                // добавляем в очередь обновления 
                // положение (передвижение) пули
                Tm.Update.add(()=> {
                    if (bullet.isDead) {
                        // тк в update храниться ссылка на пулю
                        // нужно удалить пулю из списка обновлений
                        // чтобы полностью её удалить
                        return "stop";
                    }
                    bullet.AI();
                });
            })

            Gs.AddNewSprite(enemy.sprite);
        }
    });
    Tm.Update.add(() => {
        for(const enemy of Rs.allEnemies) {
            enemy.AI();
        }
    });
    Rs.beforeWave.add(() => {
        for(const spawner of Rs.spawners) {
            Gs.AddNewSprite(spawner.sprite);
        }
    });
    Im.AnyButton.add(() => {
        Rs.UpdateSpawners();
        Rs.StartWave();
        Tm.Update.add(() => {
            Rs.Timer();
        });
        console.log("1");
        
        return "stop";
    });
    // настройка интерфейса
    let WelcomeText = new TextUI();
    // WelcomeText.position = {x: 50, y: 50};
    WelcomeText.angle = 0;
    WelcomeText.texts.push(new TextController(WelcomeText));
    WelcomeText.texts[0].text = "ЛКМ - выстрел";
    WelcomeText.texts[0].size = 10;
    WelcomeText.texts[0].color = "white";
    WelcomeText.texts[0].position.y = 3;
    WelcomeText.texts.push(new TextController(WelcomeText));
    WelcomeText.texts[1].text = "wasd - движение";
    WelcomeText.texts[1].size = 10;
    WelcomeText.texts[1].color = "white";
    WelcomeText.texts[1].position.y = 10;
    Gs.AddNewTextUI(WelcomeText);
    Im.AnyButton.add(() => {
        WelcomeText.DeleteMe();
        return "stop";
    })

    gameScene.player.onDestroy.add(() => {
        let EndGameMenu = new TextUI();
        // EndGameMenu.position = {x: 50, y: 50};
        EndGameMenu.angle = 0;
        EndGameMenu.texts.push(new TextController(EndGameMenu));
        EndGameMenu.texts[0].text = "Game Over";
        EndGameMenu.texts[0].size = 30;
        EndGameMenu.texts[0].color = "red";
        Gs.AddNewTextUI(EndGameMenu);
        Im.AnyButton.add(() => {
            window.location.reload();
        });
    });

    let HealthBar = new TextUI();
    HealthBar.texts.push(new TextController(HealthBar));
    HealthBar.texts[0].text = "Health";
    HealthBar.texts[0].size = 10;
    HealthBar.texts[0].color = "red";
    HealthBar.texts[0].position.x = -5;
    HealthBar.texts.push(new TextController(HealthBar));
    gameScene.player.onDamage.add(() => {
        HealthBar.texts[1].text = gameScene.player.health;});
    HealthBar.texts[1].text = gameScene.player.health;
    HealthBar.texts[1].size = 10;
    HealthBar.texts[1].color = "red";
    HealthBar.texts[1].position.x = 5;
    HealthBar.position = {x: 20, y: 10};
    HealthBar.angle = 0;
    Gs.AddNewTextUI(HealthBar);

    let CounterBar = new TextUI();
    CounterBar.texts.push(new TextController(CounterBar));
    CounterBar.texts[0].text = "Count";
    CounterBar.texts[0].size = 10;
    CounterBar.texts[0].color = "green";
    CounterBar.texts[0].position.x = -5;
    CounterBar.texts.push(new TextController(CounterBar));

    CounterBar.texts[1].text = gameScene.player.killCount;
    CounterBar.texts[1].size = 10;
    CounterBar.texts[1].color = "green";
    CounterBar.texts[1].position.x = 5;
    CounterBar.position = {x: 145, y: 10};
    CounterBar.angle = 0;
    Gs.AddNewTextUI(CounterBar);

    Rs.onStartWave.add(() => {
        for(let enemy of Rs.allEnemies) {
            enemy.onDestroy.add(() => {
                gameScene.player.killCount += enemy.price;
                CounterBar.texts[1].text = gameScene.player.killCount;
            });
        }
    });
}
/* 
gameScene.Stop();
 */
mainMenuScene.Setup();
mainMenuScene.Start();
/* 
mainMenuScene.Stop();
gameScene.Setup();
gameScene.Start(); 
*/