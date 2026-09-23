export type CourseHole = {
  number: number
  par: number
  strokeIndex: number
  meters: number
}

export type Course = {
  id: string
  name: string
  club: string
  tees: { id: string; name: string; color: string }[]
  holes: CourseHole[]
}

const parPattern = [4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 3, 4, 5, 4, 4, 3, 4, 5]

function holesFrom(pars: number[], baseMeters: number[]): CourseHole[] {
  return pars.map((par, i) => ({
    number: i + 1,
    par,
    strokeIndex: ((i * 7) % 18) + 1,
    meters: baseMeters[i] ?? (par === 3 ? 160 : par === 5 ? 480 : 370),
  }))
}

const herreriaMeters = [
  365, 380, 155, 490, 350, 400, 170, 375, 510,
  360, 145, 390, 520, 355, 385, 165, 370, 495,
]

export const COURSES: Course[] = [
  {
    id: 'la-herreria',
    name: 'La Herrería',
    club: 'Real Club La Herrería',
    tees: [
      { id: 'blancas', name: 'Blancas', color: '#F5F5F5' },
      { id: 'amarillas', name: 'Amarillas', color: '#E8C547' },
      { id: 'rojas', name: 'Rojas', color: '#C0392B' },
    ],
    holes: holesFrom(parPattern, herreriaMeters),
  },
  {
    id: 'el-saler',
    name: 'El Saler',
    club: 'Parador de El Saler',
    tees: [
      { id: 'blancas', name: 'Blancas', color: '#F5F5F5' },
      { id: 'amarillas', name: 'Amarillas', color: '#E8C547' },
    ],
    holes: holesFrom(parPattern, herreriaMeters.map((m) => m + 8)),
  },
  {
    id: 'valderrama',
    name: 'Valderrama',
    club: 'Real Club Valderrama',
    tees: [
      { id: 'blancas', name: 'Blancas', color: '#F5F5F5' },
      { id: 'amarillas', name: 'Amarillas', color: '#E8C547' },
    ],
    holes: holesFrom(
      [4, 4, 3, 5, 4, 3, 4, 4, 5, 4, 5, 3, 4, 4, 4, 3, 4, 5],
      herreriaMeters.map((m) => m + 15),
    ),
  },
]

export function courseById(id: string) {
  return COURSES.find((c) => c.id === id)
}

export function totalPar(course: Course, holes = course.holes.map((h) => h.number)) {
  return course.holes.filter((h) => holes.includes(h.number)).reduce((s, h) => s + h.par, 0)
}
