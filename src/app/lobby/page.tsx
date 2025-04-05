'use client';

import seedData from '@/seed.json';
import { CompletionSquare, CompletionSummary, Lobby, Player } from "@/types/types";
import { mToHms } from '@/utils/utils';
import { faCopy } from '@fortawesome/free-regular-svg-icons';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon, Button, CopyButton, Tooltip } from '@mantine/core';
import { useEffect, useState } from "react";
import BingoSquare from './BingoSquare';
import PlayerPreview from './PlayerPreview';
import Timer from './Timer';

// TODO once game starts, sort player list by bingos, then objectives, then name

export default function LobbyPage() {
  const [me, setMe] = useState<Player>({ id: '3', name: 'me', is_ready: false, player_state: { total_bingo: 0, total_objectives: 0, completion_summary: {} } });
  const [lobby, setLobby] = useState<Lobby>(seedData as Lobby);
  const [hasJoined, setHasJoined] = useState<boolean>(false);
  const [completionSummary, setCompletionSummary] = useState<CompletionSummary>({});

  useEffect(() => {
    // check if the user has joined any games
    const joinedGames = localStorage.getItem('joinedGames');
    if (joinedGames?.includes(lobby.join_code)) {
      setHasJoined(true);
    }
  }, []);

  const joinGame = () => {
    // add the game to local storage
    const joinedGames = localStorage.getItem('joinedGames');
    if (joinedGames) {
      localStorage.setItem('joinedGames', `${joinedGames},${lobby.join_code}`);
    }
    setHasJoined(true);
    // add player data to the lobby and save
    const lobbyCopy = { ...lobby };
    const playerData = {
      id: me.id,
      name: me.name,
      is_ready: false,
      player_state: {
        total_bingo: 0,
        total_objectives: 0,
        completion_summary: {},
      },
    };
    lobbyCopy.players.push(playerData);
    setLobby(lobbyCopy);
    // localStorage.setItem('lobby', JSON.stringify(lobby));
  };

  const handleToggleReady = () => {
    // toggle the player's ready state
    const lobbyCopy = { ...lobby };
    const playerIndex = lobbyCopy.players.findIndex(player => player.id === me.id);
    const player = lobbyCopy.players[playerIndex];
    player.is_ready = !player.is_ready;
    lobbyCopy.players[playerIndex] = player;
    setLobby(lobbyCopy);
    setMe(player);

    // check if all players are ready
    const allReady = lobbyCopy.players.every(player => player.is_ready);
    if (allReady) {
      // if so, start the game
      setLobby((prevLobby) => ({
        ...prevLobby,
        game_state: 'playing',
        is_timer_running: true,
        timer_start: new Date().toISOString(),
      }));
    }
  };
  
  const updateCompletionSummary = (text: string, square: CompletionSquare) => {
    setCompletionSummary((prevState) => ({
      ...prevState,
      [text]: square,
    }));
  }
  
  return (
    <div className='flex flex-col sm:flex-row items-center justify-center gap-4 h-screen p-8'>
      <div className='fatpixel w-full sm:h-full sm:min-w-[250px] sm:max-w-[250px] flex flex-col items-start gap-6 p-4 bg-[#273B54] text-amber-50'>
        <div className='flex flex-row justify-between w-full'>
          {/* header */}
          <div className='w-full'>
            <div className='flex flex-row justify-between w-full'>
              <h1 className="text-2xl skinnypixel">bingo%</h1>
              <Timer lobby={lobby} setLobby={setLobby} />
            </div>
            { lobby.game_state === 'waiting' &&
              <div>
                <div className='flex flex-row items-center'>
                  <p className='leading-none'>join code: {lobby.join_code}</p>
                  <CopyButton value={lobby.join_code} timeout={2000}>
                    {({ copied, copy }) => (
                      <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right">
                        <ActionIcon color={copied ? 'teal' : 'gray'} variant="subtle" onClick={copy}>
                          {copied ? <FontAwesomeIcon icon={faCheck} /> : <FontAwesomeIcon icon={faCopy} />}
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </CopyButton>
                </div>
                <p>game time: {mToHms(lobby.timer_length)}</p>
              </div>
            }
          </div>

          <div>
            { !hasJoined &&
              <div className='flex flex-col items-center'>
                <Button color='#534E66' className='text-amber-50' size='xs' onClick={joinGame}>
                  Join Game
                </Button>
                { lobby.players.length > 0 ? `${lobby.players.length} players` : 'no players yet' }
              </div> 
            }
          </div>
        </div>

        {/* players  */}
        { hasJoined && 
          <div className='w-full'>
            <div className='flex flex-row justify-between w-full'>
              <h2 className="text-lg skinnypixel">players</h2>
              { lobby.players.length > 0 && <p>{lobby.players.filter(player => player.is_ready).length} / {lobby.players.length} ready</p> }
            </div>
            <div className='flex flex-col gap-2'>
              <PlayerPreview
                lobby={lobby}
                key={me.id}
                player={me}
                me={me}
                handleToggleReady={handleToggleReady}
              />
              {lobby.players.map((player) => {
                return player.id !== me.id && <PlayerPreview
                  lobby={lobby}
                  key={player.id}
                  player={player}
                  me={me}
                />
            })}
            </div>
          </div>
        }
      </div>

      {/* bingo card */}
      <div className={`flex flex-col h-full ${lobby.game_state === 'waiting' && 'border border-amber-50'} relative`}>
        { lobby.game_state === 'waiting' &&
          <p className='absolute w-full text-center top-1/2'>Objectives will be revealed once the game starts</p>
        }

        <div className={`flex flex-row ${lobby.game_state !== 'waiting' ? 'visible' : 'invisible'}`}>
          {lobby.card.first.map((item, index) => (
            <BingoSquare 
              key={index}
              text={item}
              completionSummary={completionSummary[item]}
              updateCompletionSummary={updateCompletionSummary}
              lobby={lobby}
              setLobby={setLobby}
              me={me} />
          ))}
        </div>
        <div className={`flex flex-row ${lobby.game_state !== 'waiting' ? 'visible' : 'invisible'}`}>
          {lobby.card.second.map((item, index) => (
            <BingoSquare 
              key={index}
              text={item}
              completionSummary={completionSummary[item]}
              updateCompletionSummary={updateCompletionSummary}
              lobby={lobby}
              setLobby={setLobby}
              me={me} />
          ))}
        </div>
        <div className={`flex flex-row ${lobby.game_state !== 'waiting' ? 'visible' : 'invisible'}`}>
          {lobby.card.third.map((item, index) => (
            <BingoSquare 
              key={index}
              text={item}
              completionSummary={completionSummary[item]}
              updateCompletionSummary={updateCompletionSummary}
              lobby={lobby}
              setLobby={setLobby}
              me={me} />
          ))}
        </div>
        <div className={`flex flex-row ${lobby.game_state !== 'waiting' ? 'visible' : 'invisible'}`}>
          {lobby.card.fourth.map((item, index) => (
            <BingoSquare 
              key={index}
              text={item}
              completionSummary={completionSummary[item]}
              updateCompletionSummary={updateCompletionSummary}
              lobby={lobby}
              setLobby={setLobby}
              me={me} />
          ))}
        </div>
        <div className={`flex flex-row ${lobby.game_state !== 'waiting' ? 'visible' : 'invisible'}`}>
          {lobby.card.fifth.map((item, index) => (
            <BingoSquare 
              key={index}
              text={item}
              completionSummary={completionSummary[item]}
              updateCompletionSummary={updateCompletionSummary}
              lobby={lobby}
              setLobby={setLobby}
              me={me} />
          ))}
        </div>
      </div>
    </div>
  );
}