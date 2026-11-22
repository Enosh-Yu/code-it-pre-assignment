import express from "express";

const app = express();
const PORT = 4000;
const MAX_LENGTH = 50;

// 요청 본문의 JSON을 읽어 req.body에 넣어 줍니다.
app.use(express.json());

// 데이터는 서버 메모리에 보관합니다. (서버를 재시작하면 사라집니다)
const memos = [];
let nextId = 1;

// 입력값 검증: 통과하면 { ok: true, value }, 실패하면 { ok: false, message }를 돌려줍니다.
function validateMemo(body) {
  // TODO 1: 아래 규칙을 순서대로 검사하세요.
  //   - body?.text가 문자열이 아니면 실패 (text 필드가 없거나 숫자인 경우 포함)
  //   - 앞뒤 공백을 제거(trim)한 결과가 빈 문자열이면 실패
  //   - trim한 결과가 MAX_LENGTH자를 넘으면 실패
  //   - 모두 통과하면 trim한 값을 value로 돌려주기
  // 지금은 어떤 값이든 통과시키고 있습니다.
  return { ok: true, value: body?.text };
}

app.get("/api/memos", (req, res) => {
  res.json({ data: memos });
});

app.post("/api/memos", (req, res) => {
  const result = validateMemo(req.body);

  // TODO 2: 검증에 실패하면 저장하지 말고 아래 형식으로 응답한 뒤 함수를 끝내세요(return).
  //   상태 코드: 400
  //   본문: { error: { field: 'text', message: result.message } }

  const memo = {
    id: nextId++,
    text: result.value,
    createdAt: new Date().toISOString(),
  };
  memos.push(memo);

  res.status(201).json({ data: memo });
});

// 오류 처리 미들웨어: 잘못된 JSON 등도 JSON 형식으로 응답합니다. (수정하지 않아도 됩니다)
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      error: { message: "요청 본문이 올바른 JSON 형식이 아닙니다." },
    });
  }
  console.error(err);
  res.status(500).json({ error: { message: "서버 오류가 발생했습니다." } });
});

app.listen(PORT, () => {
  console.log(`API 서버 실행 중: http://localhost:${PORT}`);
});
