// 1. 定義正確的步驟順序（Array 索引即為正確順序，並加入對應的圖片檔名）
const correctSteps = [
  { id: "step1", text: "將生理食鹽水倒在傷口上", image: "1.png" },
  { id: "step2", text: "拿出乾淨的棉花棒擦傷口", image: "2.png" },
  { id: "step3", text: "拿出優碘和一根新的棉花棒", image: "3.png" },
  { id: "step4", text: "滴一點點優碘在棉花棒上", image: "4.png" },
  { id: "step5", text: "用棉花棒擦傷口", image: "5.png" },
  { id: "step6", text: "再拿出一根新的棉花棒及外傷藥膏", image: "6.png" },
  { id: "step7", text: "擠一點點藥膏到棉花棒上", image: "7.png" },
  { id: "step8", text: "用棉花棒在傷口上繞圈圈", image: "8.png" },
  { id: "step9", text: "拿出OK蹦撕開", image: "9.png" },
  { id: "step10", text: "貼在傷口上", image: "10.png" },
];

const targetContainer = document.getElementById("targetContainer");
const sourceContainer = document.getElementById("sourceContainer");
const checkBtn = document.getElementById("checkBtn");
const resetBtn = document.getElementById("resetBtn");
const resultMessage = document.getElementById("resultMessage");

// 初始化遊戲
function initGame() {
  targetContainer.innerHTML = "";
  sourceContainer.innerHTML = "";
  resultMessage.innerHTML = "";

  // 建立 10 個放置目標格子
  for (let i = 1; i <= 10; i++) {
    const zone = document.createElement("div");
    zone.classList.add("drop-zone");
    zone.setAttribute("data-step", `步驟 ${i}`);
    zone.setAttribute("data-index", i - 1); // 陣列索引 0~9

    // 監聽拖曳滑過與放置事件
    zone.addEventListener("dragover", dragOver);
    zone.addEventListener("drop", dropToZone);
    targetContainer.appendChild(zone);
  }

  // 監聽隨機區的釋放，讓卡片可以被移回隨機區
  sourceContainer.addEventListener("dragover", dragOver);
  sourceContainer.addEventListener("drop", dropToSource);

  // 將正確步驟複製一份並「隨機打散」
  const shuffledSteps = [...correctSteps].sort(() => Math.random() - 0.5);

  // 建立拖曳卡片
  shuffledSteps.forEach((step) => {
    const card = document.createElement("div");
    card.classList.add("step-card");
    card.setAttribute("draggable", "true");
    card.setAttribute("id", step.id);

    // 【修改重點】：動態插入圖片 (<img>) 與說明文字 (<span>)
    card.innerHTML = `
      <img src="${step.image}" alt="${step.text}" class="card-img">
      <span class="card-text">${step.text}</span>
    `;

    // 監聽開始與結束拖曳
    card.addEventListener("dragstart", dragStart);
    card.addEventListener("dragend", dragEnd);

    sourceContainer.appendChild(card);
  });
}

// 拖曳相關函式
let draggedElement = null;

function dragStart(e) {
  draggedElement = this;
  setTimeout(() => this.classList.add("dragging"), 0);
}

// 修正：補上之前遺漏的 e 參數，並加上 dataTransfer 設定以增加跨瀏覽器支援度
function dragStart(e) {
  draggedElement = this;
  if (e.dataTransfer) {
    e.dataTransfer.setData("text/plain", this.id);
  }
  setTimeout(() => this.classList.add("dragging"), 0);
}

function dragEnd() {
  this.classList.remove("dragging");
  draggedElement = null;
}

function dragOver(e) {
  e.preventDefault(); // 必須阻擋預設行為，才能允許放開
}

function dropToZone(e) {
  e.preventDefault();
  // 檢查這個格子是不是已經有卡片了
  if (this.children.length === 0) {
    this.appendChild(draggedElement);
  }
}

function dropToSource(e) {
  e.preventDefault();
  sourceContainer.appendChild(draggedElement);
}

// 檢查答案
checkBtn.addEventListener("click", () => {
  const zones = document.querySelectorAll(".drop-zone");
  let allCorrect = true;
  let missing = false;

  zones.forEach((zone) => {
    const expectedId = correctSteps[zone.getAttribute("data-index")].id;
    const currentCard = zone.children[0];

    if (!currentCard) {
      missing = true;
      zone.style.borderColor = "#bbb";
    } else if (currentCard.id === expectedId) {
      zone.style.borderColor = "#2a9d8f"; // 正確綠色
    } else {
      zone.style.borderColor = "#e76f51"; // 錯誤紅色
      allCorrect = false;
    }
  });

  if (missing) {
    resultMessage.className = "message wrong";
    resultMessage.innerText = "⚠️ 還沒排完喔，請把所有步驟排好再檢查！";
  } else if (allCorrect) {
    resultMessage.className = "message correct";
    resultMessage.innerText = "🎉 太棒了！你的傷口護理步驟完全正確！";
  } else {
    resultMessage.className = "message wrong";
    resultMessage.innerText = "❌ 有些步驟排錯了，再檢查看看哪裡怪怪的？";
  }
});

// 重新開始
resetBtn.addEventListener("click", initGame);

// 網頁載入時直接啟動
initGame();
