'use client'
import { CompletionSquare, Lobby, Player } from '@/types/types';
import { getNumBingos } from '@/utils/utils';
import { Button, Textarea } from '@mantine/core';
import React from 'react';
import colors from 'tailwindcss/colors';

interface BingoSquareProps {
  text: string
  completionSummary: CompletionSquare
  updateCompletionSummary: (text: string, summary: CompletionSquare) => void
  // setCompleted(text: string): void
  lobby: Lobby
  setLobby(lobby: Lobby): void
  me: Player
}

const BingoSquare: React.FC<BingoSquareProps> = ({
  text,
  completionSummary,
  updateCompletionSummary,
  // setCompleted,
  lobby,
  setLobby,
  me
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSetCompleted = (event: any) => {
    event.preventDefault();
    if (completionSummary?.completed_at) return;
    setCompleted(text);
  };

  const setCompleted = (text: string) => {
    if (lobby.game_state !== 'playing') return;
    // set the objective as completed
    const lobbyCopy = { ...lobby };
    const playerIndex = lobbyCopy.players.findIndex(player => player.id === me.id);
    const player = lobbyCopy.players[playerIndex];

    const squareCompletion = {
      completed_at: new Date().toISOString(),
    };
    updateCompletionSummary(text, squareCompletion);
    player.player_state.completion_summary[text] = squareCompletion;
    player.player_state.total_objectives += 1;
    // todo check for bingos
    player.player_state.total_bingo = getNumBingos(player.player_state.completion_summary, lobby.card);
    lobbyCopy.players[playerIndex] = player;
    setLobby(lobbyCopy);
  };

  const handleSaveNotes = (n: string) => {
    if (completionSummary?.completed_at) {
      const squareCompletion = {
        completed_at: completionSummary.completed_at,
        notes: n,
      };
      updateCompletionSummary(text, squareCompletion);
    }
  }

  const resetObjective = () => {
    if (lobby.game_state !== 'playing') return;
    // reset the objective
    const lobbyCopy = { ...lobby };
    const playerIndex = lobbyCopy.players.findIndex(player => player.id === me.id);
    const player = lobbyCopy.players[playerIndex];

    const squareCompletion = {
      completed_at: undefined,
      notes: undefined,
    };
    updateCompletionSummary(text, squareCompletion);
    delete player.player_state.completion_summary[text];
    player.player_state.total_objectives -= 1;
    // todo check for bingos
    player.player_state.total_bingo = getNumBingos(player.player_state.completion_summary, lobby.card);
    lobbyCopy.players[playerIndex] = player;
    setLobby(lobbyCopy);
  }

  return (
    <div className={`group transition-all px-2 w-1/5 overflow-hidden content-center border border-amber-50 text-amber-50 text-center fatpixel aspect-square ${completionSummary?.completed_at ? 'bg-[#534E66] cursor-default' : 'cursor-pointer hover:bg-[#273B54]'} ${lobby.game_state === 'playing' ? 'hover:scale-125 cursor-default' : ''}`} onClick={handleSetCompleted}>
      {/* objective. if complete and notes, half size. otherwise full. if hover and complete, none */}
      <div className={`transition-all flex flex-col justify-center items-center gap-2 leading-none ${!completionSummary?.completed_at ? 'h-full' : completionSummary?.completed_at && completionSummary?.notes ? 'h-1/2' : 'h-full'} ${completionSummary?.completed_at && 'group-hover:hidden'}`}>
        <div className={completionSummary?.completed_at ? 'group-hover:hidden text-xs' : 'block'}>{text}</div>
      </div>
      {/* user note. only if complete and notes exist */}
      <div className={`border-t-2 border-amber-50 opacity-65 h-1/2 text-xs flex flex-col justify-center items-center leading-none ${completionSummary?.notes ? 'block' : 'hidden'} group-hover:hidden`}>
        {completionSummary?.notes}
      </div>
      {/* add note. only thing visible on hover when completed. */}
      { completionSummary?.completed_at && 
        <div className='transition-all overflow-hidden max-h-0 group-hover:max-h-[100px]'>
          <Textarea autoFocus size="xs" rows={4} placeholder='Add a note' value={completionSummary?.notes} onChange={(e) => handleSaveNotes(e.target.value)} className='square-text-entry' />
          <Button size='compact-xs' color={colors.red[300]} variant='transparent' fullWidth onClick={() => resetObjective()}>Reset</Button>
        </div>
      }
    </div>
  )
}

export default BingoSquare
