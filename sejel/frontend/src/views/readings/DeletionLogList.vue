<template>
  <div class="max-w-5xl">
    <div class="mb-6">
      <h2 class="text-xl font-bold">سجل حذف القراءات</h2>
      <p class="text-sm text-gray-500 mt-1">
        كل قراءة تم حذفها تبقى مسجلة هنا بقيمتها ومَن حذفها ومتى — لا يمكن تعديل أو حذف هذا السجل
      </p>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
      <table class="data-table" data-testid="deletion-log-table">
        <thead>
          <tr>
            <th>اليوم</th>
            <th>العداد</th>
            <th>القراءة السابقة</th>
            <th>القراءة الحالية</th>
            <th>اللترات</th>
            <th>السبب</th>
            <th>حذف بواسطة</th>
            <th>وقت الحذف</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in items" :key="row.name">
            <td>{{ row.shift_date || '—' }}</td>
            <td class="font-mono">{{ row.meter_code || '—' }}</td>
            <td class="font-mono tabular-nums">{{ fmt(row.start_reading) }}</td>
            <td class="font-mono tabular-nums">{{ fmt(row.end_reading) }}</td>
            <td class="font-mono tabular-nums">{{ fmt(row.liters_sold) }}</td>
            <td>
              <span v-if="row.exception_type" class="text-xs text-amber-700">{{ row.exception_type }}</span>
              <span v-if="row.notes" class="text-xs text-gray-600 block">{{ row.notes }}</span>
              <span v-if="!row.exception_type && !row.notes" class="text-xs text-gray-400">—</span>
            </td>
            <td class="text-xs">{{ row.deleted_by || '—' }}</td>
            <td class="text-xs tabular-nums">{{ String(row.deleted_at || '').slice(0, 16) }}</td>
          </tr>
        </tbody>
      </table>
      <div v-if="!items.length" class="text-gray-400 text-center py-8" data-testid="deletion-log-empty">
        لا توجد قراءات محذوفة
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../api'
import { fmtNum } from '../../components/dashboard/format'

const items = ref([])
const fmt = (v) => fmtNum(v ?? 0, 3)

async function load() {
  const { data } = await api.get('/reading-deletion-logs/', { params: { limit_page_length: 100 } })
  items.value = data.results || data
}

onMounted(load)
</script>
