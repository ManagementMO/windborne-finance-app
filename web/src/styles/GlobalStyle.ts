import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  /* CSS Reset */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body {
    height: 100%;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #E2E8F0; /* slate-200 */
    line-height: 1.5;
  }

  #root {
    min-height: 100vh;
    isolation: isolate;
  }

  /* Animated Gradient Background */
  body {
    background: linear-gradient(
      135deg,
      hsl(222, 84%, 5%),
      hsl(210, 60%, 15%),
      hsl(260, 50%, 10%),
      hsl(222, 84%, 5%)
    );
    background-size: 400% 400%;
    animation: gradient-animation 20s ease infinite;
  }

  @keyframes gradient-animation {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;
