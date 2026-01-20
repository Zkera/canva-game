let gameScene = new Scene();
gameScene.Setup = () => {
    let Tm = gameScene.Tm;
    let Im = gameScene.Im;
    let Gs = gameScene.Gs;
    let Rs = gameScene.Rs;
    gameScene.BaseSetup();
    Im.pauseButton.add(() => {
        gameScene.Stop();
        pauseMenu.Start();
    });
    gameScene.background = gameScene.AddSymbol("./assets/background.png");
    gameScene.background.sprite.isHidden = true;
    // настройка игрока
    gameScene.player = new Player();
    gameScene.player.onDestroy.add(() => {Tm.TurnOff();});
    Gs.AddNewSprite(gameScene.player.sprite);
    Im.MouseDepended.add((pos) => {gameScene.player.RotateTo(pos);});
    Im.Controlled.add((move, dir) => {
        if (move.y != 0) {
            gameScene.player.sprite.SetRowAbs(1);
        } else {
            gameScene.player.sprite.SetRowAbs(0);

        }
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
    Rs.onStartWaveForEveryone.add((enemy) => {
        // для каждого врага
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
            enemy.onDestroy.add(() => {
                if (Math.floor(Math.random()*10%3) == 0) {
                    let aid = new Healer(enemy);
                    aid.target = enemy.target;
                    Gs.AddNewSprite(aid.sprite);
                    Tm.Update.add(() => {
                        return aid.AI();
                    });
                }
            })
            Gs.AddNewSprite(enemy.sprite);
    });
    
    Rs.beforeWave.add(() => {
        for(const spawner of Rs.spawners) {
            Gs.AddNewSprite(spawner.sprite);
        }
    });
    Im.AnyButton.add(() => {
        /* Rs.UpdateSpawners();
        Rs.StartWave(); */
        Tm.Update.add(() => {
            Rs.Timer();
        });
        return "stop";
    });
    Tm.Update.add(() => {
        for(const enemy of Rs.allEnemies) {
            enemy.AI();
        }
    });

    //WIP
    Rs.beforeWave.add(() => {
        for(const spawner of Rs.spawners) {
            if (optionsMenu.WIP) {
                spawner.sprite.SwitchImg();
            }
        }
    });
     Rs.afterStartWave.add(() => {
        for(const enemy of Rs.allEnemies) {
            if (enemy.constructor.name == "EnemyBasic" && optionsMenu.WIP) {
                enemy.sprite.SwitchImg();
            }
        }
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

    Rs.onStartWaveForEveryone.add((enemy) => {
        enemy.onDestroy.add(() => {
                if (gameScene.player.cheatOn) {
                    CounterBar.texts[1].text = "Читы";
                    CounterBar.texts[1].color = "red";

                    return;
                }
                CounterBar.texts[1].color = "green";
                gameScene.player.killCount += enemy.price;
                CounterBar.texts[1].text = gameScene.player.killCount;
            });
            Im.KillAll.add(() => {
                enemy.Damage(99);
                return "stop";
            });
    });
    let TimerWave = new TextUI();
    TimerWave.texts.push(new TextController(TimerWave));
    TimerWave.texts[0].size = 10;
    TimerWave.texts[0].color = "white";
    TimerWave.position.y = 10;
    TimerWave.angle = 0;
    Tm.Update.add(() => {
        TimerWave.texts[0].text = Rs.TimeBetweenWaves;
    })
    Gs.AddNewTextUI(TimerWave);
    // TimerWave.position.x = Scene.center.y;
}
/* 
gameScene.Stop();
 */
// mainMenu.Setup();
mainMenu.Start();
window.onbeforeunload = () => {
    /* if (gameScene.isConfigured) {
        
    }
    let t = JSON.stringify(gameScene);
    console.log(t);
    localStorage.setItem("game", t); */
}
window.onload = () => {
    /* let oldData = JSON.parse(localStorage.getItem("game"));
    if (oldData != null) {
        gameScene = oldData;
    } */
}
/* 
mainMenuScene.Stop();
gameScene.Setup();
gameScene.Start(); 
*/