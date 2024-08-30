import { type PointTuple } from 'leaflet'
import { useCallback } from 'react'
import { type MarkerLayoutEvaluatorInput } from '../core/types.js'

type DynamicCoordGetter = () => number

const createDynamicCoords = (
  getX: DynamicCoordGetter,
  getY: DynamicCoordGetter,
) =>
  new Proxy<PointTuple>([0, 0], {
    get(target, prop, receiver) {
      switch (prop) {
        case '0':
          return getX()
        case '1':
          return getY()
        default:
          return Reflect.get(target, prop, receiver)
      }
    },
  })

/**
 * This allows the creation of a getter that takes the
 * {@link MarkerLayoutEvaluatorInput} and returns a "proxied"
 * {@link PointTuple}.
 *
 * The proxied {@link PointTuple} behaves such that when X or Y is accessed, the
 * provided {@link getX} or {@link getY} respectively are used to evaluate those
 * values. This allows us to defer automated calculation of some offsets until
 * such time that they can be calculated. For example, the popup anchor is
 * calculated only when the popup opens as it needs to check the icon components
 * size at that time.
 *
 * Typically the resulting gett from this hook would be called as part of the
 * layout logic passed to `useDefineLayout`.
 *
 * { import('./Track').default }
 *
 * @param getX  Function that returns X coordinate.
 * @param getY  Function that returns Y coordinate.
 * @returns A getter that returns a proxied {@link PointTuple}
 */
export const useDynamicCoords = (
  getX: (initOpts: MarkerLayoutEvaluatorInput) => number,
  getY: (initOpts: MarkerLayoutEvaluatorInput) => number,
) =>
  useCallback(
    (initOpts: MarkerLayoutEvaluatorInput) =>
      createDynamicCoords(
        () => getX(initOpts),
        () => getY(initOpts),
      ),
    [getX, getY],
  )
