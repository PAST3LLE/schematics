import { RowProps, Column } from '@past3lle/components'
import { BLACK_TRANSPARENT, setAnimation } from '@past3lle/theme'
import { truncateAddress } from '@past3lle/utils'
import { useWeb3Modal } from '@web3modal/react'
import { OpenOptions } from 'components/Button/Web3Button'
import { MonospaceText } from 'components/Text'
import React, { useCallback } from 'react'
import styled, { css } from 'styled-components/macro'
import { useAccount, useNetwork } from 'wagmi'

export function UserConnectionStats({ containerProps }: { containerProps?: RowProps }) {
  const { address } = useAccount()
  const { chain } = useNetwork()
  const { open } = useWeb3Modal()

  const handleClick = useCallback(
    async (openOptions: OpenOptions) => {
      open(openOptions)
    },
    [open]
  )

  return (
    <Column
      backgroundColor={BLACK_TRANSPARENT}
      padding="0.8rem 1rem"
      justifyContent="center"
      alignItems="flex-start"
      borderRadius="5px"
      {...containerProps}
    >
      <MonospaceText
        cursor="pointer"
        fontSize="1.5rem"
        title={address || 'disconnected'}
        color={'#f8f8ffed'}
        onClick={() => handleClick({ route: address ? 'Account' : 'ConnectWallet' })}
      >
        <ConnectionColorWrapper isConnected={!!address}>
          <FlashingText>{`> `}</FlashingText>
          <strong>CONNECTION</strong>{' '}
          <i>
            <small>{`${address ? truncateAddress(address) : '<disconnected>'}`}</small>
          </i>
        </ConnectionColorWrapper>
      </MonospaceText>
      <MonospaceText
        cursor="pointer"
        fontSize="1.5rem"
        color={'#f8f8ffed'}
        onClick={() => handleClick({ route: 'SelectNetwork' })}
      >
        <ConnectionColorWrapper isConnected={!!address}>
          <FlashingText>{`> `}</FlashingText>
          <strong>NETWORK</strong>{' '}
          <i>
            <small>{`${chain?.name || '<disconnected>'}`}</small>
          </i>
        </ConnectionColorWrapper>
      </MonospaceText>
    </Column>
  )
}

const flashingTextAnimation = css`
  @keyframes flashingText {
    0% {
      opacity: 0.5;
    }
    50% {
      opacity: 0;
    }
    100% {
      opacity: 0.5;
    }
  }
`

const FlashingText = styled.strong`
  ${setAnimation(flashingTextAnimation, { name: 'flashingText' as any, duration: 1.5, count: 'infinite' })}
`

const ConnectionColorWrapper = styled.div<{ isConnected: boolean }>`
  > ${FlashingText}, > i {
    color: ${({ isConnected }) => (isConnected ? 'springgreen' : 'indianred')};
  }
`