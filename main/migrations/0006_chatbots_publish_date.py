# Generated by Django 5.0.4 on 2024-06-10 21:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0005_chatbots_title'),
    ]

    operations = [
        migrations.AddField(
            model_name='chatbots',
            name='publish_date',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
