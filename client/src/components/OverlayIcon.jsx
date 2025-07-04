import PropTypes from "prop-types";

function OverlayIcon({ icon }) {
  return <i className={`fa-solid fa-${icon} fa-lg overlay-icon`}></i>;
}

OverlayIcon.propTypes = {
  icon: PropTypes.string,
};

export default OverlayIcon;
