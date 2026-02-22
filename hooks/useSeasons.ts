
import { useState, useEffect } from 'react';

export interface SeasonState {
  isAprilFools: boolean;
  isHalloween: boolean;
  isNewYear: boolean;
  themeClass: string;
}

export const useSeasons = (): SeasonState => {
  const [season, setSeason] = useState<SeasonState>({
    isAprilFools: false,
    isHalloween: false,
    isNewYear: false,
    themeClass: ''
  });

  useEffect(() => {
    const checkSeason = () => {
      const now = new Date();
      const month = now.getMonth(); // 0-indexed
      const day = now.getDate();

      // DEBUG: Uncomment to force April Fools for testing
      // const isAprilFools = true; 
      const isAprilFools = month === 3 && day === 1;
      
      const isHalloween = month === 9 && day >= 25; // Oct 25-31
      const isNewYear = month === 0 && day === 1;

      let themeClass = '';
      if (isAprilFools) themeClass = 'theme-potato';
      else if (isHalloween) themeClass = 'theme-spooky';
      // Winter/Frost theme removed

      setSeason({ isAprilFools, isHalloween, isNewYear, themeClass });
    };

    checkSeason();
    // Re-check every hour just in case user crosses midnight
    const interval = setInterval(checkSeason, 3600000);
    return () => clearInterval(interval);
  }, []);

  return season;
};
