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

const characterDescriptions = {
  "솔로몬": "화평을 사랑한 이스라엘의 왕, 지혜로운 판결로 유명합니다.",
  "아비가일": "지혜롭고 평화를 중시한 여인, 다윗의 아내가 된 인물입니다.",
  "아브라함": "믿음의 조상, 하나님의 약속을 믿고 떠난 순종의 사람.",
  "사라": "믿음의 여인, 아브라함의 아내로 이삭을 낳았습니다.",
  "다윗": "골리앗을 이긴 용감한 목동, 이스라엘의 왕.",
  "드보라": "사사이자 예언자, 이스라엘을 이끈 여성 지도자.",
  "모세": "출애굽의 지도자, 하나님과 직접 대면한 인물.",
  "미리암": "모세의 누이, 예언자이자 찬양의 리더.",
  "요셉": "야곱의 아들, 고난을 견디고 애굽의 총리가 됨.",
  "한나": "기도로 사무엘을 낳은 여인, 신실한 믿음의 모범.",
  "이삭": "아브라함의 아들, 순종과 희생의 상징.",
  "리브가": "이삭의 아내, 지혜롭고 용감한 선택의 여인.",
  "사무엘": "하나님의 음성을 들은 소년, 이스라엘의 사사이자 선지자.",
  "마리아": "예수님의 어머니, 순종과 겸손의 상징.",
  "바울": "복음 전파에 헌신한 사도, 변화의 대표 인물.",
  "마르다": "섬김과 실천을 중요시한 여인, 마리아의 자매.",
  "욥": "큰 고난 속에서도 믿음을 잃지 않은 인내의 사람.",
  "나오미": "시련 속에서 신뢰를 보여준 시어머니, 룻의 시어머니.",
  "다니엘": "사자굴에서 구원받은 믿음의 사람, 꿈 해석의 전문가.",
  "에스더": "민족을 구한 용기 있는 여왕, ‘죽으면 죽으리라’의 결단."
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
  const descriptionEl = document.getElementById("description");

  

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
  if (descriptionEl) {
  const desc = characterDescriptions[top.className] || "이 인물에 대한 설명이 없습니다.";
  descriptionEl.innerText = `📖 설명: ${desc}`;
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

// ✅ DOMContentLoaded 밖에 있어야 할 함수 및 호출
function hideDropZone() {
  const dropZone = document.getElementById("dropZone");
  const guideText = document.querySelector("p");
  if (dropZone) dropZone.style.display = "none";
  if (guideText) guideText.style.display = "none";
}

window.resetImage = resetImage;

init();
