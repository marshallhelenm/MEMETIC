import React from "react";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";

interface ReconnectingBannerProps {
  open: boolean;
}

/** Shown over the game while the socket is reconnecting. */
const ReconnectingBanner: React.FC<ReconnectingBannerProps> = ({ open }) => (
  <Snackbar open={open} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
    <Alert
      severity="warning"
      variant="filled"
      icon={<CircularProgress size={18} color="inherit" />}
      data-testid="reconnecting-banner"
    >
      Reconnecting…
    </Alert>
  </Snackbar>
);

export default ReconnectingBanner;
