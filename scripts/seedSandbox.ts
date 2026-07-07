/**
 * scripts/seedSandbox.ts
 * ─────────────────────────────────────────────────────────────
 * Seeds the Nomba sandbox with realistic transaction history.
 *
 * Run with:
 *   npx tsx scripts/seedSandbox.ts
 *
 * What it does:
 *   1. Authenticates with the sandbox using your .env credentials
 *   2. Creates 2 virtual accounts (simulating customers paying in)
 *   3. Creates 12 checkout orders spread over the last 30 days
 *   4. The test card 5434 6210 7425 2808 is printed — use it to
 *      manually complete payments in the checkout page if needed
 *
 * Sandbox test card:
 *   Number: 5434 6210 7425 2808
 *   CVV:    Any 3 digits (e.g. 123)
 *   Expiry: Any future date (e.g. 12/26)
 *   PIN:    1234
 */

import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env') })

const SANDBOX_BASE = 'https://sandbox.api.nomba.com'

const CLIENT_ID     = process.env.VITE_NOMBA_CLIENT_ID     ?? ''
const CLIENT_SECRET = process.env.VITE_NOMBA_CLIENT_SECRET ?? ''
const ACCOUNT_ID    = process.env.VITE_NOMBA_ACCOUNT_ID    ?? ''

if (!CLIENT_ID || !CLIENT_SECRET || !ACCOUNT_ID ||
    CLIENT_ID === 'your_sandbox_client_id') {
  console.error('\n❌  Real .env credentials required to seed the sandbox.')
  console.error('   Add VITE_NOMBA_CLIENT_ID, VITE_NOMBA_CLIENT_SECRET, VITE_NOMBA_ACCOUNT_ID to .env\n')
  process.exit(1)
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

async function getToken(): Promise<string> {
  console.log('🔐  Authenticating with Nomba sandbox...')
  const res = await fetch(`${SANDBOX_BASE}/auth/token/issue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', accountId: ACCOUNT_ID },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  })
  const json = await res.json()
  if (json.code !== '00' || !json.data?.access_token) {
    console.error('❌  Auth failed:', json.description ?? json)
    process.exit(1)
  }
  console.log('✅  Authenticated')
  return json.data.access_token as string
}

function authHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    accountId: ACCOUNT_ID,
  }
}

// ─── Virtual accounts ─────────────────────────────────────────────────────────

async function createVirtualAccount(token: string, name: string, ref: string) {
  const res = await fetch(`${SANDBOX_BASE}/accounts/virtual`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ accountRef: ref, accountName: name }),
  })
  const json = await res.json()
  if (json.code !== '00') {
    console.warn(`⚠️  Could not create virtual account "${name}":`, json.description)
    return null
  }
  console.log(`  ✅  Virtual account: ${name} → ${json.data?.bankAccountNumber} (${json.data?.bankName})`)
  return json.data
}

// ─── Checkout orders ─────────────────────────────────────────────────────────

const TEST_CARD = '5434 6210 7425 2808'

const SEED_ORDERS = [
  { amount: 45000,  email: 'adaeze@test.ng',    ref: 'seed_001', daysAgo: 1  },
  { amount: 128000, email: 'chidi@test.ng',     ref: 'seed_002', daysAgo: 2  },
  { amount: 62500,  email: 'fatima@test.ng',    ref: 'seed_003', daysAgo: 3  },
  { amount: 95000,  email: 'emeka@test.ng',     ref: 'seed_004', daysAgo: 5  },
  { amount: 37000,  email: 'grace@test.ng',     ref: 'seed_005', daysAgo: 7  },
  { amount: 210000, email: 'adaeze@test.ng',    ref: 'seed_006', daysAgo: 9  },
  { amount: 78000,  email: 'ibrahim@test.ng',   ref: 'seed_007', daysAgo: 11 },
  { amount: 145000, email: 'chidi@test.ng',     ref: 'seed_008', daysAgo: 14 },
  { amount: 52000,  email: 'tunde@test.ng',     ref: 'seed_009', daysAgo: 17 },
  { amount: 88000,  email: 'ngozi@test.ng',     ref: 'seed_010', daysAgo: 20 },
  { amount: 175000, email: 'adaeze@test.ng',    ref: 'seed_011', daysAgo: 24 },
  { amount: 33000,  email: 'michael@test.ng',   ref: 'seed_012', daysAgo: 28 },
]

async function createOrder(
  token: string,
  order: typeof SEED_ORDERS[0],
) {
  const res = await fetch(`${SANDBOX_BASE}/checkout/order`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({
      order: {
        orderReference: order.ref,
        amount: String(order.amount),
        currency: 'NGN',
        customerEmail: order.email,
        callbackUrl: 'https://cashflowai.ng/callback',
      },
    }),
  })
  const json = await res.json()
  if (json.code !== '00') {
    console.warn(`  ⚠️  Order ${order.ref} failed:`, json.description)
    return null
  }
  const link = json.data?.checkoutLink ?? '—'
  console.log(`  ✅  Order ${order.ref} | ₦${order.amount.toLocaleString()} | ${order.email}`)
  console.log(`     Checkout link: ${link}`)
  return json.data
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🌱  CashFlow AI — Nomba Sandbox Seeder\n')
  console.log(`📡  Sandbox: ${SANDBOX_BASE}`)
  console.log(`💳  Test card: ${TEST_CARD}  |  CVV: 123  |  Expiry: 12/26  |  PIN: 1234\n`)

  const token = await getToken()

  // Create virtual accounts
  console.log('\n📂  Creating virtual accounts...')
  await createVirtualAccount(token, 'CashFlow Merchant Main',   `cashflow_main_${Date.now()}`)
  await createVirtualAccount(token, 'CashFlow Merchant Branch', `cashflow_branch_${Date.now()}`)

  // Create checkout orders
  console.log('\n🛒  Creating checkout orders...')
  for (const order of SEED_ORDERS) {
    await createOrder(token, order)
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 300))
  }

  console.log('\n✅  Seeding complete!')
  console.log('\nℹ️   To simulate successful payments:')
  console.log('    1. Open each checkout link in a browser')
  console.log(`    2. Use card: ${TEST_CARD}`)
  console.log('    3. CVV: 123  |  Expiry: 12/26  |  PIN: 1234')
  console.log('\n   Or just connect the dashboard — orders appear as PENDING transactions immediately.\n')
}

main().catch((err) => {
  console.error('\n❌  Seed script error:', err)
  process.exit(1)
})
