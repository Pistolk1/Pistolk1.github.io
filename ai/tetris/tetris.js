<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wobbly Tetris</title>
    <style>
        body {
            display: flex;
            flex-direction: column;
            align-items: center;
            background-color: #222;
            color: white;
            font-family: Arial, sans-serif;
            margin: 0;
            height: 100vh;
            justify-content: center;
        }

        #game-container {
            position: relative;
        }

        canvas {
            border: 2px solid #fff;
            background-color: #000;
        }
    </style>
</head>
<body>
    <h1>Wobbly Tetris</h1>
    <div id="game-container">
        <canvas id="game" width="240" height="400"></canvas>
    </div>
    <script>
        const canvas = document.getElementById('game');
        const context = canvas.getContext('2d');
        const boxSize = 20;
        const rows = canvas.height / boxSize;
        const cols = canvas.width / boxSize;

        let board = Array.from({ length: rows }, () => Array(cols).fill(0));
        let currentPiece;
        let gameInterval;

        const colors = [
            null,
            'cyan', // I
            'blue', // J
            'orange', // L
            'yellow', // O
            'green', // S
            'purple', // T
            'red', // Z
        ];

        const pieces = [
            [[1, 1, 1, 1]], // I
            [[1, 0, 0], [1, 1, 1]], // J
            [[0, 0, 1], [1, 1, 1]], // L
            [[1, 1], [1, 1]], // O
            [[0, 1, 1], [1, 1, 0]], // S
            [[0, 1, 0], [1, 1, 1]], // T
            [[1, 1, 0], [0, 1, 1]], // Z
        ];

        function createPiece() {
            const index = Math.floor(Math.random() * pieces.length);
            currentPiece = {
                shape: pieces[index],
                x: Math.floor(cols / 2) - 1,
                y: 0,
                color: colors[index + 1],
            };
        }

        function draw() {
            context.clearRect(0, 0, canvas.width, canvas.height);
            drawBoard();
            drawPiece(currentPiece);
        }

        function drawBoard() {
            board.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        context.fillStyle = colors[value];
                        context.fillRect(x * boxSize, y * boxSize, boxSize, boxSize);
                        context.strokeStyle = 'black';
                        context.strokeRect(x * boxSize, y * boxSize, boxSize, boxSize);
                    }
                });
            });
        }

        function drawPiece(piece) {
            context.fillStyle = piece.color;
            piece.shape.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        context.fillRect((piece.x + x) * boxSize, (piece.y + y) * boxSize, boxSize, boxSize);
                        context.strokeStyle = 'black';
                        context.strokeRect((piece.x + x) * boxSize, (piece.y + y) * boxSize, boxSize, boxSize);
                    }
                });
            });
        }

        function collide() {
            return currentPiece.shape.some((row, dy) => {
                return row.some((value, dx) => {
                    if (value) {
                        const newX = currentPiece.x + dx;
                        const newY = currentPiece.y + dy;
                        return (
                            newY >= rows ||
                            newX < 0 ||
                            newX >= cols ||
                            (newY >= 0 && board[newY][newX])
                        );
                    }
                    return false;
                });
            });
        }

        function merge() {
            currentPiece.shape.forEach((row, dy) => {
                row.forEach((value, dx) => {
                    if (value) {
                        board[currentPiece.y + dy][currentPiece.x + dx] = pieces.indexOf(currentPiece.shape) + 1;
                    }
                });
            });
        }

        function clearRows() {
            board = board.reduce((acc, row) => {
                if (row.every(value => value)) {
                    acc.unshift(Array(cols).fill(0)); // Add empty row at the top
                } else {
                    acc.push(row);
                }
                return acc;
            }, []);
        }

        function dropPiece() {
            currentPiece.y++;
            if (collide()) {
                currentPiece.y--;
                merge();
                clearRows();
                createPiece();
                if (collide()) {
                    clearInterval(gameInterval);
                    alert('Game Over!');
                }
            }
        }

        function gameLoop() {
            draw();
            dropPiece();
        }

        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowLeft':
                    currentPiece.x--;
                    if (collide()) currentPiece.x++;
                    break;
                case 'ArrowRight':
                    currentPiece.x++;
                    if (collide()) currentPiece.x--;
                    break;
                case 'ArrowDown':
                    currentPiece.y++;
                    if (collide()) {
                        currentPiece.y--;
                        merge();
                        clearRows();
                        createPiece();
                    }
                    break;
                case 'ArrowUp':
                    const rotatedPiece = {
                        ...currentPiece,
                        shape: currentPiece.shape[0].map((val, index) => 
                            currentPiece.shape.map(row => row[index]).reverse()
                        ),
                    };
                    if (!collide(rotatedPiece)) {
                        currentPiece = rotatedPiece;
                    }
                    break;
            }
            draw();
        });

        createPiece();
        gameInterval = setInterval(gameLoop, 1000);
    </script>
</body>
</html>
