import React, { useRef, useState } from 'react';

export default function TiltCardWrapper({ children, maxTilt = 15, style = {} }) {
  const tiltRef = useRef(null);
  const cardRef = useRef(null);
  const [isHover, setIsHover] = useState(false);
  const [isTilting, setIsTilting] = useState(false);

  const handlePointerMove = (e) => {
    if (!tiltRef.current || !cardRef.current) return;
    const rect = tiltRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const w = rect.width;
    const h = rect.height;

    // Normalised position from center (-1 to +1)
    const normX = (x - w / 2) / (w / 2);
    const normY = (y - h / 2) / (h / 2);

    // Calculate rotation degrees (rotateX is pitch, rotateY is yaw)
    const rxDeg = (-normY * maxTilt).toFixed(2);
    const ryDeg = (normX * maxTilt).toFixed(2);

    // Calculate glare circle coordinates in percentage
    const gxPct = ((x / w) * 100).toFixed(2);
    const gyPct = ((y / h) * 100).toFixed(2);

    const cardEl = cardRef.current;
    cardEl.style.setProperty('--tilt-rx', `${rxDeg}deg`);
    cardEl.style.setProperty('--tilt-ry', `${ryDeg}deg`);
    cardEl.style.setProperty('--tilt-gx', `${gxPct}%`);
    cardEl.style.setProperty('--tilt-gy', `${gyPct}%`);

    if (!isTilting) setIsTilting(true);
    if (!isHover) setIsHover(true);
  };

  const handlePointerLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.setProperty('--tilt-rx', '0deg');
      cardRef.current.style.setProperty('--tilt-ry', '0deg');
    }
    setIsTilting(false);
    setIsHover(false);
  };

  const handlePointerEnter = () => {
    setIsHover(true);
  };

  return (
    <div
      ref={tiltRef}
      className={`t-tilt ${isHover ? 'is-hover' : ''}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerEnter={handlePointerEnter}
      style={{ width: '100%', ...style }}
    >
      <div
        ref={cardRef}
        className={`t-tilt-card ${isTilting ? 'is-tilting' : ''}`}
      >
        {children}
        <div className="t-tilt-glare" />
      </div>
    </div>
  );
}
