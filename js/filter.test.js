(function runTests() {
  const images = [
    { src: "a.jpg", tags: ["패배", "기본"] },
    { src: "b.jpg", tags: ["메인 일러스트", "기본"] },
    { src: "c.jpg", tags: ["패배", "평상복"] }
  ];

  function assert(condition, message) {
    if (!condition) throw new Error("FAIL: " + message);
    console.log("PASS: " + message);
  }

  const all = filterImages(images, []);
  assert(all.length === 3, "태그 없으면 전체 반환");

  const defeated = filterImages(images, ["패배"]);
  assert(defeated.length === 2, "패배 태그 2개");
  assert(defeated.every(img => img.tags.includes("패배")), "모두 패배 태그 보유");

  const defeatedDefault = filterImages(images, ["패배", "기본"]);
  assert(defeatedDefault.length === 1, "패배 AND 기본 = 1개");
  assert(defeatedDefault[0].src === "a.jpg", "정확한 이미지 반환");

  const none = filterImages(images, ["없는태그"]);
  assert(none.length === 0, "매칭 없으면 빈 배열");

  console.log("모든 테스트 통과");
})();
