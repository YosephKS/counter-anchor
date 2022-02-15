import * as anchor from '@project-serum/anchor';
import assert from "assert";
import { Program } from '@project-serum/anchor';
import { CounterAnchor } from '../target/types/counter_anchor';
const { SystemProgram } = anchor.web3;

describe('Counter Anchor Initialization', () => {
  const provider = anchor.Provider.env()
  anchor.setProvider(provider);
  const program = anchor.workspace.CounterAnchor as Program<CounterAnchor>;
  const counterAccount = anchor.web3.Keypair.generate();
  const U64_MAX = "18446744073709551615"

  it('should initialized!', async () => {
    await program.rpc.initialize({
      accounts: {
        counterAccount: counterAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [counterAccount],    
    });
  });

  it('should increment counts correctly (basic)', async () => {
    const INT = "1"
    await program.rpc.increase(new anchor.BN(INT), {
      accounts: {
        counterAccount: counterAccount.publicKey,
      },
    });

    const counter = await program.account.counter.fetch(counterAccount.publicKey);
    assert.ok(counter.count.toString() === INT);
  });

  it('should increment counts correctly (edge)', async () => {
    await program.rpc.increase(new anchor.BN(U64_MAX), {
      accounts: {
        counterAccount: counterAccount.publicKey,
      },
    });

    const counter = await program.account.counter.fetch(counterAccount.publicKey);
    assert.ok(counter.count.toString() === U64_MAX);
  });

  it('should decrement counts correctly (basic)', async () => {
    // Then, decrease the counter by `INT`
    await program.rpc.decrease(new anchor.BN(U64_MAX), {
      accounts: {
        counterAccount: counterAccount.publicKey,
      },
    });

    const counter = await program.account.counter.fetch(counterAccount.publicKey);
    assert.ok(counter.count.toString() === "0");
  });

  it('should decrement counts correctly (edge)', async () => {
    const INT = "1";
    // Then, decrease the counter by `INT`
    await program.rpc.decrease(new anchor.BN(INT), {
      accounts: {
        counterAccount: counterAccount.publicKey,
      },
    });

    const counter = await program.account.counter.fetch(counterAccount.publicKey);
    assert.ok(counter.count.toString() === "0");
  });
});