
import { useState, useEffect } from 'react';

export interface TimezoneOption {
  value: string;
  label: string;
  offset: string;
}

export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  { value: 'America/Los_Angeles', label: 'Pacific Time (PST/PDT)', offset: 'UTC-8/-7' },
  { value: 'America/Denver', label: 'Mountain Time (MST/MDT)', offset: 'UTC-7/-6' },
  { value: 'America/Chicago', label: 'Central Time (CST/CDT)', offset: 'UTC-6/-5' },
  { value: 'America/New_York', label: 'Eastern Time (EST/EDT)', offset: 'UTC-5/-4' },
  { value: 'UTC', label: 'UTC', offset: 'UTC+0' },
  { value: 'Europe/London', label: 'GMT/BST', offset: 'UTC+0/+1' },
  { value: 'Asia/Tokyo', label: 'Japan Time (JST)', offset: 'UTC+9' },
];

export const useTimezone = () => {
  const [timezone, setTimezone] = useState<string>('America/Los_Angeles'); // Default to PST
  const [autoDetected, setAutoDetected] = useState<boolean>(false);

  useEffect(() => {
    // Try to get saved timezone from localStorage
    const savedTimezone = localStorage.getItem('userTimezone');
    if (savedTimezone) {
      setTimezone(savedTimezone);
      return;
    }

    // Auto-detect timezone
    try {
      const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const isValidTimezone = TIMEZONE_OPTIONS.some(tz => tz.value === detectedTimezone);
      
      if (isValidTimezone) {
        setTimezone(detectedTimezone);
        setAutoDetected(true);
        localStorage.setItem('userTimezone', detectedTimezone);
      }
    } catch (error) {
      console.log('Timezone detection failed, using PST default');
    }
  }, []);

  const updateTimezone = (newTimezone: string) => {
    setTimezone(newTimezone);
    setAutoDetected(false);
    localStorage.setItem('userTimezone', newTimezone);
  };

  const getCurrentTime = () => {
    return new Date().toLocaleString('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const getTimezoneAbbr = () => {
    const option = TIMEZONE_OPTIONS.find(tz => tz.value === timezone);
    return option?.label.match(/\(([^)]+)\)/)?.[1] || timezone.split('/')[1];
  };

  return {
    timezone,
    updateTimezone,
    getCurrentTime,
    getTimezoneAbbr,
    autoDetected,
    timezoneOptions: TIMEZONE_OPTIONS
  };
};
