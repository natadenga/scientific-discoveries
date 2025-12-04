# Generated manually

from django.db import migrations, models
import django.db.models.deletion


def convert_institution_to_fk(apps, schema_editor):
    User = apps.get_model('users', 'User')
    Institution = apps.get_model('users', 'Institution')

    for user in User.objects.all():
        if user.institution_name:
            institution, _ = Institution.objects.get_or_create(name=user.institution_name)
            user.institution = institution
            user.save()


def convert_fk_to_institution(apps, schema_editor):
    User = apps.get_model('users', 'User')

    for user in User.objects.all():
        if user.institution:
            user.institution_name = user.institution.name
            user.save()


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0004_institution_user_scopus_user_web_of_science_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='user',
            old_name='institution',
            new_name='institution_name',
        ),
        migrations.AddField(
            model_name='user',
            name='institution',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='users',
                to='users.institution',
                verbose_name='Заклад освіти',
            ),
        ),
        migrations.RunPython(convert_institution_to_fk, convert_fk_to_institution),
        migrations.RemoveField(
            model_name='user',
            name='institution_name',
        ),
    ]
