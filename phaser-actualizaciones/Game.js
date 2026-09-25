class Game extends Phaser.Scene {
    constructor() {
        super('Game');

        
    }

    create() {
        // Agrega un fondo de imagen a la escena
       this.add.image(400, 300, 'sky');
       // Define un objeto de tipo estático para el piso
       this.platforms = this.physics.add.staticGroup();
       // Define las dimensiones de los bloques 
       this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();
       // Define las posiciones de otros bloques
       this.platforms.create(600, 400, 'ground');
       this.platforms.create(50, 250, 'ground');
       this.platforms.create(750, 220, 'ground');

       // Crea instancias de sonido a ocupar en movimientos del jugador y en el lanzamiento de una bomba
       
       this.sfxFootstep = this.sound.add('footstep', { volume: 0.2, loop: false });
       this.sfxBomby = this.sound.add('bomby', { volume: 0.5, loop: false });
       
       // Agrega un jugador a la escena
       this.player = new Player(this, 100, 450, this.sfxFootstep);
       // Efecto para que el jugador quede parado sobre la plataforma
       this.physics.add.collider(this.player, this.platforms);
       // Definir entradas del teclado para mover al jugador
       this.cursors = this.input.keyboard.createCursorKeys();
        // Crea un grupo de estrellas a ocuparse en la escena
       this.stars = this.physics.add.group(
        {
            key: 'star',
            repeat: 11,
            setXY: {
                x:12,
                y:0,
                stepX:70
            }
        });
        // indica que las estrellas tendrán un pequeño rebote
        // this.stars.children.iterate( child => {
        //     child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        // });

        this.stars.getChildren().forEach(child => {
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        });

        // Indique que las estrellas deben mantenerse sobre los bloques de piso
        this.physics.add.collider(this.stars, this.platforms);
        // Indica que un evento será invocado cuando dos objetos se traslapen/ocupen el mismo espacio
        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);
        // Crea un marcador
        this.score = 0;
        // Agrega el marcado a la pantalla en una posición y color determinado
        this.scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
        // Crea un objeto bomba
        this.bombs = this.physics.add.group();
        // Indica que las bombas deben mantenerse sobre los bloques de piso
        this.physics.add.collider(this.bombs, this.platforms);
        // Indica que un evento será invocado cuando el jugador y una bomba choquen/se toquen
        this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);
    }

    update(time) {
        if(this.cursors.left.isDown)
            this.player.moveLeft();
        else if (this.cursors.right.isDown)
            this.player.moveRight();
        else
            this.player.idle();
        if(this.cursors.up.isDown)
            this.player.jump();
    }

    collectStar(player, star){
        star.disableBody(true, true);
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
        if(this.stars.countActive(true)===0){
            // this.stars.children.iterate(function (child){
            //     child.enableBody(true, child.x, 0, true, true);
            // });
            // this.stars.children.each(function (child) {
            //     child.enableBody(true, child.x, 0, true, true);
            // });
            this.stars.getChildren().forEach(child => {
                child.enableBody(true, child.x, 0, true, true);
            });
            this.releaseBomb();
        }
    }

    hitBomb(player, bomb){
        this.physics.pause();
        player.setTint(0xff0000);
        player.anims.play('turn');
        this.time.delayedCall(2000, () =>{
            this.scene.start('GameOver');
        });
    }

    releaseBomb(){
        // Reproducir el sonido antes de liberar la bomba
        this.sfxBomby.play();
        let x = (this.player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
        let bomb = this.bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }

    
}