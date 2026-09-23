export type StatsLevel = 'A' | 'B' | 'C'

export type GameDef = {
  id: string
  name: string
  tagline: string
  requires: StatsLevel
  social: true
}

export const GAME_CATALOG: GameDef[] = [
  { id: 'putting_king', name: 'Putting King', tagline: 'Domina el green', requires: 'B', social: true },
  { id: 'gir_king', name: 'GIR King', tagline: 'Verdes en regulación', requires: 'B', social: true },
  { id: 'chaos_golf', name: 'Chaos Golf', tagline: 'Bonus y caos', requires: 'B', social: true },
  { id: 'birdie_hunt', name: 'Birdie Hunt', tagline: 'Caza birdies', requires: 'A', social: true },
  { id: 'par_machine', name: 'Par Machine', tagline: 'Rachas de par', requires: 'A', social: true },
  { id: 'skins_social', name: 'Skins Social', tagline: 'Hoyos y carries', requires: 'A', social: true },
  { id: 'fairway_feroz', name: 'Fairway Feroz', tagline: 'FIR o castigo', requires: 'B', social: true },
  { id: 'steady_eddie', name: 'Steady Eddie', tagline: 'Consistencia', requires: 'A', social: true },
]

export type CustomRule = {
  when: string
  points: number
}

export type CustomRuleset = {
  id: string
  name: string
  shareCode: string
  requires: StatsLevel
  rules: CustomRule[]
}

export const DEFAULT_CUSTOM: CustomRuleset = {
  id: 'sunday-chaos',
  name: 'Sunday Chaos',
  shareCode: 'CHAOS-7K2',
  requires: 'B',
  rules: [
    { when: 'SCORE_BIRDIE', points: 5 },
    { when: 'SCORE_PAR', points: 2 },
    { when: 'SCORE_BOGEY', points: 0 },
    { when: 'SCORE_DOUBLE', points: -2 },
    { when: 'GIR_TRUE', points: 1 },
    { when: 'FIR_TRUE', points: 1 },
    { when: 'PUTTS_1', points: 2 },
    { when: 'PUTTS_3', points: -2 },
    { when: 'LOST_BALL', points: -5 },
  ],
}

export const EVENT_OPTIONS = [
  { id: 'SCORE_EAGLE_PLUS', label: 'Eagle o mejor' },
  { id: 'SCORE_BIRDIE', label: 'Birdie' },
  { id: 'SCORE_PAR', label: 'Par' },
  { id: 'SCORE_BOGEY', label: 'Bogey' },
  { id: 'SCORE_DOUBLE', label: 'Doble' },
  { id: 'SCORE_TRIPLE_PLUS', label: 'Triple o peor' },
  { id: 'PUTTS_0', label: '0 putts' },
  { id: 'PUTTS_1', label: '1 putt' },
  { id: 'PUTTS_2', label: '2 putts' },
  { id: 'PUTTS_3', label: '3 putts' },
  { id: 'PUTTS_4_PLUS', label: '4+ putts' },
  { id: 'GIR_TRUE', label: 'GIR' },
  { id: 'FIR_TRUE', label: 'FIR' },
  { id: 'LOST_BALL', label: 'Bola perdida' },
]
