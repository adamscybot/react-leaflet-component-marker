import { type PointTuple, type PointExpression } from 'leaflet'

export const getCoordsFromPointExpression = (expression?: PointExpression) => {
  if (!expression) return []
  if (Array.isArray(expression)) {
    return expression
  } else {
    return [expression.x, expression.y] as PointTuple
  }
}
