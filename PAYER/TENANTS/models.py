from django.db import models
from datetime import date
class Tenant(models.Model):
    name = models.CharField(max_length=255)
    house_number = models.CharField(max_length=10)
    tenant_id = models.CharField(max_length=20)
    phone_number = models.CharField(max_length=12)
    amount_due = models.IntegerField()
    is_paid = models.BooleanField(default=False)
    due_date = models.DateField(null=True)
    checkout_request_id = models.CharField(max_length=255, null=True, blank=True)
    

class PaymentTransaction(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    checkout_request_id = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"PaymentTransaction for Tenant ID {self.tenant_id}"