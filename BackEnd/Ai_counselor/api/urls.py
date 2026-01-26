from django.urls import path
from . import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    # path("", views.get_view, name="get"),
    # path("add/", views.add, name="add"),
    # path("update/<int:pk>", views.update, name="update"),
    # path("delete/<int:pk>", views.delete, name="delete"),
    path("register/", views.register, name="register"),
    path("login/", views.login_view, name="login"), # Updated to login_view

    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('forgot-password/', views.password_reset_request, name='password_reset_request'),
    path('reset-password/', views.password_reset, name='password_reset'),
]