// 定義
const startBtn = document.getElementById("start-btn");
const screenTitle = document.getElementById("screen-title");
const screenGame = document.getElementById("screen-game");

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

let dots = [];
const DOT_COUNT = 10;

let expandX = 0;
let expandY = 0;
let expandSize = 0; 
let isExpanding = false;

// 画面上のハイスコア表示をすべて更新する関数
function updateHighScoreUI(score) {
  if (document.getElementById("title-best-score")) {
    document.getElementById("title-best-score").innerText = score;
  }
  if (document.getElementById("game-best-score")) {
    document.getElementById("game-best-score").innerText = score;
  }
}

// 起動時にハイスコアを読み込んで反映
let currentBest = sessionStorage.getItem("zone-session-best") || 0;
updateHighScoreUI(currentBest);

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let hitOccurred = false;

  // 1. ターゲット（ドット）の更新と描画
  dots.forEach((dot) => {
    dot.x += dot.vx;
    dot.y += dot.vy;
    if (dot.x < 0 || dot.x > canvas.width) dot.vx *= -1;
    if (dot.y < 0 || dot.y > canvas.height) dot.vy *= -1;

    ctx.fillStyle = "#FF0000";
    ctx.shadowColor = "#FF0000";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0;

    // 2. 当たり判定
    if (
      dot.x > expandX - expandSize &&
      dot.x < expandX + expandSize &&
      dot.y > expandY - expandSize &&
      dot.y < expandY + expandSize
    ) {
      isExpanding = false;
      hitOccurred = true;

      // 面積計算
      let left = Math.max(0, expandX - expandSize);
      let right = Math.min(canvas.width, expandX + expandSize);
      let top = Math.max(0, expandY - expandSize);
      let bottom = Math.min(canvas.height, expandY + expandSize);
      let finalScore = Math.floor((right - left) * (bottom - top));

      // sessionStorageでハイスコア管理
      let highScore = sessionStorage.getItem("zone-session-best") || 0;
      let isNewRecord = false;

      if (finalScore > Number(highScore)) {
        sessionStorage.setItem("zone-session-best", finalScore);
        highScore = finalScore;
        isNewRecord = true;
      }

      // スコア表示の更新
      document.getElementById("score-val").innerText = finalScore;
      updateHighScoreUI(highScore);
      
      // リザルト画面の演出（新記録ならテキストを変える）
      const finishText = document.getElementById("finish-text");
      if (isNewRecord && finalScore > 0) {
        finishText.innerText = "NEW BEST SCORE!";
        finishText.style.color = "#FFFF00"; // 黄色で強調
      } else {
        finishText.innerText = "FINISH!";
        finishText.style.color = "#00FF00";
      }

      document.getElementById("result-score").innerText = `${finalScore} (BEST: ${highScore})`;
      document.getElementById("result-layer").style.display = "block";
    }
  });

  // 3. プレイヤーの四角形描画
  if (isExpanding) {
    expandSize += 2;
    ctx.strokeStyle = "#00FF00";
    ctx.lineWidth = 2;
    ctx.strokeRect(expandX - expandSize, expandY - expandSize, expandSize * 2, expandSize * 2);
  }

  // ヒットしたらループを終了
  if (hitOccurred) return;
  requestAnimationFrame(gameLoop);
}

// ドット生成ロジック
function createDot() {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 6,
    vy: (Math.random() - 0.5) * 6,
    radius: 5,
  };
}

for (let i = 0; i < DOT_COUNT; i++) {
  dots.push(createDot());
}

// イベントリスナー
startBtn.addEventListener("click", () => {
  screenTitle.style.display = "none";
  screenGame.style.display = "block";
  gameLoop();
});

canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  expandX = event.clientX - rect.left;
  expandY = event.clientY - rect.top;
  expandSize = 0; 
  isExpanding = true;
});