# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='education_level',
            field=models.CharField(
                choices=[
                    ('incomplete_secondary', 'Неповна середня освіта'),
                    ('secondary', 'Середня освіта'),
                    ('bachelor', 'Бакалавр'),
                    ('master', 'Магістр'),
                    ('phd', 'Аспірант / PhD'),
                    ('doctor', 'Доктор наук'),
                ],
                default='bachelor',
                max_length=30,
                verbose_name='Рівень освіти',
            ),
        ),
    ]
