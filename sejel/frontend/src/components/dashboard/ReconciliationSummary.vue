<script setup>
// Financial reconciliation summary (prompt §15/§16): every number is the
// backend's (Reconciliation doc + Expense aggregate) — the SPA only formats.
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import Icon from './Icon.vue'
import HelpTip from '../HelpTip.vue'
import { fmtMoney } from './format'
import { DIFF_TYPE, label } from '../../utils/labels'

const props = defineProps({
  kpis: { type: Object, required: true },
})

const router = useRouter()

const hasData = computed(() => props.kpis.expected_sales !== null && props.kpis.expected_sales !== undefined)

const diffStyle = computed(() => {
  const t = props.kpis.difference_type
  if (t === 'matched') return { chip: 'bg-green-50 text-green-700 border-green-200', icon: 'check', text: 'مطابق' }
  if (t === 'surplus') return { chip: 'bg-amber-50 text-amber-700 border-amber-200', icon: 'alert', text: 'فائض' }
  if (t === 'shortage') return { chip: 'bg-red-50 text-red-700 border-red-200', icon: 'xcircle', text: 'عجز' }
  return null
})
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
    <div class="flex items-center justify-between mb-3">
      <h3 class="font-bold flex items-center gap-2"><Icon name="scale" :size="17" class="text-gray-400" /> المطابقة المالية
        <HelpTip text="الفرق = إجمالي التحصيل (نقدي + قسائم + POS) ناقص المبيعات المتوقعة (اللترات × سعر اللتر المجمّد). المصروفات لا تقلل المبيعات — تُخصم من النقد الصافي فقط." />
      </h3>
      <span
        v-if="diffStyle && kpis.reconciliation_id"
        class="text-[11px] border rounded-full px-2 py-0.5 cursor-pointer flex items-center gap-1"
        :class="diffStyle.chip"
        title="فتح تفاصيل المطابقة"
        @click="router.push(`/finance/reconciliations/${kpis.reconciliation_id}`)"
      >
        <Icon :name="diffStyle.icon" :size="12" /> {{ diffStyle.text }}
      </span>
    </div>

    <template v-if="hasData">
      <div class="space-y-2.5 text-sm">
        <div class="flex items-center justify-between">
          <span class="text-gray-500 flex items-center gap-1.5"><Icon name="receipt" :size="14" /> المبيعات المتوقعة</span>
          <b class="tabular-nums">{{ fmtMoney(kpis.expected_sales) }}</b>
        </div>
        <div class="border-t border-dashed border-gray-100 pt-2.5 space-y-2">
          <div class="text-[11px] text-gray-400 font-medium">التحصيل</div>
          <div class="flex items-center justify-between">
            <span class="text-gray-500 flex items-center gap-1.5 pr-3"><Icon name="banknote" :size="14" /> نقدي</span>
            <b class="tabular-nums">{{ fmtMoney(kpis.total_cash) }}</b>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-gray-500 flex items-center gap-1.5 pr-3"><Icon name="ticket" :size="14" /> قسائم</span>
            <b class="tabular-nums">{{ fmtMoney(kpis.total_vouchers) }}</b>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-gray-500 flex items-center gap-1.5 pr-3"><Icon name="card" :size="14" /> POS</span>
            <b class="tabular-nums">{{ fmtMoney(kpis.total_pos) }}</b>
          </div>
          <div class="flex items-center justify-between border-t border-gray-100 pt-2">
            <span class="font-medium">إجمالي التحصيل</span>
            <b class="tabular-nums">{{ fmtMoney(kpis.total_collection) }}</b>
          </div>
        </div>
        <div class="border-t border-dashed border-gray-100 pt-2.5 space-y-2">
          <div class="text-[11px] text-gray-400 font-medium">المركز النقدي</div>
          <div class="flex items-center justify-between">
            <span class="text-gray-500 flex items-center gap-1.5"><Icon name="wallet" :size="14" /> المصروفات</span>
            <b class="tabular-nums">{{ fmtMoney(kpis.total_expenses) }}</b>
          </div>
          <div class="flex items-center justify-between">
            <span class="font-medium">النقد الصافي</span>
            <b class="tabular-nums">{{ fmtMoney(kpis.net_cash) }}</b>
          </div>
        </div>
      </div>
    </template>
    <div v-else class="text-sm text-gray-400 py-6 text-center">
      لا توجد مطابقة مسجلة بعد — تُعرض الأرقام فور إقفال المناوبة
    </div>
  </div>
</template>
