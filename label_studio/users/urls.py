"""This file and its contents are licensed under the Apache License 2.0. Please see the included NOTICE for copyright information and LICENSE for a copy of the license.
"""
from os.path import join
from django.conf import settings
from django.conf.urls import url, include
from django.urls import path, re_path
from django.views.static import serve
from rest_framework import routers
from django.contrib.auth import views


from users import views, api

router = routers.DefaultRouter()
router.register(r'users', api.UserAPI, basename='user')

urlpatterns = [
    url(r'^api/', include(router.urls)),

    # Authentication
    path('user/login/', views.user_login, name='user-login'),
    path('user/signup/', views.user_signup, name='user-signup'),
    path('user/account/', views.user_account, name='user-account'),

    # Password reset
    path('user/request-password-reset/', views.reset_password1, name='request-password-reset'),
    path('user/reset/<uidb64>/<token>/', views.new_reset_password, name='set-new-password'),



    url(r'^logout/?$', views.logout, name='logout'),

    # avatars
    re_path(r'^data/' + settings.AVATAR_PATH + '/(?P<path>.*)$', serve,
            kwargs={'document_root': join(settings.MEDIA_ROOT, settings.AVATAR_PATH)}),

    # Token
    path('api/current-user/reset-token/', api.UserResetTokenAPI.as_view(), name='current-user-reset-token'),
    path('api/current-user/token', api.UserGetTokenAPI.as_view(), name='current-user-token'),

    path('api/current-user/whoami', api.UserWhoAmIAPI.as_view(), name='current-user-whoami'),
]

    # path('password-reset/done/', auth_views.PasswordResetDoneView.as_view(), name='password_reset_done'),
    # path('password-reset-confirm/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    # path('password-reset-complete/', auth_views.PasswordResetCompleteView.as_view(), name='password_reset_complete'),
    # url(r'^accounts/password-reset/', include('django_rest_resetpassword.urls', namespace='password_reset')),

    # #sample urls
    # path('user/login/', views.user_login, name='user-login'),
    # path('user/signup/', views.user_signup, name='user-signup'),
    # path('user/account/', views.user_account, name='user-account'),

    # OTP-based password reset
    # path('request-password-reset/', views.request_password_reset, name='request-password-reset'),
    # path('enter-otp/', views.enter_otp, name='enter-otp'),

    # Password reset (the modified view)
    # path('reset-password/', views.reset_password, name='reset-password'),