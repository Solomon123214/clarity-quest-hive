import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Test quest creation",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const block = chain.mineBlock([
      Tx.contractCall('quest-hive', 'create-quest', 
        [types.ascii("Daily Exercise"), types.uint(100), types.uint(7)],
        deployer.address
      )
    ]);
    
    block.receipts[0].result.expectOk().expectUint(0);
    
    const quest = chain.callReadOnlyFn(
      'quest-hive',
      'get-quest',
      [types.uint(0)],
      deployer.address
    );
    
    quest.result.expectOk().expectSome();
  }
});

Clarinet.test({
  name: "Test quest completion",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const user1 = accounts.get('wallet_1')!;
    
    // Create quest
    let block = chain.mineBlock([
      Tx.contractCall('quest-hive', 'create-quest',
        [types.ascii("Daily Exercise"), types.uint(100), types.uint(7)],
        deployer.address
      )
    ]);
    
    // Complete quest
    block = chain.mineBlock([
      Tx.contractCall('quest-hive', 'complete-quest',
        [types.uint(0)],
        user1.address
      )
    ]);
    
    block.receipts[0].result.expectOk().expectBool(true);
    
    // Check completion status
    const status = chain.callReadOnlyFn(
      'quest-hive',
      'get-completion-status',
      [types.uint(0), types.principal(user1.address)],
      user1.address
    );
    
    status.result.expectOk().expectSome();
    
    // Check user stats
    const stats = chain.callReadOnlyFn(
      'quest-hive',
      'get-user-stats',
      [types.principal(user1.address)],
      user1.address
    );
    
    const userStats = stats.result.expectOk().expectSome();
    assertEquals(userStats['completed-quests'], types.uint(1));
    assertEquals(userStats['total-rewards'], types.uint(100));
  }
});

Clarinet.test({
  name: "Test double completion prevention",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const user1 = accounts.get('wallet_1')!;
    
    // Create and complete quest
    let block = chain.mineBlock([
      Tx.contractCall('quest-hive', 'create-quest',
        [types.ascii("Daily Exercise"), types.uint(100), types.uint(7)],
        deployer.address
      ),
      Tx.contractCall('quest-hive', 'complete-quest',
        [types.uint(0)],
        user1.address
      )
    ]);
    
    // Try to complete again
    block = chain.mineBlock([
      Tx.contractCall('quest-hive', 'complete-quest',
        [types.uint(0)],
        user1.address
      )
    ]);
    
    block.receipts[0].result.expectErr().expectUint(102); // err-already-completed
  }
});
