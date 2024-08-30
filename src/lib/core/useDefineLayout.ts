import { useMemo } from 'react'
import {
  COMPONENT_MARKER_LAYOUT_PROPERTY,
  type MarkerLayoutEvaluatorInput,
  type MarkerLayoutEvaluator,
  type MarkerLayoutEvaluatorOutput,
} from './types.js'

/**
 * This hook is to be used by custom or built in layout hooks to package such
 * layout logic. It allows the creation of a {@link MarkerLayoutEvaluator} that
 * can be passed to {@link ComponentMarker} which ultimately calls that
 * evaluator with relevant context to that marker.
 *
 * It is crucial that {@link getLayoutOpts} is memoized such that it is only
 * recreated if there is a *meaningful* change to an out of scope input (usually
 * layout hook options). If this is not achieved,
 * there may be performance issues.
 *
 * @param name           The name of the layout in snake case form (e.g.
 *                       `'auto-layout'`) to be used for debugging/logging
 *                       purposes.
 * @param getLayoutOpts  Callback that when given
 *                       {@link MarkerLayoutEvaluatorInput} returns the
 *                       {@link MarkerLayoutEvaluatorOutput} that represents
 *                       this layout for a given invocation.
 * @returns A {@link MarkerLayoutEvaluator} representing this layout
 *          evaluator.
 */
export const useDefineLayout = <Name extends string>(
  name: Name,
  getLayoutOpts: (
    opts: MarkerLayoutEvaluatorInput,
  ) => MarkerLayoutEvaluatorOutput,
): MarkerLayoutEvaluator<Name> => {
  return useMemo(() => {
    Object.defineProperty(getLayoutOpts, COMPONENT_MARKER_LAYOUT_PROPERTY, {
      configurable: false,
      writable: false,
      enumerable: false,
      value: name,
    })

    return getLayoutOpts as MarkerLayoutEvaluator<Name>
  }, [name, getLayoutOpts])
}
