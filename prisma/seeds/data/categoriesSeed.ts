import { CategorySeed } from '../types';

export interface CategorySeedNode extends CategorySeed {
    children?: CategorySeedNode[];
}

export const categoriesSeed: CategorySeedNode[] = [
    {
        slug: 'finance',
        sort_order: 1,
        name: {
            en: 'Finance Calculators',
            de: 'Finanzrechner',
            fr: 'Calculatrices financières',
            es: 'Calculadoras financieras',
            it: 'Calcolatori finanziari',
            pl: 'Kalkulatory finansowe',
            ru: 'Финансовые калькуляторы',
            lv: 'Finanšu kalkulatori'
        },
        children: [
            {
                slug: 'loans-debt',
                sort_order: 1,
                name: {
                    en: 'Loans & Debt Calculators',
                    de: 'Kredit- & Schuldenrechner',
                    fr: 'Calculatrices de prêts et dettes',
                    es: 'Calculadoras de préstamos y deudas',
                    it: 'Calcolatori prestiti e debiti',
                    pl: 'Kalkulatory pożyczek i długów',
                    ru: 'Калькуляторы кредитов и долгов',
                    lv: 'Aizdevumu un parādu kalkulatori'
                }
            },
            {
                slug: 'interest-time',
                sort_order: 2,
                name: {
                    en: 'Loan & Interest Calculations',
                    de: 'Kredit- und Zinsberechnungen',
                    fr: 'Calcul des prêts et intérêts',
                    es: 'Cálculo de préstamos e intereses',
                    it: 'Calcolo prestiti e interessi',
                    pl: 'Obliczenia kredytów i odsetek',
                    ru: 'Расчёты процентов по кредитам и займам',
                    lv: 'Aizdevumu un procentu aprēķini'
                }
            },
            {
                slug: 'saving-investing',
                sort_order: 3,
                name: {
                    en: 'Saving & Investing',
                    de: 'Sparen & Investieren',
                    fr: 'Épargne et investissement',
                    es: 'Ahorro e inversión',
                    it: 'Risparmio e investimenti',
                    pl: 'Oszczędzanie i inwestowanie',
                    ru: 'Сбережения и инвестиции',
                    lv: 'Ieguldīšana un uzkrājumi'
                }
            },
            {
                slug: 'business-sales',
                sort_order: 4,
                name: {
                    en: 'Business & Sales',
                    de: 'Business & Vertrieb',
                    fr: 'Affaires et ventes',
                    es: 'Negocios y ventas',
                    it: 'Business e vendite',
                    pl: 'Biznes i sprzedaż',
                    ru: 'Бизнес и продажи',
                    lv: 'Bizness un pārdošana'
                }
            },
            {
                slug: 'accounting-ratios',
                sort_order: 5,
                name: {
                    en: 'Accounting Ratios',
                    de: 'Bilanzkennzahlen',
                    fr: 'Ratios comptables',
                    es: 'Ratios contables',
                    it: 'Indicatori contabili',
                    pl: 'Wskaźniki księgowe',
                    ru: 'Бухгалтерские коэффициенты',
                    lv: 'Grāmatvedības koeficienti'
                }
            }
        ]
    },

    {
        slug: 'health-fitness',
        sort_order: 2,
        name: {
            en: 'Health & Fitness Calculators',
            de: 'Gesundheits- & Fitnessrechner',
            fr: 'Calculatrices santé et fitness',
            es: 'Calculadoras de salud y fitness',
            it: 'Calcolatori salute e fitness',
            pl: 'Kalkulatory zdrowia i kondycji',
            ru: 'Калькуляторы для здоровья и фитнеса',
            lv: 'Kalkulatori veselībai un fitnesam'
        }
    },

    {
        slug: 'converters',
        sort_order: 3,
        name: {
            en: 'Converters',
            de: 'Umrechner',
            fr: 'Convertisseurs',
            es: 'Convertidores',
            it: 'Convertitori',
            pl: 'Konwertery',
            ru: 'Конвертеры',
            lv: 'Konvertētāji'
        },
        children: [
            {
                slug: 'length-area',
                sort_order: 1,
                name: {
                    en: 'Length & Area Converters',
                    de: 'Längen- & Flächenumrechner',
                    fr: 'Convertisseurs de longueur et surface',
                    es: 'Convertidores de longitud y área',
                    it: 'Convertitori di lunghezza e area',
                    pl: 'Konwertery długości i powierzchni',
                    ru: 'Конвертеры длины и площади',
                    lv: 'Garuma un platības konvertētāji'
                }
            },
            {
                slug: 'volume-mass',
                sort_order: 2,
                name: {
                    en: 'Volume & Mass Converters',
                    de: 'Volumen- & Massenumrechner',
                    fr: 'Convertisseurs de volume et masse',
                    es: 'Convertidores de volumen y masa',
                    it: 'Convertitori di volume e massa',
                    pl: 'Konwertery objętości i masy',
                    ru: 'Конвертеры объёма и массы',
                    lv: 'Tilpuma un masas konvertētāji'
                }
            },
            {
                slug: 'time-speed',
                sort_order: 3,
                name: {
                    en: 'Time & Speed Converters',
                    de: 'Zeit- & Geschwindigkeitsumrechner',
                    fr: 'Convertisseurs de temps et vitesse',
                    es: 'Convertidores de tiempo y velocidad',
                    it: 'Convertitori di tempo e velocità',
                    pl: 'Konwertery czasu i prędkości',
                    ru: 'Конвертеры времени и скорости',
                    lv: 'Laika un ātruma konvertētāji'
                }
            },
            {
                slug: 'temperature-angle',
                sort_order: 4,
                name: {
                    en: 'Temperature & Angle Converters',
                    de: 'Temperatur- & Winkelumrechner',
                    fr: 'Convertisseurs de température et d’angle',
                    es: 'Convertidores de temperatura y ángulo',
                    it: 'Convertitori di temperatura e angolo',
                    pl: 'Konwertery temperatury i kątów',
                    ru: 'Конвертеры температуры и углов',
                    lv: 'Temperatūras un leņķa konvertētāji'
                }
            },
            {
                slug: 'digital-misc',
                sort_order: 5,
                name: {
                    en: 'Digital & Misc Converters',
                    de: 'Digitale & Sonstige Umrechner',
                    fr: 'Convertisseurs numériques et divers',
                    es: 'Convertidores digitales y varios',
                    it: 'Convertitori digitali e vari',
                    pl: 'Konwertery cyfrowe i różne',
                    ru: 'Конвертеры цифровые и прочие',
                    lv: 'Digitālie un dažādi konvertētāji'
                }
            }
        ]
    },

    {
        slug: 'currency-converter',
        sort_order: 4,
        name: {
            en: 'Currency Converter',
            de: 'Währungsrechner',
            fr: 'Convertisseur de devises',
            es: 'Convertidor de divisas',
            it: 'Convertitore di valuta',
            pl: 'Konwerter walut',
            ru: 'Конвертер валют',
            lv: 'Valūtas konvertētājs'
        }
    },

    {
        slug: 'marketing',
        sort_order: 5,
        name: {
            en: 'Marketing Calculators',
            de: 'Marketing-Rechner',
            fr: 'Calculatrices marketing',
            es: 'Calculadoras de marketing',
            it: 'Calcolatori di marketing',
            pl: 'Kalkulatory marketingowe',
            ru: 'Маркетинговые калькуляторы',
            lv: 'Mārketinga kalkulatori'
        }
    },

    {
        slug: 'construction',
        sort_order: 6,
        name: {
            en: 'Construction Calculators',
            de: 'Bau-Rechner',
            fr: 'Calculatrices de construction',
            es: 'Calculadoras de construcción',
            it: 'Calcolatori per costruzioni',
            pl: 'Kalkulatory budowlane',
            ru: 'Строительные калькуляторы',
            lv: 'Būvniecības kalkulatori'
        }
    },

    {
        slug: 'utilities',
        sort_order: 7,
        name: {
            en: 'Utilities',
            de: 'Dienstprogramme',
            fr: 'Utilitaires',
            es: 'Utilidades',
            it: 'Utility',
            pl: 'Narzędzia',
            ru: 'Служебные инструменты',
            lv: 'Palīgprogrammas'
        }
    },

    {
        slug: 'word-text-tools',
        sort_order: 8,
        name: {
            en: 'Word & Text Tools',
            de: 'Text- & Wortwerkzeuge',
            fr: 'Outils de texte et de mots',
            es: 'Herramientas de texto y palabras',
            it: 'Strumenti per testo e parole',
            pl: 'Narzędzia do tekstu i słów',
            ru: 'Инструменты для текста и слов',
            lv: 'Vārdu un teksta rīki'
        }
    },

    {
        slug: 'date-time',
        sort_order: 9,
        name: {
            en: 'Date & Time Calculators',
            de: 'Datums- & Zeitrechner',
            fr: 'Calculatrices de date et heure',
            es: 'Calculadoras de fecha y hora',
            it: 'Calcolatori di data e ora',
            pl: 'Kalkulatory daty i czasu',
            ru: 'Калькуляторы даты и времени',
            lv: 'Datuma un laika kalkulatori'
        }
    },

    {
        slug: 'percent-ratio',
        sort_order: 10,
        name: {
            en: 'Percent & Ratio Calculators',
            de: 'Prozent- & Verhältnisrechner',
            fr: 'Calculatrices de pourcentage et ratio',
            es: 'Calculadoras de porcentaje y proporción',
            it: 'Calcolatori di percentuale e rapporto',
            pl: 'Kalkulatory procentów i proporcji',
            ru: 'Калькуляторы процентов и соотношений',
            lv: 'Procentu un attiecību kalkulatori'
        }
    },

    {
        slug: 'printing',
        sort_order: 11,
        name: {
            en: 'Printing & Design Calculators',
            de: 'Druck- & Design-Rechner',
            fr: 'Calculatrices impression et design',
            es: 'Calculadoras de impresión y diseño',
            it: 'Calcolatori per stampa e design',
            pl: 'Kalkulatory drukowania i projektowania',
            ru: 'Калькуляторы печати и дизайна',
            lv: 'Drukas un dizaina kalkulatori'
        }
    },

    {
        slug: 'developer-tools',
        sort_order: 12,
        name: {
            en: 'Developer Tools',
            de: 'Entwicklerwerkzeuge',
            fr: 'Outils pour développeurs',
            es: 'Herramientas para desarrolladores',
            it: 'Strumenti per sviluppatori',
            pl: 'Narzędzia dla programistów',
            ru: 'Инструменты для разработчиков',
            lv: 'Izstrādātāju rīki'
        }
    },

    {
        slug: 'games-randomizers',
        sort_order: 13,
        name: {
            en: 'Games & Randomizers',
            de: 'Spiele & Zufallsgeneratoren',
            fr: 'Jeux et générateurs aléatoires',
            es: 'Juegos y generadores aleatorios',
            it: 'Giochi e generatori casuali',
            pl: 'Gry i generatory losowe',
            ru: 'Игры и генераторы случайных чисел',
            lv: 'Spēles un nejaušo izvēļu rīki'
        }
    },

    {
        slug: 'statistics',
        sort_order: 14,
        name: {
            en: 'Statistics Calculators',
            de: 'Statistik-Rechner',
            fr: 'Calculatrices statistiques',
            es: 'Calculadoras de estadísticas',
            it: 'Calcolatori statistici',
            pl: 'Kalkulatory statystyczne',
            ru: 'Статистические калькуляторы',
            lv: 'Statistikas kalkulatori'
        },
        children: [
            {
                slug: 'descriptive',
                sort_order: 1,
                name: {
                    en: 'Descriptive Statistics',
                    de: 'Deskriptive Statistik',
                    fr: 'Statistiques descriptives',
                    es: 'Estadísticas descriptivas',
                    it: 'Statistica descrittiva',
                    pl: 'Statystyka opisowa',
                    ru: 'Описательная статистика',
                    lv: 'Aprakstošā statistika'
                }
            },
            {
                slug: 'probability-random',
                sort_order: 2,
                name: {
                    en: 'Probability & Random',
                    de: 'Wahrscheinlichkeit & Zufall',
                    fr: 'Probabilité et aléatoire',
                    es: 'Probabilidad y aleatorio',
                    it: 'Probabilità e casualità',
                    pl: 'Prawdopodobieństwo i losowość',
                    ru: 'Вероятность и случайные величины',
                    lv: 'Varbūtība un nejaušie lielumi'
                }
            },
            {
                slug: 'analysis-inference',
                sort_order: 3,
                name: {
                    en: 'Statistical Analysis & Inference',
                    de: 'Statistische Analyse & Inferenz',
                    fr: 'Analyse statistique et inférence',
                    es: 'Análisis estadístico e inferencia',
                    it: 'Analisi statistica e inferenza',
                    pl: 'Analiza statystyczna i wnioskowanie',
                    ru: 'Статистический анализ и выводы',
                    lv: 'Statistiskā analīze un secinājumi'
                }
            },
            {
                slug: 'text-tools',
                sort_order: 4,
                name: {
                    en: 'Text Statistics Tools',
                    de: 'Textstatistik-Werkzeuge',
                    fr: 'Outils statistiques pour le texte',
                    es: 'Herramientas estadísticas de texto',
                    it: 'Strumenti statistici per testi',
                    pl: 'Narzędzia statystyczne dla tekstu',
                    ru: 'Инструменты текстовой статистики',
                    lv: 'Teksta statistikas rīki'
                }
            }
        ]
    },

    {
        slug: 'algebra',
        sort_order: 15,
        name: {
            en: 'Algebra Calculators',
            de: 'Algebra-Rechner',
            fr: 'Calculatrices algébriques',
            es: 'Calculadoras de álgebra',
            it: 'Calcolatori di algebra',
            pl: 'Kalkulatory algebraiczne',
            ru: 'Алгебраические калькуляторы',
            lv: 'Algebras kalkulatori'
        },
        children: [
            {
                slug: 'powers-roots',
                sort_order: 1,
                name: {
                    en: 'Powers & Roots',
                    de: 'Potenzen & Wurzeln',
                    fr: 'Puissances et racines',
                    es: 'Potencias y raíces',
                    it: 'Potenze e radici',
                    pl: 'Potęgi i pierwiastki',
                    ru: 'Степени и корни',
                    lv: 'Pakāpes un saknes'
                }
            },
            {
                slug: 'equations-expressions',
                sort_order: 2,
                name: {
                    en: 'Equations & Expressions',
                    de: 'Gleichungen & Ausdrücke',
                    fr: 'Équations et expressions',
                    es: 'Ecuaciones y expresiones',
                    it: 'Equazioni ed espressioni',
                    pl: 'Równania i wyrażenia',
                    ru: 'Уравнения и выражения',
                    lv: 'Vienādojumi un izteiksmes'
                }
            },
            {
                slug: 'percentages',
                sort_order: 3,
                name: {
                    en: 'Algebraic Percentages',
                    de: 'Algebraische Prozentsätze',
                    fr: 'Pourcentages algébriques',
                    es: 'Porcentajes algebraicos',
                    it: 'Percentuali algebriche',
                    pl: 'Procenty algebraiczne',
                    ru: 'Алгебраические проценты',
                    lv: 'Algebriskie procenti'
                }
            }
        ]
    },

    {
        slug: 'math',
        sort_order: 16,
        name: {
            en: 'Math Calculators',
            de: 'Mathematik-Rechner',
            fr: 'Calculatrices mathématiques',
            es: 'Calculadoras matemáticas',
            it: 'Calcolatori matematici',
            pl: 'Kalkulatory matematyczne',
            ru: 'Математические калькуляторы',
            lv: 'Matemātikas kalkulatori'
        },
        children: [
            {
                slug: 'arithmetic',
                sort_order: 1,
                name: {
                    en: 'Arithmetic',
                    de: 'Arithmetik',
                    fr: 'Arithmétique',
                    es: 'Aritmética',
                    it: 'Aritmetica',
                    pl: 'Arytmetyka',
                    ru: 'Арифметика',
                    lv: 'Aritmētika'
                }
            },
            {
                slug: 'fractions-percent',
                sort_order: 2,
                name: {
                    en: 'Fractions & Percent',
                    de: 'Brüche & Prozent',
                    fr: 'Fractions et pourcentage',
                    es: 'Fracciones y porcentaje',
                    it: 'Frazioni e percentuali',
                    pl: 'Ułamki i procenty',
                    ru: 'Дроби и проценты',
                    lv: 'Daļas un procenti'
                }
            },
            {
                slug: 'factors-number-theory',
                sort_order: 3,
                name: {
                    en: 'Factors & Number Theory',
                    de: 'Faktoren & Zahlentheorie',
                    fr: 'Facteurs et théorie des nombres',
                    es: 'Factores y teoría de números',
                    it: 'Fattori e teoria dei numeri',
                    pl: 'Czynniki i teoria liczb',
                    ru: 'Факторы и теория чисел',
                    lv: 'Faktori un skaitļu teorija'
                }
            },
            {
                slug: 'rounding-notation',
                sort_order: 4,
                name: {
                    en: 'Rounding & Notation',
                    de: 'Runden & Notation',
                    fr: 'Arrondi et notation',
                    es: 'Redondeo y notación',
                    it: 'Arrotondamento e notazione',
                    pl: 'Zaokrąglanie i notacja',
                    ru: 'Округление и запись чисел',
                    lv: 'Noapaļošana un pieraksts'
                }
            },
            {
                slug: 'functions-other',
                sort_order: 5,
                name: {
                    en: 'Functions & Other Math',
                    de: 'Funktionen & andere Mathematik',
                    fr: 'Fonctions et autres mathématiques',
                    es: 'Funciones y otras matemáticas',
                    it: 'Funzioni e altra matematica',
                    pl: 'Funkcje i inne matematyczne',
                    ru: 'Функции и другая математика',
                    lv: 'Funkcijas un citi matemātikas rīki'
                }
            }
        ]
    },

    {
        slug: 'discrete-math',
        sort_order: 17,
        name: {
            en: 'Discrete Math',
            de: 'Diskrete Mathematik',
            fr: 'Mathématiques discrètes',
            es: 'Matemáticas discretas',
            it: 'Matematica discreta',
            pl: 'Matematyka dyskretna',
            ru: 'Дискретная математика',
            lv: 'Diskrētā matemātika'
        }
    },

    {
        slug: 'trigonometry',
        sort_order: 18,
        name: {
            en: 'Trigonometry Calculators',
            de: 'Trigonometrie-Rechner',
            fr: 'Calculatrices trigonométriques',
            es: 'Calculadoras de trigonometría',
            it: 'Calcolatori di trigonometria',
            pl: 'Kalkulatory trygonometryczne',
            ru: 'Калькуляторы тригонометрии',
            lv: 'Trigonometrijas kalkulatori'
        }
    },

    {
        slug: 'physics',
        sort_order: 19,
        name: {
            en: 'Physics Calculators',
            de: 'Physik-Rechner',
            fr: 'Calculatrices de physique',
            es: 'Calculadoras de física',
            it: 'Calcolatori di fisica',
            pl: 'Kalkulatory fizyczne',
            ru: 'Физические калькуляторы',
            lv: 'Fizikas kalkulatori'
        },
        children: [
            {
                slug: 'kinematics',
                sort_order: 1,
                name: {
                    en: 'Kinematics',
                    de: 'Kinematik',
                    fr: 'Cinématique',
                    es: 'Cinemática',
                    it: 'Cinematica',
                    pl: 'Kinematyka',
                    ru: 'Кинематика',
                    lv: 'Kinemātika'
                }
            },
            {
                slug: 'dynamics',
                sort_order: 2,
                name: {
                    en: 'Dynamics',
                    de: 'Dynamik',
                    fr: 'Dynamique',
                    es: 'Dinámica',
                    it: 'Dinamica',
                    pl: 'Dynamika',
                    ru: 'Динамика',
                    lv: 'Dinamika'
                }
            },
            {
                slug: 'energy',
                sort_order: 3,
                name: {
                    en: 'Energy',
                    de: 'Energie',
                    fr: 'Énergie',
                    es: 'Energía',
                    it: 'Energia',
                    pl: 'Energia',
                    ru: 'Энергия',
                    lv: 'Enerģija'
                }
            },
            {
                slug: 'waves-matter',
                sort_order: 4,
                name: {
                    en: 'Waves & Matter',
                    de: 'Wellen & Materie',
                    fr: 'Ondes et matière',
                    es: 'Ondas y materia',
                    it: 'Onde e materia',
                    pl: 'Fale i materia',
                    ru: 'Волны и материя',
                    lv: 'Vilnēs un viela'
                }
            }
        ]
    },

    {
        slug: 'geometry',
        sort_order: 20,
        name: {
            en: 'Geometry Calculators',
            de: 'Geometrie-Rechner',
            fr: 'Calculatrices de géométrie',
            es: 'Calculadoras de geometría',
            it: 'Calcolatori di geometria',
            pl: 'Kalkulatory geometrii',
            ru: 'Геометрические калькуляторы',
            lv: 'Ģeometrijas kalkulatori'
        },
        children: [
            {
                slug: 'plane',
                sort_order: 1,
                name: {
                    en: 'Plane Geometry',
                    de: 'Ebene Geometrie',
                    fr: 'Géométrie plane',
                    es: 'Geometría plana',
                    it: 'Geometria piana',
                    pl: 'Geometria płaska',
                    ru: 'Планиметрия',
                    lv: 'Plakanā ģeometrija'
                }
            },
            {
                slug: 'solid',
                sort_order: 2,
                name: {
                    en: 'Solid Geometry',
                    de: 'Raumgeometrie',
                    fr: 'Géométrie solide',
                    es: 'Geometría sólida',
                    it: 'Geometria solida',
                    pl: 'Geometria przestrzenna',
                    ru: 'Стереометрия',
                    lv: 'Telpiskā ģeometrija'
                }
            },
            {
                slug: 'geometric-trigonometry',
                sort_order: 3,
                name: {
                    en: 'Geometric Trigonometry',
                    de: 'Geometrische Trigonometrie',
                    fr: 'Trigonométrie géométrique',
                    es: 'Trigonometría geométrica',
                    it: 'Trigonometria geometrica',
                    pl: 'Trygonometria geometryczna',
                    ru: 'Геометрическая тригонометрия',
                    lv: 'Ģeometriskā trigonometrija'
                }
            }
        ]
    },

    {
        slug: 'chemistry',
        sort_order: 21,
        name: {
            en: 'Chemistry Calculators',
            de: 'Chemie-Rechner',
            fr: 'Calculatrices chimiques',
            es: 'Calculadoras de química',
            it: 'Calcolatori di chimica',
            pl: 'Kalkulatory chemiczne',
            ru: 'Химические калькуляторы',
            lv: 'Ķīmijas kalkulatori'
        }
    }
];