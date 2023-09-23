"""This file and its contents are licensed under the Apache License 2.0. Please see the included NOTICE for copyright information and LICENSE for a copy of the license.
"""
import datetime

from django.utils import timezone
from django.conf import settings
from django.db import models
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.utils.translation import gettext_lazy as _
from django.dispatch import receiver
from django.db.models.signals import post_save
from rest_framework.authtoken.models import Token
from django.core.mail import send_mail

from organizations.models import OrganizationMember, Organization
from users.functions import hash_upload
from core.utils.common import load_func
from projects.models import Project
import random

YEAR_START = 1980
YEAR_CHOICES = []
for r in range(YEAR_START, (datetime.datetime.now().year+1)):
    YEAR_CHOICES.append((r, r))

year = models.IntegerField(_('year'), choices=YEAR_CHOICES, default=datetime.datetime.now().year)


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        """
        Create and save a user with the given email and password.
        """
        if not email:
            raise ValueError('Must specify an email address')

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)

        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(email, password, **extra_fields)


def get_default_expiry_time():
    return timezone.now() + datetime.timedelta(minutes=10)

class OTP(models.Model):
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='otps')
    otp = models.CharField(max_length=6)
    timestamp = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)
    expiry_time = models.DateTimeField(default=get_default_expiry_time)

    def is_valid(self):
        if timezone.now() > self.expiry_time or self.is_used:
            return False
        return True



class UserLastActivityMixin(models.Model):
    last_activity = models.DateTimeField(
        _('last activity'), default=timezone.now, editable=False)

    def update_last_activity(self):
        self.last_activity = timezone.now()
        self.save(update_fields=["last_activity"])

    class Meta:
        abstract = True


UserMixin = load_func(settings.USER_MIXIN)


class User(UserMixin, AbstractBaseUser, PermissionsMixin, UserLastActivityMixin):
    """
    An abstract base class implementing a fully featured User model with
    admin-compliant permissions.

    Username and password are required. Other fields are optional.
    """
    username = models.CharField(_('username'), max_length=256)
    email = models.EmailField(_('email address'), unique=True, blank=True)
    reset_attempts = models.IntegerField(default=0)
    reset_attempt_time = models.DateTimeField(null=True, blank=True)
    first_name = models.CharField(_('first name'), max_length=256, blank=True)
    last_name = models.CharField(_('last name'), max_length=256, blank=True)
    phone = models.CharField(_('phone'), max_length=256, blank=True)
    avatar = models.ImageField(upload_to=hash_upload, blank=True)

    is_staff = models.BooleanField(_('staff status'), default=False,
                                   help_text=_('Designates whether the user can log into this admin site.'))

    is_active = models.BooleanField(_('active'), default=True,
                                    help_text=_('Designates whether to treat this user as active. '
                                                'Unselect this instead of deleting accounts.'))

    date_joined = models.DateTimeField(_('date joined'), default=timezone.now)

    activity_at = models.DateTimeField(_('last annotation activity'), auto_now=True)

    def generate_and_save_otp(self):
        # Delete old unused OTPs for this user
        self.otps.filter(is_used=False).delete()

        # Create a new OTP
        otp = ''.join(random.choices('0123456789', k=6))
        return OTP.objects.create(user=self, otp=otp)

    active_organization = models.ForeignKey(
        'organizations.Organization',
        null=True,
        on_delete=models.SET_NULL,
        related_name='active_users'
    )

    allow_newsletters = models.BooleanField(
        _('allow newsletters'),
        null=True,
        default=None,
        help_text=_('Allow sending newsletters to user')
    )

    objects = UserManager()

    EMAIL_FIELD = 'email'
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ()

    class Meta:
        db_table = 'htx_user'
        verbose_name = _('user')
        verbose_name_plural = _('users')
        indexes = [
            models.Index(fields=['username']),
            models.Index(fields=['email']),
            models.Index(fields=['first_name']),
            models.Index(fields=['last_name']),
            models.Index(fields=['date_joined']),
        ]

    @property
    def avatar_url(self):
        if self.avatar:
            if settings.CLOUD_FILE_STORAGE_ENABLED:
                return self.avatar.url
            else:
                return settings.HOSTNAME + self.avatar.url

    def is_organization_admin(self, org_pk):
        return True

    def active_organization_annotations(self):
        return self.annotations.filter(project__organization=self.active_organization)

    def active_organization_contributed_project_number(self):
        annotations = self.active_organization_annotations()
        return annotations.values_list('project').distinct().count()

    @property
    def own_organization(self):
        return Organization.objects.get(created_by=self)

    @property
    def has_organization(self):
        return Organization.objects.filter(created_by=self).exists()

    def clean(self):
        super().clean()
        self.email = self.__class__.objects.normalize_email(self.email)

    def name_or_email(self):
        name = self.get_full_name()
        if len(name) == 0:
            name = self.email

        return name
        
    def get_full_name(self):
        """
        Return the first_name and the last_name for a given user with a space in between.
        """
        full_name = '%s %s' % (self.first_name, self.last_name)
        return full_name.strip()

    def get_short_name(self):
        """Return the short name for the user."""
        return self.first_name

    def reset_token(self):
        token = Token.objects.filter(user=self)
        if token.exists():
            token.delete()
        return Token.objects.create(user=self)
    
    def get_initials(self):
        initials = '?'
        if not self.first_name and not self.last_name:
            initials = self.email[0:2]
        elif self.first_name and not self.last_name:
            initials = self.first_name[0:1]
        elif self.last_name and not self.first_name:
            initials = self.last_name[0:1]
        elif self.first_name and self.last_name:
            initials = self.first_name[0:1] + self.last_name[0:1]
        return initials
    
    def generate_password_reset_token(self):
        # Delete old unused tokens for this user
        self.reset_tokens.filter(is_used=False).delete()

        # Create a new token for password reset
        token = default_token_generator.make_token(self)
        return PasswordResetToken.objects.create(user=self, token=token)



@receiver(post_save, sender=User)
def init_user(sender, instance=None, created=False, **kwargs):
    if created:
        # create token for user
        Token.objects.create(user=instance)

from django.urls import reverse

def send_password_reset_email(user):
    token = user.generate_password_reset_token()
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token_value = token.token
    
    # Ensure this URL pattern exists in your urls.py
    password_reset_url = reverse('password_reset_confirm', kwargs={'uidb64': uid, 'token': token_value})
    full_link = settings.HOSTNAME + password_reset_url
    
    # Sending the email
    subject = 'Password Reset for YourProjectName'
    message = f'Click the link below to reset your password:\n\n{full_link}'
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [user.email]

    send_mail(subject, message, from_email, recipient_list)

# ... [rest of your code]


from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
#chnages
def get_expiry_time():
    return timezone.now() + datetime.timedelta(minutes=10)

class PasswordResetToken(models.Model):
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='reset_tokens')
    token = models.CharField(max_length=256, unique=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)
    expiry_time = models.DateTimeField(default=get_expiry_time)

    def is_valid(self):
        if timezone.now() > self.expiry_time or self.is_used:
            return False
        return True
