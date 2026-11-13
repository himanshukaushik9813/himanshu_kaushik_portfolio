import type { Project } from '@/types/content'

/** Verbatim from CONTENT.md §3–4 and résumé cross-check (§0). Order = gallery order. */
export const projects: Project[] = [
  {
    id: 'trace',
    published: false, // CONTENT.md §4: hidden until Himanshu verifies details
    featured: true,
    title: 'TRACE',
    category: 'On-chain Strategy Intelligence',
    summary:
      'An AI-powered DeFi research platform designed to reverse-engineer liquidity management strategies.',
    work: [],
    stack: [],
    links: [],
    offline: false,
    accentSlot: 4,
    detailShape: 'ring',
  },
  {
    id: 'yieldmaze',
    published: true,
    featured: true,
    title: 'YieldMaze',
    category: 'Arbitrum DeFi Risk & Yield Platform',
    badge: '1st Place · GDG NMIT CodeSprint 2026',
    summary:
      'A non-custodial DeFi platform across Aave V3 and Radiant, executing leverage-loop strategies through a vault contract deployed on Arbitrum One.',
    work: [
      'Built a non-custodial DeFi platform supporting Aave V3 and Radiant.',
      'Implemented leverage-loop strategies through an Arbitrum One vault contract.',
      'Built an always-on Telegram bot with 19 commands and 4 background workers.',
      'Implemented a 24/7 liquidation monitor based on per-user health-factor thresholds.',
      'Built a historical PnL indexer.',
      'Integrated CoinPaprika price alerts.',
      'Developed a yield-automation worker combining health factor and APY spread.',
      'Implemented Telegram account linking to wallets using signed-message recovery.',
      'Persisted users, alerts, activity events and daily PnL in Supabase.',
      'Connected the data to a live alert feed and health/PnL charts in a Next.js dashboard.',
    ],
    stack: [
      { name: 'TypeScript', icon: 'typescript' },
      { name: 'Solidity', icon: 'solidity' },
      { name: 'Arbitrum', icon: 'arbitrum' },
      { name: 'Aave V3', icon: 'aave' },
      { name: 'Radiant' },
      { name: 'Supabase', icon: 'supabase' },
      { name: 'Next.js', icon: 'nextdotjs' },
      { name: 'Telegram Bot', icon: 'telegram' },
    ],
    links: [
      { kind: 'code', label: 'Code', href: 'https://github.com/SCARPxVeNOM/yieldmaze' },
      { kind: 'live', label: 'Live', href: 'https://yieldmaze.vercel.app' },
      {
        kind: 'contract',
        label: 'Contract',
        href: 'https://arbiscan.io/address/0xEEcC6bAD9d400E1E4391C68bA9385E8AA9Face6B',
      },
    ],
    offline: false,
    accentSlot: 1,
    detailShape: 'grid',
  },
  {
    id: 'zeropath',
    published: true,
    featured: true,
    title: 'ZeroPath',
    category: 'Private Cross-Chain Bridge — Ethereum to Stellar',
    summary:
      'A zero-knowledge bridge that settles Sepolia ETH deposits as payouts on Stellar testnet without linking the deposit to the recipient.',
    work: [
      'Built a privacy-preserving cross-chain bridge.',
      'Implemented Groth16 BN254 proof verification natively in a Rust Soroban contract using CAP-0074 pairing_check.',
      'Developed Circom circuits with Poseidon commitments, nullifiers and depth-32 Merkle membership.',
      'Implemented browser-based proof generation using snarkjs in approximately 10–15 seconds.',
      'Built a Solidity escrow with a one-hour refund path that blocks refunds once settled.',
      'Developed a TypeScript relayer with Merkle trees, an intent registry and 15-second escrow polling.',
      'Built an SDK and Next.js frontend.',
      'Covered implementation with 13 Rust tests and 6 Foundry tests.',
    ],
    extraFacts: [
      'Relayer deployed on Railway.',
      'Settlements verified end to end on Stellar testnet.',
    ],
    stack: [
      { name: 'Next.js', icon: 'nextdotjs' },
      { name: 'TypeScript', icon: 'typescript' },
      { name: 'Solidity', icon: 'solidity' },
      { name: 'Rust', icon: 'rust' },
      { name: 'Stellar Soroban', icon: 'stellar' },
      { name: 'Circom' },
      { name: 'snarkjs' },
      { name: 'Groth16' },
      { name: 'Foundry' },
    ],
    links: [
      { kind: 'code', label: 'Code', href: 'https://github.com/himanshukaushik9813/zeropath' },
      { kind: 'live', label: 'Live', href: 'https://frontend-blush-five-75.vercel.app' },
    ],
    offline: false,
    accentSlot: 2,
    detailShape: 'ring',
  },
  {
    id: 'aviation',
    published: true,
    featured: true,
    title: 'Aviation Disruption Intelligence Platform',
    category: 'AI / Machine Learning / Full-Stack Application',
    summary:
      'An aviation intelligence platform that predicts flight-route disruption risks using machine learning and presents results through an interactive dashboard with a 3D globe and risk timelines.',
    work: [
      'Trained an XGBoost classifier to score route disruption risk.',
      'Used carrier, geopolitical, airspace and temporal features.',
      'Served predictions through FastAPI.',
      'Achieved 50–100 ms prediction serving latency.',
      'Built a Next.js dashboard featuring a 3D globe and risk timelines.',
    ],
    stack: [
      { name: 'Next.js', icon: 'nextdotjs' },
      { name: 'FastAPI', icon: 'fastapi' },
      { name: 'Python', icon: 'python' },
      { name: 'XGBoost' },
      { name: 'Three.js', icon: 'threedotjs' },
      { name: 'Pandas', icon: 'pandas' },
      { name: 'Scikit-learn', icon: 'scikitlearn' },
    ],
    links: [
      {
        kind: 'code',
        label: 'Code',
        href: 'https://github.com/himanshukaushik9813/aviation-intelligence',
      },
    ],
    offline: true,
    accentSlot: 3,
    detailShape: 'crescent',
  },
]

export const publishedProjects = projects.filter((p) => p.published)
export const featuredProjects = publishedProjects.filter((p) => p.featured)
