// Full-length writing documents for the Writing Studio (Stage 7+).
// Only projects that have reached Stage 7 have one. Content is stored as
// paragraph arrays (not raw HTML) specifically so comment anchors can be
// simple, reliable character offsets into a single paragraph's plain
// text, rather than needing to parse arbitrary HTML ranges.

function anchor(paragraphText, substring) {
  const start = paragraphText.indexOf(substring)
  if (start === -1) {
    throw new Error(`Comment anchor text not found in paragraph: "${substring}"`)
  }
  return { startOffset: start, endOffset: start + substring.length, anchorText: substring }
}

function commentThread({ id, paraId, paragraphText, quote, author, authorType, body, date, replies = [], status = 'open' }) {
  return {
    id,
    paraId,
    ...anchor(paragraphText, quote),
    author,
    authorType, // 'supervisor' | 'researcher'
    body,
    date,
    status,
    replies,
  }
}

// ── Blessing Okoro — Stage 7, in progress ──────────────────────────────

const blessingCh1P1 = 'Maternal mortality in Nigeria remains among the highest globally, with rural primary care facilities accounting for a disproportionate share of preventable deaths. The World Health Organisation (2024) estimates that facility tier, more than geographic remoteness alone, predicts outcome variance across Sub-Saharan Africa.'
const blessingCh1P2 = 'This study focuses on Edo State, where the 2025 State Health Bulletin recorded a maternal mortality ratio of 512 per 100,000 live births in rural local government areas, more than double the national average. Despite a decade of infrastructure investment, outcomes at the primary care level have not improved proportionally.'
const blessingCh3P1 = 'This study adopts a stratified random sampling design across three facility tiers\u2014primary health centres, cottage hospitals, and general hospitals\u2014within Edo State\u2019s rural local government areas. Tier-based stratification was selected over simple random sampling because preliminary data from the 2025 State Health Bulletin indicate that outcome variance in maternal mortality ratios is more strongly associated with facility tier than with geographic zone alone.'
const blessingCh3P2 = 'A sample size of 42 facilities was calculated using Cochran\u2019s formula at a 95% confidence level, adjusted for the finite population of 118 registered rural facilities in the state. Facilities were selected using proportional allocation within each tier to preserve the tier distribution observed in the sampling frame.'
const blessingCh3dP1 = 'Data collection proceeded in two phases. Phase one involved structured chart review across all 42 sampled facilities, extracting delivery outcome records for the 2023\u20132025 period. Phase two consisted of semi-structured interviews with facility heads to contextualise anomalies identified during chart review.'

export const WRITING_DOCUMENTS = {
  'proj-2': [
    {
      key: 'ch1', title: 'Chapter One: Introduction', stageNumber: 7, status: 'approved',
      paragraphs: [blessingCh1P1, blessingCh1P2],
    },
    {
      key: 'ch3-design', title: '3.1 Research Design', stageNumber: 7, status: 'awaiting_review', submissionId: 'sub-2-7a',
      paragraphs: [blessingCh3P1, blessingCh3P2],
    },
    {
      key: 'ch3-collection', title: '3.2 Data Collection', stageNumber: 7, status: 'in_progress',
      paragraphs: [blessingCh3dP1],
    },
  ],
}

export const WRITING_COMMENTS = {
  'proj-2': [
    commentThread({
      id: 'wc-1', paraId: 'ch1-p0', paragraphText: blessingCh1P1,
      quote: 'facility tier, more than geographic remoteness alone, predicts outcome variance',
      author: 'Dr. Amara Chukwu', authorType: 'supervisor',
      body: 'This is the strongest claim in your introduction \u2014 make sure the WHO citation actually supports "more than," not just "also." Worth a direct quote check.',
      date: '2026-08-18',
      status: 'resolved',
      replies: [
        { id: 'wc-1-r1', author: 'Blessing Okoro', authorType: 'researcher', body: 'Checked \u2014 WHO (2024) p.34 says exactly this, comparing standardised coefficients. Added the page number to the footnote.', date: '2026-08-19' },
        { id: 'wc-1-r2', author: 'Dr. Amara Chukwu', authorType: 'supervisor', body: 'Good, that\u2019s solid now.', date: '2026-08-19' },
      ],
    }),
    commentThread({
      id: 'wc-2', paraId: 'ch3-design-p0', paragraphText: blessingCh3P1,
      quote: 'more strongly associated with facility tier than with geographic zone alone',
      author: 'Prof. Wale Fashina', authorType: 'supervisor',
      body: 'The justification for tier-based stratification needs a citation for the 2025 State Health Bulletin claim \u2014 right now it reads as an assertion.',
      date: '2026-08-20',
      status: 'resolved',
      replies: [
        { id: 'wc-2-r1', author: 'Blessing Okoro', authorType: 'researcher', body: 'Added the bulletin as a primary source and cited the specific table.', date: '2026-08-25' },
      ],
    }),
    commentThread({
      id: 'wc-3', paraId: 'ch3-design-p1', paragraphText: blessingCh3P2,
      quote: 'A sample size of 42 facilities was calculated using Cochran\u2019s formula',
      author: 'Dr. Amara Chukwu', authorType: 'supervisor',
      body: 'Show the actual calculation as a footnote or appendix reference \u2014 examiners will want to verify this, not just take the resulting number.',
      date: '2026-09-07',
      status: 'open',
      replies: [],
    }),
  ],
}

// ── Grace Nwankwo — Stage 8, fully written and approved ─────────────────

const graceCh1P1 = 'Mobile money adoption in Southern Nigeria has grown considerably since 2020, yet financial inclusion\u2014measured as sustained, active use rather than one-time registration\u2014has lagged adoption figures reported by network operators.'
const graceCh5P1 = 'This study finds that agent density within a five-kilometre radius is the single strongest predictor of sustained use, exceeding even income level and mobile literacy in the regression model. This finding has direct implications for the Central Bank\u2019s agent-banking expansion targets under the National Financial Inclusion Strategy.'

export const WRITING_DOCUMENTS_EXTRA = {
  'proj-4': [
    { key: 'ch1', title: 'Chapter One: Introduction', stageNumber: 7, status: 'approved', paragraphs: [graceCh1P1] },
    { key: 'ch5', title: 'Chapter Five: Conclusion', stageNumber: 7, status: 'approved', paragraphs: [graceCh5P1] },
  ],
}

export const WRITING_COMMENTS_EXTRA = {
  'proj-4': [
    commentThread({
      id: 'wc-4', paraId: 'ch5-p0', paragraphText: graceCh5P1,
      quote: 'agent density within a five-kilometre radius is the single strongest predictor',
      author: 'Dr. Amara Chukwu', authorType: 'supervisor',
      body: 'Strong finding \u2014 this should be the headline of your abstract, not buried in Chapter 5.',
      date: '2026-09-02',
      status: 'resolved',
      replies: [
        { id: 'wc-4-r1', author: 'Grace Nwankwo', authorType: 'researcher', body: 'Updated the abstract to lead with this.', date: '2026-09-02' },
      ],
    }),
  ],
}
