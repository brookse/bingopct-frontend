'use client'
import { Lobby, Player } from '@/types/types'
import React from 'react'

interface PlayerPreviewProps {
  lobby: Lobby
  player: Player
}

const MiniCard: React.FC<PlayerPreviewProps> = ({
  lobby,
  player,
}) => {

  // todo memoize this
  // todo highlight bingos differently
  const MiniSquare = (isCompleted: boolean, index: number) => (
    <div key={index} className={`${isCompleted ? 'bg-[#534E66]' : 'bg-gray-800'} w-1/5 border border-gray-500 aspect-square`}></div>
  )

  return (
    <div className='flex flex-col w-1/3'>
      <div className='flex flex-row'>
        {lobby.card.first.map((text, index) => {
          return MiniSquare(player.player_state.completion_summary && player.player_state.completion_summary[text] !== undefined, index)
        })}
      </div>
      <div className='flex flex-row'>
        {lobby.card.second.map((text, index) => {
          return MiniSquare(player.player_state.completion_summary && player.player_state.completion_summary[text] !== undefined, index)
        })}
      </div>
      <div className='flex flex-row'>
        {lobby.card.third.map((text, index) => {
          return MiniSquare(player.player_state.completion_summary && player.player_state.completion_summary[text] !== undefined, index)
        })}
      </div>
      <div className='flex flex-row'>
        {lobby.card.fourth.map((text, index) => {
          return MiniSquare(player.player_state.completion_summary && player.player_state.completion_summary[text] !== undefined, index)
        })}
      </div>
      <div className='flex flex-row'>
        {lobby.card.fifth.map((text, index) => {
          return MiniSquare(player.player_state.completion_summary && player.player_state.completion_summary[text] !== undefined, index)
        })}
      </div>
    </div>
  )
}

export default MiniCard
