const TM_MODEL_URL = "https://teachablemachine.withgoogle.com/models/BjKI68mob/";

let model, maxPredictions;

// 클래스명 → 설명 맵핑
const classDescriptions = {
  "솔로몬": "지혜로운 중재자",
  "아비가일": "총명하고 아름다운 중재자",
  "아브라함": "믿음의 조상",
  "사라": "믿음의 어머니",
  "다윗": "용기의 상징, 하나님의 사람",
  "드보라": "담대한 여성 리더",
  "모세": "백성을 이끈 지도자",
  "미리암": "찬양하는 여선지자",
  "요셉": "용서와 회복의 사람",
  "한나": "기도와 헌신의 여인",
  "이삭": "순종의 사람",
  "리브가": "선한 마음의 중재자",
  "사무엘": "하나님의 음성을 들은 자",
  "마리아": "순종의 모범",
  "바울": "복음을 위한 평화의 사도",
  "마르다": "섬김과 실천의 사람",
  "욥": "고난 속 인내의 본",
  "나오미": "돌봄과 지혜의 여인",
  "다니엘": "믿음과 감사의 본",
  "에스더": "용기와 순종의 여왕"
};

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

// 말씀 출력
function getRandomVerse(category) {
  const verses = versesByCategory[category];
  if (!verses || verses.length === 0) return "해당 범주의 말씀이 없습니다.";
  const randomIndex = Math.floor(Math.random() * verses.length);
  return verses[randomIndex].text;
}

// 이미지 예측
async function predict(image) {
  const prediction = await model.predict(image, false);
  prediction.sort((a, b) => b.probability - a.probability);
  const top = prediction[0];

  const name = top.className;
  const percent = (top.probability * 100).toFixed(1) + "%";
  const description = classDescriptions[name] || "설명 없음";
  const category = classToCategoryMap[name];
  const verse = getRandomVerse(category);

  // 결과 출력
  document.getElementById("resultName").innerText = name;
  document.getElementById("resultDesc").innerText = description;
  document.getElementById("resultPercent").innerText = "닮은 확률: " + percent;
  document.getElementById("verse").innerText = verse;
}

// 드롭존 숨기기
function hideDropZone() {
  const dropZone = document.getElementById("dropZone");
  const guideText = document.querySelector("p");
  if (dropZone) dropZone.style.display = "none";
  if (guideText) guideText.style.display = "none";
}

// DOM이 로드된 후 실행
document.addEventListener("DOMContentLoaded", async () => {
  const imageInput = document.getElementById("imageUpload");
  const imageElement = document.getElementById("preview");
  const dropZone = document.getElementById("dropZone");

  // ✅ 모델 초기화
  const modelURL = TM_MODEL_URL + "model.json";
  const metadataURL = TM_MODEL_URL + "metadata.json";
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();
  console.log("✅ 모델 로딩 완료");

  // 이전 이미지 불러오기
  const savedImage = localStorage.getItem("uploadedImage");
  if (savedImage) {
    imageElement.onload = async function () {
      hideDropZone();
      await predict(imageElement);
    };
    imageElement.src = savedImage;
  }

  // 파일 업로드
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

  // 드래그 앤 드롭
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
});
