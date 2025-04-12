'use client'
import { PlanningObjective } from '@/types/types'
import { faArrowsRotate, faLock, faLockOpen } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button, Select } from '@mantine/core'
import React from 'react'
import colors from 'tailwindcss/colors'

interface BingoSquareProps {
  objective: PlanningObjective
  updatePlanningObjective: (objective: PlanningObjective) => void
}

const PlanningBingoSquare: React.FC<BingoSquareProps> = ({
  objective,
  updatePlanningObjective,
}) => {
  const color = objective.difficulty === 'easy' ? 'bg-green-700' : objective.difficulty === 'medium' ? 'bg-yellow-700' : 'bg-red-700';

  const handleRegenerate = () => {
    // todo regenerate the objective
  }

  const handleManualEdit = () => {
  
  }

  return (
    <div className={`group transition-all w-1/5 h-full flex flex-col justify-between overflow-hidden content-center border border-amber-50 text-amber-50 text-center fatpixel aspect-square ${objective.isLocked ? `${color}/50` : color}`}>
      {/* options row */}
      <div className={`flex flex-row justify-between items-center gap-2 ps-3 pe-1`}>
        <Select
          variant="unstyled"
          size='xs'
          data={['easy', 'medium', 'hard']}
          className={`planning-card-select ${objective.isLocked ? 'opacity-50' : `${color}/50`}`}
          value={objective.difficulty}
          comboboxProps={{ position: 'bottom-start', offset:0 }}
          onChange={(value) => {if (value !== null ) updatePlanningObjective({...objective, difficulty: value as 'easy' | 'medium' | 'hard'})}}
        />
        <Button 
          variant='transparent'
          color={colors.amber[50]}
          size='compact-sm'
          className={`size-xs p-0 opacity-100 hover:cursor-pointer hover:opacity-80`} 
          onClick={() => updatePlanningObjective({...objective, isLocked: !objective.isLocked})}
        >
          {objective.isLocked ? <FontAwesomeIcon icon={faLock} /> : <FontAwesomeIcon icon={faLockOpen} />}
        </Button>
      </div>
    
      {/* text */}
      <div className={`transition-all block gap-2 px-4 leading-none content-center h-full`}>
        {objective.title}
        <Button 
          variant='transparent'
          color={colors.amber[50]}
          size='compact-sm'
          className={`hidden group-hover:block size-xs p-0 opacity-100 hover:cursor-pointer hover:opacity-80 ${objective.isLocked && 'hidden'}`} 
          onClick={() => updatePlanningObjective({...objective, isLocked: !objective.isLocked})}
        >
          <FontAwesomeIcon icon={faArrowsRotate} />
        </Button>
      </div>
    </div>
  )
}

export default PlanningBingoSquare
