<template>
  <div class="max-w-4xl mx-auto">
    <h2 class="text-xl font-bold mb-6">دليل الاستخدام</h2>
    <div class="space-y-6">
      <div v-for="section in sections" :key="section.id" class="bg-white rounded-xl shadow-sm border p-6">
        <h3 class="font-bold text-lg mb-3">{{ section.icon }} {{ section.title }}</h3>
        <div class="text-sm text-gray-600 space-y-2" v-html="section.content"></div>
      </div>
    </div>
  </div>
</template>
<script setup>
const sections = [
  { id: 1, icon: '🧭', title: 'إعداد المحطة (المعالج)', content: `
    <p><strong>1.</strong> اذهب إلى <strong>إعداد محطة</strong> من القائمة — المعالج ينشئ كل شيء دفعة واحدة</p>
    <p><strong>2.</strong> املأ الاسم والعنوان ونوع العلاقة</p>
    <p><strong>3.</strong> حدد عدد <strong>الجزر</strong> و<strong>المضخات</strong> و<strong>العدادات</strong> — والترقيم تلقائي</p>
    <p><strong>4.</strong> أضف <strong>الخزانات</strong> وحدد نوع الوقود لكل خزان (بنزين أو ديزل)</p>
    <p><strong>5.</strong> للتعديل اللاحق: افتح صفحة المحطة — كل شيء في تبويبات (جزر، مضخات، عدادات، خزانات، موظفون)</p>
  `},
  { id: 2, icon: '👥', title: 'إضافة الموظفين', content: `
    <p>اذهب إلى <strong>الموظفين</strong> واضغط <strong>+ إضافة موظف</strong></p>
    <p>حدد الاسم والمنصب والمحطة</p>
  `},
  { id: 3, icon: '📋', title: 'تعريف المناوبات', content: `
    <p>اذهب إلى <strong>تعريفات المناوبات</strong></p>
    <p>حدد الاسم ووقت البدء والانتهاء والأيام والمحطة والجزيرة</p>
    <p>التعريفات تتكرر تلقائياً حسب الأيام المحددة</p>
  `},
  { id: 4, icon: '🔄', title: 'إنشاء مناوبة وتسجيل القراءات', content: `
    <p><strong>1.</strong> اذهب إلى <strong>المناوبات</strong> واضغط <strong>+ إضافة مناوبة</strong></p>
    <p><strong>2.</strong> حدد المحطة والتاريخ والمناوب</p>
    <p><strong>3.</strong> افتح المناوبة واضغط <strong>+ إضافة قراءات</strong></p>
    <p><strong>4.</strong> لكل عداد: املأ قراءة الافتتاح (احذر من فجوات العداد)</p>
    <p><strong>5.</strong> عند الانتهاء: أعد فتح الصفحة وأكمل قراءات الاختتام</p>
    <p><strong>6.</strong> اضغط <strong>إقفال المناوبة</strong> لإنشاء التسوية المالية</p>
  `},
  { id: 5, icon: '💰', title: 'التحصيل والمصروفات', content: `
    <p>التحصيل النقدي والكوبونات وPOS تُسجل من صفحة المناوبة أو من <strong>إدخال إيرادات</strong></p>
    <p>المصروفات تُسجل من قسم <strong>المصروفات</strong> (صيانة، وقود، رواتب، إيجار، أخرى)</p>
    <p>المصروفات لا تقلل المبيعات — لكنها تؤثر على صافي النقدية</p>
  `},
  { id: 6, icon: '🛢️', title: 'الشحنات والخزانات', content: `
    <p><strong>1.</strong> سجّل قراءة الخزان <strong>قبل</strong> التوريد</p>
    <p><strong>2.</strong> أضف الشحنة مع الكمية المتوقعة</p>
    <p><strong>3.</strong> سجّل قراءة الخزان <strong>بعد</strong> التوريد</p>
    <p><strong>4.</strong> النظام يحسب النقص تلقائياً</p>
    <p><strong>5.</strong> النقص يُسجّل كمطالبة منفصلة — لا يقلل من مبلغ الدفع للمورد</p>
  `},
  { id: 7, icon: '📑', title: 'تسويات الكوبونات', content: `
    <p>عندما تُسلّم الكوبونات لشركة الرحلة:</p>
    <p><strong>1.</strong> اذهب إلى <strong>تسويات الكوبونات</strong></p>
    <p><strong>2.</strong> حدد عدد الكوبونات لكل فئة (5, 6, 7, 8 د.ل)</p>
    <p><strong>3.</strong> النظام يحسب الإجمالي تلقائياً</p>
    <p><strong>4.</strong> تتبع حالة الدفع (مدفوعة / جزئية / متعارضة)</p>
  `},
  { id: 8, icon: '📊', title: 'التقارير', content: `
    <p><strong>التقرير اليومي:</strong> مبيعات وتحصيل كل المحطات ليوم معين (من التسويات الفعلية)</p>
    <p><strong>التقرير الشهري:</strong> ملخص شامل قابل للطباعة: الإجماليات، المبيعات حسب نوع الوقود، ومقارنة المحطات مع الفروق</p>
    <p><strong>المخزون:</strong> حالة الخزانات وطلبات التوريد المعلقة</p>
    <p><strong>فجوات العدادات:</strong> حركة غير محسوبة بين المناوبات</p>
    <p><strong>تصدير Excel:</strong> من صفحة المحطة أو التسوية أو المناوبة — ملف جاهز للمحاسبة</p>
  `},
]
</script>
