<template>
  <div class="max-w-2xl mx-auto">
    <h2 class="text-xl font-bold mb-6">{{ pageTitle }}</h2>
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">{{ error }}</div>
    <div v-if="warning" class="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-4 mb-4 text-sm">
      {{ warning }}
      <router-link v-if="arrival" :to="`/inventory/shipments/${arrival}?type=schedule`" class="block mt-1 font-semibold underline">فتح جدول الشحنة</router-link>
    </div>
    <div v-if="arrivalDoc" class="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4 text-sm">
      شحنة مجدولة — سطر رقم <strong>{{ arrivalDoc.serial_number ?? '—' }}</strong>، فاتورة <strong>{{ arrivalDoc.invoice_number || '—' }}</strong>
      <router-link :to="`/inventory/shipments/${arrival}?type=schedule`" class="text-primary hover:underline mr-2">عرض الجدول</router-link>
    </div>

    <form @submit.prevent="save" class="bg-white rounded-xl shadow-sm border p-6 space-y-4">
      <div v-if="!isEdit && !arrival && !forcedType" class="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl">
        <button type="button" @click="switchType('schedule')" :class="type === 'schedule' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'" class="py-2 rounded-lg text-sm font-semibold transition">شحنة مجدولة</button>
        <button type="button" @click="switchType('delivery')" :class="type === 'delivery' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'" class="py-2 rounded-lg text-sm font-semibold transition">تسجيل توريد</button>
      </div>

      <div v-if="type === 'schedule'">
        <label class="block text-sm font-medium text-gray-700 mb-1">الفاتورة / الإيداع</label>
        <select v-model="form.deposit" @change="onDepositChange" class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option value="">بدون</option>
          <option v-for="dep in deposits" :key="dep.name" :value="dep.name">{{ dep.invoice_number }} — {{ dep.station_name || dep.station }}</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">المحطة</label>
        <select v-model="form.station" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option value="">اختر المحطة</option>
          <option v-for="s in stations" :key="s.name" :value="s.name">{{ s.station_name || s.name }}</option>
        </select>
      </div>

      <div v-if="type === 'schedule'" class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">نوع الوقود</label>
          <select v-model="form.fuel_type" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
            <option value="">اختر النوع</option>
            <option v-for="f in fuelTypes" :key="f.name" :value="f.name">{{ f.fuel_name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">المورد</label>
          <select v-model="form.supplier" class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
            <option value="">اختر المورد</option>
            <option v-for="c in companies" :key="c.name" :value="c.name">{{ c.company_name }}</option>
          </select>
        </div>
      </div>

      <div v-else class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">الخزان</label>
          <select v-model="form.tank" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
            <option value="">اختر الخزان</option>
            <option v-for="t in filteredTanks" :key="t.name" :value="t.name">{{ t.tank_name || t.name }} ({{ fuelTypeName(t.fuel_type) }})</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">نوع الوقود</label>
          <input :value="fuelTypeName(form.fuel_type)" readonly class="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-gray-600" />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">الكمية (لتر)</label>
        <div v-if="type === 'delivery' && !arrival" class="flex gap-2 mb-2">
          <button type="button" @click="form.quantity = 40000" :class="['px-3 py-1.5 rounded-lg text-sm border transition', form.quantity == 40000 ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200']">40,000</button>
          <button type="button" @click="form.quantity = 20000" :class="['px-3 py-1.5 rounded-lg text-sm border transition', form.quantity == 20000 ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200']">20,000</button>
        </div>
        <input v-model.number="form.quantity" type="number" step="0.001" min="0" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
      </div>

      <div v-if="type === 'schedule'">
        <label class="block text-sm font-medium text-gray-700 mb-1">تاريخ الشحن المتوقع</label>
        <input v-model="form.expected_shipping_date" type="date" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
      </div>
      <div v-else>
        <label class="block text-sm font-medium text-gray-700 mb-1">تاريخ الاستلام الفعلي</label>
        <input v-model="form.arrival_date" type="datetime-local" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
        <div v-if="arrivalDoc" class="mt-3">
          <label class="block text-sm font-medium text-gray-700 mb-1">التاريخ المجدول</label>
          <input v-model="form.scheduled_date" type="date" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
        </div>
      </div>

      <div v-if="type === 'schedule'" class="text-sm font-bold text-primary bg-primary/5 p-3 rounded-lg border border-primary/20">
        إجمالي تكلفة الشحنة: <span class="font-mono text-base">{{ totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 3 }) }}</span> د.ل
      </div>

      <label v-if="arrivalDoc" class="flex items-center gap-2 text-sm text-gray-700">
        <input v-model="confirmArrival" type="checkbox" class="rounded border-gray-300" />
        تأكيد الاستلام (سيتم تحديث حالة الجدول إلى «مُسلّمة»)
      </label>

      <div class="border border-gray-200 rounded-xl">
        <button type="button" @click="showAdvanced = !showAdvanced" class="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700">
          <span>خيارات متقدمة</span>
          <span class="text-gray-400">{{ showAdvanced ? '▲' : '▼' }}</span>
        </button>
        <div v-if="showAdvanced" class="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
          <template v-if="type === 'schedule'">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                سعر الشراء / التكلفة للتر (د.ل)
                <span class="text-xs font-normal text-gray-400 block">بدقة تصل إلى 8 خانات عشرية (تكلفة التوريد من شركة التسويق)</span>
              </label>
              <input v-model.number="form.unit_price" type="number" step="0.00000001" min="0" placeholder="مثال: 0.14875000" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 font-mono" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                المسلسل (رقم السطر في النموذج)
                <span class="text-xs font-normal text-gray-400 block">رقم السطر من 1 إلى 15 بنموذج طلب التزويد PR-15-F-05</span>
              </label>
              <input v-model.number="form.serial_number" type="number" min="1" max="15" placeholder="مثال: 1" class="w-full border border-gray-300 rounded-lg px-4 py-2.5 font-mono" />
            </div>
            <div v-if="isEdit">
              <label class="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
              <select v-model="form.status" class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
                <option value="scheduled">مجدولة</option>
                <option value="dispatched">مُرسلة</option>
                <option value="delivered">مُسلّمة</option>
                <option value="undelivered">غير مسلّمة</option>
                <option value="transit">مرحلة</option>
                <option value="cancelled">ملغاة</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
              <textarea v-model="form.notes" rows="2" class="w-full border border-gray-300 rounded-lg px-4 py-2.5"></textarea>
            </div>
          </template>
          <template v-else>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">رقم الفاتورة</label>
              <input v-model="form.invoice_number" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" placeholder="130167073" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">تاريخ الطلب</label>
              <input v-model="form.order_date" type="datetime-local" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
            </div>
            <label v-if="!arrival" class="flex items-center gap-2 text-sm text-gray-700">
              <input v-model="form.is_unscheduled" type="checkbox" class="rounded border-gray-300" />
              شحنة غير مجدولة / إضافية
            </label>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">القراءة قبل</label>
                <input v-model.number="form.pre_reading" type="number" step="0.001" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">القراءة بعد</label>
                <input v-model.number="form.post_reading" type="number" step="0.001" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
              </div>
            </div>
            <div v-if="receivedQty !== null" class="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm">
              <div class="flex justify-between"><span>الكمية المستلمة:</span><strong>{{ receivedQty.toLocaleString('en-US') }} لتر</strong></div>
              <div class="flex justify-between" :class="shortage > 0 ? 'text-red-600' : ''"><span>النقص:</span><strong>{{ shortage.toLocaleString('en-US') }} لتر</strong></div>
              <div v-if="shortage > 0" class="text-xs text-red-500 mt-1">يمكن إنشاء مطالبة نقص بعد الحفظ</div>
            </div>
          </template>
        </div>
      </div>

      <div class="flex gap-3 pt-4">
        <button type="submit" :disabled="saving" class="bg-primary text-white px-6 py-2.5 rounded-lg disabled:opacity-50">
          {{ saving ? 'جاري الحفظ...' : 'حفظ' }}
        </button>
        <router-link :to="type === 'schedule' ? '/inventory/shipment-schedules' : '/inventory/deliveries'" class="px-6 py-2.5 border border-gray-300 rounded-lg">إلغاء</router-link>
      </div>
    </form>
  </div>
</template>
<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../api'
import { friendlyError } from '../../errors'

const route = useRoute()
const router = useRouter()
const error = ref('')
const warning = ref('')
const saving = ref(false)
const isEdit = computed(() => !!route.params.id)
const forcedType = route.meta.forceType || ''
const arrival = !isEdit.value && route.query.type === 'arrival' && route.query.schedule ? String(route.query.schedule) : ''
const arrivalDoc = ref(null)
const confirmArrival = ref(true)
const showAdvanced = ref(false)
const type = ref(resolveInitialType())

const stations = ref([])
const tanks = ref([])
const fuelTypes = ref([])
const companies = ref([])
const deposits = ref([])

const emptyForm = () => ({
  station: '', tank: '', fuel_type: '', supplier: '', deposit: '',
  quantity: '', invoice_number: '',
  expected_shipping_date: '', order_date: '', arrival_date: '', scheduled_date: '',
  unit_price: '', serial_number: '', status: 'scheduled', notes: '',
  is_unscheduled: false, pre_reading: '', post_reading: '',
})
const form = ref(emptyForm())

function resolveInitialType() {
  if (forcedType) return forcedType
  if (arrival || route.query.type === 'delivery') return 'delivery'
  return 'schedule'
}

const nowLocal = () => {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}
const toLocal = (v) => {
  if (!v) return ''
  const d = new Date(v)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}
const toISO = (v) => v ? new Date(v).toISOString() : undefined
const today = () => new Date().toISOString().slice(0, 10)

const pageTitle = computed(() => {
  if (arrivalDoc.value) return 'تسجيل استلام شحنة مجدولة'
  if (isEdit.value) return type.value === 'schedule' ? 'تعديل الشحنة المجدولة' : 'تعديل الشحنة'
  return type.value === 'schedule' ? 'إضافة شحنة مجدولة' : 'إضافة شحنة (توريد)'
})
const filteredTanks = computed(() => form.value.station ? tanks.value.filter(t => t.station == form.value.station) : tanks.value)
const fuelTypeName = (name) => (fuelTypes.value.find(f => f.name === name) || {}).fuel_name || name || '—'
const totalAmount = computed(() => (Number(form.value.quantity) || 0) * (Number(form.value.unit_price) || 0))
const receivedQty = computed(() => {
  if (type.value !== 'delivery' || form.value.pre_reading === '' || form.value.post_reading === '') return null
  const p = Number(form.value.pre_reading), q = Number(form.value.post_reading)
  return q >= p ? q - p : null
})
const shortage = computed(() => receivedQty.value === null ? 0 : Math.max(0, Number(form.value.quantity || 0) - receivedQty.value))

watch(() => form.value.tank, (tk) => {
  if (type.value !== 'delivery') return
  const t = tanks.value.find(x => x.name === tk)
  if (t) form.value.fuel_type = t.fuel_type
})

function switchType(t) {
  if (type.value === t) return
  type.value = t
  if (t === 'schedule') {
    form.value.tank = ''
    form.value.pre_reading = ''
    form.value.post_reading = ''
    form.value.is_unscheduled = false
    if (!form.value.expected_shipping_date) form.value.expected_shipping_date = today()
  } else {
    form.value.deposit = ''
    form.value.unit_price = ''
    form.value.serial_number = ''
    form.value.notes = ''
    if (!form.value.order_date) form.value.order_date = nowLocal()
    if (!form.value.arrival_date) form.value.arrival_date = nowLocal()
  }
}

function pickSchedule(d) {
  return {
    station: d.station || '', fuel_type: d.fuel_type || '', supplier: d.supplier || '',
    deposit: d.deposit || '', quantity: d.quantity ?? '',
    expected_shipping_date: d.expected_shipping_date || '',
    unit_price: d.unit_price || '', serial_number: d.serial_number ?? '',
    invoice_number: d.invoice_number || '', status: d.status || 'scheduled',
    notes: d.notes || '',
  }
}
function pickDelivery(d) {
  return {
    station: d.station || '', tank: d.tank || '', fuel_type: d.fuel_type || '',
    supplier: d.supplier || '', invoice_number: d.invoice_number || '',
    quantity: d.expected_quantity ?? d.requested_quantity ?? '',
    order_date: toLocal(d.order_date) || nowLocal(),
    arrival_date: toLocal(d.arrival_date),
    scheduled_date: d.scheduled_date || '',
    is_unscheduled: !!d.is_unscheduled,
    pre_reading: d.pre_reading ?? '', post_reading: d.post_reading ?? '',
  }
}

async function loadForEdit() {
  const prefer = route.query.type
  if (prefer !== 'delivery') {
    try {
      const { data } = await api.get(`/shipment-schedules/${route.params.id}/`)
      type.value = 'schedule'
      form.value = { ...emptyForm(), ...pickSchedule(data) }
      return
    } catch (e) {
      if (prefer === 'schedule') throw e
    }
  }
  const { data } = await api.get(`/deliveries/${route.params.id}/`)
  type.value = 'delivery'
  form.value = { ...emptyForm(), ...pickDelivery(data) }
}

async function loadForArrival() {
  const { data } = await api.get(`/shipment-schedules/${arrival}/`)
  arrivalDoc.value = data
  form.value = {
    ...form.value,
    station: data.station || '',
    fuel_type: data.fuel_type || '',
    supplier: data.supplier || '',
    invoice_number: data.invoice_number || '',
    quantity: data.quantity ?? '',
    expected_shipping_date: data.expected_shipping_date || '',
    scheduled_date: data.expected_shipping_date || '',
    order_date: nowLocal(),
    arrival_date: nowLocal(),
  }
  const match = tanks.value.filter(t => t.station === form.value.station && t.fuel_type === form.value.fuel_type)
  if (match.length === 1) form.value.tank = match[0].name
}

async function onDepositChange() {
  const dep = deposits.value.find(d => d.name === form.value.deposit)
  if (!dep) return
  form.value.invoice_number = dep.invoice_number || ''
  form.value.station = dep.station || ''
  if (dep.fuel_product && !form.value.fuel_type) form.value.fuel_type = dep.fuel_product
  if (!isEdit.value) {
    try {
      const { data } = await api.get('/shipment-schedules/', { params: { deposit: dep.name } })
      const existing = data.results || data || []
      const maxSerial = existing.reduce((max, item) => Math.max(max, Number(item.serial_number) || 0), 0)
      if (maxSerial < 15) form.value.serial_number = maxSerial + 1
    } catch (e) {
      if (!form.value.serial_number) form.value.serial_number = 1
    }
  }
}

onMounted(async () => {
  try {
    const [sRes, tRes, fRes, cRes, dRes] = await Promise.all([
      api.get('/stations/'), api.get('/tanks/'), api.get('/fuel-types/'),
      api.get('/marketing-companies/'), api.get('/station-deposits/'),
    ])
    stations.value = sRes.data.results || sRes.data
    tanks.value = tRes.data.results || tRes.data
    fuelTypes.value = fRes.data.results || fRes.data
    companies.value = cRes.data.results || cRes.data
    deposits.value = dRes.data.results || dRes.data

    if (isEdit.value) {
      await loadForEdit()
    } else if (arrival) {
      await loadForArrival()
    } else {
      if (route.query.station) form.value.station = route.query.station
      else if (stations.value.length === 1) form.value.station = stations.value[0].name
      if (route.query.date) {
        if (type.value === 'schedule') form.value.expected_shipping_date = route.query.date
        else {
          form.value.arrival_date = `${route.query.date}T08:00`
          form.value.order_date = `${route.query.date}T08:00`
        }
      }
      if (type.value === 'schedule') {
        if (!form.value.expected_shipping_date) form.value.expected_shipping_date = today()
      } else {
        if (!form.value.arrival_date) form.value.arrival_date = nowLocal()
        if (!form.value.order_date) form.value.order_date = nowLocal()
      }
    }
  } catch (e) {
    error.value = friendlyError(e)
  }
})

const save = async () => {
  error.value = ''
  warning.value = ''
  saving.value = true
  try {
    if (type.value === 'schedule') {
      if (!form.value.deposit && !form.value.invoice_number) {
        error.value = 'اختر الفاتورة / الإيداع قبل الحفظ'
        saving.value = false
        return
      }
      const payload = {
        station: form.value.station,
        fuel_type: form.value.fuel_type,
        deposit: form.value.deposit || undefined,
        supplier: form.value.supplier || undefined,
        invoice_number: form.value.invoice_number || undefined,
        quantity: Number(form.value.quantity) || 0,
        expected_shipping_date: form.value.expected_shipping_date,
        unit_price: Number(form.value.unit_price) || 0,
        serial_number: form.value.serial_number === '' || form.value.serial_number == null ? undefined : Number(form.value.serial_number),
        notes: form.value.notes || undefined,
      }
      if (isEdit.value) payload.status = form.value.status
      Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k])
      if (isEdit.value) await api.put(`/shipment-schedules/${route.params.id}/`, payload)
      else await api.post('/shipment-schedules/', payload)
      router.push('/inventory/shipment-schedules')
      return
    }

    const qty = Number(form.value.quantity) || 0
    const payload = {
      station: form.value.station,
      tank: form.value.tank,
      fuel_type: form.value.fuel_type,
      requested_quantity: qty,
      expected_quantity: qty,
      invoice_number: form.value.invoice_number || undefined,
      order_date: toISO(form.value.order_date) || toISO(nowLocal()),
      arrival_date: toISO(form.value.arrival_date),
      scheduled_date: form.value.scheduled_date || undefined,
      is_unscheduled: arrival ? 0 : (form.value.is_unscheduled ? 1 : 0),
      pre_reading: form.value.pre_reading === '' ? undefined : Number(form.value.pre_reading),
      post_reading: form.value.post_reading === '' ? undefined : Number(form.value.post_reading),
      received_quantity: receivedQty.value === null ? undefined : receivedQty.value,
      shortage: receivedQty.value === null ? undefined : shortage.value,
      shipment_schedule: arrival || undefined,
    }
    Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k])

    let deliveryName = route.params.id
    if (isEdit.value && !arrival) {
      await api.put(`/deliveries/${route.params.id}/`, payload)
    } else {
      const res = await api.post('/deliveries/', payload)
      deliveryName = res.data.name || deliveryName
    }

    if (arrival) {
      const schedPayload = { delivery: deliveryName }
      if (confirmArrival.value) schedPayload.status = 'delivered'
      try {
        await api.put(`/shipment-schedules/${arrival}/`, schedPayload)
      } catch (e) {
        warning.value = 'تم حفظ الشحنة، تعذر تحديث حالة الجدول — حدّثها يدوياً'
        saving.value = false
        return
      }
    }
    router.push('/inventory/deliveries')
  } catch (e) {
    error.value = friendlyError(e)
  } finally {
    saving.value = false
  }
}
</script>
