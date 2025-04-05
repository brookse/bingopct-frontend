'use client'
import { Lobby, Player } from '@/types/types'
import { Switch } from '@mantine/core'
import React from 'react'
import colors from 'tailwindcss/colors'

interface PlayerPreviewProps {
  lobby: Lobby
  player: Player
  me: Player
  handleToggleReady?: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const PlayerPreview: React.FC<PlayerPreviewProps> = ({
  lobby,
  player,
  me,
  handleToggleReady,
}) => {

  // todo memoize this
  // todo highlight bingos differently
  const MiniCard = () => {
    const MiniSquare = (isCompleted: boolean, index: number) => (
      <div key={index} className={`${isCompleted ? 'bg-[#534E66]' : 'bg-gray-800'} w-1/5 border border-gray-500 aspect-square`}></div>
    )

    return (
      <div className='flex flex-col w-1/3'>
        <div className='flex flex-row'>
          {lobby.card.first.map((text, index) => {
            return MiniSquare(player.player_state.completion_summary[text] !== undefined, index)
          })}
        </div>
        <div className='flex flex-row'>
          {lobby.card.second.map((text, index) => {
            return MiniSquare(player.player_state.completion_summary[text] !== undefined, index)
          })}
        </div>
        <div className='flex flex-row'>
          {lobby.card.third.map((text, index) => {
            return MiniSquare(player.player_state.completion_summary[text] !== undefined, index)
          })}
        </div>
        <div className='flex flex-row'>
          {lobby.card.fourth.map((text, index) => {
            return MiniSquare(player.player_state.completion_summary[text] !== undefined, index)
          })}
        </div>
        <div className='flex flex-row'>
          {lobby.card.fifth.map((text, index) => {
            return MiniSquare(player.player_state.completion_summary[text] !== undefined, index)
          })}
        </div>
      </div>
    )
  }

  return (
    <div key={player.id} className={`flex ${lobby.game_state === 'playing' ? 'flex-col' : 'flex-row items-center'} gap-2 text-amber-50`}>
      <span>{player.name}</span>
      { lobby.game_state === 'waiting' &&
        <div className='flex flex-col items-center gap-2'>
          { (player.id === me.id && handleToggleReady) && <Switch color={colors.green[500]} checked={player.is_ready} onChange={handleToggleReady} /> }
          { player.is_ready && <span className='text-green-500'>ready</span> }
        </div>
      }
      { lobby.game_state === 'playing' &&
        <div className='flex flex-row items-start gap-2'>
          <MiniCard />
          <div>
            <p>OBJ: {player.player_state.total_objectives}</p>
            <p>BINGO: {player.player_state.total_bingo}</p>
          </div>
        </div>
      }
    </div>
  )
}

export default PlayerPreview
