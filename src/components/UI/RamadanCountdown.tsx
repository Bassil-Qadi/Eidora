import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';
import './RamadanCountdown.css';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
}

export const RamadanCountdown: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
  });
  const prevTimeLeftRef = useRef<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
  });

  useEffect(() => {
    // Target date: February 28, 2026 at 00:00:00 local time
    // Month is 0-indexed, so 1 = February
    const targetDate = new Date(2026, 1, 28, 0, 0, 0, 0);
    const targetTimestamp = targetDate.getTime();

    const updateCountdown = () => {
      const now = Date.now();
      const diff = targetTimestamp - now;

      if (diff <= 0) {
        setTimeLeft((prev) => {
          prevTimeLeftRef.current = { ...prev };
          return { days: 0, hours: 0, minutes: 0 };
        });
        return;
      }

      // Calculate total milliseconds, then convert
      const totalMs = diff;
      const totalSeconds = Math.floor(totalMs / 1000);
      const totalMinutes = Math.floor(totalSeconds / 60);
      const totalHours = Math.floor(totalMinutes / 60);
      const totalDays = Math.floor(totalHours / 24);

      // Extract individual components
      const days = totalDays;
      const hours = totalHours % 24;
      const minutes = totalMinutes % 60;

      setTimeLeft((prev) => {
        const newTime: TimeLeft = { days, hours, minutes };
        prevTimeLeftRef.current = { ...prev };
        return newTime;
      });
    };

    // Initial calculation
    updateCountdown();

    // Update every minute (since we're not showing seconds)
    const interval = setInterval(updateCountdown, 60000);

    return () => clearInterval(interval);
  }, []);

  const TimeUnit: React.FC<{ value: number; prevValue: number; label: string }> = ({ 
    value, 
    prevValue, 
    label 
  }) => {
    const formattedValue = value.toString().padStart(2, '0');
    const formattedPrevValue = prevValue.toString().padStart(2, '0');
    
    return (
      <div className="countdown-unit">
        <div className="countdown-card">
          <div className="countdown-card-top"></div>
          <div className="countdown-card-content">
            <div className="countdown-number" dir="ltr">
              {formattedValue.split('').map((digit, i) => {
                const hasChanged = digit !== formattedPrevValue[i];
                return (
                  <span 
                    key={`${value}-${i}-${digit}`}
                    className={`countdown-digit ${hasChanged ? 'digit-flip' : ''}`}
                  >
                    {digit}
                  </span>
                );
              })}
            </div>
          </div>
          <div className="countdown-card-bottom"></div>
        </div>
        <div className="countdown-label">{label}</div>
      </div>
    );
  };

  return (
    <div className="countdown-container">
      <div className={`countdown-units-grid ${isRTL ? 'rtl-grid' : ''}`}>
        <TimeUnit 
          value={timeLeft.days} 
          prevValue={prevTimeLeftRef.current.days} 
          label={t('countdown.days')} 
        />
        <TimeUnit 
          value={timeLeft.hours} 
          prevValue={prevTimeLeftRef.current.hours} 
          label={t('countdown.hours')} 
        />
        <TimeUnit 
          value={timeLeft.minutes} 
          prevValue={prevTimeLeftRef.current.minutes} 
          label={t('countdown.minutes')} 
        />
      </div>
      <p className="countdown-message">{t('countdown.message')}</p>
    </div>
  );
};
