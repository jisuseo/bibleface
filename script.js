const TM_MODEL_URL = "https://teachablemachine.withgoogle.com/models/BjKI68mob/";

let model, maxPredictions;

const classToCategoryMap = {
  "솔로몬": "지혜/분별", "아비가일": "지혜/분별",
  "아브라함": "믿음/신뢰", "사라": "믿음/신뢰",
  "다윗": "용기/담대함", "드보라": "용기/담대함",
  "모세": "지도력/리더십", "미리암": "지도력/리더십",
  "요셉": "자비/용서", "한나": "자비/용서",
  "이삭": "희생/섬김", "리브가": "희생/섬김",
  "사무엘": "순종/복종", "마리아": "순종/복종",
  "바울": "평화/화합", "마르다": "평화/화합",
  "욥": "인내/견디어냄", "나오미": "인내/견디어냄",
  "다니엘": "감사/기쁨", "에스더": "감사/기쁨"
};

// 모델 초기화
async function init() {
  const modelURL = TM_MODEL_URL + "model.json";
  const metadataURL = TM_MODEL_URL + "metadata.json";

  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  console.log("✅ 모델 로딩 완료. 총 클래스 수:", maxPredictions);

  const savedImage = localStorage.getItem("uploadedImage");
  if (savedImage) {
    const imageElement = document.getElementById("preview");
    imageElement.onload = async function () {
      hideDropZone();
      await predict(imageElement);
    };
    imageElement.src = savedImage;
  }
}

// 이미지 예측
async function predict(image) {
  const prediction = await model.predict(image, false);
  prediction.sort((a, b) => b.probability - a.probability);
  const top = prediction[0];

  const resultEl = document.getElementById("result");
  const verseEl = document.getElementById("verse");

  if (resultEl) {
    resultEl.innerText = `👤 성경인물: ${top.className}\n✅ 닮은정도: ${(top.probability * 100).toFixed(2)}%`;
  }

  const category = classToCategoryMap[top.className];
  if (verseEl) {
    if (!category) {
      verseEl.innerText = "❌ 범주 매핑 없음";
    } else {
      const verseText = getRandomVerse(category);
      verseEl.innerText = verseText;
    }
  }
}

// 말씀 출력
function getRandomVerse(category) {
  const verses = versesByCategory[category];
  if (!verses || verses.length === 0) return "해당 범주의 말씀 없음";
  const randomIndex = Math.floor(Math.random() * verses.length);
  return verses[randomIndex].text;
}

// 초기화 함수
function resetImage() {
  localStorage.removeItem("uploadedImage");
  const preview = document.getElementById("preview");
  const result = document.getElementById("result");
  const verse = document.getElementById("verse");
  const dropZone = document.getElementById("dropZone");
  const guideText = document.querySelector("p");

  if (preview) preview.src = "";
  if (result) result.innerText = "예측 결과가 여기에 표시됩니다";
  if (verse) verse.innerText = "성경 말씀이 여기에 표시됩니다";
  if (dropZone) dropZone.style.display = "block";
  if (guideText) guideText.style.display = "block";
}

// 초기 로딩 이벤트
document.addEventListener("DOMContentLoaded", () => {
  const imageInput = document.getElementById("imageUpload");
  const imageElement = document.getElementById("preview");

  imageInput.addEventListener("change", async function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const base64Image = e.target.result;
        imageElement.onload = async function () {
          hideDropZone();
          await predict(imageElement);
        };
        imageElement.src = base64Image;
        localStorage.setItem("uploadedImage", base64Image);
      };
      reader.readAsDataURL(file);
    }
  });

  const dropZone = document.getElementById("dropZone");

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = "#eef";
  });

  dropZone.addEventListener("dragleave", (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = "";
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = "";

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const base64Image = e.target.result;
        imageElement.onload = async function () {
          hideDropZone();
          await predict(imageElement);
        };
        imageElement.src = base64Image;
        localStorage.setItem("uploadedImage", base64Image);
      };
      reader.readAsDataURL(file);
    }
  });


function hideDropZone() {
    const dropZone = document.getElementById("dropZone");
    const guideText = document.querySelector("p");
    if (dropZone) dropZone.style.display = "none";
    if (guideText) guideText.style.display = "none";
  }

  window.resetImage = resetImage;

  init();
});
