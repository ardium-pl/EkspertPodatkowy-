import { removeDecimal } from "../utils/valuesAdjustment.js"

export const rawData = {
    "id": 14,
    "invoiceNumber": "FAS/2024/05/55991/MG",
    "sellerNip": "5423151157",
    "shipDate": '2024-05-21',
    "documentDate": '2024-05-21',
    "nr": 12,
    "ageDate": '2024-05-21',
    "bal_date": '2024-05-21',
    "address": 'Al Tysiąclecia Państwa Polskiego',
    "sellerName": "Glosel spółka z ograniczoną odpowiedzialnością sp.k.",
    "invoiceNettoValue": 194.76,
    "invoiceBruttoValue": 204.49,
    "bankAccount": "PL21109025900000000135480974",
    "vat_included": false,
    "paid": true,
    "marza": 0,
    "pro_forma_id": 0,

    "products": [
        {
            "index": "9788380877542",
            "name": "Esencjalista.Mniej,ale lepiej - Greg McKeown",
            "quantity": 1,
            "net_price": 3665,
            "vat_rate": 5,
            "vat_value": 183,
            "gross_price": 3848
        },
        {
            "index": "9788375797381",
            "name": "Atomowe nawyki.Drobne zmiany,niezwykłe efekty - James Clear",
            "quantity": 100,
            "net_price": 2833,
            "vat_rate": 5,
            "vat_value": 142,
            "gross_price": 2975
        },
        {
            "index": "9788375798845",
            "name": "Nic mnie nie złamie.Zapanuj nad swoim umysłem i pokonaj przeciwności losu - David Goggins",
            "quantity": 1,
            "net_price": 3686,
            "vat_rate": 5,
            "vat_value": 184,
            "gross_price": 3870
        },
        {
            "index": "9788375796537",
            "name": "Jedna rzecz zaskakujący mechanizm niezwykłych osiągnięć - Gary Keller",
            "quantity": 1,
            "net_price": 3062,
            "vat_rate": 5,
            "vat_value": 153,
            "gross_price": 3215
        },
        {
            "index": "9788375799071",
            "name": "Bez końca.Uwolnij umysł i wygraj wewnętrzną walkę - David Goggins",
            "quantity": 1,
            "net_price": 3401,
            "vat_rate": 5,
            "vat_value": 170,
            "gross_price": 3571
        },
        {
            "index": "9788367996334",
            "name": "Praca z cieniem.Dziennik motywacyjny - Keila Shaheen",
            "quantity": 1,
            "net_price": 2829,
            "vat_rate": 5,
            "vat_value": 141,
            "gross_price": 2970
        }
    ]
}


console.log(removeDecimal(rawData.invoiceBruttoValue));