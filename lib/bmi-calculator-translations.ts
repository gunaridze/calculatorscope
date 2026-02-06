/**
 * Переводы для BMI Calculator (tool_id=1003)
 * UI элементы результата: статусы, сообщения, метрики
 */

export type BMICalculatorLang = 'en' | 'ru' | 'de' | 'es' | 'fr' | 'it' | 'pl' | 'lv'

export interface BMICalculatorTranslations {
    result: {
        title: string
        healthy_bmi_range: string
        healthy_weight_for_height: string
        bmi_prime: string
        ponderal_index: string
    }
    status: {
        underweight: string
        normal: string
        overweight: string
        obesity: string
    }
    messages: {
        healthy: string
        underweight: string
        obese: string
    }
    units: {
        kg: string
        lb: string
        st: string
        cm: string
        m: string
        in: string
        ft: string
    }
    buttons: {
        save: string
        save_pdf: string
        copy_result: string
    }
}

const translations: Record<BMICalculatorLang, BMICalculatorTranslations> = {
    en: {
        result: {
            title: 'Result',
            healthy_bmi_range: 'Healthy BMI range: 18.5 kg/m² - 25 kg/m²',
            healthy_weight_for_height: 'Healthy weight for the height: {min} {unit} - {max} {unit}',
            bmi_prime: 'BMI Prime: {value}',
            ponderal_index: 'Ponderal Index: {value} kg/m³'
        },
        status: {
            underweight: 'Underweight',
            normal: 'Normal',
            overweight: 'Overweight',
            obesity: 'Obesity'
        },
        messages: {
            healthy: 'Your weight is healthy.',
            underweight: 'You are underweight. You need to gain at least {weight} {unit} to reach a healthy weight.',
            obese: 'You are obese. You need to lose at least {weight} {unit} to reach a healthy BMI.'
        },
        units: {
            kg: 'kg',
            lb: 'lb',
            st: 'st',
            cm: 'cm',
            m: 'm',
            in: 'in',
            ft: 'ft'
        }
    },
    ru: {
        result: {
            title: 'Результат',
            healthy_bmi_range: 'Здоровый диапазон ИМТ: 18.5 кг/м² - 25 кг/м²',
            healthy_weight_for_height: 'Здоровый вес для роста: {min} {unit} - {max} {unit}',
            bmi_prime: 'BMI Prime: {value}',
            ponderal_index: 'Пондеральный индекс: {value} кг/м³'
        },
        status: {
            underweight: 'Недостаточный вес',
            normal: 'Нормальный',
            overweight: 'Избыточный вес',
            obesity: 'Ожирение'
        },
        messages: {
            healthy: 'Ваш вес в норме.',
            underweight: 'У вас недостаточный вес. Вам нужно набрать как минимум {weight} {unit}, чтобы достичь здорового веса.',
            obese: 'У вас ожирение. Вам нужно сбросить как минимум {weight} {unit}, чтобы достичь здорового ИМТ.'
        },
        units: {
            kg: 'кг',
            lb: 'lb',
            st: 'st',
            cm: 'см',
            m: 'м',
            in: 'in',
            ft: 'ft'
        },
        buttons: {
            save: 'Сохранить',
            save_pdf: 'Сохранить как PDF',
            copy_result: 'Копировать результат'
        }
    },
    de: {
        result: {
            title: 'Ergebnis',
            healthy_bmi_range: 'Gesunder BMI-Bereich: 18.5 kg/m² - 25 kg/m²',
            healthy_weight_for_height: 'Gesundes Gewicht für die Größe: {min} {unit} - {max} {unit}',
            bmi_prime: 'BMI Prime: {value}',
            ponderal_index: 'Ponderaler Index: {value} kg/m³'
        },
        status: {
            underweight: 'Untergewicht',
            normal: 'Normal',
            overweight: 'Übergewicht',
            obesity: 'Adipositas'
        },
        messages: {
            healthy: 'Ihr Gewicht ist gesund.',
            underweight: 'Sie haben Untergewicht. Sie müssen mindestens {weight} {unit} zunehmen, um ein gesundes Gewicht zu erreichen.',
            obese: 'Sie sind fettleibig. Sie müssen mindestens {weight} {unit} abnehmen, um einen gesunden BMI zu erreichen.'
        },
        units: {
            kg: 'kg',
            lb: 'lb',
            st: 'st',
            cm: 'cm',
            m: 'm',
            in: 'in',
            ft: 'ft'
        },
        buttons: {
            save: 'Speichern',
            save_pdf: 'Als PDF speichern',
            copy_result: 'Ergebnis kopieren'
        }
    },
    es: {
        result: {
            title: 'Resultado',
            healthy_bmi_range: 'Rango saludable de IMC: 18.5 kg/m² - 25 kg/m²',
            healthy_weight_for_height: 'Peso saludable para la altura: {min} {unit} - {max} {unit}',
            bmi_prime: 'BMI Prime: {value}',
            ponderal_index: 'Índice Ponderal: {value} kg/m³'
        },
        status: {
            underweight: 'Bajo peso',
            normal: 'Normal',
            overweight: 'Sobrepeso',
            obesity: 'Obesidad'
        },
        messages: {
            healthy: 'Su peso es saludable.',
            underweight: 'Tiene bajo peso. Necesita ganar al menos {weight} {unit} para alcanzar un peso saludable.',
            obese: 'Tiene obesidad. Necesita perder al menos {weight} {unit} para alcanzar un IMC saludable.'
        },
        units: {
            kg: 'kg',
            lb: 'lb',
            st: 'st',
            cm: 'cm',
            m: 'm',
            in: 'in',
            ft: 'ft'
        },
        buttons: {
            save: 'Guardar',
            save_pdf: 'Guardar como PDF',
            copy_result: 'Copiar resultado'
        }
    },
    fr: {
        result: {
            title: 'Résultat',
            healthy_bmi_range: 'Plage d\'IMC saine: 18.5 kg/m² - 25 kg/m²',
            healthy_weight_for_height: 'Poids sain pour la taille: {min} {unit} - {max} {unit}',
            bmi_prime: 'BMI Prime: {value}',
            ponderal_index: 'Indice Pondéral: {value} kg/m³'
        },
        status: {
            underweight: 'Insuffisance pondérale',
            normal: 'Normal',
            overweight: 'Surpoids',
            obesity: 'Obésité'
        },
        messages: {
            healthy: 'Votre poids est sain.',
            underweight: 'Vous avez une insuffisance pondérale. Vous devez prendre au moins {weight} {unit} pour atteindre un poids sain.',
            obese: 'Vous êtes obèse. Vous devez perdre au moins {weight} {unit} pour atteindre un IMC sain.'
        },
        units: {
            kg: 'kg',
            lb: 'lb',
            st: 'st',
            cm: 'cm',
            m: 'm',
            in: 'in',
            ft: 'ft'
        },
        buttons: {
            save: 'Enregistrer',
            save_pdf: 'Enregistrer en PDF',
            copy_result: 'Copier le résultat'
        }
    },
    it: {
        result: {
            title: 'Risultato',
            healthy_bmi_range: 'Intervallo BMI sano: 18.5 kg/m² - 25 kg/m²',
            healthy_weight_for_height: 'Peso sano per l\'altezza: {min} {unit} - {max} {unit}',
            bmi_prime: 'BMI Prime: {value}',
            ponderal_index: 'Indice Ponderal: {value} kg/m³'
        },
        status: {
            underweight: 'Sottopeso',
            normal: 'Normale',
            overweight: 'Sovrappeso',
            obesity: 'Obesità'
        },
        messages: {
            healthy: 'Il tuo peso è sano.',
            underweight: 'Sei sottopeso. Devi guadagnare almeno {weight} {unit} per raggiungere un peso sano.',
            obese: 'Sei obeso. Devi perdere almeno {weight} {unit} per raggiungere un BMI sano.'
        },
        units: {
            kg: 'kg',
            lb: 'lb',
            st: 'st',
            cm: 'cm',
            m: 'm',
            in: 'in',
            ft: 'ft'
        },
        buttons: {
            save: 'Salva',
            save_pdf: 'Salva come PDF',
            copy_result: 'Copia risultato'
        }
    },
    pl: {
        result: {
            title: 'Wynik',
            healthy_bmi_range: 'Zdrowy zakres BMI: 18.5 kg/m² - 25 kg/m²',
            healthy_weight_for_height: 'Zdrowa waga dla wzrostu: {min} {unit} - {max} {unit}',
            bmi_prime: 'BMI Prime: {value}',
            ponderal_index: 'Wskaźnik Ponderalny: {value} kg/m³'
        },
        status: {
            underweight: 'Niedowaga',
            normal: 'Normalna',
            overweight: 'Nadwaga',
            obesity: 'Otyłość'
        },
        messages: {
            healthy: 'Twoja waga jest zdrowa.',
            underweight: 'Masz niedowagę. Musisz przybrać co najmniej {weight} {unit}, aby osiągnąć zdrową wagę.',
            obese: 'Masz otyłość. Musisz stracić co najmniej {weight} {unit}, aby osiągnąć zdrowy BMI.'
        },
        units: {
            kg: 'kg',
            lb: 'lb',
            st: 'st',
            cm: 'cm',
            m: 'm',
            in: 'in',
            ft: 'ft'
        },
        buttons: {
            save: 'Zapisz',
            save_pdf: 'Zapisz jako PDF',
            copy_result: 'Kopiuj wynik'
        }
    },
    lv: {
        result: {
            title: 'Rezultāts',
            healthy_bmi_range: 'Veselīgs BMI diapazons: 18.5 kg/m² - 25 kg/m²',
            healthy_weight_for_height: 'Veselīgs svars augumam: {min} {unit} - {max} {unit}',
            bmi_prime: 'BMI Prime: {value}',
            ponderal_index: 'Ponderalais indekss: {value} kg/m³'
        },
        status: {
            underweight: 'Zems svars',
            normal: 'Normāls',
            overweight: 'Liekais svars',
            obesity: 'Aptaukošanās'
        },
        messages: {
            healthy: 'Jūsu svars ir veselīgs.',
            underweight: 'Jums ir zems svars. Jums jāpieņemas vismaz {weight} {unit}, lai sasniegtu veselīgu svaru.',
            obese: 'Jums ir aptaukošanās. Jums jāzaudē vismaz {weight} {unit}, lai sasniegtu veselīgu BMI.'
        },
        units: {
            kg: 'kg',
            lb: 'lb',
            st: 'st',
            cm: 'cm',
            m: 'm',
            in: 'in',
            ft: 'ft'
        },
        buttons: {
            save: 'Saglabāt',
            save_pdf: 'Saglabāt kā PDF',
            copy_result: 'Kopēt rezultātu'
        }
    }
}

export function getBMICalculatorTranslations(lang: string): BMICalculatorTranslations {
    const key = lang as BMICalculatorLang
    return translations[key] ?? translations.en
}

/**
 * Форматирует сообщение с подстановкой переменных
 */
export function formatMessage(
    template: string,
    params: Record<string, string | number>
): string {
    let result = template
    Object.entries(params).forEach(([key, value]) => {
        result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value))
    })
    return result
}
