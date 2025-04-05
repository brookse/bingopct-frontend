'use client'
import { Lobby } from '@/types/types'
import React, { useEffect, useState } from 'react'

interface TimerProps {
  lobby: Lobby
  setLobby: (lobby: Lobby) => void
}

const TEN_MINUTES_AS_MS = 10 * 60 * 1000;

const Timer: React.FC<TimerProps> = ({
  lobby,
  setLobby
}) => {
  const [remainingTime, setRemainingTime] = useState<string | null>(null);
  const [shouldShowWarning, setShouldShowWarning] = useState<boolean>(false);
  const timerStart = new Date(lobby.timer_start);

  useEffect(() => {
    if (lobby.is_timer_running) {
      const interval = setInterval(() => {
        const time = calculateRemainingTime();
        setRemainingTime(time);
      }, 1000);
      return () => clearInterval(interval);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lobby.is_timer_running]);

  const calculateRemainingTime = () => {
    if (lobby.game_state !== 'playing') return null
    const now = new Date();
    const timerEnd = new Date(timerStart.getTime() + lobby.timer_length * 60000);
    const remainingTime = timerEnd.getTime() - now.getTime();

    if (!shouldShowWarning && remainingTime <= TEN_MINUTES_AS_MS) {
      setShouldShowWarning(true);
    }
    if (remainingTime <= 0) {
      setLobby(
        {...lobby,
        game_state: 'finished',
        is_timer_running: false,}
      );
      return 'Time is up!';
    }
    const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
    return (hours > 0 ? `${hours}h ` : '') + `${minutes}m ${seconds}s`;
  }

  return (
    <div>
      <p className={`text-xl ${shouldShowWarning ? 'text-red-300' : 'text-amber-50'}`}>{remainingTime}</p>
    </div>
  )
}

export default Timer
