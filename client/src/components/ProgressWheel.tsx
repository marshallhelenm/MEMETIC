import React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { colorC } from "../assets/styles";

const ProgressWheel: React.FC = () => {
  return <CircularProgress sx={{ color: colorC }} />;
};

export default ProgressWheel;
