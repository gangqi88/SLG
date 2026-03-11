import Phaser from 'phaser';

export class CookingScene extends Phaser.Scene {
  private potIngredients: string[] = [];
  private scoreText!: Phaser.GameObjects.Text;
  private resultText!: Phaser.GameObjects.Text;
  private score: number = 0;
  private ingredients: Phaser.GameObjects.Container[] = [];

  // Recipes definition
  private recipes: { [key: string]: { name: string, score: number } } = {
    'Meat+Spice': { name: 'Steak', score: 20 },
    'Vegetable+Water': { name: 'Soup', score: 10 },
    'Meat+Vegetable': { name: 'Stew', score: 15 },
    'Spice+Water': { name: 'Tea', score: 5 },
  };

  constructor() {
    super('CookingScene');
  }

  create() {
    // Background
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0xe0e0e0).setOrigin(0);
    
    // UI - Score
    this.scoreText = this.add.text(10, 10, 'Score: 0', {
      fontSize: '24px',
      color: '#000',
    });

    // UI - Instructions
    this.add.text(10, 40, 'Drag ingredients to the pot!', {
      fontSize: '16px',
      color: '#333',
    });
    
    // Result Text
    this.resultText = this.add.text(this.scale.width / 2, 150, '', {
        fontSize: '32px',
        color: '#ff0000',
        fontStyle: 'bold'
    }).setOrigin(0.5);

    // Create Pot (Drop Zone)
    this.createPot();

    // Create Ingredients
    this.createIngredient('Meat', 0xff0000, 100, 450);
    this.createIngredient('Spice', 0xffa500, 250, 450);
    this.createIngredient('Vegetable', 0x00ff00, 400, 450);
    this.createIngredient('Water', 0x0000ff, 550, 450);

    // Cook Button
    this.add.text(this.scale.width / 2, 550, 'COOK!', {
      fontSize: '32px',
      color: '#fff',
      backgroundColor: '#d32f2f',
      padding: { x: 20, y: 10 }
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .on('pointerdown', () => this.cook());

    // Exit Button
    this.add.text(this.scale.width - 60, 20, 'Exit', {
        fontSize: '18px',
        color: '#fff',
        backgroundColor: '#333',
        padding: { x: 10, y: 5 }
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .on('pointerdown', () => {
        this.game.events.emit('exitCooking');
    });

    // Clear Pot Button
    this.add.text(this.scale.width / 2, 350, 'Clear', {
        fontSize: '16px',
        color: '#fff',
        backgroundColor: '#555',
        padding: { x: 10, y: 5 }
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .on('pointerdown', () => this.clearPot());

    // Setup Drag Events
    this.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Container, dragX: number, dragY: number) => {
        gameObject.x = dragX;
        gameObject.y = dragY;
    });

    this.input.on('drop', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Container, dropZone: Phaser.GameObjects.Zone) => {
        const name = gameObject.getData('name');
        
        // Add to pot logic
        this.potIngredients.push(name);
        
        // Visual feedback: snap to pot center with some random offset
        gameObject.x = dropZone.x + Phaser.Math.Between(-20, 20);
        gameObject.y = dropZone.y + Phaser.Math.Between(-20, 20);
        
        // Disable dragging for this instance
        gameObject.disableInteractive();
        
        // Mark as dropped so we don't reset position on dragend
        gameObject.setData('dropped', true);
    });

    this.input.on('dragend', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Container, dropped: boolean) => {
        if (!dropped) {
            gameObject.x = gameObject.getData('originX');
            gameObject.y = gameObject.getData('originY');
        }
    });

    // Listen for external boost
    this.game.events.on('boostScore', (amount: number) => {
        this.score += amount;
        this.updateScoreUI();
    });
  }

  private createPot() {
    const x = this.scale.width / 2;
    const y = 250;
    
    // Visuals
    const circle = this.add.circle(x, y, 80, 0x555555);
    const label = this.add.text(x, y, 'POT', { fontSize: '20px', color: '#fff' }).setOrigin(0.5);
    
    // Drop Zone
    this.add.zone(x, y, 160, 160).setRectangleDropZone(160, 160);
  }

  private createIngredient(name: string, color: number, x: number, y: number) {
    const container = this.add.container(x, y);
    
    const rect = this.add.rectangle(0, 0, 80, 80, color);
    const label = this.add.text(0, 0, name, { fontSize: '16px', color: '#fff' }).setOrigin(0.5);
    
    container.add([rect, label]);
    container.setSize(80, 80);
    
    container.setInteractive({ draggable: true });
    
    // Store original position
    container.setData('originX', x);
    container.setData('originY', y);
    container.setData('name', name);

    this.input.setDraggable(container);
    this.ingredients.push(container);
  }

  private clearPot() {
      this.potIngredients = [];
      this.resultText.setText('');
      
      // Reset ingredients
      this.ingredients.forEach(ing => {
          ing.x = ing.getData('originX');
          ing.y = ing.getData('originY');
          ing.setInteractive({ draggable: true });
          ing.setData('dropped', false);
      });
  }

  private cook() {
      if (this.potIngredients.length === 0) {
          this.resultText.setText('Pot is empty!');
          this.resultText.setColor('#ff0000');
          return;
      }

      // Sort ingredients to match recipe key
      this.potIngredients.sort();
      const combination = this.potIngredients.join('+');
      const recipe = this.recipes[combination];

      if (recipe) {
          this.resultText.setText(`Success! Made ${recipe.name}! (+${recipe.score})`);
          this.resultText.setColor('#008800');
          this.score += recipe.score;
          this.updateScoreUI();
      } else {
          this.resultText.setText('Failed! Burnt food!');
          this.resultText.setColor('#ff0000');
          this.score = Math.max(0, this.score - 5);
          this.updateScoreUI();
      }
      
      // Auto reset after 1.5s
      this.time.delayedCall(1500, () => {
          this.clearPot();
      });
  }

  private updateScoreUI() {
      this.scoreText.setText(`Score: ${this.score}`);
  }
}
