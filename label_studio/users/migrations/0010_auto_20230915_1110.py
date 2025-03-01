# Generated by Django 3.2.20 on 2023-09-15 05:40

from django.db import migrations, models
import users.models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0009_auto_20230914_1622'),
    ]

    operations = [
        migrations.AlterField(
            model_name='otp',
            name='expiry_time',
            field=models.DateTimeField(default=users.models.get_default_expiry_time),
        ),
        migrations.AlterField(
            model_name='passwordresettoken',
            name='expiry_time',
            field=models.DateTimeField(default=users.models.get_expiry_time),
        ),
    ]
