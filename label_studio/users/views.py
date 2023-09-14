"""This file and its contents are licensed under the Apache License 2.0. Please see the included NOTICE for copyright information and LICENSE for a copy of the license.
"""
import logging
from time import time

from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect, reverse
from django.contrib import auth
from django.conf import settings
from django.core.exceptions import PermissionDenied
from django.utils.http import is_safe_url
from django.core.mail import send_mail
from users.models import OTP
import random


from rest_framework.authtoken.models import Token

from users import forms as user_forms

from core.utils.common import load_func
from users.functions import login
from core.middleware import enforce_csrf_checks
from core.feature_flags import flag_set
from users.functions import proceed_registration
from organizations.models import Organization
from organizations.forms import OrganizationSignupForm
from django.contrib import messages
from users.models import User
from users.forms import RequestPasswordResetForm



# If you've defined the RequestPasswordResetForm somewhere else, import it. 
# Otherwise, you will need to define it.
# from <wherever_it_is_defined> import RequestPasswordResetForm


from django import forms



logger = logging.getLogger()



@login_required
def logout(request):
    auth.logout(request)
    if settings.HOSTNAME:
        redirect_url = settings.HOSTNAME
        if not redirect_url.endswith('/'):
            redirect_url += '/'
        return redirect(redirect_url)
    return redirect('/')


@enforce_csrf_checks
def user_signup(request):
    """ Sign up page
    """
    user = request.user
    next_page = request.GET.get('next')
    token = request.GET.get('token')

    # checks if the URL is a safe redirection.
    if not next_page or not is_safe_url(url=next_page, allowed_hosts=request.get_host()):
        next_page = reverse('projects:project-index')

    user_form = user_forms.UserSignupForm()
    organization_form = OrganizationSignupForm()

    if user.is_authenticated:
        return redirect(next_page)

    # make a new user
    if request.method == 'POST':
        organization = Organization.objects.first()
        if settings.DISABLE_SIGNUP_WITHOUT_LINK is True:
            if not(token and organization and token == organization.token):
                raise PermissionDenied()
        else:
            if token and organization and token != organization.token:
                raise PermissionDenied()

        user_form = user_forms.UserSignupForm(request.POST)
        organization_form = OrganizationSignupForm(request.POST)

        if user_form.is_valid():
            redirect_response = proceed_registration(request, user_form, organization_form, next_page)
            if redirect_response:
                return redirect_response

    if flag_set("fflag_feat_front_lsdv_e_297_increase_oss_to_enterprise_adoption_short"):
        return render(request, 'users/new-ui/user_signup.html', {
                'user_form': user_form,
                'organization_form': organization_form,
                'next': next_page,
                'token': token,
            })

    return render(request, 'users/user_signup.html', {
        'user_form': user_form,
        'organization_form': organization_form,
        'next': next_page,
        'token': token,
    })

def reset_password(request):
    """ Reset Password page """
    form = RequestPasswordResetForm()
    if request.method == 'POST':
        form = RequestPasswordResetForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            # Here, you'd generate and send the OTP to the provided email.
            # Save the OTP somewhere for later verification, possibly in the session.
            # For the sake of this demonstration, let's assume the OTP is '123456'.
            request.session['otp'] = '123456'
            messages.success(request, "OTP has been sent to your email!")
            return redirect('verify-otp')  # Assuming you have a URL and view named 'verify-otp'

    return render(request, 'users/reset_password.html', {'form': form, 'reset_password_url': reverse('reset-password')})

def request_password_reset(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        user = user.objects.filter(email=email).first()
        
        if user:
            # Generate OTP and save to DB
            otp_code = ''.join(random.choices('0123456789', k=6))
            OTP.objects.create(user=user, otp=otp_code)
            
            # Send OTP to user's email
            send_mail(
                'Your Password Reset OTP',
                f'Your OTP is: {otp_code}',
                'from_email@example.com',
                [email],
                fail_silently=False,
            )
            return redirect('enter_otp')  # Redirect to OTP entry page
        else:
            # Handle the case where email is not in the database
            pass

    return render(request, 'users/request_password_reset.html')

def enter_otp(request):
    context = {}
    
    if request.method == 'POST':
        entered_otp = request.POST.get('otp')
        email = request.POST.get('email')  # Assuming you're also taking email as input to match with OTP
        user = User.objects.filter(email=email).first()
        
        if user:
            otp_obj = OTP.objects.filter(user=user, otp=entered_otp, is_used=False).first()
            
            if otp_obj and otp_obj.is_valid():
                otp_obj.is_used = True
                otp_obj.save()
                # Redirect to password reset page
                return redirect('reset_password')
            else:
                context['error'] = "Invalid or expired OTP."
        else:
            context['error'] = "Invalid email."

    return render(request, 'users/enter_otp.html', context)

from django.contrib.auth.forms import SetPasswordForm

def reset_password(request):
    if request.method == 'POST':
        form = SetPasswordForm(user=request.user, data=request.POST)
        if form.is_valid():
            form.save()
            return redirect('user_login')  # Redirect to login page after successful password reset

    else:
        form = SetPasswordForm(user=request.user)

    return render(request, 'users/reset_password.html', {'form': form})


@enforce_csrf_checks
def user_login(request):
    """ Login page
    """
    user = request.user
    next_page = request.GET.get('next')

    # checks if the URL is a safe redirection.
    if not next_page or not is_safe_url(url=next_page, allowed_hosts=request.get_host()):
        next_page = reverse('projects:project-index')

    login_form = load_func(settings.USER_LOGIN_FORM)
    form = login_form()

    if user.is_authenticated:
        return redirect(next_page)

    if request.method == 'POST':
        form = login_form(request.POST)
        if form.is_valid():
            user = form.cleaned_data['user']
            login(request, user, backend='django.contrib.auth.backends.ModelBackend')
            if form.cleaned_data['persist_session'] is not True:
                # Set the session to expire when the browser is closed
                request.session['keep_me_logged_in'] = False
                request.session.set_expiry(0)

            # user is organization member
            org_pk = Organization.find_by_user(user).pk
            user.active_organization_id = org_pk
            user.save(update_fields=['active_organization'])
            return redirect(next_page)

    if flag_set("fflag_feat_front_lsdv_e_297_increase_oss_to_enterprise_adoption_short"):
        return render(request, 'users/new-ui/user_login.html', {
            'form': form,
            'next': next_page,
            'reset_password_url': reverse('reset-password')  # Add this line
        })

    return render(request, 'users/user_login.html', {
        'form': form,
        'next': next_page,
        'reset_password_url': reverse('reset-password')
    })



@login_required
def user_account(request):
    user = request.user

    if user.active_organization is None and 'organization_pk' not in request.session:
        return redirect(reverse('main'))

    form = forms.UserProfileForm(instance=user)
    token = Token.objects.get(user=user)

    if request.method == 'POST':
        form = forms.UserProfileForm(request.POST, instance=user)
        if form.is_valid():
            form.save()
            return redirect(reverse('user-account'))
        
    return render(request, 'users/user_account.html', {
        'settings': settings,
        'user': user,
        'user_profile_form': form,
        'token': token
    })
