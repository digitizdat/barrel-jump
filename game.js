// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let gameRunning = true;
let score = 0;
let apples = 0;
let gameSpeed = 2;
let gameWon = false;
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
let appleItems = [];
let clouds = [];
let finishLine = null;
let mamaSheep = null;
let hearts = [];
let puddles = [];

// Timing variables
let lastBarrelSpawn = 0;
let lastAppleSpawn = 0;
let lastPuddleSpawn = 0;
let frameCount = 0;
let victoryAnimationFrame = 0;

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

// Draw apple
function drawApple(apple) {
    ctx.save();
    
    const screenX = apple.x - cameraX;
    
    // Only draw if apple is on screen
    if (screenX > -apple.width && screenX < canvas.width) {
        // Apple body (shiny red)
        const gradient = ctx.createRadialGradient(screenX + 12, apple.y + 12, 0, screenX + 15, apple.y + 15, 15);
        gradient.addColorStop(0, '#FF6B6B');
        gradient.addColorStop(0.6, '#DC143C');
        gradient.addColorStop(1, '#8B0000');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(screenX + 15, apple.y + 18, 12, 0, 2 * Math.PI);
        ctx.fill();
        
        // Apple highlight (shine)
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.ellipse(screenX + 11, apple.y + 14, 3, 5, -0.3, 0, 2 * Math.PI);
        ctx.fill();
        
        // Apple stem
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(screenX + 14, apple.y + 6, 2, 6);
        
        // Apple leaf
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.ellipse(screenX + 18, apple.y + 8, 4, 2, 0.5, 0, 2 * Math.PI);
        ctx.fill();
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

// Spawn apple
function spawnApple() {
    if (frameCount - lastAppleSpawn > 180 + Math.random() * 120) {
        appleItems.push({
            x: cameraX + canvas.width + Math.random() * 300,
            y: canvas.height - 120 - Math.random() * 100,
            width: 30,
            height: 30,
            collected: false
        });
        lastAppleSpawn = frameCount;
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

// Update apples
function updateApples() {
    for (let i = appleItems.length - 1; i >= 0; i--) {
        if (!appleItems[i].collected) {
            // Remove apples that are far behind the camera
            if (appleItems[i].x + appleItems[i].width < cameraX - 100) {
                appleItems.splice(i, 1);
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
    // Check apple collisions
    for (let i = appleItems.length - 1; i >= 0; i--) {
        const apple = appleItems[i];
        if (!apple.collected &&
            sheep.x < apple.x + apple.width &&
            sheep.x + sheep.width > apple.x &&
            sheep.y < apple.y + apple.height &&
            sheep.y + sheep.height > apple.y) {
            apple.collected = true;
            apples++;
            score += 50;
            appleItems.splice(i, 1);
            
            // Check for victory condition
            if (apples >= 20) {
                victory();
            }
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

// Draw floating hearts
function drawHearts() {
    if (!gameWon || hearts.length === 0) return;
    
    ctx.save();
    hearts.forEach((heart, index) => {
        const screenX = heart.x - cameraX;
        
        // Only draw if heart is on screen
        if (screenX > -50 && screenX < canvas.width + 50) {
            ctx.fillStyle = `rgba(255, 20, 147, ${heart.opacity})`;
            
            // Draw heart shape
            ctx.beginPath();
            ctx.moveTo(screenX, heart.y + heart.size / 4);
            ctx.bezierCurveTo(screenX, heart.y, screenX - heart.size / 2, heart.y, screenX - heart.size / 2, heart.y + heart.size / 4);
            ctx.bezierCurveTo(screenX - heart.size / 2, heart.y + heart.size / 2, screenX, heart.y + heart.size * 0.75, screenX, heart.y + heart.size);
            ctx.bezierCurveTo(screenX, heart.y + heart.size * 0.75, screenX + heart.size / 2, heart.y + heart.size / 2, screenX + heart.size / 2, heart.y + heart.size / 4);
            ctx.bezierCurveTo(screenX + heart.size / 2, heart.y, screenX, heart.y, screenX, heart.y + heart.size / 4);
            ctx.fill();
        }
        
        // Update heart position and opacity
        heart.y -= heart.speed;
        heart.opacity -= 0.01;
        
        // Remove hearts that have faded out
        if (heart.opacity <= 0) {
            hearts.splice(index, 1);
        }
    });
    ctx.restore();
}

// Spawn hearts between sheep and mama
function spawnHeart() {
    if (!gameWon || !mamaSheep) return;
    
    const midX = (sheep.x + mamaSheep.x) / 2 + (Math.random() - 0.5) * 100;
    const midY = (sheep.y + mamaSheep.y) / 2 + (Math.random() - 0.5) * 50;
    
    hearts.push({
        x: midX,
        y: midY,
        size: 8 + Math.random() * 8,
        speed: 0.5 + Math.random() * 1,
        opacity: 1
    });
}

// Draw mama sheep
function drawMamaSheep() {
    if (!mamaSheep) return;
    
    ctx.save();
    const screenX = mamaSheep.x - cameraX;
    
    // Only draw if mama sheep is on screen
    if (screenX > -100 && screenX < canvas.width + 100) {
        // Mama sheep body (larger and fluffier)
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(screenX + 40, mamaSheep.y + 35, 35, 25, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Mama sheep head
        ctx.beginPath();
        ctx.ellipse(screenX + 15, mamaSheep.y + 20, 22, 18, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Mama sheep legs
        ctx.fillStyle = '#000000';
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(screenX + 15 + i * 15, mamaSheep.y + 55, 5, 12);
        }
        
        // Mama sheep face
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.ellipse(screenX + 15, mamaSheep.y + 20, 15, 12, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(screenX + 8, mamaSheep.y + 15, 4, 4);
        ctx.fillRect(screenX + 20, mamaSheep.y + 15, 4, 4);
        
        // Nose
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(screenX + 15, mamaSheep.y + 23, 2, 1, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Flower wreath on mama sheep's head
        const flowers = [
            {x: screenX + 5, y: mamaSheep.y + 5, color: '#FF69B4'},
            {x: screenX + 12, y: mamaSheep.y + 2, color: '#FFD700'},
            {x: screenX + 20, y: mamaSheep.y + 2, color: '#FF6347'},
            {x: screenX + 27, y: mamaSheep.y + 5, color: '#9370DB'},
            {x: screenX + 30, y: mamaSheep.y + 12, color: '#FF1493'}
        ];
        
        flowers.forEach(flower => {
            ctx.fillStyle = flower.color;
            ctx.beginPath();
            ctx.arc(flower.x, flower.y, 3, 0, 2 * Math.PI);
            ctx.fill();
            
            // Flower petals
            for (let i = 0; i < 5; i++) {
                const angle = (i * Math.PI * 2) / 5;
                const petalX = flower.x + Math.cos(angle) * 2;
                const petalY = flower.y + Math.sin(angle) * 2;
                ctx.beginPath();
                ctx.arc(petalX, petalY, 1.5, 0, 2 * Math.PI);
                ctx.fill();
            }
        });
    }
    
    ctx.restore();
}

// Draw finish line
function drawFinishLine() {
    if (!finishLine) return;
    
    ctx.save();
    const screenX = finishLine.x - cameraX;
    
    // Only draw if finish line is on screen
    if (screenX > -50 && screenX < canvas.width + 50) {
        // Finish line pole
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(screenX, finishLine.y - 100, 8, 100);
        
        // Finish line flag (checkered pattern)
        const flagWidth = 60;
        const flagHeight = 40;
        const squareSize = 8;
        
        for (let row = 0; row < flagHeight / squareSize; row++) {
            for (let col = 0; col < flagWidth / squareSize; col++) {
                const isBlack = (row + col) % 2 === 0;
                ctx.fillStyle = isBlack ? '#000000' : '#FFFFFF';
                ctx.fillRect(
                    screenX + 8 + col * squareSize,
                    finishLine.y - 100 + row * squareSize,
                    squareSize,
                    squareSize
                );
            }
        }
        
        // Flag border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(screenX + 8, finishLine.y - 100, flagWidth, flagHeight);
    }
    
    ctx.restore();
}

// Victory function
function victory() {
    gameWon = true;
    // Keep gameRunning = true so sheep can continue moving
    
    // Create mama sheep at finish line (further ahead)
    mamaSheep = {
        x: sheep.x + 400,
        y: canvas.height - 100
    };
    
    // Create finish line
    finishLine = {
        x: sheep.x + 350,
        y: canvas.height - 30
    };
}

// Clean sheep (for restart)
function cleanSheep() {
    sheep.muddiness = 0;
    sheep.mudSplotches = [];
}

// Restart game
function restartGame() {
    gameRunning = true;
    gameWon = false;
    score = 0;
    apples = 0;
    gameSpeed = 1.5;
    cameraX = 0;
    barrels = [];
    appleItems = [];
    puddles = [];
    mamaSheep = null;
    finishLine = null;
    hearts = [];
    frameCount = 0;
    lastBarrelSpawn = 0;
    lastAppleSpawn = 0;
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
    document.getElementById('victoryScreen').style.display = 'none';
    gameLoop();
}

// Update UI
function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('apples').textContent = apples;
}

// Check if sheep has reached mama
function checkSheepReachedMama() {
    if (gameWon && mamaSheep && !document.getElementById('victoryScreen').style.display.includes('flex')) {
        const distance = Math.abs(sheep.x - mamaSheep.x);
        if (distance < 100) {
            // Show victory screen when sheep reaches mama
            document.getElementById('victoryScreen').style.display = 'flex';
        }
    }
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
    
    // Only spawn new obstacles if victory hasn't been triggered
    if (!gameWon) {
        spawnBarrel();
        spawnApple();
        spawnPuddle();
    }
    
    updateBarrels();
    updateApples();
    updatePuddles();
    
    // Draw game objects
    puddles.forEach(drawPuddle);
    drawSheep();
    barrels.forEach(drawBarrel);
    appleItems.forEach(drawApple);
    drawFinishLine();
    drawMamaSheep();
    drawHearts();
    
    // Spawn hearts during victory sequence
    if (gameWon && Math.random() < 0.1) {
        spawnHeart();
    }
    
    // Check collisions
    checkCollisions();
    
    // Check if sheep has reached mama
    checkSheepReachedMama();
    
    // Update UI
    updateUI();
    
    // Increase difficulty over time (only if not won)
    if (!gameWon && frameCount % 800 === 0) {
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
