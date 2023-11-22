import { devError } from '@past3lle/utils'
import isEqual from 'lodash.isequal'

import { RenderConnectorOptionsProps } from '../components/modals/ConnectionModal/RenderConnectorOptions'
import { useConnection, usePstlWeb3Modal } from '../hooks'
import { ConnectorEnhanced, ConnectorEnhancedExtras, FullWeb3ModalStore } from '../types'
import { trimAndLowerCase } from './misc'

type GetConnectorInfoCallbacks = {
  connect: RenderConnectorOptionsProps['connect']
  disconnect: RenderConnectorOptionsProps['disconnect']
  open: ReturnType<typeof usePstlWeb3Modal>['open']
  closeRootModal: ReturnType<typeof usePstlWeb3Modal>['close']
  setProviderModalMounted: (val: boolean) => void
  setProviderModaLoading: (val: boolean) => void
}

interface BaseConnectorInfoConstants {
  chainId?: number
  address?: string
  isConnected: boolean
  connectorDisplayOverrides?: { [id: string]: ConnectorEnhancedExtras | undefined }
}

interface AuxConnectorInfoConstants extends BaseConnectorInfoConstants {
  isProviderModalMounted?: boolean
  closeOnConnect?: boolean
}

type ProviderModalType = 'w3a-modal' | 'w3m-modal' | string | null | undefined

export type ConnectorInfo = { label: string; logo?: string; connected: boolean; isRecommended?: boolean }
export function runConnectorConnectionLogic(
  connector: ConnectorEnhanced<any, any>,
  currentConnector: ConnectorEnhanced<any, any> | undefined,
  modalsStore: FullWeb3ModalStore,
  {
    connect,
    disconnect,
    open,
    closeRootModal,
    setProviderModalMounted,
    setProviderModaLoading
  }: GetConnectorInfoCallbacks,
  {
    chainId,
    address,
    isProviderModalMounted,
    closeOnConnect,
    connectorDisplayOverrides
  }: Omit<AuxConnectorInfoConstants, 'isConnected'>
): [
  ConnectorInfo,
  ReturnType<typeof useConnection>[1]['connect'] | ReturnType<typeof useConnection>[1]['openWalletConnectModal']
] {
  const modalType: ProviderModalType = (
    connectorDisplayOverrides?.[trimAndLowerCase(connector?.name)] ||
    connectorDisplayOverrides?.[trimAndLowerCase(connector?.id)]
  )?.modalNodeId
  const isModalMounted = !modalType || !!isProviderModalMounted
  const providerInfo = _getProviderInfo(connector, currentConnector, connectorDisplayOverrides)
  return [
    providerInfo,
    async () =>
      _connectProvider(
        modalType,
        connector,
        currentConnector,
        modalsStore,
        {
          chainId,
          address,
          closeOnConnect,
          isModalMounted,
          isConnected: providerInfo.connected,
          connectorDisplayOverrides
        },
        {
          connect,
          disconnect,
          open,
          closeRootModal,
          setModalLoading: setProviderModaLoading,
          setModalMounted: setProviderModalMounted
        }
      )
  ]
}

async function _connectProvider(
  modalId: ProviderModalType,
  connector: ConnectorEnhanced<any, any>,
  currentConnector: ConnectorEnhanced<any, any> | undefined,
  modalsStore: FullWeb3ModalStore,
  constants: AuxConnectorInfoConstants & {
    isModalMounted?: boolean
  },
  callbacks: Omit<
    GetConnectorInfoCallbacks,
    | 'setProviderModaLoading'
    | 'setProviderModalMounted'
    | 'setW3mModalLoading'
    | 'setW3mModalMounted'
    | 'openWalletConnectModal'
  > & {
    setModalLoading?: (status: boolean) => void
    setModalMounted?: (status: boolean) => void
  }
) {
  const { address, chainId, isModalMounted, isConnected, connectorDisplayOverrides } = constants
  const { connect, disconnect, setModalLoading, setModalMounted, open } = callbacks

  const modalNodeSyncCheck =
    !!modalId && typeof globalThis?.window?.document !== 'undefined' ? document.getElementById(modalId) : null

  const connectCallbackParams: [
    ConnectorEnhanced<any, any>,
    ConnectorEnhanced<any, any> | undefined,
    FullWeb3ModalStore,
    BaseConnectorInfoConstants,
    Pick<GetConnectorInfoCallbacks, 'open' | 'connect' | 'disconnect'>
  ] = [
    connector,
    currentConnector,
    modalsStore,
    { chainId, address, connectorDisplayOverrides, isConnected },
    { connect, disconnect, open }
  ]

  try {
    // Modal has already mounted, skip timeout
    if (isModalMounted || modalNodeSyncCheck) {
      return _handleConnectorClick(...connectCallbackParams)
    } else if (!!modalId) {
      // Modal is async imported on use
      // we need to wait ~20 seconds for modal to load and show loader in meantime
      setModalLoading?.(true)

      await Promise.race([
        // timeout and thow after N seconds if we can't find the modal
        loopFindElementById(modalId, 30).catch((error) => {
          throw new Error(error)
        }),
        _handleConnectorClick(...connectCallbackParams)
      ])
    }
  } catch (error: any) {
    await connector.disconnect()
    console.error('[PstlWeb3ConnectionModal::_getProviderInfo] - Error in loading modal:', error)
    throw new Error(error)
  } finally {
    setModalLoading?.(false)
    setModalMounted?.(true)
  }
}

function _getProviderInfo(
  connector: ConnectorEnhanced<any, any>,
  currentConnector: ConnectorEnhanced<any, any> | undefined,
  connectorDisplayOverrides: BaseConnectorInfoConstants['connectorDisplayOverrides']
) {
  const { baseConnectorKey, baseCurrentConnectorKey } = _getConnectorOverrideInfo(
    connector,
    currentConnector,
    connectorDisplayOverrides
  )
  let connected = false
  if (baseCurrentConnectorKey) {
    connected = isEqual(baseCurrentConnectorKey, baseConnectorKey)
  } else {
    connected = connector.id === currentConnector?.id
  }

  return {
    label: baseConnectorKey?.customName || connector.name,
    logo: baseConnectorKey?.logo || connector?.logo,
    connected,
    isRecommended: baseConnectorKey?.isRecommended
  }
}

async function _handleConnectorClick(
  connector: ConnectorEnhanced<any, any>,
  currentConnector: ConnectorEnhanced<any, any> | undefined,
  modalsStore: FullWeb3ModalStore,
  { address, chainId, connectorDisplayOverrides, isConnected }: BaseConnectorInfoConstants,
  { connect, disconnect, open }: Pick<GetConnectorInfoCallbacks, 'open' | 'connect' | 'disconnect'>
) {
  const { baseConnectorKey } = _getConnectorOverrideInfo(connector, currentConnector, connectorDisplayOverrides)

  const connectToProviderParams = { connector, connect, modalsStore, connectorOverride: baseConnectorKey, chainId }

  try {
    if (address && isConnected) {
      return open({ route: 'Account' })
    } else {
      if (!!currentConnector) {
        await disconnect(undefined, {
          async onSuccess() {
            await _connectToProvider(connectToProviderParams)
          }
        })
      } else {
        await _connectToProvider(connectToProviderParams)
      }
    }
  } catch (error: any) {
    devError('[__handleConnectorClick] Error handling connection.', error)
    throw error
  }
}

async function _connectToProvider({
  connector,
  connect,
  modalsStore,
  connectorOverride,
  chainId
}: Pick<GetConnectorInfoCallbacks, 'connect'> & {
  modalsStore: FullWeb3ModalStore
  connector: ConnectorEnhanced<any, any>
  connectorOverride: ConnectorEnhancedExtras | undefined
  chainId?: number
}) {
  try {
    await (connectorOverride?.customConnect?.({ store: modalsStore, connector, wagmiConnect: connect }) ||
      connect({ connector, chainId }))
  } catch (error: any) {
    const errorMessage = new Error(error).message
    const connectorNotFoundError = errorMessage?.includes('ConnectorNotFoundError')

    if (connectorOverride?.downloadUrl && connectorNotFoundError && typeof globalThis?.window !== 'undefined') {
      window.open(connectorOverride.downloadUrl, '_newtab')
    }

    throw error
  }
}

function _getConnectorOverrideInfo(
  connector: ConnectorEnhanced<any, any>,
  currentConnector: ConnectorEnhanced<any, any> | undefined,
  connectorDisplayOverrides: BaseConnectorInfoConstants['connectorDisplayOverrides']
) {
  const trimmedId = trimAndLowerCase(connector?.id)
  const trimmedName = trimAndLowerCase(connector?.name)
  const trimmedCurrentId = trimAndLowerCase(currentConnector?.id)
  const trimmedCurrentName = trimAndLowerCase(currentConnector?.name)

  const baseConnectorKey = connectorDisplayOverrides?.[trimmedId] || connectorDisplayOverrides?.[trimmedName]
  const baseCurrentConnectorKey =
    connectorDisplayOverrides?.[trimmedCurrentId] || connectorDisplayOverrides?.[trimmedCurrentName]

  return { baseConnectorKey, baseCurrentConnectorKey }
}

async function _delayFindDomById({
  value,
  limit = 15,
  freq = 1000,
  id
}: {
  value: number
  limit?: number
  freq?: number
  id: string
}): Promise<HTMLElement | null | 'BAILED'> {
  return new Promise((resolve) =>
    setTimeout(
      () =>
        typeof globalThis?.window?.document === 'undefined' || value >= limit
          ? resolve('BAILED')
          : resolve(document.getElementById(id)),
      freq
    )
  )
}

async function loopFindElementById(id: string, limit = 10) {
  let value = 1
  let result: HTMLElement | null | 'BAILED' = null
  try {
    while (!result) {
      result = await _delayFindDomById({ value, limit, id })
        .then((res) => {
          if (res === 'BAILED') throw '[loopFindElementById] Timeout searching for ' + id
          return res
        })
        .catch((error) => {
          devError(error)
          return 'BAILED'
        })
      value = value + 1
    }
  } catch (error: any) {
    console.error(new Error('[PstlWeb3ConnectionModal::loopFindElementById]', error))
    throw error
  }

  return result
}