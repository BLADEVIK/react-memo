import { createContext, useContext, useState } from "react";
export const GameContext = createContext();
export const useGameContext = () => {
  return useContext(GameContext);
};
export const GameProvider = ({ children }) => {
  const [lives, setLives] = useState(3);
  const [isEasyMode, setIsEasyMode] = useState(false);
  const [level, setLevel] = useState("3");
  const [leaderboardPlayers, setLeaderboardPlayers] = useState([]);
  return (
    <GameContext.Provider
      value={{ isEasyMode, setIsEasyMode, lives, setLives, level, setLevel, leaderboardPlayers, setLeaderboardPlayers }}
    >
      {children}
    </GameContext.Provider>
  );
};
