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

export const useCoordsFromPointExpression = (expression?: PointExpression) =>
  useMemo(() => getCoordsFromPointExpression(expression), [expression])
