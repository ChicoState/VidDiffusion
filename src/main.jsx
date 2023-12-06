// main.jsx

import React from "react";
import * as ReactDOM from "react-dom/client";
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import ErrorPage from "./ErrorPage.jsx";
import { PromptForm } from "./PromptForm.jsx";

import App from "./app.jsx";

const router = createBrowserRouter([
    {
        path: "/main_window",
        element: <App />,
        errorElement: <ErrorPage />,
        /*
        children: [
            {
                path: "prompt_form",
                element: <PromptForm />,
            },
        ],
        */
    },
    {
        path: "prompt_form",
        element: <PromptForm />,
    },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);

