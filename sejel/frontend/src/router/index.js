import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login/',
    component: () => import('../views/auth/LoginView.vue'),
    meta: { public: true },
  },
  {
    path: '/',
    component: () => import('../layouts/DefaultLayout.vue'),
    children: [
      { path: '', name: 'dashboard', component: () => import('../views/dashboard/DashboardView.vue') },

      // Core - Stations
      { path: 'stations', name: 'stations', component: () => import('../views/stations/StationList.vue') },
      { path: 'stations/create', name: 'station-create', component: () => import('../views/stations/StationForm.vue') },
      { path: 'stations/:id', name: 'station-detail', component: () => import('../views/stations/StationDetail.vue') },
      { path: 'stations/:id/edit', name: 'station-edit', component: () => import('../views/stations/StationForm.vue') },

      // Core - Islands
      { path: 'islands', name: 'islands', component: () => import('../views/islands/IslandList.vue') },
      { path: 'islands/create', name: 'island-create', component: () => import('../views/islands/IslandForm.vue') },
      { path: 'islands/:id/edit', name: 'island-edit', component: () => import('../views/islands/IslandForm.vue') },

      // Core - Machines (pumps)
      { path: 'machines', name: 'machines', component: () => import('../views/machines/MachineList.vue') },
      { path: 'machines/create', name: 'machine-create', component: () => import('../views/machines/MachineForm.vue') },
      { path: 'machines/:id/edit', name: 'machine-edit', component: () => import('../views/machines/MachineForm.vue') },

      // Core - Meters
      { path: 'meters', name: 'meters', component: () => import('../views/meters/MeterList.vue') },
      { path: 'meters/create', name: 'meter-create', component: () => import('../views/meters/MeterForm.vue') },
      { path: 'meters/:id/edit', name: 'meter-edit', component: () => import('../views/meters/MeterForm.vue') },

      // Core - Tanks
      { path: 'tanks', name: 'tanks', component: () => import('../views/tanks/TankList.vue') },
      { path: 'tanks/create', name: 'tank-create', component: () => import('../views/tanks/TankForm.vue') },
      { path: 'tanks/:id', name: 'tank-detail', component: () => import('../views/tanks/TankDetail.vue') },
      { path: 'tanks/:id/edit', name: 'tank-edit', component: () => import('../views/tanks/TankForm.vue') },

      // Employees
      { path: 'employees', name: 'employees', component: () => import('../views/employees/EmployeeList.vue') },
      { path: 'employees/create', name: 'employee-create', component: () => import('../views/employees/EmployeeForm.vue') },
      { path: 'employees/:id/edit', name: 'employee-edit', component: () => import('../views/employees/EmployeeForm.vue') },

      // Shifts
      { path: 'shifts/definitions', name: 'definitions', component: () => import('../views/shifts/DefinitionList.vue') },
      { path: 'shifts/definitions/create', name: 'definition-create', component: () => import('../views/shifts/DefinitionForm.vue') },
      { path: 'shifts/definitions/:id/edit', name: 'definition-edit', component: () => import('../views/shifts/DefinitionForm.vue') },
      { path: 'shifts', name: 'shifts', component: () => import('../views/shifts/ShiftList.vue') },
      { path: 'shifts/create', name: 'shift-create', component: () => import('../views/shifts/ShiftForm.vue') },
      { path: 'shifts/:id', name: 'shift-detail', component: () => import('../views/shifts/ShiftDetail.vue') },
      { path: 'shifts/:id/readings', name: 'shift-readings', component: () => import('../views/shifts/ReadingForm.vue') },
      { path: 'shifts/:id/close', name: 'shift-close', component: () => import('../views/shifts/CloseShift.vue') },
      { path: 'shifts/gaps', name: 'meter-gaps', component: () => import('../views/shifts/MeterGapReport.vue') },

      // Finance
      { path: 'finance/cash', name: 'cash', component: () => import('../views/finance/CashList.vue') },
      { path: 'finance/vouchers', name: 'vouchers', component: () => import('../views/finance/VoucherList.vue') },
      { path: 'finance/pos', name: 'pos', component: () => import('../views/finance/POSList.vue') },
      { path: 'finance/expenses', name: 'expenses', component: () => import('../views/finance/ExpenseList.vue') },
      { path: 'finance/expenses/create', name: 'expense-create', component: () => import('../views/finance/ExpenseForm.vue') },
      { path: 'finance/expenses/:id/edit', name: 'expense-edit', component: () => import('../views/finance/ExpenseForm.vue') },
      { path: 'finance/settlements', name: 'settlements', component: () => import('../views/finance/SettlementList.vue') },
      { path: 'finance/settlements/create', name: 'settlement-create', component: () => import('../views/finance/SettlementForm.vue') },
      { path: 'finance/settlements/:id', name: 'settlement-detail', component: () => import('../views/finance/SettlementDetail.vue') },
      { path: 'finance/reconciliations', name: 'reconciliations', component: () => import('../views/finance/ReconciliationList.vue') },
      { path: 'finance/reconciliations/:id', name: 'reconciliation-detail', component: () => import('../views/finance/ReconciliationDetail.vue') },

      // Inventory
      { path: 'inventory/deliveries', name: 'deliveries', component: () => import('../views/inventory/DeliveryList.vue') },
      { path: 'inventory/deliveries/create', name: 'delivery-create', component: () => import('../views/inventory/DeliveryForm.vue') },
      { path: 'inventory/deliveries/:id', name: 'delivery-detail', component: () => import('../views/inventory/DeliveryDetail.vue') },
      { path: 'inventory/tank-readings', name: 'tank-readings', component: () => import('../views/inventory/TankReadingList.vue') },
      { path: 'inventory/transfers', name: 'transfers', component: () => import('../views/inventory/TransferList.vue') },
      { path: 'inventory/transfers/create', name: 'transfer-create', component: () => import('../views/inventory/TransferForm.vue') },
      { path: 'inventory/shortages', name: 'shortages', component: () => import('../views/inventory/ShortageList.vue') },
      { path: 'inventory/fuel-reconciliation', name: 'fuel-reconciliation', component: () => import('../views/inventory/FuelReconciliationList.vue') },
      { path: 'inventory/requests', name: 'delivery-requests', component: () => import('../views/inventory/RequestList.vue') },
      { path: 'inventory/requests/create', name: 'request-create', component: () => import('../views/inventory/RequestForm.vue') },
      { path: 'inventory/requests/:id', name: 'request-detail', component: () => import('../views/inventory/RequestDetail.vue') },

      // Reports
      { path: 'reports/daily', name: 'report-daily', component: () => import('../views/reports/DailyReport.vue') },
      { path: 'reports/monthly', name: 'report-monthly', component: () => import('../views/reports/MonthlyReport.vue') },
      { path: 'reports/inventory', name: 'report-inventory', component: () => import('../views/reports/InventoryReport.vue') },

      // Settings
      { path: 'settings/users', name: 'users', component: () => import('../views/settings/UsersList.vue') },
      { path: 'settings/users/create', name: 'user-create', component: () => import('../views/settings/UserForm.vue') },
      { path: 'settings/users/:id/edit', name: 'user-edit', component: () => import('../views/settings/UserForm.vue') },
      { path: 'guide', name: 'guide', component: () => import('../views/guide/GuideView.vue') },
    ],
  },
]

const router = createRouter({
  history: createWebHistory('/app/'),
  routes,
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('access_token')
  if (!to.meta.public && !token) {
    next('/app/login/')
  } else {
    next()
  }
})

export default router
