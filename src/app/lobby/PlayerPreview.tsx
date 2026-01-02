'use client'
import { Lobby, Player } from '@/types/types'
import { faDotCircle } from '@fortawesome/free-solid-svg-icons'
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Switch } from '@mantine/core'
import React from 'react'
import colors from 'tailwindcss/colors'
import MiniCard from './MiniCard'

interface PlayerPreviewProps {
  lobby: Lobby
  player: Player
  me: Player
  handleToggleReady?: (event: React.ChangeEvent<HTMLInputElement>) => void
  isWinner: boolean
  place: number
}

const PlayerPreview: React.FC<PlayerPreviewProps> = ({
  lobby,
  player,
  me,
  handleToggleReady,
  isWinner,
  place,
}) => {
  return (
    <div key={player.id} className={`flex ${lobby.game_state !== 'waiting' ? 'flex-col' : 'flex-row items-center gap-2 justify-between w-full h-[30px]'} text-amber-50`}>
      <span className={`flex flex-row gap-2  ${isWinner && 'text-green-400 animate-bounce'}`}>{ lobby.game_state === 'finished' && <div>#{place}</div> }{player.name}</span>
      
      { lobby.game_state === 'waiting' &&
        <div className='flex flex-col items-center gap-2'>
          { (player.id === me.id && handleToggleReady) && 
            <Switch 
              color={colors.green[500]}
              checked={player.is_ready}
              onChange={handleToggleReady}
              onLabel='ready!'
              offLabel='ready up'
              size='lg'
              thumbIcon={
                player.is_ready ? (
                  <FontAwesomeIcon width={12} icon={faCheck} color='green' />
                ) : (
                  <FontAwesomeIcon width={12} icon={faDotCircle} />
                )
              }
            />
          }
          { (player.id !== me.id && player.is_ready) && <span className='text-green-500'>ready <FontAwesomeIcon width={12} icon={faCheck} color='green' /></span> }
          { (player.id !== me.id && !player.is_ready) && <div className='opacity-70'>not ready</div> }
        </div>
      }
      { lobby.game_state !== 'waiting' &&
        <div className='flex flex-row items-start gap-2'>
          <MiniCard lobby={lobby} player={player} />
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
