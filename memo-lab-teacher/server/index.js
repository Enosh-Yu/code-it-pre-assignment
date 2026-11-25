import express from "express";

const app = express();
const PORT = 4000;
const MAX_LENGTH = 50;

// 요청 본문의 JSON을 읽어 req.body에 넣어 줍니다.
app.use(express.json());

// 데이터는 서버 메모리에 보관합니다. (서버를 재시작하면 사라집니다)
const memos = [];
let nextId = 1;

// 입력값 검증: 통과하면 정리된 값을, 실패하면 이유를 돌려줍니다.
function validateMemo(body) {
  // TODO 1
  const text = body?.text;

  if (typeof text !== "string") {
    return { ok: false, message: "text는 문자열이어야 합니다." };
  }

  const trimmed = text.trim();

  if (trimmed.length === 0) {
    return { ok: false, message: "메모 내용을 입력해 주세요." };
  }

  if (trimmed.length > MAX_LENGTH) {
    return { ok: false, message: `메모는 ${MAX_LENGTH}자 이하로 입력해 주세요.` };
  }

  return { ok: true, value: trimmed };
}

app.get("/api/memos", (req, res) => {
  res.json({ data: memos });
});

app.post("/api/memos", (req, res) => {
  const result = validateMemo(req.body);

  // TODO 2
  if (!result.ok) {
    return res.status(400).json({
      error: { field: "text", message: result.message },
    });
  }

  const memo = {
    id: nextId++,
    text: result.value,
    createdAt: new Date().toISOString(),
  };
  memos.push(memo);

  res.status(201).json({ data: memo });
});

// 오류 처리 미들웨어: 잘못된 JSON 등도 JSON 형식으로 응답합니다.
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
