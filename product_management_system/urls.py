"""
URL configuration for product_management_system project.
"""
from django.contrib import admin
from django.urls import path, include
from productapi.views import frontend_view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', frontend_view, name='frontend'),
    path('api/products/', include('productapi.urls')),
]
