from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('core', '0001_initial'),
        ('shifts', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='ExpenseCategory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('is_active', models.BooleanField(default=True)),
                ('station', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='core.station')),
            ],
            options={
                'db_table': 'sejel_expense_category',
            },
        ),
        migrations.CreateModel(
            name='VoucherCategory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50)),
                ('value', models.DecimalField(decimal_places=3, default=0, max_digits=10)),
                ('is_active', models.BooleanField(default=True)),
            ],
            options={
                'db_table': 'sejel_voucher_category',
                'ordering': ['value'],
            },
        ),
        migrations.CreateModel(
            name='CashCollection',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('amount', models.DecimalField(decimal_places=3, max_digits=10)),
                ('time', models.DateTimeField()),
                ('reference', models.CharField(blank=True, max_length=100)),
                ('notes', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('received_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='auth.user')),
                ('shift', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='cash_collections', to='shifts.shift')),
            ],
            options={
                'db_table': 'sejel_cash_collection',
                'ordering': ['-time'],
            },
        ),
        migrations.CreateModel(
            name='Expense',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('amount', models.DecimalField(decimal_places=3, max_digits=10)),
                ('description', models.TextField()),
                ('paid_to', models.CharField(blank=True, max_length=200)),
                ('payment_method', models.CharField(choices=[('cash', 'نقدي'), ('voucher', 'كوبون'), ('other', 'أخرى')], default='cash', max_length=20)),
                ('attachment', models.ImageField(blank=True, null=True, upload_to='expenses/')),
                ('status', models.CharField(choices=[('pending', 'قيد الاعتماد'), ('approved', 'معتمد'), ('rejected', 'مرفوض')], default='pending', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('approved_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='expenses_approved', to='auth.user')),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='finance.expensecategory')),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='expenses_created', to='auth.user')),
                ('shift', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='shifts.shift')),
                ('station', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='expenses', to='core.station')),
            ],
            options={
                'db_table': 'sejel_expense',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='POSRecord',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('total_amount', models.DecimalField(decimal_places=3, max_digits=10)),
                ('transaction_count', models.PositiveIntegerField(blank=True, null=True)),
                ('notes', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('entered_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='auth.user')),
                ('shift', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='pos_records', to='shifts.shift')),
            ],
            options={
                'db_table': 'sejel_pos_record',
            },
        ),
        migrations.CreateModel(
            name='Reconciliation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('total_liters', models.DecimalField(decimal_places=3, max_digits=12)),
                ('expected_sales', models.DecimalField(decimal_places=3, max_digits=12)),
                ('total_cash', models.DecimalField(decimal_places=3, default=0, max_digits=12)),
                ('total_vouchers', models.DecimalField(decimal_places=3, default=0, max_digits=12)),
                ('total_pos', models.DecimalField(decimal_places=3, default=0, max_digits=12)),
                ('total_collection', models.DecimalField(decimal_places=3, max_digits=12)),
                ('difference', models.DecimalField(decimal_places=3, max_digits=12)),
                ('difference_type', models.CharField(choices=[('matched', 'مطابق'), ('surplus', 'فائض'), ('shortage', 'عجز')], max_length=20)),
                ('status', models.CharField(choices=[('draft', 'مسودة'), ('confirmed', 'مؤكد')], default='draft', max_length=20)),
                ('confirmed_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('confirmed_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='auth.user')),
                ('shift', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='reconciliation', to='shifts.shift')),
            ],
            options={
                'db_table': 'sejel_reconciliation',
            },
        ),
        migrations.CreateModel(
            name='Voucher',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('count', models.PositiveIntegerField()),
                ('total_value', models.DecimalField(decimal_places=3, max_digits=10)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='finance.vouchercategory')),
                ('shift', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='vouchers', to='shifts.shift')),
            ],
            options={
                'db_table': 'sejel_voucher',
            },
        ),
    ]
