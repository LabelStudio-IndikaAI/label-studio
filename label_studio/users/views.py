"""This file and its contents are licensed under the Apache License 2.0. Please see the included NOTICE for copyright information and LICENSE for a copy of the license.
"""
import logging
from datetime import timedelta

from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect, reverse
from django.contrib import auth
from django.conf import settings
from django.core.exceptions import PermissionDenied
from django.utils.http import is_safe_url, urlsafe_base64_encode, urlsafe_base64_decode
from django.core.mail import send_mail
from django.contrib.auth.tokens import default_token_generator
from django.contrib import messages
from django.utils.encoding import force_bytes, force_text
from django.utils import timezone
from rest_framework.authtoken.models import Token
from users.models import User, OTP, PasswordResetToken
from users.forms import UserSignupForm, RequestPasswordResetForm, SetNewPasswordForm
from organizations.models import Organization
from organizations.forms import OrganizationSignupForm
from core.utils.common import load_func
from core.middleware import enforce_csrf_checks
from core.feature_flags import flag_set
from users.functions import login, proceed_registration
from users.models import User
from django.contrib.auth.tokens import default_token_generator
from django.shortcuts import render, redirect
from users.forms import SetNewPasswordForm
from django.contrib.auth import update_session_auth_hash

logger = logging.getLogger(__name__)


@login_required
def logout(request):
    auth.logout(request)
    redirect_url = settings.HOSTNAME or '/'
    if not redirect_url.endswith('/'):
        redirect_url += '/'
    return redirect(redirect_url)


@enforce_csrf_checks
def user_signup(request):
    """Sign up page"""
    user = request.user
    next_page = request.GET.get('next')
    token = request.GET.get('token')

    if not next_page or not is_safe_url(url=next_page, allowed_hosts=request.get_host()):
        next_page = reverse('projects:project-index')

    user_form = UserSignupForm()
    organization_form = OrganizationSignupForm()

    if user.is_authenticated:
        return redirect(next_page)

    if request.method == 'POST':
        organization = Organization.objects.first()

        if settings.DISABLE_SIGNUP_WITHOUT_LINK and not (token and organization and token == organization.token):
            raise PermissionDenied()

        user_form = UserSignupForm(request.POST)

        if user_form.is_valid():
            redirect_response = proceed_registration(request, user_form, organization_form, next_page)
            if redirect_response:
                return redirect_response

    return render(request, 'users/user_signup.html', {
        'user_form': user_form,
        'organization_form': organization_form,
        'next': next_page,
        'token': token,
    })




@enforce_csrf_checks
def user_login(request):
    """Login page"""
    user = request.user
    next_page = request.GET.get('next')

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

            if not form.cleaned_data['persist_session']:
                request.session.set_expiry(0)

            org_pk = Organization.find_by_user(user).pk
            user.active_organization_id = org_pk
            user.save(update_fields=['active_organization'])

            return redirect(next_page)

    return render(request, 'users/user_login.html', {
        'form': form,
        'next': next_page,
        'reset_password_url': reverse('request-password-reset')
    })

@login_required
def user_account(request):
    user = request.user
    form = UserSignupForm(user)
    token = Token.objects.get(user=user)

    if request.method == 'POST':
        form = UserSignupForm(request.POST, instance=user)
        if form.is_valid():
            form.save()
            return redirect(reverse('user-account'))

    return render(request, 'users/user_account.html', {
        'settings': settings,
        'user': user,
        'user_profile_form': form,
        'token': token
    })


MAX_RESET_ATTEMPTS = 3
LOCKOUT_TIME_MINUTES = 30
def reset_password1(request):
    form = RequestPasswordResetForm(request.POST or None)  # <-- Define the form here!

    if form.is_valid():
        email = form.cleaned_data.get('email').lower()
        user = User.objects.filter(email=email).first()

        if not user:
            messages.error(request, "Email is not registered.")
            return render(request, 'users/request_reset.html', {'form': form})

        if user.reset_attempts >= MAX_RESET_ATTEMPTS:
            subject = 'Password Reset Limit Reached'
            message = 'You have reached the maximum number of password reset attempts. Please try again later.'
            from_email = settings.DEFAULT_FROM_EMAIL
            recipient_list = [user.email]
            send_mail(subject, message, from_email, recipient_list)
            return render(request, 'users/reset_password_limit_reached.html')
        
        # Continue with the password reset process for valid users
        token = default_token_generator.make_token(user)
        PasswordResetToken.objects.create(user=user, token=token)
        
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
        reset_link = request.build_absolute_uri(reverse('set-new-password', args=[uidb64, token]))

        send_mail(
            'Your Password Reset Link',
            f'Click on the link to reset your password: {reset_link}',
            'ghevbhc@gmail.com',
            [email],
            fail_silently=False,
        )
        messages.success(request, "Password reset link has been sent to your email!")
        user.reset_attempts += 1
        user.save()
        return render(request, 'users/confirmation.html')
        # return redirect('user-login')
    
    return render(request, 'users/request_reset.html', {'form': form})




def new_reset_password(request, uidb64=None, token=None):
    # Try to decode the user's ID and get the user object
    try:
        uid = force_text(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist) as e:
        user = None
        logger.error(f"Error decoding uid or fetching user: {e}")
    
    if user.reset_attempts >= MAX_RESET_ATTEMPTS:
        if user.reset_attempt_time and timezone.now() - user.reset_attempt_time < timedelta(minutes=LOCKOUT_TIME_MINUTES):
            # Notify user of lockout and return an error page or message
            return render(request, 'users/Error.html')
        else:
            user.reset_attempts = 0
            user.reset_attempt_time = None
            user.save()

    # Check if user exists and the token is valid
    if user is not None and default_token_generator.check_token(user, token):
        # Handle POST request for form submission
        if request.method == 'POST':
            form = SetNewPasswordForm(request.POST)
            if form.is_valid():
                user.set_password(form.cleaned_data.get('password'))

                user.save()
                update_session_auth_hash(request, user)  # Update the user's session to keep them logged in
                # return redirect('password_reset_success')
                return render(request, 'users/confirmation.html')
            else:
                # print(form.errors)  # Print form errors for debugging
                messages.error(request, 'Please correct the error below.')
                
        # Handle GET request to display the form
        else:
            form = SetNewPasswordForm()

        return render(request, 'users/reset_password_confirm.html', {
        'form': form,
        'uidb64': uidb64,
        'token': token
        })

    user.reset_attempts += 1
    user.reset_attempt_time = timezone.now()
    user.save()

    logger.error(f"Token check failed for user with UID {uid} and token {token}")
    return render(request, 'users/Error.html')
    # else:
    #     # If token check fails, log the error and redirect
    #     logger.error(f"Token check failed for user with UID {uid} and token {token}")
    #     # return redirect('password_reset_error')
    #     return render(request, 'users/Error.html')

    
def password_reset_success(request):
    """View to inform the user that password reset was successful."""
    return render(request, 'users/confirmation.html')

def password_reset_error(request):
    """View to inform the user that there was an error in password reset."""
    return render(request, 'users/Error.html')


    
#change to before one
# import logging
# from time import time
# from datetime import timedelta

# from django.contrib.auth.decorators import login_required
# from django.shortcuts import render, redirect, reverse
# from django.contrib import auth
# from django.conf import settings
# from django.core.exceptions import PermissionDenied
# from django.utils.http import is_safe_url
# from django.core.mail import send_mail
# from users.models import OTP
# import random



# from rest_framework.authtoken.models import Token

# from users import forms as user_forms
# from users import forms as forms

# from core.utils.common import load_func
# from users.functions import login
# from core.middleware import enforce_csrf_checks
# from core.feature_flags import flag_set
# from users.functions import proceed_registration
# from organizations.models import Organization
# from organizations.forms import OrganizationSignupForm
# from django.contrib import messages
# from users.models import User
# from users.forms import RequestPasswordResetForm
# from users.forms import SetNewPasswordForm

# def request_password_reset(request):
#     """ Handle the initial request for password reset """
#     form = RequestPasswordResetForm()
#     if request.method == 'POST':
#         form = SetPasswordForm(user=request.user, data=request.POST)
#         if form.is_valid():
#             email = form.cleaned_data['email']
#             user = User.objects.filter(email=email).first()
            
#             if user:
#                 # Generate OTP and save to DB
#                 otp_code = ''.join(random.choices('0123456789', k=6))
#                 OTP.objects.create(user=user, otp=otp_code)
                
#                 # Send OTP to user's email
#                 send_mail(
#                     'Your Password Reset OTP',
#                     f'Your OTP is: {otp_code}',
#                     'shreesha1005@gmail.com',
#                     [email],
#                     fail_silently=False,
#                 )
#                 messages.success(request, "OTP has been sent to your email!")
#                 return redirect('verify-otp')  # Redirect to OTP entry page
#             else:
#                 messages.error(request, "Email is not registered.")
#     return render(request, 'users/request_password.html', {'form': form})


# def enter_otp(request):
#     """ Handle OTP entry and verification """
#     if request.method == 'POST':
#         entered_otp = request.POST.get('otp')
#         email = request.POST.get('email')  # Assuming you're also taking email as input to match with OTP
#         user = User.objects.filter(email=email).first()
        
#         if user:
#             otp_obj = OTP.objects.filter(user=user, otp=entered_otp, is_used=False).first()
            
#             if otp_obj and otp_obj.is_valid():
#                 otp_obj.is_used = True
#                 otp_obj.save()
#                 return redirect('reset_password')  # Redirect to password reset page
#             else:
#                 messages.error(request, "Invalid or expired OTP.")
#         else:
#             messages.error(request, "Invalid email.")
#     return render(request, 'users/enter_otp.html')

# from django.contrib.auth.forms import SetPasswordForm

# def reset_password(request):
#     """ Handle the actual password reset """
#     if request.method == 'POST':
#         form = SetPasswordForm(user=request.user, data=request.POST)
#         if form.is_valid():
#             form.save()
#             messages.success(request, "Password reset successful. You can login now.")
#             return redirect('users:user_login')

#     else:
#         form = SetPasswordForm(user=request.user)
#     return render(request, 'users/reset_password.html', {'form': form})
# If you've defined the RequestPasswordResetForm somewhere else, import it. 
# Otherwise, you will need to define it.
# from <wherever_it_is_defined> import RequestPasswordResetFor


#1.1

# @login_required
# def logout(request):
#     auth.logout(request)
#     if settings.HOSTNAME:
#         redirect_url = settings.HOSTNAME
#         if not redirect_url.endswith('/'):
#             redirect_url += '/'
#         return redirect(redirect_url)
#     return redirect('/')

# 1.1
# @enforce_csrf_checks
# def user_signup(request):
#     """ Sign up page
#     """
#     user = request.user
#     next_page = request.GET.get('next')
#     token = request.GET.get('token')

#     # checks if the URL is a safe redirection.
#     if not next_page or not is_safe_url(url=next_page, allowed_hosts=request.get_host()):
#         next_page = reverse('projects:project-index')

#     user_form = user_forms.UserSignupForm()
#     organization_form = OrganizationSignupForm()

#     if user.is_authenticated:
#         return redirect(next_page)

#     # make a new user
#     if request.method == 'POST':
#         organization = Organization.objects.first()
#         if settings.DISABLE_SIGNUP_WITHOUT_LINK is True:
#             if not(token and organization and token == organization.token):
#                 raise PermissionDenied()
#         else:
#             if token and organization and token != organization.token:
#                 raise PermissionDenied()

#         user_form = user_forms.UserSignupForm(request.POST)
#         organization_form = OrganizationSignupForm(request.POST)
#         email = request.POST.get('email')
#         if User.objects.filter(email=email).exists():
#             user_form.add_error('email', 'Email is already in use.')
#         else:
#             if user_form.is_valid():
#                 redirect_response = proceed_registration(request, user_form, organization_form, next_page)
#                 if redirect_response:
#                     return redirect_response

#     if flag_set("fflag_feat_front_lsdv_e_297_increase_oss_to_enterprise_adoption_short"):
#         return render(request, 'users/new-ui/user_signup.html', {
#                 'user_form': user_form,
#                 'organization_form': organization_form,
#                 'next': next_page,
#                 'token': token,
#             })

#     return render(request, 'users/user_signup.html', {
#         'user_form': user_form,
#         'organization_form': organization_form,
#         'next': next_page,
#         'token': token,
#     })

#  1.1
# @enforce_csrf_checks
# def user_login(request):
#     """ Login page
#     """
#     user = request.user
#     next_page = request.GET.get('next')

#     # checks if the URL is a safe redirection.
#     if not next_page or not is_safe_url(url=next_page, allowed_hosts=request.get_host()):
#         next_page = reverse('projects:project-index')

#     login_form = load_func(settings.USER_LOGIN_FORM)
#     form = login_form()

#     if user.is_authenticated:
#         return redirect(next_page)

#     if request.method == 'POST':
#         form = login_form(request.POST)
#         if form.is_valid():
#             user = form.cleaned_data['user']
#             login(request, user, backend='django.contrib.auth.backends.ModelBackend')
#             if form.cleaned_data['persist_session'] is not True:
#                 # Set the session to expire when the browser is closed
#                 request.session['keep_me_logged_in'] = False
#                 request.session.set_expiry(0)

#             # user is organization member
#             org_pk = Organization.find_by_user(user).pk
#             user.active_organization_id = org_pk
#             user.save(update_fields=['active_organization'])
#             return redirect(next_page)

#     if flag_set("fflag_feat_front_lsdv_e_297_increase_oss_to_enterprise_adoption_short"):
#         return render(request, 'users/new-ui/user_login.html', {
#             'form': form,
#             'next': next_page,
#             'reset_password_url': reverse('request-password-reset')  # Add this line
#         })

#     return render(request, 'users/user_login.html', {
#         'form': form,
#         'next': next_page,
#         'reset_password_url': reverse('request-password-reset')
#     })



# 1.1
# @login_required
# def user_account(request):
#     user = request.user

#     if user.active_organization is None and 'organization_pk' not in request.session:
#         return redirect(reverse('main'))

#     form = forms.UserProfileForm(instance=user)
#     token = Token.objects.get(user=user)

#     if request.method == 'POST':
#         form = forms.UserProfileForm(request.POST, instance=user)
#         if form.is_valid():
#             form.save()
#             return redirect(reverse('user-account'))
        
#     return render(request, 'users/user_account.html', {
#         'settings': settings,
#         'user': user,
#         'user_profile_form': form,
#         'token': token
#     })


# 1.1
# logger = logging.getLogger(__name__)

# OTP_EXPIRY_DURATION = timedelta(minutes=15)  # OTP expires after 15 minutes

# from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
# from django.contrib.auth.tokens import default_token_generator
# from users.models import PasswordResetToken
# from django.utils.encoding import force_bytes, force_text


# def reset_password1(request):
#     form = RequestPasswordResetForm(request.POST or None)
#     if form.is_valid():
#         email = form.cleaned_data.get('email').lower()
#         try:
#             user = User.objects.get(email=email)
#         except User.DoesNotExist:
#             user = None

#         if user:
#             # Generate token and save to DB
#             token = default_token_generator.make_token(user)
#             PasswordResetToken.objects.create(user=user, token=token)
            
#             # Send reset link to user's email
#             reset_link = request.build_absolute_uri(reverse('set-new-password', args=[urlsafe_base64_encode(force_bytes(user.pk)), token]))
#             send_mail(
#                 'Your Password Reset Link',
#                 f'Click on the link to reset your password: {reset_link}',
#                 settings.EMAIL_HOST_USER,
#                 [email],
#                 fail_silently=False,
#             )
#             messages.success(request, "Password reset link has been sent to your email!")
#             return redirect('user-login')  # Confirm that 'user_login' is the correct name in urls.py
#         else:
#             messages.error(request, "Email is not registered.")
    
#     return render(request, 'users/request_reset.html', 
#                   {'form': form})  # Confirm that 'user_login' is the correct name in urls.py

# 1.1
# def new_reset_password(request, uidb64, token):
#     try:
#         uid = force_text(urlsafe_base64_decode(uidb64))
#         user = User.objects.get(pk=uid)
#         reset_token = PasswordResetToken.objects.get(user=user, token=token)
#     except (User.DoesNotExist, PasswordResetToken.DoesNotExist):
#         messages.error(request, "Invalid token.")
#         return redirect('reset_password1')

#     if default_token_generator.check_token(user, token):
#         form = SetNewPasswordForm()
#         if request.method == 'POST':
#             form = SetNewPasswordForm(request.POST)
#             if form.is_valid():
#                 new_password = form.cleaned_data.get('password')
#                 user.set_password(new_password)
#                 user.save()
#                 reset_token.is_used = True
#                 reset_token.save()
#                 messages.success(request, "Password reset successfully!")
#                 return redirect('user-login')
        
#         return render(request, 'users/reset_password_confirm.html', {'form': form})

#     else:
#         messages.error(request, "Invalid or expired token.")
#         return redirect('reset_password1')



# from django.core.mail import EmailMultiAlternatives
# from django.dispatch import receiver
# from django.template.loader import render_to_string
# from django.urls import reverse
# from django_rest_resetpassword.signals import reset_password_token_created
# from django.shortcuts import render, redirect

# def enter_otp(request):
#     """ Handle OTP verification """
#     form = OTPVerificationForm(request.POST or None)
#     if form.is_valid():
#         otp = form.cleaned_data.get('otp')
#         otp_obj = OTP.objects.filter(otp=otp).first()
#         if otp_obj and datetime.now() <= otp_obj.created_at + OTP_EXPIRY_DURATION:
#             # OTP is valid, redirect to set new password
#             return redirect('set-new-password')
#         else:
#             messages.error(request, "Invalid or expired OTP.")
#     return render(request, 'users/enter_otp.html', {'form': form})

# from django.utils.http import urlsafe_base64_decode


# def request_password_reset(request):
#     """ Handle the initial request for password reset """
#     form = RequestPasswordResetForm()
#     if request.method == 'POST':
#         form = RequestPasswordResetForm(request.POST)
#         if form.is_valid():
#             email = form.cleaned_data['email']
#             user = User.objects.filter(email=email).first()
            
#             if user:
#                 # Generate OTP and save to DB
#                 otp_code = ''.join(random.choices('0123456789', k=6))
#                 OTP.objects.create(user=user, otp=otp_code)
                
#                 # Send OTP to user's email
#                 send_mail(
#                     'Your Password Reset OTP',
#                     f'Your OTP is: {otp_code}',
#                     'shreesha1005@gmail.com',
#                     [email],
#                     fail_silently=False,
#                 )
#                 return redirect('enter_otp')  # Redirect to OTP entry page
#             else:
#                 messages.error(request, "Email is not registered.")
#     return render(request, 'users/request_password_reset.html', {'form': form})

# from .models import PasswordResetToken  # Assuming the PasswordResetToken model is in the same app

# @receiver(reset_password_token_created)
# def password_reset_token_created(sender, instance, reset_password_token, *args, **kwargs):
#     # send an e-mail to the user
#     context = {
#         'current_user': reset_password_token.user,
#         'username': reset_password_token.user.username,
#         'email': reset_password_token.user.email,
#         'reset_password_url': "{}?token={}".format(reverse('password_reset:reset-password-request'), reset_password_token.key)
#     }

#     # render email text
#     email_html_message = render_to_string('email/user_reset_password.html', context)
#     email_plaintext_message = render_to_string('email/user_reset_password.txt', context)

#     msg = EmailMultiAlternatives(
#         # title:
#         "Password Reset for {title}".format(title="Your Website Title"),  # Change this to your website title
#         # message:
#         email_plaintext_message,
#         # from:
#         "noreply@yourwebsite.com",  # Change this to your desired sender email
#         # to:
#         [reset_password_token.user.email]
#     )
#     msg.attach_alternative(email_html_message, "text/html")
#     msg.send()

# from users.models import PasswordResetToken, User

# def password_reset_request(request):
#     form = RequestPasswordResetForm()
#     if request.method == "POST":
#         form = RequestPasswordResetForm(request.POST)
#         if form.is_valid():
#             email = form.cleaned_data['email']
#             associated_users = User.objects.filter(email=email)
#             if associated_users.exists():
#                 for user in associated_users:
#                     token = default_token_generator.make_token(user)
#                     reset_token = PasswordResetToken.objects.create(user=user, token=token)
#                     subject = "Password Reset Requested"
#                     email_template_name = "password_reset.html"  # Changed to match your template name
#                     c = {
#                         "email": user.email,
#                         "domain": get_current_site(request).domain,
#                         "uid": urlsafe_base64_encode(force_bytes(user.pk)),
#                         "user": user,
#                         "token": reset_token.token,
#                         "protocol": 'https',
#                     }
#                     email_body = render_to_string(email_template_name, c)
#                     try:
#                         send_mail(subject, email_body, 'shreesha1005@gmail.com', [user.email])
#                     except Exception as e:
#                         pass
#             messages.success(request, "We've emailed you instructions for setting your password. If they haven't arrived in a few minutes, check your spam folder.")
#             return redirect('password_reset_done')  # Assuming you have a URL named 'password_reset_done'
#     context = {
#         "form": form
#     }
#     return render(request, "users/password_reset.html", context)

# def password_reset_confirm(request, uidb64=None, token=None):
#     UserModel = get_user_model()
#     form = SetPasswordForm(user=request.user, data=request.POST or None)
#     try:
#         uid = force_text(urlsafe_base64_decode(uidb64))
#         user = UserModel._default_manager.get(pk=uid)
#         reset_token = PasswordResetToken.objects.get(user=user, token=token)
#     except (TypeError, ValueError, OverflowError, UserModel.DoesNotExist, PasswordResetToken.DoesNotExist):
#         user = None
#         reset_token = None

#     if user is not None and reset_token.is_valid():
#         if request.method == "POST" and form.is_valid():
#             form.save()
#             reset_token.is_used = True
#             reset_token.save()
#             messages.success(request, "Password reset successful. You can login now.")
#             return redirect('user_login')
#     else:
#         form = None  # Set form to None if token is invalid to avoid displaying it
#         messages.error(request, "Password reset link is invalid or has expired.")
#     context = {
#         "form": form
#     }
#     return render(request, "password_reset_confirm.html", context)
