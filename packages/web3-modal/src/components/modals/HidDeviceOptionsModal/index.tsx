import { Column, InfoCircle, MouseoverTooltip, Row, SpinnerCircle, useSelect } from '@past3lle/components'
import { BLACK_TRANSPARENT, OFF_WHITE, setBestTextColour, transparentize } from '@past3lle/theme'
import { truncateAddress } from '@past3lle/utils'
import type { LedgerHIDConnector } from '@past3lle/wagmi-connectors'
import React, { memo } from 'react'
import { useTheme } from 'styled-components'
import { useSwitchNetwork } from 'wagmi'

import { KEYS } from '../../../constants/localstorage'
import { ModalPropsCtrlState } from '../../../controllers/types/controllerTypes'
import { useGetChainLogoCallback, usePstlWeb3Modal, useUserConnectionInfo } from '../../../hooks'
import { LoadingScreen } from '../../LoadingScreen'
import { NoChainLogo } from '../../NoChainLogo'
import { AccountModalButton, AccountText, FooterActionButtonsRow, ModalColumnContainer } from '../AccountModal/styled'
import { ConnectorOption } from '../ConnectionModal/ConnectorOption'
import { BaseModalProps, ModalId } from '../common/types'
import { useHidModalPath, useHidModalStore, useHidUpdater } from './hooks'
import {
  HidModalAddressPlaceholder,
  HidModalAddresseRow,
  HidModalAddressesList,
  HidModalContainer,
  HidModalHeaderRow,
  HidModalTextInput,
  HidModalWalletsWrapper,
  HighlightedAccountText,
  PathSelectAndInputContainer,
  UnderlinedAccountCTA
} from './styleds'

const SUPPORTED_BIP_DERIVATION_PATHS = [
  // Ledger Live
  "m/44'/60'/*'/0/0",
  // Ledger Legacy
  "m/44'/60'/*'/0",
  // BIP44 Standard
  "m/44'/60'/0'/0/*"
]

type PstlHidDeviceModalProps = ModalPropsCtrlState['root'] &
  ModalPropsCtrlState['hidDeviceOptions'] &
  Pick<BaseModalProps, 'errorOptions'>

const PAGINATION_AMT = 5
const CHAIN_IMAGE_STYLES = { width: 20, marginLeft: '0.2rem', borderRadius: '30%' }

const DEFAULT_PATH = localStorage.getItem(KEYS.HID_DERIVATION_PATH) ?? SUPPORTED_BIP_DERIVATION_PATHS[0]
const DISABLED_SELECTOR_COLOR = 'darkgrey'

function HidDeviceOptionsContent({ errorOptions }: PstlHidDeviceModalProps) {
  const { close } = usePstlWeb3Modal()

  const { address, chain, supportedChains } = useUserConnectionInfo()
  const chainId = chain?.id

  const getChainLogo = useGetChainLogoCallback()
  const currChainLogo = getChainLogo(chain?.id)

  const { switchNetworkAsync } = useSwitchNetwork()
  const { connector: hidConnector } = useUserConnectionInfo()
  const { dbPath, path, isCustomPath, ...pathCallbacks } = useHidModalPath(DEFAULT_PATH)

  const { accountsAndBalances, loading, loadedSavedConfig, paginationIdx, selectedAccountIdx, ...storeCallbacks } =
    useHidModalStore({
      path: dbPath,
      chainId,
      paginationAmount: PAGINATION_AMT,
      connector: hidConnector as LedgerHIDConnector | undefined
    })

  const {
    Component: Selector,
    store: [selection, setSelection]
  } = useSelect<string | undefined>({
    options: isCustomPath ? [{ value: undefined, label: 'Custom path' }, ...SELECTOR_OPTIONS] : SELECTOR_OPTIONS,
    defaultValue: SELECTOR_OPTIONS[0].value,
    name: 'HID Derivation Paths',
    callback: (selection) => {
      pathCallbacks.setIsCustomPath(false)
      pathCallbacks.setPath(selection ?? null)
      storeCallbacks.resetAndConnectProvider(selection?.replace('*', selectedAccountIdx.toString()))
    }
  })

  // Update state on changes
  useHidUpdater({
    ...storeCallbacks,
    ...pathCallbacks,
    setSelection,
    chainId,
    dbPath,
    isCustomPath,
    loadedSavedConfig,
    selectedAccountIdx,
    derivationPaths: SUPPORTED_BIP_DERIVATION_PATHS
  })

  const { modals: theme } = useTheme()

  if (!loadedSavedConfig) return <LoadingScreen loadingText="Loading user HID device config..." />

  return (
    <ModalColumnContainer width="100%" layout="Other">
      {/* Address and Balance Row */}
      <HidModalContainer padding="1em">
        <Column flex="0 1 auto" width="100%">
          {hidConnector && (
            <Column maxHeight={115} height="auto">
              <AccountText type="main">
                Network:{' '}
                <AccountText type="balance" display="inline-flex" justifyContent={'center'}>
                  {chain?.name || chain?.id || 'disconnected'}{' '}
                  {currChainLogo ? (
                    <img src={currChainLogo} style={CHAIN_IMAGE_STYLES} />
                  ) : (
                    <NoChainLogo style={CHAIN_IMAGE_STYLES} />
                  )}
                </AccountText>
              </AccountText>
              <HidModalWalletsWrapper view="grid" width="auto">
                {supportedChains.map((sChain) => {
                  if (!switchNetworkAsync || chain?.id === sChain.id) return null
                  const chainLogo = getChainLogo(sChain.id)
                  return (
                    <ConnectorOption
                      // keys & ids
                      optionType="chain"
                      optionValue={sChain.id}
                      key={sChain.id}
                      // data props
                      callback={async () => switchNetworkAsync(sChain.id)}
                      modalView={'grid'}
                      connected={false}
                      connector={hidConnector as LedgerHIDConnector}
                      label={sChain.name}
                      logo={chainLogo ? <img src={chainLogo} /> : <NoChainLogo />}
                    />
                  )
                })}
              </HidModalWalletsWrapper>
            </Column>
          )}
          <Row justifyContent="flex-start" gap="10px" style={{ zIndex: 1 }} title="derivation-path">
            <AccountText id="pstl-web3-modal-address-text" type="main">
              Select a derivation path
            </AccountText>
          </Row>
          <Row id={`${ModalId.ACCOUNT}__balance-text`}>
            <AccountText type="balance">Current Path:</AccountText>
            <HighlightedAccountText
              color={setBestTextColour(theme?.hidDevice?.container?.main?.background?.background || '#000')}
            >
              {selection}
            </HighlightedAccountText>
            <HighlightedAccountText backgroundColor={isCustomPath ? '#8ac8d4' : 'lightgray'} color="#000">
              {isCustomPath ? 'CUSTOM' : 'PRESET'}
            </HighlightedAccountText>
          </Row>
        </Column>
        {/* PATH SELECTOR / INPUT */}
        <PathSelectAndInputContainer
          flexWrap="wrap"
          gap="1rem"
          fontWeight={isCustomPath ? 100 : 300}
          marginTop={'1rem'}
          width="100%"
          css={
            isCustomPath
              ? `
                select {
                  color: ${transparentize(0.82, theme?.base?.font?.color || 'white')};
                }
              `
              : ''
          }
        >
          {/* PRESET */}
          <Column
            flex={`1 1 ${!isCustomPath ? 220 : 139}px`}
            padding="0.5rem"
            borderRadius={theme?.base?.input?.border?.radius}
            backgroundColor={!isCustomPath ? theme?.account?.button?.switchNetwork?.background?.background : ''}
          >
            <AccountText
              fontSize="0.8em"
              marginBottom="0.25rem"
              type="balance"
              css={`
                white-space: nowrap;
              `}
            >
              PRESET PATH (recommended)
            </AccountText>
            <Selector arrowStrokeColor={isCustomPath ? DISABLED_SELECTOR_COLOR : 'ghostwhite'} arrowSize={30} />
          </Column>
          {/* CUSTOM */}
          <Row
            flex={`1 1 ${isCustomPath ? 350 : 146}px`}
            backgroundColor={isCustomPath ? theme?.account?.button?.switchNetwork?.background?.background : ''}
            width="auto"
            padding="0.5rem"
            borderRadius={theme?.base?.input?.border?.radius}
          >
            <Column width="100%">
              <AccountText fontSize="0.8em" marginBottom="0.25rem" type="balance">
                OR CUSTOM ETH PATH{' '}
                <MouseoverTooltip
                  text="Set your own ETH derivation path where * indicates the index of user accounts. e.g m/44'/60'/*'/0/0"
                  placement="top"
                  styles={{
                    fontFamily: 'monospace, arial, system-ui',
                    fontSize: '0.75em',
                    color: theme?.base?.font?.color || OFF_WHITE,
                    border: 'none',
                    backgroundColor: theme?.base?.background?.background || BLACK_TRANSPARENT
                  }}
                >
                  <InfoCircle label="?" size={15} color="black" marginLeft="3px" />
                </MouseoverTooltip>
              </AccountText>
              <HidModalTextInput
                type="text"
                value={isCustomPath ? path ?? '' : ''}
                placeholder={'m/TYPE/PATH/HERE'}
                minWidth={isCustomPath ? '300px' : 'unset'}
                fontWeight={isCustomPath ? 300 : 100}
                onChange={(e) => {
                  pathCallbacks.setIsCustomPath(true)
                  pathCallbacks.setPath(e.target.value)
                }}
              />
            </Column>
          </Row>
        </PathSelectAndInputContainer>
        {/* ADDRESSES TABLE / LIST */}
        <Column margin="1rem 0 0">
          <Row justifyContent="flex-start" gap="10px" style={{ zIndex: 1 }} title="derivation-path">
            <AccountText id="pstl-web3-modal-address-text" type="main">
              Scan and select an account
            </AccountText>
          </Row>
          <Row id={`${ModalId.ACCOUNT}__balance-text`}>
            <AccountText type="balance">Current Account:</AccountText>
            {address ? (
              <HighlightedAccountText
                fontWeight={500}
                color={setBestTextColour(theme?.hidDevice?.container?.main?.background?.background || '#000')}
              >
                {truncateAddress(address)}
              </HighlightedAccountText>
            ) : (
              <strong style={{ color: 'indianred', fontVariationSettings: "'wght' 500", marginLeft: 5 }}>
                DISCONNECTED
              </strong>
            )}
          </Row>
        </Column>
        <HidModalAddressesList width="100%" gap="0" margin="1rem 0" zIndex={errorOptions?.show ? 0 : 1}>
          <HidModalHeaderRow padding="0rem 0.25rem" marginBottom="0.25rem">
            <AccountText type="balance" as="strong">
              Address
            </AccountText>
            <AccountText type="balance" as="strong">
              Path
            </AccountText>
            <AccountText type="balance" as="strong">
              Balance
            </AccountText>
          </HidModalHeaderRow>
          {accountsAndBalances?.length ? (
            accountsAndBalances.map(({ address: acct, balance }, idx) => {
              const sPath = dbPath?.replace('*', idx.toString())
              return (
                <HidModalAddresseRow
                  key={idx + '_' + acct}
                  onClick={() => storeCallbacks.handleSelectAccount(sPath, idx)}
                  padding="0.15rem 0.25rem"
                >
                  <strong>{acct}</strong>
                  <strong>{sPath}</strong>
                  <strong>{balance || 0}</strong>
                </HidModalAddresseRow>
              )
            })
          ) : (
            <HidModalAddressPlaceholder padding="0.15rem 0.25rem">
              Click below to query accounts for this path
            </HidModalAddressPlaceholder>
          )}
        </HidModalAddressesList>
        {/* SHOW ACCOUNTS CTA */}
        <FooterActionButtonsRow
          marginTop={'1rem'}
          justifyContent={'space-evenly'}
          gap="2rem"
          style={{ zIndex: errorOptions?.show ? 0 : 1 }}
        >
          <AccountModalButton
            type="explorer"
            id={`${ModalId.ACCOUNT}__explorer-button`}
            connected={false}
            padding="0.6rem"
            onClick={storeCallbacks.getAccounts}
            disabled={loading}
            minWidth="max-content"
          >
            {loading ? (
              <>
                Fetching... <SpinnerCircle />
              </>
            ) : paginationIdx === PAGINATION_AMT ? (
              'Scan Accounts'
            ) : (
              'Load more'
            )}
          </AccountModalButton>
          {address && (
            <UnderlinedAccountCTA onClick={() => close()}>
              or skip and use current:&nbsp;
              <span style={{ fontVariationSettings: "'wght' 500" }}>{truncateAddress(address)}</span>
            </UnderlinedAccountCTA>
          )}
        </FooterActionButtonsRow>
      </HidModalContainer>
    </ModalColumnContainer>
  )
}

const SELECTOR_OPTIONS = [
  { value: SUPPORTED_BIP_DERIVATION_PATHS[0], label: 'Ledger Live - ' + SUPPORTED_BIP_DERIVATION_PATHS[0] },
  {
    value: SUPPORTED_BIP_DERIVATION_PATHS[1],
    label: 'Ledger Legacy - ' + SUPPORTED_BIP_DERIVATION_PATHS[1]
  },
  {
    value: SUPPORTED_BIP_DERIVATION_PATHS[2],
    label: 'BIP44 Standard - ' + SUPPORTED_BIP_DERIVATION_PATHS[2]
  }
]

export default memo(HidDeviceOptionsContent)