// Configuration électronique : Aufbau + exceptions connues.
// Porté du projet Vue d'origine.

import type { ConfigEntry, ShortConfig, Subshell } from '../types'

const AUFBAU_ORDER: Subshell[] = [
  '1s','2s','2p','3s','3p','4s','3d','4p','5s','4d','5p',
  '6s','4f','5d','6p','7s','5f','6d','7p','8s'
]
const SUBSHELL_CAP: Record<string, number> = { s: 2, p: 6, d: 10, f: 14 }
const NOBLE_GASES = [
  { Z: 2,   symbol: 'He' },
  { Z: 10,  symbol: 'Ne' },
  { Z: 18,  symbol: 'Ar' },
  { Z: 36,  symbol: 'Kr' },
  { Z: 54,  symbol: 'Xe' },
  { Z: 86,  symbol: 'Rn' },
  { Z: 118, symbol: 'Og' },
]

// Exceptions Aufbau confirmées (Wikipedia + NIST).
// Chaque entrée : étapes dans l'ordre énergétique, [Noble] = expand au gaz noble.
type RawStep = [string] | [Subshell, number]
const AUFBAU_EXCEPTIONS: Record<number, RawStep[]> = {
  24:  [['1s',2],['2s',2],['2p',6],['3s',2],['3p',6],['3d',5],['4s',1]],
  29:  [['1s',2],['2s',2],['2p',6],['3s',2],['3p',6],['3d',10],['4s',1]],
  41:  [['Kr'],['4d',4],['5s',1]],
  42:  [['Kr'],['4d',5],['5s',1]],
  44:  [['Kr'],['4d',7],['5s',1]],
  45:  [['Kr'],['4d',8],['5s',1]],
  46:  [['Kr'],['4d',10]],
  47:  [['Kr'],['4d',10],['5s',1]],
  57:  [['Xe'],['5d',1],['6s',2]],
  58:  [['Xe'],['4f',1],['5d',1],['6s',2]],
  64:  [['Xe'],['4f',7],['5d',1],['6s',2]],
  78:  [['Xe'],['4f',14],['5d',9],['6s',1]],
  79:  [['Xe'],['4f',14],['5d',10],['6s',1]],
  89:  [['Rn'],['6d',1],['7s',2]],
  90:  [['Rn'],['6d',2],['7s',2]],
  91:  [['Rn'],['5f',2],['6d',1],['7s',2]],
  92:  [['Rn'],['5f',3],['6d',1],['7s',2]],
  93:  [['Rn'],['5f',4],['6d',1],['7s',2]],
  96:  [['Rn'],['5f',7],['6d',1],['7s',2]],
  103: [['Rn'],['5f',14],['7s',2],['7p',1]],
}

function fillAufbau(electrons: number): ConfigEntry[] {
  const out: ConfigEntry[] = []
  let n = electrons
  for (const sub of AUFBAU_ORDER) {
    if (n <= 0) break
    const cap = SUBSHELL_CAP[sub[1]]
    const take = Math.min(cap, n)
    out.push([sub, take])
    n -= take
  }
  return out
}

function expandNobleShortcut(entry: RawStep): ConfigEntry[] {
  if (entry.length !== 1) return []
  const sym = entry[0]
  const ng = NOBLE_GASES.find(g => g.symbol === sym)
  if (!ng) return []
  return fillAufbau(ng.Z)
}

function normalizeConfig(steps: RawStep[]): ConfigEntry[] {
  const out: ConfigEntry[] = []
  for (const s of steps) {
    if (s.length === 1) {
      out.push(...expandNobleShortcut(s))
    } else {
      out.push([s[0] as string, s[1] as number])
    }
  }
  return out
}

const SUBSHELL_TYPE_ORDER: Record<string, number> = { s: 0, p: 1, d: 2, f: 3 }

function sortConfig(steps: ConfigEntry[]): ConfigEntry[] {
  return [...steps].sort((a, b) => {
    const na = +a[0][0]
    const nb = +b[0][0]
    if (na !== nb) return na - nb
    return SUBSHELL_TYPE_ORDER[a[0][1]] - SUBSHELL_TYPE_ORDER[b[0][1]]
  })
}

export function getElectronConfig(electrons: number): ConfigEntry[] {
  const exc = AUFBAU_EXCEPTIONS[electrons]
  return exc ? normalizeConfig(exc) : fillAufbau(electrons)
}

export function getShortConfig(electrons: number): ShortConfig | ConfigEntry[] {
  const full = getElectronConfig(electrons)
  let coreSym: string | null = null
  let coreZ = 0
  for (const ng of NOBLE_GASES) {
    if (ng.Z < electrons && ng.Z > coreZ) {
      coreSym = ng.symbol
      coreZ = ng.Z
    }
  }
  if (!coreSym) return sortConfig(full)
  const ngConfig = fillAufbau(coreZ)
  const subMap = new Map<string, number>()
  for (const [s, c] of full) subMap.set(s, (subMap.get(s) || 0) + c)
  for (const [s, c] of ngConfig) subMap.set(s, (subMap.get(s) || 0) - c)
  const tail = [...subMap.entries()].filter(([, c]) => c > 0) as ConfigEntry[]
  return { core: coreSym, tail: sortConfig(tail) }
}

export function shellDistribution(electrons: number): number[] {
  const cfg = getElectronConfig(electrons)
  const shells: number[] = []
  for (const [sub, c] of cfg) {
    const n = +sub[0]
    shells[n - 1] = (shells[n - 1] || 0) + c
  }
  while (shells.length && shells[shells.length - 1] === undefined) shells.pop()
  for (let i = 0; i < shells.length; i++) if (shells[i] === undefined) shells[i] = 0
  return shells
}

export function getValenceElectrons(shells: number[]): number {
  return shells.length ? shells[shells.length - 1] : 0
}

const SUPER_DIGITS: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
}

export function toSuper(s: string | number): string {
  return String(s).split('').map(c => SUPER_DIGITS[c] || c).join('')
}

export function ionLabel(symbol: string, charge: number): string {
  if (charge === 0) return symbol
  const n = Math.abs(charge)
  const sign = charge > 0 ? '⁺' : '⁻'
  return symbol + (n > 1 ? toSuper(n) + sign : sign)
}

// Position dans le tableau périodique (gestion lanthanides/actinides)
export interface TableSlot { row: number; col: number }

export function ptableSlot(Z: number, period: number, group: number | null): TableSlot | null {
  if (Z >= 58 && Z <= 71)  return { row: 8, col: Z - 54 }
  if (Z >= 90 && Z <= 103) return { row: 9, col: Z - 86 }
  if (Z === 57) return { row: 6, col: 3 }
  if (Z === 89) return { row: 7, col: 3 }
  if (group) return { row: period, col: group }
  return null
}
