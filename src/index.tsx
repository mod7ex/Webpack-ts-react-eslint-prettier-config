import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import "~/assets/scss/index.scss";
import App from "~/App";

const root = createRoot(document.getElementById("root")!);

root.render(
    <StrictMode>
        <App />
    </StrictMode>
);
