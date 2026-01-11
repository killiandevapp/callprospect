import React from "react";

type MainAppProps = {
  user?: { email?: string };
  logout?: () => void;
};

export default function MainApp({ user, logout }: MainAppProps) {
  return (
    <div>
      <p>Hello Main</p>
      {user && <p>User: {user.email}</p>}
      {logout && <button onClick={logout}>Déconnexion</button>}
    </div>
  );
}
