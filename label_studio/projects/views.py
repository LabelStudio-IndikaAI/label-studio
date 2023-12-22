"""This file and its contents are licensed under the Apache License 2.0. Please see the included NOTICE for copyright information and LICENSE for a copy of the license.
"""
import json
import logging
from projects.serializers import ProjectRoleSerializer, ProjectSerializer
import lxml.etree
from django.http import HttpResponse
from django.shortcuts import get_object_or_404, render
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from rest_framework import status, generics
from rest_framework.exceptions import ValidationError
from projects.models import Project

from core.label_config import get_sample_task
from core.utils.common import get_organization_from_request

from django.db import transaction
from organizations.models import Organization

from rest_framework.decorators import api_view
from rest_framework.response import Response
from projects.models import Project, ProjectRole
from users.models import User
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from django.contrib.auth import get_user_model
from django.http import JsonResponse

logger = logging.getLogger(__name__)


@login_required
def project_list(request):
    return render(request, 'projects/list.html')


@login_required
def project_settings(request, pk, sub_path):
    return render(request, 'projects/settings.html')


def playground_replacements(request, task_data):
    if request.GET.get('playground', '0') == '1':
        for key in task_data:
            if "/samples/time-series.csv" in task_data[key]:
                task_data[key] = "https://app.heartex.ai" + task_data[key]
    return task_data


@require_http_methods(['GET', 'POST'])
def upload_example_using_config(request):
    """ Generate upload data example by config only
    """
    config = request.GET.get('label_config', '')
    if not config:
        config = request.POST.get('label_config', '')

    org_pk = get_organization_from_request(request)
    secure_mode = False
    if org_pk is not None:
        org = generics.get_object_or_404(Organization, pk=org_pk)
        secure_mode = org.secure_mode

    try:
        Project.validate_label_config(config)
        task_data, _, _ = get_sample_task(config, secure_mode)
        task_data = playground_replacements(request, task_data)
    except (ValueError, ValidationError, lxml.etree.Error):
        response = HttpResponse('error while example generating', status=status.HTTP_400_BAD_REQUEST)
    else:
        response = HttpResponse(json.dumps(task_data))
    return response


@api_view(['POST'])
def add_contributors_to_project(request, project_id):
    try:
        with transaction.atomic():
            User = get_user_model()  # Use the custom user model
            project = get_object_or_404(Project, pk=project_id)

            # Check if the requesting user is the creator of the project
            if request.user != project.created_by:
                return Response({'error': 'You are not authorized to add contributors to this project'},
                                status=status.HTTP_403_FORBIDDEN)

            new_user_ids = request.data.get('user_ids', [])
            valid_user_ids = User.objects.filter(id__in=new_user_ids).values_list('id', flat=True)
            invalid_user_ids = set(new_user_ids) - set(valid_user_ids)

            if invalid_user_ids:
                return Response({'error': 'Invalid user IDs: ' + ', '.join(map(str, invalid_user_ids))},
                                status=status.HTTP_400_BAD_REQUEST)

            # Remove existing contributors and add new ones
            ProjectRole.objects.filter(project=project).delete()
            added_contributors = []
            for user_id in valid_user_ids:
                user = User.objects.get(id=user_id)
                ProjectRole.objects.create(user=user, project=project, role='contributor')
                added_contributors.append({
                    'user_id': user.id,
                    'name': f"{user.first_name} {user.last_name}"
                })

            message = f"Contributors updated. New contributors added: {len(added_contributors)}."
            return Response({'message': message, 'added_contributors': added_contributors}, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Error in add_contributors_to_project: {str(e)}")
        return Response({'error': 'Internal Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

@api_view(['POST'])
def remove_contributors_from_project(request, project_id):
    try:
        project = Project.objects.get(id=project_id)

        # Check if the requesting user is the creator of the project
        if request.user != project.created_by:
            return Response({'error': 'You are not authorized to remove contributors from this project'},
                            status=status.HTTP_403_FORBIDDEN)

        user_ids = request.data.get('user_ids', [])
        User = get_user_model()
        valid_user_ids = User.objects.filter(id__in=user_ids).values_list('id', flat=True)
        invalid_user_ids = set(user_ids) - set(valid_user_ids)

        if invalid_user_ids:
            return Response({'error': 'Invalid user IDs: ' + ', '.join(map(str, invalid_user_ids))},
                            status=status.HTTP_400_BAD_REQUEST)

        for user_id in valid_user_ids:
            ProjectRole.objects.filter(user_id=user_id, project=project).delete()

        return Response({'message': 'Contributors removed successfully'}, status=status.HTTP_200_OK)
    except Project.DoesNotExist:
        return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in remove_contributors_from_project: {str(e)}")
        return Response({'error': 'Internal Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['GET'])
def list_project_contributors(request, project_id):
    project = get_object_or_404(Project, pk=project_id)
    contributors = ProjectRole.objects.filter(project=project).select_related('user')

    contributors_data = [{
        'user_id': contributor.user.id,
        'name': f"{contributor.user.first_name} {contributor.user.last_name}",
        'role': contributor.role
    } for contributor in contributors]

    return Response(contributors_data)


@api_view(['PUT'])
def update_project(request, pk):
    project = get_object_or_404(Project, pk=pk)
    serializer = ProjectSerializer(project, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# @api_view(['POST'])
# def remove_contributors_from_project(request, project_id):
#     try:
#         project = Project.objects.get(id=project_id)
#         user_ids = request.data.get('user_ids', [])

#         # Validate user IDs
#         User = get_user_model()
#         valid_user_ids = User.objects.filter(id__in=user_ids).values_list('id', flat=True)
#         invalid_user_ids = set(user_ids) - set(valid_user_ids)

#         if invalid_user_ids:
#             return Response({'error': 'Invalid user IDs: ' + ', '.join(map(str, invalid_user_ids))},
#                             status=status.HTTP_400_BAD_REQUEST)

#         # Permission check removed
#         # if not request.user.has_perm('change_project', project):
#         #     raise PermissionDenied()

#         for user_id in valid_user_ids:
#             ProjectRole.objects.filter(user_id=user_id, project=project).delete()

#         return Response({'message': 'Contributors removed successfully'}, status=status.HTTP_200_OK)
#     except Project.DoesNotExist:
#         return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)
#     except User.DoesNotExist:
#         return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
#     except Exception as e:
#         logger.error(f"Error in remove_contributors_from_project: {str(e)}")
#         return Response({'error': 'Internal Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



# @api_view(['POST'])
# def add_contributors_to_project(request, project_id):
#     User = get_user_model()  # Get the custom user model
#     project = get_object_or_404(Project, pk=project_id)
#     new_user_ids = request.data.get('user_ids', [])

#     # Remove existing contributors
#     ProjectRole.objects.filter(project=project).delete()

#     # Add new contributors
#     added_contributors = []
#     for user_id in new_user_ids:
#         user, created = User.objects.get_or_create(id=user_id)
#         ProjectRole.objects.create(user=user, project=project, role='contributor')
#         added_contributors.append(user_id)

#     message = f"Contributors updated. New contributors added: {len(added_contributors)}."
#     return Response({'message': message}, status=status.HTTP_200_OK)

# @api_view(['GET'])


# def list_project_contributors(request, project_id):
#     try:
#         project = Project.objects.get(pk=project_id)
#     except Project.DoesNotExist:
#         return JsonResponse({'error': 'Project not found'}, status=404)

#     contributors = ProjectRole.objects.filter(project=project)
#     serializer = ProjectRoleSerializer(contributors, many=True)


# @api_view(['POST'])
# def add_contributors_to_project(request, project_id):
#     try:
#         with transaction.atomic():
#             User = get_user_model()  # Use the custom user model
#             project = get_object_or_404(Project, pk=project_id)
#             new_user_ids = request.data.get('user_ids', [])

#             # Validate user IDs
#             valid_user_ids = User.objects.filter(id__in=new_user_ids).values_list('id', flat=True)
#             invalid_user_ids = set(new_user_ids) - set(valid_user_ids)

#             if invalid_user_ids:
#                 return Response({'error': 'Invalid user IDs: ' + ', '.join(map(str, invalid_user_ids))},
#                                 status=status.HTTP_400_BAD_REQUEST)

#             # Remove existing contributors
#             ProjectRole.objects.filter(project=project).delete()

#             # Add new contributors
#             added_contributors = []
#             for user_id in valid_user_ids:
#                 user = User.objects.get(id=user_id)
#                 ProjectRole.objects.create(user=user, project=project, role='contributor')
#                 added_contributors.append({
#                     'user_id': user.id,
#                     'name': f"{user.first_name} {user.last_name}"
#                 })

#             message = f"Contributors updated. New contributors added: {len(added_contributors)}."
#             return Response({'message': message, 'added_contributors': added_contributors}, status=status.HTTP_200_OK)

#     except Exception as e:
#         # Log the full exception
#         logger.error(f"Error in add_contributors_to_project: {str(e)}")
#         return Response({'error': 'Internal Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# @api_view(['POST'])
# # @permission_classes([IsProjectAdminOrOrganizationAdmin])
# def remove_contributors_from_project(request, project_id):
#     try:
#         project = Project.objects.get(id=project_id)
#         user_ids = request.data.get('user_ids', [])

#         if not request.user.has_perm('change_project', project):
#             raise PermissionDenied()

#         for user_id in user_ids:
#             user = User.objects.get(id=user_id)
#             ProjectRole.objects.filter(user=user, project=project).delete()
#         return Response({'message': 'Contributors removed successfully'}, status=status.HTTP_200_OK)
#     except Project.DoesNotExist:
#         return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)
#     except User.DoesNotExist:
#         return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
#     return Response(serializer.data)