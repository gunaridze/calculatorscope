// Переводы для формы обратной связи
export const feedbackTranslations: Record<string, {
    title: string
    fields: {
        name: {
            label: string
            required_text: string
        }
        email: {
            label: string
            required_text: string
        }
        message: {
            label: string
            required_text: string
            placeholder: string
        }
    }
    validation: {
        fill_out: string
    }
    button: {
        submit: string
    }
}> = {
    en: {
        title: 'Feedback Form',
        fields: {
            name: {
                label: 'Name:',
                required_text: '*Required',
            },
            email: {
                label: 'Email:',
                required_text: '*Required',
            },
            message: {
                label: 'Describe your requests or suggestions:',
                required_text: '*Required',
                placeholder: 'Please add details to help us make CalculatorScope.com better!',
            },
        },
        validation: {
            fill_out: 'Please fill out this field',
        },
        button: {
            submit: 'Submit',
        },
    },
    ru: {
        title: 'Форма обратной связи',
        fields: {
            name: {
                label: 'Имя:',
                required_text: '*обязательно',
            },
            email: {
                label: 'Email:',
                required_text: '*обязательно',
            },
            message: {
                label: 'Опишите ваш запрос или предложение:',
                required_text: '*обязательно',
                placeholder: 'Пожалуйста, укажите детали, чтобы помочь нам улучшить CalculatorScope.com!',
            },
        },
        validation: {
            fill_out: 'Заполните это поле',
        },
        button: {
            submit: 'Отправить',
        },
    },
    lv: {
        title: 'Atsauksmju veidlapa',
        fields: {
            name: {
                label: 'Vārds:',
                required_text: '*obligāts',
            },
            email: {
                label: 'E-pasts:',
                required_text: '*obligāts',
            },
            message: {
                label: 'Aprakstiet savu pieprasījumu vai ieteikumus:',
                required_text: '*obligāts',
                placeholder: 'Lūdzu, pievienojiet informāciju, kas palīdzēs uzlabot CalculatorScope.com!',
            },
        },
        validation: {
            fill_out: 'Lūdzu, aizpildiet šo lauku',
        },
        button: {
            submit: 'Nosūtīt',
        },
    },
    pl: {
        title: 'Formularz opinii',
        fields: {
            name: {
                label: 'Imię:',
                required_text: '*wymagane',
            },
            email: {
                label: 'E-mail:',
                required_text: '*wymagane',
            },
            message: {
                label: 'Opisz swoją prośbę lub sugestie:',
                required_text: '*wymagane',
                placeholder: 'Prosimy o szczegóły, które pomogą nam ulepszyć CalculatorScope.com!',
            },
        },
        validation: {
            fill_out: 'Wypełnij to pole',
        },
        button: {
            submit: 'Wyślij',
        },
    },
    es: {
        title: 'Formulario de comentarios',
        fields: {
            name: {
                label: 'Nombre:',
                required_text: '*obligatorio',
            },
            email: {
                label: 'Email:',
                required_text: '*obligatorio',
            },
            message: {
                label: 'Describa su solicitud o sugerencias:',
                required_text: '*obligatorio',
                placeholder: '¡Por favor, añada detalles para ayudarnos a mejorar CalculatorScope.com!',
            },
        },
        validation: {
            fill_out: 'Rellene este campo',
        },
        button: {
            submit: 'Enviar',
        },
    },
    fr: {
        title: 'Formulaire de commentaires',
        fields: {
            name: {
                label: 'Nom :',
                required_text: '*obligatoire',
            },
            email: {
                label: 'E-mail :',
                required_text: '*obligatoire',
            },
            message: {
                label: 'Décrivez votre demande ou vos suggestions :',
                required_text: '*obligatoire',
                placeholder: 'Veuillez ajouter des détails pour nous aider à améliorer CalculatorScope.com !',
            },
        },
        validation: {
            fill_out: 'Veuillez remplir ce champ',
        },
        button: {
            submit: 'Envoyer',
        },
    },
    it: {
        title: 'Modulo di feedback',
        fields: {
            name: {
                label: 'Nome:',
                required_text: '*obbligatorio',
            },
            email: {
                label: 'Email:',
                required_text: '*obbligatorio',
            },
            message: {
                label: 'Descrivi la tua richiesta o i tuoi suggerimenti:',
                required_text: '*obbligatorio',
                placeholder: 'Aggiungi dettagli per aiutarci a migliorare CalculatorScope.com!',
            },
        },
        validation: {
            fill_out: 'Compila questo campo',
        },
        button: {
            submit: 'Invia',
        },
    },
    de: {
        title: 'Feedback-Formular',
        fields: {
            name: {
                label: 'Name:',
                required_text: '*erforderlich',
            },
            email: {
                label: 'E-Mail:',
                required_text: '*erforderlich',
            },
            message: {
                label: 'Beschreiben Sie Ihre Anfrage oder Vorschläge:',
                required_text: '*erforderlich',
                placeholder: 'Bitte fügen Sie Details hinzu, um CalculatorScope.com zu verbessern!',
            },
        },
        validation: {
            fill_out: 'Füllen Sie dieses Feld aus',
        },
        button: {
            submit: 'Absenden',
        },
    },
}

export function getFeedbackTranslations(lang: string) {
    return feedbackTranslations[lang as keyof typeof feedbackTranslations] || feedbackTranslations.en
}
