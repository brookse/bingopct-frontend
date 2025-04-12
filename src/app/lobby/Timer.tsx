'use client'
import { Lobby } from '@/types/types'
import React, { useEffect, useState } from 'react'

interface TimerProps {
  lobby: Lobby
  completeLobby: () => void
}

const TEN_MINUTES_AS_MS = 10 * 60 * 1000;
const ONE_MINUTE_AS_MS = 1 * 60 * 1000;

const Timer: React.FC<TimerProps> = ({
  lobby,
  completeLobby
}) => {
  const [remainingTime, setRemainingTime] = useState<string | null>(null);
  const [warningLevel, setWarningLevel] = useState<number>(0);  // 0 = none, 1 = minor, 2 = major, 3 = critical
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

    // if (!warningLevel || warningLevel > 2 && remainingTime <= TEN_MINUTES_AS_MS) {
    //   setWarningLevel(2);
    // }
    if (remainingTime <= ONE_MINUTE_AS_MS) {
      setWarningLevel(3);
    } else if (remainingTime <= TEN_MINUTES_AS_MS) {
      setWarningLevel(2);
    } else {
      setWarningLevel(0);
    }
    if (remainingTime <= 0) {
      completeLobby();
      return 'Time is up!';
    }
    const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
    return (hours > 0 ? `${hours}h ` : '') + `${minutes}m ${seconds}s`;
  }

  return (
    <div>
      <p className={`font-bold text-xl ${warningLevel > 1 ? 'text-red-300' : 'text-amber-50'} ${warningLevel === 3 && 'animate-pulse'}`}>{remainingTime}</p>
    </div>
  )
}

export default Timer
