'use client';

import { ellipsify } from '@/lib/utils';
import { useWallet } from '@solana/wallet-adapter-react';
import { AppHero } from '../app-hero';
import { ExplorerLink } from '../cluster/cluster-ui';
import { WalletButton } from '../solana/solana-provider';
import { useVestingProgram } from './vesting-data-access';
import { VestingCreate, VestingList } from './vesting-ui';

export default function VestingFeature() {
  const { publicKey } = useWallet();
  const { programId } = useVestingProgram();

  return publicKey ? (
    <div>
      <AppHero title="Token Vesting" subtitle={'Create a new vesting account below.'}>
        <p className="mb-6">
          <ExplorerLink path={`account/${programId}`} label={ellipsify(programId.toString())} />
        </p>
        <VestingCreate />
      </AppHero>
      <VestingList />
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    </div>
  );
}
