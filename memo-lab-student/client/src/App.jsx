import { useEffect, useState } from "react";
import "./App.css";

// 서버 검증을 화면에서 확인하기 위한 스위치
// true로 바꾸면 화면 검증을 건너뛰고 입력값을 그대로 서버로 보냅니다.
const SKIP_CLIENT_VALIDATION = false;

export default function App() {
  const [text, setText] = useState("");
  const [memos, setMemos] = useState([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 처음 화면이 열릴 때 서버에 저장된 메모 목록을 불러옵니다. (완성되어 있음)
  useEffect(() => {
    fetch("/api/memos")
      .then((res) => res.json())
      .then((body) => setMemos(body.data))
      .catch(() => setError("메모 목록을 불러오지 못했습니다."));
  }, []);

  function handleChange(event) {
    setText(event.target.value);
    if (error) setError(""); // 입력을 고치기 시작하면 이전 오류 안내를 지웁니다.
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    // TODO 3: 화면 검증
    //   SKIP_CLIENT_VALIDATION이 false이고, 앞뒤 공백을 제거한 text가 빈 문자열이면
    //   setError('메모 내용을 입력해 주세요.')를 호출하고 요청을 보내지 않은 채 return 하세요.

    setIsSubmitting(true);
    try {
      // TODO 4: 등록 요청과 응답 처리
      //   (1) fetch로 POST /api/memos 요청을 보내세요.
      //       - headers에 'Content-Type': 'application/json'
      //       - body는 JSON.stringify({ text })
      //   (2) 응답 본문을 res.json()으로 읽으세요.
      //   (3) res.ok가 false면 body.error.message를 setError로 표시하고 return 하세요.
      //       (입력값은 지우지 않습니다. 사용자가 고쳐서 다시 보낼 수 있어야 합니다.)
      //   (4) 성공이면 body.data를 memos 목록 끝에 추가하고 입력창을 비우세요.
    } catch {
      setError("서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="container">
      <h1>한 줄 메모</h1>

      <form onSubmit={handleSubmit} className="memo-form">
        <input
          value={text}
          onChange={handleChange}
          placeholder="메모를 입력하세요 (50자 이하)"
          aria-invalid={error ? "true" : "false"}
          aria-describedby="memo-error"
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "등록 중…" : "등록"}
        </button>
      </form>

      {/* TODO 5: error가 있을 때만 아래 문단을 보여 주세요. */}
      <p id="memo-error" className="error" role="alert">
        {error}
      </p>

      <ul className="memo-list">
        {memos.map((memo) => (
          <li key={memo.id}>{memo.text}</li>
        ))}
      </ul>
    </main>
  );
}
