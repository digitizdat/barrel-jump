# Barrel Jump - Sheep Adventure 🐑

A fun 2D side-scrolling platformer game where you control a fluffy sheep jumping over barrels, collecting coins, and avoiding mud puddles!

This is a game designed by my daughter at the age of 5.

## 🎮 Game Features

- **Adorable Sheep Character**: Play as a cute white sheep with realistic physics
- **Dynamic Obstacles**: Jump over wooden barrels that spawn randomly
- **Collectible Coins**: Gather golden coins to increase your score
- **Mud Puddles**: Avoid getting muddy or embrace the mess - puddles add mud splotches to your sheep
- **Smooth Camera**: Side-scrolling camera that follows the sheep
- **Progressive Difficulty**: Game speed increases over time for added challenge
- **Beautiful Graphics**: Hand-drawn style graphics with clouds, grass, and atmospheric effects

## 🕹️ Controls

- **Movement**: 
  - `A` or `←` (Left Arrow): Move left
  - `D` or `→` (Right Arrow): Move right
- **Jump**: 
  - `Space` or `Mouse Click`: Jump over obstacles
- **Restart**: Click "Play Again" button when game ends

## 🎯 Gameplay

1. **Objective**: Survive as long as possible while collecting coins and avoiding obstacles
2. **Scoring**: 
   - +10 points for each barrel successfully passed
   - +50 points for each coin collected
3. **Physics**: Realistic jumping and landing mechanics - you can even land on top of barrels!
4. **Muddiness System**: Walking through puddles makes your sheep muddy (tracked in the UI)

## 🚀 How to Play

1. Open `index.html` in a web browser
2. Use the controls to move and jump
3. Collect coins and avoid hitting barrels from the side
4. Try to achieve the highest score possible!

## 🛠️ Technical Details

- **Built with**: Pure HTML5 Canvas and JavaScript
- **Graphics**: 2D canvas rendering with custom drawing functions
- **Physics**: Custom gravity and collision detection system
- **Performance**: Optimized object spawning and cleanup
- **Responsive**: Scales to different screen sizes

## 📁 Project Structure

```
barrel-jump/
├── index.html          # Main game HTML file with UI and styling
├── game.js            # Core game logic, physics, and rendering
└── README.md          # This file
```

## 🎨 Game Elements

- **Sheep**: The main character with fluffy white wool and pink face
- **Barrels**: Brown wooden obstacles with metal bands
- **Coins**: Golden collectibles with glow effects
- **Puddles**: Blue mud puddles that add dirt to your sheep
- **Clouds**: Animated background elements
- **Ground**: Green grass terrain

## 🏆 Features

- Smooth 60 FPS gameplay
- Collision detection for platforms and obstacles
- Particle-like mud splotch system
- Responsive controls with keyboard and mouse support
- Game over screen with restart functionality
- Real-time score and statistics tracking

## 🎵 Game Stats Tracked

- **Score**: Total points earned
- **Coins**: Number of coins collected
- **Muddiness**: How dirty your sheep has become

## 🔧 Development

The game is built using vanilla JavaScript and HTML5 Canvas, making it lightweight and easy to modify. Key systems include:

- **Game Loop**: 60 FPS rendering loop with `requestAnimationFrame`
- **Input System**: Keyboard and mouse event handling
- **Physics Engine**: Custom gravity, jumping, and collision detection
- **Spawning System**: Procedural obstacle and collectible generation
- **Camera System**: Smooth following camera with offset

## 🌟 Future Enhancements

Potential features that could be added:
- Sound effects and background music
- Power-ups and special abilities
- Multiple levels or environments
- High score persistence
- Mobile touch controls
- Particle effects for coin collection

---

**Enjoy playing Barrel Jump - Sheep Adventure!** 🎮✨
