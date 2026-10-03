<template>
  <div class="max-w-3xl mx-auto">
    <Toast ref="toast" />
    <h2 class="text-xl font-bold mb-1">معالج إعداد محطة</h2>
    <p class="text-sm text-gray-500 mb-6">إنشاء محطة جديدة مع جزرها ومضخاتها وخزاناتها وعداداتها في خطوة واحدة</p>

    <!-- Stepper -->
    <div class="flex items-center gap-2 mb-8">
      <template v-for="(s, i) in steps" :key="s.title">
        <div class="flex items-center gap-2 cursor-pointer" @click="goTo(i)">
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition"
            :class="i < step ? 'bg-green-500 text-white' : i === step ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'">
            {{ i < step ? '✓' : i + 1 }}
          </div>
          <span class="text-sm hidden sm:block" :class="i === step ? 'font-bold text-gray-800' : 'text-gray-400'">{{ s.title }}</span>
        </div>
        <div v-if="i < steps.length - 1" class="flex-1 h-0.5" :class="i < step ? 'bg-green-500' : 'bg-gray-200'" />
      </template>
    </div>

    <!-- Step 1: Station info -->
    <div v-if="step === 0" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">اسم المحطة *</label>
        <input v-model="form.station.station_name" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">وقت إقفال اليوم *</label>
        <input v-model="form.station.day_close_time" type="time" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
        <p class="text-xs text-gray-500 mt-1">
          يحدد وقت بدء دورة قراءات اليوم: إذا اخترت 11:00 تكون الدورة من 11:00 صباحاً حتى 11:00 صباحاً في اليوم التالي.
        </p>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
        <input v-model="form.station.address" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
      </div>
      <div class="grid sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">نوع العلاقة</label>
          <select v-model="form.station.relationship_type" class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
            <option value="owned">ملكية</option>
            <option value="rented">إيجار</option>
            <option value="agency">وكالة</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">شركة التسويق</label>
          <select v-model="form.station.marketing_company" class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
            <option value="">— بدون —</option>
            <option v-for="c in marketingCompanies" :key="c.name" :value="c.name">{{ c.company_name }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Step 2: Islands & machines (per-island counts — islands may differ) -->
    <div v-if="step === 1" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">عدد الجزر</label>
          <input v-model.number="islandsCount" type="number" min="0" max="20" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">عدادات لكل مضخة (افتراضي)</label>
          <input v-model.number="form.meters_per_machine" type="number" min="0" max="10" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
        </div>
      </div>
      <p class="text-xs text-gray-500">كل جزيرة يمكن أن تحتوي عدداً مختلفاً من المضخات — عدّل كل سطر على حدة</p>
      <div class="space-y-2">
        <div v-for="(isl, i) in form.islands" :key="i" class="flex items-center gap-3 border border-gray-200 rounded-lg p-3">
          <span class="font-medium text-sm w-20">جزيرة {{ i + 1 }}</span>
          <label class="text-xs text-gray-500">مضخات</label>
          <input v-model.number="isl.machines" type="number" min="0" max="20" class="w-20 border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
          <label class="text-xs text-gray-500">عدادات/مضخة</label>
          <input v-model.number="isl.meters" type="number" min="0" max="10" class="w-20 border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
        </div>
      </div>
      <p v-if="!totalMachines || !form.meters_per_machine" class="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
        ⚠️ بدون مضخات أو عدادات لن تتمكن من تسجيل قراءات المناوبات
      </p>
      <div class="text-sm text-gray-600">
        <p class="font-medium mb-2">معاينة:</p>
        <ul class="space-y-1 text-gray-500">
          <li v-for="line in machinePreview" :key="line">{{ line }}</li>
          <li v-if="!machinePreview.length" class="text-gray-400">لا توجد جزر</li>
        </ul>
      </div>
    </div>

    <!-- Step 3: Tanks -->
    <div v-if="step === 2" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
      <div v-for="(t, i) in form.tanks" :key="i" class="border border-gray-200 rounded-lg p-4 space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-sm font-bold text-gray-700">خزان {{ i + 1 }}</span>
          <button v-if="form.tanks.length > 1" type="button" @click="form.tanks.splice(i, 1)" class="text-red-500 text-sm hover:underline">حذف</button>
        </div>
        <div class="grid sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">نوع الوقود *</label>
            <select v-model="t.fuel_type" class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
              <option v-for="f in fuelTypes" :key="f.name" :value="f.name">{{ f.fuel_name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">السعة (لتر) *</label>
            <input v-model.number="t.capacity" type="number" min="1" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">اسم الخزان (اختياري)</label>
          <input v-model="t.tank_name" :placeholder="`خزان ${i + 1} (${t.fuel_type})`" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">المستوى الافتتاحي (اختياري — لتر)</label>
          <input v-model.number="t.current_level" type="number" min="0" :max="t.capacity || undefined" placeholder="0" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
          <p class="text-xs text-gray-400 mt-1">اتركه فارغاً إذا كانت المحطة فارغة عند التسليم</p>
        </div>
      </div>
      <button type="button" @click="addTank" class="w-full border-2 border-dashed border-gray-300 rounded-lg py-2.5 text-gray-500 hover:border-primary hover:text-primary transition">
        + إضافة خزان
      </button>
    </div>

    <!-- Step 4: Review -->
    <div v-if="step === 3" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
      <div class="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
        <div class="flex justify-between"><span class="text-gray-500">المحطة</span><span class="font-bold">{{ form.station.station_name }}</span></div>
        <div class="flex justify-between"><span class="text-gray-500">الجزر</span><span>{{ form.islands.length }} جزيرة</span></div>
        <div class="flex justify-between"><span class="text-gray-500">المضخات</span><span>{{ totalMachines }} مضخة</span></div>
        <div class="flex justify-between"><span class="text-gray-500">العدادات</span><span>{{ totalMeters }} عداد</span></div>
        <div class="flex justify-between"><span class="text-gray-500">الخزانات</span><span>{{ form.tanks.length }} خزان</span></div>
      </div>
      <div class="text-sm">
        <p class="font-medium mb-2 text-gray-700">ربط العدادات:</p>
        <ul class="space-y-1 text-gray-500">
          <li v-for="line in meterPreview" :key="line">{{ line }}</li>
        </ul>
        <p class="text-xs text-gray-400 mt-2">سيتم ربط كل عداد تلقائياً بنوع وقود وخزان مطابق، وترقيم العدادات بحسب المضخة (M01A، M01B...)</p>
      </div>
      <p v-if="creating" class="text-sm text-gray-500 flex items-center gap-2">
        <span class="inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
        جاري إنشاء المحطة... لا تغلق الصفحة
      </p>
    </div>

    <!-- Done -->
    <div v-if="step === 4" class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
      <div class="text-5xl mb-4">✅</div>
      <h3 class="text-lg font-bold mb-2">تم إنشاء المحطة بنجاح</h3>
      <p class="text-sm text-gray-500 mb-6">{{ result.islands }} جزر، {{ result.machines }} مضخة، {{ result.tanks }} خزان، {{ result.meters }} عداد</p>
      <div class="flex gap-3 justify-center">
        <button @click="openStation" class="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90">فتح صفحة المحطة</button>
        <button @click="reset" class="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50">إضافة محطة أخرى</button>
      </div>
    </div>

    <!-- Nav buttons -->
    <div v-if="step < 4" class="flex gap-3 mt-6">
      <button v-if="step > 0" @click="step--" class="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50">السابق</button>
      <button v-if="step < 3" @click="next" class="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90">التالي</button>
      <button v-if="step === 3" @click="create" :disabled="creating" class="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90 disabled:opacity-50">
        {{ creating ? 'جاري الإنشاء...' : 'إنشاء المحطة' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../api'
import Toast from '../../components/Toast.vue'

const router = useRouter()

const steps = [
  { title: 'بيانات المحطة' },
  { title: 'الجزر والمضخات' },
  { title: 'الخزانات' },
  { title: 'مراجعة وإنشاء' },
]

const step = ref(0)
const creating = ref(false)
const toast = ref(null)
const result = ref({})
const stationName = ref('')

const marketingCompanies = ref([])
const fuelTypes = ref([])

const defaultTank = () => ({ fuel_type: '', capacity: '', tank_name: '', current_level: '' })
const defaultIsland = () => ({ machines: 2, meters: 2 })
const form = ref({
  station: { station_name: '', address: '', relationship_type: 'owned', marketing_company: '', day_close_time: '11:00' },
  islands: [defaultIsland(), defaultIsland()],
  meters_per_machine: 2,
  tanks: [defaultTank()],
})

// islands_count is derived: the input grows/shrinks the per-island spec array
const islandsCount = computed({
  get: () => form.value.islands.length,
  set: (n) => {
    n = Math.max(0, Math.min(20, Number(n) || 0))
    while (form.value.islands.length < n) form.value.islands.push(defaultIsland())
    while (form.value.islands.length > n) form.value.islands.pop()
  },
})

const totalMachines = computed(() => form.value.islands.reduce((s, i) => s + (Number(i.machines) || 0), 0))
const totalMeters = computed(() => form.value.islands.reduce((s, i) => s + (Number(i.machines) || 0) * (Number(i.meters) || 0), 0))
const machinePreview = computed(() => {
  const lines = []
  let m = 1
  form.value.islands.forEach((isl, idx) => {
    const count = Number(isl.machines) || 0
    if (!count) { lines.push(`جزيرة ${idx + 1}: بدون مضخات`); return }
    const nums = []
    for (let k = 0; k < count; k++) nums.push(m++)
    lines.push(`جزيرة ${idx + 1}: ${count} مضخات (مضخة ${nums.join(', مضخة ')}) — ${isl.meters} عداد/مضخة`)
  })
  return lines
})

const meterPreview = computed(() => {
  const tanks = form.value.tanks.filter(t => t.fuel_type)
  if (!tanks.length) return []
  const lines = []
  let m = 1
  form.value.islands.forEach((isl) => {
    const mcount = Number(isl.machines) || 0
    const sper = Number(isl.meters) || 0
    for (let k = 0; k < mcount; k++) {
      const codes = Array.from({ length: sper }, (_, s) => `M${String(m).padStart(2, '0')}${String.fromCharCode(65 + s)}`)
      const fuels = Array.from({ length: sper }, (_, s) => tanks[s % tanks.length].fuel_type)
      lines.push(`مضخة ${m}: ${codes.map((c, i) => `${c} (${fuels[i]})`).join('، ')}`)
      m++
    }
  })
  return lines
})

const addTank = () => form.value.tanks.push(defaultTank())

const next = () => {
  if (step.value === 0 && !form.value.station.station_name.trim()) {
    toast.value.show('الرجاء إدخال اسم المحطة', 'error')
    return
  }
  if (step.value === 2) {
    const bad = form.value.tanks.find(t => !t.fuel_type || !t.capacity || t.capacity <= 0)
    if (bad) {
      toast.value.show('أكمل نوع الوقود والسعة لكل خزان', 'error')
      return
    }
  }
  step.value++
}

const goTo = (i) => {
  // Only jump backwards — forward jumps must go through `next` validation
  if (i < step.value) step.value = i
}

const create = async () => {
  creating.value = true
  try {
    const payload = {
      station: { ...form.value.station },
      islands: form.value.islands.map(i => ({ machines: Number(i.machines) || 0, meters: Number(i.meters) || 0 })),
      islands_count: form.value.islands.length,
      machines_per_island: 2,
      meters_per_machine: form.value.meters_per_machine || 0,
      tanks: form.value.tanks.map(t => ({ fuel_type: t.fuel_type, capacity: t.capacity, tank_name: t.tank_name || null, current_level: t.current_level || 0 })),
    }
    if (!payload.station.marketing_company) delete payload.station.marketing_company
    const { data } = await api.post('/setup-station/', payload)
    result.value = data.created || data
    stationName.value = data.station
    step.value = 4
    toast.value.show('تم إنشاء المحطة بنجاح')
  } catch (e) {
    const raw = e.response?.data?.message || e.response?.data?.exc || e.message
    const msg = typeof raw === 'string' ? raw.replace(/<[^>]+>/g, '').split('\n')[0].substring(0, 200) : 'خطأ في الإنشاء'
    toast.value.show(msg, 'error')
  } finally { creating.value = false }
}

const openStation = () => router.push(`/stations/${stationName.value}`)

const reset = () => {
  form.value = {
    station: { station_name: '', address: '', relationship_type: 'owned', marketing_company: '', day_close_time: '11:00' },
    islands: [defaultIsland(), defaultIsland()],
    meters_per_machine: 2,
    tanks: [defaultTank()],
  }
  step.value = 0
}

onMounted(async () => {
  const [fRes, cRes] = await Promise.all([
    api.get('/fuel-types/'),
    api.get('/marketing-companies/'),
  ])
  fuelTypes.value = fRes.data.results || fRes.data
  marketingCompanies.value = cRes.data.results || cRes.data
  if (fuelTypes.value.length) form.value.tanks[0].fuel_type = fuelTypes.value[0].name
})
</script>
