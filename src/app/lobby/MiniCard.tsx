'use client'
import { Lobby, Player } from '@/types/types'
import { getNumBingos } from '@/utils/utils'
import React, { useEffect, useState } from 'react'

interface PlayerPreviewProps {
  lobby: Lobby
  player: Player
}

const MiniCard: React.FC<PlayerPreviewProps> = ({
  lobby,
  player,
}) => {
  const [bingos, setBingos] = useState<string[]>([]);
  useEffect(() => {
    const bingos = getNumBingos(player.player_state.completion_summary, lobby.card);
    setBingos(bingos);
  }, [player, lobby]);

  const MiniSquare = (isCompleted: boolean, col: number, row: number) => {
    const isPartOfBingo = bingos.some(bingo => bingo === `hor-${row}` || bingo === `ver-${col}` || (row === col && bingo === 'diag-tl') || (row + col === 6 && bingo === 'diag-bl'));
    return (
      <div key={`${row}-${col}`} className={`${isPartOfBingo ? 'bg-[#9d5f80]' : isCompleted ? 'bg-[#534E66]' : 'bg-gray-800'} w-1/5 border border-gray-500 aspect-square`}></div>
    );
  }

  return (
    <div className='flex flex-col w-1/3'>
      <div className='flex flex-row'>
        {lobby.card.first.map((text, index) => {
          return MiniSquare(player.player_state.completion_summary && player.player_state.completion_summary[text] !== undefined, index+1, 1)
        })}
      </div>
      <div className='flex flex-row'>
        {lobby.card.second.map((text, index) => {
          return MiniSquare(player.player_state.completion_summary && player.player_state.completion_summary[text] !== undefined, index+1, 2)
        })}
      </div>
      <div className='flex flex-row'>
        {lobby.card.third.map((text, index) => {
          return MiniSquare(player.player_state.completion_summary && player.player_state.completion_summary[text] !== undefined, index+1, 3)
        })}
      </div>
      <div className='flex flex-row'>
        {lobby.card.fourth.map((text, index) => {
          return MiniSquare(player.player_state.completion_summary && player.player_state.completion_summary[text] !== undefined, index+1, 4)
        })}
      </div>
      <div className='flex flex-row'>
        {lobby.card.fifth.map((text, index) => {
          return MiniSquare(player.player_state.completion_summary && player.player_state.completion_summary[text] !== undefined, index+1, 5)
        })}
      </div>
    </div>
  )
}

export default MiniCard
