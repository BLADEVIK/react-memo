import styles from "./EndGameModal.module.css";

import { Button } from "../Button/Button";

import deadImageUrl from "./images/dead.png";
import celebrationImageUrl from "./images/celebration.png";
import { Link } from "react-router-dom";
import { getLeaderBoard, postLeaderBoard } from "../../api";
import { useContext, useEffect, useState } from "react";
import { GameContext } from "../../Context";
import { AchievementsContext } from "../../AchievementContext";

export function EndGameModal({ isWon, gameDurationSeconds, gameDurationMinutes, onClick }) {
  const { achievements } = useContext(AchievementsContext);
  const { level, isEasyMode } = useContext(GameContext);
  const [leader, setLeader] = useState("Пользователь");
  const [newLeader, setNewLeader] = useState(false);
  const gameTime = gameDurationMinutes * 60 + gameDurationSeconds;

  const title = isWon ? (level === "9" ? "Вы попали на лидерборд!" : "Вы победили!") : "Вы проиграли!";
  const imgSrc = isWon ? celebrationImageUrl : deadImageUrl;
  const imgAlt = isWon ? "celebration emodji" : "dead emodji";
  useEffect(() => {
    getLeaderBoard().then(({ leaders }) => {
      leaders = leaders.sort(function (a, b) {
        return b.time - a.time;
      });
      console.log(leaders);
      if (!isEasyMode && leaders.length > 0 && leaders[0].time > gameTime && level === "9") {
        setNewLeader(true);
      }
    });
  }, []);

  function addPlayerToLeaders() {
    onClick();

    postLeaderBoard({
      name: leader,
      time: gameTime,
      achievements: achievements,
    })
      .then(({ leaders }) => {
        alert("Игрок успешно добавлен в список лидеров:", leaders);
        setNewLeader(true);
      })
      .catch(error => {
        alert(error.message);
      });
  }
  return (
    <div className={styles.modal}>
      <img className={styles.image} src={imgSrc} alt={imgAlt} />
      <h2 className={styles.title}>{title}</h2>
      {newLeader ? (
        <input
          className={styles.input_user}
          type="text"
          placeholder={"Пользователь "}
          onChange={e => {
            setLeader(e.target.value);
          }}
        />
      ) : (
        <div></div>
      )}
      <p className={styles.description}>Затраченное время:</p>
      <div className={styles.time}>
        {gameDurationMinutes.toString().padStart("2", "0")}.{gameDurationSeconds.toString().padStart("2", "0")}
      </div>
      {newLeader ? (
        <>
          <Button
            onClick={() => {
              addPlayerToLeaders(newLeader);
              // onClick();
            }}
          >
            Начать сначала
          </Button>
          <Link to="/">
            <Button
              onClick={() => {
                addPlayerToLeaders(newLeader);
                // onClick();
              }}
            >
              На главную
            </Button>
          </Link>
        </>
      ) : (
        <>
          <Button onClick={onClick}>Начать сначала</Button>
          <Link to="/">
            <Button>На главную</Button>
          </Link>
        </>
      )}
      {newLeader && (
        <Link to="/leaderboard" className={styles.linkBoard}>
          Перейти к лидерборду
        </Link>
      )}
    </div>
  );
}
