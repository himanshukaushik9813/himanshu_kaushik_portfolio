/**
 * Feature flags. RESUME_PUBLIC stays false until Himanshu approves a résumé
 * without a phone number (the current PDF contains one; see CONTENT.md §10).
 * While false, résumé CTAs are not rendered and the PDF is not shipped in public/.
 */
export const RESUME_PUBLIC = import.meta.env.VITE_RESUME_PUBLIC === 'true'
export const RESUME_PATH = '/resume/himanshu_resume.pdf'
export const GITHUB_HEATMAP_USER = 'himanshukaushik9813'
