# DPP Frontend

Next.js dashboard for managing **Digital Product Passports (DPP)** powered by ERC-721 NFTs and SATP cross-chain interoperability. Communicates with the blockchain through the [Hyperledger Cacti DPP Plugin](https://github.com/edsonCVN/cacti-edson-fork/tree/dpp-plugin/packages/cactus-plugin-dpp) REST API.

## Architecture

```
┌──────────────────┐     ┌──────────────────────────────────┐
│  DPP Frontend    │────▶│    Cacti API Gateway (Chain 1)    │
│  Next.js :3000   │     │    Express :3002                  │
└──────────────────┘     └──┬──────────────────────────┬────┘
                             │                          │
                       Local ops                 /cross-chain-transfer
                             │                          │
                             ▼                          ▼
                  ┌──────────────────┐    ┌───────────────────────┐
                  │  Chain 1         │    │  SATP Hermes Gateway-1│
                  │  Hardhat :8545   │    │  Port 4010            │
                  └──────────────────┘    └───────────┬───────────┘
                                                      │ SATP protocol
                                                      ▼
                                         ┌───────────────────────┐
                                         │  SATP Hermes Gateway-2│
                                         │  Port 4110            │
                                         └───────────┬───────────┘
                                                     │
                                                     ▼
                                          ┌──────────────────┐
                                          │  Chain 2         │
                                          │  Hardhat :8546   │
                                          └──────────────────┘
                                                     ▲
                                                     │ reads
                                         ┌───────────┴──────────┐
                                         │ Cacti API (Chain 2)  │
                                         │ Express :3003        │
                                         └───────────┬──────────┘
                                                     │
                                         ┌───────────┴──────────┐
                                         │  DPP Frontend        │
                                         │  Next.js :3001       │
                                         └──────────────────────┘
```

The frontend never talks to the blockchain directly. All transactions go through the Cacti API Gateway, which uses role-aware signers. Cross-chain transfers are proxied from the API gateway to SATP Hermes gateway-1.

## Features

- **Role-Based Dashboard** — UI adapts to the active role (Farmer, Processor, Transporter, Retailer, Admin, Consumer)
- **DPP Minting** — Create new passports with structured metadata (origin, variety, calibre, certifications)
- **Batch Local Transfers** — Transfer one or more DPPs to another address on the same chain
- **Cross-Chain Transfers (SATP)** — Real SATP Hermes integration: lock on chain 1 → mint + assign on chain 2, with live progress and session ID display
- **DPP Aggregation** — Combine multiple DPPs into a lot with merged metadata and inherited history
- **Transport Tracking** — Record location, temperature, and condition data
- **Retail Updates** — Mark as received and update retail information
- **Passport Detail View** — Full lifecycle history, certifications, metadata, and packaging/recycling info
- **Settings** — Configure the API gateway URL at runtime

## Role Permissions

| Role | Address (Hardhat default) | Capabilities |
|------|--------------------------|-------------|
| Farmer | `0x70997970...dc79C8` | Mint new DPPs, transfer ownership |
| Processor | `0x3C44CdDd...293BC` | Aggregate DPPs into lots, add certifications, amend metadata |
| Transporter | `0x90F79bf6...b906` | Update transport data (GPS, temperature, conditions) |
| Retailer | `0x15d34AAf...A65` | Mark as received, update retail data |
| Admin | `0xf39Fd6e5...266` | All of the above + cross-chain SATP transfers |
| Consumer | `0x99655070...4dc` | Read-only (public storefront view) |

---

## Getting Started

### Option A — Local only (single chain, no SATP)

The minimal setup for developing and testing local DPP lifecycle operations.

```bash
# Terminal 1 — local blockchain
cd packages/cactus-plugin-dpp
npx hardhat node --port 8545

# Terminal 2 — deploy contract and start API gateway
npx ts-node --project tsconfig.hardhat.json scripts/launch-api.ts
```

```bash
# Terminal 3 — frontend
cd dpp-frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

### Option B — Full SATP mode (local + cross-chain)

Run all services so the frontend can do both local operations and real cross-chain transfers.

#### Step 1 — Start both Hardhat nodes

```bash
# Terminal 1
cd packages/cactus-plugin-dpp
npx hardhat node --port 8545

# Terminal 2
npx hardhat node --port 8546
```

#### Step 2 — Compile and deploy to both chains

```bash
# Terminal 3
cd packages/cactus-plugin-dpp
npx hardhat compile
node scripts/deploy-dpp.js
```

This deploys the contract on both chains, grants all roles (including BRIDGE_ROLE and supply-chain roles), mints demo DPP token #1001 on chain 1, and writes `gateway/deployed-addresses.json`.

#### Step 3 — Start the SATP Hermes Gateways

```bash
# Terminal 4
cd packages/cactus-plugin-dpp/gateway
docker compose up
```

Wait for both containers to print:
```
satp-hermes-gateway-1  | OAPI server listening on port 4010
satp-hermes-gateway-2  | OAPI server listening on port 4110
```

#### Step 4 — Start the API gateway

```bash
# Terminal 5
cd packages/cactus-plugin-dpp
npx ts-node --project tsconfig.hardhat.json scripts/launch-api.ts
```

Because `deployed-addresses.json` already exists, the API gateway connects to the **same** contracts the SATP gateways use — no redeployment.

#### Step 5 — Start the frontend

```bash
# Terminal 6
cd dpp-frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

### Dual-Frontend Demo (view both chains simultaneously)

After completing a cross-chain transfer you can verify the DPP arrived on chain 2 by running a second frontend instance that points to the chain-2 API.

**Terminal 6 — Chain 1 frontend (port 3000):**
```bash
cd dpp-frontend
npm run dev
```

**Terminal 7 — Chain 2 frontend (port 3001):**
```bash
cd dpp-frontend
NEXT_PUBLIC_CACTI_API_URL=http://127.0.0.1:3003 NEXT_DIST_DIR=.next-chain2 npm run dev -- -p 3001
```

`NEXT_DIST_DIR` gives each instance a separate build directory so they don't conflict on the `.next/dev/lock` file.

Open [http://localhost:3000](http://localhost:3000) for Chain 1 and [http://localhost:3001](http://localhost:3001) for Chain 2.

---

## Using the Cross-Chain Transfer

1. In the dashboard, go to the **Transfer** page
2. Select one or more DPPs (e.g. token #1001, which is pre-minted by `deploy-dpp.js`)
3. Click **Cross-Chain Transfer**
4. Select **Hardhat Chain 2 (Local EVM, port 8546)** as the destination
5. Optionally enter a recipient address (defaults to the chain-2 owner from `deploy-dpp.js`)
6. Click **Initialize Transfer**

The modal shows real-time progress:
- **Locking Asset** — calls `lock()` on chain 1, returns a SATP session ID
- **SATP Hermes — Phases 2 & 3** — polls the gateway every 2s until `mint()` + `assign()` complete on chain 2
- **Transfer Complete** — shows the session ID for auditing

If the transfer fails, the modal shows the error and a **Try Again** button.

> The SATP gateways (Step 3) must be running for cross-chain transfers to work. Local lifecycle operations (create, transport, receive, etc.) work without them.

---

## Environment Variables

Create a `.env.local` file to override the default API URL:

```env
NEXT_PUBLIC_CACTI_API_URL=http://127.0.0.1:3002
```

The API URL can also be changed at runtime from the **Settings** page.

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_CACTI_API_URL` | `http://127.0.0.1:3002` | Base URL of the Cacti DPP REST API |
| `NEXT_DIST_DIR` | `.next` | Next.js build output directory — set to a different path when running two instances simultaneously |

## Project Structure

```
dpp-frontend/
├── app/
│   ├── layout.tsx                   # Root layout with fonts and metadata
│   ├── page.tsx                     # Landing page
│   └── dashboard/
│       ├── layout.tsx               # Dashboard sidebar and navigation
│       ├── page.tsx                 # Dashboard overview (lists all DPPs)
│       ├── mint/page.tsx            # DPP minting form
│       ├── transfer/page.tsx        # Multi-select local and cross-chain transfer
│       ├── aggregate/page.tsx       # Aggregate DPPs into a lot
│       ├── roles/page.tsx           # Role information and address mapping
│       ├── settings/page.tsx        # API gateway URL configuration
│       └── passport/[id]/page.tsx   # Passport detail view
├── components/
│   ├── local-transfer-modal.tsx     # Batch local transfer modal
│   ├── transfer-modal.tsx           # Cross-chain (SATP) transfer modal with real API + polling
│   ├── product-card.tsx             # DPP card component
│   ├── role-action-panels.tsx       # Role-specific action panels
│   ├── packaging-recycling.tsx      # Circular economy info display
│   └── ui/                          # shadcn/ui components
├── contexts/
│   └── role-context.tsx             # Active role state and address mapping
└── lib/
    ├── api.ts                       # Axios client — all Cacti API calls including cross-chain
    └── utils.ts                     # Shared utilities
```

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **UI**: Tailwind CSS 4, shadcn/ui, Radix UI primitives
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: Sonner

## License

Apache-2.0
