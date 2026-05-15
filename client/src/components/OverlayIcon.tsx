import React from "react";

interface OverlayIconProps {
  icon: string;
}

const OverlayIcon: React.FC<OverlayIconProps> = ({ icon }) => {
  return <i className={`fa-solid fa-${icon} fa-lg overlay-icon`}></i>;
};

export default OverlayIcon;
