from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

# class CustomUserAdmin(UserAdmin):
#     model = User
#     list_display = ('email', 'first_name', 'last_name', 'is_active', 'is_staff', 'date_joined')
#     list_filter = ('is_staff', 'is_active')
#     ordering = ('email',)
#     search_fields = ('email', 'first_name', 'last_name')

#admin.site.register(User, CustomUserAdmin)
admin.site.register(User)
