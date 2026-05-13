import React, { Suspense } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { colorC } from "../assets/styles";
import Logo from "./Logo";

interface GuessySuspenseProps {
  children: React.ReactNode;
}

const GuessySuspense: React.FC<GuessySuspenseProps> = ({ children }) => (
  <Suspense fallback={<CircularProgress sx={{ color: colorC }} />}>
    {children}
  </Suspense>
);

interface LogoSuspenseProps {
  children: React.ReactNode;
}

const LogoSuspense: React.FC<LogoSuspenseProps> = ({ children }) => {
  function logoDiv() {
    return (
      <div style={{ alignContent: "center", justifyContent: "center" }}>
        <Logo />
      </div>
    );
  }
  return <Suspense fallback={logoDiv()}>{children}</Suspense>;
};

export { GuessySuspense, LogoSuspense };
