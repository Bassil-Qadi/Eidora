import React from 'react';
import './IslamicAnimation.css';

export const IslamicAnimation: React.FC = () => {
  return (
    <div className="islamic-animation-container">
      {/* Central Crescent Moon and Star */}
      <div className="crescent-star-group">
        <div className="crescent-moon">
          <div className="crescent-moon-inner"></div>
        </div>
        <div className="islamic-star"></div>
      </div>

      {/* Ramadan Lanterns */}
      <div className="lantern lantern-1">
        <div className="lantern-top"></div>
        <div className="lantern-body">
          <div className="lantern-pattern"></div>
          <div className="lantern-light"></div>
        </div>
        <div className="lantern-bottom"></div>
      </div>

      <div className="lantern lantern-2">
        <div className="lantern-top"></div>
        <div className="lantern-body">
          <div className="lantern-pattern"></div>
          <div className="lantern-light"></div>
        </div>
        <div className="lantern-bottom"></div>
      </div>

      {/* Dates */}
      <div className="date date-1">
        <div className="date-body"></div>
        <div className="date-stem"></div>
      </div>
      <div className="date date-2">
        <div className="date-body"></div>
        <div className="date-stem"></div>
      </div>
      <div className="date date-3">
        <div className="date-body"></div>
        <div className="date-stem"></div>
      </div>

      {/* Prayer Beads (Tasbih) */}
      <div className="tasbih">
        <div className="bead bead-1"></div>
        <div className="bead bead-2"></div>
        <div className="bead bead-3"></div>
        <div className="bead bead-4"></div>
        <div className="bead bead-5"></div>
        <div className="bead bead-6"></div>
        <div className="bead bead-7"></div>
        <div className="bead bead-8"></div>
        <div className="bead bead-9"></div>
        <div className="bead bead-10"></div>
      </div>

      {/* Geometric Islamic Pattern */}
      <div className="geometric-pattern">
        <div className="pattern-ring pattern-ring-1"></div>
        <div className="pattern-ring pattern-ring-2"></div>
        <div className="pattern-ring pattern-ring-3"></div>
      </div>

      {/* Decorative Stars */}
      <div className="decorative-star star-1"></div>
      <div className="decorative-star star-2"></div>
      <div className="decorative-star star-3"></div>
      <div className="decorative-star star-4"></div>
    </div>
  );
};
