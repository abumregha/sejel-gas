<template>
  <div class="max-w-2xl mx-auto">
    <h2 class="text-xl font-bold mb-6">{{ isEdit ? 'تعديل الشحنة' : 'إضافة شحنة مجدولة' }}</h2>
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">{{ error }}</div>
    <form @submit.prevent="save" class="bg-white rounded-xl shadow-sm border p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">المحطة</label>
        <select v-model="form.station" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option value="">اختر المحطة</option>
          <option v-for="s in stations" :key="s.name" :value="s.name">{{ s.station_name }}</option>
        </select>
      </div>
      <div class="grid grid-cols-2 gap-4">
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
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">الفاتورة / الإيداع</label>
        <select v-model="form.deposit" @change="onDepositChange" class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option value="">بدون</option>
          <option v-for="dep in deposits" :key="dep.name" :value="dep.name">{{ dep.invoice_number }} — {{ dep.station_name }}</option>
        </select>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">الكمية (لتر)</label>
          <input v-model.number="form.quantity" type="number" step="0.001" min="0" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">تاريخ الشحن المتوقع</label>
          <input v-model="form.expected_shipping_date" type="date" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            سعر الشراء / التكلفة للتر (د.ل)
            <span class="text-xs font-normal text-gray-400 block">بدقة تصل إلى 8 خانات عشرية (تكلفة التوريد من شركة التسويق)</span>
          </label>
          <input
            v-model.number="form.unit_price"
            type="number"
            step="0.00000001"
            min="0"
            placeholder="مثال: 0.14875000"
            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 font-mono"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            المسلسل (رقم السطر في النموذج)
            <span class="text-xs font-normal text-gray-400 block">رقم السطر من 1 إلى 15 بنموذج طلب التزويد PR-15-F-05</span>
          </label>
          <input
            v-model.number="form.serial_number"
            type="number"
            min="1"
            max="15"
            placeholder="مثال: 1"
            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 font-mono"
          />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
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
          <label class="block text-sm font-medium text-gray-700 mb-1">رقم الفاتورة</label>
          <input v-model="form.invoice_number" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
        </div>
      </div>
      <div class="text-sm font-bold text-primary bg-primary/5 p-3 rounded-lg border border-primary/20">
        إجمالي تكلفة الشحنة: <span class="font-mono text-base">{{ totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 3 }) }}</span> د.ل
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
        <textarea v-model="form.notes" rows="2" class="w-full border border-gray-300 rounded-lg px-4 py-2.5"></textarea>
      </div>
      <div class="flex gap-3 pt-4">
        <button type="submit" :disabled="saving" class="bg-primary text-white px-6 py-2.5 rounded-lg disabled:opacity-50">
          {{ saving ? 'جاري الحفظ...' : 'حفظ' }}
        </button>
        <router-link to="/inventory/shipment-schedules" class="px-6 py-2.5 border border-gray-300 rounded-lg">إلغاء</router-link>
      </div>
    </form>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../../api'
import { friendlyError } from '../../errors'
const router = useRouter(), route = useRoute()
const isEdit = computed(() => !!route.params.id)
const error = ref('')
const saving = ref(false)
const form = ref({ station: '', fuel_type: '', supplier: '', quantity: '', expected_shipping_date: '', unit_price: '', invoice_number: '', serial_number: '', status: 'scheduled', deposit: '', notes: '' })
const stations = ref([])
const fuelTypes = ref([])
const companies = ref([])
const deposits = ref([])
const totalAmount = computed(() => (Number(form.value.quantity) || 0) * (Number(form.value.unit_price) || 0))
onMounted(async () => {
  const [sRes, fRes, cRes, dRes] = await Promise.all([api.get('/stations/'), api.get('/fuel-types/'), api.get('/marketing-companies/'), api.get('/station-deposits/')])
  stations.value = sRes.data.results || sRes.data
  fuelTypes.value = fRes.data.results || fRes.data
  companies.value = cRes.data.results || cRes.data
  deposits.value = dRes.data.results || dRes.data
  if (isEdit.value) {
    const { data } = await api.get(`/shipment-schedules/${route.params.id}/`)
    form.value = { station: data.station, fuel_type: data.fuel_type, supplier: data.supplier || '', quantity: data.quantity, expected_shipping_date: data.expected_shipping_date, unit_price: data.unit_price || '', invoice_number: data.invoice_number || '', serial_number: data.serial_number || '', status: data.status || 'scheduled', deposit: data.deposit || '', notes: data.notes || '' }
  }
})
async function onDepositChange() {
  const dep = deposits.value.find(d => d.name === form.value.deposit)
  if (dep) {
    form.value.invoice_number = dep.invoice_number || ''
    form.value.station = dep.station || ''
    if (dep.fuel_product && !form.value.fuel_type) {
      form.value.fuel_type = dep.fuel_product
    }
    // Auto-suggest the next serial number for this invoice (1 to 15)
    if (!isEdit.value) {
      try {
        const { data } = await api.get('/shipment-schedules/', { params: { deposit: dep.name } })
        const existing = data.results || data || []
        const maxSerial = existing.reduce((max, item) => Math.max(max, Number(item.serial_number) || 0), 0)
        if (maxSerial < 15) {
          form.value.serial_number = maxSerial + 1
        }
      } catch (e) {
        if (!form.value.serial_number) form.value.serial_number = 1
      }
    }
  }
}
const save = async () => {
  error.value = ''
  saving.value = true
  try {
    const payload = { ...form.value, quantity: Number(form.value.quantity), unit_price: Number(form.value.unit_price) || 0 }
    Object.keys(payload).forEach(k => payload[k] === '' && delete payload[k])
    if (isEdit.value) await api.put(`/shipment-schedules/${route.params.id}/`, payload)
    else await api.post('/shipment-schedules/', payload)
    router.push('/inventory/shipment-schedules')
  } catch (e) {
    error.value = friendlyError(e)
  } finally { saving.value = false }
}
</script>
