
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  // @ts-ignore: CSS imports may not have type declarations in this setup
  import "./styles/index.css";

  createRoot(document.getElementById("root")!).render(<App />);
  