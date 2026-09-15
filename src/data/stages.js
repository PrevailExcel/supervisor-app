// The eight Thesis-Speedwrite stages. Fixed — every project follows this
// same sequence, matching what the researcher sees in the main app.
export const STAGES = [
  {
    number: 1,
    name: 'Title Selection and Topic Refinement',
    short: 'Title',
    checkpoints: ['Clear', 'Researchable', 'Relevant', 'Appropriately scoped', 'Suitable for the programme'],
  },
  {
    number: 2,
    name: 'Project Planner',
    short: 'Planner',
    checkpoints: ['Problem, aim, objectives and questions align'],
  },
  {
    number: 3,
    name: 'Table of Contents Builder',
    short: 'TOC',
    checkpoints: ['Institutional format followed', 'Chapter structure fits the study', 'Sections logically arranged', 'Methodology and objectives represented'],
  },
  {
    number: 4,
    name: 'Master Reference Library',
    short: 'MRL',
    checkpoints: ['Sources verified', 'Library is current', 'Library suits the topic'],
  },
  {
    number: 5,
    name: 'Curated Literature Mapping',
    short: 'Lit Map',
    checkpoints: ['Map leads logically to the proposed study'],
  },
  {
    number: 6,
    name: 'Guided Reading and Notes',
    short: 'Reading',
    checkpoints: ['Understanding shown, not just AI summary'],
  },
  {
    number: 7,
    name: 'Section-by-Section Writing',
    short: 'Writing',
    checkpoints: ['Each section reviewed independently'],
  },
  {
    number: 8,
    name: 'Humanise and Finalise',
    short: 'Finalise',
    checkpoints: [
      'All chapters completed', 'Objectives addressed', 'Research questions answered',
      'Citations verified', 'References complete', 'Methodology consistent',
      'Findings supported by evidence', 'Conclusions based on findings',
      'Scholarly voice reviewed', 'AI use disclosed', 'Ready for oral defence',
    ],
  },
]

export const STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  AWAITING_REVIEW: 'awaiting_review',
  REVISION_REQUIRED: 'revision_required',
  APPROVED: 'approved',
  COMPLETED: 'completed',
}

export const STATUS_LABEL = {
  [STATUS.NOT_STARTED]: 'Not started',
  [STATUS.IN_PROGRESS]: 'In progress',
  [STATUS.AWAITING_REVIEW]: 'Awaiting review',
  [STATUS.REVISION_REQUIRED]: 'Revision required',
  [STATUS.APPROVED]: 'Approved',
  [STATUS.COMPLETED]: 'Completed',
}
