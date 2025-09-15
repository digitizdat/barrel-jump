// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let gameRunning = true;
let score = 0;
let coins = 0;
let gameSpeed = 1.5;
let cameraX = 0;

// Sheep player object
const sheep = {
    x: 100,
    y: canvas.height - 80,
    width: 60,
    height: 50,
    velocityY: 0,
    velocityX: 0,
    jumping: false,
    grounded: true,
    gravity: 0.6,
    jumpPower: -16,
    walkSpeed: 3,
    maxSpeed: 5,
    muddiness: 0,
    mudSplotches: []
};

// Game objects arrays
let barrels = [];
let coinItems = [];
let clouds = [];
let puddles = [];

// Timing variables
let lastBarrelSpawn = 0;
let lastCoinSpawn = 0;
let lastPuddleSpawn = 0;
let frameCount = 0;

// Input state
let keys = {
    left: false,
    right: false,
    space: false
};

// Initialize clouds for background
function initClouds() {
    for (let i = 0; i < 5; i++) {
        clouds.push({
            x: Math.random() * canvas.width,
            y: Math.random() * 100 + 20,
            width: 60 + Math.random() * 40,
            height: 30 + Math.random() * 20,
            speed: 0.5 + Math.random() * 0.5
        });
    }
}

// Draw sheep character
function drawSheep() {
    ctx.save();
    
    const screenX = sheep.x - cameraX;
    
    // Sheep body (fluffy white)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(screenX + 30, sheep.y + 25, 25, 20, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Sheep head (now facing right)
    ctx.beginPath();
    ctx.ellipse(screenX + 45, sheep.y + 15, 18, 15, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw mud splotches on body and head
    ctx.fillStyle = '#8B4513';
    sheep.mudSplotches.forEach(splotch => {
        ctx.beginPath();
        ctx.ellipse(screenX + splotch.x, sheep.y + splotch.y, splotch.size, splotch.size * 0.8, 0, 0, 2 * Math.PI);
        ctx.fill();
    });
    
    // Sheep legs
    ctx.fillStyle = '#000000';
    for (let i = 0; i < 4; i++) {
        ctx.fillRect(screenX + 10 + i * 12, sheep.y + 40, 4, 10);
    }
    
    // Sheep face (now on the right side)
    ctx.fillStyle = '#FFB6C1';
    ctx.beginPath();
    ctx.ellipse(screenX + 45, sheep.y + 15, 12, 10, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Eyes (now positioned for right-facing)
    ctx.fillStyle = '#000000';
    ctx.fillRect(screenX + 40, sheep.y + 10, 3, 3);
    ctx.fillRect(screenX + 50, sheep.y + 10, 3, 3);
    
    // Nose
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(screenX + 45, sheep.y + 18, 2, 1, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.restore();
}

// Draw barrel obstacle
function drawBarrel(barrel) {
    ctx.save();
    
    const screenX = barrel.x - cameraX;
    
    // Only draw if barrel is on screen
    if (screenX > -barrel.width && screenX < canvas.width) {
        // Barrel body
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(screenX, barrel.y, barrel.width, barrel.height);
        
        // Barrel bands
        ctx.fillStyle = '#654321';
        ctx.fillRect(screenX, barrel.y + 5, barrel.width, 3);
        ctx.fillRect(screenX, barrel.y + barrel.height - 8, barrel.width, 3);
        ctx.fillRect(screenX, barrel.y + barrel.height / 2 - 1, barrel.width, 3);
    }
    
    ctx.restore();
}

// Draw coin
function drawCoin(coin) {
    ctx.save();
    
    const screenX = coin.x - cameraX;
    
    // Only draw if coin is on screen
    if (screenX > -coin.width && screenX < canvas.width) {
        // Coin glow effect
        const gradient = ctx.createRadialGradient(screenX + 15, coin.y + 15, 0, screenX + 15, coin.y + 15, 20);
        gradient.addColorStop(0, '#FFD700');
        gradient.addColorStop(0.7, '#FFA500');
        gradient.addColorStop(1, '#FF8C00');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(screenX + 15, coin.y + 15, 15, 0, 2 * Math.PI);
        ctx.fill();
        
        // Coin inner circle
        ctx.fillStyle = '#FFFF00';
        ctx.beginPath();
        ctx.arc(screenX + 15, coin.y + 15, 10, 0, 2 * Math.PI);
        ctx.fill();
        
        // Coin symbol
        ctx.fillStyle = '#FFA500';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('$', screenX + 15, coin.y + 20);
    }
    
    ctx.restore();
}

// Draw puddle
function drawPuddle(puddle) {
    ctx.save();
    
    const screenX = puddle.x - cameraX;
    
    // Only draw if puddle is on screen
    if (screenX > -puddle.width && screenX < canvas.width) {
        // Puddle reflection/shine
        const gradient = ctx.createRadialGradient(screenX + puddle.width/2, puddle.y + puddle.height/2, 0, screenX + puddle.width/2, puddle.y + puddle.height/2, puddle.width/2);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.6, '#4682B4');
        gradient.addColorStop(1, '#2F4F4F');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(screenX + puddle.width/2, puddle.y + puddle.height/2, puddle.width/2, puddle.height/2, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Puddle mud around edges
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.ellipse(screenX + puddle.width/2, puddle.y + puddle.height/2, puddle.width/2 + 5, puddle.height/2 + 3, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Redraw water on top
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(screenX + puddle.width/2, puddle.y + puddle.height/2, puddle.width/2, puddle.height/2, 0, 0, 2 * Math.PI);
        ctx.fill();
    }
    
    ctx.restore();
}

// Draw clouds
function drawClouds() {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    
    clouds.forEach(cloud => {
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.width / 4, 0, 2 * Math.PI);
        ctx.arc(cloud.x + cloud.width / 3, cloud.y, cloud.width / 3, 0, 2 * Math.PI);
        ctx.arc(cloud.x + cloud.width / 2, cloud.y, cloud.width / 4, 0, 2 * Math.PI);
        ctx.fill();
        
        // Move cloud
        cloud.x -= cloud.speed;
        if (cloud.x + cloud.width < 0) {
            cloud.x = canvas.width + Math.random() * 200;
            cloud.y = Math.random() * 100 + 20;
        }
    });
    
    ctx.restore();
}

// Draw ground
function drawGround() {
    ctx.save();
    
    // Ground
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
    
    // Ground pattern
    ctx.fillStyle = '#32CD32';
    for (let i = 0; i < canvas.width; i += 20) {
        ctx.fillRect(i, canvas.height - 25, 10, 5);
    }
    
    ctx.restore();
}

// Check horizontal barrel collisions
function checkHorizontalBarrelCollisions(newX) {
    for (let barrel of barrels) {
        // Check if sheep would collide horizontally with barrel
        if (newX < barrel.x + barrel.width &&
            newX + sheep.width > barrel.x &&
            sheep.y < barrel.y + barrel.height &&
            sheep.y + sheep.height > barrel.y) {
            
            // Check if sheep is on top of barrel (allow movement)
            const isOnTop = sheep.y + sheep.height <= barrel.y + 10;
            
            if (!isOnTop) {
                // Block horizontal movement
                if (sheep.velocityX > 0) {
                    // Moving right, stop at left edge of barrel
                    return barrel.x - sheep.width;
                } else {
                    // Moving left, stop at right edge of barrel
                    return barrel.x + barrel.width;
                }
            }
        }
    }
    return newX; // No collision, return original position
}

// Update sheep physics
function updateSheep() {
    // Handle horizontal movement
    if (keys.right) {
        sheep.velocityX = Math.min(sheep.velocityX + 0.5, sheep.maxSpeed);
    } else if (keys.left) {
        sheep.velocityX = Math.max(sheep.velocityX - 0.5, -sheep.maxSpeed);
    } else {
        // Apply friction when no keys are pressed
        sheep.velocityX *= 0.8;
        if (Math.abs(sheep.velocityX) < 0.1) sheep.velocityX = 0;
    }
    
    // Calculate new horizontal position
    const newX = sheep.x + sheep.velocityX;
    
    // Check for barrel collisions and adjust position
    const adjustedX = checkHorizontalBarrelCollisions(newX);
    
    // If position was adjusted, stop horizontal velocity
    if (adjustedX !== newX) {
        sheep.velocityX = 0;
    }
    
    // Update horizontal position
    sheep.x = adjustedX;
    
    // Keep sheep on screen horizontally
    if (sheep.x < 0) sheep.x = 0;
    
    // Update camera to follow sheep (with some offset)
    const targetCameraX = sheep.x - canvas.width / 3;
    cameraX += (targetCameraX - cameraX) * 0.1;
    if (cameraX < 0) cameraX = 0;
    
    // Apply gravity
    if (!sheep.grounded) {
        sheep.velocityY += sheep.gravity;
    }
    
    // Update vertical position
    sheep.y += sheep.velocityY;
    
    // Check for barrel landing first
    let landedOnBarrel = false;
    barrels.forEach(barrel => {
        // Check if sheep is landing on top of barrel
        if (sheep.x < barrel.x + barrel.width &&
            sheep.x + sheep.width > barrel.x &&
            sheep.y + sheep.height >= barrel.y &&
            sheep.y + sheep.height <= barrel.y + 10 && // Small tolerance for landing on top
            sheep.velocityY >= 0) { // Only when falling down
            
            sheep.y = barrel.y - sheep.height;
            sheep.velocityY = 0;
            sheep.grounded = true;
            sheep.jumping = false;
            landedOnBarrel = true;
        }
    });
    
    // Ground collision (only if not landed on barrel)
    if (!landedOnBarrel) {
        const groundY = canvas.height - 80;
        if (sheep.y >= groundY) {
            sheep.y = groundY;
            sheep.velocityY = 0;
            sheep.grounded = true;
            sheep.jumping = false;
        } else {
            sheep.grounded = false;
        }
    }
}

// Make sheep jump
function jump() {
    if (sheep.grounded && !sheep.jumping) {
        sheep.velocityY = sheep.jumpPower;
        sheep.jumping = true;
        sheep.grounded = false;
    }
}

// Spawn barrel
function spawnBarrel() {
    if (frameCount - lastBarrelSpawn > 140 + Math.random() * 80) {
        barrels.push({
            x: cameraX + canvas.width + Math.random() * 200,
            y: canvas.height - 80,
            width: 40,
            height: 50
        });
        lastBarrelSpawn = frameCount;
    }
}

// Spawn coin
function spawnCoin() {
    if (frameCount - lastCoinSpawn > 200 + Math.random() * 100) {
        coinItems.push({
            x: cameraX + canvas.width + Math.random() * 300,
            y: canvas.height - 120 - Math.random() * 100,
            width: 30,
            height: 30,
            collected: false
        });
        lastCoinSpawn = frameCount;
    }
}

// Spawn puddle
function spawnPuddle() {
    if (frameCount - lastPuddleSpawn > 300 + Math.random() * 200) {
        puddles.push({
            x: cameraX + canvas.width + Math.random() * 400,
            y: canvas.height - 50,
            width: 60 + Math.random() * 40,
            height: 20 + Math.random() * 10
        });
        lastPuddleSpawn = frameCount;
    }
}

// Update barrels
function updateBarrels() {
    for (let i = barrels.length - 1; i >= 0; i--) {
        // Remove barrels that are far behind the camera
        if (barrels[i].x + barrels[i].width < cameraX - 100) {
            barrels.splice(i, 1);
            score += 10;
        }
    }
}

// Update coins
function updateCoins() {
    for (let i = coinItems.length - 1; i >= 0; i--) {
        if (!coinItems[i].collected) {
            // Remove coins that are far behind the camera
            if (coinItems[i].x + coinItems[i].width < cameraX - 100) {
                coinItems.splice(i, 1);
            }
        }
    }
}

// Update puddles
function updatePuddles() {
    for (let i = puddles.length - 1; i >= 0; i--) {
        // Remove puddles that are far behind the camera
        if (puddles[i].x + puddles[i].width < cameraX - 100) {
            puddles.splice(i, 1);
        }
    }
}

// Add mud splotch to sheep
function addMudSplotch() {
    const splotch = {
        x: 15 + Math.random() * 40, // Random position on sheep body
        y: 10 + Math.random() * 30,
        size: 2 + Math.random() * 4
    };
    sheep.mudSplotches.push(splotch);
    sheep.muddiness++;
    
    // Limit number of splotches to prevent performance issues
    if (sheep.mudSplotches.length > 15) {
        sheep.mudSplotches.shift();
    }
}

// Check collisions
function checkCollisions() {
    // Check coin collisions
    for (let i = coinItems.length - 1; i >= 0; i--) {
        const coin = coinItems[i];
        if (!coin.collected &&
            sheep.x < coin.x + coin.width &&
            sheep.x + sheep.width > coin.x &&
            sheep.y < coin.y + coin.height &&
            sheep.y + sheep.height > coin.y) {
            coin.collected = true;
            coins++;
            score += 50;
            coinItems.splice(i, 1);
        }
    }
    
    // Check puddle collisions
    puddles.forEach(puddle => {
        if (sheep.x < puddle.x + puddle.width &&
            sheep.x + sheep.width > puddle.x &&
            sheep.y + sheep.height >= puddle.y &&
            sheep.y + sheep.height <= puddle.y + puddle.height + 5) {
            
            // Add mud if sheep is touching puddle
            if (Math.random() < 0.3) { // 30% chance per frame to add mud
                addMudSplotch();
            }
        }
    });
}

// Clean sheep (for restart)
function cleanSheep() {
    sheep.muddiness = 0;
    sheep.mudSplotches = [];
}

// Restart game
function restartGame() {
    gameRunning = true;
    score = 0;
    coins = 0;
    gameSpeed = 1.5;
    cameraX = 0;
    barrels = [];
    coinItems = [];
    puddles = [];
    frameCount = 0;
    lastBarrelSpawn = 0;
    lastCoinSpawn = 0;
    lastPuddleSpawn = 0;
    
    // Reset sheep
    sheep.x = 100;
    sheep.y = canvas.height - 80;
    sheep.velocityY = 0;
    sheep.velocityX = 0;
    sheep.jumping = false;
    sheep.grounded = true;
    cleanSheep();
    
    // Reset keys
    keys.left = false;
    keys.right = false;
    keys.space = false;
    
    document.getElementById('gameOver').style.display = 'none';
    gameLoop();
}

// Update UI
function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('coins').textContent = coins;
    document.getElementById('muddiness').textContent = sheep.muddiness;
}

// Main game loop
function gameLoop() {
    if (!gameRunning) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background elements
    drawClouds();
    drawGround();
    
    // Update game objects
    updateSheep();
    spawnBarrel();
    spawnCoin();
    spawnPuddle();
    updateBarrels();
    updateCoins();
    updatePuddles();
    
    // Draw game objects
    puddles.forEach(drawPuddle);
    drawSheep();
    barrels.forEach(drawBarrel);
    coinItems.forEach(drawCoin);
    
    // Check collisions
    checkCollisions();
    
    // Update UI
    updateUI();
    
    // Increase difficulty over time
    if (frameCount % 800 === 0) {
        gameSpeed += 0.15;
    }
    
    frameCount++;
    requestAnimationFrame(gameLoop);
}

// Event listeners
document.addEventListener('keydown', (e) => {
    e.preventDefault();
    switch(e.code) {
        case 'Space':
            keys.space = true;
            jump();
            break;
        case 'ArrowLeft':
        case 'KeyA':
            keys.left = true;
            break;
        case 'ArrowRight':
        case 'KeyD':
            keys.right = true;
            break;
    }
});

document.addEventListener('keyup', (e) => {
    switch(e.code) {
        case 'Space':
            keys.space = false;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            keys.left = false;
            break;
        case 'ArrowRight':
        case 'KeyD':
            keys.right = false;
            break;
    }
});

canvas.addEventListener('click', jump);

// Initialize and start game
initClouds();
gameLoop();
