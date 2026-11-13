import type { SkillGroup } from '@/types/content'

/**
 * Skills exactly as listed in Himanshu's latest résumé ("Technical Skills"), grouped by the résumé's
 * four headings. Sub-groups only organise the same items for the accordion panel: no additions.
 */
export const skills: SkillGroup[] = [
  {
    title: 'Languages',
    subgroups: [{ title: 'Languages', items: ['TypeScript', 'JavaScript', 'Python', 'Solidity', 'Rust', 'SQL', 'HTML/CSS'] }],
  },
  {
    title: 'Backend & Cloud',
    subgroups: [
      { title: 'Frameworks', items: ['Next.js', 'React', 'Node.js', 'Express', 'FastAPI', 'Flask'] },
      { title: 'APIs & data', items: ['REST APIs', 'Supabase (Postgres)', 'MongoDB'] },
      { title: 'Interface & 3D', items: ['Tailwind CSS', 'Three.js'] },
      { title: 'Deploy & tooling', items: ['Vercel', 'Railway', 'Render', 'Git'] },
    ],
  },
  {
    title: 'Blockchain & ZK',
    subgroups: [
      { title: 'Chains', items: ['EVM (Arbitrum, Sepolia)', 'Stellar Soroban'] },
      { title: 'DeFi protocols', items: ['Aave V3', 'Radiant'] },
      { title: 'Contract tooling', items: ['Foundry', 'Hardhat', 'OpenZeppelin'] },
      { title: 'Zero-knowledge', items: ['Circom', 'snarkjs', 'Groth16'] },
    ],
  },
  {
    title: 'AI & Data',
    subgroups: [
      { title: 'Machine learning', items: ['XGBoost', 'Scikit-learn', 'Surprise'] },
      { title: 'Data', items: ['Pandas', 'NumPy', 'Matplotlib'] },
      { title: 'Computer vision', items: ['OpenCV'] },
    ],
  },
]
