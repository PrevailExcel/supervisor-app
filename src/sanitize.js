import DOMPurify from 'dompurify'

// Manuscript HTML is written by another user, so it must never reach v-html
// unsanitised. Only structural/inline text formatting survives.
const CONFIG = {
  ALLOWED_TAGS: [
    'p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup',
    'ul', 'ol', 'li', 'blockquote', 'span', 'a', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'figure', 'figcaption', 'hr', 'code', 'pre',
  ],
  ALLOWED_ATTR: ['href', 'colspan', 'rowspan'],
  ALLOW_DATA_ATTR: false,
}

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank')
    node.setAttribute('rel', 'noopener noreferrer nofollow')
  }
})

export function clean(html) {
  return DOMPurify.sanitize(String(html || ''), CONFIG)
}
