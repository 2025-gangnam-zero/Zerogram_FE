import { createGlobalStyle } from "styled-components";
import reset from "styled-reset";

const GlobalStyle = createGlobalStyle`
  ${reset}
  
  * {
    box-sizing: border-box;
  }
  
  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }
  
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #f8f9fa;
    color: #2c3e50;
    line-height: 1.6;
    margin: 0;
    padding: 0;
  }
  
  a {
    color: inherit;
    text-decoration: none;
  }
  
  button {
    border: none;
    background: none;
    cursor: pointer;
    font-family: inherit;
  }
  
  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
  }
  
  img {
    max-width: 100%;
    height: auto;
  }
  
  /* 스크롤바 스타일링 */
  ::-webkit-scrollbar {
    width: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
  
  /* 포커스 아웃라인 */
  *:focus {
    outline: 2px solid #3498db;
    outline-offset: 2px;
  }
  
  /* 선택 텍스트 스타일 */
  ::selection {
    background-color: #3498db;
    color: white;
  }
  
  /* 모바일 터치 최적화 */
  @media (max-width: 768px) {
    html {
      font-size: 14px;
    }
    
    body {
      -webkit-tap-highlight-color: transparent;
    }
  }
`;

export default GlobalStyle;
