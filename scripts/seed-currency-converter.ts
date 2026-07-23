// One-off script: seeds the Currency Converter tool (id 1156) into the
// pre-existing top-level "Currency Converter" category (id 4, no parent -
// a sibling of "Converters", not nested under it). This category had 0
// tools before this script.
//
// Unlike every other converter this session, this tool is rendered by a
// bespoke live-rate React component (CurrencyConverterWidget.tsx), special-
// cased by tool_id in CalculatorWidget.tsx, since exchange rates are fetched
// live from /api/exchange-rates (which proxies Frankfurter.app, ECB
// reference rates, cached 1 hour) rather than being a fixed conversion
// factor computable by the static JSON engine. config_json is therefore a
// minimal placeholder; only the ToolI18n content drives the page shell/SEO.
// Run with: npx tsx scripts/seed-currency-converter.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const CURRENCY_CATEGORY_ID = '4'
const TOOL_ID = '1156'

type LocaleContent = {
    slug: string
    title: string
    h1: string
    meta_title: string
    meta_description: string
    short_answer: string
    intro_text: string
    key_points: string[]
    howto: Array<{ question: string; answer: string }>
    faq: Array<{ question: string; answer: string }>
}

const LOCALES: Record<string, LocaleContent> = {
    en: {
        slug: 'currency-converter', title: 'Currency Converter with Live Exchange Rates', h1: 'Currency Converter',
        meta_title: 'Currency Converter | Live Exchange Rates for 30 Currencies',
        meta_description: 'Convert currencies instantly using accurate, up-to-date exchange rates. Compare values, track changes, and calculate money conversions between global currencies.',
        short_answer: 'This converter changes an amount between 30 major world currencies using live exchange rates, refreshed hourly.',
        intro_text: '<p>Enter an amount and choose a currency to convert from and to — rates are pulled from the European Central Bank\'s daily reference rates and refreshed automatically, so you always see up-to-date values without needing to look anything up manually.</p>',
        key_points: [
            '<b>Live data:</b> exchange rates come from the European Central Bank\'s official daily reference rates, refreshed on our server every hour.',
            '<b>30 major currencies:</b> covers USD, EUR, GBP, JPY, CHF, CAD, AUD, CNY, and 22 others spanning every populated continent.',
            '<b>Not for trading:</b> ECB reference rates are a widely trusted daily benchmark, but actual bank/broker exchange rates include a spread and may differ slightly — use this for estimates, not for executing trades.',
        ],
        howto: [
            { question: 'How often do the exchange rates update?', answer: '<p>The European Central Bank publishes reference rates once per business day; our server refreshes its cached copy every hour, so you\'re always seeing the latest available rate.</p>' },
            { question: 'Can I convert between any two of the 30 currencies?', answer: '<p>Yes — pick any currency as "From" and any other as "To", including combinations that don\'t involve USD or EUR directly (the rates are cross-calculated automatically).</p>' },
            { question: 'Why do exchange rates change day to day?', answer: '<p>Currency values float based on supply and demand in global foreign exchange markets, influenced by interest rates, inflation, trade balances, and economic news in each country.</p>' },
        ],
        faq: [
            {
                question: 'Where do these exchange rates come from?',
                answer: '<p>Rates are sourced from the European Central Bank\'s official daily foreign exchange reference rates, accessed via the free Frankfurter.app data service, and cached on our server for one hour before refreshing.</p>',
            },
            {
                question: 'Is this suitable for sending money or trading currency?',
                answer: '<p>This tool is designed for quick estimates and comparisons. Banks, money transfer services, and brokers apply their own spread/markup on top of the reference rate, so the amount you actually receive will typically be slightly different from what this calculator shows.</p>',
            },
            {
                question: 'Why isn\'t my local currency in the list?',
                answer: '<p>The 30 currencies covered here are the ones the European Central Bank publishes daily reference rates for. Currencies outside that set aren\'t included in this particular data source.</p>',
            },
        ],
    },
    ru: {
        slug: 'konverter-valyut', title: 'Конвертер валют с актуальными курсами', h1: 'Конвертер валют',
        meta_title: 'Конвертер валют | Актуальные курсы для 30 валют',
        meta_description: 'Конвертируйте валюты мгновенно, используя точные и актуальные курсы обмена. Сравнивайте значения и рассчитывайте конвертацию между мировыми валютами.',
        short_answer: 'Этот конвертер переводит сумму между 30 основными мировыми валютами, используя актуальные курсы, обновляемые каждый час.',
        intro_text: '<p>Введите сумму и выберите валюту, из которой и в которую конвертировать — курсы берутся из ежедневных справочных курсов Европейского центрального банка и обновляются автоматически.</p>',
        key_points: [
            '<b>Актуальные данные:</b> курсы обмена поступают из официальных ежедневных справочных курсов Европейского центрального банка, обновляемых на нашем сервере каждый час.',
            '<b>30 основных валют:</b> охватывает USD, EUR, GBP, JPY, CHF, CAD, AUD, CNY и ещё 22 валюты со всех населённых континентов.',
            '<b>Не для торговли:</b> справочные курсы ЕЦБ — широко признанный ежедневный ориентир, но реальные курсы банков/брокеров включают спред и могут немного отличаться — используйте это для оценки, а не для исполнения сделок.',
        ],
        howto: [
            { question: 'Как часто обновляются курсы обмена?', answer: '<p>Европейский центральный банк публикует справочные курсы один раз в рабочий день; наш сервер обновляет кэшированную копию каждый час.</p>' },
            { question: 'Могу ли я конвертировать между любыми двумя из 30 валют?', answer: '<p>Да — выберите любую валюту как «Из» и любую другую как «В», включая комбинации, не связанные напрямую с USD или EUR.</p>' },
            { question: 'Почему курсы валют меняются день ото дня?', answer: '<p>Стоимость валют плавает в зависимости от спроса и предложения на мировых валютных рынках, на что влияют процентные ставки, инфляция, торговые балансы и экономические новости.</p>' },
        ],
        faq: [
            { question: 'Откуда берутся эти курсы обмена?', answer: '<p>Курсы получены из официальных ежедневных справочных курсов Европейского центрального банка через бесплатный сервис данных Frankfurter.app и кэшируются на нашем сервере на один час перед обновлением.</p>' },
            { question: 'Подходит ли это для перевода денег или торговли валютой?', answer: '<p>Этот инструмент предназначен для быстрых оценок и сравнений. Банки, сервисы денежных переводов и брокеры применяют собственную наценку сверх справочного курса, поэтому фактически полученная сумма обычно немного отличается.</p>' },
            { question: 'Почему в списке нет моей местной валюты?', answer: '<p>30 валют здесь — это те, для которых Европейский центральный банк публикует ежедневные справочные курсы. Валюты вне этого набора не включены в данный источник данных.</p>' },
        ],
    },
    lv: {
        slug: 'valutas-kalkulators', title: 'Valūtas Kalkulators ar Aktuāliem Maiņas Kursiem', h1: 'Valūtas Kalkulators',
        meta_title: 'Valūtas Kalkulators | Aktuāli Kursi 30 Valūtām',
        meta_description: 'Konvertējiet valūtas acumirklī, izmantojot precīzus un aktuālus maiņas kursus. Salīdziniet vērtības un aprēķiniet naudas konvertāciju starp pasaules valūtām.',
        short_answer: 'Šis kalkulators pārrēķina summu starp 30 galvenajām pasaules valūtām, izmantojot aktuālus kursus, kas tiek atjaunināti katru stundu.',
        intro_text: '<p>Ievadiet summu un izvēlieties valūtu, no kuras un uz kuru konvertēt — kursi tiek ņemti no Eiropas Centrālās bankas ikdienas atsauces kursiem un tiek atjaunināti automātiski.</p>',
        key_points: [
            '<b>Aktuāli dati:</b> maiņas kursi nāk no Eiropas Centrālās bankas oficiālajiem ikdienas atsauces kursiem, kas tiek atjaunināti mūsu serverī katru stundu.',
            '<b>30 galvenās valūtas:</b> aptver USD, EUR, GBP, JPY, CHF, CAD, AUD, CNY un vēl 22 citas no visiem apdzīvotajiem kontinentiem.',
            '<b>Nav paredzēts tirdzniecībai:</b> ECB atsauces kursi ir plaši uzticams ikdienas etalons, taču reālie banku/brokeru kursi ietver starpību un var nedaudz atšķirties — izmantojiet to novērtējumiem, ne darījumu izpildei.',
        ],
        howto: [
            { question: 'Cik bieži tiek atjaunināti maiņas kursi?', answer: '<p>Eiropas Centrālā banka publicē atsauces kursus vienu reizi darba dienā; mūsu serveris atjaunina kešoto kopiju katru stundu.</p>' },
            { question: 'Vai varu konvertēt starp jebkurām divām no 30 valūtām?', answer: '<p>Jā — izvēlieties jebkuru valūtu kā "No" un jebkuru citu kā "Uz", ieskaitot kombinācijas, kas tieši neietver USD vai EUR.</p>' },
            { question: 'Kāpēc valūtu kursi mainās dienu no dienas?', answer: '<p>Valūtu vērtība mainās atkarībā no pieprasījuma un piedāvājuma globālajos valūtas tirgos, ko ietekmē procentu likmes, inflācija, tirdzniecības bilances un ekonomikas ziņas.</p>' },
        ],
        faq: [
            { question: 'No kurienes nāk šie maiņas kursi?', answer: '<p>Kursi tiek iegūti no Eiropas Centrālās bankas oficiālajiem ikdienas ārvalstu valūtas atsauces kursiem, izmantojot bezmaksas Frankfurter.app datu pakalpojumu, un tiek kešoti mūsu serverī vienu stundu pirms atjaunināšanas.</p>' },
            { question: 'Vai tas ir piemērots naudas sūtīšanai vai valūtas tirdzniecībai?', answer: '<p>Šis rīks ir paredzēts ātriem novērtējumiem un salīdzinājumiem. Bankas, naudas pārvedumu pakalpojumi un brokeri piemēro savu uzcenojumu virs atsauces kursa, tāpēc faktiski saņemtā summa parasti nedaudz atšķirsies.</p>' },
            { question: 'Kāpēc manas vietējās valūtas nav sarakstā?', answer: '<p>Šeit iekļautās 30 valūtas ir tās, kurām Eiropas Centrālā banka publicē ikdienas atsauces kursus. Valūtas ārpus šī kopuma šajā datu avotā nav iekļautas.</p>' },
        ],
    },
    pl: {
        slug: 'przelicznik-walut', title: 'Przelicznik Walut z Aktualnymi Kursami', h1: 'Przelicznik Walut',
        meta_title: 'Przelicznik Walut | Aktualne Kursy dla 30 Walut',
        meta_description: 'Przeliczaj waluty natychmiast, korzystając z dokładnych i aktualnych kursów wymiany. Porównuj wartości i obliczaj konwersje między światowymi walutami.',
        short_answer: 'Ten przelicznik zamienia kwotę między 30 głównymi światowymi walutami, korzystając z aktualnych kursów odświeżanych co godzinę.',
        intro_text: '<p>Wpisz kwotę i wybierz walutę, z której i na którą przeliczyć — kursy pochodzą z codziennych kursów referencyjnych Europejskiego Banku Centralnego i są odświeżane automatycznie.</p>',
        key_points: [
            '<b>Aktualne dane:</b> kursy wymiany pochodzą z oficjalnych codziennych kursów referencyjnych Europejskiego Banku Centralnego, odświeżanych na naszym serwerze co godzinę.',
            '<b>30 głównych walut:</b> obejmuje USD, EUR, GBP, JPY, CHF, CAD, AUD, CNY i 22 inne z każdego zamieszkałego kontynentu.',
            '<b>Nie do handlu:</b> kursy referencyjne EBC to szeroko zaufany dzienny punkt odniesienia, ale rzeczywiste kursy banków/brokerów zawierają spread i mogą się nieco różnić — używaj tego do szacunków, nie do realizacji transakcji.',
        ],
        howto: [
            { question: 'Jak często aktualizowane są kursy wymiany?', answer: '<p>Europejski Bank Centralny publikuje kursy referencyjne raz w dniu roboczym; nasz serwer odświeża zapisaną kopię co godzinę.</p>' },
            { question: 'Czy mogę przeliczać między dowolnymi dwiema z 30 walut?', answer: '<p>Tak — wybierz dowolną walutę jako "Z" i dowolną inną jako "Na", w tym kombinacje niezwiązane bezpośrednio z USD lub EUR.</p>' },
            { question: 'Dlaczego kursy walut zmieniają się z dnia na dzień?', answer: '<p>Wartości walut zmieniają się w zależności od popytu i podaży na globalnych rynkach walutowych, na co wpływają stopy procentowe, inflacja, bilanse handlowe i wiadomości gospodarcze.</p>' },
        ],
        faq: [
            { question: 'Skąd pochodzą te kursy wymiany?', answer: '<p>Kursy pochodzą z oficjalnych codziennych referencyjnych kursów walutowych Europejskiego Banku Centralnego, dostępnych za pośrednictwem bezpłatnej usługi danych Frankfurter.app, i są przechowywane w pamięci podręcznej naszego serwera przez godzinę przed odświeżeniem.</p>' },
            { question: 'Czy nadaje się to do przesyłania pieniędzy lub handlu walutami?', answer: '<p>To narzędzie jest przeznaczone do szybkich szacunków i porównań. Banki, usługi przekazów pieniężnych i brokerzy stosują własną marżę ponad kurs referencyjny, więc faktycznie otrzymana kwota zwykle będzie się nieco różnić.</p>' },
            { question: 'Dlaczego mojej lokalnej waluty nie ma na liście?', answer: '<p>30 walut uwzględnionych tutaj to te, dla których Europejski Bank Centralny publikuje codzienne kursy referencyjne. Waluty spoza tego zestawu nie są uwzględnione w tym konkretnym źródle danych.</p>' },
        ],
    },
    es: {
        slug: 'conversor-divisas', title: 'Conversor de Divisas con Tipos de Cambio en Vivo', h1: 'Conversor de Divisas',
        meta_title: 'Conversor de Divisas | Tipos de Cambio en Vivo para 30 Divisas',
        meta_description: 'Convierte divisas al instante usando tipos de cambio precisos y actualizados. Compara valores y calcula conversiones de dinero entre divisas mundiales.',
        short_answer: 'Este conversor cambia una cantidad entre 30 divisas mundiales principales usando tipos de cambio en vivo, actualizados cada hora.',
        intro_text: '<p>Introduce una cantidad y elige una divisa de origen y destino — los tipos provienen de los tipos de referencia diarios del Banco Central Europeo y se actualizan automáticamente.</p>',
        key_points: [
            '<b>Datos en vivo:</b> los tipos de cambio provienen de los tipos de referencia diarios oficiales del Banco Central Europeo, actualizados en nuestro servidor cada hora.',
            '<b>30 divisas principales:</b> cubre USD, EUR, GBP, JPY, CHF, CAD, AUD, CNY y otras 22 de todos los continentes habitados.',
            '<b>No apto para trading:</b> los tipos de referencia del BCE son un referente diario ampliamente confiable, pero los tipos reales de bancos/brokers incluyen un margen y pueden diferir ligeramente — úsalo para estimaciones, no para ejecutar operaciones.',
        ],
        howto: [
            { question: '¿Con qué frecuencia se actualizan los tipos de cambio?', answer: '<p>El Banco Central Europeo publica tipos de referencia una vez por día hábil; nuestro servidor actualiza su copia en caché cada hora.</p>' },
            { question: '¿Puedo convertir entre cualquiera de las 30 divisas?', answer: '<p>Sí — elige cualquier divisa como "De" y cualquier otra como "A", incluidas combinaciones que no involucren directamente USD o EUR.</p>' },
            { question: '¿Por qué cambian los tipos de cambio día a día?', answer: '<p>El valor de las divisas fluctúa según la oferta y demanda en los mercados de divisas globales, influido por tipos de interés, inflación, balanzas comerciales y noticias económicas.</p>' },
        ],
        faq: [
            { question: '¿De dónde provienen estos tipos de cambio?', answer: '<p>Los tipos provienen de los tipos de referencia diarios oficiales del Banco Central Europeo, obtenidos a través del servicio de datos gratuito Frankfurter.app, y se almacenan en caché en nuestro servidor durante una hora antes de actualizarse.</p>' },
            { question: '¿Es esto adecuado para enviar dinero o operar con divisas?', answer: '<p>Esta herramienta está diseñada para estimaciones y comparaciones rápidas. Los bancos, servicios de transferencia de dinero y brokers aplican su propio margen sobre el tipo de referencia, por lo que la cantidad realmente recibida suele ser ligeramente diferente.</p>' },
            { question: '¿Por qué no está mi divisa local en la lista?', answer: '<p>Las 30 divisas aquí incluidas son aquellas para las que el Banco Central Europeo publica tipos de referencia diarios. Las divisas fuera de ese conjunto no están incluidas en esta fuente de datos en particular.</p>' },
        ],
    },
    fr: {
        slug: 'convertisseur-devises', title: 'Convertisseur de Devises avec Taux de Change en Direct', h1: 'Convertisseur de Devises',
        meta_title: 'Convertisseur de Devises | Taux de Change en Direct pour 30 Devises',
        meta_description: 'Convertissez des devises instantanément grâce à des taux de change précis et à jour. Comparez les valeurs et calculez les conversions monétaires entre devises mondiales.',
        short_answer: 'Ce convertisseur change un montant entre 30 devises mondiales principales en utilisant des taux de change en direct, actualisés toutes les heures.',
        intro_text: '<p>Entrez un montant et choisissez une devise de départ et d’arrivée — les taux proviennent des taux de référence quotidiens de la Banque Centrale Européenne et sont actualisés automatiquement.</p>',
        key_points: [
            '<b>Données en direct :</b> les taux de change proviennent des taux de référence quotidiens officiels de la Banque Centrale Européenne, actualisés sur notre serveur toutes les heures.',
            '<b>30 devises principales :</b> couvre l’USD, l’EUR, la GBP, le JPY, le CHF, le CAD, l’AUD, le CNY et 22 autres réparties sur tous les continents habités.',
            '<b>Pas pour le trading :</b> les taux de référence de la BCE sont une référence quotidienne largement fiable, mais les taux réels des banques/courtiers incluent une marge et peuvent différer légèrement — utilisez ceci pour des estimations, pas pour exécuter des transactions.',
        ],
        howto: [
            { question: 'À quelle fréquence les taux de change sont-ils mis à jour ?', answer: '<p>La Banque Centrale Européenne publie des taux de référence une fois par jour ouvré ; notre serveur actualise sa copie en cache toutes les heures.</p>' },
            { question: 'Puis-je convertir entre deux des 30 devises ?', answer: '<p>Oui — choisissez n’importe quelle devise comme "De" et une autre comme "Vers", y compris des combinaisons n’impliquant pas directement l’USD ou l’EUR.</p>' },
            { question: 'Pourquoi les taux de change changent-ils chaque jour ?', answer: '<p>La valeur des devises fluctue selon l’offre et la demande sur les marchés des changes mondiaux, influencée par les taux d’intérêt, l’inflation, les balances commerciales et l’actualité économique.</p>' },
        ],
        faq: [
            { question: 'D’où proviennent ces taux de change ?', answer: '<p>Les taux proviennent des taux de référence quotidiens officiels de change de la Banque Centrale Européenne, accessibles via le service de données gratuit Frankfurter.app, et mis en cache sur notre serveur pendant une heure avant actualisation.</p>' },
            { question: 'Cela convient-il pour envoyer de l’argent ou trader des devises ?', answer: '<p>Cet outil est conçu pour des estimations et comparaisons rapides. Les banques, services de transfert d’argent et courtiers appliquent leur propre marge par-dessus le taux de référence, donc le montant réellement reçu sera généralement légèrement différent.</p>' },
            { question: 'Pourquoi ma devise locale ne figure-t-elle pas dans la liste ?', answer: '<p>Les 30 devises couvertes ici sont celles pour lesquelles la Banque Centrale Européenne publie des taux de référence quotidiens. Les devises en dehors de cet ensemble ne sont pas incluses dans cette source de données particulière.</p>' },
        ],
    },
    it: {
        slug: 'convertitore-valuta', title: 'Convertitore di Valuta con Tassi di Cambio in Tempo Reale', h1: 'Convertitore di Valuta',
        meta_title: 'Convertitore di Valuta | Tassi di Cambio in Tempo Reale per 30 Valute',
        meta_description: 'Converti valute istantaneamente usando tassi di cambio accurati e aggiornati. Confronta valori e calcola conversioni monetarie tra valute globali.',
        short_answer: 'Questo convertitore cambia un importo tra 30 principali valute mondiali usando tassi di cambio in tempo reale, aggiornati ogni ora.',
        intro_text: '<p>Inserisci un importo e scegli una valuta di partenza e di destinazione — i tassi provengono dai tassi di riferimento giornalieri della Banca Centrale Europea e vengono aggiornati automaticamente.</p>',
        key_points: [
            '<b>Dati in tempo reale:</b> i tassi di cambio provengono dai tassi di riferimento giornalieri ufficiali della Banca Centrale Europea, aggiornati sul nostro server ogni ora.',
            '<b>30 valute principali:</b> copre USD, EUR, GBP, JPY, CHF, CAD, AUD, CNY e altre 22 da ogni continente abitato.',
            '<b>Non per il trading:</b> i tassi di riferimento BCE sono un punto di riferimento giornaliero ampiamente affidabile, ma i tassi reali di banche/broker includono uno spread e possono differire leggermente — usalo per stime, non per eseguire operazioni.',
        ],
        howto: [
            { question: 'Con quale frequenza vengono aggiornati i tassi di cambio?', answer: '<p>La Banca Centrale Europea pubblica i tassi di riferimento una volta al giorno lavorativo; il nostro server aggiorna la copia in cache ogni ora.</p>' },
            { question: 'Posso convertire tra due qualsiasi delle 30 valute?', answer: '<p>Sì — scegli qualsiasi valuta come "Da" e un\'altra come "A", incluse combinazioni che non coinvolgono direttamente USD o EUR.</p>' },
            { question: 'Perché i tassi di cambio cambiano di giorno in giorno?', answer: '<p>Il valore delle valute fluttua in base a domanda e offerta nei mercati valutari globali, influenzato da tassi di interesse, inflazione, bilance commerciali e notizie economiche.</p>' },
        ],
        faq: [
            { question: 'Da dove provengono questi tassi di cambio?', answer: '<p>I tassi provengono dai tassi di riferimento giornalieri ufficiali della Banca Centrale Europea, accessibili tramite il servizio dati gratuito Frankfurter.app, e memorizzati nella cache del nostro server per un\'ora prima dell\'aggiornamento.</p>' },
            { question: 'È adatto per inviare denaro o fare trading di valute?', answer: '<p>Questo strumento è pensato per stime e confronti rapidi. Banche, servizi di trasferimento denaro e broker applicano il proprio margine sopra il tasso di riferimento, quindi l\'importo effettivamente ricevuto sarà solitamente leggermente diverso.</p>' },
            { question: 'Perché la mia valuta locale non è nell\'elenco?', answer: '<p>Le 30 valute qui incluse sono quelle per cui la Banca Centrale Europea pubblica tassi di riferimento giornalieri. Le valute al di fuori di questo insieme non sono incluse in questa particolare fonte di dati.</p>' },
        ],
    },
    de: {
        slug: 'waehrungsrechner', title: 'Währungsrechner mit Live-Wechselkursen', h1: 'Währungsrechner',
        meta_title: 'Währungsrechner | Live-Wechselkurse für 30 Währungen',
        meta_description: 'Rechnen Sie Währungen sofort mit genauen, aktuellen Wechselkursen um. Vergleichen Sie Werte und berechnen Sie Geldumrechnungen zwischen Weltwährungen.',
        short_answer: 'Dieser Umrechner wandelt einen Betrag zwischen 30 wichtigen Weltwährungen um, mit Live-Wechselkursen, die stündlich aktualisiert werden.',
        intro_text: '<p>Geben Sie einen Betrag ein und wählen Sie eine Ausgangs- und Zielwährung — die Kurse stammen aus den täglichen Referenzkursen der Europäischen Zentralbank und werden automatisch aktualisiert.</p>',
        key_points: [
            '<b>Live-Daten:</b> Wechselkurse stammen aus den offiziellen täglichen Referenzkursen der Europäischen Zentralbank, die auf unserem Server stündlich aktualisiert werden.',
            '<b>30 wichtige Währungen:</b> deckt USD, EUR, GBP, JPY, CHF, CAD, AUD, CNY und 22 weitere von jedem bewohnten Kontinent ab.',
            '<b>Nicht für den Handel:</b> EZB-Referenzkurse sind ein weithin vertrauenswürdiger täglicher Richtwert, aber tatsächliche Bank-/Broker-Wechselkurse enthalten eine Spanne und können leicht abweichen — nutzen Sie dies für Schätzungen, nicht zur Ausführung von Geschäften.',
        ],
        howto: [
            { question: 'Wie oft werden die Wechselkurse aktualisiert?', answer: '<p>Die Europäische Zentralbank veröffentlicht einmal pro Werktag Referenzkurse; unser Server aktualisiert seine zwischengespeicherte Kopie stündlich.</p>' },
            { question: 'Kann ich zwischen beliebigen zwei der 30 Währungen umrechnen?', answer: '<p>Ja — wählen Sie jede Währung als "Von" und eine andere als "Nach", auch Kombinationen ohne direkten USD- oder EUR-Bezug.</p>' },
            { question: 'Warum ändern sich Wechselkurse von Tag zu Tag?', answer: '<p>Währungswerte schwanken basierend auf Angebot und Nachfrage an den globalen Devisenmärkten, beeinflusst durch Zinssätze, Inflation, Handelsbilanzen und Wirtschaftsnachrichten.</p>' },
        ],
        faq: [
            { question: 'Woher stammen diese Wechselkurse?', answer: '<p>Die Kurse stammen aus den offiziellen täglichen Devisenreferenzkursen der Europäischen Zentralbank, abgerufen über den kostenlosen Datendienst Frankfurter.app, und werden eine Stunde lang auf unserem Server zwischengespeichert, bevor sie aktualisiert werden.</p>' },
            { question: 'Ist dies für Geldüberweisungen oder Devisenhandel geeignet?', answer: '<p>Dieses Tool ist für schnelle Schätzungen und Vergleiche gedacht. Banken, Geldtransferdienste und Broker berechnen ihre eigene Marge zusätzlich zum Referenzkurs, sodass der tatsächlich erhaltene Betrag meist etwas abweicht.</p>' },
            { question: 'Warum ist meine lokale Währung nicht in der Liste?', answer: '<p>Die hier abgedeckten 30 Währungen sind diejenigen, für die die Europäische Zentralbank tägliche Referenzkurse veröffentlicht. Währungen außerhalb dieser Gruppe sind in dieser speziellen Datenquelle nicht enthalten.</p>' },
        ],
    },
}

async function main() {
    console.log(`\n🚀 Seeding tool "${TOOL_ID}" (${Object.keys(LOCALES).length} locales)`)

    await prisma.tool.upsert({
        where: { id: TOOL_ID },
        update: { type: 'calculator', engine: 'json', status: 'published' },
        create: { id: TOOL_ID, type: 'calculator', engine: 'json', status: 'published' },
    })

    await prisma.toolConfig.upsert({
        where: { tool_id: TOOL_ID },
        update: { config_json: { inputs: [], functions: {}, outputs: [] } },
        create: { tool_id: TOOL_ID, config_json: { inputs: [], functions: {}, outputs: [] } },
    })

    for (const [lang, content] of Object.entries(LOCALES)) {
        await prisma.toolI18n.upsert({
            where: { lang_slug: { lang, slug: content.slug } },
            update: {
                tool_id: TOOL_ID,
                title: content.title,
                h1: content.h1,
                meta_title: content.meta_title,
                meta_description: content.meta_description,
                meta_robots: 'index,follow',
                short_answer: content.short_answer,
                intro_text: content.intro_text,
                // @ts-ignore - Prisma JSON field typing
                key_points_json: content.key_points,
                // @ts-ignore
                howto_json: content.howto,
                // @ts-ignore
                inputs_json: [],
                // @ts-ignore
                outputs_json: [],
                // @ts-ignore
                faq_json: content.faq,
            },
            create: {
                tool_id: TOOL_ID,
                lang,
                slug: content.slug,
                title: content.title,
                h1: content.h1,
                meta_title: content.meta_title,
                meta_description: content.meta_description,
                meta_robots: 'index,follow',
                short_answer: content.short_answer,
                intro_text: content.intro_text,
                // @ts-ignore
                key_points_json: content.key_points,
                // @ts-ignore
                howto_json: content.howto,
                // @ts-ignore
                inputs_json: [],
                // @ts-ignore
                outputs_json: [],
                // @ts-ignore
                faq_json: content.faq,
            },
        })
    }

    const existingLink = await prisma.toolCategory.findUnique({
        where: { tool_id_category_id: { tool_id: TOOL_ID, category_id: CURRENCY_CATEGORY_ID } },
    })
    if (!existingLink) {
        await prisma.toolCategory.create({
            data: { tool_id: TOOL_ID, category_id: CURRENCY_CATEGORY_ID },
        })
    }

    console.log(`\n✅ Seeded Currency Converter (tool ${TOOL_ID}) into category ${CURRENCY_CATEGORY_ID}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
