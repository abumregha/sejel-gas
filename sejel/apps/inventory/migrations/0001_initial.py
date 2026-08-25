from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Delivery',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('requested_quantity', models.DecimalField(decimal_places=3, max_digits=10)),
                ('expected_quantity', models.DecimalField(decimal_places=3, max_digits=10)),
                ('received_quantity', models.DecimalField(blank=True, decimal_places=3, max_digits=10, null=True)),
                ('shortage', models.DecimalField(decimal_places=3, default=0, max_digits=10)),
                ('order_date', models.DateTimeField()),
                ('arrival_date', models.DateTimeField(blank=True, null=True)),
                ('pre_reading', models.DecimalField(blank=True, decimal_places=3, max_digits=12, null=True)),
                ('post_reading', models.DecimalField(blank=True, decimal_places=3, max_digits=12, null=True)),
                ('document_number', models.CharField(blank=True, max_length=100)),
                ('status', models.CharField(choices=[('ordered', 'تم الطلب'), ('received', 'تم الاستلام'), ('claimed', 'تم المطالبة'), ('settled', 'تمت التسوية'), ('closed', 'مغلقة')], default='ordered', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('station', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='deliveries', to='core.station')),
                ('tank', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.tank')),
                ('fuel_type', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='core.fueltype')),
            ],
            options={
                'db_table': 'sejel_delivery',
                'ordering': ['-order_date'],
            },
        ),
        migrations.CreateModel(
            name='DeliveryDocument',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('document_type', models.CharField(choices=[('receipt', 'إيصال الاستلام'), ('proof_of_shortage', 'إثبات النقص'), ('other', 'أخرى')], max_length=20)),
                ('file', models.ImageField(upload_to='delivery_documents/')),
                ('uploaded_at', models.DateTimeField(auto_now_add=True)),
                ('delivery', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='documents', to='inventory.delivery')),
                ('uploaded_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'sejel_delivery_document',
            },
        ),
        migrations.CreateModel(
            name='ShortageClaim',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('shortage_amount', models.DecimalField(decimal_places=3, max_digits=10)),
                ('status', models.CharField(choices=[('not_claimed', 'غير مطالَب بها'), ('claimed', 'مطالَب بها'), ('settled', 'تمت التسوية'), ('closed', 'مغلقة')], default='not_claimed', max_length=20)),
                ('claim_date', models.DateTimeField(blank=True, null=True)),
                ('settlement_date', models.DateTimeField(blank=True, null=True)),
                ('notes', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('delivery', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='shortage_claim', to='inventory.delivery')),
            ],
            options={
                'db_table': 'sejel_shortage_claim',
            },
        ),
    ]
