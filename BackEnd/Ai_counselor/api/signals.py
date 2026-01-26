from allauth.socialaccount.signals import social_account_added
from django.dispatch import receiver
from django.contrib.auth.models import User

@receiver(social_account_added)
def social_account_added_callback(request, sociallogin, **kwargs):
    # Check if the login is from Google
    if sociallogin.account.provider == 'google':
        user = sociallogin.user
        # Extract first name and last name from the social account data
        extra_data = sociallogin.account.extra_data
        first_name = extra_data.get('given_name', '')
        last_name = extra_data.get('family_name', '')

        # Update user’s first_name and last_name fields
        user.first_name = first_name
        user.last_name = last_name
        user.save()
