import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { COURSES, courseById } from '../data/courses'
import { DEFAULT_CUSTOM, type CustomRuleset } from '../data/games'
import { emptyEntry, type HoleEntry, type Player } from '../engine/scoring'

export type Screen =
  | 'home'
  | 'setup'
  | 'live'
  | 'summary'
  | 'history'
  | 'builder'
  | 'card'
  | 'leaderboard'

export type RoundSession = {
  id: string
  courseId: string
  teeId: string
  players: Player[]
  officialFormats: Array<'STROKE' | 'STABLEFORD'>
  socialGames: string[]
  customRulesetId?: string
  holesToPlay: number[]
  entries: Record<string, Record<number, HoleEntry>>
  currentHole: number
  currentPlayerId: string
  status: 'setup' | 'live' | 'finalized'
  startedAt: string
  finalizedAt?: string
}

type AppState = {
  screen: Screen
  profileName: string
  customRulesets: CustomRuleset[]
  session: RoundSession | null
  history: RoundSession[]
  setupDraft: Partial<RoundSession> & {
    playerNames: string[]
  }
  setScreen: (s: Screen) => void
  setProfileName: (n: string) => void
  updateSetup: (patch: Partial<AppState['setupDraft']>) => void
  startRound: () => void
  setHole: (n: number) => void
  setPlayer: (id: string) => void
  upsertEntry: (playerId: string, hole: number, patch: Partial<HoleEntry>) => void
  finishRound: () => void
  resumeRound: () => void
  abandonRound: () => void
  saveCustomRuleset: (r: CustomRuleset) => void
  importCustomByCode: (code: string) => CustomRuleset | null
}

const defaultPlayers = ['Miguel', 'Ana', 'Luis', 'Sofía']

function newId() {
  return crypto.randomUUID()
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      screen: 'home',
      profileName: 'Miguel',
      customRulesets: [DEFAULT_CUSTOM],
      session: null,
      history: [],
      setupDraft: {
        courseId: COURSES[0].id,
        teeId: COURSES[0].tees[0].id,
        playerNames: ['Miguel', 'Ana'],
        officialFormats: ['STROKE'],
        socialGames: ['putting_king', 'chaos_golf'],
        holesToPlay: Array.from({ length: 18 }, (_, i) => i + 1),
      },
      setScreen: (screen) => set({ screen }),
      setProfileName: (profileName) => set({ profileName }),
      updateSetup: (patch) => set({ setupDraft: { ...get().setupDraft, ...patch } }),
      startRound: () => {
        const d = get().setupDraft
        const course = courseById(d.courseId || COURSES[0].id)!
        const names = (d.playerNames || defaultPlayers.slice(0, 2)).filter(Boolean).slice(0, 4)
        const players: Player[] = names.map((name, i) => ({
          id: `p${i + 1}`,
          name,
        }))
        const games = [...(d.socialGames || [])]
        const customId = games.find((g) => g.startsWith('custom:'))?.replace('custom:', '')
        const session: RoundSession = {
          id: newId(),
          courseId: course.id,
          teeId: d.teeId || course.tees[0].id,
          players,
          officialFormats: d.officialFormats || ['STROKE'],
          socialGames: games,
          customRulesetId: customId,
          holesToPlay: d.holesToPlay || Array.from({ length: 18 }, (_, i) => i + 1),
          entries: Object.fromEntries(players.map((p) => [p.id, {}])),
          currentHole: (d.holesToPlay || [1])[0],
          currentPlayerId: players[0].id,
          status: 'live',
          startedAt: new Date().toISOString(),
        }
        set({ session, screen: 'live' })
      },
      setHole: (currentHole) =>
        set((s) => (s.session ? { session: { ...s.session, currentHole } } : {})),
      setPlayer: (currentPlayerId) =>
        set((s) => (s.session ? { session: { ...s.session, currentPlayerId } } : {})),
      upsertEntry: (playerId, hole, patch) =>
        set((s) => {
          if (!s.session) return {}
          const prev = s.session.entries[playerId]?.[hole] ?? emptyEntry()
          const next = { ...prev, ...patch }
          return {
            session: {
              ...s.session,
              entries: {
                ...s.session.entries,
                [playerId]: {
                  ...s.session.entries[playerId],
                  [hole]: next,
                },
              },
            },
          }
        }),
      finishRound: () => {
        const session = get().session
        if (!session) return
        const finalized: RoundSession = {
          ...session,
          status: 'finalized',
          finalizedAt: new Date().toISOString(),
        }
        set({
          session: finalized,
          history: [finalized, ...get().history].slice(0, 50),
          screen: 'summary',
        })
      },
      resumeRound: () => {
        const live = get().session
        if (live?.status === 'live') set({ screen: 'live' })
      },
      abandonRound: () => set({ session: null, screen: 'home' }),
      saveCustomRuleset: (r) =>
        set({
          customRulesets: [r, ...get().customRulesets.filter((x) => x.id !== r.id)].slice(0, 20),
        }),
      importCustomByCode: (code) => {
        const found = get().customRulesets.find(
          (r) => r.shareCode.toUpperCase() === code.trim().toUpperCase(),
        )
        return found ?? null
      },
    }),
    {
      name: 'palos-mvp-v1',
      partialize: (s) => ({
        profileName: s.profileName,
        customRulesets: s.customRulesets,
        session: s.session,
        history: s.history,
        setupDraft: s.setupDraft,
      }),
    },
  ),
)
