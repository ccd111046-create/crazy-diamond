// ==========================================
// 1. 遊戲核心與拖曳設定
// ==========================================
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

    // 動態插入圖片與說明文字
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

// ==========================================
// 2. 學生計分板功能
// ==========================================
const studentNameInput = document.getElementById("studentNameInput");
const addStudentBtn = document.getElementById("addStudentBtn");
const studentList = document.getElementById("studentList");

// 儲存學生資料的陣列
let students = [];

// 點擊「新增學生」按鈕時的動作
addStudentBtn.addEventListener("click", () => {
  const name = studentNameInput.value.trim(); // 取得輸入的姓名並去除空白
  if (name) {
    // 將新學生加入陣列，預設 0 分
    students.push({ id: Date.now(), name: name, score: 0 });
    studentNameInput.value = ""; // 清空輸入框
    renderScoreboard(); // 更新畫面
  }
});

// 讓輸入框按 Enter 也能新增學生
studentNameInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    addStudentBtn.click();
  }
});

// 重新繪製計分板畫面
function renderScoreboard() {
  studentList.innerHTML = ""; // 先清空目前的清單

  students.forEach((student) => {
    const item = document.createElement("div");
    item.classList.add("student-item");

    item.innerHTML = `
            <div class="student-info">
                ${student.name} <span class="student-score">${student.score}</span> 分
            </div>
            <div class="score-controls">
                <button class="btn-plus" onclick="updateScore(${student.id}, 1)">+1</button>
                <button class="btn-minus" onclick="updateScore(${student.id}, -1)">-1</button>
            </div>
        `;
    studentList.appendChild(item);
  });
}

// 加分/扣分的功能（設為全域變數以便在 HTML 中使用 onclick 呼叫）
window.updateScore = function (studentId, change) {
  const student = students.find((s) => s.id === studentId);
  if (student) {
    student.score += change;
    renderScoreboard(); // 更新畫面
  }
};


