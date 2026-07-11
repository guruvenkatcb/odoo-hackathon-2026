from django.db import models
from django.contrib.auth.models import User


class Item(models.Model):
    """
    Sample model showing the pattern for any resource in your app.
    Rename/duplicate this for your actual hackathon problem statement
    (e.g. Task, Order, Booking, Ticket, etc.)
    """
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='items')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title
