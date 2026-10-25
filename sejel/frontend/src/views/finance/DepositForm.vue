<template>
  <div class="max-w-2xl mx-auto">
    <h2 class="text-xl font-bold mb-6">{{ isEdit ? 'تعديل الدفعة' : 'إضافة دفعة مقدمة' }}</h2>
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
          <label class="block text-sm font-medium text-gray-700 mb-1">رقم الفاتورة</label>
          <input v-model="form.invoice_number" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">تاريخ الفاتورة</label>
          <input v-model="form.invoice_date" type="date" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">رقم حساب المحطة</label>
          <input v-model="form.station_account_number" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">مكتب المبيعات</label>
          <input v-model="form.sales_office" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">رقم الإيصال المالي</label>
          <input v-model="form.financial_receipt_number" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">منتج الوقود</label>
          <select v-model="form.fuel_type" class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
            <option value="">اختر المنتج</option>
            <option v-for="f in fuelProducts" :key="f.name" :value="f.name">{{ f.fuel_name }}</option>
          </select>
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">مبلغ الإيداع (د.ل)</label>
        <input v-model.number="form.deposit_amount" type="number" step="0.01" min="0" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">المرجع</label>
        <input v-model="form.reference" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" placeholder="رقم المرجع أو الملاحظة" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
        <textarea v-model="form.notes" rows="2" class="w-full border border-gray-300 rounded-lg px-4 py-2.5"></textarea>
      </div>
      <div class="flex gap-3 pt-4">
        <button type="submit" :disabled="saving" class="bg-primary text-white px-6 py-2.5 rounded-lg disabled:opacity-50">
          {{ saving ? 'جاري الحفظ...' : 'حفظ' }}
        </button>
        <router-link to="/finance/deposits" class="px-6 py-2.5 border border-gray-300 rounded-lg">إلغاء</router-link>
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
const form = ref({
  station: '',
  invoice_number: '',
  invoice_date: '',
  station_account_number: '',
  sales_office: '',
  financial_receipt_number: '',
  fuel_type: '',
  deposit_amount: '',
  reference: '',
  notes: '',
})
const stations = ref([])
const fuelProducts = ref([])
onMounted(async () => {
  const [sRes, fRes] = await Promise.all([api.get('/stations/'), api.get('/fuel-types/')])
  stations.value = sRes.data.results || sRes.data
  fuelProducts.value = fRes.data.results || fRes.data
  if (isEdit.value) {
    const { data } = await api.get(`/station-deposits/${route.params.id}/`)
    form.value = {
      station: data.station,
      invoice_number: data.invoice_number || '',
      invoice_date: data.invoice_date || '',
      station_account_number: data.station_account_number || '',
      sales_office: data.sales_office || '',
      financial_receipt_number: data.financial_receipt_number || '',
      fuel_type: data.fuel_product || data.fuel_type || '',
      deposit_amount: data.deposit_amount,
      reference: data.reference || '',
      notes: data.notes || '',
    }
  }
})
const save = async () => {
  error.value = ''
  saving.value = true
  try {
    const payload = {
      ...form.value,
      deposit_amount: Number(form.value.deposit_amount),
      fuel_product: form.value.fuel_type || undefined,
    }
    if (isEdit.value) await api.put(`/station-deposits/${route.params.id}/`, payload)
    else await api.post('/station-deposits/', payload)
    router.push('/finance/deposits')
  } catch (e) {
    error.value = friendlyError(e)
  } finally { saving.value = false }
}
</script>
