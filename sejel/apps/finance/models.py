from django.db import models


class VoucherCategory(models.Model):
    name = models.CharField(max_length=200)
    name_en = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)

    class Meta:
        db_table = 'sejel_voucher_category'
        ordering = ['name']

    def __str__(self):
        return self.name


class ExpenseCategory(models.Model):
    name = models.CharField(max_length=200)
    name_en = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)

    class Meta:
        db_table = 'sejel_expense_category'
        ordering = ['name']

    def __str__(self):
        return self.name
