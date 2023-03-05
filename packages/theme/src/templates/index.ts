import { BaseColours, BaseContent, BaseTheme } from './base'
import { Theme as PastelleThemeTemplate } from './pastelle'
import { Theme as SkilltreeThemeTemplate } from './skilltree'

const DefaultOptions = {
  BaseColours,
  BaseContent,
  BaseTheme
}

const ThemeTemplates = {
  PASTELLE: PastelleThemeTemplate,
  SKILLTREE: SkilltreeThemeTemplate
} as const

export * from './types'

export { ThemeTemplates, DefaultOptions }