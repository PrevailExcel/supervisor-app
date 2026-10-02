<template>
  <span class="inline-flex items-center gap-1.5 text-[12px] font-medium" :class="textClass">
    <span class="w-[7px] h-[7px] rounded-full flex-shrink-0" :class="dotClass" />
    {{ STATUS_LABEL[status] ?? status }}
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { STATUS_LABEL } from '@/utils'

const props = defineProps({ status: { type: String, required: true } })

const dotClass = computed(() => ({
  not_started: 'bg-ink-faint/40', in_progress: 'bg-accent', awaiting_review: 'bg-awaiting',
  revision_required: 'bg-attention', approved: 'bg-approved', completed: 'bg-approved',
}[props.status] ?? 'bg-ink-faint/40'))

const textClass = computed(() => ({
  not_started: 'text-ink-faint', in_progress: 'text-accent', awaiting_review: 'text-awaiting',
  revision_required: 'text-attention', approved: 'text-approved', completed: 'text-approved',
}[props.status] ?? 'text-ink-faint'))
</script>
