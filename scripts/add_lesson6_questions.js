const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../data/questions_grade1.json');
const questions = JSON.parse(fs.readFileSync(targetPath, 'utf8'));

// Filter out any existing lesson 6 questions if any
const cleanQuestions = questions.filter(q => !(q.unit && q.unit.includes('6단원')));

const l6Questions = [
  // --- 1. Lesson 6 Vocabulary (어휘) ---
  {
    id: "q6_1",
    grade: 1,
    unit: "6단원 (L6. The Beauty of Art)",
    category: "curriculum",
    question: "다음 빈칸에 들어갈 알맞은 단어는?\n'You can see all of his _______ in this museum.'",
    options: ["artworks", "snails", "shells", "prices"],
    answer: "artworks",
    explanation: "artwork는 '예술 작품'이라는 뜻입니다."
  },
  {
    id: "q6_2",
    grade: 1,
    unit: "6단원 (L6. The Beauty of Art)",
    category: "curriculum",
    question: "'야수, 짐승'을 뜻하는 단어로 빈칸에 알맞은 것은?\n'The lion is the king of _______.'",
    options: ["beasts", "galleries", "emotions", "shapes"],
    answer: "beasts",
    explanation: "beast는 '야수, 짐승'이라는 뜻입니다."
  },
  {
    id: "q6_3",
    grade: 1,
    unit: "6단원 (L6. The Beauty of Art)",
    category: "curriculum",
    question: "다음 문장의 빈칸에 들어갈 알맞은 동사는?\n'The cook _______ a new dish yesterday.'",
    options: ["created", "gave up", "looked like", "traced"],
    answer: "created",
    explanation: "create는 '창작하다, 만들어내다'라는 뜻입니다."
  },
  {
    id: "q6_4",
    grade: 1,
    unit: "6단원 (L6. The Beauty of Art)",
    category: "curriculum",
    question: "'감정'을 뜻하는 영어 단어로 빈칸에 알맞은 것은?\n'Her face didn't show any _______.'",
    options: ["emotion", "exhibition", "shell", "nap"],
    answer: "emotion",
    explanation: "emotion은 '감정'을 뜻합니다."
  },
  {
    id: "q6_5",
    grade: 1,
    unit: "6단원 (L6. The Beauty of Art)",
    category: "curriculum",
    question: "다음 빈칸에 들어갈 단어로 '전시하다'에 해당하는 것은?\n'She will _______ her paintings at this art gallery.'",
    options: ["exhibit", "give up", "nap", "trace"],
    answer: "exhibit",
    explanation: "exhibit는 '전시하다, 출품하다'라는 뜻의 동사입니다."
  },
  {
    id: "q6_6",
    grade: 1,
    unit: "6단원 (L6. The Beauty of Art)",
    category: "curriculum",
    question: "'전시회'를 뜻하는 명사로 빈칸에 알맞은 것은?\n'The _______ is about traditional Korean arts.'",
    options: ["exhibition", "price", "snail", "success"],
    answer: "exhibition",
    explanation: "exhibition은 '전시회'라는 뜻입니다."
  },
  {
    id: "q6_7",
    grade: 1,
    unit: "6단원 (L6. The Beauty of Art)",
    category: "curriculum",
    question: "'비싼'의 반대말은 cheap입니다. 그렇다면 '비싼'을 뜻하는 단어는?\n'New sports cars are usually very _______.'",
    options: ["expensive", "simple", "wild", "unique"],
    answer: "expensive",
    explanation: "expensive는 '값비싼'이라는 뜻입니다."
  },
  {
    id: "q6_8",
    grade: 1,
    unit: "6단원 (L6. The Beauty of Art)",
    category: "curriculum",
    question: "'표현하다'를 뜻하는 단어로 빈칸에 알맞은 것은?\n'Nick wants to _______ his feelings clearly.'",
    options: ["express", "trace", "create", "exhibit"],
    answer: "express",
    explanation: "express는 '표현하다, 나타내다'라는 뜻입니다."
  },
  {
    id: "q6_9",
    grade: 1,
    unit: "6단원 (L6. The Beauty of Art)",
    category: "curriculum",
    question: "'미술관, 화랑'을 뜻하는 영어 단어로 빈칸에 알맞은 것은?\n'Many visitors visited the art _______ today.'",
    options: ["gallery", "library", "classroom", "stadium"],
    answer: "gallery",
    explanation: "art gallery는 '미술관, 화랑'을 뜻합니다."
  },
  {
    id: "q6_10",
    grade: 1,
    unit: "6단원 (L6. The Beauty of Art)",
    category: "curriculum",
    question: "'낮잠을 자다'라는 숙어로 빈칸에 알맞은 단어는?\n'I usually take a _______ for 20 minutes after lunch.'",
    options: ["nap", "walk", "shower", "photo"],
    answer: "nap",
    explanation: "take a nap은 '낮잠을 자다'라는 뜻입니다."
  },
  {
    id: "q6_11",
    grade: 1,
    unit: "6단원 (L6. The Beauty of Art)",
    category: "curriculum",
    question: "다음 빈칸에 들어갈 단어로 '자신의, 고유한'을 뜻하는 것은?\n'He has his _______ style of painting.'",
    options: ["own", "simple", "wild", "strange"],
    answer: "own",
    explanation: "own은 '자신만의, 자신의 것'을 뜻합니다."
  },
  {
    id: "q6_12",
    grade: 1,
    unit: "6단원 (L6. The Beauty of Art)",
    category: "curriculum",
    question: "'가격, 값'을 뜻하는 단어로 알맞은 것은?\n'What is the _______ of this book?'",
    options: ["price", "emotion", "shape", "success"],
    answer: "price",
    explanation: "price는 '가격'이라는 뜻입니다."
  },
  {
    id: "q6_13",
    grade: 1,
    unit: "6단원 (L6. The Beauty of Art)",
    category: "curriculum",
    question: "'무서운'을 뜻하는 형용사로 빈칸에 알맞은 것은?\n'I had a really _______ dream last night.'",
    options: ["scary", "simple", "unique", "friendly"],
    answer: "scary",
    explanation: "scary는 '무서운, 두려운'이라는 뜻입니다."
  },
  {
    id: "q6_14",
    grade: 1,
    unit: "6단원 (L6. The Beauty of Art)",
    category: "curriculum",
    question: "'모양, 형태'를 뜻하는 단어로 빈칸에 알맞은 것은?\n'What _______ is the table? It's round.'",
    options: ["shape", "price", "gallery", "beast"],
    answer: "shape",
    explanation: "shape는 '모양, 형태'를 뜻합니다."
  },
  {
    id: "q6_15",
    grade: 1,
    unit: "6단원 (L6. The Beauty of Art)",
    category: "curriculum",
    question: "'조개껍데기, 껍질'을 뜻하는 단어로 알맞은 것은?\n'Children are collecting sea _______ on the beach.'",
    options: ["shells", "snails", "emotions", "shapes"],
    answer: "shells",
    explanation: "shell은 '껍데기, 조개껍질'을 뜻합니다."
  },
  {
    id: "q6_16",
    grade: 1,
    unit: "6단원 (L6. The Beauty of Art)",
    category: "curriculum",
    question: "'단순한, 간단한'을 뜻하는 단어로 빈칸에 알맞은 것은?\n'These cups have _______ and clean designs.'",
    options: ["simple", "expensive", "scary", "strange"],
    answer: "simple",
    explanation: "simple은 '단순한, 간단한'이라는 뜻입니다."
  },
  {
    id: "q6_17",
    grade: 1,
    unit: "6단원 (L6. The Beauty of Art)",
    category: "curriculum",
    question: "'달팽이'를 뜻하는 영어 단어로 알맞은 것은?\n'A _______ is moving slowly across the leaf.'",
    options: ["snail", "beast", "lion", "bird"],
    answer: "snail",
    explanation: "snail은 '달팽이'입니다."
  },
  {
    id: "q6_18",
    grade: 1,
    unit: "6단원 (L6. The Beauty of Art)",
    category: "curriculum",
    question: "'이상한, 낯선'을 뜻하는 단어로 빈칸에 알맞은 것은?\n'She heard a _______ sound outside the window.'",
    options: ["strange", "simple", "friendly", "sweet"],
    answer: "strange",
    explanation: "strange는 '이상한, 기묘한'이라는 뜻입니다."
  },
  {
    id: "q6_19",
    grade: 1,
    unit: "6단원 (L6. The Beauty of Art)",
    category: "curriculum",
    question: "'성공'을 뜻하는 명사로 빈칸에 알맞은 것은?\n'The new art exhibition was a great _______.'",
    options: ["success", "price", "nap", "shell"],
    answer: "success",
    explanation: "success는 '성공'이라는 명사입니다."
  },
  {
    id: "q6_20",
    grade: 1,
    unit: "6단원 (L6. The Beauty of Art)",
    category: "curriculum",
    question: "'따라 그리다, 선을 긋다'를 뜻하는 동사로 알맞은 것은?\n'Please _______ the lines with your finger.'",
    options: ["trace", "give up", "express", "create"],
    answer: "trace",
    explanation: "trace는 '(선을) 따라가다, 윤곽을 그리다'라는 뜻입니다."
  },
  {
    id: "q6_21",
    grade: 1,
    unit: "6단원 (L6. The Beauty of Art)",
    category: "curriculum",
    question: "'독특한, 특별한'을 뜻하는 단어로 빈칸에 알맞은 것은?\n'Matisse created artworks in a very _______ way.'",
    options: ["unique", "simple", "scary", "bad"],
    answer: "unique",
    explanation: "unique는 '독특한, 특별한'이라는 뜻입니다."
  },
  {
    id: "q6_22",
    grade: 1,
    unit: "6단원 (L6. The Beauty of Art)",
    category: "curriculum",
    question: "'야생의, 거친'을 뜻하는 단어로 빈칸에 알맞은 것은?\n'Lions are _______ animals living in nature.'",
    options: ["wild", "simple", "expensive", "sweet"],
    answer: "wild",
    explanation: "wild는 '야생의, 거친'이라는 뜻입니다."
  },
  {
    id: "q6_23",
    grade: 1,
    unit: "6단원 (L6. The Beauty of Art)",
    category: "curriculum",
    question: "'처음에'를 뜻하는 알맞은 숙어 표현은?\n'Some students were nervous _______.'",
    options: ["at first", "at last", "at least", "at once"],
    answer: "at first",
    explanation: "at first는 '처음에'라는 뜻의 숙어입니다."
  },
  {
    id: "q6_24",
    grade: 1,
    unit: "6단원 (L6. The Beauty of Art)",
    category: "curriculum",
    question: "'포기하다'를 뜻하는 표현으로 빈칸에 알맞은 것은?\n'He never _______ his dream of becoming an artist.'",
    options: ["gave up", "looked like", "put together", "cut out"],
    answer: "gave up",
    explanation: "give up은 '포기하다'이며, 과거형은 gave up입니다."
  },
  {
    id: "q6_25",
    grade: 1,
    unit: "6단원 (L6. The Beauty of Art)",
    category: "curriculum",
    question: "'~처럼 보이다'를 뜻하는 표현으로 빈칸에 알맞은 것은?\n'The shapes _______ a snail shell.'",
    options: ["look like", "give up", "put together", "take a nap"],
    answer: "look like",
    explanation: "look like + 명사는 '~처럼 보이다'라는 뜻입니다."
  },

  // --- 2. Lesson 6 Grammar: 접속사 that & to부정사 명사적 용법 ---
  {
    id: "q6_26",
    grade: 1,
    unit: "6단원 (L6. The Beauty of Art)",
    category: "curriculum",
    question: "다음 두 문장을 접속사 that을 사용하여 한 문장으로 바르게 연결한 것은?\n'I think.' + 'The painting is beautiful.'",
    options: [
      "I think that the painting is beautiful.",
      "I think to the painting is beautiful.",
      "I think because the painting is beautiful.",
      "I think what the painting is beautiful."
    ],
    answer: "I think that the painting is beautiful.",
    explanation: "동사 think 뒤에서 목적어절을 이끌 때 접속사 that을 사용합니다."
  },
  {
    id: "q6_27",
    grade: 1,
    unit: "6단원 (L6. The Beauty of Art)",
    category: "curriculum",
    question: "다음 빈칸에 들어갈 알맞은 접속사는?\n'Do you think _______ I am strange?'",
    options: ["that", "to", "at", "for"],
    answer: "that",
    explanation: "think의 목적어절을 이끄는 접속사 that이 알맞습니다 (생략도 가능)."
  },
  {
    id: "q6_28",
    grade: 1,
    unit: "6단원 (L6. The Beauty of Art)",
    category: "curriculum",
    question: "다음 문장에서 밑줄 친 that의 쓰임은?\n'Some people thought [that] a beast painted her.'",
    options: [
      "문장을 이어주는 접속사 (~라는 것을)",
      "저것을 가리키는 지시대명사",
      "저 사물을 가리키는 지시형용사",
      "장소를 나타내는 관계부사"
    ],
    answer: "문장을 이어주는 접속사 (~라는 것을)",
    explanation: "thought의 목적어 역할을 하는 절을 연결하는 명사절 접속사 that입니다."
  },
  {
    id: "q6_29",
    grade: 1,
    unit: "6단원 (L6. The Beauty of Art)",
    category: "curriculum",
    question: "다음 빈칸에 들어갈 알맞은 접속사는?\n'I know _______ Henri Matisse is a famous French painter.'",
    options: ["that", "what", "which", "how"],
    answer: "that",
    explanation: "know의 목적어절을 이끄는 접속사 that이 옵니다."
  },
  {
    id: "q6_30",
    grade: 1,
    unit: "6단원 (L6. The Beauty of Art)",
    category: "curriculum",
    question: "다음 중 어법상 가장 자연스러운 문장은?",
    options: [
      "She believes that art can change the world.",
      "She believes to art can change the world.",
      "She believes with art can change the world.",
      "She believes of art can change the world."
    ],
    answer: "She believes that art can change the world.",
    explanation: "believe 뒤에 목적어절을 이끄는 접속사 that을 쓴 문장이 올바릅니다."
  },
  {
    id: "q6_31",
    grade: 1,
    unit: "6단원 (L6. The Beauty of Art)",
    category: "curriculum",
    question: "다음 빈칸에 들어갈 알맞은 말은?\n'He wanted _______ his emotions with bright colors.'",
    options: ["to express", "express", "expressed", "expressing to"],
    answer: "to express",
    explanation: "want는 목적어로 to부정사를 취합니다 (want + to부정사: ~하는 것을 원하다)."
  },
  {
    id: "q6_32",
    grade: 1,
    unit: "6단원 (L6. The Beauty of Art)",
    category: "curriculum",
    question: "'너는 더 많은 예술 작품을 찾고 싶니?'를 바르게 영작한 것은?",
    options: [
      "Do you want to find more artworks?",
      "Do you want find more artworks?",
      "Do you want finding more artworks?",
      "Do you want found more artworks?"
    ],
    answer: "Do you want to find more artworks?",
    explanation: "want의 목적어로 'to find(~을 찾는 것을)'가 올바릅니다."
  },
  {
    id: "q6_33",
    grade: 1,
    unit: "6단원 (L6. The Beauty of Art)",
    category: "curriculum",
    question: "다음 문장에서 to부정사의 밑줄 친 쓰임은?\n'My dream is [to become] an artist.'",
    options: [
      "명사적 용법 (보어: 예술가가 되는 것)",
      "형용사적 용법 (~할 명사)",
      "부사적 용법 (목적: ~하기 위하여)",
      "부사적 용법 (감정의 원인)"
    ],
    answer: "명사적 용법 (보어: 예술가가 되는 것)",
    explanation: "is 뒤에서 주어를 설명하는 주격 보어 역할을 하는 명사적 용법(~하는 것)입니다."
  },
  {
    id: "q6_34",
    grade: 1,
    unit: "6단원 (L6. The Beauty of Art)",
    category: "curriculum",
    question: "다음 빈칸에 들어갈 동사의 형태로 알맞은 것은?\n'They decided _______ the art museum this Saturday.'",
    options: ["to visit", "visiting", "visit", "visited"],
    answer: "to visit",
    explanation: "decide는 목적어로 to부정사를 취합니다 (decide to + 동사원형: ~하기로 결정하다)."
  },

  // --- 3. Lesson 6 Reading Comprehension (본문 이해: Pictures Talk About the Artist!) ---
  {
    id: "q6_35",
    grade: 1,
    unit: "6단원 (L6. The Beauty of Art)",
    category: "curriculum",
    question: "6과 본문에서 화자(말하는 사람) Amélie의 남편은 누구인가요?",
    options: [
      "Henri Matisse (앙리 마티스)",
      "Pablo Picasso (파블로 피카소)",
      "Vincent van Gogh (빈센트 반 고흐)",
      "Claude Monet (클로드 모네)"
    ],
    answer: "Henri Matisse (앙리 마티스)",
    explanation: "본문에서 Amélie는 'My husband, Henri Matisse'라고 소개합니다."
  },
  {
    id: "q6_36",
    grade: 1,
    unit: "6단원 (L6. The Beauty of Art)",
    category: "curriculum",
    question: "마티스(Henri Matisse)가 아내의 얼굴을 초록색으로 칠한 진짜 이유는 무엇인가요?",
    options: [
      "밝고 강렬한 색채로 자신의 감정을 표현하기 위해서",
      "아내의 얼굴이 실제로 초록색이었기 때문에",
      "초록색 물감밖에 남아있지 않아서",
      "아내를 무섭게 보이게 하려고"
    ],
    answer: "밝고 강렬한 색채로 자신의 감정을 표현하기 위해서",
    explanation: "본문에서 'He wanted to express his emotions with bright and wild colors.'라고 설명합니다."
  },
  {
    id: "q6_37",
    grade: 1,
    unit: "6단원 (L6. The Beauty of Art)",
    category: "curriculum",
    question: "초기에 사람들은 마티스의 독특한 화풍을 보고 그에게 어떤 별명을 붙였나요?",
    options: [
      "Wild Beast (야수)",
      "Green Giant (초록 거인)",
      "Color King (색채의 왕)",
      "Slow Snail (느린 달팽이)"
    ],
    answer: "Wild Beast (야수)",
    explanation: "사람들이 '야수가 그렸다'고 혹평하며 그에게 'Wild Beast(야수)'라는 별명을 붙였습니다 (야수파의 기원)."
  },
  {
    id: "q6_38",
    grade: 1,
    unit: "6단원 (L6. The Beauty of Art)",
    category: "curriculum",
    question: "마티스는 70세에 큰 병에 걸렸을 때 어떤 새로운 미술 기법을 창작했나요?",
    options: [
      "Cut-outs (색종이를 오려 붙이는 기법)",
      "Oil painting (유화 기법)",
      "Sculpture (대리석 조각)",
      "Digital art (컴퓨터 그래픽)"
    ],
    answer: "Cut-outs (색종이를 오려 붙이는 기법)",
    explanation: "본문에서 70세에 건강이 악화되었을 때 종이를 오려 붙이는 'cut-outs' 기법을 창작했습니다."
  },
  {
    id: "q6_39",
    grade: 1,
    unit: "6단원 (L6. The Beauty of Art)",
    category: "curriculum",
    question: "본문 후반부에서 마티스가 종이를 가위로 오려 만든 작품 속 동물은 무엇인가요?",
    options: [
      "Snail (달팽이)",
      "Tiger (호랑이)",
      "Lion (사자)",
      "Dragon (용)"
    ],
    answer: "Snail (달팽이)",
    explanation: "본문에서 'Yes, I'm a snail!'이라며 달팽이 껍데기 모양을 닮은 작품이 소개됩니다."
  },
  {
    id: "q6_40",
    grade: 1,
    unit: "6단원 (L6. The Beauty of Art)",
    category: "curriculum",
    question: "다음 본문의 내용과 일치하지 않는 것은?",
    options: [
      "마티스는 70세에 병에 걸리자 미술을 완전히 포기했다.",
      "아멜리(Amélie)의 실제 얼굴은 초록색이 아니었다.",
      "마티스는 밝고 거친 색채로 감정을 표현하고자 했다.",
      "달팽이 작품은 종이를 오려 붙여 형태를 조합해 만들었다."
    ],
    answer: "마티스는 70세에 병에 걸리자 미술을 완전히 포기했다.",
    explanation: "본문에서 'However, he never gave up art.(하지만 그는 결코 미술을 포기하지 않았다)'라고 했습니다."
  }
];

const merged = cleanQuestions.concat(l6Questions);
fs.writeFileSync(targetPath, JSON.stringify(merged, null, 2), 'utf8');

console.log(`Successfully added ${l6Questions.length} Lesson 6 questions!`);
console.log(`Total questions in questions_grade1.json: ${merged.length}`);
