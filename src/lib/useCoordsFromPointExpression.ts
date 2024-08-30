import { type PointTuple, type PointExpression } from 'leaflet'
import { useMemo } from 'react'

const getCoordsFromPointExpression = (expression?: PointExpression) => {
  if (!expression) return []
  if (Array.isArray(expression)) {
    return expression
  } else {
    return [expression.x, expression.y] as PointTuple
  }
}

/**
 * Converts any {@link PointExpression} to a {@link PointTuple},
 * which is easier for us to manipulate, and reduces branching downstream.
 *
 * @param expression  Any {@link PointExpression}
 * @returns Equivalent {@link PointTuple}
 */
export const useCoordsFromPointExpression = (expression?: PointExpression) =>
  useMemo(() => getCoordsFromPointExpression(expression), [expression])
