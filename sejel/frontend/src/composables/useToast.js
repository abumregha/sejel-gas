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
  const show = (msg, type = 'success', duration = 3000) => {
    state.message = msg
    state.type = type
    state.visible = true
    clearTimeout(timer)
    timer = setTimeout(() => { state.visible = false }, duration)
  }
  const dismiss = () => {
    clearTimeout(timer)
    state.visible = false
  }
  return { toast: state, show, dismiss }
}