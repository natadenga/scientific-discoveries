# Generated manually - initial scientific fields data

from django.db import migrations


def create_initial_fields(apps, schema_editor):
    ScientificField = apps.get_model('ideas', 'ScientificField')

    fields = [
        {'name': 'Інформатика та комп\'ютерні науки', 'slug': 'computer-science', 'description': 'Програмування, штучний інтелект, машинне навчання, кібербезпека'},
        {'name': 'Математика', 'slug': 'mathematics', 'description': 'Алгебра, геометрія, математичний аналіз, статистика'},
        {'name': 'Фізика', 'slug': 'physics', 'description': 'Механіка, оптика, електромагнетизм, квантова фізика'},
        {'name': 'Хімія', 'slug': 'chemistry', 'description': 'Органічна, неорганічна, аналітична хімія, біохімія'},
        {'name': 'Біологія', 'slug': 'biology', 'description': 'Генетика, екологія, мікробіологія, ботаніка, зоологія'},
        {'name': 'Медицина', 'slug': 'medicine', 'description': 'Клінічна медицина, фармакологія, діагностика'},
        {'name': 'Економіка', 'slug': 'economics', 'description': 'Макроекономіка, мікроекономіка, фінанси, менеджмент'},
        {'name': 'Психологія', 'slug': 'psychology', 'description': 'Когнітивна, соціальна, клінічна психологія'},
        {'name': 'Соціологія', 'slug': 'sociology', 'description': 'Соціальні дослідження, демографія, урбаністика'},
        {'name': 'Філологія', 'slug': 'philology', 'description': 'Лінгвістика, літературознавство, переклад'},
        {'name': 'Історія', 'slug': 'history', 'description': 'Всесвітня історія, археологія, етнографія'},
        {'name': 'Право', 'slug': 'law', 'description': 'Цивільне, кримінальне, міжнародне право'},
        {'name': 'Педагогіка', 'slug': 'pedagogy', 'description': 'Методика навчання, дидактика, освітні технології'},
        {'name': 'Екологія', 'slug': 'ecology', 'description': 'Охорона довкілля, сталий розвиток, кліматологія'},
        {'name': 'Інженерія', 'slug': 'engineering', 'description': 'Машинобудування, електротехніка, будівництво'},
    ]

    for field_data in fields:
        ScientificField.objects.get_or_create(
            slug=field_data['slug'],
            defaults=field_data
        )


def remove_initial_fields(apps, schema_editor):
    ScientificField = apps.get_model('ideas', 'ScientificField')
    slugs = [
        'computer-science', 'mathematics', 'physics', 'chemistry', 'biology',
        'medicine', 'economics', 'psychology', 'sociology', 'philology',
        'history', 'law', 'pedagogy', 'ecology', 'engineering'
    ]
    ScientificField.objects.filter(slug__in=slugs).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('ideas', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_initial_fields, remove_initial_fields),
    ]
