import React, { useState, useEffect, useMemo } from "react";

function ReactCardFlip(props) {
  const {
    cardStyles = { back: {}, front: {} },
    cardZIndex = "auto",
    containerStyle = {},
    containerClassName,
    flipDirection = "horizontal",
    flipSpeedBackToFront = 0.6,
    flipSpeedFrontToBack = 0.6,
    infinite = false,
    isFlipped = false,
    children,
  } = props;

  const { back, front } = cardStyles;
  const [isFlippedState, setFlipped] = useState(isFlipped);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (isFlipped !== isFlippedState) {
      setFlipped(isFlipped);
      setRotation((c) => c + 180);
    }
  }, [isFlipped]);

  const getContainerClassName = useMemo(() => {
    let className = "react-card-flip";
    if (containerClassName) {
      className += ` ${containerClassName}`;
    }
    return className;
  }, [containerClassName]);

  const getComponent = (key) => {
    if (!children || React.Children.count(children) !== 2) {
      throw new Error(
        "Component ReactCardFlip requires 2 children to function",
      );
    }
    return React.Children.toArray(children)[key];
  };

  const frontRotateY = `rotateY(${infinite ? rotation : isFlipped ? 180 : 0}deg)`;
  const backRotateY = `rotateY(${infinite ? rotation + 180 : isFlipped ? 0 : -180}deg)`;
  const frontRotateX = `rotateX(${infinite ? rotation : isFlipped ? 180 : 0}deg)`;
  const backRotateX = `rotateX(${infinite ? rotation + 180 : isFlipped ? 0 : -180}deg)`;

  const styles = {
    back: {
      WebkitBackfaceVisibility: "hidden",
      backfaceVisibility: "hidden",
      height: "100%",
      left: "0",
      position: isFlipped ? "relative" : "absolute",
      top: "0",
      transform: flipDirection === "horizontal" ? backRotateY : backRotateX,
      transformStyle: "preserve-3d",
      transition: `${flipSpeedFrontToBack}s`,
      width: "100%",
      zIndex: isFlipped ? "2" : "1",
      ...back,
    },
    container: {
      zIndex: `${cardZIndex}`,
    },
    flipper: {
      height: "100%",
      perspective: "1000px",
      position: "relative",
      width: "100%",
    },
    front: {
      WebkitBackfaceVisibility: "hidden",
      backfaceVisibility: "hidden",
      height: "100%",
      left: "0",
      position: isFlipped ? "absolute" : "relative",
      top: "0",
      transform: flipDirection === "horizontal" ? frontRotateY : frontRotateX,
      transformStyle: "preserve-3d",
      transition: `${flipSpeedBackToFront}s`,
      width: "100%",
      zIndex: "2",
      ...front,
    },
  };

  return (
    <div
      className={getContainerClassName}
      style={{ ...styles.container, ...containerStyle }}
    >
      <div className="react-card-flipper" style={styles.flipper}>
        <div className="react-card-front" style={styles.front}>
          {getComponent(0)}
        </div>
        <div className="react-card-back" style={styles.back}>
          {getComponent(1)}
        </div>
      </div>
    </div>
  );
}

export default ReactCardFlip;
