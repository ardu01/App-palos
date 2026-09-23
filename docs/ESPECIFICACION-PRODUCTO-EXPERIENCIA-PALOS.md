# PALOS — Especificación consolidada de Producto y Experiencia

**Documento único · Equipo de diseño de producto (5 especialistas)**  
**Producto:** PALOS  
**Plataforma primaria:** iPhone (iOS)  
**Idioma de producto (UI):** español (ES) · preparación i18n EN  
**Versión del documento:** 1.0 · listo para prototipo  

---

## Cómo leer este documento

Este no es un brainstorm. Es el contrato de producto que el equipo de prototipo debe implementar.

Decisiones ya tomadas por el equipo conjunto (Game Design · UX/UI · Data · Social · Perfil). Las incompatibilidades se resolvieron en la sección *Decisiones de integración cruzada* y se reflejan en el resto del texto.

**Principio no negociable:** una vuelta = **una única fuente de datos de hoyo**. Modalidades oficiales, social games, challenges y leaderboards son *interpretaciones* de esa fuente. Nunca se reintroduce la misma información.

**Disclaimer legal de producto (visible en UI donde proceda):** los Social Games / Challenges **no son golf oficial**, no afectan Handicap Index oficial y no sustituyen las Reglas de Golf / World Handicap System.

---

# 0. Decisiones de integración cruzada (revisión de los 5)

Antes de las 23 secciones, estas son las resoluciones explícitas entre especialistas:

| Conflicto | Resolución |
|---|---|
| Minijuegos piden FIR/GIR/putts, pero UX no puede saturar | Captura en **3 capas**: (A) score obligatorio, (B) stats rápidas opcionales en 1 toque, (C) detalle expandible. Los games que requieren B se marcan `requiresStats: true` y avisan al activarlos. |
| Stats inventadas sin datos | Solo se calculan métricas con inputs disponibles. Si falta GIR, Scrambling = `null` (no 0%). UI muestra “—” y CTA “activa stats”. |
| Multijugador + challenges | Challenges se abrochan a la misma `RoundSession`. Cada challenge tiene `scoringEngineId` y lee el mismo `HoleEntry`. |
| Custom Builder vs reglas imposibles | Validador de reglas (AST) con whitelist de eventos, rangos, exclusiones y detección de contradicciones. |
| Pantalla de hoyo saturada | Máximo **1 row de score**, **1 row de stats opcionales**, **1 strip de contexto** (par/hoyo/leader). Challengers activos viven en sheet, no en la superficie principal. |
| Historial incompleto | Cada `Round` guarda snapshot inmutable de tarjeta + resultados de cada `CompetitionInstance` + engine version. |
| Achievements vs golf oficial | Prefijo de copy: “En PALOS…”. Nunca “récord oficial”. Handicap Index es campo de usuario / importación; no se calcula WHS en MVP. |
| Un móvil vs muchos | Dos modos de sesión: `HOST_ONLY` y `MULTI_DEVICE`. Ambos escriben el mismo modelo. |
| Offline | Queue local de `HoleEntry` con vector clock ligero; resolución Last-Writer-Wins por campo + confirmación del host en conflictos de score. |

---

# 1. Visión de producto

## 1.1 Problema

Las apps de golf actuales son excelentes tarjetas digitales… y mediocres compañeros de vuelta. El golfista las abre para anotar y las cierra al salir del 18. La rivalidad, el humor del grupo, la memoria de “aquel domingo en el 12” y la evolución personal viven fuera de la app: en el chat, en la cabeza, o se pierden.

## 1.2 Promesa

**PALOS es la capa social y de memoria deportiva encima de tu tarjeta.**

- **Antes:** ver rivalidades abiertas, challenges activos, “última vez en este campo”, setup de partida en <60 s.  
- **Durante:** anotar en segundos con una mano; varias competiciones corren solas.  
- **Después:** resumen con ganadores de cada capa, evolución, rivalidad actualizada, ganas de la siguiente.

## 1.3 Posicionamiento

| No somos | Sí somos |
|---|---|
| Red social de feed infinito | Rivalidad entre amigos reales |
| Gamificación de rachas diarias molestas | Memoria deportiva + juegos de grupo |
| Sustituto del hándicap oficial | Interprete social de la misma tarjeta |
| Tracker de tiro GPS-first (MVP) | Score + stats útiles + social games |

## 1.4 Nombre y tono de marca

- **Nombre:** PALOS  
- **Tono:** sobrio, deportivo, adulto, irónico cuando toca (nunca infantil).  
- **Voz UI:** corta, clara, sin jerga de startup.  
- **Social games:** siempre etiquetados como *Social Game* / *Challenge*, nunca como “formato oficial”.

## 1.5 Multiplicador de valor de una vuelta

```
Round (fuente única)
 ├── OfficialFormats[]     // Stroke, Stableford, Match, Fourball…
 ├── SocialGames[]         // Putting King, Chaos Golf…
 ├── Challenges[]          // bounties, rachas, objetivos
 └── DerivedStats         // GIR%, putts, scrambling…
```

Miguel introduce **una vez** por hoyo. Todo lo demás se deriva.

---

# 2. Principios UX

## 2.1 Contexto de uso (constraints de diseño)

Durante la vuelta: sol, una mano, guante, prisa, cobertura irregular, batería limitada.

Por tanto:

1. **3 segundos máximo** para registrar score básico.  
2. Targets ≥ 44×44 pt; zonas críticas ≥ 56 pt.  
3. Alto contraste; modo sol (light high-contrast) por defecto en campo.  
4. Acciones principales con el pulgar (zona inferior).  
5. Cero dependencia de red para anotar.  
6. Háptica sutil en confirmaciones; nunca spam.  
7. Una decisión primaria por pantalla.

## 2.2 Principios de producto

1. **Una fuente de verdad** — no doble entrada.  
2. **Progresivo, no obligatorio** — stats opcionales; valor también con solo score.  
3. **Social sin feed** — no timeline infinito, no likes.  
4. **Premium sobrio** — menos botones, más jerarquía.  
5. **Honestidad estadística** — no inventar precisión.  
6. **Retención por memoria** — historial, rivalidades, récords; no daily streak punitivo.  
7. **Mobile-first iPhone** — diseñar para 6.1–6.7"; adaptar tablet después.

## 2.3 Design system — PALOS Visual Language

### Color (CSS variables conceptuales)

```
--fairway-ink:        #0E1A14;   /* texto principal light */
--fairway-deep:       #143D2E;   /* verde bosque marca */
--fairway-mid:        #2F6B4F;
--fairway-soft:       #E7F0EA;
--sand:               #C6A96B;   /* acento metálico soberbio, no dorado chillón */
--clay:               #8B5E3C;
--fog:                #F3F5F2;   /* fondo light */
--mist:               #D7DDD8;
--night:              #0B1210;   /* fondo dark */
--night-elev:         #15201C;
--danger:             #B42318;
--success:            #1F7A4C;
--warning:            #B7791F;
```

**Dirección visual:** verde bosque + tinta + arena. **Prohibido** púrpura genérico, crema terracotta AI-default, glow neon, pills saturadas.

Fondo: textura sutil de papel/linen al 3–5% opacidad + gradiente vertical `fog → soft`. En dark: `night` con elevación `night-elev`.

### Tipografía

- **Display / marca:** *Fraunces* (serif expresiva, optical size) — logo, scores grandes, títulos de sección.  
- **UI / cuerpo:** *Söhne* o *Instrument Sans* (sans geométrica contemporánea). Fallback sistema: SF Pro solo si licencia no disponible en prototipo; documentar swap.  
- Escala: 12 / 14 / 16 / 20 / 28 / 40 / 56. Score del hoyo en **56–64**.  
- Tracking ligeramente negativo en display (−1%).

### Espaciado y layout

- Base 4 pt. Escala: 4, 8, 12, 16, 24, 32, 48.  
- Márgenes laterales 20 pt.  
- Separación de secciones 32–48.  
- **No cards en hero.** Cards solo cuando contienen interacción (selector de jugador, challenge chip editable).  
- Radio: 8 (controles) / 12 (sheets) / 0 en elementos tipográficos de marca.

### Iconografía

- Línea 1.5 pt, esquinas afiladas suaves, estilo “instrumentación deportiva”.  
- Set propio: tee, flag, putter arc, fairway wedge, birdie chevron.  
- No emojis en UI primaria.

### Modo claro / oscuro / sol

| Modo | Uso |
|---|---|
| Light (default campo) | Contraste alto, fondos claros, tinta oscura |
| Dark | Casa / noche / batería |
| Sun Boost | Light + +20% contraste + botones rellenos negros |

Auto-sugerir Sun Boost si brillo > umbral (V1); toggle manual en MVP.

### Componentes core

| Componente | Uso |
|---|---|
| `ScorePad` | Teclado numérico 1–12 + +/− grande |
| `StatToggle` | FIR / GIR / Putts / Penalty en fila |
| `PlayerPill` | Avatar + nombre corto + delta |
| `GameChip` | Social game activo (solo lectura en hoyo) |
| `LeaderStrip` | Mini ranking horizontal |
| `HoleHeader` | Nº hoyo · Par · Hcp · Distancia |
| `PrimaryCTA` | Un botón dominante inferior |
| `Sheet` | Detalle challenges / stats / edición |
| `EmptyState` | Honestidad (“sin datos de GIR aún”) |
| `ConflictBanner` | Sincronización / edición |

### Microinteracciones (mínimo 2–3 intencionales)

1. **Score commit:** número escala 1.0→1.08→1.0 + haptic light.  
2. **Cambio de hoyo:** slide horizontal con flag que “cae”.  
3. **Victoria de challenge:** confeti contenido 600 ms (solo al cerrar vuelta, no en cada hoyo).  
4. **Rivalidad abre/cierra:** delta ±1 animado en color success/danger.

### Feedback háptico

| Evento | Haptic |
|---|---|
| Score guardado | Impact Light |
| Birdie o mejor | Notification Success |
| Error / conflicto | Notification Error |
| Challenge ganado (fin) | Impact Medium |

### Accesibilidad

- Dynamic Type hasta XXXL en score y CTAs.  
- VoiceOver labels en ScorePad (“cuatro golpes”).  
- Contraste WCAG AA mínimo; Sun Boost AAA en texto crítico.  
- Reduce Motion: desactivar confeti y slides.  
- No información solo por color (birdie = chevron + color).

### Anti-patrones (explícitos)

- No dashboard en home.  
- No hero con badges flotantes.  
- No más de un CTA primario.  
- No gamificación de “vuelve mañana o pierdes racha”.  
- No copy de “¡Increíble crack!”.

---

# 3. Mapa completo de pantallas

## 3.1 Árbol de navegación

```
Tab bar (4):
├── Home
├── Play (nueva / reanudar)
├── Social (amigos, ligas, challenges)
└── Profile (historial, stats, settings)

Modales / stacks:
├── Onboarding
├── RoundSetup
│   ├── SelectCourse
│   ├── SelectTee
│   ├── AddPlayers
│   ├── ChooseFormats
│   └── ChooseSocialGames / Challenges
├── LiveRound
│   ├── HoleScreen
│   ├── ScoreEntry (inline)
│   ├── OptionalStats
│   ├── CardSheet
│   ├── LeaderboardSheet
│   ├── HoleSwitcher
│   └── LiveChallengesSheet
├── RoundSummary
├── History / RoundDetail
├── StatsHub
├── Friends / Invite
├── LeagueDetail / TournamentDetail
├── ChallengeDetail / CreateChallenge
├── CustomGameBuilder
├── GameLibrary
└── Settings / Privacy
```

## 3.2 Inventario de pantallas (ID estables)

| ID | Pantalla | Fase |
|---|---|---|
| ONB-01 | Bienvenida marca | MVP |
| ONB-02 | Nombre + foto | MVP |
| ONB-03 | Handicap Index (opcional) | MVP |
| ONB-04 | Permisos (notificaciones opcionales) | MVP |
| ONB-05 | Primer valor (“tu próxima vuelta”) | MVP |
| HOME-01 | Home composición única | MVP |
| PLAY-01 | Nueva partida / Reanudar | MVP |
| PLAY-02 | Buscar / seleccionar campo | MVP |
| PLAY-03 | Seleccionar tee | MVP |
| PLAY-04 | Añadir jugadores | MVP |
| PLAY-05 | Modalidad oficial | MVP |
| PLAY-06 | Social Games + Challenges | MVP |
| LIVE-01 | Pantalla de hoyo | MVP |
| LIVE-02 | Introducir score | MVP |
| LIVE-03 | Stats opcionales | MVP |
| LIVE-04 | Tarjeta | MVP |
| LIVE-05 | Leaderboard multi-capa | MVP |
| LIVE-06 | Cambio de hoyo | MVP |
| LIVE-07 | Challenges en vivo | MVP |
| END-01 | Final de vuelta | MVP |
| END-02 | Resumen / podios | MVP |
| HIST-01 | Historial filtrable | MVP |
| HIST-02 | Detalle de vuelta | MVP |
| PROF-01 | Perfil | MVP |
| PROF-02 | Preferencias / privacidad | MVP |
| SOC-01 | Amigos | MVP |
| SOC-02 | Invitación / código | MVP |
| STAT-01 | Estadísticas overview | MVP |
| STAT-02 | Por campo / hoyo | V1 |
| GAME-01 | Custom Game Builder | MVP (builder básico) |
| GAME-02 | Biblioteca de juegos | V1 |
| LIG-01 | Ligas privadas | V1 |
| LIG-02 | Temporadas / torneos | V1 |
| H2H-01 | Head-to-head | V1 |
| SHOT-01 | Shot tracking | FUTURO |

---

# 4. Flujo de una vuelta

## 4.1 Happy path (host)

```
Home → Play → SelectCourse → SelectTee → AddPlayers
  → ChooseFormats (Stroke + opcional Stableford/Match)
  → ChooseSocialGames (0–N) + Challenges (0–N)
  → Confirm → LIVE Hole 1
  → [loop] Score (+stats opcionales) → Next hole
  → Hole 18 confirm → END Summary → Save → Home/History
```

## 4.2 Variantes

| Variante | Comportamiento |
|---|---|
| Reanudar | Si hay `RoundSession` activa → banner en Home + Play |
| Guest en un móvil | Host añade nombres locales `GuestPlayer` |
| Multi-device | Host crea código de sala; peers se unen; cada uno anota su score |
| 9 hoyos | `holesToPlay: front|back|custom` |
| Offline mid-round | Sigue anotando; sync al recuperar red |
| Abandonar | Estado `abandoned`; se guarda parcial con flag |

## 4.3 Principio “una entrada”

En Hole N, Miguel introduce:

```json
{
  "playerId": "miguel",
  "holeNumber": 7,
  "strokes": 4,
  "putts": 2,
  "fir": true,
  "gir": true,
  "penalties": 0,
  "sandShots": 0,
  "upDownAttempt": null,
  "notes": null
}
```

El motor ejecuta en orden:

1. Validar entrada.  
2. Actualizar `Scorecard`.  
3. Recalcular formatos oficiales.  
4. Recalcular cada Social Game.  
5. Actualizar Challenges / rachas / bounties.  
6. Emitir eventos de UI (deltas leaderboard).

---

# 5. Diseño de pantalla de juego (LIVE-01)

## 5.1 Layout (primera composición durante el hoyo)

```
┌─────────────────────────────┐
│  H7  PAR 4  ·  Hcp 8   [☰]  │  HoleHeader
│  La Herrería · Blancas      │
├─────────────────────────────┤
│  MIGUEL          vs PAR  −1 │  Player context (swipe players)
│                             │
│           4                 │  Score grande (Fraunces 64)
│        golpes               │
│                             │
│  [ − ]     [ ScorePad ] [+] │  o teclado dedicado
├─────────────────────────────┤
│  FIR  GIR  PUTTS  PEN       │  StatToggle row (opcional)
│  ●    ●     2      0        │
├─────────────────────────────┤
│  Putting King  Miguel +4    │  LeaderStrip (1 línea)
├─────────────────────────────┤
│  [ Tarjeta ] [ Retos ] [ → ]│  Thumb bar
└─────────────────────────────┘
```

## 5.2 Interacciones

| Acción | Resultado |
|---|---|
| Tap número / ScorePad | Actualiza `strokes`; auto-save debounce 300 ms |
| Toggle FIR | Solo habilitado en Par 4/5; Par 3 = N/A |
| Putts stepper 0–5 | Si putts > strokes → error inline |
| Swipe horizontal | Cambia de jugador (HOST_ONLY) o hoyo (pref. user) |
| Tap → | Siguiente hoyo (si score presente) o “¿dejar en blanco?” |
| Retos | Sheet LIVE-07 sin salir del hoyo |
| Long-press score | Menú editar / limpiar |

## 5.3 Datos

- **Consume:** `CourseHole`, `RoundSession`, `Player[]`, `CompetitionInstance[]`, `HoleEntry?`.  
- **Genera:** `HoleEntry` upsert.  
- **Después:** invalidación de rankings derivados; sync queue.

## 5.4 Estados

`empty` · `partial` (solo strokes) · `complete` (strokes + required stats for active games) · `locked` (confirmado por peer) · `conflict`.

Si un Social Game activo requiere putts y faltan → chip ámbar “Faltan putts para Putting King”.

---

# 6. Sistema de estadísticas

## 6.1 Capas de datos

| Capa | Inputs | Stats derivadas |
|---|---|---|
| A — Score | strokes, par | score, vs par, birdies, pars, bogeys, dobles+, eagles, front/back, par3/4/5 avg |
| B — Quick stats | putts, fir, gir, penalties | putts/ronda, 1P/3P, FIR%, GIR%, putts/GIR, penalty count |
| C — Short game | sand flagged, up-down | sand saves, scrambling, up & downs |
| D — Futuro | shots GPS, club | dispersion, SG, club stats |

**Regla:** si el input no existe, la métrica es `null`, no `0`.

## 6.2 Definiciones canónicas (motor)

```
GIR: strokes_before_green <= par - 2  AND ball_on_putting_surface
     (MVP: usuario marca GIR booleano; no se infiere solo de score)

FIR: tee shot on fairway; solo Par 4 y Par 5. Par 3 = N/A.

Putts: solo putts desde green. Chip-in = 0 putts.

Scrambling: (missed GIR AND score <= par) / missed GIR
            Requiere GIR conocido.

Sand Save (PGA-like): greenside bunker AND holed in ≤2 strokes desde bunker.
            MVP simplificado: flag `fromGreensideBunker` + (putts + chipsAfterBunker)<=2
            Si no hay flag → métrica null.

Putts/GIR: sum(putts where gir) / count(gir)

Up & Down: missed GIR AND (strokes - putts == 1) AND score <= par
            (aproximación amateur; documentada como tal)
```

## 6.3 Ventanas temporales

`last5` · `last10` · `last20` · `season` (año civil o temporada de liga) · `year` · `allTime`.

Filtros: campo, tee, 9/18, jugadores presentes, formato.

## 6.4 Por campo / tee / hoyo

Ejemplo copy:

> Has jugado el hoyo 12 de La Herrería **23** veces. Media **4,61** (par 4). GIR **39%** · Putts medios **2,1**.

## 6.5 Arquitectura futura (sin fake precision)

```
HoleEntry
  └── Shot[] (futuro)
        holeId, shotIndex, clubId?, startLie, endLie,
        startCoord?, endCoord?, distanceM?, shape?
StrokesGainedService (futuro)
  requires: baseline tables + shot data
  until then: feature flagged OFF
```

## 6.6 Pantallas stats

- **STAT-01 MVP:** scoring average, vs par, best round, breakdown birdie→doble, putts si hay datos, GIR/FIR si hay datos, sparkline evolución.  
- **STAT-02 V1:** drill-down campo/hoyo, comparación con amigos (opt-in).

---

# 7. Sistema social

## 7.1 Filosofía

Social = **personas con las que ya juegas**, no descubrimiento masivo. Sin feed. Sin stories. Notificaciones solo de: invitación a partida, challenge recibido, fin de liga, rivalidad notable (máx. 1/día digest opcional).

## 7.2 Entidades

- `User`  
- `Friendship` (accepted)  
- `Group` (opcional, ej. “Sabados Club”)  
- `RoundSession`  
- `CompetitionInstance`  
- `League` / `Season` / `Tournament` (V1)  
- `Challenge`  
- `InviteCode`

## 7.3 Amigos e invitaciones

- Buscar por usuario PALOS / teléfono (hash) / código.  
- Invite link + código de 6 caracteres.  
- Estados: pending / accepted / blocked.

## 7.4 Partidas

Ver §14 Multijugador.

## 7.5 Lo que genera retorno

Rivalidades abiertas, ligas semanales, challenges mensuales, “te debe una desde el 14”, historial compartido. **No** clout público.

---

# 8. Perfil

## 8.1 Campos (PROF-01)

| Campo | Obligatorio | Notas |
|---|---|---|
| displayName | sí | |
| photoURL | no | |
| handicapIndex | no | manual o import futuro; **no WHS calc MVP** |
| homeClub | no | texto / courseId |
| favoriteCourses[] | no | |
| defaultTee | no | por sexo/edad preferencia usuario |
| friends | — | link SOC-01 |
| privacy | sí | ver §8.2 |
| preferredStatsLevel | A/B/C | default B |

## 8.2 Privacidad

| Ajuste | Default |
|---|---|
| Perfil visible para amigos | sí |
| Stats detalladas a amigos | sí |
| Aparecer en leaderboards de liga | sí |
| Descubrible por teléfono | no |
| Compartir vueltas automáticamente | solo participantes |

## 8.3 Identidad deportiva

El perfil es una **ficha de jugador**, no un muro. Primer viewport: nombre + foto + HI + club + 3 récords clave + CTA “Historial”.

---

# 9. Historial

## 9.1 Qué se conserva (inmutable tras `finalized`)

- Fecha, campo, tee, 9/18, jugadores, modalidades, social games, challenges.  
- Score total, vs par, Stableford pts si aplica, hándicap de juego usado (si se introdujo).  
- Tarjeta completa `HoleEntry[]`.  
- Stats derivadas snapshot.  
- Resultados por `CompetitionInstance` (podio, puntos).  
- `engineVersion` + `rulesetHash` (para custom games).

## 9.2 Filtros (HIST-01)

- Campo (ej. La Herrería)  
- Jugador presente  
- Últimas N / año / temporada  
- Formato (Stableford, Match, Stroke)  
- Social Game  
- Mejores vueltas (ordenar por score vs par)  
- Completas vs abandonadas

## 9.3 Detalle (HIST-02)

Tabs: Tarjeta · Resultados · Stats · Challenges. Share card estática (imagen) opcional V1.

---

# 10. Progresión

## 10.1 Qué sí

- **Récords personales** (ver lista).  
- **Achievements de app** claramente etiquetados.  
- **Rivalidad score** entre pares (wins en social games / head-to-head).  
- **Progresión de liga** (V1).

## 10.2 Qué no

- Daily login streak.  
- XP genérico que no se entiende.  
- Pay-to-win.  
- Confundir con premios federativos.

## 10.3 Récords personales

| ID | Récord |
|---|---|
| PR_BEST_SCORE | Mejor score (18) |
| PR_BEST_VS_PAR | Mejor vs par |
| PR_MOST_BIRDIES | Más birdies en una vuelta |
| PR_FEWEST_PUTTS | Menos putts (si stats B) |
| PR_MOST_GIR | Más GIR |
| PR_PAR_STREAK | Mayor racha de pares o mejor |
| PR_BEST_COURSE_* | Mejor resultado por campo |
| PR_SAND_SAVE | Mejor % sand save (mín. 10 intentos) |

Al batir récord: toast + haptic al **cerrar** la vuelta, no en el hoyo.

## 10.4 Achievements (ejemplos, no oficiales)

| ID | Nombre | Criterio |
|---|---|---|
| ACH_FIRST_ROUND | Primera tarjeta | 1 vuelta finalizada |
| ACH_PUTTING_KING_3 | Corona de green | 3 wins Putting King |
| ACH_NO_3PUTT | Manos firmes | 0 tres-putts en 18 (con putts logged) |
| ACH_CHAOS_SURVIVOR | Chaos survivor | Completar Chaos Golf |
| ACH_RIVAL_10 | Rivalidad 10 | 10 partidas con el mismo amigo |
| ACH_COURSE_5 | Local | 5 vueltas en el mismo campo |

Copy siempre: “Logro en PALOS”.

---

# 11. +12. Social Games — catálogo (32 modalidades) y reglas exactas

Convenciones:

- Todos son **Social Games** (no oficiales).  
- Puntuación por defecto: **mayor gana**, salvo que se indique.  
- Empate: desempate §11.0.  
- `requires`: nivel de stats mínimo A/B/C.  
- Reutilizan `HoleEntry`; cero doble entrada.

### 11.0 Desempates globales (orden)

1. Más hoyos ganados head-to-head en ese game.  
2. Mejor score total stroke.  
3. Mejor back 9 en puntos del game.  
4. Sorteo determinista `hash(roundId+gameId)`.

### 11.1 Metadatos comunes

```ts
type SocialGameDef = {
  id: string;
  name: string;
  tagline: string;
  requires: 'A' | 'B' | 'C';
  modes: Array<'1v1'|'ffa'|'pairs'|'teams'|'per_hole'|'cumulative'|'streak'|'bounty'|'secret'|'risk'>;
  scoring: 'points' | 'holes_won' | 'currency' | 'streak';
  higherIsBetter: boolean;
};
```

---

## Catálogo

### 1. PUTTING KING
**requires B · modes:** ffa, 1v1, pairs, cumulative  
**Reglas por hoyo:**

| Putts | Pts |
|---|---|
| 1 | +2 |
| 2 | 0 |
| 3 | −2 |
| ≥4 | −4 |
| 0 (chip-in) | +3 |

Gana mayor suma. Parejas: suma de ambos / 2 (media) o suma (elección al crear; default suma).

### 2. GIR KING
**requires B · ffa, teams, cumulative**  
- GIR: +2  
- GIR + birdie o mejor: +2 bonus (total +4)  
- Miss GIR: 0  
Gana mayor suma.

### 3. CHAOS GOLF
**requires B · ffa, risk**  
- Eagle+: +8 · Birdie +5 · Par +2 · Bogey 0 · Doble −2 · Triple+ −4  
- 1-putt +2 · 3-putt −2 · ≥4 putts −4  
- Bola perdida / penalty stroke: −3 por penalty  
- FIR +1 · GIR +1  
Gana mayor suma.

### 4. FAIRWAY FEROZ
**requires B · ffa**  
Solo hoyos Par 4/5: FIR +3; miss −1. Par 3: no puntúan (o +1 si GIR — variante “includePar3”; default exclude).

### 5. BIRDIE HUNT
**requires A · ffa, bounty**  
Birdie +3 · Eagle +6 · Albatros +10. Primer birdie del grupo en un hoyo: **bounty +2 extra** a quien lo haga (si empate de score birdie, ambos cobran).

### 6. PAR MACHINE
**requires A · streak, cumulative**  
- Par o mejor: +1 y continúa racha  
- Sobre par: 0 y rompe racha  
- Bonus racha: 3 seguidos +2 · 5 +4 · 9 +8 (una vez al alcanzar)

### 7. NO BOGEY CLUB
**requires A · ffa**  
Hoyos sin bogey+ : +2. Bogey: 0. Doble+: −2. Gana quien termine con más puntos; logro implícito si 0 bogeys.

### 8. UP & DOWN DUEL
**requires C · 1v1, per_hole**  
Solo hoyos con miss GIR. Up&Down éxito: gana el hoyo. Si ambos o ninguno: empate. Match play de short game.

### 9. SAND SAVIOR
**requires C · bounty, ffa**  
Cada sand save: +5. Fallo sand (bunker greenside sin save): −1. Sin bunkers en vuelta: juego anulado → “no aplica”.

### 10. FRONT NINE FRENZY
**requires A · cumulative**  
Chaos scoring reducido solo hoyos 1–9: Birdie +4 · Par +1 · Bogey −1 · Doble −3. Back 9 no cuenta.

### 11. BACK NINE BANDITS
**requires A** — espejo del 10 en hoyos 10–18.

### 12. LAST THREE THUNDER
**requires A · risk**  
Solo hoyos 16–18. Multiplicador ×2 sobre tabla Chaos básica (birdie/par/bogey…). Ideal para remontadas.

### 13. LAST SIX SPRINT
**requires A** — hoyos 13–18, puntos Stroke Play inverso: menor score gana; se muestra como “puntos = (par+2 − strokes) clamped”.

### 14. MATCH BITS (hoyos ganados social)
**requires A · 1v1, pairs**  
Como match play por hoyo pero **solo social**: birdie fuerza presión. No usa hándicap salvo toggle `usePlayingHandicap` (V1).

### 15. SKINS SOCIAL
**requires A · ffa, bounty**  
Hoyo lo gana el mejor score neto social (stroke). Empate → skin se acumula (`carry`). Valor base 1 skin; carry suma.

### 16. WOLF PACK (simplificado social)
**requires A · teams rotativos**  
En cada hoyo un “Wolf” elige compañero después de ver drives (MVP: elige **antes** del hoyo por simplicidad de UX). Pareja wolf vs resto. Hoyo ganado = + punto al equipo. Rotación wolf = orden de jugadores.

### 17. SIXES
**requires A · pairs**  
6 hoyos team match × 3 segmentos (1–6, 7–12, 13–18). Cada segmento independiente. Total segmentos ganados.

### 18. SCRAMBLE SCORE (no scramble de bolas)
**requires B · ffa**  
Puntos solo cuando miss GIR: si score ≤ par → +3; si bogey → +1; si peor → −1. Premia recuperar.

### 19. PENALTY POLICE
**requires B · ffa, higherIsBetter:false**  
Menos penalties gana. Empate → menos dobles+.

### 20. LOST BALL LOTTERY
**requires B · risk**  
Empezar con 10 pts. Cada bola perdida (penalty tipo lost/OB contado): −4. Cada hoyo sin penalty: +1. Riesgo/recompensa.

### 21. EAGLE EYE
**requires A · bounty**  
Eagle +15. Birdie en Par 5 +3. Sin eagle: 0 base. Bounty de grupo: primer eagle de la temporada del grupo +10 (challenge link).

### 22. STEADY EDDIE
**requires A · ffa**  
| Resultado | Pts |
|---|---|
| Par | +3 |
| Birdie | +1 |
| Bogey | +1 |
| Else | −2 |  
Premia consistencia cerca del par.

### 23. PUTT STREAK
**requires B · streak**  
Racha de hoyos con ≤2 putts. Se rompe con 3+. Puntos = longitud máxima de racha × 2 + suma de 1-putts (+1 cada uno).

### 24. GIR STREAK
**requires B · streak**  
Racha de GIR consecutivos. Pts = max streak × 3.

### 25. PAR 3 SHOOTOUT
**requires A · ffa**  
Solo Par 3: Eagle +5 · Birdie +3 · Par +1 · Bogey −1 · Doble −3. Otros hoyos ignorados.

### 26. PAR 5 PINATA
**requires A** — solo Par 5: Eagle +6 · Birdie +3 · Par 0 · Bogey −2 · worse −4. Bonus FIR+GIR +2.

### 27. DOUBLES DESTROYER
**requires A · higherIsBetter:false**  
Cuenta dobles+. Menos gana. Variante risk: cada doble da +1 al resto de jugadores (“impuesto”).

### 28. SECRET CARD (objetivos secretos)
**requires B · secret**  
Al inicio, cada jugador recibe 3 objetivos ocultos aleatorios de un pool (ej. “1-putt en par 3”, “GIR en hoyo hcp 1”, “birdie back 9”). Cumplir: +5 cada uno. Revelación al final. Host ve seeds; clientes solo su carta.

### 29. RISK TEE (riesgo/recompensa)
**requires B · risk, per_hole**  
Antes del hoyo (o en tee): el jugador puede “ir a por birdie”.  
- Si birdie+: +4  
- Si par: 0  
- Si bogey+: −3  
Sin riesgo: scoring Chaos reducido 50%. UX: toggle “Arriesgo” en HoleHeader.

### 30. TEAM TOTAL CHAOS
**requires B · teams**  
Chaos Golf sumado por equipo (2v2).

### 31. HAMMER (bounty entre hoyos)
**requires A · bounty, 1v1**  
Un jugador puede “tirar el hammer” en un hoyo: el hoyo vale doble en Match Bits. 1 hammer por jugador cada 9 hoyos. Si empate, hammer se pierde (no carry).

### 32. CUSTOM (usuario)
Cualquier ruleset del Custom Game Builder (§13). `id: custom:<rulesetId>`.

---

## Matriz de modos vs juegos (resumen operativo)

Todos los del catálogo 1–31 soportan **ffa** salvo Wolf/Sixes/Team (equipos) y los marcados 1v1. El setup PLAY-06 permite filtrar por modo de partida.

## Validación UX ↔ Games

| Stats level activo en setup | Games disponibles |
|---|---|
| A only | 5,6,7,10–16,21,22,25–27,29(parcial),31 |
| B | todos salvo 8,9 (y U&D/Sand) |
| C | todos |

Si el usuario elige Putting King con level A → prompt: “Activar putts en esta vuelta” → sube a B.

---

# 13. Custom Game Builder

## 13.1 Por qué es diferencial

Permite que cada grupo ritualice sus reglas (“Sunday Chaos”) y las reutilice con un código. La comunidad puede publicar en biblioteca (V1).

## 13.2 Modelo mental

```
SI <evento> [Y <condiciones>] ENTONCES <efecto>
```

## 13.3 Eventos whitelist (MVP)

```
SCORE_EAGLE_PLUS, SCORE_BIRDIE, SCORE_PAR, SCORE_BOGEY,
SCORE_DOUBLE, SCORE_TRIPLE_PLUS,
PUTTS_0, PUTTS_1, PUTTS_2, PUTTS_3, PUTTS_4_PLUS,
GIR_TRUE, GIR_FALSE, FIR_TRUE, FIR_FALSE, FIR_NA,
PENALTY_COUNT, LOST_BALL,
HOLE_PAR_3, HOLE_PAR_4, HOLE_PAR_5,
HOLE_IN: {front9|back9|last3|last6|numbers[]},
STREAK_OF: {event, length},
PICKED_RISK (Risk Tee style)
```

## 13.4 Efectos whitelist

```
ADD_POINTS: n        // −50..+50
MULTIPLY_HOLE: x     // 1.5 | 2 | 3 (sobre puntos del hoyo)
BREAK_STREAK
ADD_STREAK_POINTS: n
GRANT_BOUNTY: n
TEAM_TRANSFER: n     // impuesto a rivales
```

## 13.5 Ejemplo “Sunday Chaos”

```json
{
  "name": "Sunday Chaos",
  "version": 1,
  "higherIsBetter": true,
  "requires": "B",
  "rules": [
    {"when":["SCORE_BIRDIE"],"then":{"ADD_POINTS":5}},
    {"when":["SCORE_PAR"],"then":{"ADD_POINTS":2}},
    {"when":["SCORE_BOGEY"],"then":{"ADD_POINTS":0}},
    {"when":["SCORE_DOUBLE"],"then":{"ADD_POINTS":-2}},
    {"when":["GIR_TRUE"],"then":{"ADD_POINTS":1}},
    {"when":["FIR_TRUE"],"then":{"ADD_POINTS":1}},
    {"when":["PUTTS_1"],"then":{"ADD_POINTS":2}},
    {"when":["PUTTS_3"],"then":{"ADD_POINTS":-2}},
    {"when":["LOST_BALL"],"then":{"ADD_POINTS":-5}}
  ],
  "tieBreak": "global_default",
  "teams": "none"
}
```

## 13.6 Builder UX (GAME-01)

1. Nombre + icono color.  
2. Lista de reglas (añadir fila SI/ENTONCES).  
3. Toggles: equipos, hoyos especiales, multiplicadores, rachas.  
4. Simulador: “Si haces birdie con 1-putt y GIR → +N”.  
5. Guardar → genera `shareCode` (ej. `CHAOS-7K2`).  
6. Amigos: Introduce código → preview reglas → Añadir a biblioteca personal.

## 13.7 Validador (anti-imposible / contradictorio)

Rechazar o warn:

| Código | Condición |
|---|---|
| E_EMPTY | 0 reglas |
| E_REQUIRES_GAP | Evento B/C pero `requires` A |
| E_CONTRA_PUTTS | PUTTS_1 y PUTTS_2 ambos con efectos que dependen de mutuamente excluyente mal formado (OK tener ambos; error si misma regla exige PUTTS_1 Y PUTTS_2) |
| E_RANGE | puntos fuera de −50..50 |
| E_MULT | más de un multiplicador no combinable en mismo hoyo sin orden |
| E_DEAD | todas las reglas con ADD_POINTS 0 |
| W_ALWAYS | regla sin evento (warn) |
| E_HOLE_EMPTY | filtro de hoyos vacío |
| E_TEAM | team effects sin teams habilitados |

Orden de evaluación fijo: filtros de hoyo → eventos de score → FIR/GIR → putts → penalties → streak → multipliers.

## 13.8 Compartir y biblioteca

- MVP: códigos privados entre amigos.  
- V1: biblioteca comunitaria con reportes, forks, likes sobrios (“jugado N veces”), no feed social.

---

# 14. Multijugador

## 14.1 Modos de sesión

### HOST_ONLY
- Un iPhone registra todos.  
- `Player` puede ser `registeredUser` o `guest`.  
- Guests pueden reclamarse después (“¿eras tú?”).

### MULTI_DEVICE
- Host crea `roomCode`.  
- Peers se unen; cada uno controla su `playerId`.  
- Host es **source of truth** para estructura (hoyos, games); cada peer es authority de su score salvo dispute.

## 14.2 Sincronización

- Transporte: WebSocket + REST fallback.  
- Offline: cola local Indexed/SQLite (`outbox`).  
- Cada `HoleEntry` lleva `updatedAt`, `deviceId`, `rev`.  
- Merge: por campo (strokes, putts, …) LWW; si conflicto en `strokes` entre host y peer → **ConflictBanner**: host confirma.

## 14.3 Permisos

| Acción | Host | Peer | Guest local |
|---|---|---|---|
| Añadir game mid-round | sí | no | — |
| Editar su score | sí | sí | host edita |
| Editar score ajeno | sí | no | — |
| Finalizar vuelta | sí | request | — |

## 14.4 Confirmación

Al terminar: cada peer “Confirma tarjeta”. Host puede forzar cierre tras timeout 24 h → `finalized_by_host`.

## 14.5 Reconexión

Rehydrate `RoundSession` por `sessionId`. Si room cerrada → modo lectura historial.

---

# 15. Ligas

## 15.1 Ligas privadas (V1)

- Crea un admin: nombre, amigos, scoring (ej. Stableford media, o Putting King acumulado).  
- **Temporada:** fecha inicio/fin o N vueltas.  
- Ranking semanal + total.  
- Mínimo 2 vueltas para entrar en ranking (anti-sample bias).

## 15.2 Torneos

- Ventana de fechas.  
- Campo fijo o libre.  
- Formatos: stroke neto social, Stableford, o Social Game elegido.  
- Leaderboard live durante ventana.

## 15.3 MVP stance

Ligas **no** están en MVP; sí “Challenge de grupo” simple (§16) que cubre el hábito.

---

# 16. Challenges

## 16.1 Tipos

| Tipo | Ejemplo | Fase |
|---|---|---|
| Personal | “Menos putts en septiembre” | MVP |
| Entre amigos | “Primero a 10 birdies” | MVP |
| Grupo rolling | “Más GIR en 10 vueltas” | MVP |
| Racha | “Mayor racha de pares” | MVP |
| Liga-linked | Temporada | V1 |

## 16.2 Modelo

```ts
Challenge {
  id, title, metric, comparator, target?,
  window: {start, end} | {rounds: N},
  participants[],
  visibility: 'participants',
  status: 'active'|'completed'|'expired',
  leaderboard[]
}
```

Métricas permitidas: putts, birdies, gir_count, gir_pct, fir_pct, par_streak, score_vs_par, social_game_points:{gameId}.

## 16.3 UX

Crear en SOC / desde resumen. Progreso en Home (máx. 2 cards de challenges activos — no dashboard). Notificación al completar.

---

# 17. Leaderboards

## 17.1 Capas en una partida (LIVE-05)

Tabs o segmented:

1. Formato oficial (Stroke / Stableford / Match)  
2. Cada Social Game activo  
3. Challenges de la vuelta  

Una fila = jugador + valor + delta hoyo.

## 17.2 Leaderboards persistentes

- Challenge leaderboard  
- League season (V1)  
- Head-to-head record (V1): W–L en social games entre dos amigos  

**No** leaderboard global mundial en MVP/V1 (evita toxicidad y sesgo).

---

# 18. MVP obligatorio

Objetivo: prototipo iPhone usable en una vuelta real con amigos.

### Incluye

- Onboarding mínimo  
- Home  
- Setup: campo (catálogo seed ≥3 campos demo), tee, jugadores (hasta 4), stroke play + Stableford opcional  
- Social Games: **Putting King, GIR King, Chaos Golf, Birdie Hunt, Par Machine, Skins Social, Secret Card, Custom**  
- Custom Game Builder (reglas básicas ADD_POINTS + filtros hoyo)  
- Live hole + score + stats B opcionales  
- Tarjeta, leaderboard multi-capa  
- Fin + resumen  
- Historial + detalle  
- Perfil básico  
- Amigos + sala HOST_ONLY y MULTI_DEVICE (sync simple)  
- Challenges personales / entre amigos (3 plantillas)  
- Offline queue local  

### Excluye (explícito)

- Ligas/torneos  
- Shot tracking / GPS / SG  
- Biblioteca comunitaria  
- Wolf completo post-drive  
- Import WHS oficial  
- Android  

---

# 19. V1

- Ligas privadas + temporadas + torneos  
- Catálogo completo 32 games  
- Builder avanzado (multiplicadores, rachas, equipos, hammer)  
- Biblioteca comunitaria  
- Stats por campo/hoyo  
- Head-to-head  
- Share cards  
- Sun Boost auto  
- Reclamar guest players  
- Grupos  
- Match play con playing handicap  
- Notificaciones digest  

---

# 20. Futuro

- Shot tracking + distancias + dispersión  
- Stats por palo  
- Strokes Gained (con baselines honestas)  
- IA de tendencias (“tus bogeys vienen de 3-putts en par 3”) — solo con datos suficientes  
- Apple Watch entrada rápida  
- Android  
- Integración federativa hándicap (si API disponible)  
- TV/club mode  

---

# 21. Casos límite

| Caso | Comportamiento |
|---|---|
| Putts > strokes | Bloquear save; mensaje |
| FIR en Par 3 | UI oculta / N/A |
| GIR true pero strokes ya > par-2 | Warn “¿seguro?”; permitir override |
| Abandono hoyo (score null) | Hoyo N/A en games; stroke play DQ opcional toggle |
| Menos de 2 jugadores en Skins | Deshabilitar game |
| Custom code inválido | Error claro |
| Conflicto sync strokes | Banner; host decide |
| Batería <15% | Sugerir modo lite (solo score A) |
| Red ausente al crear sala | Forzar HOST_ONLY |
| Secret Card + viewer peek | No revelar a otros hasta END |
| 9 hoyos | Games last3/last6 se remapean o se desactivan con aviso |
| Empate total | §11.0 |
| Edición post-finalize | Solo admin host en <1h; regenera snapshots; audit log |
| Stats % con 0 intentos | Mostrar “—” |

---

# 22. Requisitos para el prototipo

## 22.1 Alcance técnico sugerido

- iOS 17+ · SwiftUI  
- Persistencia local: SwiftData/SQLite  
- Backend mínimo: Auth + Rooms + Sync (Firebase/Supabase aceptable en prototipo)  
- Campos: JSON seed embebido  

## 22.2 Criterios de aceptación MVP

1. 4 jugadores anotan 18 hoyos en un iPhone en <3 s/score.  
2. Misma vuelta corre Stroke + Putting King + Chaos + challenge “10 birdies” sin reentrar datos.  
3. Custom “Sunday Chaos” se crea, comparte por código, y puntúa.  
4. Modo avión: se anota; al salir, sync.  
5. Resumen muestra podios por capa.  
6. Historial reabre tarjeta idéntica.  

## 22.3 Datos seed

- 3 campos españoles demo (incluir **La Herrería** como ejemplo de copy).  
- 4 usuarios demo + avatares.  
- 2 custom games de ejemplo.  

## 22.4 No bloqueantes estéticos

Fraunces + Instrument Sans; si tipografías no licenciadas en prototipo, SF Pro + New York con tokens listos para swap.

---

# 23. CONTRATO DE INTEGRACIÓN PARA EL EQUIPO FINAL

Este apartado es la orden de construcción.

## 23.1 Prioridad de entrega

```
P0  Modelos + Score engine + Hole screen + Setup + Summary
P1  Social games pack MVP + Leaderboard multi-capa
P2  Custom Builder + share codes
P3  Multi-device sync + offline
P4  Challenges + Friends
P5  History + Profile + Stats A/B
P6  Polish háptica / motion / Sun mode
```

## 23.2 Modelos de datos (contrato)

```ts
Course { id, name, clubName?, holes: CourseHole[], tees: Tee[] }
CourseHole { number, par, strokeIndex, distancesByTee: Record<teeId, meters> }
Tee { id, name, color, rating?, slope? }

User { id, displayName, photoURL?, handicapIndex?, homeClub?, privacy, preferredStatsLevel }

PlayerRef { userId? , guestName?, displayName, teeId?, playingHandicap? }

RoundSession {
  id, hostId, mode: 'HOST_ONLY'|'MULTI_DEVICE',
  courseId, teeIdDefault, holesToPlay: number[],
  players: PlayerRef[],
  officialFormats: OfficialFormat[],
  socialGames: SocialGameInstance[],
  challenges: ChallengeInstance[],
  status: 'setup'|'live'|'confirming'|'finalized'|'abandoned',
  createdAt, finalizedAt?, engineVersion
}

HoleEntry {
  roundId, playerId, holeNumber,
  strokes: number | null,
  putts?: number | null,
  fir?: boolean | null,  // null = N/A or unknown
  gir?: boolean | null,
  penalties?: number,
  lostBall?: boolean,
  fromGreensideBunker?: boolean,
  riskPicked?: boolean,
  updatedAt, rev, deviceId
}

OfficialFormat = 
  | { type:'STROKE' }
  | { type:'STABLEFORD', scoring:'standard' }
  | { type:'MATCH_PLAY', sides: Side[] }

SocialGameInstance {
  instanceId, defId, // 'putting_king' | 'custom:xxx'
  params, teams?: Side[],
  requires: 'A'|'B'|'C'
}

ChallengeInstance { challengeId, metric, target, progress[] }

Ruleset { // Custom
  id, name, shareCode, requires, higherIsBetter,
  rules: Rule[], teams: 'none'|'pairs'|'custom',
  tieBreak, version, createdBy
}

Rule { when: EventAtom[], then: Effect }

RoundSnapshot { // immutable on finalize
  roundId, holeEntries[],
  results: CompetitionResult[],
  stats: DerivedStats,
  rulesetHashes: string[]
}
```

## 23.2.1 Formatos oficiales — reglas exactas (MVP)

### Stroke Play
- Suma de `strokes` en hoyos jugados.
- Vs par = strokes − sum(par).
- Hoyo sin score: no entra en total; flag `incomplete`.

### Stableford (estándar, bruto social MVP)
Puntos por hoyo según score vs par del hoyo (sin hándicap en MVP; V1 añade neto):

| Score vs par | Pts |
|---|---|
| ≤ −2 | 4 |
| −1 | 3 |
| 0 | 2 |
| +1 | 1 |
| ≥ +2 | 0 |

Mayor suma gana. Si se activa playing handicap en V1: ajustar vs par por strokes recibidos según stroke index.

### Match Play 1v1 / 2v2 (social oficial)
- Cada hoyo: mejor score gana el hoyo; empate = halved.
- Resultado: `N up` / `AS` / `N down`.
- 2v2 Fourball social MVP: mejor bola de cada bando.
- No confundir con Social Game “Match Bits” (éste vive en capa social).

## 23.3 Motores (interfaces)

```ts
interface ScoringEngine {
  id: string;
  evaluate(round: RoundSession, entries: HoleEntry[]): CompetitionResult;
}

interface StatsEngine {
  derive(entries: HoleEntry[], holes: CourseHole[]): DerivedStats;
}

interface RulesetValidator {
  validate(ruleset: Ruleset): { ok: boolean; errors: ValidationError[]; warns: ValidationError[] };
}

interface SyncService {
  enqueue(mutation: Mutation): void;
  flush(): Promise<void>;
  resolveConflict(c: Conflict, decision: Decision): void;
}
```

**Orden de pipeline tras cada upsert de HoleEntry:**  
`validateEntry → persist → StatsEngine → OfficialEngines → SocialEngines → ChallengeEngines → emitUI`.

## 23.4 Pantallas → I/O (contrato UX)

| Screen ID | Consume | Genera | Interacción | Siguiente |
|---|---|---|---|---|
| ONB-01..05 | — | User draft | taps | HOME-01 |
| HOME-01 | User, activeRound?, challenges[≤2], lastRound | — | CTA Jugar | PLAY-01 / LIVE-01 |
| PLAY-02 | Course catalog | courseId | search/select | PLAY-03 |
| PLAY-03 | Course.tees | teeId | select | PLAY-04 |
| PLAY-04 | Friends, guests | players[] | add/remove | PLAY-05 |
| PLAY-05 | — | officialFormats | toggle | PLAY-06 |
| PLAY-06 | game catalog, rulesets | socialGames[], challenges[] | toggle/configure | LIVE-01 |
| LIVE-01 | session, entries | HoleEntry | score/stats | LIVE-01 loop / END-01 |
| LIVE-04 | entries | — | edit hole | LIVE-01 |
| LIVE-05 | CompetitionResult[] | — | switch tabs | — |
| END-02 | RoundSnapshot | finalize | share | HIST-02 / HOME |
| GAME-01 | whitelist events | Ruleset + shareCode | builder | PLAY-06 / GAME-02 |
| SOC-01 | friendships | invites | add | — |
| HIST-01 | RoundSummary[] | filters | open | HIST-02 |
| STAT-01 | DerivedStats windows | — | range select | STAT-02 |

## 23.5 Componentes UI obligatorios (prototipo)

`ScorePad`, `StatToggle`, `HoleHeader`, `LeaderStrip`, `GameChip`, `PlayerPill`, `PrimaryCTA`, `Sheet`, `ConflictBanner`, `EmptyState`, `ChallengeProgress`, `RulesetRuleRow`, `PodioList`.

## 23.6 Estados globales app

`unauthenticated` · `onboarding` · `idle` · `roundSetup` · `roundLive` · `roundSummary` · `offline` · `syncing` · `conflict`.

## 23.7 Reglas de negocio críticas

1. Nunca pedir dos veces strokes/putts/FIR/GIR/penalties para distintas competiciones.  
2. Social Games siempre con badge `Social`.  
3. Métricas null si faltan inputs.  
4. Custom ruleset debe pasar validador antes de share.  
5. Finalize congela snapshot.  
6. Max 4 jugadores MVP; max 3 social games + 2 challenges concurrentes en una vuelta (performance + UX).  

## 23.8 Dependencias entre equipos de implementación

```
Design tokens → UI components → Setup flows
Data models → Engines → Live hole binding
Sync service → Multi-device
Ruleset validator → Custom Builder → Share codes
Engines → Summary/History snapshots
```

## 23.9 Analytics de producto (privadas)

Eventos: `round_started`, `score_entered`, `stats_level_used`, `social_game_selected`, `custom_created`, `custom_joined_code`, `challenge_completed`, `round_finalized`. Sin PII en cleartext.

## 23.10 Definition of Done del prototipo

El product owner puede:

1. Jugar 18 hoyos con 3 amigos en un iPhone.  
2. Activar Stroke + Putting King + Sunday Chaos.  
3. Ver tres leaderboards coherentes.  
4. Crear challenge “menos putts en septiembre”.  
5. Reabrir la vuelta al día siguiente con los mismos resultados.  

Si falta cualquiera, el prototipo no está listo.

---

# Apéndice A — Home (composición, no dashboard)

Primer viewport:

1. Marca **PALOS** (hero tipográfico).  
2. Una línea: “Tu vuelta, varias rivalidades.”  
3. CTA primario: **Jugar**.  
4. Si hay sesión activa: CTA secundario **Reanudar**.  
5. Atmósfera: foto full-bleed de fairway al amanecer (edge-to-edge), sin cards, sin stats strips, sin badges flotantes.

Debajo del fold (scroll): challenges activos (máx 2), última vuelta, rivalidad reciente.

---

# Apéndice B — Copy de etiquetas legales / educación

En PLAY-06 y en resultados:

> Social Game — reglas del grupo. No es un formato oficial de golf ni afecta tu Handicap Index.

---

# Apéndice C — Checklist de coherencia final (firmado por el equipo)

- [x] Minijuegos solo usan eventos capturables en LIVE-01 niveles A/B/C  
- [x] Stats no inventan precisión  
- [x] Multijugador alimenta challenges y games  
- [x] Historial guarda resultados de todas las capas  
- [x] Custom Builder expresa Sunday Chaos y el catálogo  
- [x] Pantalla de hoyo no satura (1 strip + sheet)  
- [x] Retención basada en memoria/rivalidad, no spam  
- [x] MVP prototipable en un ciclo de producto  

---

**Fin del documento único.**  
Entregar tal cual al equipo de prototipo con el mensaje: *“Construid esto.”*
