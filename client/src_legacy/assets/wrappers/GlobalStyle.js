import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  /* Base styles for RTL layout */
  body {
    direction: rtl;
    text-align: right;
  }

  /* Additional RTL styles for specific components */
  .rtl-text {
    text-align: left; /* Override for left-aligned elements */
  }
`;

export default GlobalStyle;
