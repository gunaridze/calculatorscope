// One-off script: seeds Page + PageI18n rows for privacy/terms/cookies (8 locales).
// Run with: npx tsx scripts/seed-legal-pages.ts
//
// IMPORTANT: this is a functional DRAFT, not legally reviewed text. Bracketed
// placeholders like [Company Legal Name, Address, Jurisdiction] must be filled
// in, and the content should be reviewed by a qualified professional before
// being relied on for real compliance (agreed with the site owner up front).
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type Section = { heading: string; html: string }
type LocaleContent = {
    meta_title: string
    meta_description: string
    h1: string
    sections: Section[]
}
type PageDef = {
    code: 'privacy' | 'terms' | 'cookies'
    slug: string
    locales: Record<string, LocaleContent>
}

const privacy: PageDef = {
    code: 'privacy',
    slug: 'privacy',
    locales: {
        en: {
            meta_title: 'Privacy Policy | CalculatorScope',
            meta_description: 'Learn what data CalculatorScope collects, how we use cookies and analytics, and what rights you have under GDPR.',
            h1: 'Privacy Policy',
            sections: [
                { heading: 'Introduction & Data We Collect', html: '<p>CalculatorScope ("we", "us", "our") operates calculatorscope.com and its calculator tools and embeddable widgets. This is a draft policy pending review by a qualified professional; the legal entity operating this site is [Company Legal Name, Address, Jurisdiction — to be completed]. We collect: usage data (pages visited, device and browser type, approximate location) gathered automatically through analytics tools; information you submit voluntarily, such as your name, email address, and message via our <a href="/en/contact">contact form</a>; and cookies, described in detail in our <a href="/en/cookies">Cookie Policy</a>.</p>' },
                { heading: 'How We Use Your Data', html: '<p>We use the data described above to operate and improve the site, understand how our tools are used, respond to your messages, and — once enabled — to serve advertising through Google AdSense. We do not sell your personal data. Where our tools are embedded on third-party websites, only aggregate, non-identifying usage data is shared with the embedding site.</p>' },
                { heading: 'Your Rights Under GDPR', html: '<p>If you are located in the European Economic Area, you have the right to access, correct, delete, or export your personal data, and to object to or restrict certain processing, including for analytics or advertising. To exercise these rights, contact us via our <a href="/en/contact">contact form</a>. You also have the right to lodge a complaint with your local data protection authority.</p>' },
                { heading: 'Third Parties & Contact', html: '<p>We use Google Tag Manager and Google Analytics for site analytics, and — once approved — Google AdSense for advertising; both may set their own cookies as described in our <a href="/en/cookies">Cookie Policy</a>. For any privacy-related question, please reach out via our <a href="/en/contact">contact page</a>. This policy may be updated from time to time; material changes will be reflected on this page.</p>' },
            ],
        },
        ru: {
            meta_title: 'Политика конфиденциальности | CalculatorScope',
            meta_description: 'Какие данные собирает CalculatorScope, как мы используем cookie и аналитику, и какие права у вас есть по GDPR.',
            h1: 'Политика конфиденциальности',
            sections: [
                { heading: 'Введение и какие данные мы собираем', html: '<p>CalculatorScope («мы», «нас», «наш») управляет сайтом calculatorscope.com и его калькуляторами и встраиваемыми виджетами. Это черновая версия политики, ожидающая проверки квалифицированным юристом; юридическое лицо, управляющее сайтом — [Название компании, адрес, юрисдикция — заполнить]. Мы собираем: данные об использовании (посещённые страницы, тип устройства и браузера, примерное местоположение), автоматически получаемые через аналитические инструменты; данные, которые вы предоставляете добровольно — имя, email и сообщение через нашу <a href="/ru/contact">форму обратной связи</a>; и cookie, подробно описанные в нашей <a href="/ru/cookies">Политике cookie</a>.</p>' },
                { heading: 'Как мы используем ваши данные', html: '<p>Мы используем указанные данные для работы и улучшения сайта, понимания того, как используются наши инструменты, ответа на ваши сообщения и — после подключения — показа рекламы через Google AdSense. Мы не продаём ваши персональные данные. Если наши инструменты встроены на сторонних сайтах, туда передаются только агрегированные, неидентифицирующие данные об использовании.</p>' },
                { heading: 'Ваши права по GDPR', html: '<p>Если вы находитесь в Европейской экономической зоне, у вас есть право на доступ, исправление, удаление или экспорт ваших персональных данных, а также право возражать против определённой обработки или ограничивать её, включая аналитику и рекламу. Чтобы воспользоваться этими правами, свяжитесь с нами через <a href="/ru/contact">форму обратной связи</a>. Вы также вправе подать жалобу в местный орган по защите данных.</p>' },
                { heading: 'Третьи стороны и контакты', html: '<p>Мы используем Google Tag Manager и Google Analytics для аналитики сайта, а после одобрения — Google AdSense для показа рекламы; оба сервиса могут устанавливать собственные cookie, как описано в нашей <a href="/ru/cookies">Политике cookie</a>. По любым вопросам о конфиденциальности обращайтесь через <a href="/ru/contact">страницу контактов</a>. Эта политика может обновляться; существенные изменения будут отражены на этой странице.</p>' },
            ],
        },
        lv: {
            meta_title: 'Privātuma politika | CalculatorScope',
            meta_description: 'Kādus datus vāc CalculatorScope, kā mēs izmantojam sīkfailus un analītiku, un kādas tiesības jums ir saskaņā ar VDAR.',
            h1: 'Privātuma politika',
            sections: [
                { heading: 'Ievads un mūsu vāktie dati', html: '<p>CalculatorScope ("mēs", "mūsu") pārvalda vietni calculatorscope.com un tās kalkulatorus un iegulstamos logrīkus. Šis ir politikas melnraksts, kas gaida kvalificēta jurista pārbaudi; vietni pārvalda [Uzņēmuma nosaukums, adrese, jurisdikcija — jāaizpilda]. Mēs vācam: lietošanas datus (apmeklētās lapas, ierīces un pārlūka veidu, aptuveno atrašanās vietu), kas iegūti automātiski ar analītikas rīkiem; datus, ko sniedzat brīvprātīgi — vārdu, e-pastu un ziņu mūsu <a href="/lv/contact">kontaktformā</a>; un sīkfailus, kas sīkāk aprakstīti mūsu <a href="/lv/cookies">Sīkfailu politikā</a>.</p>' },
                { heading: 'Kā mēs izmantojam jūsu datus', html: '<p>Mēs izmantojam iepriekš minētos datus, lai uzturētu un uzlabotu vietni, saprastu, kā tiek izmantoti mūsu rīki, atbildētu uz jūsu ziņām un — pēc aktivizēšanas — rādītu reklāmas ar Google AdSense starpniecību. Mēs nepārdodam jūsu personas datus. Ja mūsu rīki ir iegulti trešo pušu vietnēs, tām tiek nodoti tikai apkopoti, neidentificējoši lietošanas dati.</p>' },
                { heading: 'Jūsu tiesības saskaņā ar VDAR', html: '<p>Ja atrodaties Eiropas Ekonomikas zonā, jums ir tiesības piekļūt, labot, dzēst vai eksportēt savus personas datus, kā arī iebilst pret noteiktu apstrādi vai to ierobežot, tostarp analītiku un reklāmu. Lai izmantotu šīs tiesības, sazinieties ar mums, izmantojot <a href="/lv/contact">kontaktformu</a>. Jums ir arī tiesības iesniegt sūdzību savai vietējai datu aizsardzības iestādei.</p>' },
                { heading: 'Trešās puses un kontakti', html: '<p>Vietnes analītikai izmantojam Google Tag Manager un Google Analytics, bet pēc apstiprināšanas — Google AdSense reklāmu rādīšanai; abi var uzstādīt savus sīkfailus, kā aprakstīts mūsu <a href="/lv/cookies">Sīkfailu politikā</a>. Ar jebkuru privātuma jautājumu vērsieties mūsu <a href="/lv/contact">kontaktu lapā</a>. Šī politika var tikt atjaunināta; būtiskas izmaiņas tiks atspoguļotas šajā lapā.</p>' },
            ],
        },
        pl: {
            meta_title: 'Polityka prywatności | CalculatorScope',
            meta_description: 'Jakie dane zbiera CalculatorScope, jak używamy plików cookie i analityki oraz jakie prawa przysługują Ci na mocy RODO.',
            h1: 'Polityka prywatności',
            sections: [
                { heading: 'Wprowadzenie i zbierane przez nas dane', html: '<p>CalculatorScope ("my", "nas", "nasz") prowadzi stronę calculatorscope.com wraz z kalkulatorami i osadzanymi widżetami. To wersja robocza polityki, oczekująca na weryfikację przez wykwalifikowanego prawnika; podmiotem prowadzącym stronę jest [Nazwa firmy, adres, jurysdykcja — do uzupełnienia]. Zbieramy: dane o użytkowaniu (odwiedzane strony, typ urządzenia i przeglądarki, przybliżona lokalizacja) gromadzone automatycznie przez narzędzia analityczne; dane podane dobrowolnie — imię, e-mail i wiadomość w naszym <a href="/pl/contact">formularzu kontaktowym</a>; oraz pliki cookie, opisane szczegółowo w naszej <a href="/pl/cookies">Polityce cookie</a>.</p>' },
                { heading: 'Jak wykorzystujemy Twoje dane', html: '<p>Wykorzystujemy powyższe dane do prowadzenia i ulepszania strony, rozumienia sposobu korzystania z naszych narzędzi, odpowiadania na wiadomości oraz — po uruchomieniu — wyświetlania reklam przez Google AdSense. Nie sprzedajemy Twoich danych osobowych. Jeśli nasze narzędzia są osadzone na stronach trzecich, przekazywane są im wyłącznie zagregowane, nieidentyfikujące dane o użytkowaniu.</p>' },
                { heading: 'Twoje prawa na mocy RODO', html: '<p>Jeśli znajdujesz się w Europejskim Obszarze Gospodarczym, masz prawo do dostępu, poprawiania, usunięcia lub eksportu swoich danych osobowych, a także do sprzeciwu wobec niektórych przetwarzań lub ich ograniczenia, w tym analityki i reklam. Aby skorzystać z tych praw, skontaktuj się z nami przez <a href="/pl/contact">formularz kontaktowy</a>. Masz również prawo złożyć skargę do lokalnego organu ochrony danych.</p>' },
                { heading: 'Strony trzecie i kontakt', html: '<p>Do analityki strony wykorzystujemy Google Tag Manager i Google Analytics, a po zatwierdzeniu — Google AdSense do wyświetlania reklam; oba mogą ustawiać własne pliki cookie, opisane w naszej <a href="/pl/cookies">Polityce cookie</a>. W sprawach dotyczących prywatności skontaktuj się przez naszą <a href="/pl/contact">stronę kontaktową</a>. Ta polityka może być aktualizowana; istotne zmiany zostaną odzwierciedlone na tej stronie.</p>' },
            ],
        },
        es: {
            meta_title: 'Política de privacidad | CalculatorScope',
            meta_description: 'Qué datos recopila CalculatorScope, cómo usamos cookies y análisis, y qué derechos tiene bajo el RGPD.',
            h1: 'Política de privacidad',
            sections: [
                { heading: 'Introducción y datos que recopilamos', html: '<p>CalculatorScope ("nosotros", "nuestro") opera calculatorscope.com y sus calculadoras y widgets integrables. Esta es una versión preliminar de la política, pendiente de revisión por un profesional cualificado; la entidad legal que opera este sitio es [Nombre de la empresa, dirección, jurisdicción — por completar]. Recopilamos: datos de uso (páginas visitadas, tipo de dispositivo y navegador, ubicación aproximada) obtenidos automáticamente mediante herramientas de análisis; información que usted proporciona voluntariamente, como su nombre, correo electrónico y mensaje a través de nuestro <a href="/es/contact">formulario de contacto</a>; y cookies, descritas en detalle en nuestra <a href="/es/cookies">Política de cookies</a>.</p>' },
                { heading: 'Cómo utilizamos sus datos', html: '<p>Utilizamos los datos anteriores para operar y mejorar el sitio, entender cómo se usan nuestras herramientas, responder a sus mensajes y —una vez activado— mostrar publicidad mediante Google AdSense. No vendemos sus datos personales. Cuando nuestras herramientas se integran en sitios de terceros, solo se comparten datos de uso agregados y no identificables.</p>' },
                { heading: 'Sus derechos bajo el RGPD', html: '<p>Si se encuentra en el Espacio Económico Europeo, tiene derecho a acceder, corregir, eliminar o exportar sus datos personales, y a oponerse o restringir ciertos tratamientos, incluidos el análisis y la publicidad. Para ejercer estos derechos, contáctenos a través de nuestro <a href="/es/contact">formulario de contacto</a>. También tiene derecho a presentar una reclamación ante su autoridad local de protección de datos.</p>' },
                { heading: 'Terceros y contacto', html: '<p>Utilizamos Google Tag Manager y Google Analytics para el análisis del sitio, y —una vez aprobado— Google AdSense para publicidad; ambos pueden instalar sus propias cookies, según se describe en nuestra <a href="/es/cookies">Política de cookies</a>. Para cualquier consulta sobre privacidad, contáctenos a través de nuestra <a href="/es/contact">página de contacto</a>. Esta política puede actualizarse ocasionalmente; los cambios importantes se reflejarán en esta página.</p>' },
            ],
        },
        fr: {
            meta_title: 'Politique de confidentialité | CalculatorScope',
            meta_description: 'Quelles données CalculatorScope collecte, comment nous utilisons les cookies et l’analyse, et quels sont vos droits selon le RGPD.',
            h1: 'Politique de confidentialité',
            sections: [
                { heading: 'Introduction et données que nous collectons', html: '<p>CalculatorScope ("nous", "notre") exploite calculatorscope.com ainsi que ses calculateurs et widgets intégrables. Ceci est une version provisoire de la politique, en attente de révision par un professionnel qualifié ; l’entité juridique exploitant ce site est [Nom de l’entreprise, adresse, juridiction — à compléter]. Nous collectons : des données d’utilisation (pages visitées, type d’appareil et de navigateur, localisation approximative) obtenues automatiquement via des outils d’analyse ; des informations que vous fournissez volontairement, telles que votre nom, e-mail et message via notre <a href="/fr/contact">formulaire de contact</a> ; et des cookies, décrits en détail dans notre <a href="/fr/cookies">Politique de cookies</a>.</p>' },
                { heading: 'Comment nous utilisons vos données', html: '<p>Nous utilisons ces données pour exploiter et améliorer le site, comprendre l’usage de nos outils, répondre à vos messages et — une fois activé — diffuser des publicités via Google AdSense. Nous ne vendons pas vos données personnelles. Lorsque nos outils sont intégrés sur des sites tiers, seules des données d’utilisation agrégées et non identifiantes sont partagées.</p>' },
                { heading: 'Vos droits selon le RGPD', html: '<p>Si vous résidez dans l’Espace économique européen, vous avez le droit d’accéder à vos données personnelles, de les corriger, de les supprimer ou de les exporter, ainsi que de vous opposer à certains traitements ou de les restreindre, y compris l’analyse et la publicité. Pour exercer ces droits, contactez-nous via notre <a href="/fr/contact">formulaire de contact</a>. Vous avez également le droit de déposer une plainte auprès de votre autorité locale de protection des données.</p>' },
                { heading: 'Tiers et contact', html: '<p>Nous utilisons Google Tag Manager et Google Analytics pour l’analyse du site, et — une fois approuvé — Google AdSense pour la publicité ; tous deux peuvent déposer leurs propres cookies, comme décrit dans notre <a href="/fr/cookies">Politique de cookies</a>. Pour toute question relative à la confidentialité, contactez-nous via notre <a href="/fr/contact">page de contact</a>. Cette politique peut être mise à jour occasionnellement ; les changements importants seront reflétés sur cette page.</p>' },
            ],
        },
        it: {
            meta_title: 'Informativa sulla privacy | CalculatorScope',
            meta_description: 'Quali dati raccoglie CalculatorScope, come utilizziamo cookie e analisi, e quali diritti hai secondo il GDPR.',
            h1: 'Informativa sulla privacy',
            sections: [
                { heading: 'Introduzione e dati che raccogliamo', html: '<p>CalculatorScope ("noi", "nostro") gestisce calculatorscope.com e i suoi calcolatori e widget incorporabili. Questa è una bozza della policy, in attesa di revisione da parte di un professionista qualificato; l’entità giuridica che gestisce il sito è [Nome azienda, indirizzo, giurisdizione — da completare]. Raccogliamo: dati di utilizzo (pagine visitate, tipo di dispositivo e browser, posizione approssimativa) ottenuti automaticamente tramite strumenti di analisi; informazioni fornite volontariamente, come nome, email e messaggio tramite il nostro <a href="/it/contact">modulo di contatto</a>; e cookie, descritti in dettaglio nella nostra <a href="/it/cookies">Cookie Policy</a>.</p>' },
                { heading: 'Come utilizziamo i tuoi dati', html: '<p>Utilizziamo questi dati per gestire e migliorare il sito, capire come vengono utilizzati i nostri strumenti, rispondere ai tuoi messaggi e — una volta attivato — mostrare pubblicità tramite Google AdSense. Non vendiamo i tuoi dati personali. Quando i nostri strumenti sono incorporati in siti di terze parti, vengono condivisi solo dati di utilizzo aggregati e non identificativi.</p>' },
                { heading: 'I tuoi diritti secondo il GDPR', html: '<p>Se ti trovi nello Spazio Economico Europeo, hai il diritto di accedere, correggere, cancellare o esportare i tuoi dati personali, e di opporti o limitare determinati trattamenti, inclusi analisi e pubblicità. Per esercitare questi diritti, contattaci tramite il nostro <a href="/it/contact">modulo di contatto</a>. Hai anche il diritto di presentare un reclamo alla tua autorità locale per la protezione dei dati.</p>' },
                { heading: 'Terze parti e contatti', html: '<p>Utilizziamo Google Tag Manager e Google Analytics per l’analisi del sito e, una volta approvato, Google AdSense per la pubblicità; entrambi possono impostare propri cookie, come descritto nella nostra <a href="/it/cookies">Cookie Policy</a>. Per qualsiasi domanda sulla privacy, contattaci tramite la nostra <a href="/it/contact">pagina di contatto</a>. Questa policy potrà essere aggiornata periodicamente; le modifiche rilevanti saranno riportate in questa pagina.</p>' },
            ],
        },
        de: {
            meta_title: 'Datenschutzerklärung | CalculatorScope',
            meta_description: 'Welche Daten CalculatorScope erhebt, wie wir Cookies und Analysen verwenden und welche Rechte Sie gemäß DSGVO haben.',
            h1: 'Datenschutzerklärung',
            sections: [
                { heading: 'Einleitung und von uns erhobene Daten', html: '<p>CalculatorScope ("wir", "uns", "unser") betreibt calculatorscope.com sowie die zugehörigen Rechner und einbettbaren Widgets. Dies ist ein Entwurf der Richtlinie, der noch von einer qualifizierten Fachperson geprüft werden muss; die für diese Website verantwortliche juristische Einheit ist [Firmenname, Adresse, Gerichtsstand — noch zu ergänzen]. Wir erheben: Nutzungsdaten (besuchte Seiten, Geräte- und Browsertyp, ungefährer Standort), die automatisch über Analysetools erfasst werden; Daten, die Sie freiwillig angeben, etwa Name, E-Mail und Nachricht über unser <a href="/de/contact">Kontaktformular</a>; sowie Cookies, die ausführlich in unserer <a href="/de/cookies">Cookie-Richtlinie</a> beschrieben sind.</p>' },
                { heading: 'Wie wir Ihre Daten verwenden', html: '<p>Wir verwenden die genannten Daten, um die Website zu betreiben und zu verbessern, zu verstehen, wie unsere Tools genutzt werden, auf Ihre Nachrichten zu antworten und — sobald aktiviert — Werbung über Google AdSense auszuliefern. Wir verkaufen Ihre personenbezogenen Daten nicht. Wenn unsere Tools auf Websites Dritter eingebettet sind, werden dorthin nur aggregierte, nicht identifizierende Nutzungsdaten weitergegeben.</p>' },
                { heading: 'Ihre Rechte gemäß DSGVO', html: '<p>Wenn Sie sich im Europäischen Wirtschaftsraum befinden, haben Sie das Recht auf Auskunft, Berichtigung, Löschung oder Export Ihrer personenbezogenen Daten sowie das Recht, bestimmten Verarbeitungen — einschließlich Analyse und Werbung — zu widersprechen oder deren Einschränkung zu verlangen. Um diese Rechte auszuüben, kontaktieren Sie uns über unser <a href="/de/contact">Kontaktformular</a>. Sie haben zudem das Recht, sich bei Ihrer örtlichen Datenschutzbehörde zu beschweren.</p>' },
                { heading: 'Dritte und Kontakt', html: '<p>Wir verwenden Google Tag Manager und Google Analytics zur Website-Analyse und — nach Freigabe — Google AdSense für Werbung; beide können eigene Cookies setzen, wie in unserer <a href="/de/cookies">Cookie-Richtlinie</a> beschrieben. Bei Fragen zum Datenschutz kontaktieren Sie uns über unsere <a href="/de/contact">Kontaktseite</a>. Diese Richtlinie kann gelegentlich aktualisiert werden; wesentliche Änderungen werden auf dieser Seite angezeigt.</p>' },
            ],
        },
    },
}

const terms: PageDef = {
    code: 'terms',
    slug: 'terms',
    locales: {
        en: {
            meta_title: 'Terms of Service | CalculatorScope',
            meta_description: 'The terms that govern your use of CalculatorScope’s calculators, converters, and embeddable widgets.',
            h1: 'Terms of Service',
            sections: [
                { heading: 'Acceptance & Description of Service', html: '<p>By using calculatorscope.com ("the Service"), you agree to these Terms of Service. CalculatorScope provides free online calculators, converters, and text tools, along with embeddable widget versions for third-party websites. This is a draft agreement pending review by a qualified professional; the legal entity operating the Service is [Company Legal Name, Address, Jurisdiction — to be completed].</p>' },
                { heading: 'No Professional Advice', html: '<p>All results produced by our tools (financial, health, mathematical, or otherwise) are estimates for informational purposes only and do not constitute financial, medical, legal, or other professional advice. You should not rely on them as a substitute for advice from a qualified professional, and we are not liable for decisions made based on our tools’ output.</p>' },
                { heading: 'Intellectual Property & Embeds', html: '<p>The Service, its design, and underlying code are the property of CalculatorScope. Embeddable widgets may be used on third-party websites free of charge provided the mandatory brand-only backlink to CalculatorScope is preserved and not removed or obscured; white-label embeds without a backlink require a separate paid arrangement, agreed in writing.</p>' },
                { heading: 'Liability, Changes & Governing Law', html: '<p>The Service is provided "as is" without warranties of any kind. To the maximum extent permitted by law, CalculatorScope is not liable for any indirect, incidental, or consequential damages arising from use of the Service. We may update these Terms at any time; continued use after changes constitutes acceptance. These Terms are governed by the laws of [Jurisdiction — to be completed]. Questions can be directed to our <a href="/en/contact">contact page</a>.</p>' },
            ],
        },
        ru: {
            meta_title: 'Условия использования | CalculatorScope',
            meta_description: 'Условия, регулирующие использование калькуляторов, конвертеров и встраиваемых виджетов CalculatorScope.',
            h1: 'Условия использования',
            sections: [
                { heading: 'Принятие условий и описание сервиса', html: '<p>Используя calculatorscope.com («Сервис»), вы соглашаетесь с настоящими Условиями использования. CalculatorScope предоставляет бесплатные онлайн-калькуляторы, конвертеры и текстовые инструменты, а также встраиваемые версии виджетов для сторонних сайтов. Это черновая версия соглашения, ожидающая проверки квалифицированным юристом; юридическое лицо, управляющее Сервисом — [Название компании, адрес, юрисдикция — заполнить].</p>' },
                { heading: 'Не является профессиональной консультацией', html: '<p>Все результаты, полученные с помощью наших инструментов (финансовые, медицинские, математические и иные), являются приблизительными и предназначены только для информационных целей; они не являются финансовой, медицинской, юридической или иной профессиональной консультацией. Не следует полагаться на них вместо консультации квалифицированного специалиста; мы не несём ответственности за решения, принятые на основе результатов наших инструментов.</p>' },
                { heading: 'Интеллектуальная собственность и встраивание', html: '<p>Сервис, его дизайн и лежащий в основе код являются собственностью CalculatorScope. Встраиваемые виджеты можно бесплатно использовать на сторонних сайтах при условии сохранения обязательной ссылки на бренд CalculatorScope без её удаления или скрытия; white-label встраивание без ссылки требует отдельного платного соглашения в письменной форме.</p>' },
                { heading: 'Ответственность, изменения и применимое право', html: '<p>Сервис предоставляется «как есть», без каких-либо гарантий. В максимально допустимой законом степени CalculatorScope не несёт ответственности за любые косвенные, случайные или сопутствующие убытки, возникшие в связи с использованием Сервиса. Мы можем обновлять настоящие Условия в любое время; продолжение использования после изменений означает их принятие. Настоящие Условия регулируются законодательством [юрисдикция — заполнить]. Вопросы можно направлять через нашу <a href="/ru/contact">страницу контактов</a>.</p>' },
            ],
        },
        lv: {
            meta_title: 'Lietošanas noteikumi | CalculatorScope',
            meta_description: 'Noteikumi, kas regulē CalculatorScope kalkulatoru, konvertoru un iegulstamo logrīku lietošanu.',
            h1: 'Lietošanas noteikumi',
            sections: [
                { heading: 'Piekrišana un pakalpojuma apraksts', html: '<p>Izmantojot calculatorscope.com ("Pakalpojums"), jūs piekrītat šiem Lietošanas noteikumiem. CalculatorScope nodrošina bezmaksas tiešsaistes kalkulatorus, konvertorus un teksta rīkus, kā arī iegulstamas logrīku versijas trešo pušu vietnēm. Šis ir līguma melnraksts, kas gaida kvalificēta jurista pārbaudi; Pakalpojumu pārvalda [Uzņēmuma nosaukums, adrese, jurisdikcija — jāaizpilda].</p>' },
                { heading: 'Nav profesionāls padoms', html: '<p>Visi mūsu rīku sniegtie rezultāti (finanšu, veselības, matemātiskie u.c.) ir aptuveni un paredzēti tikai informatīviem nolūkiem; tie nav uzskatāmi par finanšu, medicīnisku, juridisku vai citu profesionālu padomu. Nevajadzētu tos izmantot kvalificēta speciālista padoma vietā, un mēs neuzņemamies atbildību par lēmumiem, kas pieņemti, balstoties uz mūsu rīku sniegtajiem rezultātiem.</p>' },
                { heading: 'Intelektuālais īpašums un iegulšana', html: '<p>Pakalpojums, tā dizains un pamatā esošais kods pieder CalculatorScope. Iegulstamos logrīkus var bez maksas izmantot trešo pušu vietnēs, ja tiek saglabāta obligātā saite uz CalculatorScope zīmolu, to nenoņemot un neslēpjot; white-label iegulšanai bez saites nepieciešama atsevišķa, rakstiski saskaņota maksas vienošanās.</p>' },
                { heading: 'Atbildība, izmaiņas un piemērojamie tiesību akti', html: '<p>Pakalpojums tiek nodrošināts "tāds, kāds tas ir", bez jebkādām garantijām. Likumā pieļautajā maksimālajā apmērā CalculatorScope neuzņemas atbildību par jebkādiem netiešiem, nejaušiem vai izrietošiem zaudējumiem, kas radušies Pakalpojuma lietošanas rezultātā. Mēs varam jebkurā laikā atjaunināt šos Noteikumus; turpmāka lietošana pēc izmaiņām nozīmē to pieņemšanu. Šos Noteikumus regulē [jurisdikcija — jāaizpilda] tiesību akti. Jautājumus var uzdot mūsu <a href="/lv/contact">kontaktu lapā</a>.</p>' },
            ],
        },
        pl: {
            meta_title: 'Regulamin | CalculatorScope',
            meta_description: 'Zasady korzystania z kalkulatorów, konwerterów i osadzanych widżetów CalculatorScope.',
            h1: 'Regulamin',
            sections: [
                { heading: 'Akceptacja i opis usługi', html: '<p>Korzystając z calculatorscope.com ("Usługa"), akceptujesz niniejszy Regulamin. CalculatorScope udostępnia bezpłatne kalkulatory online, konwertery i narzędzia tekstowe, a także osadzane wersje widżetów dla stron trzecich. To wersja robocza regulaminu, oczekująca na weryfikację przez wykwalifikowanego prawnika; podmiotem prowadzącym Usługę jest [Nazwa firmy, adres, jurysdykcja — do uzupełnienia].</p>' },
                { heading: 'Brak porady profesjonalnej', html: '<p>Wszystkie wyniki generowane przez nasze narzędzia (finansowe, zdrowotne, matematyczne i inne) mają charakter szacunkowy i wyłącznie informacyjny; nie stanowią porady finansowej, medycznej, prawnej ani innej profesjonalnej. Nie należy polegać na nich zamiast na poradzie wykwalifikowanego specjalisty; nie ponosimy odpowiedzialności za decyzje podjęte na podstawie wyników naszych narzędzi.</p>' },
                { heading: 'Własność intelektualna i osadzanie', html: '<p>Usługa, jej wygląd i kod źródłowy są własnością CalculatorScope. Osadzane widżety mogą być bezpłatnie używane na stronach trzecich pod warunkiem zachowania obowiązkowego linku zwrotnego do marki CalculatorScope, bez jego usuwania lub ukrywania; osadzanie white-label bez linku wymaga odrębnej, pisemnie uzgodnionej odpłatnej umowy.</p>' },
                { heading: 'Odpowiedzialność, zmiany i prawo właściwe', html: '<p>Usługa jest świadczona "tak jak jest", bez jakichkolwiek gwarancji. W maksymalnym zakresie dozwolonym przez prawo CalculatorScope nie ponosi odpowiedzialności za jakiekolwiek pośrednie, przypadkowe lub wynikowe szkody powstałe w związku z korzystaniem z Usługi. Możemy aktualizować niniejszy Regulamin w dowolnym momencie; dalsze korzystanie po zmianach oznacza ich akceptację. Niniejszy Regulamin podlega prawu [jurysdykcja — do uzupełnienia]. Pytania można kierować przez naszą <a href="/pl/contact">stronę kontaktową</a>.</p>' },
            ],
        },
        es: {
            meta_title: 'Términos de servicio | CalculatorScope',
            meta_description: 'Los términos que rigen el uso de las calculadoras, conversores y widgets integrables de CalculatorScope.',
            h1: 'Términos de servicio',
            sections: [
                { heading: 'Aceptación y descripción del servicio', html: '<p>Al utilizar calculatorscope.com ("el Servicio"), usted acepta estos Términos de servicio. CalculatorScope ofrece calculadoras, conversores y herramientas de texto en línea gratuitas, junto con versiones de widgets integrables para sitios de terceros. Esta es una versión preliminar del acuerdo, pendiente de revisión por un profesional cualificado; la entidad legal que opera el Servicio es [Nombre de la empresa, dirección, jurisdicción — por completar].</p>' },
                { heading: 'No constituye asesoramiento profesional', html: '<p>Todos los resultados generados por nuestras herramientas (financieros, de salud, matemáticos u otros) son estimaciones con fines meramente informativos y no constituyen asesoramiento financiero, médico, legal ni de otro tipo profesional. No debe confiar en ellos como sustituto del consejo de un profesional cualificado, y no somos responsables de las decisiones tomadas con base en los resultados de nuestras herramientas.</p>' },
                { heading: 'Propiedad intelectual e integración', html: '<p>El Servicio, su diseño y el código subyacente son propiedad de CalculatorScope. Los widgets integrables pueden utilizarse gratuitamente en sitios de terceros siempre que se conserve el enlace obligatorio de marca hacia CalculatorScope, sin eliminarlo ni ocultarlo; la integración de marca blanca sin enlace requiere un acuerdo de pago independiente, pactado por escrito.</p>' },
                { heading: 'Responsabilidad, cambios y ley aplicable', html: '<p>El Servicio se ofrece "tal cual", sin garantías de ningún tipo. En la máxima medida permitida por la ley, CalculatorScope no será responsable de daños indirectos, incidentales o consecuentes derivados del uso del Servicio. Podemos actualizar estos Términos en cualquier momento; el uso continuado tras los cambios constituye su aceptación. Estos Términos se rigen por las leyes de [jurisdicción — por completar]. Las preguntas pueden dirigirse a nuestra <a href="/es/contact">página de contacto</a>.</p>' },
            ],
        },
        fr: {
            meta_title: 'Conditions d’utilisation | CalculatorScope',
            meta_description: 'Les conditions régissant l’utilisation des calculateurs, convertisseurs et widgets intégrables de CalculatorScope.',
            h1: 'Conditions d’utilisation',
            sections: [
                { heading: 'Acceptation et description du service', html: '<p>En utilisant calculatorscope.com ("le Service"), vous acceptez les présentes Conditions d’utilisation. CalculatorScope propose des calculateurs, convertisseurs et outils de texte gratuits en ligne, ainsi que des versions de widgets intégrables pour des sites tiers. Ceci est une version provisoire de l’accord, en attente de révision par un professionnel qualifié ; l’entité juridique exploitant le Service est [Nom de l’entreprise, adresse, juridiction — à compléter].</p>' },
                { heading: 'Absence de conseil professionnel', html: '<p>Tous les résultats produits par nos outils (financiers, de santé, mathématiques ou autres) sont des estimations à titre informatif uniquement et ne constituent pas un conseil financier, médical, juridique ou autre conseil professionnel. Vous ne devez pas vous y fier en remplacement de l’avis d’un professionnel qualifié, et nous ne sommes pas responsables des décisions prises sur la base des résultats de nos outils.</p>' },
                { heading: 'Propriété intellectuelle et intégration', html: '<p>Le Service, sa conception et le code sous-jacent sont la propriété de CalculatorScope. Les widgets intégrables peuvent être utilisés gratuitement sur des sites tiers à condition de conserver le lien retour obligatoire vers la marque CalculatorScope, sans le supprimer ni le masquer ; l’intégration en marque blanche sans lien nécessite un accord payant séparé, convenu par écrit.</p>' },
                { heading: 'Responsabilité, modifications et droit applicable', html: '<p>Le Service est fourni "tel quel", sans garantie d’aucune sorte. Dans toute la mesure permise par la loi, CalculatorScope ne saurait être tenu responsable de tout dommage indirect, accessoire ou consécutif résultant de l’utilisation du Service. Nous pouvons mettre à jour les présentes Conditions à tout moment ; la poursuite de l’utilisation après modification vaut acceptation. Les présentes Conditions sont régies par le droit de [juridiction — à compléter]. Pour toute question, contactez notre <a href="/fr/contact">page de contact</a>.</p>' },
            ],
        },
        it: {
            meta_title: 'Termini di servizio | CalculatorScope',
            meta_description: 'I termini che regolano l’uso dei calcolatori, convertitori e widget incorporabili di CalculatorScope.',
            h1: 'Termini di servizio',
            sections: [
                { heading: 'Accettazione e descrizione del servizio', html: '<p>Utilizzando calculatorscope.com ("il Servizio"), accetti i presenti Termini di servizio. CalculatorScope offre calcolatori, convertitori e strumenti di testo online gratuiti, oltre a versioni widget incorporabili per siti di terze parti. Questa è una bozza dell’accordo, in attesa di revisione da parte di un professionista qualificato; l’entità giuridica che gestisce il Servizio è [Nome azienda, indirizzo, giurisdizione — da completare].</p>' },
                { heading: 'Nessuna consulenza professionale', html: '<p>Tutti i risultati prodotti dai nostri strumenti (finanziari, sanitari, matematici o di altro tipo) sono stime a solo scopo informativo e non costituiscono consulenza finanziaria, medica, legale o professionale di altro tipo. Non dovresti fare affidamento su di essi in sostituzione della consulenza di un professionista qualificato, e non siamo responsabili per decisioni prese sulla base dei risultati dei nostri strumenti.</p>' },
                { heading: 'Proprietà intellettuale e incorporamento', html: '<p>Il Servizio, il suo design e il codice sottostante sono di proprietà di CalculatorScope. I widget incorporabili possono essere utilizzati gratuitamente su siti di terze parti a condizione che venga mantenuto il link di ritorno obbligatorio al marchio CalculatorScope, senza rimuoverlo o nasconderlo; l’incorporamento white-label senza link richiede un accordo a pagamento separato, concordato per iscritto.</p>' },
                { heading: 'Responsabilità, modifiche e legge applicabile', html: '<p>Il Servizio è fornito "così com’è", senza garanzie di alcun tipo. Nella misura massima consentita dalla legge, CalculatorScope non è responsabile per danni indiretti, incidentali o consequenziali derivanti dall’uso del Servizio. Possiamo aggiornare i presenti Termini in qualsiasi momento; l’uso continuato dopo le modifiche costituisce accettazione. I presenti Termini sono regolati dalle leggi di [giurisdizione — da completare]. Per domande, contatta la nostra <a href="/it/contact">pagina di contatto</a>.</p>' },
            ],
        },
        de: {
            meta_title: 'Nutzungsbedingungen | CalculatorScope',
            meta_description: 'Die Bedingungen für die Nutzung der Rechner, Konverter und einbettbaren Widgets von CalculatorScope.',
            h1: 'Nutzungsbedingungen',
            sections: [
                { heading: 'Annahme und Beschreibung des Dienstes', html: '<p>Durch die Nutzung von calculatorscope.com ("der Dienst") stimmen Sie diesen Nutzungsbedingungen zu. CalculatorScope stellt kostenlose Online-Rechner, Konverter und Textwerkzeuge sowie einbettbare Widget-Versionen für Websites Dritter bereit. Dies ist ein Entwurf der Vereinbarung, der noch von einer qualifizierten Fachperson geprüft werden muss; die den Dienst betreibende juristische Einheit ist [Firmenname, Adresse, Gerichtsstand — noch zu ergänzen].</p>' },
                { heading: 'Keine professionelle Beratung', html: '<p>Alle von unseren Tools erzeugten Ergebnisse (finanziell, gesundheitlich, mathematisch oder anderweitig) sind Schätzungen nur zu Informationszwecken und stellen keine finanzielle, medizinische, rechtliche oder sonstige professionelle Beratung dar. Sie sollten sich nicht anstelle der Beratung durch eine qualifizierte Fachperson darauf verlassen, und wir haften nicht für Entscheidungen, die auf Grundlage der Ergebnisse unserer Tools getroffen werden.</p>' },
                { heading: 'Geistiges Eigentum und Einbettung', html: '<p>Der Dienst, sein Design und der zugrunde liegende Code sind Eigentum von CalculatorScope. Einbettbare Widgets dürfen kostenlos auf Websites Dritter verwendet werden, sofern der verpflichtende Marken-Backlink zu CalculatorScope erhalten bleibt und nicht entfernt oder verdeckt wird; White-Label-Einbettungen ohne Backlink erfordern eine gesonderte, schriftlich vereinbarte kostenpflichtige Vereinbarung.</p>' },
                { heading: 'Haftung, Änderungen und anwendbares Recht', html: '<p>Der Dienst wird "wie besehen" ohne jegliche Gewährleistung bereitgestellt. Soweit gesetzlich zulässig, haftet CalculatorScope nicht für indirekte, zufällige oder Folgeschäden, die aus der Nutzung des Dienstes entstehen. Wir können diese Bedingungen jederzeit aktualisieren; die fortgesetzte Nutzung nach Änderungen gilt als Zustimmung. Diese Bedingungen unterliegen dem Recht von [Gerichtsstand — noch zu ergänzen]. Fragen richten Sie bitte an unsere <a href="/de/contact">Kontaktseite</a>.</p>' },
            ],
        },
    },
}

const cookies: PageDef = {
    code: 'cookies',
    slug: 'cookies',
    locales: {
        en: {
            meta_title: 'Cookie Policy | CalculatorScope',
            meta_description: 'Which cookies CalculatorScope uses — essential, analytics, and advertising — and how to manage your preferences.',
            h1: 'Cookie Policy',
            sections: [
                { heading: 'What Are Cookies', html: '<p>Cookies are small text files stored on your device when you visit a website. CalculatorScope uses cookies to remember your language preference, understand how our tools are used, and — once enabled — to serve relevant advertising.</p>' },
                { heading: 'Cookies We Use', html: '<p><strong>Essential:</strong> a cookie that stores your selected language and a cookie that stores your cookie-consent choice — required for the site to function and always active. <strong>Analytics:</strong> Google Tag Manager and Google Analytics cookies, used to understand traffic and usage, only set after you accept. <strong>Advertising:</strong> once Google AdSense is enabled, advertising cookies will be used to serve and measure ads, only set after you accept.</p>' },
                { heading: 'Managing Your Preferences', html: '<p>When you first visit calculatorscope.com, a banner lets you accept or reject non-essential cookies. You can change your choice at any time by clearing your browser’s cookies for this site, which will show the banner again. You can also control cookies through your browser settings.</p>' },
                { heading: 'Third-Party Cookies & Changes', html: '<p>Some cookies are set by third parties (Google, for Tag Manager, Analytics, and — once enabled — AdSense); their use of data is governed by Google’s own policies. This Cookie Policy may be updated from time to time; see our <a href="/en/privacy">Privacy Policy</a> for how we handle your data more broadly, or contact us via our <a href="/en/contact">contact page</a>.</p>' },
            ],
        },
        ru: {
            meta_title: 'Политика cookie | CalculatorScope',
            meta_description: 'Какие cookie использует CalculatorScope — необходимые, аналитические и рекламные — и как управлять настройками.',
            h1: 'Политика cookie',
            sections: [
                { heading: 'Что такое cookie', html: '<p>Cookie — это небольшие текстовые файлы, сохраняемые на вашем устройстве при посещении сайта. CalculatorScope использует cookie, чтобы запомнить выбранный язык, понять, как используются наши инструменты, и — после подключения — показывать релевантную рекламу.</p>' },
                { heading: 'Какие cookie мы используем', html: '<p><strong>Необходимые:</strong> cookie, хранящий выбранный язык, и cookie, хранящий ваш выбор по согласию на cookie — необходимы для работы сайта и всегда активны. <strong>Аналитические:</strong> cookie Google Tag Manager и Google Analytics, используемые для понимания трафика и использования сайта, устанавливаются только после вашего согласия. <strong>Рекламные:</strong> после подключения Google AdSense рекламные cookie будут использоваться для показа и измерения эффективности рекламы, устанавливаются только после вашего согласия.</p>' },
                { heading: 'Управление настройками', html: '<p>При первом посещении calculatorscope.com баннер позволяет принять или отклонить необязательные cookie. Вы можете изменить свой выбор в любое время, очистив cookie браузера для этого сайта — баннер появится снова. Вы также можете управлять cookie через настройки браузера.</p>' },
                { heading: 'Cookie третьих сторон и изменения', html: '<p>Некоторые cookie устанавливаются третьими сторонами (Google — для Tag Manager, Analytics и, после подключения, AdSense); использование данных этими сервисами регулируется собственными политиками Google. Эта Политика cookie может обновляться время от времени; подробнее о том, как мы обрабатываем ваши данные, читайте в нашей <a href="/ru/privacy">Политике конфиденциальности</a>, либо свяжитесь с нами через <a href="/ru/contact">страницу контактов</a>.</p>' },
            ],
        },
        lv: {
            meta_title: 'Sīkfailu politika | CalculatorScope',
            meta_description: 'Kādus sīkfailus izmanto CalculatorScope — obligātos, analītikas un reklāmas — un kā pārvaldīt savas izvēles.',
            h1: 'Sīkfailu politika',
            sections: [
                { heading: 'Kas ir sīkfaili', html: '<p>Sīkfaili ir nelieli teksta faili, kas tiek saglabāti jūsu ierīcē, apmeklējot vietni. CalculatorScope izmanto sīkfailus, lai atcerētos jūsu izvēlēto valodu, saprastu, kā tiek izmantoti mūsu rīki, un — pēc aktivizēšanas — rādītu atbilstošas reklāmas.</p>' },
                { heading: 'Mūsu izmantotie sīkfaili', html: '<p><strong>Obligātie:</strong> sīkfails, kas saglabā jūsu izvēlēto valodu, un sīkfails, kas saglabā jūsu piekrišanas izvēli — nepieciešami vietnes darbībai un vienmēr aktīvi. <strong>Analītikas:</strong> Google Tag Manager un Google Analytics sīkfaili, ko izmanto, lai izprastu trafiku un lietojumu, tiek uzstādīti tikai pēc jūsu piekrišanas. <strong>Reklāmas:</strong> pēc Google AdSense aktivizēšanas reklāmas sīkfaili tiks izmantoti reklāmu rādīšanai un mērīšanai, tie tiks uzstādīti tikai pēc jūsu piekrišanas.</p>' },
                { heading: 'Izvēļu pārvaldība', html: '<p>Pirmoreiz apmeklējot calculatorscope.com, baneris ļauj pieņemt vai noraidīt neobligātos sīkfailus. Jūs jebkurā laikā varat mainīt savu izvēli, notīrot pārlūkprogrammas sīkfailus šai vietnei — baneris parādīsies atkal. Sīkfailus varat pārvaldīt arī pārlūkprogrammas iestatījumos.</p>' },
                { heading: 'Trešo pušu sīkfaili un izmaiņas', html: '<p>Dažus sīkfailus uzstāda trešās puses (Google — Tag Manager, Analytics un, pēc aktivizēšanas, AdSense); šo datu izmantošanu regulē Google pašas politikas. Šī Sīkfailu politika var tikt periodiski atjaunināta; par to, kā mēs apstrādājam jūsu datus plašāk, lasiet mūsu <a href="/lv/privacy">Privātuma politikā</a> vai sazinieties ar mums mūsu <a href="/lv/contact">kontaktu lapā</a>.</p>' },
            ],
        },
        pl: {
            meta_title: 'Polityka cookie | CalculatorScope',
            meta_description: 'Jakich plików cookie używa CalculatorScope — niezbędnych, analitycznych i reklamowych — i jak zarządzać preferencjami.',
            h1: 'Polityka cookie',
            sections: [
                { heading: 'Czym są pliki cookie', html: '<p>Pliki cookie to małe pliki tekstowe zapisywane na Twoim urządzeniu podczas odwiedzania strony. CalculatorScope wykorzystuje pliki cookie, aby zapamiętać wybrany język, zrozumieć sposób korzystania z naszych narzędzi oraz — po uruchomieniu — wyświetlać trafne reklamy.</p>' },
                { heading: 'Pliki cookie, których używamy', html: '<p><strong>Niezbędne:</strong> plik cookie zapisujący wybrany język oraz plik cookie zapisujący Twoją decyzję dotyczącą zgody na cookie — wymagane do działania strony i zawsze aktywne. <strong>Analityczne:</strong> pliki cookie Google Tag Manager i Google Analytics, używane do analizy ruchu i sposobu korzystania ze strony, ustawiane wyłącznie po wyrażeniu zgody. <strong>Reklamowe:</strong> po uruchomieniu Google AdSense pliki cookie reklamowe będą używane do wyświetlania i mierzenia reklam, ustawiane wyłącznie po wyrażeniu zgody.</p>' },
                { heading: 'Zarządzanie preferencjami', html: '<p>Przy pierwszej wizycie na calculatorscope.com baner pozwala zaakceptować lub odrzucić niezbędne pliki cookie. Możesz zmienić swój wybór w dowolnym momencie, czyszcząc pliki cookie przeglądarki dla tej strony — baner pojawi się ponownie. Możesz również zarządzać plikami cookie w ustawieniach przeglądarki.</p>' },
                { heading: 'Pliki cookie stron trzecich i zmiany', html: '<p>Niektóre pliki cookie są ustawiane przez strony trzecie (Google — dla Tag Manager, Analytics oraz, po uruchomieniu, AdSense); wykorzystanie danych przez te usługi podlega własnym politykom Google. Niniejsza Polityka cookie może być okresowo aktualizowana; więcej o tym, jak przetwarzamy Twoje dane, znajdziesz w naszej <a href="/pl/privacy">Polityce prywatności</a> lub skontaktuj się z nami przez naszą <a href="/pl/contact">stronę kontaktową</a>.</p>' },
            ],
        },
        es: {
            meta_title: 'Política de cookies | CalculatorScope',
            meta_description: 'Qué cookies utiliza CalculatorScope — esenciales, analíticas y publicitarias — y cómo gestionar sus preferencias.',
            h1: 'Política de cookies',
            sections: [
                { heading: 'Qué son las cookies', html: '<p>Las cookies son pequeños archivos de texto que se almacenan en su dispositivo al visitar un sitio web. CalculatorScope utiliza cookies para recordar su idioma preferido, entender cómo se usan nuestras herramientas y —una vez activado— mostrar publicidad relevante.</p>' },
                { heading: 'Cookies que utilizamos', html: '<p><strong>Esenciales:</strong> una cookie que almacena el idioma seleccionado y otra que almacena su elección de consentimiento de cookies — necesarias para el funcionamiento del sitio y siempre activas. <strong>Analíticas:</strong> cookies de Google Tag Manager y Google Analytics, utilizadas para entender el tráfico y el uso, solo se instalan tras su aceptación. <strong>Publicitarias:</strong> una vez activado Google AdSense, se utilizarán cookies publicitarias para mostrar y medir anuncios, solo se instalan tras su aceptación.</p>' },
                { heading: 'Gestión de sus preferencias', html: '<p>En su primera visita a calculatorscope.com, un banner le permite aceptar o rechazar las cookies no esenciales. Puede cambiar su elección en cualquier momento borrando las cookies del navegador para este sitio, lo que volverá a mostrar el banner. También puede controlar las cookies desde la configuración de su navegador.</p>' },
                { heading: 'Cookies de terceros y cambios', html: '<p>Algunas cookies son instaladas por terceros (Google, para Tag Manager, Analytics y, una vez activado, AdSense); el uso de datos por estos servicios se rige por las propias políticas de Google. Esta Política de cookies puede actualizarse ocasionalmente; consulte nuestra <a href="/es/privacy">Política de privacidad</a> para más información sobre el tratamiento de sus datos, o contáctenos a través de nuestra <a href="/es/contact">página de contacto</a>.</p>' },
            ],
        },
        fr: {
            meta_title: 'Politique de cookies | CalculatorScope',
            meta_description: 'Quels cookies CalculatorScope utilise — essentiels, analytiques et publicitaires — et comment gérer vos préférences.',
            h1: 'Politique de cookies',
            sections: [
                { heading: 'Que sont les cookies', html: '<p>Les cookies sont de petits fichiers texte stockés sur votre appareil lors de la visite d’un site web. CalculatorScope utilise des cookies pour mémoriser votre langue préférée, comprendre l’utilisation de nos outils et — une fois activé — diffuser des publicités pertinentes.</p>' },
                { heading: 'Cookies que nous utilisons', html: '<p><strong>Essentiels :</strong> un cookie qui stocke la langue sélectionnée et un cookie qui stocke votre choix de consentement aux cookies — nécessaires au fonctionnement du site et toujours actifs. <strong>Analytiques :</strong> cookies Google Tag Manager et Google Analytics, utilisés pour comprendre le trafic et l’utilisation, déposés uniquement après votre acceptation. <strong>Publicitaires :</strong> une fois Google AdSense activé, des cookies publicitaires seront utilisés pour diffuser et mesurer les publicités, déposés uniquement après votre acceptation.</p>' },
                { heading: 'Gérer vos préférences', html: '<p>Lors de votre première visite sur calculatorscope.com, une bannière vous permet d’accepter ou de refuser les cookies non essentiels. Vous pouvez modifier votre choix à tout moment en supprimant les cookies de votre navigateur pour ce site, ce qui affichera à nouveau la bannière. Vous pouvez également gérer les cookies via les paramètres de votre navigateur.</p>' },
                { heading: 'Cookies tiers et modifications', html: '<p>Certains cookies sont déposés par des tiers (Google, pour Tag Manager, Analytics et, une fois activé, AdSense) ; l’utilisation des données par ces services est régie par les propres politiques de Google. Cette Politique de cookies peut être mise à jour occasionnellement ; consultez notre <a href="/fr/privacy">Politique de confidentialité</a> pour en savoir plus sur le traitement de vos données, ou contactez-nous via notre <a href="/fr/contact">page de contact</a>.</p>' },
            ],
        },
        it: {
            meta_title: 'Cookie Policy | CalculatorScope',
            meta_description: 'Quali cookie utilizza CalculatorScope — essenziali, analitici e pubblicitari — e come gestire le tue preferenze.',
            h1: 'Cookie Policy',
            sections: [
                { heading: 'Cosa sono i cookie', html: '<p>I cookie sono piccoli file di testo memorizzati sul tuo dispositivo quando visiti un sito web. CalculatorScope utilizza i cookie per ricordare la lingua preferita, capire come vengono utilizzati i nostri strumenti e — una volta attivato — mostrare pubblicità pertinente.</p>' },
                { heading: 'I cookie che utilizziamo', html: '<p><strong>Essenziali:</strong> un cookie che memorizza la lingua selezionata e un cookie che memorizza la tua scelta sul consenso ai cookie — necessari per il funzionamento del sito e sempre attivi. <strong>Analitici:</strong> cookie di Google Tag Manager e Google Analytics, utilizzati per comprendere il traffico e l’utilizzo, impostati solo dopo la tua accettazione. <strong>Pubblicitari:</strong> una volta attivato Google AdSense, i cookie pubblicitari verranno utilizzati per mostrare e misurare gli annunci, impostati solo dopo la tua accettazione.</p>' },
                { heading: 'Gestire le tue preferenze', html: '<p>Alla tua prima visita su calculatorscope.com, un banner ti permette di accettare o rifiutare i cookie non essenziali. Puoi cambiare la tua scelta in qualsiasi momento cancellando i cookie del browser per questo sito, il banner riapparirà. Puoi anche controllare i cookie tramite le impostazioni del tuo browser.</p>' },
                { heading: 'Cookie di terze parti e modifiche', html: '<p>Alcuni cookie sono impostati da terze parti (Google, per Tag Manager, Analytics e, una volta attivato, AdSense); l’uso dei dati da parte di questi servizi è disciplinato dalle politiche proprie di Google. Questa Cookie Policy potrà essere aggiornata periodicamente; consulta la nostra <a href="/it/privacy">Informativa sulla privacy</a> per maggiori dettagli sul trattamento dei tuoi dati, oppure contattaci tramite la nostra <a href="/it/contact">pagina di contatto</a>.</p>' },
            ],
        },
        de: {
            meta_title: 'Cookie-Richtlinie | CalculatorScope',
            meta_description: 'Welche Cookies CalculatorScope verwendet — essenziell, Analyse und Werbung — und wie Sie Ihre Einstellungen verwalten.',
            h1: 'Cookie-Richtlinie',
            sections: [
                { heading: 'Was sind Cookies', html: '<p>Cookies sind kleine Textdateien, die beim Besuch einer Website auf Ihrem Gerät gespeichert werden. CalculatorScope verwendet Cookies, um Ihre Sprachpräferenz zu speichern, zu verstehen, wie unsere Tools genutzt werden, und — sobald aktiviert — relevante Werbung auszuliefern.</p>' },
                { heading: 'Von uns verwendete Cookies', html: '<p><strong>Essenziell:</strong> ein Cookie, das Ihre gewählte Sprache speichert, und ein Cookie, das Ihre Cookie-Zustimmung speichert — für die Funktion der Website erforderlich und immer aktiv. <strong>Analyse:</strong> Cookies von Google Tag Manager und Google Analytics, die genutzt werden, um Traffic und Nutzung zu verstehen, werden erst nach Ihrer Zustimmung gesetzt. <strong>Werbung:</strong> Sobald Google AdSense aktiviert ist, werden Werbe-Cookies zur Auslieferung und Messung von Anzeigen verwendet, ebenfalls erst nach Ihrer Zustimmung.</p>' },
                { heading: 'Einstellungen verwalten', html: '<p>Bei Ihrem ersten Besuch auf calculatorscope.com können Sie über ein Banner nicht notwendige Cookies akzeptieren oder ablehnen. Sie können Ihre Wahl jederzeit ändern, indem Sie die Browser-Cookies für diese Website löschen — das Banner erscheint dann erneut. Sie können Cookies auch über Ihre Browsereinstellungen verwalten.</p>' },
                { heading: 'Cookies Dritter und Änderungen', html: '<p>Einige Cookies werden von Dritten gesetzt (Google, für Tag Manager, Analytics und — sobald aktiviert — AdSense); die Datennutzung durch diese Dienste unterliegt den eigenen Richtlinien von Google. Diese Cookie-Richtlinie kann gelegentlich aktualisiert werden; wie wir Ihre Daten allgemein behandeln, erfahren Sie in unserer <a href="/de/privacy">Datenschutzerklärung</a>, oder kontaktieren Sie uns über unsere <a href="/de/contact">Kontaktseite</a>.</p>' },
            ],
        },
    },
}

async function seedPage(def: PageDef) {
    console.log(`🚀 Seeding page "${def.code}" (${Object.keys(def.locales).length} locales)`)

    const page = await prisma.page.upsert({
        where: { code: def.code },
        update: { status: 'published' },
        create: { code: def.code, status: 'published' },
    })

    for (const [lang, content] of Object.entries(def.locales)) {
        // @ts-ignore - TypeScript не всегда правильно выводит составные уникальные индексы Prisma
        await prisma.pageI18n.upsert({
            where: { page_id_lang: { page_id: page.id, lang } },
            update: {
                slug: def.slug,
                meta_title: content.meta_title,
                meta_description: content.meta_description,
                meta_robots: 'index,follow',
                h1: content.h1,
                body_blocks_json: { sections: content.sections },
            },
            create: {
                page_id: page.id,
                lang,
                slug: def.slug,
                meta_title: content.meta_title,
                meta_description: content.meta_description,
                meta_robots: 'index,follow',
                h1: content.h1,
                body_blocks_json: { sections: content.sections },
            },
        })
    }
}

async function main() {
    await seedPage(privacy)
    await seedPage(terms)
    await seedPage(cookies)
    console.log('✅ Legal pages seeded (privacy, terms, cookies)')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
