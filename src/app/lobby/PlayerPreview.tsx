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
  previewCard: (player: Player) => void
  currentlyPreviewing: Player | null
  isWinner: boolean
  place: number
}

const PlayerPreview: React.FC<PlayerPreviewProps> = ({
  lobby,
  player,
  me,
  handleToggleReady,
  previewCard,
  currentlyPreviewing,
  isWinner,
  place,
}) => {
  const isMe = player.id === me.id
  const isCurrentlyPreviewing = currentlyPreviewing?.id === player.id
  return (
    <div key={player.id} className={`flex ${lobby.game_state !== 'waiting' ? 'flex-col' : 'flex-row items-center gap-2 justify-between w-full h-[30px]'} text-amber-50`}>
      <span className={`flex flex-row items-center gap-2  ${isWinner && 'text-green-400 animate-bounce'}`}>
        { lobby.game_state === 'finished' && <div>#{place}</div> }
        {player.name}
        { isMe && <span className='text-sm opacity-70'>(me!)</span> }
        { !isMe && isCurrentlyPreviewing && <span className='text-sm opacity-70'>(viewing)</span> }
      </span>
      
      { lobby.game_state === 'waiting' &&
        <div className='flex flex-col items-center gap-2'>
          { (isMe && handleToggleReady) && 
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
          { (!isMe && player.is_ready) && <span className='text-green-500'>ready <FontAwesomeIcon width={12} icon={faCheck} color='green' /></span> }
          { (!isMe && !player.is_ready) && <div className='opacity-70'>not ready</div> }
        </div>
      }
      { lobby.game_state !== 'waiting' &&
        <div className='flex flex-row items-start gap-2'>
          <MiniCard lobby={lobby} player={player} />
          <div className='flex flex-col text-sm gap-1'>
            <p>OBJ: {player.player_state.total_objectives}</p>
            <p>BINGO: {player.player_state.total_bingo}</p>
            { lobby.game_state === 'finished' && (
              <button onClick={() => previewCard(player)} className={`${isCurrentlyPreviewing ? 'bg-[#423E57]/80' : 'bg-[#534E66] hover:bg-[#423E57]/80 cursor-pointer'} text-amber-50 px-2 py-1 rounded fatpixel w-full`} style={{fontSize: 'smaller'}}>
                View Card
              </button>
            )}
          </div>
        </div>
      }
    </div>
  )
}

export default PlayerPreview
