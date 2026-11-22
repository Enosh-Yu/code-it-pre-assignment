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

  // 처음 화면이 열릴 때 서버에 저장된 메모 목록을 불러옵니다.
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

    // 1) 화면 검증: 명백히 잘못된 입력은 요청을 보내기 전에 막습니다.
    if (!SKIP_CLIENT_VALIDATION && text.trim() === "") {
      setError("메모 내용을 입력해 주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 2) 서버에 등록 요청을 보냅니다.
      const res = await fetch("/api/memos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const body = await res.json();

      // 3) 실패 응답(4xx, 5xx)이면 서버가 보낸 안내를 표시하고, 입력값은 그대로 둡니다.
      if (!res.ok) {
        setError(body.error?.message ?? "등록에 실패했습니다.");
        return;
      }

      // 4) 성공 응답이면 서버가 돌려준 데이터를 목록에 추가하고 입력창을 비웁니다.
      setMemos((prev) => [...prev, body.data]);
      setText("");
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

      {error && (
        <p id="memo-error" className="error" role="alert">
          {error}
        </p>
      )}

      <ul className="memo-list">
        {memos.map((memo) => (
          <li key={memo.id}>{memo.text}</li>
        ))}
      </ul>
    </main>
  );
}
