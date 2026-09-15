import { STATUS } from './stages'

// The logged-in supervisor viewing this demo.
export const CURRENT_SUPERVISOR = {
  id: 'sup-1',
  name: 'Dr. Amara Chukwu',
  email: 'a.chukwu@babcock.edu.ng',
  origin: 'institution',
}

// A second supervisor used to demonstrate the "any one approval is enough"
// rule and the institution/invited distinction.
const OTHER_SUPERVISORS = {
  'sup-2': { id: 'sup-2', name: 'Prof. Wale Fashina', origin: 'institution' },
  'sup-3': { id: 'sup-3', name: 'Dr. Helen Osei (external)', origin: 'invited' },
}

function historyItem(overrides) {
  return {
    id: overrides.id,
    type: overrides.type, // 'approve' | 'question' | 'revision'
    supervisorId: overrides.supervisorId,
    supervisorName: overrides.supervisorName,
    comment: overrides.comment,
    date: overrides.date,
    response: overrides.response ?? null,
    responseDate: overrides.responseDate ?? null,
    feedbackStatus: overrides.feedbackStatus ?? 'open', // open | responded | resolved
  }
}

// ── Project 1 — matches the spec's own worked example ──────────────────
const johnAde = {
  id: 'proj-1',
  researcher: { id: 'res-1', name: 'John Ade', email: 'john.ade@babcock.edu.ng' },
  title: 'AI Adoption in Nigerian Universities',
  discipline: 'Education Technology',
  level: 'Master\u2019s',
  supervisors: [CURRENT_SUPERVISOR],
  currentStage: 4,
  lastActivity: '2026-08-30',
  stageStatuses: {
    1: STATUS.APPROVED, 2: STATUS.APPROVED, 3: STATUS.AWAITING_REVIEW,
    4: STATUS.IN_PROGRESS, 5: STATUS.NOT_STARTED, 6: STATUS.NOT_STARTED,
    7: STATUS.NOT_STARTED, 8: STATUS.NOT_STARTED,
  },
  submissions: [
    {
      id: 'sub-1-1', stageNumber: 1, sectionLabel: null, status: STATUS.APPROVED,
      submittedAt: '2026-06-02',
      researcherNote: 'I chose this topic after noticing three of my own lecturers still print every slide despite the university\u2019s LMS rollout — I wanted to understand why adoption lags even where the tools exist.',
      content: {
        title: 'AI Adoption in Nigerian Universities: Barriers to Faculty Uptake of Learning Management Systems',
        problem: 'Despite significant LMS investment across Nigerian federal universities since 2019, faculty usage rates remain below 30% (NUC, 2025). The reasons for this gap are underexplored.',
        context: 'Focus on three federal universities in South-West Nigeria with LMS platforms active for at least three years.',
        contribution: 'A framework for university IT units to target adoption interventions by identified barrier type, rather than blanket training.',
      },
      history: [
        historyItem({ id: 'h-1', type: 'question', supervisorId: 'sup-1', supervisorName: 'Dr. Amara Chukwu', comment: 'Why three years as the cutoff for platform maturity — what happens to your sample if you use two?', date: '2026-06-03', response: 'Two years still shows a training effect in the pilot data I reviewed; three years is where usage plateaus, so it isolates adoption from a novelty dip.', responseDate: '2026-06-04', feedbackStatus: 'resolved' }),
        historyItem({ id: 'h-2', type: 'approve', supervisorId: 'sup-1', supervisorName: 'Dr. Amara Chukwu', comment: 'Good, clearly scoped. Proceed.', date: '2026-06-05', feedbackStatus: 'resolved' }),
      ],
    },
    {
      id: 'sub-1-2', stageNumber: 2, sectionLabel: null, status: STATUS.APPROVED,
      submittedAt: '2026-06-20',
      researcherNote: 'Objectives now map 1:1 to the three research questions per your last comment.',
      content: {
        problem: 'Faculty at LMS-mature institutions underuse core features despite adequate infrastructure and training exposure.',
        aim: 'To identify and rank the barriers preventing routine LMS use among faculty at LMS-mature Nigerian universities.',
        objectives: ['Identify categories of non-use (skill, attitude, workload, institutional).', 'Measure relative weight of each category across departments.', 'Propose a targeted intervention model.'],
        questions: ['What non-use categories do faculty report?', 'Which category predicts non-use most strongly?', 'What intervention model follows from the weighting?'],
        methodology: 'Mixed methods — survey (n\u2248220) followed by 15 semi-structured interviews with low-usage faculty.',
      },
      history: [
        historyItem({ id: 'h-3', type: 'approve', supervisorId: 'sup-1', supervisorName: 'Dr. Amara Chukwu', comment: '', date: '2026-06-22', feedbackStatus: 'resolved' }),
      ],
    },
    {
      id: 'sub-1-3', stageNumber: 3, sectionLabel: null, status: STATUS.AWAITING_REVIEW,
      submittedAt: '2026-08-28',
      researcherNote: 'Followed the Babcock School of Education template. Chapter 4 is split into 4.1 Quantitative and 4.2 Qualitative to match the mixed-methods design — let me know if that should instead be two separate chapters.',
      content: {
        template: 'Babcock University School of Education — Standard Thesis Template (2024)',
        toc: [
          'CHAPTER ONE: INTRODUCTION',
          '  1.1 Background to the Study', '  1.2 Statement of the Problem', '1.3 Aim and Objectives', '1.4 Research Questions', '1.5 Significance', '1.6 Scope', '1.7 Definition of Terms',
          'CHAPTER TWO: LITERATURE REVIEW',
          '  2.1 Conceptual Review', '2.2 Theoretical Framework', '2.3 Empirical Review', '2.4 Summary and Gap',
          'CHAPTER THREE: METHODOLOGY',
          '  3.1 Research Design', '3.2 Population and Sample', '3.3 Instrumentation', '3.4 Data Collection', '3.5 Data Analysis',
          'CHAPTER FOUR: RESULTS',
          '  4.1 Quantitative Findings', '4.2 Qualitative Findings', '4.3 Discussion',
          'CHAPTER FIVE: SUMMARY, CONCLUSION AND RECOMMENDATIONS',
        ],
      },
      history: [],
    },
    {
      id: 'sub-1-4', stageNumber: 4, sectionLabel: null, status: STATUS.IN_PROGRESS,
      submittedAt: null, researcherNote: null,
      content: {
        totalSources: 34, verified: 21, awaitingVerification: 9, problems: 4,
        sources: [
          { author: 'Adeyemi, T. & Bello, K.', year: 2024, title: 'LMS Fatigue Among Nigerian Faculty: A Diagnostic Study', doi: '10.1080/nje.2024.0091', status: 'verified', relevance: 'Primary source for the non-use taxonomy used in Ch. 2.' },
          { author: 'Okonkwo, R.', year: 2019, title: 'Digital Pedagogy in West Africa', doi: null, status: 'problem', relevance: 'Publisher could not be confirmed — flagged for researcher to re-check.' },
        ],
      },
      history: [],
    },
  ],
}

// ── Project 2 — mid-writing stage, one section awaiting ────────────────
const blessingOkoro = {
  id: 'proj-2',
  researcher: { id: 'res-2', name: 'Blessing Okoro', email: 'b.okoro@uniben.edu.ng' },
  title: 'Maternal Health Outcomes in Rural Primary Care Facilities',
  discipline: 'Public Health',
  level: 'PhD',
  supervisors: [CURRENT_SUPERVISOR, OTHER_SUPERVISORS['sup-2']],
  currentStage: 7,
  lastActivity: '2026-09-08',
  stageStatuses: {
    1: STATUS.APPROVED, 2: STATUS.APPROVED, 3: STATUS.APPROVED, 4: STATUS.APPROVED,
    5: STATUS.APPROVED, 6: STATUS.APPROVED, 7: STATUS.IN_PROGRESS, 8: STATUS.NOT_STARTED,
  },
  submissions: [
    {
      id: 'sub-2-7a', stageNumber: 7, sectionLabel: 'Chapter 3 \u2014 Methodology', status: STATUS.AWAITING_REVIEW,
      submittedAt: '2026-09-07',
      researcherNote: 'Written per the approved planner. I\u2019ve justified the facility sampling frame in 3.2 since Prof. Fashina asked about this at the proposal defence.',
      content: {
        chapters: '6 of 8 sections complete', objectives: 'Addresses Objective 2 (sampling) and Objective 3 (instrumentation).',
        sources: '12 methodological sources cited', argument: 'A stratified sample across facility tiers is necessary because outcome variance is driven more by tier than by state.',
        body: 'This study adopts a stratified random sampling design across three facility tiers\u2014primary health centres, cottage hospitals, and general hospitals\u2014within Edo State\u2019s rural local government areas. Tier-based stratification was selected over simple random sampling because preliminary data from the 2025 State Health Bulletin indicate that outcome variance in maternal mortality ratios is more strongly associated with facility tier than with geographic zone alone...',
      },
      history: [
        historyItem({ id: 'h-4', type: 'revision', supervisorId: 'sup-2', supervisorName: 'Prof. Wale Fashina', comment: 'The justification for tier-based stratification needs a citation for the 2025 State Health Bulletin claim \u2014 right now it reads as an assertion.', date: '2026-08-20', response: 'Added the bulletin as a primary source and cited the specific table.', responseDate: '2026-08-25', feedbackStatus: 'resolved' }),
      ],
    },
    {
      id: 'sub-2-7b', stageNumber: 7, sectionLabel: 'Chapter 3 \u2014 Data Collection', status: STATUS.IN_PROGRESS,
      submittedAt: null, researcherNote: null, content: null, history: [],
    },
  ],
}

// ── Project 3 — early stage, awaiting title approval ────────────────────
const tundeBakare = {
  id: 'proj-3',
  researcher: { id: 'res-3', name: 'Tunde Bakare', email: 't.bakare@oauife.edu.ng' },
  title: 'Smallholder Adoption of Climate-Resilient Cassava Varieties in Osun State',
  discipline: 'Agricultural Economics',
  level: 'Master\u2019s',
  supervisors: [OTHER_SUPERVISORS['sup-3']], // invited, external-only — demo of that path
  currentStage: 1,
  lastActivity: '2026-09-09',
  stageStatuses: {
    1: STATUS.AWAITING_REVIEW, 2: STATUS.NOT_STARTED, 3: STATUS.NOT_STARTED, 4: STATUS.NOT_STARTED,
    5: STATUS.NOT_STARTED, 6: STATUS.NOT_STARTED, 7: STATUS.NOT_STARTED, 8: STATUS.NOT_STARTED,
  },
  submissions: [
    {
      id: 'sub-3-1', stageNumber: 1, sectionLabel: null, status: STATUS.AWAITING_REVIEW,
      submittedAt: '2026-09-09',
      researcherNote: 'You supervised my brother\u2019s final year project in 2022 and recommended I reach out for this one \u2014 thank you for accepting the invite.',
      content: {
        title: 'Smallholder Adoption of Climate-Resilient Cassava Varieties in Osun State',
        problem: 'Improved cassava varieties bred for drought tolerance have under 15% uptake among Osun smallholders five years after release, despite documented yield advantages.',
        context: 'Three LGAs in Osun State with active extension programmes since 2021.',
        contribution: 'Identify which extension delivery channel most predicts adoption, to guide state extension budget allocation.',
      },
      history: [],
    },
  ],
}

// ── Project 4 — awaiting final checklist ────────────────────────────────
const graceNwankwo = {
  id: 'proj-4',
  researcher: { id: 'res-4', name: 'Grace Nwankwo', email: 'g.nwankwo@unilag.edu.ng' },
  title: 'Financial Inclusion Through Mobile Money in Southern Nigeria',
  discipline: 'Development Economics',
  level: 'Master\u2019s',
  supervisors: [CURRENT_SUPERVISOR],
  currentStage: 8,
  lastActivity: '2026-09-05',
  stageStatuses: {
    1: STATUS.APPROVED, 2: STATUS.APPROVED, 3: STATUS.APPROVED, 4: STATUS.APPROVED,
    5: STATUS.APPROVED, 6: STATUS.APPROVED, 7: STATUS.APPROVED, 8: STATUS.AWAITING_REVIEW,
  },
  submissions: [
    {
      id: 'sub-4-8', stageNumber: 8, sectionLabel: null, status: STATUS.AWAITING_REVIEW,
      submittedAt: '2026-09-05',
      researcherNote: 'All eight chapters complete. I\u2019ve disclosed AI use in the preface per the department\u2019s policy \u2014 used for reference formatting and a grammar pass only, no drafting.',
      content: {
        checklist: {
          'All chapters completed': true, 'Objectives addressed': true, 'Research questions answered': true,
          'Citations verified': true, 'References complete': true, 'Methodology consistent': true,
          'Findings supported by evidence': true, 'Conclusions based on findings': true,
          'Scholarly voice reviewed': true, 'AI use disclosed': true, 'Ready for oral defence': false,
        },
      },
      history: [
        historyItem({ id: 'h-5', type: 'question', supervisorId: 'sup-1', supervisorName: 'Dr. Amara Chukwu', comment: 'You\u2019ve marked "ready for oral defence" as not yet \u2014 what\u2019s outstanding?', date: '2026-09-06', response: 'Just my own nerves \u2014 I\u2019d like one mock defence with you before I tick that box, if you have time next week.', responseDate: '2026-09-06', feedbackStatus: 'responded' }),
      ],
    },
  ],
}

// ── Project 5 — literature mapping, revision required ───────────────────
const ibrahimSule = {
  id: 'proj-5',
  researcher: { id: 'res-5', name: 'Ibrahim Sule', email: 'i.sule@abu.edu.ng' },
  title: 'Renewable Energy Policy Diffusion in West Africa',
  discipline: 'Public Policy',
  level: 'PhD',
  supervisors: [CURRENT_SUPERVISOR],
  currentStage: 5,
  lastActivity: '2026-08-22',
  stageStatuses: {
    1: STATUS.APPROVED, 2: STATUS.APPROVED, 3: STATUS.APPROVED, 4: STATUS.APPROVED,
    5: STATUS.REVISION_REQUIRED, 6: STATUS.NOT_STARTED, 7: STATUS.NOT_STARTED, 8: STATUS.NOT_STARTED,
  },
  submissions: [
    {
      id: 'sub-5-5', stageNumber: 5, sectionLabel: null, status: STATUS.REVISION_REQUIRED,
      submittedAt: '2026-08-15',
      researcherNote: 'Mapped four major themes across the 41-source library.',
      content: {
        themes: ['Feed-in tariff design', 'Grid interconnection cost-sharing', 'Donor-driven vs. domestic policy origin', 'Subnational implementation gaps'],
        agreement: 'Broad consensus that donor-originated policy diffuses faster but is less durable after funding ends.',
        disagreement: 'Split on whether interconnection cost-sharing models from Ghana generalise to landlocked ECOWAS states.',
        gap: 'No study has examined policy durability specifically in landlocked ECOWAS states post-donor-exit.',
      },
      history: [
        historyItem({ id: 'h-6', type: 'revision', supervisorId: 'sup-1', supervisorName: 'Dr. Amara Chukwu', comment: 'The gap you\u2019ve identified is good, but the map doesn\u2019t yet show how you got there \u2014 add a section showing which sources cluster on each side of the interconnection disagreement, not just the conclusion that a split exists.', date: '2026-08-22', response: null, responseDate: null, feedbackStatus: 'open' }),
      ],
    },
  ],
}

export const PROJECTS = [johnAde, blessingOkoro, tundeBakare, graceNwankwo, ibrahimSule]

export const NOTIFICATIONS = [
  { id: 'n-1', type: 'submitted', projectId: 'proj-4', message: 'Grace Nwankwo submitted Stage 8 for review.', date: '2026-09-05', read: false },
  { id: 'n-2', type: 'responded', projectId: 'proj-4', message: 'Grace Nwankwo responded to your question on Stage 8.', date: '2026-09-06', read: false },
  { id: 'n-3', type: 'submitted', projectId: 'proj-3', message: 'Tunde Bakare submitted Stage 1 for review.', date: '2026-09-09', read: false },
  { id: 'n-4', type: 'submitted', projectId: 'proj-1', message: 'John Ade submitted Stage 3 for review.', date: '2026-08-28', read: true },
  { id: 'n-5', type: 'resubmitted', projectId: 'proj-2', message: 'Blessing Okoro resubmitted a section in Stage 7.', date: '2026-09-07', read: true },
]
