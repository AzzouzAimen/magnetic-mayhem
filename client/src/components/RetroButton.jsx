import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './RetroButton.module.css'; // Import the CSS Module
import clsx from 'clsx';

// This custom hook remains a great way to manage the tilt effect
const useRetroButtonEffects = (ref) => {
  const [tiltClass, setTiltClass] = useState('');

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e) => {
      const leftOffset = element.getBoundingClientRect().left;
      const btnWidth = element.offsetWidth;
      const mouseX = e.pageX;

      // Match the reference implementation thresholds
      if (mouseX < leftOffset + 0.3 * btnWidth) {
        setTiltClass(styles.tiltLeft);
      } else if (mouseX > leftOffset + 0.65 * btnWidth) {
        setTiltClass(styles.tiltRight);
      } else {
        setTiltClass(styles.tiltCenter);
      }
    };

    const handleMouseLeave = () => {
      setTiltClass('');
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [ref]);

  return tiltClass;
};

// The main button component with a simplified and correct structure
const RetroButton = ({ as, to, onClick, color = 'green', children, ...props }) => {
  const buttonRef = useRef(null);
  const tiltClass = useRetroButtonEffects(buttonRef);

  const colorClass = styles[color];

  // The simplified JSX structure. A single inner span is all we need.
  const buttonContent = (
    <span className={styles.topLayer}>
      <span className={styles.text} label={children}></span>
    </span>
  );

  const Component = as === 'Link' ? Link : 'button';

  return (
    <Component
      ref={buttonRef}
      to={to}
      onClick={onClick}
      className={clsx(styles.retroBtn, colorClass, tiltClass)}
      {...props}
    >
      {buttonContent}
    </Component>
  );
};

export default RetroButton;