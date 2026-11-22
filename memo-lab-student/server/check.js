// 서버 검증 자동 확인 스크립트 (화면을 거치지 않고 서버에 직접 요청합니다)
// 사용법: 서버를 켠 상태에서 `npm run check`
const BASE = process.env.API_URL ?? "http://localhost:4000";

const cases = [
  {
    name: "정상 입력은 201로 등록되고 앞뒤 공백이 정리된다",
    body: { text: "  우유 사기  " },
    expectStatus: 201,
    expectText: "우유 사기",
  },
  { name: "빈 문자열은 400으로 거부된다", body: { text: "" }, expectStatus: 400 },
  { name: "공백만 있는 입력은 400으로 거부된다", body: { text: "   " }, expectStatus: 400 },
  { name: "text 필드가 없으면 400으로 거부된다", body: {}, expectStatus: 400 },
  { name: "text가 문자열이 아니면 400으로 거부된다", body: { text: 123 }, expectStatus: 400 },
  { name: "50자를 넘으면 400으로 거부된다", body: { text: "a".repeat(51) }, expectStatus: 400 },
  { name: "올바르지 않은 JSON은 400으로 거부된다", raw: '{"text":', expectStatus: 400 },
];

let failed = 0;
function report(ok, name, detail) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `\n      → ${detail}`}`);
  if (!ok) failed++;
}

async function getMemos() {
  const res = await fetch(`${BASE}/api/memos`);
  return (await res.json()).data;
}

async function post(c) {
  const res = await fetch(`${BASE}/api/memos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: c.raw ?? JSON.stringify(c.body),
  });
  let body = null;
  try {
    body = await res.json();
  } catch {
    // JSON이 아닌 응답
  }
  return { status: res.status, body };
}

try {
  const before = (await getMemos()).length;

  for (const c of cases) {
    const { status, body } = await post(c);
    if (status !== c.expectStatus) {
      report(false, c.name, `상태 코드 기대값 ${c.expectStatus}, 실제 ${status}`);
      continue;
    }
    if (status === 201) {
      const ok = body?.data?.id !== undefined && body?.data?.text === c.expectText;
      report(ok, c.name, `응답 data가 예상과 다릅니다: ${JSON.stringify(body)}`);
    } else {
      const ok = typeof body?.error?.message === "string";
      report(ok, c.name, `응답 본문에 error.message가 없습니다: ${JSON.stringify(body)}`);
    }
  }

  const after = (await getMemos()).length;
  report(
    after === before + 1,
    "잘못된 요청은 저장되지 않는다 (정상 요청 1건만 늘어난다)",
    `확인 전 ${before}개 → 확인 후 ${after}개`,
  );

  console.log(failed === 0 ? "\n모든 항목 통과!" : `\n${failed}개 항목 실패`);
  process.exit(failed === 0 ? 0 : 1);
} catch (err) {
  console.error(`서버(${BASE})에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.`);
  console.error(err.cause?.code ?? err.message);
  process.exit(1);
}
