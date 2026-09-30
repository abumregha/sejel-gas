<template>
  <div v-if="visible" class="ux-widget" :class="{ expanded }">
    <button v-if="!expanded" class="ux-fab" :title="t.hint" @click="expanded = true">
      <span class="ux-emoji">🙂</span>
    </button>

    <div v-else class="ux-panel">
      <div v-if="!sent" class="ux-panel-body">
        <p class="ux-q">{{ t.question }}</p>
        <div class="ux-options">
          <button v-for="opt in options" :key="opt.value" class="ux-opt" :class="{ chosen: rating === opt.value }" @click="choose(opt.value)">
            <span class="ux-emoji">{{ opt.emoji }}</span>
            <span class="ux-label">{{ opt.label }}</span>
          </button>
        </div>

        <template v-if="rating === 'hard'">
          <input v-model.trim="category" class="ux-input" :placeholder="t.whatHard" maxlength="120" />
        </template>

        <textarea v-model.trim="comment" class="ux-input" :placeholder="t.comment" rows="2" maxlength="500"></textarea>

        <div class="ux-actions">
          <button class="ux-btn secondary" @click="reset">{{ t.cancel }}</button>
          <button class="ux-btn primary" :disabled="sending" @click="submit">{{ sending ? '…' : t.send }}</button>
        </div>
      </div>

      <div v-else class="ux-panel-body thanks">
        <p>{{ t.thanks }}</p>
        <button class="ux-btn secondary" @click="reset">✕</button>
      </div>
    </div>
  </div>
</template>

<script setup>
// ── In-app "how was it?" widget ────────────────────────────────
// Tiny one-click feedback: 🙂 ok / 🙁 hard / 😄 easy. When the user picks
// "hard" we ask what was hard (free text) so we get actionable signal, not
// just mood. Submits to /api/ux/feedback/ (auth required) and hides itself
// for a while after submission. Feedback is never forced: the widget sits in
// the corner, out of the way.

import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api'
import { reportClientError } from '../telemetry'

const route = useRoute()

const HIDE_KEY = 'ux-widget-hide-until'
const AR = {
  hint: 'ما رأيك في التجربة؟',
  question: 'كيف كانت تجربتك اليوم؟',
  whatHard: 'ما الذي صعّب التجربة؟ (اختياري)',
  comment: 'تعليق إضافي (اختياري)',
  cancel: 'إلغاء',
  send: 'إرسال',
  thanks: 'شكرًا لملاحظاتك! 🙏',
}

const t = AR
const options = [
  { value: 'hard', emoji: '🙁', label: 'صعبة' },
  { value: 'ok', emoji: '🙂', label: 'عادية' },
  { value: 'easy', emoji: '😄', label: 'سهلة' },
]

const visible = ref(!localStorage.getItem(HIDE_KEY) || Date.now() > Number(localStorage.getItem(HIDE_KEY)))
const expanded = ref(false)
const sent = ref(false)
const sending = ref(false)
const rating = ref('')
const category = ref('')
const comment = ref('')

function choose(value) {
  rating.value = value
}

function reset() {
  expanded.value = false
  sent.value = false
  sending.value = false
  rating.value = ''
  category.value = ''
  comment.value = ''
}

async function submit() {
  if (!rating.value || sending.value) return
  sending.value = true
  try {
    await api.post('/ux/feedback/', {
      rating: rating.value,
      category: rating.value === 'hard' ? category.value : '',
      comment: comment.value,
      page: route.path,
    })
    sent.value = true
    localStorage.setItem(HIDE_KEY, String(Date.now() + 6 * 60 * 60 * 1000)) // hide 6h
    setTimeout(() => {
      visible.value = false
    }, 2500)
  } catch {
    reportClientError('error', { message: 'feedback submit failed' })
    sent.value = true
    setTimeout(() => {
      visible.value = false
    }, 2500)
  } finally {
    sending.value = false
  }
}
</script>

<style scoped>
.ux-widget {
  position: fixed;
  bottom: 18px;
  inset-inline-start: 18px;
  z-index: 90;
  direction: rtl;
  font-family: inherit;
}
.ux-fab {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  border: 1px solid #e2e8f0;
  background: #fff;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.12);
  cursor: pointer;
  font-size: 20px;
  display: grid;
  place-items: center;
  transition: transform 0.15s ease;
}
.ux-fab:hover {
  transform: scale(1.06);
}
.ux-panel {
  width: 270px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.16);
  overflow: hidden;
}
.ux-panel-body {
  padding: 14px;
}
.ux-q {
  margin: 0 0 10px;
  font-size: 13.5px;
  font-weight: 700;
  color: #0f172a;
}
.ux-options {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}
.ux-opt {
  flex: 1;
  display: grid;
  place-items: center;
  gap: 2px;
  padding: 8px 4px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.12s ease;
}
.ux-opt:hover {
  border-color: #94a3b8;
}
.ux-opt.chosen {
  border-color: #2563eb;
  background: #eff6ff;
  outline: 2px solid #bfdbfe;
}
.ux-label {
  font-size: 11px;
  color: #475569;
}
.ux-input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 7px 9px;
  font-size: 12.5px;
  font-family: inherit;
  margin-bottom: 8px;
  resize: none;
}
.ux-input:focus {
  outline: none;
  border-color: #2563eb;
}
.ux-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.ux-btn {
  border: none;
  border-radius: 8px;
  padding: 7px 14px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}
.ux-btn.primary {
  background: #2563eb;
  color: #fff;
}
.ux-btn.primary:disabled {
  opacity: 0.6;
}
.ux-btn.secondary {
  background: #f1f5f9;
  color: #334155;
}
.thanks {
  text-align: center;
  font-size: 13.5px;
  color: #0f172a;
}
.thanks p {
  margin: 4px 0 10px;
}
</style>
