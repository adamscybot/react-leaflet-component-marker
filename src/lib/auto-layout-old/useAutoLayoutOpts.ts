import { useMemo } from 'react'
import { logCodedString } from '../logging.js'

type AutoLayoutPosPresets =
  | 'left'
  | 'top-left'
  | 'bottom-left'
  | 'right'
  | 'top-right'
  | 'bottom-right'
  | 'top'
  | 'bottom'
  | 'middle'

type AutoLayoutNumericalPosFactor = number
type AutoLayoutPercentPosFactor = `${number}%`

type AutoLayoutFactor =
  | AutoLayoutNumericalPosFactor
  | AutoLayoutPercentPosFactor

type AutoLayoutFactors = [AutoLayoutFactor, AutoLayoutFactor]

export type AutoLayoutNumericalPosFactors = [
  AutoLayoutNumericalPosFactor,
  AutoLayoutNumericalPosFactor,
]

export type AutoLayoutPosition = AutoLayoutPosPresets | AutoLayoutFactors

const PRESET_FACTORS = {
  left: [-0.5, 0.5],
  'top-left': [-0.5, 0],
  'bottom-left': [-0.5, 1],
  right: [0.5, 0.5],
  'top-right': [0.5, 0],
  'bottom-right': [0.5, 1],
  top: [0, 0],
  bottom: [0, 1],
  middle: [0, 0.5],
} as const satisfies Record<AutoLayoutPosPresets, AutoLayoutNumericalPosFactors>

export type AutoLayoutOpts = {
  /**
   * The position the icon should be relative to the *marker location*.
   *
   * For example, a value of `'bottom'` would position the icon underneath the
   * markers position. This would be useful in a situation where the icon itself
   * depicts a pointer going up, e.g. an "upside down" pin.
   *
   * @defaultValue `'top'`  Which positions the icon above the marker
   *                        position, horizontally centred.
   */
  icon?: {
    locationAnchor?: AutoLayoutPosition
    offset?: Readonly<[number, number]>
  }

  tooltip?: { iconAnchor?: AutoLayoutPosition }

  popup?: { iconAnchor?: AutoLayoutPosition }
}

const posIndexToAxisLabel = (index: 0 | 1) => (index === 0 ? 'X' : 'Y')

const invalidPosOptionError = (msg: string) =>
  new RangeError(logCodedString('INVALID_ANCHOR', msg))

const getFactorsFromPos = (pos: AutoLayoutPosition) => {
  if (Array.isArray(pos)) {
    return pos.reduce<number[]>((processedFactors, currentFactor) => {
      if (typeof currentFactor === 'string') {
        const match = currentFactor.match(/^(-?\d+(\.\d+)?)%$/)
        if (!match) {
          throw invalidPosOptionError(
            `Tried to interpret '${currentFactor}' as a percentage for the ${posIndexToAxisLabel} value in an X/Y tuple but the string is invalid. Percentage strings must be valid CSS values, e.g. 59.5%`,
          )
        }

        return [...processedFactors, parseFloat(match[1]) / 100]
      }

      if (typeof currentFactor === 'number' && !isNaN(currentFactor)) {
        return [...processedFactors, currentFactor]
      }

      throw invalidPosOptionError(
        `Tried to interpret '${currentFactor as unknown}' as a percentage or numerical factor for the ${posIndexToAxisLabel} value in an X/Y tuple but the type is invalid. Factors inside tuples must be either a percentage string (e.g. 59.5%) or a numerical factor (e.g. 0.595)`,
      )
    }, []) as AutoLayoutNumericalPosFactors
  }

  if (typeof pos === 'string') {
    const presetFactor = PRESET_FACTORS[pos]
    if (presetFactor) {
      return presetFactor
    }

    throw invalidPosOptionError(
      `Tried to interpret '${pos}' as a positional preset but the value did not match any of the available presets: ${Object.keys(PRESET_FACTORS)}`,
    )
  }

  throw invalidPosOptionError(
    `Tried to interpret '${pos as unknown}' as positional configuration but the type is invalid. Must be an X/Y tuple (percentage strings, or numerical factors) or one of the position presets. Refer to documentation.`,
  )
}

const processAutoLayoutIconAnchor = (locationAnchor: AutoLayoutPosition) => {
  try {
    return getFactorsFromPos(locationAnchor)
  } catch (e: unknown) {
    throw new RangeError(
      logCodedString(
        'INVALID_LAYOUT_OPTION',
        `Error encountered during the processing of autoLayoutOpts.icon.locationAnchor option.`,
      ),
      { cause: e },
    )
  }
}

const CUSTOM_CONFIG = Symbol('CUSTOM_CONFIG')

export const useAutoLayoutIconFactors = (
  anchor: AutoLayoutPosition = 'top',
) => {
  const parts = useMemo(() => {
    if (Array.isArray(anchor)) {
      return {
        preset: CUSTOM_CONFIG,
        custom: { x: anchor[0], y: anchor[1] },
      }
    }

    return {
      preset: anchor,
      custom: undefined,
    }
  }, [anchor])

  return useMemo(() => {
    return processAutoLayoutIconAnchor(
      parts.preset === CUSTOM_CONFIG
        ? [parts.custom?.x, parts.custom?.y]
        : (parts.preset as AutoLayoutPosition),
    )
  }, [parts.preset, parts.custom?.x, parts.custom?.y])
}

export const useFactorsFromOrigin = (
  [x, y]: AutoLayoutNumericalPosFactors,
  origin: AutoLayoutPosPresets,
) => {
  return useMemo(() => {
    const [originX, originY] = PRESET_FACTORS[origin]
    return [x - originX, y - originY]
  }, [x, y, origin])
}
