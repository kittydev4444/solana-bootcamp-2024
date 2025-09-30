import {
  findMetadataPda,
  mplTokenMetadata,
  verifyCollectionV1,
} from '@metaplex-foundation/mpl-token-metadata'
import { keypairIdentity, publicKey } from '@metaplex-foundation/umi'
import {
  airdropIfRequired,
  getExplorerLink,
  getKeypairFromFile,
} from '@solana-developers/helpers'

import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'

import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { COLLECTION_ADDRESS, NFT_ADDRESS } from './constant'

const connection = new Connection(clusterApiUrl('devnet'))

const user = await getKeypairFromFile()

await airdropIfRequired(
  connection,
  user.publicKey,
  1 * LAMPORTS_PER_SOL,
  0.5 * LAMPORTS_PER_SOL
)

console.log('Loaded user : ', user.publicKey.toBase58())

const umi = createUmi(connection.rpcEndpoint)

umi.use(mplTokenMetadata())

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey)
umi.use(keypairIdentity(umiUser))

console.log('Set up Umi instance for user')

const collectionAddress = publicKey(COLLECTION_ADDRESS)

console.log(`Creating NFT...`)

const nftAddress = publicKey(NFT_ADDRESS)

const transaction = await verifyCollectionV1(umi, {
  metadata: findMetadataPda(umi, { mint: nftAddress }),
  collectionMint: collectionAddress,
  authority: umi.identity,
})

transaction.sendAndConfirm(umi)

console.log(
  `✅ NFT ${nftAddress} verified as member of collection ${collectionAddress}! See Explorer at ${getExplorerLink(
    'address',
    nftAddress,
    'devnet'
  )}`
)
