import PropTypes from "prop-types";
function MemeOrigin({ item }) {
  if (item.origin) {
    return (
      <div
        className="overlay-item stub-origin"
        onClick={(e) => e.stopPropagation()}
      >
        <a href={item.origin} target="_blank" rel="noopener noreferrer">
          <i className="fa-solid fa-question fa-lg overlay-icon"></i>
        </a>
      </div>
    );
  } else {
    return (
      <div className="">
        <i className="fa-solid fa-question fa-lg dud-origin"></i>
      </div>
    );
  }
}

MemeOrigin.propTypes = {
  item: PropTypes.shape({
    origin: PropTypes.string,
  }),
};

export default MemeOrigin;
