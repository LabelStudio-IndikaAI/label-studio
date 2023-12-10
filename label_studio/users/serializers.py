"""This file and its contents are licensed under the Apache License 2.0. Please see the included NOTICE for copyright information and LICENSE for a copy of the license.
"""
from rest_framework import serializers
from rest_flex_fields import FlexFieldsModelSerializer
from django.conf import settings
from django.utils.dateformat import DateFormat
from .models import User
from core.utils.common import load_func


class BaseUserSerializer(FlexFieldsModelSerializer):
    # short form for user presentation
    initials = serializers.SerializerMethodField(default='?', read_only=True)
    avatar = serializers.SerializerMethodField(read_only=True)

    def get_avatar(self, user):
        return user.avatar_url

    def get_initials(self, user):
        return user.get_initials()

    def to_representation(self, instance):
        """ Returns user with cache, this helps to avoid multiple s3/gcs links resolving for avatars """

        uid = instance.id
        key = 'user_cache'

        if key not in self.context:
            self.context[key] = {}
        if uid not in self.context[key]:
            self.context[key][uid] = super().to_representation(instance)

        return self.context[key][uid]

    class Meta:
        model = User
        fields = (
            'id',
            'first_name',
            'last_name',
            'username',
            'email',
            'last_activity',
            'avatar',
            'initials',
            'phone',
            'active_organization',
            'allow_newsletters'
        )


class BaseUserSerializerUpdate(BaseUserSerializer):
    class Meta(BaseUserSerializer.Meta):
        read_only_fields = ('email',)


class UserSimpleSerializer(BaseUserSerializer):
    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'email', 'avatar')

class ExtendedUserSerializer(BaseUserSerializer):
    active_organization_title = serializers.SerializerMethodField()
    active_organization_annotations_count = serializers.SerializerMethodField()
    active_organization_contributed_project_count = serializers.SerializerMethodField()
    active_organization_id = serializers.SerializerMethodField()
    active_organization_created_by = serializers.SerializerMethodField()
    active_organization_created_at = serializers.SerializerMethodField()

    def get_active_organization_title(self, user):
        return user.active_organization.title if user.active_organization else None

    def get_active_organization_annotations_count(self, user):
        return user.active_organization_annotations().count() if user.active_organization else 0

    def get_active_organization_contributed_project_count(self, user):
        return user.active_organization_contributed_project_number() if user.active_organization else 0


    def get_active_organization_id(self, user):
        return user.active_organization.id if user.active_organization else None

    def get_active_organization_created_by(self, user):
        # Assuming user.active_organization.created_by is a User instance
        # Return a string representation like email or username
        return user.active_organization.created_by.email if user.active_organization else None

    def get_active_organization_created_at(self, user):
        # Format datetime as a string
        created_at = user.active_organization.created_at if user.active_organization else None
        return DateFormat(created_at).format('Y-m-d H:i:s') if created_at else None

    class Meta(BaseUserSerializer.Meta):
        fields = BaseUserSerializer.Meta.fields + (
            'active_organization_title', 
            'active_organization_annotations_count',
            'active_organization_contributed_project_count',
            'active_organization_id',
            'active_organization_created_by',
            'active_organization_created_at',
        )


UserSerializer = load_func(settings.USER_SERIALIZER)
UserSerializerUpdate = load_func(settings.USER_SERIALIZER_UPDATE)
