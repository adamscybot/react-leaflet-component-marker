import { type PointTuple } from 'leaflet'
import { useMemo } from 'react'

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
 * This allows a "fake" {@link PointTuple} to be created that returns the result
 * of the provided getters when X or Y is accessed. This allows us to defer
 * automated calculation of some offsets until such time that they can be
 * calculated.
 *
 * @param getX  Function that returns X coordinate.
 * @param getY  Function that returns Y coordinate.
 * @returns A proxied {@link PointTuple}
 */
export const useDynamicCoords = (
  getX: DynamicCoordGetter,
  getY: DynamicCoordGetter,
) => useMemo(() => createDynamicCoords(getX, getY), [getX, getY])
