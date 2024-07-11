export const logString = (str: string) =>
  `[react-leaflet-component-marker] ${str}`

export const logCodedString = (code: string, str: string) =>
  logString(`[${code}] ${str}`)
