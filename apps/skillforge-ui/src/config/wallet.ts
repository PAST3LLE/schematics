import { createCustomTheme, ThemeByModes } from '@past3lle/theme'
import { PstlModalTheme } from '@past3lle/web3-modal'
import { ASSETS_MAP } from 'assets'

export const pstlModalTheme = createCustomTheme<ThemeByModes<PstlModalTheme>>({
  modes: {
    LIGHT: {},
    DARK: {},
    DEFAULT: {
      modals: {
        connection: {
          baseFontSize: 20,
          helpers: { show: true },
          background: `url(${ASSETS_MAP.images.background.app}) center/cover`,
          title: { color: '#cbb9ee', fontWeight: 700, letterSpacing: '-1.4px', lineHeight: 0.82 },
          button: {
            background: '#301d4ea1',
            border: { border: 'none', radius: '1em' },
            color: 'ghostwhite',
            fontStyle: 'italic',
            fontWeight: 600,
            letterSpacing: '-1px',
            textShadow: '2px 2px 3px #0000005c',
            textTransform: 'uppercase',
            hoverAnimations: true
          }
        }
      }
    }
  }
})