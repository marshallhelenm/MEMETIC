import Alert from "@mui/material/Alert";
import { useState } from "react";
import { useEffect } from "react";

export default function CopyAlert() {
  const [alertOpacity, setAlertOpacity] = useState("in");

  useEffect(() => {
    let intervalID = 0;
    setInterval(() => {
      if (alertOpacity < 1) {
        setAlertOpacity((a) => {
          return a + 0.1;
        });
      } else {
        clearInterval(intervalID);
      }
    }, 300);
  }, [alertOpacity]);

  return (
    <Alert
      severity="success"
      sx={{ position: "absolute", zIndex: 99, opacity: alertOpacity }}
      id="copy-alert"
    >
      Room Key Copied!
    </Alert>
  );
}
