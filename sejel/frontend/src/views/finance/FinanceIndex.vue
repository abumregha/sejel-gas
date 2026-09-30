<template>
  <div>
    <h2 class="text-xl font-bold mb-6">الإدارة المالية</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <router-link to="/finance/income" class="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition group">
        <div class="text-3xl mb-3">💰</div>
        <h3 class="font-bold text-lg group-hover:text-primary transition">إدخال إيرادات</h3>
        <p class="text-sm text-gray-500 mt-1">إدخال المبيعات النقدية والكوبونات والإلكترونية</p>
      </router-link>
      <router-link to="/finance/daily-sales" class="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition group">
        <div class="text-3xl mb-3">📊</div>
        <h3 class="font-bold text-lg group-hover:text-primary transition">المبيعات المالية</h3>
        <p class="text-sm text-gray-500 mt-1">عرض ملخص المبيعات اليومية</p>
      </router-link>
      <router-link to="/finance/cash" class="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition group">
        <div class="text-3xl mb-3">💵</div>
        <h3 class="font-bold text-lg group-hover:text-primary transition">التحصيل النقدي</h3>
        <p class="text-sm text-gray-500 mt-1">سجل التحصيلات النقدية</p>
      </router-link>
      <router-link to="/finance/vouchers" class="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition group">
        <div class="text-3xl mb-3">🎫</div>
        <h3 class="font-bold text-lg group-hover:text-primary transition">الكوبونات</h3>
        <p class="text-sm text-gray-500 mt-1">سجل مبيعات الكوبونات</p>
      </router-link>
      <router-link to="/finance/pos" class="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition group">
        <div class="text-3xl mb-3">💳</div>
        <h3 class="font-bold text-lg group-hover:text-primary transition">واصلات POS</h3>
        <p class="text-sm text-gray-500 mt-1">سجل المبيعات الإلكترونية</p>
      </router-link>
      <router-link to="/finance/expenses" class="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition group">
        <div class="text-3xl mb-3">📤</div>
        <h3 class="font-bold text-lg group-hover:text-primary transition">المصروفات</h3>
        <p class="text-sm text-gray-500 mt-1">سجل المصروفات</p>
      </router-link>
      <router-link to="/finance/settlements" class="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition group">
        <div class="text-3xl mb-3">📑</div>
        <h3 class="font-bold text-lg group-hover:text-primary transition">تسويات الكوبونات</h3>
        <p class="text-sm text-gray-500 mt-1">تسوية وتحصيل الكوبونات</p>
      </router-link>
      <router-link to="/finance/reconciliations" class="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition group">
        <div class="text-3xl mb-3">⚖️</div>
        <h3 class="font-bold text-lg group-hover:text-primary transition">التسويات المالية</h3>
        <p class="text-sm text-gray-500 mt-1">التسويات والمطابقات المالية</p>
      </router-link>
    </div>
  </div>
</template>
