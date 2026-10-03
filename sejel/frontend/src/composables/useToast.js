// Global toast — survives navigation.
//
// A per-component toast disappears the moment the component unmounts, so a
// form that saved and then redirected (station, meter, island, tank...) showed
// its confirmation for one second and left the operator on the next screen
// with no idea whether the save had worked.
//
// The state lives here at module level and the toast is rendered once, in the
// layout, so it outlives the screen that raised it.
import { reactive } from 'vue'

const state = reactive({ visible: false, message: '', type: 'success' })
let timer = null

export function useToast() {
  // duration 0 = stay until dismissed. An ERROR must not time out: on a phone
  // the operator is still reading the form when a 3-second toast vanishes, and
  // the failure then looks like nothing happened (QA-6).
  const show = (msg, type = 'success', duration = type === 'error' ? 0 : 3000) => {
    state.message = msg
    state.type = type
    state.visible = true
    clearTimeout(timer)
    if (duration > 0) {
      timer = setTimeout(() => { state.visible = false }, duration)
    }
  }
  const dismiss = () => {
    clearTimeout(timer)
    state.visible = false
  }
  return { toast: state, show, dismiss }
}