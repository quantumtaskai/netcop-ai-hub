#!/usr/bin/env node

// Simple script to test database structure
const https = require('https');

console.log('🔍 Checking database structure...');
console.log('Endpoint: https://netcop.netlify.app/api/db/direct-check');
console.log('');

https.get('https://netcop.netlify.app/api/db/direct-check', (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      
      console.log('=== DATABASE STRUCTURE CHECK ===');
      console.log('');
      
      if (result.success) {
        const { summary, recommendations } = result;
        
        console.log('📊 SUMMARY:');
        console.log(`Users table exists: ${summary.usersTableExists ? '✅' : '❌'}`);
        console.log(`Wallet transactions exists: ${summary.walletTransactionsExists ? '✅' : '❌'}`);
        console.log(`Has wallet_balance column: ${summary.hasWalletBalance ? '✅' : '❌'}`);
        console.log(`Has credits column: ${summary.hasCredits ? '✅' : '❌'}`);
        console.log(`Users columns: [${summary.usersColumns.join(', ')}]`);
        console.log('');
        
        console.log('🎯 RECOMMENDATIONS:');
        console.log(`Needs wallet_balance: ${recommendations.needsWalletBalance ? '⚠️ YES' : '✅ NO'}`);
        console.log(`Needs wallet_transactions: ${recommendations.needsWalletTransactions ? '⚠️ YES' : '✅ NO'}`);
        console.log(`Can migrate from credits: ${recommendations.canMigrate ? '✅ YES' : '❌ NO'}`);
        console.log(`Ready for wallet system: ${recommendations.readyForWallet ? '✅ YES' : '❌ NO'}`);
        console.log('');
        
        if (!recommendations.readyForWallet) {
          console.log('🛠️ ACTIONS NEEDED:');
          
          if (recommendations.needsWalletBalance) {
            console.log('1. Add wallet_balance column to users table');
          }
          
          if (recommendations.needsWalletTransactions) {
            console.log('2. Create wallet_transactions table');
          }
          
          if (recommendations.canMigrate) {
            console.log('3. Migrate existing credits to wallet_balance');
          }
        } else {
          console.log('🎉 Database is ready for wallet system!');
        }
        
      } else {
        console.log('❌ Database check failed:');
        console.log(result.error);
        console.log(result.message);
      }
      
    } catch (error) {
      console.log('❌ Failed to parse response:');
      console.log(data);
    }
  });
  
}).on('error', (error) => {
  console.log('❌ Request failed:');
  console.log(error.message);
});