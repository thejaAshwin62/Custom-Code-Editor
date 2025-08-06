import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { ClerkProvider } from "@clerk/clerk-react";
import { Toaster } from "sonner";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";

const clerkPubKey =
  "pk_test_Y29tcG9zZWQtdGVycmFwaW4tNzEuY2xlcmsuYWNjb3VudHMuZGV2JA";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors closeButton duration={4000} />
    </ClerkProvider>
  </StrictMode>
);
