# TENANTS/admin.py

from django.contrib import admin
from .models import Tenant, PaymentTransaction

@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    list_display = ('name', 'house_number', 'tenant_id', 'phone_number', 'amount_due', 'is_paid')
    search_fields = ('name', 'house_number', 'tenant_id', 'phone_number')
    list_filter = ('is_paid',)

@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = ('tenant_id', 'checkout_request_id', 'created_at')
    search_fields = ('tenant_id', 'checkout_request_id')
