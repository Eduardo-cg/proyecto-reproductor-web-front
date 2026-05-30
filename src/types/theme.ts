export type ThemeId = 'warp' | 'midnight' | 'forest' | 'ocean' | 'retro'

export interface Theme {
  id: ThemeId
  icon: string
  palette: [string, string, string, string]
}

export type StreamingMode = 'range' | 'blob'
