<template>
  <div ref="root" class="manuscript-html" :data-section="sectionKey" @click="onClick" />
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import { clean } from '@/sanitize'

const props = defineProps({
  sectionKey: { type: String, required: true },
  html: { type: String, default: '' },
  comments: { type: Array, default: () => [] },
  activeId: { type: [String, Number], default: null },
})
const emit = defineEmits(['rendered', 'orphans', 'mark-click'])

const root = ref(null)
const BLOCK_SEL = 'p,h1,h2,h3,h4,h5,h6,li,blockquote,td,th,figcaption,pre'

// Leaf blocks only (a <blockquote><p>…</p></blockquote> counts as the <p>) so a
// comment's block_index means the same thing for every viewer of the same HTML.
function leafBlocks(el) {
  return Array.from(el.querySelectorAll(BLOCK_SEL)).filter((b) => !b.querySelector(BLOCK_SEL))
}

function locate(blocks, c) {
  const b = blocks[c.block_index]
  if (b && b.textContent.slice(c.start, c.end) === c.anchor_text) return { block: b, start: c.start, end: c.end }
  // The text moved or was edited a little: look for the quote in the same block, then anywhere in the section.
  const candidates = b ? [b, ...blocks.filter((x) => x !== b)] : blocks
  for (const blk of candidates) {
    const i = blk.textContent.indexOf(c.anchor_text)
    if (i >= 0) return { block: blk, start: i, end: i + c.anchor_text.length }
  }
  return null
}

function wrapRange(block, start, end, comment) {
  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT)
  const hits = []
  let pos = 0
  let node
  while ((node = walker.nextNode())) {
    const len = node.textContent.length
    const s = Math.max(start, pos)
    const e = Math.min(end, pos + len)
    if (s < e) hits.push({ node, from: s - pos, to: e - pos })
    pos += len
    if (pos >= end) break
  }
  for (const { node: n, from, to } of hits) {
    const inside = from > 0 ? n.splitText(from) : n
    if (to - from < inside.textContent.length) inside.splitText(to - from)
    const mark = document.createElement('mark')
    mark.className = 'comment-mark' + (comment.status === 'resolved' ? ' resolved' : '')
    mark.dataset.commentId = String(comment.id)
    inside.parentNode.insertBefore(mark, inside)
    mark.appendChild(inside)
  }
}

function render() {
  const el = root.value
  if (!el) return
  el.innerHTML = clean(props.html)

  let blocks = leafBlocks(el)
  if (!blocks.length && el.textContent.trim()) {
    el.innerHTML = `<p>${el.innerHTML}</p>`
    blocks = leafBlocks(el)
  }
  blocks.forEach((b, i) => { b.dataset.block = String(i) })

  const orphans = []
  for (const c of props.comments) {
    const hit = locate(blocks, c)
    if (hit) wrapRange(hit.block, hit.start, hit.end, c)
    else orphans.push(c.id)
  }
  paintActive()
  emit('orphans', props.sectionKey, orphans)
  nextTick(() => emit('rendered'))
}

function paintActive() {
  root.value?.querySelectorAll('mark[data-comment-id]').forEach((m) => {
    m.classList.toggle('active', props.activeId !== null && m.dataset.commentId === String(props.activeId))
  })
}

function onClick(e) {
  const mark = e.target.closest?.('mark[data-comment-id]')
  if (mark) emit('mark-click', mark.dataset.commentId)
}

// Re-render only when the text or the anchors/status actually change.
const signature = () => props.html.length + '|' + props.html.slice(0, 64) + '|' +
  props.comments.map((c) => `${c.id}:${c.status}:${c.block_index}:${c.start}:${c.end}`).join(',')

watch(signature, render)
watch(() => props.activeId, paintActive)
onMounted(render)
</script>
