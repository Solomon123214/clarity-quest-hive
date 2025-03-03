import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Test quest creation with valid duration",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const block = chain.mineBlock([
      Tx.contractCall('quest-hive', 'create-quest', 
        [types.ascii("Daily Exercise"), types.uint(100), types.uint(7)],
        deployer.address
      )
    ]);
    
    block.receipts[0].result.expectOk().expectUint(0);
  }
});

Clarinet.test({
  name: "Test quest creation with invalid duration",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const block = chain.mineBlock([
      Tx.contractCall('quest-hive', 'create-quest', 
        [types.ascii("Daily Exercise"), types.uint(100), types.uint(31)],
        deployer.address
      )
    ]);
    
    block.receipts[0].result.expectErr().expectUint(103);
  }
});

// Original test cases remain unchanged...
