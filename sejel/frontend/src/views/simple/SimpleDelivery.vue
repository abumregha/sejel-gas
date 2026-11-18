<template>
  <div class="space-y-4">
    <h2 class="text-lg font-bold text-gray-800">توريد وقود</h2>

    <!-- Route-guard surface: roles without Delivery create never get here from
         Home (the button is hidden); a direct URL gets this quiet refusal with
         no error trail. -->
    <div v-if="!canDeliver" data-testid="simple-delivery-forbidden"
      class="text-sm text-gray-500 bg-white border border-dashed border-gray-200 rounded-xl p-8 text-center">
      هذا الإجراء غير متاح لصلاحيتك
    </div>

    <template v-else>
      <section class="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-4">
        <label class="block">
          <span class="text-xs text-gray-500">الخزان</span>
          <select v-model="tank" data-testid="simple-delivery-tank"
            class="mt-1 w-full min-h-[52px] border border-gray-300 rounded-xl px-4 py-2.5 text-base bg-white">
            <option value="" disabled>اختر الخزان…</option>
            <option v-for="t in tanks" :key="t.name" :value="t.name">
              {{ t.tank_name || t.name }} — {{ t.fuel_type_name || t.fuel_type }}
            </option>
          </select>
        </label>
        <label class="block">
          <span class="text-xs text-gray-500">الكمية (لتر)</span>
          <input v-model.number="quantity" data-testid="simple-delivery-qty" type="number" min="0" step="0.001" inputmode="decimal"
            class="mt-1 w-full min-h-[52px] border border-gray-300 rounded-xl px-4 py-2.5 text-lg font-bold tabular-nums" />
          <div class="flex gap-2 mt-2">
            <button type="button" data-testid="simple-delivery-qty-40k" @click="quantity = 40000"
              class="flex-1 min-h-[44px] rounded-lg bg-gray-100 border border-gray-200 text-sm font-semibold tabular-nums">40,000</button>
            <button type="button" data-testid="simple-delivery-qty-20k" @click="quantity = 20000"
              class="flex-1 min-h-[44px] rounded-lg bg-gray-100 border border-gray-200 text-sm font-semibold tabular-nums">20,000</button>
          </div>
        </label>
      </section>

      <button data-testid="simple-save-delivery" @click="save" :disabled="saving"
        class="w-full min-h-[60px] rounded-xl bg-blue-600 text-white font-bold text-lg disabled:opacity-50">
        {{ saving ? 'جاري الحفظ…' : 'حفظ التوريد' }}
      </button>
    </template>
  </div>
</template>

<script setup>
// Simple Mode delivery — DIRECT deliveries only (no schedules, no deposits,
// no arrival mode). Contract copied from the delivery branch of ShipmentForm:
// fuel type derives from the tank; arrival_date stamps now; is_unscheduled=1.
import { ref, computed, onMounted } from 'vue'
import api from '../../api'
import friendlyError from '../../errors'
import { useAuthStore } from '../../stores/auth'
import { useStationStore } from '../../stores/station'
import { useToast } from '../../composables/useToast'
import { isManagerLevel } from '../../utils/roles'

const auth = useAuthStore()
const stationStore = useStationStore()
const { show } = useToast()

const canDeliver = computed(() => isManagerLevel(auth.user))
const tanks = ref([])
const tank = ref('')
const quantity = ref('')
const saving = ref(false)

async function load() {
  if (!stationStore.currentStation) return
  try {
    const { data } = await api.get('/tanks/')
    tanks.value = data.results || data || []
    if (tanks.value.length === 1) tank.value = tanks.value[0].name
  } catch (e) {
    show(friendlyError(e), 'error')
  }
}

async function save() {
  if (saving.value) return
  if (!tank.value) { show('اختر الخزان أولاً', 'error'); return }
  const qty = Number(quantity.value)
  if (!Number.isFinite(qty) || qty <= 0) { show('أدخل الكمية باللتر', 'error'); return }
  saving.value = true
  try {
    const t = tanks.value.find((x) => x.name === tank.value)
    // Contract copied from ShipmentForm's direct-delivery branch. Two non-
    // obvious keys are REQUIRED by the backend:
    //   order_date — MandatoryError without it (the old form always sends it)
    //   shipment_schedule: '' — without the key, the Delivery controller's
    //     link_schedule() hits AttributeError ('Delivery' object has no
    //     attribute 'shipment_schedule') because new_doc leaves it unset.
    //     The empty string is falsy and takes the unscheduled path.
    await api.post('/deliveries/', {
      station: stationStore.currentStation,
      tank: tank.value,
      fuel_type: t?.fuel_type || undefined,
      requested_quantity: qty,
      expected_quantity: qty,
      order_date: new Date().toISOString(),
      arrival_date: new Date().toISOString(),
      is_unscheduled: 1,
      shipment_schedule: '',
    })
    show('تم حفظ التوريد بنجاح')
    quantity.value = ''
  } catch (e) {
    show(friendlyError(e), 'error')
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>
