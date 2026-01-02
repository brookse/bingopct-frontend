'use client';

// import seedData from '@/seed.json';
import { CompletionSquare, CompletionSummary, Lobby, Player, PlayerState } from "@/types/types";
import { mToHms } from '@/utils/utils';
import { faCheck, faCopy } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon, Button, CopyButton, Loader, TextInput, Tooltip } from '@mantine/core';
import { useEffect, useState } from "react";
import colors from 'tailwindcss/colors';
import { useAPI } from '../api/endpoints';
import BingoSquare from './BingoSquare';
import PlayerPreview from './PlayerPreview';
import Timer from './Timer';

let sec = 0;
export default function LobbyPage() {
  const { isLoading, getLobby, joinLobby, updateLobby, finishGame, setReadyState, updateState, startGame } = useAPI();
  const [isInFirstLoadSetup, setIsInFirstLoadSetup] = useState(true);

  // form inputs for joining
  const [name, setName] = useState<string>('');
  const [joinCode, setJoinCode] = useState<string>('');

  const [timeUntilNextPoll, setTimeUntilNextPoll] = useState(0);

  const [me, setMe] = useState<Player>();
  const [lobby, setLobby] = useState<Lobby>();
  const [completionSummary, setCompletionSummary] = useState<CompletionSummary>();
  const [previewingCard, setPreviewingCard] = useState<Player | null>(null);

  useEffect(() => {
    // when the user enters the lobby, check if they have a lobby in local storage
    const lobbyData = localStorage.getItem('lobby');
    const meData = localStorage.getItem('player');
    if (lobbyData) {
      const parsedLobby = JSON.parse(lobbyData) as Lobby;
      if (meData) {
        const parsedMe = JSON.parse(meData) as Player;
        setMe(parsedMe);

        getLobby(parsedLobby.join_code || '').then((fetchedLobby) => {
          // find my player data
          const existingPlayer = fetchedLobby.players.find(player => player.id === parsedMe?.id);
          setCompletionSummary(existingPlayer?.player_state.completion_summary);
          setLobby(fetchedLobby);
          setJoinCode(fetchedLobby.join_code || '');
          setIsInFirstLoadSetup(false); 
        });
      }
    } else {
      setIsInFirstLoadSetup(false); 
    }
  }, []);

  // only start the poll loop once when we have a joinCode and me
  useEffect(() => {
    const ready = !!joinCode && !!me;
    if (!ready) return;

    let mounted = true;
    let countdownInterval: ReturnType<typeof setInterval> | null = null;
    let pollTimeout: ReturnType<typeof setTimeout> | null = null;

    const getDelayFor = (l?: Lobby) => (l && l.game_state === 'playing' ? 60000 : 10000);

    const clearCountdown = () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
      }
      setTimeUntilNextPoll(0);
    };

    const runPoll = async () => {
      try {
        const fetchedLobby = await getLobby(joinCode);
        if (!mounted) return null;

        // do a special handle for when local is not started, but remote is
        if (lobby && lobby.game_state !== 'playing' && fetchedLobby.game_state === 'playing') {
          const existingPlayer = fetchedLobby.players.find(player => player.id === me.id);
          setCompletionSummary(existingPlayer?.player_state.completion_summary);
        }

        setLobby(fetchedLobby);

        // if the game is finished, stop polling
        if (fetchedLobby.game_state === 'finished') {
          clearCountdown();
        }

        return fetchedLobby;
      } catch (err) {
        if (err === 'Lobby not found' && joinCode === lobby?.join_code) {
          // the lobby was deleted remotely, so clear local storage
          clearSavedLobby();
        }
        // swallow errors so the loop can continue
        return null;
      }
    };

    const startCountdown = (delayMs: number) => {
      // clear any previous countdown just in case
      if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
      }

      let remaining = delayMs;
      setTimeUntilNextPoll(remaining);

      countdownInterval = setInterval(() => {
        remaining = Math.max(0, remaining - 1000);
        setTimeUntilNextPoll(remaining);
        if (remaining <= 0 && countdownInterval) {
          clearInterval(countdownInterval);
          countdownInterval = null;
        }
      }, 1000);
    };

    const scheduleNext = async (initialDelayMs?: number, currentLobby?: Lobby | null) => {
      // if the current lobby is finished, don't schedule further polls
      if (currentLobby?.game_state === 'finished') {
        clearCountdown();
        return;
      }

      const delay = typeof initialDelayMs === 'number' ? initialDelayMs : 10000;
      startCountdown(delay);

      pollTimeout = setTimeout(async () => {
        if (!mounted) return;
        const fetched = await runPoll();
        if (!mounted) return;

        // if fetched indicates finished, stop scheduling
        if (fetched?.game_state === 'finished') {
          clearCountdown();
          return;
        }

        const nextDelay = fetched ? getDelayFor(fetched) : getDelayFor(currentLobby || lobby);
        scheduleNext(nextDelay, fetched || currentLobby || lobby);
      }, delay);
    };

    // kick off: do an initial poll and then schedule the loop based on returned lobby state
    runPoll().then((fetched) => {
      if (!mounted) return;
      const initialDelay = fetched ? getDelayFor(fetched) : getDelayFor(lobby);
      if (fetched?.game_state === 'finished') {
        clearCountdown();
        return;
      }
      scheduleNext(initialDelay, fetched || lobby);
    });

    return () => {
      mounted = false;
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
      if (pollTimeout) {
        clearTimeout(pollTimeout);
      }
    };
  }, [!!joinCode && !!me && !!lobby]);

  const joinGame = () => {
    if (!joinCode || !name) return
    joinLobby(joinCode, name).then((joinedPlayer) => {
      // Update the local state with the joined player
      setMe(joinedPlayer);
      localStorage.setItem('player', JSON.stringify(joinedPlayer));
      getLobby(joinCode).then((updatedLobby) => {
        setLobby(updatedLobby);
        localStorage.setItem('lobby', JSON.stringify(updatedLobby));
      });
    });
  };

  const handleToggleReady = () => {
    if (!lobby || !lobby.join_code || !me) return
    setReadyState(lobby.join_code, me.id, !me.is_ready).then((updatedLobby) => {
      setLobby(updatedLobby);
      const updatedPlayer = updatedLobby.players.find(player => player.id === me.id);
      if (updatedPlayer) {
        setMe(updatedPlayer);
      }

      // check if all players are ready
      const allReady = updatedLobby.players.every(player => player.is_ready);
      if (allReady) {
        // if so, start the game
        setTimeout(() => {
          setLobby({
            ...updatedLobby,
            game_state: 'playing',
            is_timer_running: true,
            timer_start: new Date().toISOString(),
          });
          startGame(lobby.join_code || '').then((startedLobby) => {
            setLobby(startedLobby);
            // we just started playing, so set up the completion summary from our player state
            const existingPlayer = startedLobby.players.find(player => player.id === me.id);
            setCompletionSummary(existingPlayer?.player_state.completion_summary);
          });
        }, 3000)
      }
    });
  };
  
  const updateCompletionSummary = (text: string, square: CompletionSquare) => {
    if (!lobby || !me) return
    setCompletionSummary((prevState) => ({
      ...prevState,
      [text]: square,
    }));

    updateState(lobby.join_code || '', me.id, {
      ...me.player_state,
      completion_summary: {
        ...me.player_state.completion_summary,
        [text]: square,
      },
    }).then((updatedLobby) => {
      setLobby(updatedLobby);
      localStorage.setItem('lobby', JSON.stringify(updatedLobby));
      const updatedPlayer = updatedLobby.players.find(player => player.id === me.id);
      if (updatedPlayer) {
        setMe(updatedPlayer);
      }
    });
  }

  const updatePlayerState = (newState: PlayerState) => {
    if (!lobby || !me) return
    // update local me state
    const updatedMe = {
      ...me,
      player_state: {
        ...newState,
      },
    };
    setMe(updatedMe);
    setCompletionSummary(newState.completion_summary);

    updateState(lobby.join_code || '', me.id, newState).then((updatedLobby) => {
      setLobby(updatedLobby);
      const updatedPlayer = updatedLobby.players.find(player => player.id === me.id);
      if (updatedPlayer) {
        setMe(updatedPlayer);
      }
    });
  }

  const completeLobby = async () => {
    if (!lobby || !joinCode) return
    finishGame(joinCode).then((finishedLobby) => {
      setLobby(finishedLobby);
    }).catch((err) => {
      console.log('supressing finishGame error:', err);
    });
  };

  const clearSavedLobby = () => {
    console.log('Clearing saved lobby');
    localStorage.removeItem('lobby');
    localStorage.removeItem('player');
    setLobby(undefined);
    setCompletionSummary({});
    setMe(undefined);
    setJoinCode('');
  };

  const handlePreviewCard = (player: Player) => {
    setCompletionSummary(player.player_state.completion_summary);
    if (player.id === me?.id) {
      setPreviewingCard(null)
    } else {
      setPreviewingCard(player);
    }
  }
  
  return (
    <div className='flex flex-col sm:flex-row items-start justify-center gap-4 h-screen p-8'>
      <div className='fatpixel w-full sm:h-full h-full sm:min-w-[250px] sm:max-w-[250px] flex flex-col items-start gap-6 p-4 bg-[#273B54] text-amber-50'>
        <div className='flex flex-row justify-between w-full'>
          {/* networking sidebar */}
          <div className='w-full'>
            <div className='flex flex-row justify-between items-baseline w-full'>
              <h1 className="text-2xl skinnypixel">bingo%</h1>
              { isLoading && lobby &&
                <Loader size="sm" color='white' />
              }
            </div>
            { lobby && lobby.is_timer_running && <Timer lobby={lobby} completeLobby={completeLobby} /> }

            {isInFirstLoadSetup &&
              <div className="mt-4 flex flex-col items-center">
                <Loader size="sm" color='white' className="mt-2" type="dots" />
                <div className="text-center">Checking to see if you have a game already</div>
              </div>
            }

            { !lobby && !isInFirstLoadSetup &&
              <div className='flex flex-col gap-4 items-center mt-12'>
                <div>Join a game!</div>
                <div className='flex flex-row w-full gap-2'>
                  <TextInput
                    placeholder="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <TextInput
                    placeholder="join code"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  />
                </div>
                <Button color='#534E66' className='text-amber-50' size='xs' onClick={joinGame} loading={isLoading}>
                  Join Game
                </Button>
              </div> 
            }

            { lobby && lobby.game_state === 'waiting' &&
              <div className='flex flex-col gap-1 mt-4'>
                <div className='flex flex-row items-center'>
                  <p className='leading-none'>join code: {lobby.join_code}</p>
                  { lobby.join_code && <CopyButton value={lobby.join_code} timeout={2000}>
                    {({ copied, copy }) => (
                      <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right">
                        <ActionIcon color={copied ? 'teal' : 'gray'} variant="subtle" size='sm' onClick={copy}>
                          {copied ? <FontAwesomeIcon icon={faCheck} /> : <FontAwesomeIcon icon={faCopy} />}
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </CopyButton> }
                </div>
                <p>game time: {mToHms(lobby.timer_length)}</p>
              </div>
            }
          </div>
        </div>

        {/* players  */}
        { lobby && 
          <div className='w-full'>
            <div className='flex flex-row justify-between w-full'>
              <h2 className="text-lg skinnypixel font-semibold">players</h2>
              { lobby && lobby.game_state === 'waiting' && lobby.players.length > 0 && <p>{lobby.players.filter(player => player.is_ready).length} / {lobby.players.length} ready</p> }
            </div>
            <div className='flex flex-col gap-3'>
              {lobby && me && lobby.players.map((player, index) => (
                <PlayerPreview
                  lobby={lobby}
                  key={player.id}
                  player={player}
                  me={me}
                  place={index + 1}
                  handleToggleReady={handleToggleReady}
                  previewCard={handlePreviewCard}
                  currentlyPreviewing={previewingCard}
                  isWinner={lobby.game_state === 'finished' && lobby.players[0].id === player.id}
                />
            ))}
            </div>
          </div>
        }

        { lobby && <div className="flex flex-col gap-2 w-full mt-auto">
          <div>Next poll in: {Math.max(0, timeUntilNextPoll)/1000} s</div>
          <Button onClick={clearSavedLobby} color={colors.red[300]} variant='subtle'>Clear Saved Lobby</Button>
        </div> }
      </div>

      {/* bingo card */}
      <div className={`flex flex-col h-full min-w-[600px] min-h-[600px] ${lobby?.game_state === 'waiting' && 'border border-amber-50'} relative`}>
        { lobby?.game_state === 'waiting' &&
          <p className='absolute w-full text-center text-xl top-1/2'>Objectives will be revealed once the game starts</p>
        }

        <div className={`flex flex-row ${lobby?.game_state !== 'waiting' ? 'visible' : 'invisible'}`}>
          {completionSummary && me && lobby?.card.first.map((item, index) => (
            <BingoSquare 
              key={index}
              text={item}
              completionSummary={completionSummary[item]}
              updateCompletionSummary={updateCompletionSummary}
              updatePlayerState={updatePlayerState}
              lobby={lobby}
              setLobby={setLobby}
              me={me} />
          ))}
        </div>
        <div className={`flex flex-row ${lobby?.game_state !== 'waiting' ? 'visible' : 'invisible'}`}>
          {completionSummary && me && lobby?.card.second.map((item, index) => (
            <BingoSquare 
              key={index}
              text={item}
              completionSummary={completionSummary[item]}
              updateCompletionSummary={updateCompletionSummary}
              updatePlayerState={updatePlayerState}
              lobby={lobby}
              setLobby={setLobby}
              me={me} />
          ))}
        </div>
        <div className={`flex flex-row ${lobby?.game_state !== 'waiting' ? 'visible' : 'invisible'}`}>
          {completionSummary && me && lobby?.card.third.map((item, index) => (
            <BingoSquare 
              key={index}
              text={item}
              completionSummary={completionSummary[item]}
              updateCompletionSummary={updateCompletionSummary}
              updatePlayerState={updatePlayerState}
              lobby={lobby}
              setLobby={setLobby}
              me={me} />
          ))}
        </div>
        <div className={`flex flex-row ${lobby?.game_state !== 'waiting' ? 'visible' : 'invisible'}`}>
          {completionSummary && me && lobby?.card.fourth.map((item, index) => (
            <BingoSquare 
              key={index}
              text={item}
              completionSummary={completionSummary[item]}
              updateCompletionSummary={updateCompletionSummary}
              updatePlayerState={updatePlayerState}
              lobby={lobby}
              setLobby={setLobby}
              me={me} />
          ))}
        </div>
        <div className={`flex flex-row ${lobby?.game_state !== 'waiting' ? 'visible' : 'invisible'}`}>
          {completionSummary && me && lobby?.card.fifth.map((item, index) => (
            <BingoSquare 
              key={index}
              text={item}
              completionSummary={completionSummary[item]}
              updateCompletionSummary={updateCompletionSummary}
              updatePlayerState={updatePlayerState}
              lobby={lobby}
              setLobby={setLobby}
              me={me} />
          ))}
        </div>
      </div>
    </div>
  );
}