import {
  betweenMediaWidthTemplates as betweenMediaWidth,
  fromMediaWidthTemplates as fromMediaWidth,
  mediaHeightTemplates as mediaHeight,
  mediaWidthTemplates as mediaWidth
} from './styles/mediaQueries'
import { DefaultOptions, ThemeTemplates } from './templates'
import {
  ThemeBaseColoursRequired,
  ThemeContentPartsRequired,
  ThemeMediaWidthsBaseRequired,
  ThemeModesRequired
} from './types'

type BasicUserTheme = Record<string, any>

export type ThemeByModes<T extends BasicUserTheme = BasicUserTheme> = {
  modes: {
    DEFAULT: T
  } & {
    [key in ThemeModesRequired]: Partial<T>
  }
}

export type AvailableThemeTemplate = keyof typeof ThemeTemplates
export interface ThemeMinimumRequired extends ThemeBaseColoursRequired, ThemeContentPartsRequired {}

export type CustomThemeOrTemplate<T, K, M extends BasicUserTheme = BasicUserTheme> = ThemeMediaWidthsBaseRequired &
  ThemeMinimumRequired &
  (T extends ThemeByModes<M>
    ? T extends undefined
      ? ThemeMinimumRequired
      : T
    : K extends AvailableThemeTemplate
    ? (typeof ThemeTemplates)[K]
    : void)

interface CreateTheme<T, K, M extends BasicUserTheme = BasicUserTheme> {
  new (
    args: T extends ThemeByModes<M> ? T : K extends AvailableThemeTemplate ? never : ThemeMinimumRequired
  ): CustomThemeOrTemplate<T, K, M>
}
/**
 * CreateTheme constructor function
 * Function REQUIRES at _least_ a theme Interface OR a template name as defined by the @type {ThemeTemplateKey}
 * @example
 * const SkilltreeTheme = CreateTheme<void, "SKILLTREE">()
 * const skilltreeTheme = new SkilltreeTheme()
 * skilltreeTheme.saltySwamys // <-- exists
 * @returns Constructed theme object consisting of the required parts + optionals
 */
function CreateTheme<T = undefined, K = undefined, M extends BasicUserTheme = BasicUserTheme>(): CreateTheme<T, K, M> {
  return class {
    /*
     * MEDIA QUERIES
     */
    mediaWidth = mediaWidth
    mediaHeight = mediaHeight
    fromMediaWidth = fromMediaWidth
    betweenMediaWidth = betweenMediaWidth

    constructor(
      args: T extends ThemeMinimumRequired
        ? T
        : K extends AvailableThemeTemplate
        ? (typeof ThemeTemplates)[K]
        : ThemeMinimumRequired
    ) {
      Object.assign(this, args)
    }
  } as CreateTheme<T, K, M>
}

/**
 * createCustomTheme - create a "DefaultTheme" type + realdata object (TM) and pass to the creator fn
 * @example
  export const CUSTOM_THEME = {
    modes: {
      DEFAULT: {
        socks: {
          size: '200rem',
          colour: 'red',
          importanceColour: 'carrot'
        },
        cartoons: {
          watchedColor: '#1234',
          soldColor: 'rgba(0,2,5,0.24)'
        }
      },
      DARK: {
        // ... theme
      },
      // ... rest theme mdoes
    }
    
  } as const

  type CustomTheme = typeof CUSTOM_THEME.modes.DEFAULT
  declare module 'styled-components' {
    export interface DefaultTheme extends ThemeBaseRequired, CustomTheme {}
  }

  const customTheme = createCustomTheme<DefaultTheme>(CUSTOM_THEME)

  customTheme.cartoons.soldColor // <-- rgba(0,2,5,0.24)
  customTheme.mediaWidth.upToExtraLarge // <-- mediaWidth fn
*/
export function createCustomTheme<T extends ThemeByModes, M extends BasicUserTheme = BasicUserTheme>(
  theme: T
): CustomThemeOrTemplate<T, undefined, M> {
  const CustomThemeCreator = CreateTheme<T, undefined, M>()
  const auxTheme = {
    ...DefaultOptions.BaseTheme,
    ...theme
  } as T extends ThemeByModes<M> ? T : ThemeMinimumRequired

  return new CustomThemeCreator(auxTheme)
}

/**
 * createTemplateTheme - create a theme based on available templates - see
 * @example
 * createCustomTheme
 *
 * @param template see @type AvailableThemeTemplate
 *
 * @example
  const pastelleTheme = createTemplateTheme('PASTELLE')
  type CustomThemeExtension = typeof pastelleTheme.modes.DEFAULT 
  // or
  import { PastelleTheme } from '@past3lle/theme'
  declare module 'styled-components' {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    export interface DefaultTheme extends ThemeBaseRequired, PastelleTheme {}
  }
 */
export function createTemplateTheme<K extends AvailableThemeTemplate, M extends BasicUserTheme>(template: K) {
  const TemplateThemeCreator = CreateTheme<void, typeof template, M>()

  const theme = new TemplateThemeCreator(undefined as never)

  return createCustomTheme(theme)
}

/* EXAMPLE
const customTheme = createTemplateTheme('PASTELLE')
type CustomThemeExtension = typeof customTheme.modes.DEFAULT
declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends ThemeBaseRequired, CustomThemeExtension {}
}
*/
