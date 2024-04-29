import { useEffect, useState } from "react";
import { getLeaderBoard } from "../../api";
// import { useGameContext } from "../../Context";
import styles from "./LeaderBoard.module.css";
import { Button } from "../../components/Button/Button";
import { Link } from "react-router-dom";
export function LeaderBoard() {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    getLeaderBoard()
      .then(data => {
        if (data.leaders) {
          let leader = data.leaders;
          leader = leader.sort(function (a, b) {
            return a.time - b.time;
          });
          setLeaders(leader);
        } else {
          console.error("Данные лидеров не были получены.");
        }
      })
      .catch(error => {
        console.log(error.message);
      });
  }, []);

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <p className={styles.text}>Лидерборд</p>
          <Link to="/">
            <Button>Начать игру</Button>
          </Link>
        </div>
        <table>
          <thead className={styles.thead}>
            <tr className={styles.leaderboard}>
              <th className={styles.position}>Позиция</th>
              <th className={styles.user}>Пользователь</th>
              <th className={styles.achievements}>Достижения</th>
              <th className={styles.time}>Время</th>
            </tr>
          </thead>
          <tbody className={styles.tbody}>
            {leaders.map((leader, index) => (
              <tr className={styles.leader} key={leader.id}>
                <td className={styles.position}>#{index + 1}</td>
                <td className={styles.user}>{leader.name}</td>
                <td className={styles.achievements}>
                  {leader.achievements && (
                    <div className={styles.block_achievements}>
                      {leader.achievements.includes(1) ? (
                        <button className={styles.puzzle} hint1="Игра пройдена в сложном режиме"></button>
                      ) : (
                        <button className={styles.puzzleGray} hint1="Игра пройдена в сложном режиме"></button>
                      )}
                    </div>
                  )}
                  {leader.achievements && (
                    <div className={styles.block_achievements}>
                      {leader.achievements.includes(2) ? (
                        <button className={styles.vision} hint2="Игра пройдена без супер-сил"></button>
                      ) : (
                        <button className={styles.visionGray} hint2="Игра пройдена без супер-сил"></button>
                      )}
                    </div>
                  )}
                </td>
                <td className={styles.time}>
                  {Math.floor(leader.time / 60)
                    .toString()
                    .padStart(2, "0")}
                  :{(leader.time % 60).toString().padStart(2, "0")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
