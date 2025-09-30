'use client';

import { Button } from '@/components/ui/button';
import { ellipsify } from '@/lib/utils';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useMemo, useState } from 'react';
import { ExplorerLink } from '../cluster/cluster-ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { useVestingProgram, useVestingProgramAccount } from './vesting-data-access';

export function VestingCreate() {
  const { createVestingAccount } = useVestingProgram();
  const [company, setCompany] = useState('');
  const [mint, setMint] = useState('');

  const { publicKey } = useWallet();

  const isFormValid = company.length > 0 && mint.length > 0;

  const handleSubmit = () => {
    if (publicKey && isFormValid) {
      createVestingAccount.mutateAsync({ companyName: company, mint: mint });
    }
  };

  if (!publicKey) {
    return <p>Connect your wallet</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Input type="text" placeholder="Company name" value={company} onChange={(e) => setCompany(e.target.value)} />
        <Input type="text" placeholder="Mint" value={mint} onChange={(e) => setMint(e.target.value)} />
      </div>
      <Button onClick={handleSubmit} disabled={createVestingAccount.isPending || !isFormValid}>
        Create New Vesting Account {createVestingAccount.isPending && '...'}
      </Button>
    </div>
  );
}

export function VestingList() {
  const { accounts, getProgramAccount } = useVestingProgram();

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
      </div>
    );
  }
  return (
    <div className={'space-y-6'}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account) => (
            <VestingCard key={account.publicKey.toString()} account={account.publicKey} />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl'}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  );
}

function VestingCard({ account }: { account: PublicKey }) {
  const { accountQuery, createEmployeeVesting } = useVestingProgramAccount({
    account,
  });
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [cliffTime, setCliffTime] = useState(0);
  const [beneficiary, setBeneficiary] = useState('');

  const companyName = useMemo(() => accountQuery.data?.companyName ?? '', [accountQuery.data?.companyName]);

  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <Card>
      <CardHeader>
        <CardTitle>{companyName}</CardTitle>
        <CardDescription>
          Account: <ExplorerLink path={`account/${account}`} label={ellipsify(account.toString())} />
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex gap-4">
          <Input
            type="text"
            placeholder="Start time"
            value={startTime || ''}
            onChange={(e) => setStartTime(parseInt(e.target.value))}
            className="w-full"
          />
          <Input
            type="text"
            placeholder="End time"
            value={endTime || ''}
            onChange={(e) => setEndTime(parseInt(e.target.value))}
          />
          <Input
            type="text"
            placeholder="Total Allocation"
            value={totalAmount || ''}
            onChange={(e) => setTotalAmount(parseInt(e.target.value))}
          />
          <Input
            type="text"
            placeholder="Cliff time"
            value={cliffTime || ''}
            onChange={(e) => setCliffTime(parseInt(e.target.value))}
          />
          <Input
            type="text"
            placeholder="Beneficiary Wallet Address"
            value={beneficiary}
            onChange={(e) => setBeneficiary(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          onClick={() =>
            createEmployeeVesting.mutateAsync({
              startTime,
              endTime,
              totalAmount,
              cliffTime,
              beneficiary,
            })
          }
          disabled={
            createEmployeeVesting.isPending || !startTime || !endTime || !totalAmount || !cliffTime || !beneficiary
          }
        >
          Create Employee Vesting Account
        </Button>
      </CardContent>
    </Card>
  );
}
