# Generated manually - add initial scientific fields

from django.db import migrations


def add_scientific_fields(apps, schema_editor):
    ScientificField = apps.get_model('contents', 'ScientificField')
    fields = [
        ('Інформаційні технології', 'informatsiini-tekhnolohii', 'Програмування, штучний інтелект, кібербезпека'),
        ('Математика', 'matematyka', 'Алгебра, геометрія, математичний аналіз'),
        ('Фізика', 'fizyka', 'Квантова механіка, астрофізика, термодинаміка'),
        ('Хімія', 'khimiia', 'Органічна хімія, біохімія, матеріалознавство'),
        ('Біологія', 'biolohiia', 'Генетика, екологія, мікробіологія'),
        ('Медицина', 'medytsyna', 'Клінічна медицина, фармакологія, діагностика'),
        ('Економіка', 'ekonomika', 'Макроекономіка, фінанси, маркетинг'),
        ('Право', 'pravo', 'Цивільне право, кримінальне право, міжнародне право'),
        ('Психологія', 'psykholohiia', 'Когнітивна психологія, соціальна психологія'),
        ('Соціологія', 'sotsiolohiia', 'Соціальні структури, культурні дослідження'),
        ('Філософія', 'filosofiia', 'Етика, логіка, метафізика'),
        ('Історія', 'istoriia', 'Всесвітня історія, археологія, етнографія'),
        ('Лінгвістика', 'linhvistyka', 'Мовознавство, перекладознавство, семіотика'),
        ('Екологія', 'ekolohiia', 'Охорона довкілля, кліматологія, сталий розвиток'),
        ('Інженерія', 'inzheneriia', 'Машинобудування, електротехніка, будівництво'),
        ('Освіта', 'osvita', 'Освітні системи, освітня політика, дистанційне навчання, інклюзивна освіта'),
    ]

    for name, slug, description in fields:
        ScientificField.objects.get_or_create(
            slug=slug,
            defaults={'name': name, 'description': description}
        )


def remove_scientific_fields(apps, schema_editor):
    ScientificField = apps.get_model('contents', 'ScientificField')
    ScientificField.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ('contents', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(add_scientific_fields, remove_scientific_fields),
    ]
