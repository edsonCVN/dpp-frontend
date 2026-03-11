# DPP Frontend

Next.js dashboard for managing **Digital Product Passports (DPP)** powered by ERC-721 NFTs and SATP cross-chain interoperability. Communicates with the blockchain through the [Hyperledger Cacti DPP Plugin](https://github.com/edsonCVN/cacti-edson-fork/tree/dpp-plugin/packages/cactus-plugin-dpp) REST API.

## Architecture

```
┌──────────────────┐     ┌──────────────────────┐     ┌──────────────────┐
│  DPP Frontend    │────▶│  Cacti API Gateway    │────▶│  EVM Blockchain  │
│  (Next.js :3000) │     │  (Express :3002)      │     │  (Anvil :8545)   │
└──────────────────┘     └──────────────────────┘     └──────────────────┘
```

The frontend does **not** interact directly with the blockchain. All transactions are dispatched through the Cacti API Gateway, which uses role-aware signers to submit on-chain transactions on behalf of the user.

## Features

- **Role-Based Dashboard** — UI adapts to the active role (Farmer, Processor, Transporter, Retailer, Admin)
- **DPP Minting** — Create new passports with structured metadata (origin, variety, calibre, certifications)
- **Multi-Select Batch Transfers** — Transfer one or more DPPs simultaneously, both locally and cross-chain
- **DPP Aggregation** — Combine multiple DPPs into a lot with merged metadata and inherited history
- **Transport Tracking** — Record location, temperature, and condition data
- **Retail Updates** — Mark as received and update retail information
- **Passport Detail View** — Full lifecycle history, certifications, metadata, and packaging/recycling info
- **Cross-Chain Transfers (SATP)** — Lock and transfer assets to other blockchains

## Role Permissions

| Role | Capabilities |
|------|-------------|
| Farmer | Mint new DPPs, transfer ownership |
| Processor | Aggregate DPPs into lots, add certifications, amend metadata |
| Transporter | Update transport data (GPS, temperature, conditions) |
| Retailer | Mark as received, update retail data |
| Admin | All of the above + cross-chain SATP operations |

## Getting Started

### Prerequisites

- Node.js >= 18
- [Anvil](https://book.getfoundry.sh/anvil/) running on `http://127.0.0.1:8545`
- [Cacti DPP API Gateway](https://github.com/edsonCVN/cacti-edson-fork/tree/dpp-plugin/packages/cactus-plugin-dpp) running on `http://127.0.0.1:3002`

### 1. Start the Backend

In separate terminals:

```bash
# Terminal 1: Start local blockchain
anvil

# Terminal 2: Deploy contract and start API gateway
cd path/to/cacti-edson-fork/packages/cactus-plugin-dpp
npx ts-node scripts/launch-api.ts
```

### 2. Start the Frontend

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file to override the default API URL:

```env
NEXT_PUBLIC_CACTI_API_URL=http://127.0.0.1:3002
```

## Project Structure

```
dpp-frontend/
├── app/
│   ├── layout.tsx                 # Root layout with fonts and metadata
│   ├── page.tsx                   # Landing page
│   └── dashboard/
│       ├── layout.tsx             # Dashboard sidebar and navigation
│       ├── page.tsx               # Dashboard overview
│       ├── mint/page.tsx          # DPP minting form
│       ├── transfer/page.tsx      # Multi-select transfer page
│       ├── aggregate/page.tsx     # DPP aggregation into lots
│       ├── roles/page.tsx         # Role management and info
│       └── passport/[id]/page.tsx # Passport detail view
├── components/
│   ├── local-transfer-modal.tsx   # Batch local transfer modal
│   ├── transfer-modal.tsx         # Batch cross-chain transfer modal
│   ├── product-card.tsx           # DPP card component
│   ├── role-action-panels.tsx     # Role-specific action panels
│   ├── packaging-recycling.tsx    # Circular economy info display
│   └── ui/                        # shadcn/ui components
├── contexts/
│   └── role-context.tsx           # Role state and address mapping
└── lib/
    └── api.ts                     # Axios client for Cacti API
```

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **UI**: Tailwind CSS 4, shadcn/ui, Radix UI primitives
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: Sonner

## License

Apache-2.0
