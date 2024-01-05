import { TorusPlugin } from './web3authPlugins'
import { addFrameConnector } from '@past3lle/forge-web3'
import { LedgerIFrameConnector } from '@past3lle/wagmi-connectors/LedgerIFrameConnector'
import { PstlWeb3AuthConnector } from '@past3lle/wagmi-connectors/PstlWeb3AuthConnector'
import { Chain } from '@wagmi/chains'
import { ASSETS_MAP } from 'assets'
import { skillforgeTheme } from 'theme/skillforge'
import { SKILLFORGE_APP_NAME } from 'web3/config/skillforge'

const connectors = [
  (chains: Chain[]) =>
    PstlWeb3AuthConnector(chains, {
      appName: SKILLFORGE_APP_NAME,
      // CYAN = USA focused
      network: process.env.REACT_APP_WEB3_AUTH_NETWORK as Required<
        Parameters<typeof PstlWeb3AuthConnector>
      >[1]['network'],
      projectId: process.env.REACT_APP_WEB3AUTH_ID as string,
      storageKey: 'session',
      preset: 'DISALLOW_EXTERNAL_WALLETS',
      mfaLevel: 'none',
      uxMode: 'popup',
      themeInfo: {
        mode: 'dark',
        customTheme: {
          primary: skillforgeTheme.modes.DEFAULT.mainBg
        }
      },
      appLogoDark: ASSETS_MAP.logos.forge[512],
      appLogoLight: ASSETS_MAP.logos.forge[512],
      url: 'https://skills.pastelle.shop',
      plugins: [TorusPlugin]
    })
]
const frameConnectors = [addFrameConnector(LedgerIFrameConnector, {})]
export { connectors, frameConnectors }
