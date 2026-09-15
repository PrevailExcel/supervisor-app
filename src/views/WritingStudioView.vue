<template>
  <div v-if="project" class="flex flex-col h-[calc(100vh-64px)] -mt-10 -mx-6 sm:-mx-8">
    <!-- Header -->
    <div class="border-b border-rule bg-paper-raised px-6 sm:px-8 py-4 flex items-center justify-between flex-shrink-0">
      <div class="flex items-center gap-4 min-w-0">
        <router-link :to="{ name: 'project', params: { id: project.id } }" class="flex-shrink-0 text-ink-faint hover:text-ink transition-colors">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </router-link>
        <div class="min-w-0">
          <p class="text-[11px] font-sans font-semibold text-accent uppercase tracking-wide">Writing Studio</p>
          <h1 class="font-serif text-[17px] font-semibold text-ink truncate">{{ project.title }}</h1>
        </div>
      </div>
      <div class="flex items-center gap-4 text-[12px] text-ink-faint flex-shrink-0">
        <span>{{ doc.length }} sections</span>
        <span class="w-1 h-1 rounded-full bg-rule" />
        <span :class="openCount ? 'text-awaiting font-medium' : ''">{{ openCount }} open comment{{ openCount === 1 ? '' : 's' }}</span>
      </div>
    </div>

    <div class="flex-1 flex min-h-0">
      <!-- TOC rail -->
      <nav class="w-64 flex-shrink-0 border-r border-rule bg-paper-raised overflow-y-auto py-5 px-4">
        <p class="text-[10.5px] font-sans font-semibold text-ink-faint uppercase tracking-wide mb-2 px-1">Contents</p>
        <button
          v-for="section in doc"
          :key="section.key"
          class="w-full flex items-center gap-2.5 text-left px-2.5 py-2 rounded-md text-[12.5px] transition-colors"
          :class="activeSection === section.key ? 'bg-accent-bg text-ink font-medium' : 'text-ink-soft hover:bg-paper-sunken'"
          @click="scrollToSection(section.key)"
        >
          <span class="w-[6px] h-[6px] rounded-full flex-shrink-0" :class="sectionDotClass(section)" />
          <span class="truncate flex-1">{{ section.title }}</span>
        </button>

        <div v-if="!doc.length" class="text-[12px] text-ink-faint px-1 py-4">
          Nothing written yet.
        </div>
      </nav>

      <!-- Document pane -->
      <div ref="scrollRef" class="flex-1 overflow-y-auto">
        <div class="flex gap-10 max-w-5xl mx-auto px-10 py-10">
          <div ref="docRef" class="flex-1 min-w-0 font-serif text-[15.5px] text-ink prose-manuscript" style="max-width: 62ch" @mouseup="onMouseUp">
            <div v-for="section in doc" :key="section.key" :id="`section-${section.key}`" class="mb-10">
              <div class="flex items-center gap-2 mb-3">
                <h2 class="text-[15px] font-sans font-semibold text-ink">{{ section.title }}</h2>
                <StatusTag :status="section.status" />
                <router-link
                  v-if="section.submissionId && section.status === 'awaiting_review'"
                  :to="{ name: 'stage-review', params: { id: project.id, stageNumber: section.stageNumber, submissionId: section.submissionId } }"
                  class="text-[11px] text-accent hover:underline ml-auto"
                >Formal review \u2192</router-link>
              </div>
              <p
                v-for="(para, i) in section.paragraphs"
                :key="i"
                :data-para-id="`${section.key}-p${i}`"
                class="leading-[1.8] mb-3.5"
                v-html="renderParagraph(section.key, i, para)"
                @click="onMarkClick"
              />
            </div>
          </div>

          <!-- Comments margin -->
          <div ref="marginRef" class="w-72 flex-shrink-0 relative" :style="{ height: marginHeight + 'px' }">
            <div v-if="!visibleComments.length" class="text-[12px] text-ink-faint pt-2">
              Select any text in the document to leave a comment.
            </div>
            <div
              v-for="c in visibleComments"
              :key="c.id"
              :ref="(el) => setCardRef(c.id, el)"
              class="absolute left-0 right-0 border rounded-md p-3 bg-paper-raised transition-shadow"
              :class="[
                activeCommentId === c.id ? 'border-accent shadow-[0_0_0_2px_rgba(43,69,112,0.15)]' : 'border-rule',
                c.status === 'resolved' ? 'opacity-60' : '',
              ]"
              :style="{ top: (cardTops[c.id] ?? 0) + 'px' }"
              @mouseenter="activeCommentId = c.id"
              @mouseleave="activeCommentId = null"
            >
              <p class="text-[11px] text-ink-faint italic leading-snug mb-2 line-clamp-2">&ldquo;{{ c.anchorText }}&rdquo;</p>

              <div class="flex items-start justify-between gap-2">
                <div>
                  <p class="text-[12px] font-medium text-ink">{{ c.author }}</p>
                  <p class="text-[10.5px] text-ink-faint">{{ formatDate(c.date) }}</p>
                </div>
              </div>
              <p class="text-[12.5px] text-ink-soft leading-relaxed mt-1.5">{{ c.body }}</p>

              <div v-if="c.replies.length" class="mt-2 pt-2 border-t border-rule space-y-2">
                <div v-for="r in c.replies" :key="r.id">
                  <p class="text-[11px] font-medium text-ink">{{ r.author }} <span class="font-normal text-ink-faint">&middot; {{ formatDate(r.date) }}</span></p>
                  <p class="text-[12px] text-ink-soft leading-relaxed">{{ r.body }}</p>
                </div>
              </div>

              <div v-if="replyMode === c.id" class="mt-2">
                <textarea v-model="replyDraft" rows="2" class="w-full text-[12px] border border-rule rounded p-1.5 outline-none focus:border-accent resize-none" placeholder="Reply\u2026" />
                <div class="flex gap-2 mt-1.5">
                  <button class="text-[11px] font-medium text-accent" @click="submitReply(c.id)">Reply</button>
                  <button class="text-[11px] text-ink-faint" @click="replyMode = null; replyDraft = ''">Cancel</button>
                </div>
              </div>
              <div v-else class="flex items-center gap-3 mt-2">
                <button class="text-[11px] text-ink-faint hover:text-ink" @click="replyMode = c.id; replyDraft = ''">Reply</button>
                <button
                  v-if="c.status !== 'resolved'"
                  class="text-[11px] text-accent hover:underline"
                  @click="store.resolveComment(project.id, c.id)"
                >Resolve</button>
                <button v-else class="text-[11px] text-ink-faint hover:underline" @click="store.reopenComment(project.id, c.id)">Reopen</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating "+ Comment" on selection -->
    <div
      v-if="pending"
      class="fixed z-30 bg-ink text-paper text-[12px] font-medium rounded-full px-3 py-1.5 shadow-lg cursor-pointer flex items-center gap-1.5"
      :style="{ top: pending.top + 'px', left: pending.left + 'px' }"
      @mousedown.prevent="openComposer"
    >
      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
      Comment
    </div>

    <!-- Comment composer -->
    <div v-if="composerOpen" class="fixed z-30 w-72 bg-paper-raised border border-rule rounded-md shadow-lg p-3" :style="{ top: pending.top + 'px', left: pending.left + 'px' }">
      <p class="text-[11px] text-ink-faint italic mb-2 line-clamp-2">&ldquo;{{ pending.text }}&rdquo;</p>
      <textarea v-model="composerDraft" rows="3" autofocus class="w-full text-[12.5px] border border-rule rounded p-2 outline-none focus:border-accent resize-none" placeholder="Add a comment\u2026" />
      <div class="flex gap-2 mt-2">
        <button class="text-[12px] font-medium bg-accent text-paper px-3 py-1.5 rounded" @click="submitComment">Comment</button>
        <button class="text-[12px] text-ink-faint px-2" @click="closeComposer">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'
import { useSupervisionStore } from '@/stores/supervision'
import StatusTag from '@/components/StatusTag.vue'

const props = defineProps({ id: { type: String, required: true } })
const store = useSupervisionStore()

const project = computed(() => store.project(props.id))
const doc = computed(() => store.writingDocument(props.id))
const allComments = computed(() => store.commentsFor(props.id))
const openCount = computed(() => store.openCommentCount(props.id))
const visibleComments = computed(() => allComments.value) // both open + resolved shown, resolved dimmed

const scrollRef = ref(null)
const docRef = ref(null)
const marginRef = ref(null)
const activeSection = ref(doc.value[0]?.key ?? null)
const activeCommentId = ref(null)
const cardTops = ref({})
const cardRefs = {}
const marginHeight = ref(600)

function setCardRef(id, el) {
  if (el) cardRefs[id] = el
}

function sectionDotClass(section) {
  return {
    not_started: 'bg-ink-faint/40', in_progress: 'bg-accent', awaiting_review: 'bg-awaiting',
    revision_required: 'bg-attention', approved: 'bg-approved', completed: 'bg-approved',
  }[section.status] ?? 'bg-ink-faint/40'
}

function scrollToSection(key) {
  activeSection.value = key
  document.getElementById(`section-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// ── Rendering paragraphs with comment highlights ────────────────────────
function renderParagraph(sectionKey, i, text) {
  const paraId = `${sectionKey}-p${i}`
  const comments = allComments.value
    .filter((c) => c.paraId === paraId)
    .sort((a, b) => a.startOffset - b.startOffset)
  if (!comments.length) return escapeHtml(text)

  let html = ''
  let cursor = 0
  for (const c of comments) {
    if (c.startOffset > cursor) html += escapeHtml(text.slice(cursor, c.startOffset))
    const classes = ['comment-mark']
    if (c.status === 'resolved') classes.push('resolved')
    if (activeCommentId.value === c.id) classes.push('active')
    html += `<mark class="${classes.join(' ')}" data-comment-id="${c.id}">${escapeHtml(text.slice(c.startOffset, c.endOffset))}</mark>`
    cursor = c.endOffset
  }
  if (cursor < text.length) html += escapeHtml(text.slice(cursor))
  return html
}

function onMarkClick(e) {
  const mark = e.target.closest('mark[data-comment-id]')
  if (!mark) return
  activeCommentId.value = mark.dataset.commentId
  cardRefs[mark.dataset.commentId]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}

// ── Margin card vertical alignment ──────────────────────────────────────
// True Google-Docs-style alignment: position each card at its mark's
// vertical offset within the shared scroll container, with a
// minimum-gap collision pass. Two passes: an estimate-based layout first
// (so cards appear immediately, no flash of unpositioned content), then
// a remeasure pass using each card's ACTUAL rendered height — a fixed
// estimate alone under-guesses wrapped multi-line text and causes real
// overlapping cards that block clicks on whatever's underneath.
function estimateHeight(c) {
  return 92 + c.replies.length * 34
}

function layoutPass(heightLookup) {
  if (!docRef.value) return {}
  const containerTop = docRef.value.getBoundingClientRect().top
  const marks = Array.from(docRef.value.querySelectorAll('mark[data-comment-id]'))
  const orderedIds = marks.map((m) => m.dataset.commentId)

  let lastBottom = 0
  const tops = {}
  for (const id of orderedIds) {
    const comment = allComments.value.find((c) => c.id === id)
    if (!comment) continue
    const markEl = docRef.value.querySelector(`mark[data-comment-id="${id}"]`)
    const rawTop = markEl.getBoundingClientRect().top - containerTop
    const top = Math.max(rawTop, lastBottom)
    tops[id] = top
    lastBottom = top + heightLookup(id, comment) + 14
  }
  return { tops, bottom: lastBottom }
}

function recalcPositions() {
  nextTick(() => {
    // Pass 1: estimate-based, so cards render immediately.
    const { tops: estimatedTops, bottom: estimatedBottom } = layoutPass(
      (id, comment) => estimateHeight(comment)
    )
    cardTops.value = estimatedTops
    marginHeight.value = Math.max(estimatedBottom, docRef.value?.offsetHeight ?? 0)

    // Pass 2: after the browser has actually laid out the cards at their
    // estimated positions, re-measure real heights and reflow again —
    // this is what catches wrapped text an estimate can't predict.
    nextTick(() => {
      const realHeight = (id, fallback) => {
        const el = cardRefs[id]
        return el ? el.offsetHeight : fallback
      }
      const { tops: realTops, bottom: realBottom } = layoutPass(
        (id, comment) => realHeight(id, estimateHeight(comment))
      )
      cardTops.value = realTops
      marginHeight.value = Math.max(realBottom, docRef.value?.offsetHeight ?? 0)
    })
  })
}

watch([allComments, doc], recalcPositions, { deep: true })
onMounted(() => {
  recalcPositions()
  window.addEventListener('resize', recalcPositions)
})
onBeforeUnmount(() => window.removeEventListener('resize', recalcPositions))

// ── Text selection → floating comment button ────────────────────────────
const pending = ref(null) // { paraId, startOffset, endOffset, text, top, left }
const composerOpen = ref(false)
const composerDraft = ref('')
const replyMode = ref(null)
const replyDraft = ref('')

function closestParaEl(node) {
  const el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node
  return el?.closest('[data-para-id]') ?? null
}

function textOffsetWithin(root, node, nodeOffset) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let total = 0
  let current
  while ((current = walker.nextNode())) {
    if (current === node) return total + nodeOffset
    total += current.textContent.length
  }
  return total
}

function onMouseUp() {
  const sel = window.getSelection()
  if (!sel || sel.isCollapsed || sel.toString().trim() === '') {
    pending.value = null
    return
  }
  const range = sel.getRangeAt(0)
  const startPara = closestParaEl(range.startContainer)
  const endPara = closestParaEl(range.endContainer)
  if (!startPara || !endPara || startPara !== endPara) {
    // Cross-paragraph selections aren't supported in this demo.
    pending.value = null
    return
  }

  const startOffset = textOffsetWithin(startPara, range.startContainer, range.startOffset)
  const endOffset = textOffsetWithin(startPara, range.endContainer, range.endOffset)
  if (endOffset <= startOffset) { pending.value = null; return }

  const rect = range.getBoundingClientRect()
  // Reserve room below for the composer (taller than the floating button)
  // so opening it doesn't push it past the bottom of the viewport.
  const top = Math.min(Math.max(rect.top - 42, 8), window.innerHeight - 220)
  pending.value = {
    paraId: startPara.dataset.paraId,
    startOffset,
    endOffset,
    text: sel.toString(),
    top,
    left: Math.min(Math.max(rect.left, 8), window.innerWidth - 300),
  }
}

function openComposer() {
  composerOpen.value = true
  composerDraft.value = ''
}
function closeComposer() {
  composerOpen.value = false
  pending.value = null
  window.getSelection()?.removeAllRanges()
}
function submitComment() {
  if (!pending.value || !composerDraft.value.trim()) return
  store.addComment(project.value.id, {
    paraId: pending.value.paraId,
    startOffset: pending.value.startOffset,
    endOffset: pending.value.endOffset,
    anchorText: pending.value.text,
    body: composerDraft.value,
  })
  closeComposer()
}
function submitReply(commentId) {
  if (!replyDraft.value.trim()) return
  store.addReply(project.value.id, commentId, replyDraft.value)
  replyMode.value = null
  replyDraft.value = ''
}
</script>

<style>
.comment-mark {
  background: rgba(156, 122, 60, 0.22);
  border-bottom: 2px solid rgba(156, 122, 60, 0.55);
  cursor: pointer;
  transition: background 0.15s;
}
.comment-mark:hover,
.comment-mark.active {
  background: rgba(156, 122, 60, 0.38);
}
.comment-mark.resolved {
  background: rgba(107, 114, 128, 0.14);
  border-bottom-color: rgba(107, 114, 128, 0.4);
}
</style>
