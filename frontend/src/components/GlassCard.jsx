import React from 'react';

const GlassCard = ({ children, className = '', hoverGlow = false, onClick, ...props }) => {
  const hoverClasses = hoverGlow 
    ? 'hover:scale-[1.01] hover:border-brand-blue/30 dark:hover:border-brand-blue/30 hover:shadow-[0_0_25px_rgba(14,165,233,0.15)] cursor-pointer'
    : '';

  return (
    <div
      onClick={onClick}
      className={`glass-panel glass-panel-light dark:glass-panel-dark rounded-2xl p-6 transition-all duration-300 ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
