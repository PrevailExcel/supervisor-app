<template>
  <div class="prose-manuscript font-serif text-[15px] text-ink">

    <!-- Title -->
    <template v-if="kind === 'title'">
      <h3 class="text-[17px] font-semibold mb-4 leading-snug">{{ content.approved_title || content.raw_title }}</h3>
      <Field v-if="content.raw_title && content.raw_title !== content.approved_title" label="Researcher's original topic">{{ content.raw_title }}</Field>
      <Field v-if="content.citation_style" label="Citation style">{{ String(content.citation_style).toUpperCase() }}</Field>
      <Field v-if="content.target_words" label="Target length">{{ content.target_words }}</Field>
      <Rest :content="content" :skip="['approved_title', 'raw_title', 'citation_style', 'target_words']" />
    </template>

    <!-- Planner -->
    <template v-else-if="kind === 'planner'">
      <Field v-for="[key, label] in PLANNER_FIELDS" :key="key" :label="label" :html="true">{{ content[key] }}</Field>
      <Rest :content="content" :skip="PLANNER_FIELDS.map((f) => f[0]).concat(['approved_title'])" />
    </template>

    <!-- TOC -->
    <template v-else-if="kind === 'toc'">
      <div class="font-sans text-[13.5px] leading-[1.9] bg-paper-sunken/60 rounded p-4">
        <p v-for="(line, i) in tocLines" :key="i" :class="line.level === 0 ? 'font-medium mt-2 first:mt-0' : line.level === 1 ? 'pl-4 text-ink-soft' : 'pl-8 text-ink-faint'">
          <span v-if="line.num" class="inline-block w-12 text-ink-faint">{{ line.num }}</span>{{ line.label }}
        </p>
        <p v-if="!tocLines.length" class="text-ink-faint">No contents submitted.</p>
      </div>
    </template>

    <!-- References / MRL -->
    <template v-else-if="kind === 'references'">
      <div class="grid grid-cols-4 gap-3 font-sans mb-5">
        <Stat label="Total sources" :value="refs.length" />
        <Stat label="Verified" :value="refCount('verified')" tone="approved" />
        <Stat label="Awaiting" :value="refCount('pending')" tone="awaiting" />
        <Stat label="Problems" :value="refs.length - refCount('verified') - refCount('pending')" tone="attention" />
      </div>
      <div class="space-y-3">
        <div v-for="(r, i) in refs" :key="r.id || i" class="border-l-2 pl-3" :class="isProblem(r) ? 'border-attention' : 'border-rule'">
          <p class="text-[14px] leading-snug">{{ r.formatted || [r.authors, r.year && `(${r.year})`, r.title].filter(Boolean).join(' ') }}</p>
          <p class="text-[11.5px] font-sans text-ink-faint mt-0.5">
            <span v-if="r.journal_or_publisher">{{ r.journal_or_publisher }} &middot; </span>
            <span v-if="r.doi">DOI {{ r.doi }} &middot; </span>
            <span :class="isProblem(r) ? 'text-attention' : r.status === 'verified' ? 'text-approved' : ''">{{ r.status || 'unchecked' }}</span>
          </p>
        </div>
        <p v-if="!refs.length" class="text-ink-faint text-[13px] font-sans">No sources submitted.</p>
      </div>
      <Notes v-if="content.reading_notes?.length" :notes="content.reading_notes" />
    </template>

    <!-- Literature map -->
    <template v-else-if="kind === 'litmap'">
      <Field v-if="content.narrative" label="Narrative">{{ content.narrative }}</Field>
      <div v-for="(c, i) in content.clusters || []" :key="i" class="mb-5 border border-rule rounded-md p-4 font-sans">
        <p class="font-serif text-[15px] font-semibold mb-1">{{ c.theme }}</p>
        <p v-if="c.summary" class="text-[13px] text-ink-soft leading-relaxed mb-3">{{ c.summary }}</p>
        <div v-for="(s, j) in c.studies || []" :key="j" class="border-l-2 border-rule pl-3 mb-2.5">
          <p class="text-[12.5px] font-medium">{{ s.reference }}</p>
          <p class="text-[12.5px] text-ink-soft">{{ s.key_finding }}</p>
          <p class="text-[11px] text-ink-faint mt-0.5">{{ [s.method, s.relation].filter(Boolean).join(' · ') }}</p>
        </div>
        <p v-if="c.gap" class="text-[12.5px] text-awaiting mt-2"><strong>Gap:</strong> {{ c.gap }}</p>
      </div>
    </template>

    <!-- Guided reading notes -->
    <template v-else-if="kind === 'reading'">
      <Notes :notes="content.notes || []" />
    </template>

    <!-- Writing: one section, or the whole manuscript -->
    <template v-else-if="kind === 'writing'">
      <template v-if="content.section">
        <p v-if="content.chapter" class="text-[12px] font-sans text-ink-faint mb-3">{{ content.chapter }}</p>
        <div class="manuscript-html" v-html="clean(content.section.html)" />
      </template>
      <template v-else-if="content.manuscript">
        <div v-for="ch in content.manuscript" :key="ch.key" class="mb-8">
          <h3 v-if="ch.title" class="text-[16px] font-semibold mb-3">{{ ch.title }}</h3>
          <div v-for="sec in ch.sections.filter((s) => s.html && s.html.trim())" :key="sec.key" class="mb-5">
            <p class="text-[12px] font-sans font-semibold text-ink-faint uppercase tracking-wide mb-1.5">{{ sec.label }}</p>
            <div class="manuscript-html" v-html="clean(sec.html)" />
          </div>
        </div>
      </template>
      <Rest v-else :content="content" :skip="[]" />
    </template>

    <!-- Final review checklist -->
    <template v-else-if="kind === 'review'">
      <p v-if="content.audit_score != null" class="font-sans text-[13px] mb-4">
        Humanisation audit score: <strong>{{ content.audit_score }}/100</strong>
        <span class="text-ink-faint"> (lower is better)</span>
      </p>
      <div class="space-y-2 font-sans">
        <div v-for="(checked, key) in content.checks || {}" :key="key" class="flex items-center gap-2.5 py-1.5 border-b border-rule last:border-0">
          <span class="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" :class="checked ? 'bg-approved-bg text-approved' : 'bg-attention-bg text-attention'">
            <svg v-if="checked" class="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
            <svg v-else class="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </span>
          <span class="text-[13px]" :class="checked ? 'text-ink' : 'text-attention'">{{ CHECK_LABELS[key] || humanise(key) }}</span>
        </div>
      </div>
      <Rest :content="content" :skip="['checks', 'audit_score']" />
    </template>

    <!-- Anything else -->
    <template v-else>
      <Rest :content="content" :skip="[]" />
    </template>
  </div>
</template>

<script setup>
import { h, computed } from 'vue'
import { clean } from '@/sanitize'

const props = defineProps({
  kind: { type: String, default: 'generic' },
  content: { type: Object, required: true },
})

const PLANNER_FIELDS = [
  ['problem', 'Problem statement'], ['objectives', 'Objectives'], ['questions', 'Research questions'],
  ['design', 'Research design'], ['approach', 'Approach'], ['population', 'Population'],
  ['sampling', 'Sampling'], ['theory', 'Theoretical framework'], ['scope', 'Scope'],
  ['significance', 'Significance'], ['keywords', 'Keywords'],
  ['aim', 'Aim'], ['contribution', 'Contribution'], ['methodology', 'Methodology'],
]

const CHECK_LABELS = {
  combined: 'Chapters combined', humanised: 'Humanised', citations: 'Citations checked',
  wordcount: 'Word count met', references: 'Reference list complete', exported: 'Exported',
}

const humanise = (k) => String(k).replace(/[_-]+/g, ' ').replace(/^./, (c) => c.toUpperCase())

// ── TOC ──
const tocLines = computed(() => String(props.content.toc || '').split('\n').filter((l) => l.trim()).map((line) => {
  const m = line.match(/^(\d+(?:\.\d+)*)\s+(.+)/)
  if (!m) return { num: '', label: line.trim(), level: 0 }
  return { num: m[1], label: m[2].trim(), level: Math.min(m[1].split('.').length - 1, 2) }
}))

// ── References ──
const refs = computed(() => Array.isArray(props.content.references) ? props.content.references : [])
const refCount = (status) => refs.value.filter((r) => r.status === status).length
const isProblem = (r) => !!r.status && !['verified', 'pending'].includes(r.status)

// ── Small render-function components ──
const Field = {
  props: ['label', 'html'],
  setup(p, { slots }) {
    return () => {
      const text = (slots.default?.() || []).map((v) => (typeof v.children === 'string' ? v.children : '')).join('').trim()
      if (!text) return null
      // Planner fields may hold light HTML (lists) — sanitise, never trust.
      const body = p.html && /<\w+[^>]*>/.test(text)
        ? h('div', { class: 'leading-relaxed manuscript-html', innerHTML: clean(text) })
        : h('p', { class: 'leading-relaxed whitespace-pre-line' }, text)
      return h('div', { class: 'mb-4' }, [
        h('p', { class: 'text-[11px] font-sans font-semibold text-ink-faint uppercase tracking-wide mb-1' }, p.label),
        body,
      ])
    }
  },
}

const Stat = {
  props: ['label', 'value', 'tone'],
  setup(p) {
    const tone = { approved: 'text-approved', awaiting: 'text-awaiting', attention: 'text-attention' }[p.tone] || 'text-ink'
    return () => h('div', { class: 'border border-rule rounded-md p-3' }, [
      h('p', { class: `text-[20px] font-serif font-semibold ${tone}` }, String(p.value)),
      h('p', { class: 'text-[11px] text-ink-faint' }, p.label),
    ])
  },
}

const Notes = {
  props: ['notes'],
  setup(p) {
    const rows = [['main_focus', 'Main focus'], ['key_finding', 'Key finding'], ['method', 'Method'], ['where_to_use', 'Where it will be used'], ['insight', 'Researcher’s insight']]
    return () => h('div', { class: 'space-y-5 mt-2' }, (p.notes || []).map((n) =>
      h('div', { class: 'border border-rule rounded-md p-4 font-sans' }, [
        h('p', { class: 'font-serif text-[15px] font-semibold mb-2' }, n.authors_year || n.source || 'Untitled note'),
        ...rows.filter(([k]) => n[k]).map(([k, label]) => h('div', { class: 'mb-2' }, [
          h('p', { class: 'text-[10.5px] font-semibold text-ink-faint uppercase tracking-wide' }, label),
          h('p', { class: 'text-[13px] text-ink-soft leading-relaxed' }, n[k]),
        ])),
        n.relations?.length ? h('p', { class: 'text-[11.5px] text-ink-faint mt-2' }, n.relations.join(' · ')) : null,
      ])))
  },
}

// Generic fallback so no submitted data is ever silently hidden.
const Rest = {
  props: ['content', 'skip'],
  setup(p) {
    return () => {
      const entries = Object.entries(p.content || {}).filter(([k, v]) => !(p.skip || []).includes(k) && v !== null && v !== '' && !(Array.isArray(v) && !v.length))
      if (!entries.length) return null
      return h('div', {}, entries.map(([k, v]) => h('div', { class: 'mb-4' }, [
        h('p', { class: 'text-[11px] font-sans font-semibold text-ink-faint uppercase tracking-wide mb-1' }, humanise(k)),
        typeof v === 'string' && /<\w+[^>]*>/.test(v)
          ? h('div', { class: 'leading-relaxed manuscript-html', innerHTML: clean(v) })
          : h('p', { class: 'leading-relaxed whitespace-pre-line text-[14px]' }, display(v)),
      ])))
    }
  },
}

function display(v) {
  if (Array.isArray(v)) return v.map((x) => (typeof x === 'object' ? JSON.stringify(x) : String(x))).join('\n')
  if (typeof v === 'object') return Object.entries(v).map(([k, x]) => `${humanise(k)}: ${typeof x === 'object' ? JSON.stringify(x) : x}`).join('\n')
  return String(v)
}
</script>
