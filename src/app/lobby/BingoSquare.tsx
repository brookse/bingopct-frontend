'use client'
import { CompletionSquare, Lobby, Player } from '@/types/types'
import { getNumBingos } from '@/utils/utils'
import { Textarea } from '@mantine/core'
import React, { useState } from 'react'

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
  // check if the objective is completed
  // const isCompleted = completionSummary[text] && completionSummary[text].completed_at !== null;
  // const notes = completionSummary[text]?.notes || undefined;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSetCompleted = (event: any) => {
    event.preventDefault();
    if (completionSummary?.completed_at) return;
    setCompleted(text);
  };

  const setCompleted = (text: string) => {
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

  const AddNote = ({notes} : {notes: string | undefined}) => {
    const [note, setNote] = useState<string | undefined>(notes);

    // after 2 seconds, save the notes to the completion summary
    const setNotes = (n: string) => {
      setNote(n);

      // TODO this is really inefficient
      // const timer = setTimeout(() => {
        if (note && completionSummary?.completed_at) {
          const lobbyCopy = { ...lobby };
          const playerIndex = lobbyCopy.players.findIndex(player => player.id === me.id);
          const player = lobbyCopy.players[playerIndex];
          const squareCompletion = {
            completed_at: completionSummary.completed_at,
            notes: n,
          };
          updateCompletionSummary(text, squareCompletion);
          player.player_state.completion_summary[text] = squareCompletion;
          lobbyCopy.players[playerIndex] = player;
          setLobby(lobbyCopy);
        }
      // }, 2000);
      // return () => clearTimeout(timer);
    }
    return (
      <div>
        <Textarea size="xs" rows={4} placeholder='Add a note' value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
    )
  }

  return (
    <div className={`group transition-all hover:scale-125 px-4 w-1/5 overflow-hidden content-center border border-amber-50 text-amber-50 text-center fatpixel aspect-square ${completionSummary?.completed_at ? 'bg-[#534E66] cursor-default' : 'cursor-pointer hover:bg-[#273B54]'}`} onClick={handleSetCompleted}>
      {/* objective. if complete and notes, half size. otherwise full. if hover and complete, none */}
      <div className={`transition-all flex flex-col justify-center items-center gap-2 leading-none ${!completionSummary?.completed_at ? 'h-full' : completionSummary?.completed_at && completionSummary?.notes ? 'h-1/2' : 'h-full'} ${completionSummary?.completed_at && 'group-hover:hidden'}`}>
        <div className={completionSummary?.completed_at ? 'group-hover:hidden' : 'block'}>{text}</div>
      </div>
      {/* user note. only if complete and notes exist */}
      <div className={`border-t-2 border-amber-50 opacity-65 h-1/2 ${completionSummary?.notes ? 'block' : 'hidden'} group-hover:hidden`}>
        {completionSummary?.notes}
      </div>
      {/* add note. only thing visible on hover when completed. */}
      { completionSummary?.completed_at && <div className='transition-all overflow-hidden max-h-0 group-hover:max-h-[100px]'><AddNote notes={completionSummary?.notes} /> </div> }
    </div>
  )
}

export default BingoSquare
