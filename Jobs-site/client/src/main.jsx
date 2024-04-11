import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import { ToastContainer } from "react-toastify";
import GlobalStyle from "./assets/wrappers/GlobalStyle.js"; // Import the global styles
ReactDOM.createRoot(document.getElementById("root")).render(
  <>
    <GlobalStyle />
    <App />
    <ToastContainer position="top-center" />
  </>
);
