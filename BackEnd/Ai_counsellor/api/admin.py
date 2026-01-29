from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, ProfileAICache, ShortlistedUniversity, Task

# class CustomUserAdmin(UserAdmin):
#     model = User
#     list_display = ('email', 'first_name', 'last_name', 'is_active', 'is_staff', 'date_joined')
#     list_filter = ('is_staff', 'is_active')
#     ordering = ('email',)
#     search_fields = ('email', 'first_name', 'last_name')

#admin.site.register(User, CustomUserAdmin)
admin.site.register(User)
admin.site.register(ProfileAICache)
admin.site.register(ShortlistedUniversity)
admin.site.register(Task)
