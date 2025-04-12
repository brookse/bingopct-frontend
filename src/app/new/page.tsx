'use client';

import objectives from '@/objectives.json';
import { Lobby, PlanningCard, PlanningObjective } from "@/types/types";
import { faArrowsRotate, faCheck, faCopy } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon, Button, CopyButton, TextInput, Tooltip } from '@mantine/core';
import { useEffect, useState } from "react";
import colors from 'tailwindcss/colors';
import PlanningBingoSquare from './PlanningBingoSquare';

type difficulty = 'easy' | 'medium' | 'hard';

export default function NewLobby() {
  const [planningCard, setPlanningCard] = useState<PlanningCard>();

  const [lobby, setLobby] = useState<Lobby>({
    game_state: 'planning',
    card: {
      first: [],
      second: [],
      third: [],
      fourth: [],
      fifth: [],
      tiebreaker: '',
    },
    players: [],
    join_code: '',
    game_mode: 'synchronous',
    timer_length: 60,
    timer_start: '',
    is_timer_running: false,
  });
  const [objectiveDistribution, setObjectiveDistribution] = useState({ easy: 15, medium: 5, hard: 5 });
  const currentTotal = Object.values(objectiveDistribution).reduce((a, b) => a + b, 0);

  useEffect(() => {

  }, [])

  const decrease = (difficulty: difficulty) => () => {
    setObjectiveDistribution((prev) => ({
      ...prev,
      [difficulty]: prev[difficulty] - 1,
    }));
  };
  const increase = (difficulty: difficulty) => () => {
    // make sure increasing will not surpass the max total amount, 25
    // const sum = Object.values(objectiveDistribution).reduce((a, b) => a + b, 0);
    if (currentTotal >= 25) return;
    setObjectiveDistribution((prev) => ({
      ...prev,
      [difficulty]: prev[difficulty] + 1,
    }));
  };
  // generate a card based on the objective distribution
  const generateCard = () => {
    // collect all objectives based on the distribution
    const selectedObjectives: PlanningObjective[] = [];
    let tiebreaker = '';
    // make a copy of the objective distribution
    const objectiveDistributionCopy = { ...objectiveDistribution };

    for (const difficulty in objectiveDistributionCopy) {
      const numObjectives = objectiveDistributionCopy[difficulty as difficulty];
      const possibleObjectives = objectives[difficulty as difficulty];
      for (let i = 0; i < numObjectives; i++) {
        const randomIndex = Math.floor(Math.random() * possibleObjectives.length);
        const objective = possibleObjectives[randomIndex];
        selectedObjectives.push({title: objective, difficulty: difficulty, isLocked: false});
        // remove the objective from the pool
        possibleObjectives.splice(randomIndex, 1);
      }

      // select a tiebreaker objective
      if (difficulty === 'hard') tiebreaker = possibleObjectives[Math.floor(Math.random() * possibleObjectives.length)];
    }

    // shuffle the selected objectives
    const shuffledObjectives = selectedObjectives.sort(() => Math.random() - 0.5);
    // create the card
    const planningCard = {
      first: shuffledObjectives.slice(0, 5),
      second: shuffledObjectives.slice(5, 10),
      third: shuffledObjectives.slice(10, 15),
      fourth: shuffledObjectives.slice(15, 20),
      fifth: shuffledObjectives.slice(20, 25),
      tiebreaker: tiebreaker,
    };
    console.log(planningCard);
    setPlanningCard(planningCard);
  }


  const shuffleAll = () => {
    if (!planningCard) return;
    // flatten non-locked objectives in planning card into a single array
    const allObjectives = Object.values(planningCard).flat().filter((objective) => !objective.isLocked);
    // shuffle the objectives
    const shuffledObjectives = allObjectives.sort(() => Math.random() - 0.5);
    // create a new planning card, respecting the locked objectives
    const newPlanningCard: PlanningCard = {
      first: [...planningCard.first],
      second: [...planningCard.second],
      third: [...planningCard.third],
      fourth: [...planningCard.fourth],
      fifth: [...planningCard.fifth],
      tiebreaker: planningCard.tiebreaker,
    };
    // fill the new planning card with shuffled objectives
    newPlanningCard.first = newPlanningCard.first.map((objective) => {
      if (!objective.isLocked) return shuffledObjectives.pop() as PlanningObjective;
      return objective;
    }
    );
    newPlanningCard.second = newPlanningCard.second.map((objective) => {
      if (!objective.isLocked) return shuffledObjectives.pop() as PlanningObjective;
      return objective;
    }
    );
    newPlanningCard.third = newPlanningCard.third.map((objective) => {
      if (!objective.isLocked) return shuffledObjectives.pop() as PlanningObjective;
      return objective;
    }
    );
    newPlanningCard.fourth = newPlanningCard.fourth.map((objective) => {
      if (!objective.isLocked) return shuffledObjectives.pop() as PlanningObjective;
      return objective;
    }
    );
    newPlanningCard.fifth = newPlanningCard.fifth.map((objective) => {
      if (!objective.isLocked) return shuffledObjectives.pop() as PlanningObjective;
      return objective;
    }
    );
    // set the new planning card
    setPlanningCard(newPlanningCard);
  }

  const DistributionSelect = (difficulty: difficulty) => {
    return (
      <div className="flex flex-row gap-2 w-full">
        <div className="flex flex-row justify-between gap-2 bg-[#152A43] px-2 rounded-md w-1/3">
          <button onClick={decrease(difficulty)} className="hover:cursor-pointer disabled:invisible" disabled={objectiveDistribution[difficulty] === 0 || lobby.game_state !== 'planning'}>-</button>
          <div>{objectiveDistribution[difficulty]}</div>
          <button onClick={increase(difficulty)} className="hover:cursor-pointer disabled:invisible" disabled={currentTotal === 25 || lobby.game_state !== 'planning'}>+</button>
        </div>
        <p>{difficulty}</p>
      </div>
    );
  }

  const updatePlanningObjective = (objective: PlanningObjective, row: string, index: number) => {
    // update the objective in the planning card
    if (!planningCard) return;
    const originalObjective = planningCard[row as keyof PlanningCard][index] as PlanningObjective;

    // if the difficulty changes, reroll the objective
    if (objective.difficulty !== originalObjective.difficulty) {
      const possibleObjectives = objectives[objective.difficulty as difficulty];
      const randomIndex = Math.floor(Math.random() * possibleObjectives.length);
      const newObjective = possibleObjectives[randomIndex];
      
      if (newObjective === originalObjective.title) { // reroll
        const newRandomIndex = Math.floor(Math.random() * possibleObjectives.length);
        objective.title = possibleObjectives[newRandomIndex];
      } else objective.title = newObjective;
    }

    // update planning card
    const planningCardCopy = { ...planningCard };
    if (Array.isArray(planningCardCopy[row as keyof PlanningCard])) {
      (planningCardCopy[row as keyof PlanningCard] as PlanningObjective[])[index] = objective;
    }
    setPlanningCard(planningCardCopy);
    // update the objective in the lobby
    // const lobbyCopy = { ...lobby };
    // (lobbyCopy.card[row as keyof PlanningCard] as string[])[index] = objective.title;
    // setLobby(lobbyCopy);
    // update the objective in the lobby
  }

  const regenerateTiebreaker = () => {
    if (!planningCard) return;
    const possibleObjectives = objectives.hard;
    const randomIndex = Math.floor(Math.random() * possibleObjectives.length);
    const newObjective = possibleObjectives[randomIndex];

    // TODO if the new objective is in the card, reroll
    
    // update planning card
    const planningCardCopy = { ...planningCard };
    planningCardCopy.tiebreaker = newObjective;
    setPlanningCard(planningCardCopy);
  }

  const createCardAndLobby = () => {
    if (!planningCard) return;
    // create the lobby
    const lobbyCopy = { ...lobby };
    // extract the objectives for each row
    lobbyCopy.card = {
      first: planningCard.first.map((objective) => objective.title),
      second: planningCard.second.map((objective) => objective.title),
      third: planningCard.third.map((objective) => objective.title),
      fourth: planningCard.fourth.map((objective) => objective.title),
      fifth: planningCard.fifth.map((objective) => objective.title),
      tiebreaker: planningCard.tiebreaker,
    };

    lobbyCopy.game_state = 'waiting';
    lobbyCopy.join_code = Math.random().toString(36).substring(2, 8);

    setLobby(lobbyCopy);
    console.log(lobbyCopy);

    // TODO save in backend
  }

  return (
    <div className='flex flex-col sm:flex-row items-center justify-center gap-4 h-screen p-8'>
      <div className='fatpixel w-full sm:h-full sm:min-w-[250px] sm:max-w-[250px] flex flex-col items-start gap-6 p-4 bg-[#273B54] text-amber-50'>
        <div>
          <h1 className="text-2xl skinnypixel">bingo%</h1>
          <h2>create a lobby</h2>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <h2>objectives</h2>
          <div className="flex flex-col gap-2">
            {DistributionSelect('easy')}
            {DistributionSelect('medium')}
            {DistributionSelect('hard')}
          </div>

          { lobby.game_state === 'planning' &&
            <div className='flex flex-row justify-center gap-2 w-full'>
              { !planningCard && <button className='bg-[#C58560] rounded py-1 px-2 hover:cursor-pointer hover:opacity-80' onClick={generateCard}>generate</button> }
              { planningCard && <button className='bg-[#C58560] rounded py-1 px-2 hover:cursor-pointer hover:opacity-80' onClick={generateCard}>regenerate</button> }
              { planningCard && <button className='bg-[#C58560] rounded py-1 px-2 hover:cursor-pointer hover:opacity-80' onClick={shuffleAll}>shuffle</button> }
            </div>
          }
        </div>

        { planningCard && <div className="flex flex-col gap-2 w-full">
          <h2>tiebreaker</h2>
          <div>
            {planningCard?.tiebreaker}
            <Button 
              variant='transparent'
              color={colors.amber[50]}
              size='compact-sm'
              className={`size-xs p-0 hover:cursor-pointer hover:opacity-80`} 
              onClick={regenerateTiebreaker}
            >
              <FontAwesomeIcon icon={faArrowsRotate} />
            </Button>
          </div>
        </div> }

        <div className="flex flex-col gap-2 w-full">
          <h2>lobby rules</h2>
          <div>
            <TextInput
              label="game time"
              placeholder="time in minutes"
              type="number"
              value={lobby.timer_length}
              rightSectionPointerEvents="none"
              rightSection='minutes'
              rightSectionWidth={60}
              required
              disabled={lobby.game_state !== 'planning'}
              onChange={(e) => setLobby({ ...lobby, timer_length: parseInt(e.target.value) })}
            />
          </div>
        </div>

        { planningCard && lobby.game_state === 'planning' && 
          <div className="flex flex-col gap-2 w-full">
            <button className='bg-[#C58560] rounded py-1 px-2 hover:cursor-pointer hover:opacity-80' onClick={createCardAndLobby}>create card and lobby</button> 
          </div>
        }

        { lobby.join_code && 
          <div className="flex flex-col gap-2 w-full">
            <h2>join code</h2>
            <CopyButton value={lobby.join_code} timeout={2000}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right">
                  <div className='uppercase'>
                    {lobby.join_code}
                    <ActionIcon color={copied ? 'teal' : 'gray'} variant="subtle" onClick={copy}>
                      {copied ? <FontAwesomeIcon icon={faCheck} /> : <FontAwesomeIcon icon={faCopy} />}
                    </ActionIcon>
                  </div>
                </Tooltip>
              )}
            </CopyButton>
          </div>
        }
      </div>

      {/* bingo preview */}
      { planningCard &&
      <div className={`flex flex-col h-full ${lobby.game_state === 'waiting' && 'border border-amber-50'} relative`}>
        <div className={`flex flex-row`}>
          {planningCard.first.map((item, index) => (
            <PlanningBingoSquare
              key={index}
              objective={item}
              updatePlanningObjective={(objective) => updatePlanningObjective(objective, 'first', index)}
              />
          ))}
        </div>
        <div className={`flex flex-row`}>
          {planningCard.second.map((item, index) => (
             <PlanningBingoSquare
              key={index}
              objective={item}
              updatePlanningObjective={(objective) => updatePlanningObjective(objective, 'second', index)}
              />
          ))}
        </div>
        <div className={`flex flex-row`}>
          {planningCard.third.map((item, index) => (
            <PlanningBingoSquare
            key={index}
            objective={item}
            updatePlanningObjective={(objective) => updatePlanningObjective(objective, 'third', index)}
            />
          ))}
        </div>
        <div className={`flex flex-row`}>
          {planningCard.fourth.map((item, index) => (
            <PlanningBingoSquare
            key={index}
            objective={item}
            updatePlanningObjective={(objective) => updatePlanningObjective(objective, 'fourth', index)}
            />
          ))}
        </div>
        <div className={`flex flex-row`}>
          {planningCard.fifth.map((item, index) => (
            <PlanningBingoSquare
            key={index}
            objective={item}
            updatePlanningObjective={(objective) => updatePlanningObjective(objective, 'fifth', index)}
            />
          ))}
        </div>
      </div>
      }
    </div>
  );
}