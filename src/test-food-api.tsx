import React, { useState } from "react";
import { searchFoodByName } from "./api/food";

const TestFoodAPI: React.FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      console.log("API Key:", process.env.REACT_APP_FOOD_API_KEY);
      console.log("Testing with query:", query);

      const data = await searchFoodByName(query);
      console.log("API Response:", data);
      setResults(data);
    } catch (err) {
      console.error("API Error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Food API 테스트</h2>

      <div style={{ marginBottom: "20px" }}>
        <label>
          API Key:{" "}
          {process.env.REACT_APP_FOOD_API_KEY ? "설정됨" : "설정되지 않음"}
        </label>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="음식명 입력 (예: 김치)"
          style={{ padding: "8px", marginRight: "10px", width: "200px" }}
        />
        <button onClick={handleTest} disabled={loading}>
          {loading ? "검색 중..." : "테스트"}
        </button>
      </div>

      {error && (
        <div style={{ color: "red", marginBottom: "20px" }}>에러: {error}</div>
      )}

      {results.length > 0 && (
        <div>
          <h3>검색 결과 ({results.length}개):</h3>
          <ul>
            {results.slice(0, 5).map((item, index) => (
              <li key={index}>
                <strong>{item.DESC_KOR}</strong> - {item.NUTR_CONT1} kcal
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TestFoodAPI;
