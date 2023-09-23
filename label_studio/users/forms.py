"""This file and its contents are licensed under the Apache License 2.0. Please see the included NOTICE for copyright information and LICENSE for a copy of the license.
"""
import os
import logging

from datetime import datetime
from django import forms
from django.contrib import auth
from django.conf import settings
from datetime import timedelta
from users.models import OTP

from users.models import User


EMAIL_MAX_LENGTH = 256
PASS_MAX_LENGTH = 64
PASS_MIN_LENGTH = 8
USERNAME_MAX_LENGTH = 30
DISPLAY_NAME_LENGTH = 100
USERNAME_LENGTH_ERR = 'Please enter a username 30 characters or fewer in length.'
DISPLAY_NAME_LENGTH_ERR = 'Please enter a display name 100 characters or fewer in length.'
PASS_LENGTH_ERR = 'Please enter a password 8-12 characters in length.'
INVALID_USER_ERROR = 'The email and password you entered don\'t match.'

logger = logging.getLogger(__name__)


class LoginForm(forms.Form):
    """ For logging in to the app and all - session based
    """
    # use username instead of email when LDAP enabled
    email = forms.CharField(label='User') if settings.USE_USERNAME_FOR_LOGIN\
        else forms.EmailField(label='Email')
    password = forms.CharField(widget=forms.PasswordInput())
    persist_session = forms.BooleanField(widget=forms.CheckboxInput(), required=False)

    def clean(self, *args, **kwargs):
        cleaned = super(LoginForm, self).clean()
        email = cleaned.get('email', '').lower()
        password = cleaned.get('password', '')
        if len(email) >= EMAIL_MAX_LENGTH:
            raise forms.ValidationError('Email is too long')

        # advanced way for user auth
        user = settings.USER_AUTH(User, email, password)

        # regular access
        if user is None:
            user = auth.authenticate(email=email, password=password)

        if user and user.is_active:
            persist_session = cleaned.get('persist_session', False)
            return {'user': user, 'persist_session': persist_session}
        else:
            raise forms.ValidationError(INVALID_USER_ERROR)


class UserSignupForm(forms.Form):
    email = forms.EmailField(label="Work Email", error_messages={'required': 'Invalid email'})
    password = forms.CharField(max_length=PASS_MAX_LENGTH,
                               error_messages={'required': PASS_LENGTH_ERR},
                               widget=forms.TextInput(attrs={'type': 'password'}))
    # re_password = forms.CharField(max_length=PASS_MAX_LENGTH,
    #                                 error_messages={'required': PASS_LENGTH_ERR},
    #                                 widget=forms.TextInput(attrs={'type': 'password'}))
    re_password = forms.CharField(max_length=PASS_MAX_LENGTH,
                                  error_messages={'required': PASS_LENGTH_ERR},
                                  widget=forms.TextInput(attrs={'type': 'password'}))
    first_name = forms.CharField(max_length=30, required=True, label="First Name")
    last_name = forms.CharField(max_length=30, required=True, label="Last Name")
    allow_newsletters = forms.BooleanField(required=False)

    # def clean_password(self):
    #     password = self.cleaned_data['password']
    #     if len(password) < PASS_MIN_LENGTH:
    #         raise forms.ValidationError(PASS_LENGTH_ERR)
    #     # if password != self.cleaned_data['re_password']:
    #     #     raise forms.ValidationError('Passwords do not match')
    #     return validate_password(self.cleaned_data['password'])
    
    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get("password")
        re_password = cleaned_data.get("re_password")

        if password != re_password:
            raise forms.ValidationError("Passwords do not match.")
        return cleaned_data
    
    def clean_password(self):
        return validate_password(self.cleaned_data['password'])

    def clean_first_name(self):
        first_name = self.cleaned_data['first_name']
        if len(first_name) > DISPLAY_NAME_LENGTH:
            raise forms.ValidationError(DISPLAY_NAME_LENGTH_ERR)
        return first_name
    
    def clean_last_name(self):
        last_name = self.cleaned_data['last_name']
        if len(last_name) > DISPLAY_NAME_LENGTH:
            raise forms.ValidationError(DISPLAY_NAME_LENGTH_ERR)
        return last_name

    def clean_username(self):
        username = self.cleaned_data.get('username')
        if username and User.objects.filter(username=username.lower()).exists():
            raise forms.ValidationError('User with username already exists')
        return username

    def clean_email(self):
        email = self.cleaned_data.get('email').lower()
        if len(email) >= EMAIL_MAX_LENGTH:
            raise forms.ValidationError('Email is too long')

        if email and User.objects.filter(email=email).exists():
            raise forms.ValidationError('User with this email already exists')
        return email

    def save(self):
        cleaned = self.cleaned_data
        password = cleaned['password']
        email = cleaned['email'].lower()
        first_name = cleaned['first_name']
        last_name = cleaned['last_name']
        allow_newsletters = None
        if 'allow_newsletters' in cleaned:
            allow_newsletters = cleaned['allow_newsletters']
        user = User.objects.create_user(email, password, first_name=first_name, last_name=last_name, allow_newsletters=allow_newsletters)
        return user



class UserProfileForm(forms.ModelForm):
    """ This form is used in profile account pages
    """
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'phone', 'allow_newsletters')


#new changes
class RequestPasswordResetForm(forms.Form):
    email = forms.EmailField(label="Your Email")

    def clean_email(self):
        email = self.cleaned_data.get('email').lower()
        if not User.objects.filter(email=email).exists():
            raise forms.ValidationError('No account with this email found.')
        return email

class OTPVerificationForm(forms.Form):
    otp = forms.CharField(label="Enter OTP", max_length=6, min_length=6)

    def clean_otp(self):
        otp = self.cleaned_data.get('otp')
        if not otp.isdigit():
            raise forms.ValidationError('OTP should be numeric.')
        return otp

class SetNewPasswordForm(forms.Form):
    password = forms.CharField(
        max_length=PASS_MAX_LENGTH,
        error_messages={'required': PASS_LENGTH_ERR},
        widget=forms.PasswordInput(attrs={'placeholder': 'New Password'})
    )
    re_password = forms.CharField(
        max_length=PASS_MAX_LENGTH,
        error_messages={'required': PASS_LENGTH_ERR},
        widget=forms.PasswordInput(attrs={'placeholder': 'Confirm New Password'})
    )

    def clean_password(self):
        password = self.cleaned_data['password']
        if len(password) < PASS_MIN_LENGTH:
            raise forms.ValidationError(PASS_LENGTH_ERR)
        return validate_password(self.cleaned_data['password'])

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get("password")
        re_password = cleaned_data.get("re_password")

        if password != re_password:
            raise forms.ValidationError("Passwords do not match.")
        return cleaned_data
    
from datetime import datetime, timedelta
import random

# ... [other imports]

logger = logging.getLogger(__name__)

OTP_EXPIRY_DURATION = timedelta(minutes=15)  # OTP expires after 15 minutes


class OTPVerificationForm(forms.Form):
    otp = forms.CharField(label="Enter OTP", max_length=6, min_length=6)

    def clean_otp(self):
        otp = self.cleaned_data.get('otp')
        if not otp.isdigit():
            raise forms.ValidationError('OTP should be numeric.')
        
        # Check if OTP is still valid
        otp_obj = OTP.objects.filter(otp=otp).first()
        if not otp_obj:
            raise forms.ValidationError('Invalid OTP.')
        
        if datetime.now() > otp_obj.created_at + OTP_EXPIRY_DURATION:
            raise forms.ValidationError('OTP has expired. Please request a new one.')
        
        return otp

class SetNewPasswordForm(forms.Form):
    password = forms.CharField(
        max_length=PASS_MAX_LENGTH,
        error_messages={'required': PASS_LENGTH_ERR},
        widget=forms.PasswordInput(attrs={'placeholder': 'New Password'})
    )
    re_password = forms.CharField(
        max_length=PASS_MAX_LENGTH,
        error_messages={'required': PASS_LENGTH_ERR},
        widget=forms.PasswordInput(attrs={'placeholder': 'Confirm New Password'})
    )

    def clean_password(self):
        password = self.cleaned_data['password']
        if len(password) < PASS_MIN_LENGTH:
            raise forms.ValidationError(PASS_LENGTH_ERR)
        if not any(char.isdigit() for char in password):
            raise forms.ValidationError('Password must contain at least one digit.')
        if not any(char.isalpha() for char in password):
            raise forms.ValidationError('Password must contain at least one letter.')
        if not any(char.isupper() for char in password):
            raise forms.ValidationError('Password must contain at least one uppercase letter.')
        if not any(char in '!@#$%^&*()_+' for char in password):
            raise forms.ValidationError('Password must contain at least one of the special characters: !@#$%^&*()_+')
        return password

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get("password")
        re_password = cleaned_data.get("re_password")

        if password != re_password:
            raise forms.ValidationError("Passwords do not match.")
        
        return cleaned_data


def validate_password(password):
    if len(password) < PASS_MIN_LENGTH:
        raise forms.ValidationError(PASS_LENGTH_ERR)
    if not any(char.isdigit() for char in password):
        raise forms.ValidationError('Password must contain at least one digit.')
    if not any(char.isalpha() for char in password):
        raise forms.ValidationError('Password must contain at least one letter.')
    if not any(char.isupper() for char in password):
        raise forms.ValidationError('Password must contain at least one uppercase letter.')
    if not any(char in '!@#$%^&*()_+' for char in password):
        raise forms.ValidationError('Password must contain at least one of the special characters: !@#$%^&*()_+')
    return password