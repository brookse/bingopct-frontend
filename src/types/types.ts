export interface Lobby {
  created_at: string;
  updated_at: string;
  id: string;
  card: BingoCard;
  join_code: string;
  game_mode: 'synchronous' | 'asynchronous';
  game_state: 'waiting' | 'playing' | 'finished';
  timer_length: number; // in minutes
  timer_start: string; // ISO date string
  is_timer_running: boolean;
  players: Player[];
}

export interface BingoCard {
  id: string;
  name?: string;
  first: string[];
  second: string[];
  third: string[];
  fourth: string[];
  fifth: string[];
  tiebreaker: string;
}

export interface Player {
  id: string;
  name: string;
  is_ready: boolean;
  player_state: PlayerState;
}

export interface PlayerState {
  timer_started_at?: string; // ISO date string, only for async mode
  total_bingo: number;
  total_objectives: number;
  completion_summary: CompletionSummary;
}

export interface CompletionSummary {
  [key: string]: CompletionSquare;
}

export interface CompletionSquare {
  completed_at?: string | null; // if present, the objective is completed
  notes?: string;
}