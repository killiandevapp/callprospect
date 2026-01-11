import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Login from "./Login";
import { AuthProvider } from "../auth/AuthContext";

test("affiche le formulaire de login", () => {
  render(
    <AuthProvider>
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    </AuthProvider>
  );

  expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/mot de passe/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /se connecter/i })).toBeInTheDocument();
});
