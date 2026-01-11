import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "../style/login.css"

// Page login
export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [err, setErr] = useState<string>("");


  // Gestion de la soumission du formulaire

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr("");
    try {
      await login({ email, password });
      nav("/app", { replace: true });
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? "identifiants invalide");
    }
  };

  return (
    <section id="sctLogin">
      <div id="ctnLoginGen">
        <div>
          <h1>Vous revoilà !</h1>
          <h2>Entrez vos identifiants pour vous connecter.</h2>
        </div>

        <form onSubmit={onSubmit}>


          <div className="ctnInputLogin">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clip-path="url(#clip0_585_245)">
                <path d="M18.3346 5.00016C18.3346 4.0835 17.5846 3.3335 16.668 3.3335H3.33464C2.41797 3.3335 1.66797 4.0835 1.66797 5.00016V15.0002C1.66797 15.9168 2.41797 16.6668 3.33464 16.6668H16.668C17.5846 16.6668 18.3346 15.9168 18.3346 15.0002V5.00016ZM16.668 5.00016L10.0013 9.16683L3.33464 5.00016H16.668ZM16.668 15.0002H3.33464V6.66683L10.0013 10.8335L16.668 6.66683V15.0002Z" fill="#37AED3" />
              </g>
              <defs>
                <clipPath id="clip0_585_245">
                  <rect width="20" height="20" fill="white" />
                </clipPath>
              </defs>
            </svg>


            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>


          <div className="ctnInputLogin">
            <svg width="20" height="19" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clip-path="url(#clip0_585_251)">
                <path d="M14.9987 6.33317H14.1654V4.74984C14.1654 2.56484 12.2987 0.791504 9.9987 0.791504C7.6987 0.791504 5.83203 2.56484 5.83203 4.74984V6.33317H4.9987C4.08203 6.33317 3.33203 7.04567 3.33203 7.9165V15.8332C3.33203 16.704 4.08203 17.4165 4.9987 17.4165H14.9987C15.9154 17.4165 16.6654 16.704 16.6654 15.8332V7.9165C16.6654 7.04567 15.9154 6.33317 14.9987 6.33317ZM7.4987 4.74984C7.4987 3.43567 8.61536 2.37484 9.9987 2.37484C11.382 2.37484 12.4987 3.43567 12.4987 4.74984V6.33317H7.4987V4.74984ZM14.9987 15.8332H4.9987V7.9165H14.9987V15.8332ZM9.9987 13.4582C10.9154 13.4582 11.6654 12.7457 11.6654 11.8748C11.6654 11.004 10.9154 10.2915 9.9987 10.2915C9.08203 10.2915 8.33203 11.004 8.33203 11.8748C8.33203 12.7457 9.08203 13.4582 9.9987 13.4582Z" fill="#37AED3" />
              </g>
              <defs>
                <clipPath id="clip0_585_251">
                  <rect width="20" height="19" fill="white" />
                </clipPath>
              </defs>
            </svg>
            <input
              placeholder="Mot de passe"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {err && <div style={{ color: "red" }}>{err}</div>}
          <button type="submit">Se connecter</button>
        </form>
      </div>
    </section>

  );
}
