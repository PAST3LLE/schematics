import { ThemeBaseRequired } from '@past3lle/theme'

export interface Theme {
  modals?: {
    connection?: {
      baseFontSize?: number
      helpers?: {
        show?: boolean
        color?: string
      }
      closeIcon?: {
        color?: string
        position?: 'top-left' | 'top-right' | 'bottom-right' | 'bottom-left'
        size?: string
      }
      title?: {
        color?: string
        fontSize?: string
        fontWeight?: number
        letterSpacing?: string
        lineHeight?: number
      }
      background?: string
      padding?: string
      button?: {
        color?: string
        textShadow?: string
        background?: string
        fontSize?: string
        fontStyle?: string
        fontWeight?: number
        letterSpacing?: string
        textTransform?: string
        border?: {
          border?: string
          color?: string
          radius?: string
        }
        hoverAnimations?: boolean
      }
    }
  }
}

declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends Theme, ThemeBaseRequired {}
}