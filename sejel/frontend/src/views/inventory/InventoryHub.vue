<template>
  <div>
    <h2 class="text-xl font-bold mb-6">المخزون والتوريد</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <router-link to="/inventory/deliveries" class="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition group">
        <div class="text-3xl mb-3">🚚</div>
        <h3 class="font-bold text-lg group-hover:text-primary transition">الشحنات</h3>
        <p class="text-sm text-gray-500 mt-1">توريد الوقود وتسليمه للمحطة</p>
      </router-link>
      <router-link to="/inventory/tank-readings" class="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition group">
        <div class="text-3xl mb-3">📖</div>
        <h3 class="font-bold text-lg group-hover:text-primary transition">قراءات الخزانات</h3>
        <p class="text-sm text-gray-500 mt-1">سجل قراءات مستوى الوقود</p>
      </router-link>
      <router-link to="/inventory/transfers" class="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition group">
        <div class="text-3xl mb-3">🔁</div>
        <h3 class="font-bold text-lg group-hover:text-primary transition">التحويلات</h3>
        <p class="text-sm text-gray-500 mt-1">نقل الوقود بين الخزانات</p>
      </router-link>
      <router-link to="/inventory/shortages" class="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition group">
        <div class="text-3xl mb-3">⚠️</div>
        <h3 class="font-bold text-lg group-hover:text-primary transition">النقص</h3>
        <p class="text-sm text-gray-500 mt-1">تسجيل النواقص والفرق</p>
      </router-link>
      <router-link to="/inventory/fuel-reconciliation" class="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition group">
        <div class="text-3xl mb-3">📉</div>
        <h3 class="font-bold text-lg group-hover:text-primary transition">تسوية الوقود</h3>
        <p class="text-sm text-gray-500 mt-1">مطابقة التوريد مع القراءات</p>
      </router-link>
      <router-link to="/inventory/requests" class="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition group">
        <div class="text-3xl mb-3">📝</div>
        <h3 class="font-bold text-lg group-hover:text-primary transition">طلبات التوريد</h3>
        <p class="text-sm text-gray-500 mt-1">طلب وقود إضافي</p>
      </router-link>
      <router-link to="/inventory/shipment-schedules" class="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition group">
        <div class="text-3xl mb-3">📅</div>
        <h3 class="font-bold text-lg group-hover:text-primary transition">جدول الشحنات</h3>
        <p class="text-sm text-gray-500 mt-1">جدولة التوريد القادم</p>
      </router-link>
    </div>
  </div>
</template>
