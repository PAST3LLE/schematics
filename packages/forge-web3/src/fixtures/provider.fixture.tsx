import { Web3Button } from '@web3modal/react'
import React from 'react'

import { ForgeW3Providers, useForgeUnpreparedClaimLockedSkill, useW3Connection, useW3Modal } from '..'
import { commonProps, contractProps } from './config'

/* 
    interface Web3ModalProps {
        appName: string
        web3Modal: Web3ModalConfig
        wagmiClient?: SkillForgeW3WagmiClientOptions
        ethereumClient?: EthereumClient
    }
*/

function InnerApp() {
  const { open } = useW3Modal()
  const [, , { address, balanceInfo }] = useW3Connection()

  const data = useForgeUnpreparedClaimLockedSkill({
    token: '0x1b18aC6D5371FeD52521964145E2c8aAF7571a88',
    id: BigInt(3000)
  })

  return (
    <div>
      <button onClick={() => open({ route: address ? 'Account' : 'ConnectWallet' }) as any}>
        Open Pstl Web3 Modal
      </button>
      <h1>{address || 'Disconnected'}</h1>
      <h1>{(balanceInfo.data?.formatted || 0) + ' ETH' || '0 ETH'}</h1>
      <button disabled={!data.writeAsync} onClick={() => data.writeAsync?.()}>
        Claim skill
      </button>
    </div>
  )
}

function App() {
  return (
    <ForgeW3Providers
      config={{
        ...contractProps,
        contactInfo: {
          email: 'some-fake-email@gmail.com'
        },
        contentUrls: {
          FAQ: 'https://faq.learnmoreabout.stuff.net'
        },
        name: commonProps.appName,
        web3: {
          chains: commonProps.chains,
          modals: {
            w3m: commonProps.modals.w3m,
            w3a: commonProps.modals.w3a
          }
        }
      }}
    >
      <InnerApp />
    </ForgeW3Providers>
  )
}

export default {
  default: (
    <ForgeW3Providers
      config={{
        ...contractProps,
        contactInfo: {
          email: 'some-fake-email@gmail.com'
        },
        contentUrls: {
          FAQ: 'https://faq.learnmoreabout.stuff.net'
        },
        name: commonProps.appName,
        web3: {
          chains: commonProps.chains,
          modals: {
            w3m: commonProps.modals.w3m,
            w3a: commonProps.modals.w3a
          }
        }
      }}
    >
      <h1>Default Web3Modal selections</h1>
      <Web3Button label="Click and select a wallet in the modal!" />
    </ForgeW3Providers>
  ),
  web3Auth: (
    <ForgeW3Providers
      config={{
        ...contractProps,
        contactInfo: {
          email: 'some-fake-email@gmail.com'
        },
        contentUrls: {
          FAQ: 'https://faq.learnmoreabout.stuff.net'
        },
        name: commonProps.appName,
        web3: {
          chains: commonProps.chains,
          modals: {
            w3m: commonProps.modals.w3m,
            w3a: commonProps.modals.w3a
          }
        }
      }}
    >
      <h1>Web3Auth in the Web3Modal</h1>
      <Web3Button label="Click and try selecting Web3Auth in the modal!" />
    </ForgeW3Providers>
  ),
  app: <App />
}
