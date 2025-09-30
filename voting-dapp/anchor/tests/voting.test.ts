import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { BankrunProvider, startAnchor } from 'anchor-bankrun';
import IDL from '../target/idl/voting.json';
import { Voting } from '../target/types/voting';

// Add this import for ProgramTestContext from anchor-bankrun

const votingAddress = new PublicKey('6q3nUFFbZRadE1Dy28jkQn3yNMxagaLRZ2EWq8u3TP58');

describe('Voting', () => {
  let context;
  let provider: BankrunProvider;
  let votingProgram: Program<Voting>;
  // anchor.setProvider(anchor.AnchorProvider.env());
  // let votingProgram = anchor.workspace.Voting as Program<Voting>;

  beforeAll(async () => {
    context = await startAnchor('', [{ name: 'voting', programId: votingAddress }], []);
    provider = new BankrunProvider(context);
    votingProgram = new Program<Voting>(IDL, provider);
  });
  it('Initialize Poll', async () => {
    await votingProgram.methods
      .initializePoll(
        new anchor.BN(1), // u64 in typescript is BN
        'What is your favorite type of peanut butter?',
        new anchor.BN(0),
        new anchor.BN(1857333927), // Unix timestamp
      )
      .rpc();

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8)],
      votingAddress,
    );

    const poll = await votingProgram.account.poll.fetch(pollAddress);

    console.log('Poll: ', poll);

    expect(poll.pollId.toNumber()).toEqual(1);
    expect(poll.description).toEqual('What is your favorite type of peanut butter?');
    expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber());
  });

  it('Initialize Candidate', async () => {
    await votingProgram.methods.initializeCandidate('Smooth', new anchor.BN(1)).rpc();
    await votingProgram.methods.initializeCandidate('Crunchy', new anchor.BN(1)).rpc();

    const [smoothAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from('Smooth')],
      votingAddress,
    );
    const smoothCandidate = await votingProgram.account.candidate.fetch(smoothAddress);
    console.log('Smooth Candidate: ', smoothCandidate);
    expect(smoothCandidate.candidateName).toEqual('Smooth');
    expect(smoothCandidate.candidateVotes.toNumber()).toEqual(0);

    const [crunchyAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from('Crunchy')],
      votingAddress,
    );
    const crunchyCandidate = await votingProgram.account.candidate.fetch(crunchyAddress);
    console.log('Crunchy Candidate: ', crunchyCandidate);
    expect(crunchyCandidate.candidateName).toEqual('Crunchy');
    expect(crunchyCandidate.candidateVotes.toNumber()).toEqual(0);
  });

  it('Vote', async () => {
    await votingProgram.methods.vote('Smooth', new anchor.BN(1)).rpc();
    const [smoothAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from('Smooth')],
      votingAddress,
    );
    const smoothCandidate = await votingProgram.account.candidate.fetch(smoothAddress);
    console.log('Smooth Candidate: ', smoothCandidate);
    expect(smoothCandidate.candidateName).toEqual('Smooth');
    expect(smoothCandidate.candidateVotes.toNumber()).toEqual(1);
  });
});
