export interface TimerSessionDto {
  id:           string;
  userId:       string;
  startTime:    string;
  endTime:      string | null;
  duration:     number; // in seconds
  behaviorType: number; // enum BehaviorCategory
  coinsEarned:  number;
  notes:        string | null;
}

export interface CreateTimerSessionDto {
  startTime:    string;
  endTime:      string;
  duration:     number;
  behaviorType: number;
  coinsEarned:  number;
  notes?:       string | null;
}

export interface UpdateTimerSessionDto {
  behaviorType: number;
  notes?:       string | null;
}

// Local state representation for the live running timer
export interface ActiveTimerState {
  isRunning:    boolean;
  startTime:    string | null;
  elapsedSecs:  number;
  behaviorType: number;
}
