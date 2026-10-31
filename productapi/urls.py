from django.urls import path
from . import views

urlpatterns=[
    path ('',views.product_list_view.as_view()),
    path('<int:product_id>/',views.product_detail_view.as_view()),
]