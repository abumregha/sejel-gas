<template>
  <div class="max-w-4xl">
    <div class="mb-6">
      <h2 class="text-xl font-bold">البيانات المرجعية</h2>
      <p class="text-sm text-gray-500 mt-1">
        أنواع الوقود وفئات الكوبونات وفئات المصروفات — بدونها لا يمكن إعداد محطة أو إدخال قراءات وكوبونات ومصروفات
      </p>
    </div>

    <!-- one create row per table -->
    <div
      v-for="group in groups"
      :key="group.resource"
      class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4"
      :data-testid="`ref-${group.key}`"
    >
      <h3 class="text-sm font-bold text-gray-700 mb-3">{{ group.title }}</h3>

      <div class="flex flex-wrap gap-2 items-end mb-3">
        <div>
          <label class="block text-xs text-gray-600 mb-1">{{ group.labelField }}</label>
          <input
            v-model="draft[group.key]"
            :data-testid="`ref-${group.key}-name`"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            :placeholder="group.placeholder"
          />
        </div>
        <div v-if="group.needsValue">
          <label class="block text-xs text-gray-600 mb-1">القيمة (د.ل)</label>
          <input
            v-model.number="draft[`${group.key}_value`]"
            :data-testid="`ref-${group.key}-value`"
            type="number" min="0" step="0.01"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm w-28"
          />
        </div>
        <button
          :data-testid="`ref-${group.key}-add`"
          class="bg-primary text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
          :disabled="saving === group.key || !draft[group.key]"
          @click="create(group)"
        >
          {{ saving === group.key ? 'جاري الحفظ...' : '+ إضافة' }}
        </button>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th>{{ group.labelField }}</th>
            <th v-if="group.needsValue">القيمة</th>
            <th>الحالة</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in group.rows" :key="row.name">
            <td class="font-medium">{{ row[group.labelKey] }}</td>
            <td v-if="group.needsValue" class="font-mono tabular-nums">{{ row[group.valueKey] }}</td>
            <td>
              <span :class="row.is_active === 0 ? 'badge-gray' : 'badge-green'" class="badge">
                {{ row.is_active === 0 ? 'موقوف' : 'مفعّل' }}
              </span>
            </td>
          </tr>
          <tr v-if="!group.rows.length">
            <td :colspan="group.needsValue ? 3 : 2" class="text-gray-400 text-center py-4">
              لا توجد عناصر بعد
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import api from '../../api'
import { friendlyError } from '../../errors'

const GROUPS = [
	{
		key: 'fuelTypes', resource: 'fuel-types', title: 'أنواع الوقود', labelField: 'الاسم',
		labelKey: 'fuel_name', placeholder: 'مثال: بنزين',
	},
	{
		key: 'voucherCategories', resource: 'voucher-categories', title: 'فئات الكوبونات',
		labelField: 'الاسم', labelKey: 'category_name', valueKey: 'value', needsValue: true,
		placeholder: 'مثال: 5 د.ل',
	},
	{
		key: 'expenseCategories', resource: 'expense-categories', title: 'فئات المصروفات',
		labelField: 'الاسم', labelKey: 'category_name', placeholder: 'مثال: صيانة',
	},
]

const groups = reactive(GROUPS.map((g) => ({ ...g, rows: [] })))
const draft = reactive({ fuelTypes: '', voucherCategories: '', voucherCategories_value: 5, expenseCategories: '' })
const saving = ref('')

async function load() {
	for (const group of groups) {
		const { data } = await api.get(`/${group.resource}/`, { params: { limit_page_length: 100 } })
		group.rows = data.results || data
	}
}

async function create(group) {
	const name = String(draft[group.key] || '').trim()
	if (!name) return
	const payload = { [group.labelKey]: name, is_active: 1 }
	if (group.needsValue) payload[group.valueKey] = Number(draft[`${group.key}_value`] || 0)
	saving.value = group.key
	try {
		await api.post(`/${group.resource}/`, payload)
		draft[group.key] = ''
		await load()
	} catch (e) {
		alert(friendlyError(e))
	} finally {
		saving.value = ''
	}
}

onMounted(load)
</script>
