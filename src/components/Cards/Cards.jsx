import { shuffle } from "lodash";
import { useEffect, useState } from "react";
import { generateDeck } from "../../utils/cards";
import styles from "./Cards.module.css";
import { EndGameModal } from "../../components/EndGameModal/EndGameModal";
import { Button } from "../../components/Button/Button";
import { Card } from "../../components/Card/Card";
import { useGameContext } from "../../Context";
import { getLeaderBoard } from "../../api";

// Игра закончилась
const STATUS_LOST = "STATUS_LOST";
const STATUS_WON = "STATUS_WON";
// Идет игра: карты закрыты, игрок может их открыть
const STATUS_IN_PROGRESS = "STATUS_IN_PROGRESS";
// Начало игры: игрок видит все карты в течении нескольких секунд
const STATUS_PREVIEW = "STATUS_PREVIEW";

const STATUS_PAUSE = "STATUS_PAUSE";
let pauseTimer = false;

function getTimerValue(startDate, endDate) {
  if (!startDate && !endDate) {
    return {
      minutes: 0,
      seconds: 0,
    };
  }

  if (endDate === null) {
    endDate = new Date();
  }
  if (pauseTimer === true) {
    const diffInSecconds = Math.floor((endDate.getTime() - 5000 - startDate.getTime()) / 1000);
    const minutes = Math.floor(diffInSecconds / 60);
    const seconds = diffInSecconds % 60;
    return {
      minutes,
      seconds,
    };
  }

  const diffInSecconds = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
  const minutes = Math.floor(diffInSecconds / 60);
  const seconds = diffInSecconds % 60;
  return {
    minutes,
    seconds,
  };
}

/**
 * Основной компонент игры, внутри него находится вся игровая механика и логика.
 * pairsCount - сколько пар будет в игре
 * previewSeconds - сколько секунд пользователь будет видеть все карты открытыми до начала игры
 */
export function Cards({ pairsCount = 3, previewSeconds = 5 }) {
  const [isPause, setIsPause] = useState(false);
  const { leaderboardPlayers, setLeaderboardPlayers } = useGameContext();
  // console.log(leaderboardPlayers?.leaders[leaderboardPlayers?.leaders?.length - 1]);
  useEffect(() => {
    getLeaderBoard().then(res => {
      setLeaderboardPlayers(res);
    });
  }, []);
  // В cards лежит игровое поле - массив карт и их состояние открыта\закрыта
  const [cards, setCards] = useState([]);
  // Текущий статус игры

  const { isEasyMode, lives, setLives } = useGameContext();

  const [status, setStatus] = useState(STATUS_PREVIEW);

  // Дата начала игры
  const [gameStartDate, setGameStartDate] = useState(null);
  // Дата конца игры
  const [gameEndDate, setGameEndDate] = useState(null);

  // Стейт для таймера, высчитывается в setInteval на основе gameStartDate и gameEndDate
  const [timer, setTimer] = useState({
    seconds: 0,
    minutes: 0,
  });
  const [achievement, setAchievement] = useState(isEasyMode ? [1] : []);

  const [superPowers, setSuperPowers] = useState({
    vision: true,
    alohomora: true,
  });
  function finishGame(status = STATUS_LOST) {
    setGameEndDate(new Date());
    setStatus(status);
  }
  function startGame() {
    setIsPause(isPause);
    console.log(isPause);
    const startDate = new Date();
    setGameEndDate(null);
    setGameStartDate(startDate);
    setTimer(getTimerValue(startDate, null));
    setStatus(STATUS_IN_PROGRESS);
  }
  function resetGame() {
    setSuperPowers({
      vision: true,
      alohomora: true,
    });
    setIsPause(false);
    setGameStartDate(null);
    setGameEndDate(null);
    setTimer(getTimerValue(null, null));
    setStatus(STATUS_PREVIEW);
  }

  /**
   * Обработка основного действия в игре - открытие карты.
   * После открытия карты игра может пепереходит в следующие состояния
   * - "Игрок выиграл", если на поле открыты все карты
   * - "Игрок проиграл", если на поле есть две открытые карты без пары
   * - "Игра продолжается", если не случилось первых двух условий
   */
  const openCard = clickedCard => {
    // Если карта уже открыта, то ничего не делаем
    if (clickedCard.open) {
      return;
    }
    // Игровое поле после открытия кликнутой карты
    const nextCards = cards.map(card => {
      if (card.id !== clickedCard.id) {
        return card;
      }

      return {
        ...card,
        open: true,
      };
    });

    setCards(nextCards);

    const isPlayerWon = nextCards.every(card => card.open);

    // Победа - все карты на поле открыты
    if (isPlayerWon) {
      finishGame(STATUS_WON);
      if (lives === 2) {
        setLives(lives + 1);
      }
      if (lives === 1) {
        setLives(lives + 2);
      }

      return;
    }

    // Открытые карты на игровом поле
    const openCards = nextCards.filter(card => card.open);

    // Ищем открытые карты, у которых нет пары среди других открытых
    const openCardsWithoutPair = openCards.filter(card => {
      const sameCards = openCards.filter(openCard => card.suit === openCard.suit && card.rank === openCard.rank);

      if (sameCards.length < 2) {
        return true;
      }

      return false;
    });

    const playerLost = openCardsWithoutPair.length >= 2;

    // "Игрок проиграл", т.к на поле есть две открытые карты без пары
    if (playerLost) {
      if (!isEasyMode) {
        finishGame(STATUS_LOST);
        return;
      }
    }
    if (playerLost) {
      if (isEasyMode) {
        setLives(lives - 1);

        nextCards.map(elem => {
          if (openCardsWithoutPair.some(openCard => openCard.id === elem.id)) {
            if (elem.open) {
              setTimeout(() => {
                setCards(prev => {
                  return prev.map(el => (el.id === elem.id ? { ...el, open: false } : el));
                });
              }, 1000);
            }
          }
        });
        if (lives === 1) {
          finishGame(STATUS_LOST);
          setLives(lives + 2);
        }

        return;
      }
    }

    // ... игра продолжается
  };
  function vision() {
    setSuperPowers({ ...superPowers, vision: false });

    const openedCards = cards;
    const viewCards = cards.map(card => ({
      ...card,
      open: true,
    }));

    setCards(viewCards);
    setIsPause(true);
    // pauseTimer = true;
    setStatus(STATUS_PAUSE);

    setTimeout(() => {
      setCards(openedCards);
      setStatus(STATUS_IN_PROGRESS);
    }, 5000);
    if (!achievement.includes(2)) {
      setAchievement([...achievement, 2]);
    }
  }
  function alohomora() {
    setSuperPowers({ ...superPowers, alohomora: false });

    const closedCards = cards.filter(card => !card.open);
    const randomCard = closedCards[Math.floor(Math.random() * closedCards.length)];
    const pairsCard = closedCards.filter(
      closedCard =>
        closedCard.suit === randomCard.suit && closedCard.rank === randomCard.rank && randomCard.id !== closedCard.id,
    );
    setCards(
      cards.map(card => {
        if (card === randomCard || card === pairsCard[0]) {
          return { ...card, open: true };
        } else {
          return card;
        }
      }),
    );
    if (!achievement.includes(2)) {
      setAchievement([...achievement, 2]);
    }
  }
  const isGameEnded = status === STATUS_LOST || status === STATUS_WON;

  // Игровой цикл
  useEffect(() => {
    // В статусах кроме превью доп логики не требуется
    if (status !== STATUS_PREVIEW) {
      return;
    }

    // В статусе превью мы
    if (pairsCount > 36) {
      alert("Столько пар сделать невозможно");
      return;
    }

    setCards(() => {
      return shuffle(generateDeck(pairsCount, 10));
    });

    const timerId = setTimeout(() => {
      startGame();
    }, previewSeconds * 1000);

    return () => {
      clearTimeout(timerId);
    };
  }, [status, pairsCount, previewSeconds]);

  // Обновляем значение таймера в интервале
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (status === STATUS_PAUSE) {
        pauseTimer = true;
        // setGameStartDate(new Date(new Date().getTime() - 5000));
        return;
      }
      setTimer(getTimerValue(gameStartDate, gameEndDate));
    }, 300);
    return () => {
      clearInterval(intervalId);
    };
  }, [gameStartDate, gameEndDate, status]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.timer}>
          {status === STATUS_PREVIEW ? (
            <div>
              <p className={styles.previewText}>Запоминайте пары!</p>
              <p className={styles.previewDescription}>Игра начнется через {previewSeconds} секунд</p>
            </div>
          ) : (
            <>
              <div className={styles.timerValue}>
                <div className={styles.timerDescription}>min</div>
                <div>{timer.minutes.toString().padStart("2", "0")}</div>
              </div>
              .
              <div className={styles.timerValue}>
                <div className={styles.timerDescription}>sec</div>
                <div>{timer.seconds.toString().padStart("2", "0")}</div>
              </div>
            </>
          )}
        </div>

        <>
          <div className={styles.containerImg}>
            <button
              className={styles.vision}
              title="Прозрение"
              hint=" На 5 секунд показываются все карты. Таймер длительности игры на это время останавливается."
              onClick={vision}
              disabled={!superPowers.vision}
            />
            <button
              className={styles.alohomora}
              title="Алохомора"
              hint="Открывается случайная пара карт."
              onClick={alohomora}
              disabled={!superPowers.alohomora}
            />
          </div>
        </>

        {status === STATUS_IN_PROGRESS ? <Button onClick={resetGame}>Начать заново</Button> : null}
      </div>
      {isEasyMode && <p className={styles.attempts}>Осталось попытки : {lives}</p>}
      <div className={styles.cards}>
        {cards.map(card => (
          <Card
            key={card.id}
            onClick={() => openCard(card)}
            open={status !== STATUS_IN_PROGRESS ? true : card.open}
            suit={card.suit}
            rank={card.rank}
          />
        ))}
      </div>

      {isGameEnded ? (
        <div className={styles.modalContainer}>
          <EndGameModal
            isWon={status === STATUS_WON}
            gameDurationSeconds={timer.seconds}
            gameDurationMinutes={timer.minutes}
            onClick={resetGame}
            isLeaderboard={
              leaderboardPlayers.leaders[leaderboardPlayers.leaders.length - 1].time >
              timer.minutes * 60 + timer.seconds
            }
          />
        </div>
      ) : null}
    </div>
  );
}
