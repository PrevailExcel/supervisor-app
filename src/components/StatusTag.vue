<template>
  <span class="inline-flex items-center gap-1.5 text-[12px] font-medium" :class="textClass">
    <span class="w-[7px] h-[7px] rounded-full flex-shrink-0" :class="dotClass" />
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { STATUS, STATUS_LABEL } from '@/data/stages'

const props = defineProps({ status: { type: String, required: true } })

const label = computed(() => STATUS_LABEL[props.status] ?? props.status)

const dotClass = computed(() => ({
  [STATUS.NOT_STARTED]: 'bg-ink-faint/40',
  [STATUS.IN_PROGRESS]: 'bg-accent',
  [STATUS.AWAITING_REVIEW]: 'bg-awaiting',
  [STATUS.REVISION_REQUIRED]: 'bg-attention',
  [STATUS.APPROVED]: 'bg-approved',
  [STATUS.COMPLETED]: 'bg-approved',
}[props.status] ?? 'bg-ink-faint/40'))

const textClass = computed(() => ({
  [STATUS.NOT_STARTED]: 'text-ink-faint',
  [STATUS.IN_PROGRESS]: 'text-accent',
  [STATUS.AWAITING_REVIEW]: 'text-awaiting',
  [STATUS.REVISION_REQUIRED]: 'text-attention',
  [STATUS.APPROVED]: 'text-approved',
  [STATUS.COMPLETED]: 'text-approved',
}[props.status] ?? 'text-ink-faint'))
</script>
