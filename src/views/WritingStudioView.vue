<template>
  <div v-if="doc" class="flex flex-col h-[calc(100vh-64px)] -mt-10 -mx-6 sm:-mx-8">
    <!-- Header -->
    <div class="border-b border-rule bg-paper-raised px-6 sm:px-8 py-4 flex items-center justify-between flex-shrink-0">
      <div class="flex items-center gap-4 min-w-0">
        <router-link :to="{ name: 'project', params: { id } }" class="flex-shrink-0 text-ink-faint hover:text-ink transition-colors">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </router-link>
        <div class="min-w-0">
          <p class="text-[11px] font-sans font-semibold text-accent uppercase tracking-wide">Writing Studio</p>
          <h1 class="font-serif text-[17px] font-semibold text-ink truncate">{{ doc.title }}</h1>
        </div>
      </div>
      <div class="flex items-center gap-4 text-[12px] text-ink-faint flex-shrink-0">
        <span>{{ written.length }} section{{ written.length === 1 ? '' : 's' }} written</span>
        <span class="w-1 h-1 rounded-full bg-rule" />
        <span :class="openCount ? 'text-awaiting font-medium' : ''">{{ openCount }} open comment{{ openCount === 1 ? '' : 's' }}</span>
      </div>
    </div>

    <div class="flex-1 flex min-h-0">
      <!-- Contents rail -->
      <nav class="w-64 flex-shrink-0 border-r border-rule bg-paper-raised overflow-y-auto py-5 px-4 hidden md:block">
        <p class="text-[10.5px] font-sans font-semibold text-ink-faint uppercase tracking-wide mb-2 px-1">Contents</p>
        <template v-for="ch in doc.chapters" :key="ch.key">
          <p v-if="doc.chapters.length > 1" class="text-[10.5px] font-semibold text-ink-faint px-2.5 pt-3 pb-1 leading-snug">{{ ch.title }}</p>
          <button
            v-for="section in ch.sections"
            :key="section.key"
            :disabled="!hasText(section)"
            class="w-full flex items-center gap-2.5 text-left px-2.5 py-2 rounded-md text-[12.5px] transition-colors disabled:cursor-default"
            :class="activeSection === section.key ? 'bg-accent-bg text-ink font-medium' : hasText(section) ? 'text-ink-soft hover:bg-paper-sunken' : 'text-ink-faint/60'"
            @click="scrollToSection(section.key)"
          >
            <span class="w-[6px] h-[6px] rounded-full flex-shrink-0" :class="dotClass(sectionStatus(section))" />
            <span class="truncate flex-1">{{ section.label }}</span>
            <span v-if="sectionOpen(section.key)" class="text-[10.5px] text-awaiting font-medium">{{ sectionOpen(section.key) }}</span>
          </button>
        </template>
      </nav>

      <!-- Document pane -->
      <div ref="scrollRef" class="flex-1 overflow-y-auto" @mouseup="onMouseUp">
        <p v-if="!written.length" class="text-[13px] text-ink-faint text-center py-24">The researcher hasn&rsquo;t written anything yet.</p>

        <div v-else class="flex gap-10 max-w-5xl mx-auto px-6 sm:px-10 py-10">
          <div ref="docRef" class="flex-1 min-w-0 font-serif text-[15.5px] text-ink prose-manuscript" style="max-width: 62ch">
            <template v-for="ch in doc.chapters" :key="ch.key">
              <template v-for="section in ch.sections.filter(hasText)" :key="section.key">
                <div :id="`section-${section.key}`" class="mb-10">
                  <div class="flex items-center gap-2 mb-3 font-sans">
                    <h2 class="text-[15px] font-semibold text-ink">{{ section.label }}</h2>
                    <StatusTag v-if="sectionStatus(section) !== 'in_progress'" :status="sectionStatus(section)" />
                    <router-link
                      v-if="submissionFor(section)"
                      :to="{ name: 'stage-review', params: { id, stageNumber: submissionFor(section).step_number, submissionId: submissionFor(section).id } }"
                      class="text-[11px] text-accent hover:underline ml-auto"
                    >Formal review &rarr;</router-link>
                  </div>
                  <ManuscriptSection
                    :section-key="section.key"
                    :html="section.html"
                    :comments="commentsBySection[section.key] || []"
                    :active-id="activeCommentId"
                    @rendered="recalcPositions"
                    @orphans="setOrphans"
                    @mark-click="focusComment"
                  />
                </div>
              </template>
            </template>
          </div>

          <!-- Comments margin -->
          <div ref="marginRef" class="w-72 flex-shrink-0 relative hidden lg:block" :style="{ height: marginHeight + 'px' }">
            <div v-if="!comments.length" class="text-[12px] text-ink-faint pt-2 leading-relaxed">
              Select any text in the manuscript to leave a comment.
            </div>
            <div
              v-for="c in comments"
              :key="c.id"
              :ref="(el) => setCardRef(c.id, el)"
              class="absolute left-0 right-0 border rounded-md p-3 bg-paper-raised transition-shadow"
              :class="[activeCommentId === String(c.id) ? 'border-accent shadow-[0_0_0_2px_rgba(43,69,112,0.15)]' : 'border-rule', c.status === 'resolved' ? 'opacity-60' : '']"
              :style="{ top: (cardTops[c.id] ?? 0) + 'px' }"
              @mouseenter="activeCommentId = String(c.id)"
              @mouseleave="activeCommentId = null"
            >
              <p class="text-[11px] text-ink-faint italic leading-snug mb-2 line-clamp-2">&ldquo;{{ c.anchor_text }}&rdquo;</p>
              <p v-if="isOrphan(c)" class="text-[10.5px] text-awaiting mb-1.5">The researcher has changed this passage.</p>

              <div class="flex items-start justify-between gap-2">
                <div>
                  <p class="text-[12px] font-medium text-ink">{{ c.author }}</p>
                  <p class="text-[10.5px] text-ink-faint">{{ timeAgo(c.created_at) }}</p>
                </div>
                <button v-if="c.author_id === auth.user?.id" class="text-[10.5px] text-ink-faint hover:text-attention" @click="removeComment(c)">Delete</button>
              </div>
              <p class="text-[12.5px] text-ink-soft leading-relaxed mt-1.5 whitespace-pre-line">{{ c.body }}</p>

              <div v-if="c.replies.length" class="mt-2 pt-2 border-t border-rule space-y-2">
                <div v-for="r in c.replies" :key="r.id">
                  <p class="text-[11px] font-medium text-ink">
                    {{ r.author }}
                    <span v-if="r.author_type === 'researcher'" class="font-normal text-accent">&middot; researcher</span>
                    <span class="font-normal text-ink-faint"> &middot; {{ timeAgo(r.created_at) }}</span>
                  </p>
                  <p class="text-[12px] text-ink-soft leading-relaxed whitespace-pre-line">{{ r.body }}</p>
                </div>
              </div>

              <div v-if="replyMode === c.id" class="mt-2">
                <textarea v-model="replyDraft" rows="2" class="w-full text-[12px] border border-rule rounded p-1.5 outline-none focus:border-accent resize-none" placeholder="Reply…" />
                <div class="flex gap-2 mt-1.5">
                  <button :disabled="busy" class="text-[11px] font-medium text-accent" @click="submitReply(c)">Reply</button>
                  <button class="text-[11px] text-ink-faint" @click="replyMode = null; replyDraft = ''">Cancel</button>
                </div>
              </div>
              <div v-else class="flex items-center gap-3 mt-2">
                <button class="text-[11px] text-ink-faint hover:text-ink" @click="replyMode = c.id; replyDraft = ''">Reply</button>
                <button v-if="c.status !== 'resolved'" class="text-[11px] text-accent hover:underline" @click="toggleResolved(c, true)">Resolve</button>
                <button v-else class="text-[11px] text-ink-faint hover:underline" @click="toggleResolved(c, false)">Reopen</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <p v-if="error" class="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-attention text-paper text-[12.5px] px-4 py-2 rounded-md shadow-lg" @click="error = ''">{{ error }}</p>

    <!-- Floating "+ Comment" on selection -->
    <div
      v-if="pending && !composerOpen"
      class="fixed z-30 bg-ink text-paper text-[12px] font-medium rounded-full px-3 py-1.5 shadow-lg cursor-pointer flex items-center gap-1.5"
      :style="{ top: pending.top + 'px', left: pending.left + 'px' }"
      @mousedown.prevent="openComposer"
    >
      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
      Comment
    </div>

    <!-- Comment composer -->
    <div v-if="composerOpen && pending" class="fixed z-30 w-72 bg-paper-raised border border-rule rounded-md shadow-lg p-3" :style="{ top: pending.top + 'px', left: pending.left + 'px' }">
      <p class="text-[11px] text-ink-faint italic mb-2 line-clamp-2">&ldquo;{{ pending.text }}&rdquo;</p>
      <textarea ref="composerRef" v-model="composerDraft" rows="3" class="w-full text-[12.5px] border border-rule rounded p-2 outline-none focus:border-accent resize-none" placeholder="Add a comment…" />
      <div class="flex gap-2 mt-2">
        <button :disabled="busy" class="text-[12px] font-medium bg-accent text-paper px-3 py-1.5 rounded disabled:opacity-60" @click="submitComment">Comment</button>
        <button class="text-[12px] text-ink-faint px-2" @click="closeComposer">Cancel</button>
      </div>
    </div>
  </div>

  <div v-else-if="loadError" class="text-center py-24 text-[13px] text-ink-soft">{{ loadError }}</div>
  <div v-else class="text-center py-24 text-ink-faint text-[13px]">Loading…</div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'
import { useSupervisionStore } from '@/stores/supervision'
import { useAuthStore } from '@/stores/auth'
import { errorMessage } from '@/services/api'
import { timeAgo } from '@/utils'
import StatusTag from '@/components/StatusTag.vue'
import ManuscriptSection from '@/components/ManuscriptSection.vue'

const props = defineProps({ id: { type: String, required: true } })
const store = useSupervisionStore()
const auth = useAuthStore()

const doc = ref(null)            // { title, chapters }
const comments = ref([])
const submissions = ref([])      // section-level submissions of the writing stage
const loadError = ref('')
const error = ref('')
const busy = ref(false)

const scrollRef = ref(null)
const docRef = ref(null)
const activeSection = ref(null)
const activeCommentId = ref(null)
const cardTops = ref({})
const cardRefs = {}
const marginHeight = ref(600)
const orphanMap = ref({})        // sectionKey -> [commentId]

let timer = null
let lastSig = ''

// ── data ─────────────────────────────────────────────────────
const hasText = (s) => !!(s.html && s.html.replace(/<[^>]*>/g, '').trim())
const allSections = computed(() => (doc.value?.chapters || []).flatMap((c) => c.sections))
const written = computed(() => allSections.value.filter(hasText))
const openCount = computed(() => comments.value.filter((c) => c.status === 'open').length)
const commentsBySection = computed(() => {
  const m = {}
  for (const c of comments.value) (m[c.section_key] ||= []).push(c)
  return m
})
const sectionOpen = (key) => (commentsBySection.value[key] || []).filter((c) => c.status === 'open').length

const submissionFor = (section) => submissions.value.find((s) => s.section_key === section.key && s.status === 'awaiting_review')
function sectionStatus(section) {
  const s = submissions.value.find((x) => x.section_key === section.key)
  return s ? s.status : 'in_progress'
}
function dotClass(status) {
  return {
    in_progress: 'bg-accent', awaiting_review: 'bg-awaiting', revision_required: 'bg-attention', approved: 'bg-approved',
  }[status] ?? 'bg-ink-faint/40'
}

async function load(initial = false) {
  try {
    const [w, p] = await Promise.all([store.fetchWriting(props.id), store.fetchProject(props.id)])
    const sig = JSON.stringify([w.chapters, w.comments, p.stages])
    if (sig === lastSig) return
    // Don't pull the page out from under someone mid-comment.
    if (!initial && (composerOpen.value || replyMode.value)) return
    lastSig = sig
    doc.value = { title: w.title, chapters: w.chapters }
    comments.value = w.comments
    const writing = p.stages.find((s) => s.number === p.writing_step)
    submissions.value = writing ? writing.submissions : []
    if (!activeSection.value) activeSection.value = written.value[0]?.key ?? null
  } catch (e) {
    if (!doc.value) loadError.value = e.response?.status === 403 ? 'You’re not supervising this project.' : errorMessage(e)
  }
}

onMounted(() => {
  load(true)
  timer = setInterval(() => { if (!document.hidden) load() }, 30000)
  window.addEventListener('resize', recalcPositions)
})
onBeforeUnmount(() => {
  clearInterval(timer)
  window.removeEventListener('resize', recalcPositions)
})

function scrollToSection(key) {
  activeSection.value = key
  document.getElementById(`section-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// ── margin card alignment (Google-Docs style) ────────────────
function setCardRef(id, el) { if (el) cardRefs[id] = el }
function setOrphans(key, ids) { orphanMap.value = { ...orphanMap.value, [key]: ids } }
const isOrphan = (c) => (orphanMap.value[c.section_key] || []).includes(c.id)

function focusComment(cid) {
  activeCommentId.value = String(cid)
  cardRefs[cid]?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' })
}

const estimateHeight = (c) => 110 + c.replies.length * 40

function layoutPass(heightOf) {
  if (!docRef.value) return { tops: {}, bottom: 0 }
  const containerTop = docRef.value.getBoundingClientRect().top
  const marks = Array.from(docRef.value.querySelectorAll('mark[data-comment-id]'))
  const seen = new Set()
  const ordered = []
  for (const m of marks) {
    const cid = m.dataset.commentId
    if (!seen.has(cid)) { seen.add(cid); ordered.push({ cid, top: m.getBoundingClientRect().top - containerTop }) }
  }
  let last = 0
  const tops = {}
  for (const { cid, top: raw } of ordered) {
    const c = comments.value.find((x) => String(x.id) === cid)
    if (!c) continue
    const top = Math.max(raw, last)
    tops[c.id] = top
    last = top + heightOf(c) + 14
  }
  // Comments whose passage was edited away sit below the rest.
  for (const c of comments.value) {
    if (tops[c.id] === undefined) { tops[c.id] = last; last += heightOf(c) + 14 }
  }
  return { tops, bottom: last }
}

function recalcPositions() {
  nextTick(() => {
    const est = layoutPass(estimateHeight)
    cardTops.value = est.tops
    marginHeight.value = Math.max(est.bottom, docRef.value?.offsetHeight ?? 0)
    nextTick(() => {
      const real = layoutPass((c) => cardRefs[c.id]?.offsetHeight ?? estimateHeight(c))
      cardTops.value = real.tops
      marginHeight.value = Math.max(real.bottom, docRef.value?.offsetHeight ?? 0)
    })
  })
}
watch(comments, recalcPositions, { deep: true })

// ── selection → comment ──────────────────────────────────────
const pending = ref(null)
const composerOpen = ref(false)
const composerDraft = ref('')
const composerRef = ref(null)
const replyMode = ref(null)
const replyDraft = ref('')

const blockOf = (node) => (node.nodeType === Node.TEXT_NODE ? node.parentElement : node)?.closest('[data-block]') ?? null

function textOffsetWithin(root, node, nodeOffset) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let total = 0
  let cur
  while ((cur = walker.nextNode())) {
    if (cur === node) return total + nodeOffset
    total += cur.textContent.length
  }
  return total
}

function onMouseUp(e) {
  if (composerOpen.value || e.target.closest?.('textarea,button')) return
  const sel = window.getSelection()
  if (!sel || sel.isCollapsed || !sel.toString().trim()) { pending.value = null; return }
  const range = sel.getRangeAt(0)
  const a = blockOf(range.startContainer)
  const b = blockOf(range.endContainer)
  if (!a || a !== b) { pending.value = null; return } // one paragraph at a time
  const sectionEl = a.closest('[data-section]')
  if (!sectionEl) { pending.value = null; return }

  const start = textOffsetWithin(a, range.startContainer, range.startOffset)
  const end = textOffsetWithin(a, range.endContainer, range.endOffset)
  if (end <= start) { pending.value = null; return }

  const rect = range.getBoundingClientRect()
  pending.value = {
    section_key: sectionEl.dataset.section,
    block_index: Number(a.dataset.block),
    start, end,
    text: a.textContent.slice(start, end),
    top: Math.min(Math.max(rect.top - 42, 8), window.innerHeight - 220),
    left: Math.min(Math.max(rect.left, 8), window.innerWidth - 300),
  }
}

function openComposer() {
  composerOpen.value = true
  composerDraft.value = ''
  nextTick(() => composerRef.value?.focus())
}
function closeComposer() {
  composerOpen.value = false
  pending.value = null
  window.getSelection()?.removeAllRanges()
}

async function submitComment() {
  const p = pending.value
  if (!p || !composerDraft.value.trim() || busy.value) return
  busy.value = true
  try {
    const c = await store.addComment(props.id, {
      section_key: p.section_key, block_index: p.block_index, start: p.start, end: p.end,
      anchor_text: p.text, body: composerDraft.value.trim(),
    })
    comments.value.push(c)
    lastSig = ''
    closeComposer()
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    busy.value = false
  }
}

function replaceComment(updated) {
  const i = comments.value.findIndex((c) => c.id === updated.id)
  if (i >= 0) comments.value.splice(i, 1, updated)
  lastSig = ''
}

async function submitReply(c) {
  if (!replyDraft.value.trim() || busy.value) return
  busy.value = true
  try {
    replaceComment(await store.addReply(props.id, c.id, replyDraft.value.trim()))
    replyMode.value = null
    replyDraft.value = ''
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    busy.value = false
  }
}

async function toggleResolved(c, resolved) {
  try { replaceComment(await store.setCommentResolved(props.id, c.id, resolved)) }
  catch (e) { error.value = errorMessage(e) }
}

async function removeComment(c) {
  if (!window.confirm('Delete this comment and its replies?')) return
  try {
    await store.deleteComment(props.id, c.id)
    comments.value = comments.value.filter((x) => x.id !== c.id)
    lastSig = ''
  } catch (e) { error.value = errorMessage(e) }
}
</script>

<style>
.manuscript-html p, .manuscript-html li, .manuscript-html blockquote { line-height: 1.8; }
.manuscript-html p { margin-bottom: 0.9em; }
.manuscript-html h1, .manuscript-html h2, .manuscript-html h3, .manuscript-html h4 { font-weight: 600; margin: 1.1em 0 0.5em; }
.manuscript-html ul { list-style: disc; padding-left: 1.4em; margin-bottom: 0.9em; }
.manuscript-html ol { list-style: decimal; padding-left: 1.4em; margin-bottom: 0.9em; }
.manuscript-html blockquote { border-left: 3px solid #E2DDD2; padding-left: 1em; color: #4A5463; margin-bottom: 0.9em; }
.manuscript-html a { color: #2B4570; text-decoration: underline; }
.manuscript-html table { border-collapse: collapse; margin-bottom: 1em; font-size: 0.9em; }
.manuscript-html th, .manuscript-html td { border: 1px solid #E2DDD2; padding: 4px 8px; }
.comment-mark {
  background: rgba(156, 122, 60, 0.22);
  border-bottom: 2px solid rgba(156, 122, 60, 0.55);
  cursor: pointer;
  transition: background 0.15s;
}
.comment-mark:hover, .comment-mark.active { background: rgba(156, 122, 60, 0.38); }
.comment-mark.resolved { background: rgba(107, 114, 128, 0.14); border-bottom-color: rgba(107, 114, 128, 0.4); }
</style>
