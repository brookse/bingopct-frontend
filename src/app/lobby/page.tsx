'use client';

// import seedData from '@/seed.json';
import gameData from '@/game-two.json';
import { CompletionSquare, CompletionSummary, Lobby, Player } from "@/types/types";
import { Button } from '@mantine/core';
import { useEffect, useState } from "react";
import colors from 'tailwindcss/colors';
import BingoSquare from './BingoSquare';
import PlayerPreview from './PlayerPreview';
import Timer from './Timer';

// TODO once game starts, sort player list by bingos, then objectives, then name

export default function LobbyPage() {
  const [me, setMe] = useState<Player>({ id: '3', name: 'me', is_ready: false, player_state: { total_bingo: 0, total_objectives: 0, completion_summary: {} } });
  const [lobby, setLobby] = useState<Lobby>();
  const [hasJoined, setHasJoined] = useState<boolean>(true);
  const [completionSummary, setCompletionSummary] = useState<CompletionSummary>();

  useEffect(() => {
    // when the user enters the lobby, check if they have a lobby in local storage
    const lobbyData = localStorage.getItem('lobby');
    if (lobbyData) {
      const parsedLobby = JSON.parse(lobbyData) as Lobby;
      setLobby(parsedLobby);
      setCompletionSummary(parsedLobby.players.length >0 ? parsedLobby.players[0].player_state.completion_summary : {});
    } else {
      // otherwise, create a lobby from the seeds
      const lobby = gameData as Lobby;
      setLobby(lobby);
      setCompletionSummary({});
    }
  }, []);

  useEffect(() => {
    // if the lobby changes, save it to local storage
    if (lobby) {
      localStorage.setItem('lobby', JSON.stringify(lobby));
    }
  }, [lobby]);

  const beginGame = () => {
    if (!lobby) return
    // add user to the lobby
    const playerData = {
      id: me.id,
      name: me.name,
      is_ready: true,
      player_state: {
        total_bingo: 0,
        total_objectives: 0,
        completion_summary: {},
      },
    };
    const lobbyCopy = { 
      ...lobby,
      game_state: 'playing' as const,
      is_timer_running: true,
      timer_start: new Date().toISOString(),
      players: [playerData],
    };
    setLobby(lobbyCopy);
    setHasJoined(true);
    // save the lobby to local storage

  }

  // const joinGame = () => {
  //   if (!lobby) return
  //   // add the game to local storage
  //   const joinedGames = localStorage.getItem('joinedGames');
  //   if (joinedGames) {
  //     localStorage.setItem('joinedGames', `${joinedGames},${lobby?.join_code}`);
  //   }
  //   setHasJoined(true);
  //   // add player data to the lobby and save
  //   const lobbyCopy = { ...lobby };
  //   const playerData = {
  //     id: me.id,
  //     name: me.name,
  //     is_ready: false,
  //     player_state: {
  //       total_bingo: 0,
  //       total_objectives: 0,
  //       completion_summary: {},
  //     },
  //   };
  //   lobbyCopy.players.push(playerData);
  //   setLobby(lobbyCopy);
  //   // localStorage.setItem('lobby', JSON.stringify(lobby));
  // };

  const handleToggleReady = () => {
    if (!lobby) return
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
      setLobby({
        ...lobbyCopy,
        game_state: 'playing',
        is_timer_running: true,
        timer_start: new Date().toISOString(),
      });
    }
  };
  
  const updateCompletionSummary = (text: string, square: CompletionSquare) => {
    if (!lobby) return
    setCompletionSummary((prevState) => ({
      ...prevState,
      [text]: square,
    }));

    const lobbyCopy = { ...lobby };
    const playerIndex = lobbyCopy.players.findIndex(player => player.id === me.id);
    const player = lobbyCopy.players[playerIndex];
    player.player_state.completion_summary[text] = square;
    lobbyCopy.players[playerIndex] = player;
    setLobby(lobbyCopy);
  }

  const completeLobby = () => {
    if (!lobby) return
    // organize the players by bingos, then objectives, then name
    const sortedPlayers = [...lobby.players].sort((a, b) => {
      if (a.player_state.total_bingo !== b.player_state.total_bingo) {
        return b.player_state.total_bingo - a.player_state.total_bingo;
      } else if (a.player_state.total_objectives !== b.player_state.total_objectives) {
        return b.player_state.total_objectives - a.player_state.total_objectives;
      } else {
        return a.name.localeCompare(b.name);
      }
    });

    setLobby({
      ...lobby,
      game_state: 'finished',
      is_timer_running: false,
      players: sortedPlayers
    });
  };

  const clearSavedLobby = () => {
    localStorage.removeItem('lobby');
    setLobby(gameData as Lobby);
    setCompletionSummary({});
  };
  
  return (
    <div className='flex flex-col sm:flex-row items-start justify-center gap-4 h-screen p-8'>
      <div className='fatpixel w-full sm:h-full h-full sm:min-w-[250px] sm:max-w-[250px] flex flex-col items-start gap-6 p-4 bg-[#273B54] text-amber-50'>
        <div className='flex flex-row justify-between w-full h-full'>
          {/* local sidebar */}
          <div className='w-full flex flex-col justify-between h-full'>
            <div className='flex flex-col gap-4'>
              <div className='flex flex-row justify-between items-baseline w-full'>
                <h1 className="text-2xl skinnypixel">bingo%</h1>
                { lobby?.game_state === 'waiting' && 
                    <Button color='#534E66' className='text-amber-50' size='xs' onClick={beginGame}>
                      Begin Game
                    </Button>
                  }
              </div>
              { lobby && lobby.is_timer_running && <Timer lobby={lobby} completeLobby={completeLobby} /> }

              <div className='w-full'>
                <div className='flex flex-row justify-between w-full'>
                  <h2 className="text-lg skinnypixel">players</h2>
                  { lobby && lobby.game_state === 'waiting' && lobby.players.length > 0 && <p>{lobby.players.filter(player => player.is_ready).length} / {lobby.players.length} ready</p> }
                </div>
                <div className='flex flex-col gap-3'>
                  {lobby && lobby.players.map((player, index) => (
                    <PlayerPreview
                      lobby={lobby}
                      key={player.id}
                      player={player}
                      me={me}
                      place={index + 1}
                      handleToggleReady={handleToggleReady}
                      isWinner={lobby.game_state === 'finished' && lobby.players[0].id === player.id}
                    />
                ))}
                </div>
              </div>

            </div>
            { lobby && <Button onClick={clearSavedLobby} color={colors.red[300]} variant='subtle'>Clear Saved Lobby</Button> }
          </div>

          {/* networking sidebar */}
          {/* <div className='w-full'>
            <div className='flex flex-row justify-between items-baseline w-full'>
              <h1 className="text-2xl skinnypixel">bingo%</h1>
              { lobby && lobby.is_timer_running && <Timer lobby={lobby} completeLobby={completeLobby} /> }
              { lobby?.game_state === 'waiting' && 
                  <Button color='#534E66' className='text-amber-50' size='xs' onClick={beginGame}>
                    Begin Game
                  </Button>
                }
            </div>
            { lobby?.game_state === 'waiting' &&
              <div>
                <div className='flex flex-row items-center'>
                  <p className='leading-none'>join code: {lobby.join_code}</p>
                  { lobby.join_code && <CopyButton value={lobby.join_code} timeout={2000}>
                    {({ copied, copy }) => (
                      <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right">
                        <ActionIcon color={copied ? 'teal' : 'gray'} variant="subtle" onClick={copy}>
                          {copied ? <FontAwesomeIcon icon={faCheck} /> : <FontAwesomeIcon icon={faCopy} />}
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </CopyButton> }
                </div>
                <p>game time: {mToHms(lobby.timer_length)}</p>
              </div>
            }
          </div> */}

          {/* <div>
            { !hasJoined &&
              <div className='flex flex-col items-center'>
                <Button color='#534E66' className='text-amber-50' size='xs' onClick={joinGame}>
                  Join Game
                </Button>
                { lobby.players.length > 0 ? `${lobby.players.length} players` : 'no players yet' }
              </div> 
            }
          </div> */}
        </div>

        {/* players  */}
        {/* { hasJoined && 
          <div className='w-full'>
            <div className='flex flex-row justify-between w-full'>
              <h2 className="text-lg skinnypixel">players</h2>
              { lobby && lobby.game_state === 'waiting' && lobby.players.length > 0 && <p>{lobby.players.filter(player => player.is_ready).length} / {lobby.players.length} ready</p> }
            </div>
            <div className='flex flex-col gap-3'>
              {lobby && lobby.players.map((player, index) => (
                <PlayerPreview
                  lobby={lobby}
                  key={player.id}
                  player={player}
                  me={me}
                  place={index + 1}
                  handleToggleReady={handleToggleReady}
                  isWinner={lobby.game_state === 'finished' && lobby.players[0].id === player.id}
                />
            ))}
            </div>
          </div>
        } */}
      </div>

      {/* bingo card */}
      <div className={`flex flex-col h-full min-w-[600px] min-h-[600px] ${lobby?.game_state === 'waiting' && 'border border-amber-50'} relative`}>
        { lobby?.game_state === 'waiting' &&
          <p className='absolute w-full text-center text-xl top-1/2'>Objectives will be revealed once the game starts</p>
        }

        <div className={`flex flex-row ${lobby?.game_state !== 'waiting' ? 'visible' : 'invisible'}`}>
          {completionSummary && lobby?.card.first.map((item, index) => (
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
        <div className={`flex flex-row ${lobby?.game_state !== 'waiting' ? 'visible' : 'invisible'}`}>
          {completionSummary && lobby?.card.second.map((item, index) => (
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
        <div className={`flex flex-row ${lobby?.game_state !== 'waiting' ? 'visible' : 'invisible'}`}>
          {completionSummary && lobby?.card.third.map((item, index) => (
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
        <div className={`flex flex-row ${lobby?.game_state !== 'waiting' ? 'visible' : 'invisible'}`}>
          {completionSummary && lobby?.card.fourth.map((item, index) => (
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
        <div className={`flex flex-row ${lobby?.game_state !== 'waiting' ? 'visible' : 'invisible'}`}>
          {completionSummary && lobby?.card.fifth.map((item, index) => (
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