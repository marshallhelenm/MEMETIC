import CircularProgress from "@mui/material/CircularProgress";

import { colorC } from "../assets/styles";
import { Suspense } from "react";
import Logo from "./Logo";

function GuessySuspense({ children }) {
  return (
    <Suspense fallback={<CircularProgress sx={{ color: colorC }} />}>
      {children}
    </Suspense>
  );
}

function LogoSuspense({ children }) {
  function logoDiv() {
    return (
      <div style={{ alignContent: "center", justifyContent: "center" }}>
        <Logo />
      </div>
    );
  }
  return <Suspense fallback={logoDiv()}>{children}</Suspense>;
}

export { GuessySuspense, LogoSuspense };
