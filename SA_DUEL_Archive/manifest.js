/* ============================================================
   SA DUELS — Sacred Agent Duels  |  manifest.js
   루트(SA_DUEL/)에 위치. 새 항목 추가 시 이 파일만 수정.

   · folder : SA/ 또는 Archives/ 기준 하위 폴더명
   · thumb  : 해당 폴더 내 상대 경로
   ============================================================ */

const SA_MANIFEST = {

  apostles: [
    {
      code:    "SA_001",
      name:    "빅토리아",
      name_en: "VICTORIA",
      world:   "마천루의 세계",
      folder:  "S001",
      thumb:   "src/profile.png",
      wins:    0,
      losses:  1
    },
    {
      code:    "SA_002",
      name:    "다이애나",
      name_en: "DIANA",
      world:   "별들의 세계",
      folder:  "S002",
      thumb:   "src/profile.png",
      wins:    0,
      losses:  1
    },
    {
      code:    "SA_003",
      name:    "캐서린",
      name_en: "CATHERINE",
      world:   "대양의 세계",
      folder:  "S003",
      thumb:   "src/profile.png",
      wins:    1,
      losses:  1
    },
    {
      code:    "SA_004",
      name:    "릴리스",
      name_en: "LILITH",
      world:   "어둠의 세계",
      folder:  "S004",
      thumb:   "src/profile.png",
      wins:    1,
      losses:  0
    },
    {
      code:    "SA_005",
      name:    "이졸데",
      name_en: "ISOLDE",
      world:   "전설의 세계",
      folder:  "S005",
      thumb:   "src/profile.png",
      wins:    0,
      losses:  0
    },
    {
      code:    "SA_006",
      name:    "카산드라",
      name_en: "CASSANDRA",
      world:   "마의 세계",
      folder:  "S006",
      thumb:   "src/profile.png",
      wins:    0,
      losses:  0
    },
    {
      code:    "SA_007",
      name:    "나리",
      name_en: "NARI",
      world:   "아침의 세계",
      folder:  "S007",
      thumb:   "src/profile.png",
      wins:    1,
      losses:  0
    },
    {
      code:    "SA_008",
      name:    "힐다",
      name_en: "HILDA",
      world:   "끝의 세계",
      folder:  "S008",
      thumb:   "src/profile.png",
      wins:    0,
      losses:  0
    }
  ],

  battles: [
    {
      code:        "B001",
      matchup:     "빅토리아 vs 릴리스",
      home:        "SA_001",
      home_name:   "빅토리아",
      away:        "SA_004",
      away_name:   "릴리스",
      home_result: "lose",
      folder:      "B001",
      thumb:       "src/thumb.png"
    },
    {
      code:        "B002",
      matchup:     "다이애나 vs 캐서린",
      home:        "SA_002",
      home_name:   "다이애나",
      away:        "SA_003",
      away_name:   "캐서린",
      home_result: "lose",
      folder:      "B002",
      thumb:       "src/thumb.png"
    },
    {
      code:        "B003",
      matchup:     "캐서린 vs 나리",
      home:        "SA_003",
      home_name:   "캐서린",
      away:        "SA_007",
      away_name:   "나리",
      home_result: "lose",
      folder:      "B003",
      thumb:       "src/thumb.png"
    }
  ]

};
