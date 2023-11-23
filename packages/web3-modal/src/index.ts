import { PstlWeb3Modal } from './components/modals'
import {
  useAllWeb3Modals,
  useLimitChainsAndSwitchCallback,
  useAccountNetworkActions as usePstlAccountNetworkActions,
  useConnectDisconnect as usePstlConnectDisconnect,
  useConnection as usePstlConnection,
  useUserConnectionInfo as usePstlUserConnectionInfo,
  usePstlWeb3Modal,
  useAllWeb3Modals as usePstlWeb3Modals
} from './hooks'
import {
  type Chain,
  type ChainsPartialReadonly,
  PstlW3Providers,
  type PstlWagmiClientOptions,
  PstlWagmiProvider,
  type PstlWeb3ModalProps,
  type ReadonlyChain,
  addConnector,
  addFrameConnector,
  usePstlEthereumClient,
  usePstlWagmiClient
} from './providers'
import { AppType, getAppType, useDeriveAppType } from './providers/utils/connectors'
import { type PstlModalTheme, type PstlModalThemeExtension, W3aStyleResetProvider, createTheme } from './theme'
import {
  getAllChainsInfo,
  getChainInfoFromShortName,
  getSafeAppChainInfo,
  getSafeAppChainShortName
} from './utils/chains'

export * from './types'

export {
  PstlWeb3Modal,
  usePstlAccountNetworkActions,
  usePstlConnectDisconnect,
  usePstlConnection,
  usePstlUserConnectionInfo,
  usePstlWeb3Modal,
  usePstlWeb3Modals,
  useAllWeb3Modals,
  useLimitChainsAndSwitchCallback,
  // theme
  createTheme,
  W3aStyleResetProvider,
  // providers
  PstlW3Providers,
  PstlWagmiProvider,
  // hooks
  usePstlEthereumClient,
  usePstlWagmiClient,
  // utils
  getAllChainsInfo,
  getChainInfoFromShortName,
  getSafeAppChainInfo,
  getSafeAppChainShortName,
  addConnector,
  addFrameConnector,
  getAppType,
  useDeriveAppType,
  // types
  type PstlWeb3ModalProps,
  type PstlWagmiClientOptions,
  type ChainsPartialReadonly,
  type ReadonlyChain,
  type Chain,
  type PstlModalThemeExtension,
  type PstlModalTheme,
  type AppType
}
