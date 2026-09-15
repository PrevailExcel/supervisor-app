<template>
  <div class="prose-manuscript font-serif text-[15px] text-ink">

    <!-- Stage 1: Title -->
    <template v-if="stageNumber === 1">
      <h3 class="text-[17px] font-semibold mb-4 leading-snug">{{ content.title }}</h3>
      <Field label="Research problem">{{ content.problem }}</Field>
      <Field label="Study context">{{ content.context }}</Field>
      <Field label="Expected contribution">{{ content.contribution }}</Field>
    </template>

    <!-- Stage 2: Planner -->
    <template v-else-if="stageNumber === 2">
      <Field label="Problem statement">{{ content.problem }}</Field>
      <Field label="Aim">{{ content.aim }}</Field>
      <FieldList label="Objectives" :items="content.objectives" />
      <FieldList label="Research questions" :items="content.questions" />
      <Field label="Proposed methodology">{{ content.methodology }}</Field>
    </template>

    <!-- Stage 3: TOC -->
    <template v-else-if="stageNumber === 3">
      <p class="text-[12px] text-ink-faint font-sans mb-4">Template: {{ content.template }}</p>
      <div class="font-sans text-[13.5px] leading-[1.9] bg-paper-sunken/60 rounded p-4">
        <p v-for="(line, i) in content.toc" :key="i" :class="line.startsWith('  ') ? 'pl-4 text-ink-soft' : 'font-medium mt-2 first:mt-0'">
          {{ line.trim() }}
        </p>
      </div>
    </template>

    <!-- Stage 4: MRL -->
    <template v-else-if="stageNumber === 4">
      <div class="grid grid-cols-4 gap-3 font-sans mb-5">
        <Stat label="Total sources" :value="content.totalSources" />
        <Stat label="Verified" :value="content.verified" tone="approved" />
        <Stat label="Awaiting" :value="content.awaitingVerification" tone="awaiting" />
        <Stat label="Problems" :value="content.problems" tone="attention" />
      </div>
      <div class="space-y-3">
        <div v-for="(src, i) in content.sources" :key="i" class="border-l-2 pl-3" :class="src.status === 'problem' ? 'border-attention' : 'border-rule'">
          <p class="text-[13.5px] font-sans"><span class="font-medium">{{ src.author }}</span> ({{ src.year }}). {{ src.title }}.</p>
          <p class="text-[11.5px] text-ink-faint font-sans mt-0.5">{{ src.doi || 'No DOI on file' }} &middot; {{ src.status }}</p>
          <p class="text-[12.5px] text-ink-soft font-sans mt-1 italic">{{ src.relevance }}</p>
        </div>
      </div>
    </template>

    <!-- Stage 5: Literature Map -->
    <template v-else-if="stageNumber === 5">
      <FieldList label="Major themes" :items="content.themes" />
      <Field label="Areas of agreement">{{ content.agreement }}</Field>
      <Field label="Areas of disagreement">{{ content.disagreement }}</Field>
      <Field label="Identified research gap">{{ content.gap }}</Field>
    </template>

    <!-- Stage 6: Guided Reading -->
    <template v-else-if="stageNumber === 6">
      <Field label="Source">{{ content.source }}</Field>
      <Field label="Main argument">{{ content.argument }}</Field>
      <Field label="Method">{{ content.method }}</Field>
      <Field label="Findings">{{ content.findings }}</Field>
      <Field label="Limitations">{{ content.limitations }}</Field>
      <Field label="Researcher's interpretation">{{ content.interpretation }}</Field>
    </template>

    <!-- Stage 7: Writing -->
    <template v-else-if="stageNumber === 7">
      <div class="grid grid-cols-2 gap-3 font-sans text-[12px] text-ink-faint mb-5">
        <p>{{ content.chapters }}</p>
        <p>{{ content.sources }}</p>
      </div>
      <Field label="Main argument">{{ content.argument }}</Field>
      <p class="mt-4 text-indent leading-[1.8]">{{ content.body }}</p>
    </template>

    <!-- Stage 8: Finalise checklist -->
    <template v-else-if="stageNumber === 8">
      <div class="space-y-2 font-sans">
        <div v-for="(checked, label) in content.checklist" :key="label" class="flex items-center gap-2.5 py-1.5 border-b border-rule last:border-0">
          <span
            class="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
            :class="checked ? 'bg-approved-bg text-approved' : 'bg-attention-bg text-attention'"
          >
            <svg v-if="checked" class="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
            <svg v-else class="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </span>
          <span class="text-[13px]" :class="checked ? 'text-ink' : 'text-attention'">{{ label }}</span>
        </div>
      </div>
    </template>

  </div>
</template>

<script setup>
import { h } from 'vue'

defineProps({
  stageNumber: { type: Number, required: true },
  content: { type: Object, required: true },
})

// Small local render-function components keep this file self-contained
// without scattering four near-identical template blocks.
const Field = {
  props: ['label'],
  setup(props, { slots }) {
    return () => h('div', { class: 'mb-4' }, [
      h('p', { class: 'text-[11px] font-sans font-semibold text-ink-faint uppercase tracking-wide mb-1' }, props.label),
      h('p', { class: 'leading-relaxed' }, slots.default?.()),
    ])
  },
}

const FieldList = {
  props: ['label', 'items'],
  setup(props) {
    return () => h('div', { class: 'mb-4' }, [
      h('p', { class: 'text-[11px] font-sans font-semibold text-ink-faint uppercase tracking-wide mb-1.5' }, props.label),
      h('ul', { class: 'space-y-1' }, (props.items || []).map((item, i) =>
        h('li', { key: i, class: 'flex gap-2 leading-relaxed' }, [
          h('span', { class: 'text-ink-faint flex-shrink-0' }, String(i + 1) + '.'),
          h('span', item),
        ])
      )),
    ])
  },
}

const Stat = {
  props: ['label', 'value', 'tone'],
  setup(props) {
    const toneClass = { approved: 'text-approved', awaiting: 'text-awaiting', attention: 'text-attention' }[props.tone] || 'text-ink'
    return () => h('div', { class: 'text-center border border-rule rounded p-2.5 bg-paper-raised' }, [
      h('p', { class: `text-[18px] font-semibold ${toneClass}` }, String(props.value)),
      h('p', { class: 'text-[10.5px] text-ink-faint mt-0.5' }, props.label),
    ])
  },
}
</script>
