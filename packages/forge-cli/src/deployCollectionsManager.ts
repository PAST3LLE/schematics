import { CollectionsManager__factory as CollectionsManager } from '@past3lle/skilltree-contracts'
import dotEnv from 'dotenv'
import { ethers } from 'ethers'
import inquirer from 'inquirer'

import { getConfig } from './utils/getConfig'
import { getWalletInfo } from './utils/getWalletInfo'
import { writeNetworks } from './utils/writeNetworks'

dotEnv.config()

async function deployCollectionsManager(): Promise<void> {
  const { networks: networksMap, mnemonic: configMnemonic } = await getConfig()

  if (!networksMap) {
    throw new Error(
      '[Forge-CLI] No networks map detected. Check script signature if passing via function call otherwise .env NETWORKS_URL_MAP'
    )
  }
  // Prompt for user input
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'network',
      message: 'Select a network',
      choices: Object.keys(networksMap).map((network) => ({ name: network, value: network }))
    },
    {
      type: 'password',
      name: 'mnemonic',
      message: 'Enter mnemonic phrase or leave empty if you want to use the forge.config value:'
    },
    {
      type: 'input',
      name: 'metadataUri',
      message: `
      Enter your CollectionsManager base metadata uri
      e.g ipfs://someHash/ or https://s3.somebucket.url.thing.com/collections/
      
      This URL must point to a FOLDER containing each collection(s) metadata information.
      It MUST also end with a trailing slash, like in the examples above.
      `,
      validate(input) {
        if (typeof input === 'string' && input.length > 0 && input.endsWith('/')) {
          return true
        }

        throw Error('Please provide a valid metadata uri.')
      }
    }
  ])

  const {
    network,
    mnemonic: cliMnemonic,
    metadataUri
  }: { network: string; mnemonic: string | undefined; metadataUri: string } = answers

  const mnemonic: string | undefined = cliMnemonic || configMnemonic
  if (!mnemonic) throw new Error('[Forge-CLI] Please set your MNEMONIC correctly in forge.config or in the CLI prompt')

  const rpcUrl = networksMap?.[network].rpcUrl
  if (!rpcUrl)
    throw new Error(
      '[Forge-CLI] No rpcUrl found for network ' +
        network +
        ". Please check the network's forge.config.js rpcUrl value."
    )

  const { wallet, provider } = getWalletInfo({ rpcUrl, mnemonic })

  // Create a contract factory
  const factory = new ethers.ContractFactory(CollectionsManager.abi, CollectionsManager.bytecode, wallet)

  const constructorArgs = [metadataUri]

  // Deploy the contract
  const contract = await factory.deploy(...constructorArgs)

  // Wait for the deployment transaction to be mined
  await contract.deployed()
  console.log('[Forge-CLI] CollectionsManager.sol deployed at address:', contract.address)

  await writeNetworks({
    // SOL contract name
    contract: 'CollectionsManager',
    // deployed contract addr
    newAddress: contract.address,
    // deployed txHash
    transactionHash: contract.deployTransaction.hash,
    chainId: provider.network.chainId,
    // network string name (e.g mumbai)
    network: provider.network.name
  })
}

export default async () =>
  deployCollectionsManager()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })