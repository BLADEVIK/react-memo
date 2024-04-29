import React, { createContext, useState } from "react";

export const AchievementsContext = createContext();

export const AchievementsProvider = ({ children }) => {
  const [achievements, setAchievements] = useState([]);

  const addAchievement = achievementId => {
    setAchievements(list => [...list, achievementId]);
  };

  const resetAchievements = () => {
    setAchievements([]);
  };

  return (
    <AchievementsContext.Provider value={{ achievements, addAchievement, resetAchievements }}>
      {children}
    </AchievementsContext.Provider>
  );
};
