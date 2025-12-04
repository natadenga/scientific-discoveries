# Generated manually - add Education scientific field

from django.db import migrations


def add_education_field(apps, schema_editor):
    ScientificField = apps.get_model('ideas', 'ScientificField')
    ScientificField.objects.get_or_create(
        slug='education',
        defaults={
            'name': 'Освіта',
            'slug': 'education',
            'description': 'Освітні системи, освітня політика, дистанційне навчання, інклюзивна освіта'
        }
    )


def remove_education_field(apps, schema_editor):
    ScientificField = apps.get_model('ideas', 'ScientificField')
    ScientificField.objects.filter(slug='education').delete()


class Migration(migrations.Migration):

    dependencies = [
        ('ideas', '0004_remove_idea_likes_count_remove_idea_scientific_field_and_more'),
    ]

    operations = [
        migrations.RunPython(add_education_field, remove_education_field),
    ]
