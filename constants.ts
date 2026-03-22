import { Job, UserProfile, Transaction, OperationalRole, AptitudeTest, Application, BlogPost, CaliberEvent } from './types.js';

export const ALL_COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
  "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo, Democratic Republic of the", "Congo, Republic of the", "Costa Rica", "Cote d'Ivoire", "Croatia", "Cuba", "Cyprus", "Czech Republic",
  "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
  "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hungary",
  "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
  "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kosovo", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway",
  "Oman",
  "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar",
  "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "USA", "Uruguay", "Uzbekistan",
  "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
  "Yemen",
  "Zambia", "Zimbabwe"
];

export const COUNTRY_CURRENCY_SYMBOLS: Record<string, string> = {
  "USA": "$", "United Kingdom": "£", "Germany": "€", "France": "€", "Italy": "€", "Spain": "€", "Netherlands": "€", "Belgium": "€", "Austria": "€", "Portugal": "€", "Ireland": "€", "Finland": "€", "Greece": "€",
  "Ghana": "GH₵", "Nigeria": "₦", "Kenya": "KSh", "South Africa": "R", "Egypt": "E£", "Morocco": "DH", "Senegal": "CFA", "Cote d'Ivoire": "CFA", "Tanzania": "TSh", "Uganda": "USh", "Ethiopia": "Br",
  "Canada": "C$", "Australia": "A$", "Japan": "¥", "China": "¥", "India": "₹", "Brazil": "R$", "Mexico": "$", "Russia": "₽", "South Korea": "₩", "Singapore": "S$", "Hong Kong": "HK$", "Switzerland": "CHF", "United Arab Emirates": "AED", "Saudi Arabia": "SR", "Israel": "₪", "Turkey": "₺", "Pakistan": "Rs", "Bangladesh": "৳", "Indonesia": "Rp", "Malaysia": "RM", "Philippines": "₱", "Thailand": "฿", "Vietnam": "₫", "New Zealand": "NZ$", "Ukraine": "₴", "Norway": "kr", "Sweden": "kr", "Denmark": "kr", "Poland": "zł", "Czech Republic": "Kč", "Hungary": "Ft", "Romania": "lei", "Bulgaria": "лв", "Croatia": "kn"
};

export const GLOBAL_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$', label: 'USA - USD ($)' },
  { code: 'GBP', name: 'British Pound', symbol: '£', label: 'UK - GBP (£)' },
  { code: 'EUR', name: 'Euro', symbol: '€', label: 'Europe - EUR (€)' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵', label: 'Ghana - GHS (GH₵)' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', label: 'Nigeria - NGN (₦)' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', label: 'Kenya - KES (KSh)' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', label: 'South Africa - ZAR (R)' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', label: 'India - INR (₹)' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', label: 'Canada - CAD (C$)' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', label: 'Australia - AUD (A$)' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', label: 'Japan - JPY (¥)' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', label: 'China - CNY (¥)' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED', label: 'UAE - AED' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', label: 'Switzerland - CHF' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', label: 'Singapore - SGD (S$)' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', label: 'Brazil - BRL (R$)' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', label: 'Mexico - MXN ($)' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', label: 'Russia - RUB (₽)' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', label: 'Turkey - TRY (₺)' },
];

export const isJobActuallyActive = (job: Job): boolean => {
  if (!job || job.status !== 'active') return false;
  return true; 
};

export const REGIONS_BY_COUNTRY: Record<string, string[]> = {
  "Afghanistan": ["Kabul", "Kandahar", "Herat", "Mazar-i-Sharif", "Kunduz", "Jalalabad", "Lashkar Gah", "Taloqan", "Puli Khumri", "Khost"],
  "Albania": ["Tirana", "Durrës", "Vlorë", "Elbasan", "Shkodër", "Fier", "Korçë", "Berat", "Lushnjë", "Kavajë"],
  "Algeria": ["Algiers", "Oran", "Constantine", "Annaba", "Blida", "Batna", "Djelfa", "Sétif", "Sidi Bel Abbès", "Biskra"],
  "Andorra": ["Andorra la Vella", "Canillo", "Encamp", "Escaldes-Engordany", "La Massana", "Ordino", "Sant Julià de Lòria"],
  "Angola": ["Luanda", "Huambo", "Lobito", "Benguela", "Lucapa", "Kuito", "Lubango", "Malanje", "Namibe", "Soy"],
  "Antigua and Barbuda": ["Saint John's", "All Saints", "Liberta", "Potters Village", "Bolans", "Swetes", "Falmouth"],
  "Argentina": ["Buenos Aires", "Córdoba", "Rosario", "Mendoza", "Tucumán", "La Plata", "Mar del Plata", "Salta", "Santa Fe", "San Juan"],
  "Armenia": ["Yerevan", "Gyumri", "Vanadzor", "Vagharshapat", "Hrazdan", "Abovyan", "Kapan", "Armavir", "Gavar", "Artashat"],
  "Australia": ["New South Wales", "Victoria", "Queensland", "Western Australia", "South Australia", "Tasmania", "Australian Capital Territory", "Northern Territory"],
  "Austria": ["Vienna", "Lower Austria", "Upper Austria", "Styria", "Tyrol", "Carinthia", "Salzburg", "Vorarlberg", "Burgenland"],
  "Azerbaijan": ["Baku", "Ganja", "Sumqayit", "Mingachevir", "Lankaran", "Shirvan", "Nakhchivan", "Shaki", "Yevlakh", "Khankendi"],
  "Bahamas": ["New Providence", "Grand Bahama", "Abaco", "Eleuthera", "Andros", "Exuma", "Long Island", "Bimini"],
  "Bahrain": ["Manama", "Riffa", "Muharraq", "Hamad Town", "A'ali", "Isa Town", "Sitra", "Budaiya", "Jidhafs"],
  "Bangladesh": ["Dhaka", "Chittagong", "Khulna", "Rajshahi", "Sylhet", "Barisal", "Rangpur", "Mymensingh", "Comilla", "Narayanganj"],
  "Barbados": ["Bridgetown", "Speightstown", "Oistins", "Holetown", "The Crane", "Bathsheba", "Six Cross Roads"],
  "Belarus": ["Minsk", "Gomel", "Mogilev", "Vitebsk", "Grodno", "Brest", "Bobruisk", "Baranovichi", "Borisov", "Pinsk"],
  "Belgium": ["Brussels", "Antwerp", "Ghent", "Charleroi", "Liège", "Bruges", "Namur", "Leuven", "Mons", "Aalst"],
  "Belize": ["Belize City", "San Ignacio", "Orange Walk Town", "Belmopan", "Dangriga", "Corozal Town", "San Pedro", "Benque Viejo del Carmen"],
  "Benin": ["Cotonou", "Abomey-Calavi", "Porto-Novo", "Djougou", "Parakou", "Bohicon", "Kandi", "Lokossa", "Ouidah"],
  "Bhutan": ["Thimphu", "Phuentsholing", "Punakha", "Gelephu", "Samdrup Jongkhar", "Wangdue Phodrang", "Paro", "Trashigang"],
  "Bolivia": ["Santa Cruz", "El Alto", "La Paz", "Cochabamba", "Oruro", "Sucre", "Tarija", "Potosí", "Sacaba", "Quillacollo"],
  "Bosnia and Herzegovina": ["Sarajevo", "Banja Luka", "Tuzla", "Zenica", "Mostar", "Bijeljina", "Brčko", "Bihać", "Prijedor", "Doboj"],
  "Botswana": ["Gaborone", "Francistown", "Molepolole", "Maun", "Mogoditshane", "Kanye", "Selibe Phikwe", "Lobatse"],
  "Brazil": ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza", "Belo Horizonte", "Manaus", "Curitiba", "Recife", "Porto Alegre"],
  "Brunei": ["Bandar Seri Begawan", "Kuala Belait", "Seria", "Tutong", "Bangar", "Kampong Ayer", "Muara"],
  "Bulgaria": ["Sofia", "Plovdiv", "Varna", "Burgas", "Ruse", "Stara Zagora", "Pleven", "Sliven", "Dobrich", "Shumen"],
  "Burkina Faso": ["Ouagadougou", "Bobo-Dioulasso", "Koudougou", "Banfora", "Ouahigouya", "Kaya", "Tenkodogo", "Fada N'gourma"],
  "Burundi": ["Bujumbura", "Gitega", "Muyinga", "Ngozi", "Ruyigi", "Kayanza", "Bururi", "Rutana"],
  "Cabo Verde": ["Praia", "Mindelo", "Santa Maria", "Assomada", "Tarrafal", "Espargos", "Ribeira Grande", "Porto Novo"],
  "Cambodia": ["Phnom Penh", "Siem Reap", "Battambang", "Sihanoukville", "Poipet", "Ta Khmau", "Sisophon", "Kampong Cham"],
  "Cameroon": ["Douala", "Yaoundé", "Bamenda", "Bafoussam", "Garoua", "Maroua", "Ngaoundéré", "Kumba", "Nkongsamba", "Buea"],
  "Canada": ["Ontario", "Quebec", "British Columbia", "Alberta", "Manitoba", "Saskatchewan", "Nova Scotia", "New Brunswick", "Newfoundland and Labrador", "Prince Edward Island"],
  "Central African Republic": ["Bangui", "Bimbo", "Berbérati", "Carnot", "Bambari", "Bouar", "Bossangoa", "Bria"],
  "Chad": ["N'Djamena", "Moundou", "Sarh", "Abéché", "Kélo", "Kumra", "Pala", "Am Timan"],
  "Chile": ["Santiago", "Valparaíso", "Concepción", "La Serena", "Antofagasta", "Temuco", "Rancagua", "Iquique", "Talca", "Arica"],
  "China": ["Guangdong", "Jiangsu", "Shandong", "Zhejiang", "Henan", "Sichuan", "Hubei", "Hebei", "Hunan", "Anhui"],
  "Colombia": ["Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Cúcuta", "Bucaramanga", "Pereira", "Santa Marta", "Ibagué"],
  "Comoros": ["Moroni", "Mutsamudu", "Fomboni", "Domoni", "Mirontsi"],
  "Congo, Democratic Republic of the": ["Kinshasa", "Mbuji-Mayi", "Lubumbashi", "Kananga", "Kisangani", "Bukavu", "Goma", "Likasi"],
  "Congo, Republic of the": ["Brazzaville", "Pointe-Noire", "Dolisie", "Nkayi", "Loandjili", "Ouesso", "Madingou"],
  "Costa Rica": ["San José", "Alajuela", "Cartago", "Heredia", "Liberia", "Puntarenas", "Limón", "San Isidro de El General"],
  "Cote d'Ivoire": ["Abidjan", "Bouaké", "Daloa", "Yamoussoukro", "San-Pédro", "Korhogo", "Man", "Divo"],
  "Croatia": ["Zagreb", "Split", "Rijeka", "Osijek", "Zadar", "Slavonski Brod", "Pula", "Sesvete", "Karlovac", "Varaždin"],
  "Cuba": ["Havana", "Santiago de Cuba", "Camagüey", "Holguín", "Guantánamo", "Santa Clara", "Las Tunas", "Bayamo", "Artemisa", "Pinar del Río"],
  "Cyprus": ["Nicosia", "Limassol", "Larnaca", "Paphos", "Famagusta", "Kyrenia", "Protaras"],
  "Czech Republic": ["Prague", "Brno", "Ostrava", "Plzeň", "Liberec", "Olomouc", "Ústí nad Labem", "České Budějovice", "Hradec Králové", "Pardubice"],
  "Denmark": ["Copenhagen", "Aarhus", "Odense", "Aalborg", "Esbjerg", "Randers", "Kolding", "Horsens", "Vejle", "Roskilde"],
  "Djibouti": ["Djibouti City", "Ali Sabieh", "Tadjoura", "Obock", "Dikhil", "Arta"],
  "Dominica": ["Roseau", "Portsmouth", "Marigot", "Berekua", "Mahaut", "Saint Joseph"],
  "Dominican Republic": ["Santo Domingo", "Santiago de los Caballeros", "Santo Domingo Oeste", "Santo Domingo Este", "San Pedro de Macorís", "La Romana", "Bello Campo", "San Cristóbal"],
  "Ecuador": ["Guayaquil", "Quito", "Cuenca", "Santo Domingo", "Machala", "Manta", "Portoviejo", "Durán", "Ambato", "Esmeraldas"],
  "Egypt": ["Cairo", "Alexandria", "Giza", "Shubra El Kheima", "Port Said", "Suez", "Luxor", "Mansoura", "Tanta", "Asyut"],
  "El Salvador": ["San Salvador", "Santa Ana", "San Miguel", "Santa Tecla", "Soyapango", "Mejicanos", "Apopa", "Delgado"],
  "Equatorial Guinea": ["Malabo", "Bata", "Ebebiyín", "Mongomo", "Luba", "Evinayong", "Añisoc"],
  "Eritrea": ["Asmara", "Keren", "Massawa", "Assab", "Mendefera", "Barentu", "Adi Keyh"],
  "Estonia": ["Tallinn", "Tartu", "Narva", "Pärnu", "Kohtla-Järve", "Viljandi", "Rakvere", "Maardu"],
  "Eswatini": ["Manzini", "Mbabane", "Big Bend", "Malkerns", "Nhlangano", "Mhlume", "Hluti"],
  "Ethiopia": ["Addis Ababa", "Gondar", "Mek'ele", "Adama", "Awasa", "Bahir Dar", "Dire Dawa", "Dessie", "Jimma", "Jijiga"],
  "Fiji": ["Suva", "Lautoka", "Nadi", "Labasa", "Lami", "Nausori", "Sigatoka", "Savusavu"],
  "Finland": ["Helsinki", "Espoo", "Tampere", "Vantaa", "Oulu", "Turku", "Jyväskylä", "Lahti", "Kuopio", "Pori"],
  "France": ["Île-de-France", "Provence-Alpes-Côte d'Azur", "Auvergne-Rhône-Alpes", "Nouvelle-Aquitaine", "Occitanie", "Hauts-de-France", "Grand Est", "Pays de la Loire", "Brittany", "Normandy"],
  "Gabon": ["Libreville", "Port-Gentil", "Franceville", "Oyem", "Moanda", "Mouila", "Lambaréné", "Makokou"],
  "Gambia": ["Serekunda", "Brikama", "Bakau", "Farafenni", "Lamin", "Nema Kunku", "Brufut", "Banjul"],
  "Georgia": ["Tbilisi", "Batumi", "Kutaisi", "Rustavi", "Gori", "Zugdidi", "Poti", "Khoshuri"],
  "Germany": ["Bavaria", "Baden-Württemberg", "North Rhine-Westphalia", "Hesse", "Berlin", "Lower Saxony", "Saxony", "Hamburg", "Schleswig-Holstein", "Brandenburg"],
  "Ghana": ["Greater Accra", "Ashanti", "Western", "Central", "Eastern", "Northern", "Volta", "Brong-Ahafo", "Upper East", "Upper West"],
  "Greece": ["Athens", "Thessaloniki", "Patras", "Heraklion", "Larissa", "Volos", "Rhodes", "Ioannina", "Chania", "Chalcis"],
  "Grenada": ["Saint George's", "Gouyave", "Grenville", "Victoria", "Saint David's", "Sauteurs"],
  "Guatemala": ["Guatemala City", "Mixco", "Villa Nueva", "Quetzaltenango", "Escuintla", "Amatitlán", "Chinautla", "Cobán"],
  "Guinea": ["Conakry", "Nzérékoré", "Kankan", "Kindia", "Labé", "Guéckédou", "Boké", "Mamou"],
  "Guinea-Bissau": ["Bissau", "Bafatá", "Gabú", "Bissorã", "Bolama", "Cacheu", "Quinhamel"],
  "Guyana": ["Georgetown", "Linden", "New Amsterdam", "Anna Regina", "Bartica", "Skeldon", "Rosignol"],
  "Haiti": ["Port-au-Prince", "Carrefour", "Delmas", "Pétion-Ville", "Gonaïves", "Cap-Haïtien", "Saint-Marc", "Verrettes"],
  "Honduras": ["Tegucigalpa", "San Pedro Sula", "Choloma", "La Ceiba", "El Progress", "Villanueva", "Choluteca", "Comayagua"],
  "Hungary": ["Budapest", "Debrecen", "Szeged", "Miskolc", "Pécs", "Győr", "Nyíregyháza", "Kecskemét", "Székesfehérvár", "Szombathely"],
  "Iceland": ["Reykjavík", "Kópavogur", "Hafnarfjörður", "Akureyri", "Reykjanesbær", "Garðabær", "Mosfellsbær", "Akranes"],
  "India": ["Maharashtra", "Tamil Nadu", "Karnataka", "Uttar Pradesh", "Gujarat", "West Bengal", "Telangana", "Rajasthan", "Delhi", "Kerala"],
  "Indonesia": ["Jakarta", "Surabaya", "Bandung", "Medan", "Semarang", "Makassar", "Palembang", "Tangerang", "Bekasi", "Depok"],
  "Iran": ["Tehran", "Mashhad", "Isfahan", "Karaj", "Tabriz", "Shiraz", "Ahvaz", "Qom", "Kermanshah", "Urmia"],
  "Iraq": ["Baghdad", "Basra", "Mosul", "Erbil", "Abu Ghraib", "Sulaymaniyah", "Kirkuk", "Najaf", "Karbala", "Nasiriyah"],
  "Ireland": ["Dublin", "Cork", "Limerick", "Galway", "Waterford", "Drogheda", "Dundalk", "Swords", "Bray", "Navan"],
  "Israel": ["Jerusalem", "Tel Aviv", "Haifa", "Rishon LeZion", "Petah Tikva", "Ashdod", "Netanya", "Beersheba", "Holon", "Bnei Brak"],
  "Italy": ["Lombardy", "Lazio", "Campania", "Veneto", "Sicily", "Emilia-Romagna", "Piedmont", "Tuscany", "Apulia", "Liguria"],
  "Jamaica": ["Kingston", "Spanish Town", "Portmore", "Montego Bay", "Mandeville", "May Pen", "Old Harbour", "Linstead"],
  "Japan": ["Tokyo", "Osaka", "Kanagawa", "Aichi", "Hokkaido", "Fukuoka", "Hyogo", "Saitama", "Chiba", "Kyoto"],
  "Jordan": ["Amman", "Zarqa", "Irbid", "Russeifa", "Sahab", "Ar Ramtha", "Aqaba", "Mafraq", "Madaba", "Salt"],
  "Kazakhstan": ["Almaty", "Astana", "Shymkent", "Karaganda", "Aktobe", "Taraz", "Pavlodar", "Ust-Kamenogorsk", "Semey", "Atyrau"],
  "Kenya": ["Nairobi", "Mombasa", "Nakuru", "Kisumu", "Eldoret", "Thika", "Malindi", "Kitale", "Garissa", "Kakamega"],
  "Kiribati": ["Tarawa", "Betio", "Bikenibeu", "Teaoraereke", "Temwaiku", "Eita", "Bonriki"],
  "Korea, North": ["Pyongyang", "Hamhung", "Chongjin", "Nampo", "Wonsan", "Sinuiju", "Tanchon", "Kaechon"],
  "Korea, South": ["Seoul", "Busan", "Incheon", "Daegu", "Daejeon", "Gwangju", "Suwon", "Ulsan", "Changwon", "Goyang"],
  "Kosovo": ["Pristina", "Prizren", "Gjilan", "Peja", "Mitrovica", "Ferizaj", "Gjakova", "Vushtrri"],
  "Kuwait": ["Kuwait City", "Al Ahmadi", "Hawalli", "As Salimiyah", "Sabah as Salim", "Al Farwaniyah", "Al Fahahil"],
  "Kyrgyzstan": ["Bishkek", "Osh", "Jalal-Abad", "Karakol", "Tokmok", "Kara-Balta", "Naryn", "Uzgen"],
  "Laos": ["Vientiane", "Pakse", "Savannakhet", "Luang Prabang", "Xam Neua", "Phonsavan", "Thakhek"],
  "Latvia": ["Riga", "Daugavpils", "Liepāja", "Jelgava", "Jūrmala", "Ventspils", "Rēzekne", "Valmiera"],
  "Lebanon": ["Beirut", "Tripoli", "Sidon", "Tyre", "Nabatieh", "Jounieh", "Zahlé", "Baabda"],
  "Lesotho": ["Maseru", "Teyateyaneng", "Mafeteng", "Hlotse", "Mohale's Hoek", "Quthing", "Butha-Buthe"],
  "Liberia": ["Monrovia", "Gbarnga", "Kakata", "Bensonville", "Harper", "Voinjama", "Infinite Loop", "Buchanan", "Zwedru"],
  "Libya": ["Tripoli", "Benghazi", "Misrata", "Bayda", "Zawiya", "Zliten", "Tobruk", "Sabhah"],
  "Liechtenstein": ["Vaduz", "Schaan", "Triesen", "Balzers", "Eschen", "Mauren", "Triesenberg"],
  "Lithuania": ["Vilnius", "Kaunas", "Klaipėda", "Šiauliai", "Panevėžys", "Alytus", "Marijampolė", "Mažeikiai"],
  "Luxembourg": ["Luxembourg City", "Esch-sur-Alzette", "Differdange", "Dudelange", "Ettelbruck", "Diekirch", "Wiltz"],
  "Madagascar": ["Antananarivo", "Toamasina", "Antsirabe", "Mahajanga", "Fianarantsoa", "Toliara", "Antsiranana", "Ambovombe"],
  "Malawi": ["Lilongwe", "Blantyre", "Mzuzu", "Zomba", "Kasungu", "Mangochi", "Karonga", "Salima"],
  "Malaysia": ["Kuala Lumpur", "Selangor", "Johor", "Penang", "Perak", "Sarawak", "Sabah", "Kedah", "Pahang", "Negeri Sembilan"],
  "Maldives": ["Malé", "Addu City", "Fuvahmulah", "Kulhudhuffushi", "Thinadhoo", "Naifaru", "Hithadhoo"],
  "Mali": ["Bamako", "Sikasso", "Kalabancoro", "Koutiala", "Ségou", "Kayes", "Kati", "Mopti"],
  "Malta": ["Valletta", "Birkirkara", "Qormi", "Mosta", "Zabbar", "San Gwann", "Sliema", "Zebbug"],
  "Marshall Islands": ["Majuro", "Ebeye", "Arno", "Jaluij", "Wotje", "Kwajalein"],
  "Mauritania": ["Nouakchott", "Nouadhibou", "Kiffa", "M'Bout", "Kaédi", "Zouérat", "Rosso", "Sélibaby"],
  "Mauritius": ["Port Louis", "Beau Bassin-Rose Hill", "Vacoas-Phoenix", "Curepipe", "Quatre Bornes", "Triolet", "Goodlands"],
  "Mexico": ["Mexico City", "Jalisco", "Nuevo León", "State of Mexico", "Guanajuato", "Puebla", "Veracruz", "Baja California", "Chihuahua", "Tamaulipas"],
  "Micronesia": ["Palikir", "Weno", "Tonoas", "Lelu", "Kolonia", "Rull"],
  "Moldova": ["Chisinau", "Tiraspol", "Bălți", "Bender", "Rîbnița", "Ungheni", "Cahul", "Soroca"],
  "Monaco": ["Monaco-Ville", "Monte Carlo", "La Condamine", "Fontvieille", "Moneghetti", "Larvotto", "Saint Roman"],
  "Mongolia": ["Ulaanbaatar", "Erdenet", "Darkhan", "Choibalsan", "Mörön", "Nalaikh", "Bayankhongor", "Ölgii"],
  "Montenegro": ["Podgorica", "Nikšić", "Herceg Novi", "Pljevlja", "Budva", "Bar", "Bijelo Polje", "Cetinje"],
  "Morocco": ["Casablanca", "Rabat", "Fez", "Marrakesh", "Tangier", "Salé", "Meknes", "Agadir", "Oujda", "Kenitra"],
  "Mozambique": ["Maputo", "Matola", "Beira", "Nampula", "Chimoio", "Nacala", "Quelimane", "Tete", "Xai-Xai", "Maxixe"],
  "Myanmar": ["Yangon", "Mandalay", "Naypyidaw", "Mawlamyine", "Bago", "Pathein", "Monywa", "Meiktila", "Sittwe", "Taunggyi"],
  "Namibia": ["Windhoek", "Walvis Bay", "Swakopmund", "Henties Bay", "Okahandja", "Otjiwarongo", "Keetmanshoop", "Lüderitz"],
  "Nauru": ["Yaren", "Denigomodu", "Meneng", "Aiwo", "Boe", "Anabar"],
  "Nepal": ["Kathmandu", "Pokhara", "Lalitpur", "Bharatpur", "Birgunj", "Biratnagar", "Janakpur", "Ghorahi", "Hetauda", "Butwal"],
  "Netherlands": ["North Holland", "South Holland", "North Brabant", "Gelderland", "Utrecht", "Overijssel", "Limburg", "Friesland", "Groningen", "Drenthe"],
  "New Zealand": ["Auckland", "Wellington", "Christchurch", "Hamilton", "Tauranga", "Lower Hutt", "Dunedin", "Palmerston North", "Napier", "Hibiscus Coast"],
  "Nicaragua": ["Managua", "León", "Masaya", "Tipitapa", "Chinandega", "Matagalpa", "Estelí", "Granada", "Ciudad Sandino", "Puerto Cabezas"],
  "Niger": ["Niamey", "Zinder", "Maradi", "Tahoua", "Agadez", "Arlit", "Dosso", "Diffa"],
  "Nigeria": ["Lagos", "Kano", "Ibadan", "Kaduna", "Port Harcourt", "Benin City", "Maiduguri", "Zaria", "Aba", "Jos", "Abuja", "Enugu"],
  "North Macedonia": ["Skopje", "Bitola", "Kumanovo", "Prilep", "Tetovo", "Veles", "Štip", "Ohrid"],
  "Norway": ["Oslo", "Bergen", "Trondheim", "Stavanger", "Bærum", "Kristiansand", "Drammen", "Asker", "Lillestrøm", "Fredrikstad"],
  "Oman": ["Muscat", "Salalah", "Seeb", "Bawshar", "Sohar", "As Suwayq", "Ibri", "Saham", "Rustaq", "Nizwa"],
  "Pakistan": ["Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan", "Islamabad", "Azad Kashmir", "Gilgit-Baltistan"],
  "Palau": ["Ngerulmud", "Koror", "Airai", "Meyuns", "Kloulklubed"],
  "Palestine": ["Gaza City", "East Jerusalem", "Khan Yunis", "Jabalya", "Hebron", "Nablus", "Rafah", "Tulkarm"],
  "Panama": ["Panama City", "San Miguelito", "Arraiján", "La Chorrera", "David", "Colón", "Las Cumbres", "Pacora"],
  "Papua New Guinea": ["Port Moresby", "Lae", "Arawa", "Mount Hagen", "Popondetta", "Madang", "Kokopo", "Mendi"],
  "Paraguay": ["Asunción", "Ciudad del Este", "Luque", "San Lorenzo", "Capiatá", "Lambaré", "Fernando de la Mora", "Limpio"],
  "Peru": ["Lima", "Arequipa", "Trujillo", "Chiclayo", "Piura", "Iquitos", "Cusco", "Chimbote", "Huancayo", "Tacna"],
  "Philippines": ["Metro Manila", "Cebu", "Davao", "Zamboanga", "Iloilo", "Cagayan de Oro", "Bacolod", "Angeles", "General Santos", "Baguio"],
  "Poland": ["Masovian", "Silesian", "Greater Poland", "Lesser Poland", "Lower Silesian", "Łódź", "Pomeranian", "Lublin", "Subcarpathian", "Kuyavian-Pomeranian"],
  "Portugal": ["Lisbon", "Porto", "Vila Nova de Gaia", "Amadora", "Braga", "Funchal", "Coimbra", "Setúbal", "Agualva-Cacém", "Queluz"],
  "Qatar": ["Doha", "Al Rayyan", "Al Wakrah", "Al Khor", "Al Sheehaniya", "Umm Salal", "Al Daayen", "Madinat ash Shamal"],
  "Romania": ["Bucharest", "Cluj-Napoca", "Timișoara", "Iași", "Constanța", "Craiova", "Brașov", "Galați", "Ploiești", "Oradea"],
  "Russia": ["Moscow", "Saint Petersburg", "Novosibirsk", "Yekaterinburg", "Kazan", "Nizhny Novgorod", "Chelyabinsk", "Samara", "Omsk", "Rostov-on-Don"],
  "Rwanda": ["Kigali", "Butare", "Gisenyi", "Ruhengeri", "Gitarama", "Byumba", "Cyangugu", "Kibungo"],
  "Saint Kitts and Nevis": ["Basseterre", "Fig Tree", "Market Hot Shop", "Saint Paul's", "Middle Island"],
  "Saint Lucia": ["Castries", "Bexon", "Babonneau", "Ciceron", "Dennery", "Gros Islet", "Vieux Fort"],
  "Saint Vincent and the Grenadines": ["Kingstown", "Georgetown", "Byera Village", "Biabou", "Chateaubelair"],
  "Samoa": ["Apia", "Vaitele", "Faleasiu", "Vailele", "Leauvaa"],
  "San Marino": ["City of San Marino", "Serravalle", "Borgo Maggiore", "Domagnano", "Fiorentino"],
  "Sao Tome and Principe": ["São Tomé", "Trindade", "Santana", "Neves", "Santo Amaro"],
  "Saudi Arabia": ["Riyadh", "Jeddah", "Mecca", "Medina", "Sultanah", "Dammam", "Ta'if", "Tabuk", "Al Kharj", "Buraidah"],
  "Senegal": ["Dakar", "Pikine", "Guediawaye", "Touba", "Thiès", "Kaolack", "M'bour", "Saint-Louis"],
  "Serbia": ["Belgrade", "Novi Sad", "Niš", "Kragujevac", "Subotica", "Zrenjanin", "Pančevo", "Čačak"],
  "Seychelles": ["Victoria", "Anse Boileau", "Bel Ombre", "Beau Vallon", "Cascade"],
  "Sierra Leone": ["Freetown", "Kenema", "Bo", "Koidu Town", "Makeni", "Lunsar", "Port Loko"],
  "Singapore": ["Central Region", "East Region", "North Region", "North-East Region", "West Region"],
  "Slovakia": ["Bratislava", "Košice", "Prešov", "Žilina", "Nitra", "Banská Bystrica", "Trnava", "Martin"],
  "Slovenia": ["Ljubljana", "Maribor", "Celje", "Kranj", "Velenje", "Koper", "Novo Mesto", "Ptuj"],
  "Solomon Islands": ["Honiara", "Auki", "Gizo", "Noruo", "Kirakira", "Tulagi"],
  "Somalia": ["Mogadishu", "Hargeisa", "Berbera", "Kismayo", "Bosaso", "Galkayo", "Merca", "Baidoa"],
  "South Africa": ["Gauteng", "KwaZulu-Natal", "Western Cape", "Eastern Cape", "Limpopo", "Mpumalanga", "North West", "Free State", "Northern Cape"],
  "South Sudan": ["Juba", "Winejok", "Malakal", "Yei", "Yambio", "Aweil", "Wau", "Kwajok"],
  "Spain": ["Madrid", "Catalonia", "Andalusia", "Valencian Community", "Galicia", "Castile and León", "Basque Country", "Canary Islands", "Castile-La Mancha", "Murcia"],
  "Sri Lanka": ["Colombo", "Dehiwala-Mount Lavinia", "Moratuwa", "Jaffna", "Negombo", "Pita Kotte", "Kandy", "Trincomalee"],
  "Sudan": ["Khartoum", "Omdurman", "Nyala", "Port Sudan", "Kassala", "El Obied", "Al Qadarif", "Wad Madani"],
  "Suriname": ["Paramaribo", "Lelydorp", "Nieuw Nickerie", "Moengo", "Nieuw Amsterdam", "Mariënburg"],
  "Sweden": ["Stockholm", "Västra Götaland", "Skåne", "Östergötland", "Uppsala", "Jönköping", "Halland", "Örebro", "Södermanland", "Dalarna"],
  "Switzerland": ["Zurich", "Bern", "Vaud", "Aargau", "Saint Gallen", "Geneva", "Lucerne", "Ticino", "Valais", "Fribourg"],
  "Syria": ["Aleppo", "Damascus", "Daraa", "Deir ez-Zor", "Hama", "Al-Hasakah", "Homs", "Idlib", "Latakia", "Quneitra", "Ar-Raqqah", "Rif Dimashq", "As-Suwayda", "Tartus"],
  "Taiwan": ["Taipei", "New Taipei", "Taichung", "Kaohsiung", "Taoyuan", "Tainan", "Hsinchu", "Keelung", "Chiayi", "Changhua"],
  "Tajikistan": ["Dushanbe", "Khujand", "Kulob", "Qurghonteppa", "Istaravshan", "Konibodom", "Vahdat", "Tursunzoda"],
  "Tanzania": ["Dar es Salaam", "Mwanza", "Arusha", "Dodoma", "Mbeya", "Morogoro", "Tanga", "Kahama", "Tabora", "Zanzibar City"],
  "Thailand": ["Bangkok", "Nonthaburi", "Nakhon Ratchasima", "Chiang Mai", "Phuket", "Chon Buri", "Samut Prakan", "Udon Thani", "Hat Yai", "Khon Kaen"],
  "Timor-Leste": ["Dili", "Maliana", "Suai", "Likisá", "Lospalos", "Maubara", "Venilale"],
  "Togo": ["Lomé", "Sokodé", "Kara", "Kpalimé", "Atakpamé", "Bassar", "Tsevie", "Aného"],
  "Tonga": ["Nuku'alofa", "Neiafu", "Haveluloto", "Vaini", "Tofoa-Koloua"],
  "Trinidad and Tobago": ["Chaguanas", "San Fernando", "Port of Spain", "Arima", "Marabella", "Point Fortin", "Tunapuna"],
  "Tunisia": ["Tunis", "Sfax", "Sousse", "Ettadhamen-Mnihla", "Kairouan", "Bizerte", "Gabès", "La Soukra"],
  "Turkey": ["Istanbul", "Ankara", "Izmir", "Bursa", "Antalya", "Adana", "Konya", "Gaziantep", "Mersin", "Kayseri"],
  "Turkmenistan": ["Ashgabat", "Türkmenabat", "Daşoguz", "Mary", "Balkanabat", "Baýramaly", "Türkmenbaşy"],
  "Tuvalu": ["Funafuti", "Asau", "Lolua", "Savave", "Tofulua"],
  "Uganda": ["Kampala", "Nansana", "Kira", "Ssabagabo", "Mbarara", "Mukono", "Gulu", "Lugazi"],
  "Ukraine": ["Kyiv", "Kharkiv", "Odesa", "Dnipro", "Donetsk", "Zaporizhzhia", "Lviv", "Kryvyi Rih", "Mykolaiv", "Mariupol"],
  "United Arab Emirates": ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"],
  "United Kingdom": ["England", "Scotland", "Wales", "Northern Ireland", "London", "South East England", "North West England", "East of England", "West Midlands", "South West England"],
  "USA": ["California", "Texas", "Florida", "New York", "Illinois", "Pennsylvania", "Ohio", "Georgia", "North Carolina", "Michigan", "Washington", "Arizona"],
  "Uruguay": ["Montevideo", "Salto", "Ciudad de la Costa", "Paysandú", "Las Piedras", "Rivera", "Maldonado", "Tacuarembó"],
  "Uzbekistan": ["Tashkent", "Namangan", "Samarkand", "Andijan", "Bukhara", "Nukus", "Qarshi", "Kokand"],
  "Vanuatu": ["Port Vila", "Luganville", "Norsup", "Port-Olry", "Isangel"],
  "Vatican City": ["Vatican City"],
  "Venezuela": ["Caracas", "Maracaibo", "Valencia", "Barquisimeto", "Maracay", "Ciudad Guayana", "Barcelona", "Maturín", "Caracas Metropolitan Area"],
  "Vietnam": ["Ho Chi Minh City", "Hanoi", "Da Nang", "Hai Phong", "Can Tho", "Bien Hoa", "Nha Trang", "Buon Ma Thuot", "Hue", "Vung Tau"],
  "Yemen": ["Sana'a", "Aden", "Taiz", "Al Hudaydah", "Ibb", "Mukalla", "Dhamar", "Amran"],
  "Zambia": ["Lusaka", "Kitwe", "Ndola", "Kabwe", "Chingola", "Mufulira", "Livingstone", "Luanshya"],
  "Zimbabwe": ["Harare", "Bulawayo", "Chitungwiza", "Mutare", "Epworth", "Gweru", "Kwekwe", "Kadoma"]
};

export const INDUSTRIES = [
  "Advertising & Marketing",
  "Agriculture & AgriTech",
  "Automobile & Aviation",
  "Banking & Financial Services",
  "Consulting (Management & Strategy)",
  "Education & EdTech",
  "Energy, Oil & Gas",
  "Government & Public Sector",
  "Healthcare & Health (Hospitals, Clinics, & Pharma)",
  "Hospitality & Tourism",
  "Insurance (InsurTech)",
  "Logistics, Shipping & Supply Chain",
  "Manufacturing & Industrial",
  "Media & Entertainment",
  "Mining & Metals",
  "NGO & Non-Profit",
  "Professional, Technical & Consulting Services",
  "Real Estate & Construction",
  "Retail, FMCG & Consumer Goods",
  "Security & Safety",
  "Sports & Wellness",
  "Technology & Telecommunication"
];

export const JOB_TYPES = [
  "Full-time", "Part-time", "Remote", "Onsite", "Hybrid", "Work-from-home", "Contract", "Volunteer", "Internship", "Temporary"
];

export const EMPLOYMENT_TYPES = [
  "Full-time", "Part-time", "Contract", "Internship", "Volunteering"
];

export const ORGANIZATION_TYPES = [
  "NGO", "Government", "Private"
];

export const JOB_RANKS = [
  "Senior Management", "Middle Level", "Entry Level", "Intern", "Executive"
];

export const DATE_POSTED_OPTIONS = [
  { label: "Any time", value: "all" },
  { label: "Last 24 hours", value: "1" },
  { label: "Last 7 days", value: "7" },
  { label: "Last 30 days", value: "30" }
];

export const JOB_FUNCTIONS = [
  "Engineering", "Design", "Marketing", "Sales", "Operations", "Finance", "HR", "Legal", "Product"
];

export const BENEFITS = [
  "Medical Insurance", "Professional Training", "Travel Allowance", "Paid Holidays", 
  "Professional Subscriptions", "Gym Membership", "Life Insurance", "Study Leave", 
  "Annual Leave", "Pension Plan", "Equity / Stock Options", "Company Car", 
  "Lunch / Meal Allowance", "Clothing Allowance", "Performance Bonuses", 
  "Staff Loans", "Other Benefits", "Relocation Support", "Stock Options", "401(k) / Pension"
];

export const AGE_RANGES = [
  "18-24", "25-34", "35-44", "45-54", "55-64", "65+"
];

export const SENIORITY_LEVELS = [
  "Intern / Entry", "Mid-Level", "Senior / Lead", "Executive / Head"
];

export const SALARY_RANGES = [
  { label: "Any Amount", min: 0 },
  { label: "20,000+", min: 20000 },
  { label: "50,000+", min: 50000 },
  { label: "80,000+", min: 80000 },
  { label: "120,000+", min: 120000 },
  { label: "150,000+", min: 150000 },
  { label: "200,000+", min: 200000 },
  { label: "300,000+", min: 300000 }
];

export const POST_SALARY_RANGES = [
  "20k - 40k",
  "40k - 60k",
  "60k - 80k",
  "80k - 100k",
  "100k - 130k",
  "130k - 160k",
  "160k - 200k",
  "200k - 250k",
  "250k - 300k",
  "300k+"
];

export const GENDER_OPTIONS = ["Male", "Female", "Non-binary", "Prefer not to say"];

export const RACE_OPTIONS = ["Asian", "Black", "Hispanic", "White", "Middle Eastern", "Pacific Islander", "Mixed/Other", "Prefer not to say"];

export const DISABILITY_OPTIONS = [
  "No Disability", "Physical Disability", "Neurodivergent (e.g. ADHD, Autism)", 
  "Hearing/Visual Impairment", "Chronic Illness", "Other Disability", "Prefer not to say"
];

export const RELIGION_OPTIONS = [
  "Atheist/Agnostic", "Buddhism", "Christianity", "Hinduism", "Islam", "Judaism", "Sikhism", "Other", "Prefer not to say"
];

export const MARITAL_STATUS_OPTIONS = ["Single", "Married", "Divorced", "Widowed", "Prefer not to say"];

export const VETERAN_STATUS_OPTIONS = ["Non-Veteran", "Veteran", "Active Duty", "National Guard/Reserve", "Prefer not to say"];

export const COMMON_TITLES = [
  "Senior Software Engineer", "Product Manager", "UI/UX Designer", 
  "Data Scientist", "Marketing Specialist", "Sales Executive",
  "DevOps Engineer", "HR Manager", "Project Manager", "Business Analyst"
];

const now = new Date();
const generatePastDate = (hoursAgo: number) => new Date(now.getTime() - hoursAgo * 60 * 60 * 1000).toISOString();

// Staff Roles Mock
export const STAFF_ACCOUNTS: Record<OperationalRole, UserProfile> = {
  sales_exec: {
    name: 'Sarah Sales',
    idNumber: 'USR-8821',
    email: 'sarah@caliberdesk.ai',
    isAdmin: true,
    opRole: 'sales_exec',
    role: 'Senior Sales Executive',
    city: 'London',
    country: 'UK',
    stealthMode: false,
    profileCompleted: true,
    linkedInConnected: true,
    isSubscribed: true,
    subscriptionTier: 'premium',
    purchaseHistory: [],
    adOptIn: true,
    alerts: [],
    savedJobIds: [],
    autoApplyEnabled: false,
    workHistory: [],
    education: [],
    digitalSkills: [],
    certifications: [],
    hobbies: [],
    projects: [],
    experienceSummary: '10+ years',
    skills: ['Prospecting', 'CRM', 'Closing'],
    profileImages: []
  },
  sales_manager: {
    name: 'Mark Manager',
    idNumber: 'USR-9901',
    email: 'mark@caliberdesk.ai',
    isAdmin: true,
    opRole: 'sales_manager',
    role: 'National Sales Manager',
    city: 'New York',
    country: 'USA',
    stealthMode: false,
    profileCompleted: true,
    linkedInConnected: true,
    isSubscribed: true,
    subscriptionTier: 'premium',
    purchaseHistory: [],
    adOptIn: true,
    alerts: [],
    savedJobIds: [],
    autoApplyEnabled: false,
    workHistory: [],
    education: [],
    digitalSkills: [],
    certifications: [],
    hobbies: [],
    projects: [],
    experienceSummary: '15+ years',
    skills: ['Strategy', 'Leadership', 'Salesforce'],
    profileImages: []
  },
  cs_operator: {
    name: 'Chris Support',
    idNumber: 'USR-1122',
    email: 'chris@caliberdesk.ai',
    isAdmin: true,
    opRole: 'cs_operator',
    role: 'CS Operator',
    city: 'Berlin',
    country: 'Germany',
    stealthMode: false,
    profileCompleted: true,
    linkedInConnected: true,
    isSubscribed: true,
    subscriptionTier: 'premium',
    purchaseHistory: [],
    adOptIn: true,
    alerts: [],
    savedJobIds: [],
    autoApplyEnabled: false,
    workHistory: [],
    education: [],
    digitalSkills: [],
    certifications: [],
    hobbies: [],
    projects: [],
    experienceSummary: '5+ years',
    skills: ['Empathy', 'Ticketing', 'Resolution'],
    profileImages: []
  },
  cs_head: {
    name: 'Helen Head-CS',
    idNumber: 'USR-3344',
    email: 'helen@caliberdesk.ai',
    isAdmin: true,
    opRole: 'cs_head',
    role: 'Head of Customer Service',
    city: 'Toronto',
    country: 'Canada',
    stealthMode: false,
    profileCompleted: true,
    linkedInConnected: true,
    isSubscribed: true,
    subscriptionTier: 'premium',
    purchaseHistory: [],
    adOptIn: true,
    alerts: [],
    savedJobIds: [],
    autoApplyEnabled: false,
    workHistory: [],
    education: [],
    digitalSkills: [],
    certifications: [],
    hobbies: [],
    projects: [],
    experienceSummary: '12+ years',
    skills: ['CSAT', 'NPS', 'Operations'],
    profileImages: []
  },
  recruiter: {
    name: 'Rick Recruiter',
    idNumber: 'USR-5566',
    email: 'rick@caliberdesk.ai',
    isAdmin: true,
    opRole: 'recruiter',
    role: 'Lead Recruiter',
    city: 'Sydney',
    country: 'Australia',
    stealthMode: false,
    profileCompleted: true,
    linkedInConnected: true,
    isSubscribed: true,
    subscriptionTier: 'premium',
    purchaseHistory: [],
    adOptIn: true,
    alerts: [],
    savedJobIds: [],
    autoApplyEnabled: false,
    workHistory: [],
    education: [],
    digitalSkills: [],
    certifications: [],
    hobbies: [],
    projects: [],
    experienceSummary: '8+ years',
    skills: ['Headhunting', 'Screening', 'Talent'],
    profileImages: []
  },
  recruiter_head: {
    name: 'Rachel Head-Rec',
    idNumber: 'USR-7788',
    email: 'rachel@caliberdesk.ai',
    isAdmin: true,
    opRole: 'recruiter_head',
    role: 'Head of Recruitment',
    city: 'Tokyo',
    country: 'Japan',
    stealthMode: false,
    profileCompleted: true,
    linkedInConnected: true,
    isSubscribed: true,
    subscriptionTier: 'premium',
    purchaseHistory: [],
    adOptIn: true,
    alerts: [],
    savedJobIds: [],
    autoApplyEnabled: false,
    workHistory: [],
    education: [],
    digitalSkills: [],
    certifications: [],
    hobbies: [],
    projects: [],
    experienceSummary: '15+ years',
    skills: ['Global Talent', 'Executive Search'],
    profileImages: []
  },
  finance_manager: {
    name: 'Frank Finance',
    idNumber: 'USR-9911',
    email: 'frank@caliberdesk.ai',
    isAdmin: true,
    opRole: 'finance_manager',
    role: 'Finance Manager',
    city: 'Zurich',
    country: 'Switzerland',
    stealthMode: false,
    profileCompleted: true,
    linkedInConnected: true,
    isSubscribed: true,
    subscriptionTier: 'premium',
    purchaseHistory: [],
    adOptIn: true,
    alerts: [],
    savedJobIds: [],
    autoApplyEnabled: false,
    workHistory: [],
    education: [],
    digitalSkills: [],
    certifications: [],
    hobbies: [],
    projects: [],
    experienceSummary: '10+ years',
    skills: ['Audit', 'Accounting', 'Tax'],
    profileImages: []
  },
  finance_head: {
    name: 'Fiona Head-Finance',
    idNumber: 'USR-2233',
    email: 'fiona@caliberdesk.ai',
    isAdmin: true,
    opRole: 'finance_head',
    role: 'Head of Finance',
    city: 'Singapore',
    country: 'Singapore',
    stealthMode: false,
    profileCompleted: true,
    linkedInConnected: true,
    isSubscribed: true,
    subscriptionTier: 'premium',
    purchaseHistory: [],
    adOptIn: true,
    alerts: [],
    savedJobIds: [],
    autoApplyEnabled: false,
    workHistory: [],
    education: [],
    digitalSkills: [],
    certifications: [],
    hobbies: [],
    projects: [],
    experienceSummary: '20+ years',
    skills: ['P&L', 'Equity', 'IPO Readiness'],
    profileImages: []
  },
  super_admin: {
    name: 'Master Admin',
    idNumber: 'USR-0001',
    email: 'admin@caliberdesk.com',
    isAdmin: true,
    opRole: 'super_admin',
    role: 'System Architect',
    city: 'San Francisco',
    country: 'USA',
    stealthMode: false,
    profileCompleted: true,
    linkedInConnected: true,
    isSubscribed: true,
    subscriptionTier: 'premium',
    purchaseHistory: [],
    adOptIn: true,
    alerts: [],
    savedJobIds: [],
    autoApplyEnabled: false,
    workHistory: [],
    education: [],
    digitalSkills: [],
    certifications: [],
    hobbies: [],
    projects: [],
    experienceSummary: '20+ years',
    skills: ['Everything'],
    profileImages: []
  }
};

export const MOCK_CANDIDATES: UserProfile[] = [
  {
    name: 'John Doe',
    idNumber: 'CAN-1001',
    email: 'john.doe@example.com',
    role: 'Software Engineer',
    city: 'London',
    country: 'UK',
    stealthMode: false,
    profileCompleted: true,
    linkedInConnected: true,
    isSubscribed: false,
    subscriptionTier: 'free',
    purchaseHistory: [],
    adOptIn: true,
    alerts: [],
    savedJobIds: [],
    autoApplyEnabled: true,
    workHistory: [],
    education: [],
    digitalSkills: ['React', 'Node.js', 'TypeScript'],
    certifications: [],
    hobbies: [],
    projects: [],
    experienceSummary: '5 years',
    skills: ['Frontend', 'Backend'],
    profileImages: []
  },
  {
    name: 'Jane Smith',
    idNumber: 'CAN-1002',
    email: 'jane.smith@example.com',
    role: 'Product Manager',
    city: 'New York',
    country: 'USA',
    stealthMode: false,
    profileCompleted: true,
    linkedInConnected: true,
    isSubscribed: true,
    subscriptionTier: 'premium',
    purchaseHistory: [],
    adOptIn: true,
    alerts: [],
    savedJobIds: [],
    autoApplyEnabled: false,
    workHistory: [],
    education: [],
    digitalSkills: ['Agile', 'Scrum', 'Product Strategy'],
    certifications: [],
    hobbies: [],
    projects: [],
    experienceSummary: '8 years',
    skills: ['Leadership', 'Strategy'],
    profileImages: []
  },
  {
    name: 'Robert Brown',
    idNumber: 'CAN-1003',
    email: 'robert.brown@example.com',
    role: 'Data Scientist',
    city: 'Berlin',
    country: 'Germany',
    stealthMode: true,
    profileCompleted: true,
    linkedInConnected: false,
    isSubscribed: false,
    subscriptionTier: 'free',
    purchaseHistory: [],
    adOptIn: false,
    alerts: [],
    savedJobIds: [],
    autoApplyEnabled: false,
    workHistory: [],
    education: [],
    digitalSkills: ['Python', 'Machine Learning', 'SQL'],
    certifications: [],
    hobbies: [],
    projects: [],
    experienceSummary: '3 years',
    skills: ['Data Analysis', 'Modeling'],
    profileImages: []
  }
];

export const MOCK_BLOG_POSTS: BlogPost[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    title: 'The Future of Remote Work in 2026',
    content: 'Remote work has evolved significantly over the past few years. In 2026, we are seeing a shift towards more asynchronous communication and AI-driven productivity tools. Companies are no longer just offering "remote" as a perk; it is becoming the standard for global operations. The integration of VR and AR in virtual meetings is making collaboration more immersive than ever before.',
    author: 'Master Admin',
    authorRole: 'System Architect',
    publishedAt: generatePastDate(24),
    imageUrl: 'https://picsum.photos/seed/remote/800/400',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    tags: ['Remote Work', 'Future of Work', 'AI'],
    readTime: '5 min read'
  },
  {
    id: '11111111-1111-1111-1111-111111111112',
    title: 'How to Optimize Your CV for AI-Driven Recruitment',
    content: 'Modern recruitment systems use AI to screen thousands of applications. To stand out, you need to ensure your CV is optimized for these algorithms. This means using clear headings, standard fonts, and strategically placing keywords that match the job description. Avoid complex graphics that might confuse the parser, and focus on quantifiable achievements.',
    author: 'Rick Recruiter',
    authorRole: 'Lead Recruiter',
    publishedAt: generatePastDate(48),
    imageUrl: 'https://picsum.photos/seed/cv/800/400',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    tags: ['CV Tips', 'Recruitment', 'AI'],
    readTime: '8 min read'
  },
  {
    id: '11111111-1111-1111-1111-111111111113',
    title: 'Navigating the Tech Job Market in 2026',
    content: 'The tech landscape is constantly changing. With the rise of specialized AI roles and the consolidation of traditional software engineering, staying relevant requires continuous learning. Focus on building a strong portfolio of real-world projects and demonstrating your ability to adapt to new technologies quickly.',
    author: 'Sarah Sales',
    authorRole: 'Senior Sales Executive',
    publishedAt: generatePastDate(72),
    imageUrl: 'https://picsum.photos/seed/tech/800/400',
    tags: ['Job Market', 'Tech Trends', 'Career Advice'],
    readTime: '6 min read'
  },
  {
    id: '11111111-1111-1111-1111-111111111114',
    title: 'Global Tech Recruitment Summit 2026',
    content: 'Join us for the largest gathering of recruitment professionals and tech leaders. We will discuss the latest trends in AI-driven hiring, diversity in tech, and the future of global talent acquisition. Keynote speakers include industry pioneers from Silicon Valley and beyond.',
    author: 'Rachel Head-Rec',
    authorRole: 'Head of Recruitment',
    publishedAt: generatePastDate(12),
    imageUrl: 'https://picsum.photos/seed/summit/800/400',
    tags: ['Events', 'Recruitment', 'Networking'],
    readTime: 'Event Date: Oct 15, 2026'
  },
  {
    id: '11111111-1111-1111-1111-111111111115',
    title: 'CaliberDesk Expands Operations to Southeast Asia',
    content: 'We are thrilled to announce our expansion into the Southeast Asian market. With new offices in Singapore and Ho Chi Minh City, CaliberDesk is poised to connect top talent with the region\'s booming tech ecosystem. This move marks a significant milestone in our mission to globalize social hiring.',
    author: 'Master Admin',
    authorRole: 'System Architect',
    publishedAt: generatePastDate(5),
    imageUrl: 'https://picsum.photos/seed/expansion/800/400',
    tags: ['Company News', 'Expansion', 'Global'],
    readTime: '3 min read'
  },
  {
    id: '11111111-1111-1111-1111-111111111116',
    title: 'Market Report: The Rise of "Fractional" C-Suite Roles',
    content: 'Our latest market data indicates a 40% increase in demand for fractional executives. Companies are increasingly looking for experienced leaders on a part-time or project basis to navigate complex transitions or scale specific functions without the overhead of a full-time hire.',
    author: 'Fiona Head-Finance',
    authorRole: 'Head of Finance',
    publishedAt: generatePastDate(96),
    imageUrl: 'https://picsum.photos/seed/finance/800/400',
    tags: ['Market Data', 'Executive Search', 'Trends'],
    readTime: '10 min read'
  }
];

export const MOCK_USER: UserProfile = {
  id: '22222222-2222-2222-2222-222222222222',
  idNumber: 'SKR-12345',
  name: 'Kester Djanie',
  isEmployer: false,
  firstName: 'Kester',
  middleName: '',
  lastName: 'Djanie',
  email: 'niidjanie@gmail.com',
  phoneNumbers: ['+233540714441', '+233244123456'],
  whatsapp: '+233540714441',
  linkedinUrl: 'https://linkedin.com/in/kesterdjanie', 
  instagramUrl: 'https://instagram.com/kesterdjanie',
  facebookUrl: 'https://facebook.com/kesterdjanie',
  portfolioUrl: 'https://kesterdjanie.dev', 
  role: 'Commercial, Partnerships & Growth Specialist',
  jobTitle: 'Head of Commercial',
  city: 'Greater Accra',
  country: 'Ghana',
  skills: [
    'Growth Mindset', 'Partnership Negotiations', 'Business Development', 
    'Operational Efficiency', 'Strategic Planning', 'Stakeholder Management', 
    'Policy Appreciation', 'Data Analysis', 'Innovation'
  ],
  shortlistedSkills: ['Innovation'],
  digitalSkills: [
    'SaaS Management', 'Digital Marketing', 'CRM Optimization', 
    'Data Visualization', 'Salesforce', 'Fintech Integration'
  ],
  certifications: [
    'Digital Marketing Certification - Google (2024)'
  ],
  hobbies: [
    'Financial Literacy Mentoring', 'Community Outreach', 'Strategic Chess'
  ],
  languages: ['English', 'French', 'Twi'],
  projects: [
    {
      name: 'Financial Literacy Educator (Junior Achievement)',
      year: '2022',
      description: 'Educated children on financial concepts, money management, and investment basics.'
    },
    {
      name: 'Annual Juvenile Prisons Outreach (SJF Foundation)',
      year: '2022 to date',
      description: 'Coordinated donation drives and provided counseling/life skills workshops for inmates.'
    }
  ],
  experienceSummary: '15+ years',
  bio: 'Seasoned executive specializing in strategic planning and cross-functional team leadership, with a proven track record of driving sustainable revenue growth and operational excellence across global tech and finance sectors.',
  stealthMode: true,
  profileCompleted: true,
  linkedInConnected: true,
  cvName: 'Kester_Djanie_Resume_2025.pdf',
  cvUrl: '#',
  isSubscribed: true,
  subscriptionTier: 'premium',
  purchaseHistory: [
    {
      id: 'TX-KESTER-001',
      date: generatePastDate(48),
      amount: 28,
      item: 'Annual Seeker Premium',
      status: 'completed',
      paymentMethod: 'Mastercard •••• 4242'
    }
  ],
  adOptIn: true,
  alerts: [],
  savedJobIds: [],
  autoApplyEnabled: true,
  joinedDate: generatePastDate(720),
  profileImages: [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Kester1',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Kester2'
  ],
  workHistory: [
    {
      role: 'Head of Commercial',
      company: 'Jobberman Ghana',
      startYear: '2025',
      endYear: '',
      period: 'March 2025 – Present',
      description: 'Overseeing commercial strategy to drive revenue growth and market share expansion.'
    },
    {
      role: 'Head of Operations & Revenue Assurance',
      company: 'Drugnet',
      startYear: '2024',
      endYear: '2025',
      period: 'Nov 2024 – Feb 2025',
      description: 'Led end-to-end operational strategy and revenue assurance initiatives.'
    },
    {
      role: 'Regional Growth Lead, Partnerships & Operations',
      company: 'Bento Africa',
      startYear: '2023',
      endYear: '2025',
      period: '2023 – 2025',
      description: 'Led B2B negotiations across Ghana, Kenya & Nigeria with 30% YoY Growth.'
    }
  ],
  education: [
    {
      degree: 'MSc International Business',
      school: 'University of Ghana',
      year: '2019',
      description: 'Specialized in Global Trade and Strategic Management.'
    },
    {
      degree: 'Bachelor of Business Administration',
      school: 'Valley View University',
      year: '2008',
      description: 'Major in Marketing and Finance.'
    }
  ],
  voluntaryActivities: [
    {
      role: 'Financial Literacy Educator',
      organization: 'Junior Achievement',
      year: '2022',
      description: 'Educated children on financial concepts, money management, and investment basics.'
    },
    {
      role: 'Outreach Coordinator',
      organization: 'SJF Foundation',
      year: '2022 to date',
      description: 'Coordinated donation drives and provided counseling/life skills workshops for inmates.'
    }
  ],
  demographicVisibility: {
    gender: true,
    ageRange: false,
    race: true,
    disabilityStatus: true,
    religion: false,
    maritalStatus: false,
    veteranStatus: true
  },
  notifications: [
    {
      id: 'notif-1',
      title: 'Neural Match 98%',
      message: 'A new high-priority match has been detected for your profile: Senior Growth Lead at TechFlow. The role aligns with your expertise in B2B negotiations and SaaS management.',
      type: 'both',
      category: 'recommendation',
      date: new Date(Date.now() - 86400000).toISOString(),
      isRead: false,
      actionLink: { label: 'View Match', view: 'seeker' }
    },
    {
      id: 'notif-2',
      title: 'Auto-Apply Success',
      message: 'Our AI has successfully submitted your application for "Director of Partnerships" at GlobalLink. You were ranked in the top 5% of candidates.',
      type: 'in-app',
      category: 'auto-apply',
      date: new Date(Date.now() - 172800000).toISOString(),
      isRead: true,
      actionLink: { label: 'Track Application', view: 'seeker-applications' }
    }
  ],
  pendingAssessmentReminders: []
};

export const MOCK_APPLICANTS: UserProfile[] = [
  {
    id: '22222222-2222-2222-2222-222222222223',
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    role: 'Senior AI Engineer',
    city: 'California',
    country: 'USA',
    skills: ['Python', 'TensorFlow', 'Kubernetes'],
    digitalSkills: ['Docker', 'AWS', 'PyTorch'],
    certifications: ['AWS Certified Solutions Architect'],
    hobbies: ['Mountain Biking'],
    projects: [],
    experienceSummary: '8 years',
    stealthMode: false,
    profileCompleted: true,
    linkedInConnected: true,
    isSubscribed: false,
    subscriptionTier: 'free',
    purchaseHistory: [],
    adOptIn: true,
    alerts: [],
    savedJobIds: [],
    autoApplyEnabled: false,
    workHistory: [],
    education: [],
    profileImages: ['https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah']
  },
  {
    id: '22222222-2222-2222-2222-222222222224',
    name: 'Chen Wei',
    email: 'chen.wei@example.com',
    role: 'Product Designer',
    city: 'Berlin',
    country: 'Germany',
    skills: ['Figma', 'User Research', 'Design Systems'],
    digitalSkills: ['Adobe CC', 'Storybook'],
    certifications: ['HCI Certification'],
    hobbies: ['Photography'],
    projects: [],
    experienceSummary: '5 years',
    stealthMode: false,
    profileCompleted: true,
    linkedInConnected: true,
    isSubscribed: true,
    subscriptionTier: 'premium',
    purchaseHistory: [],
    adOptIn: true,
    alerts: [],
    savedJobIds: [],
    autoApplyEnabled: false,
    workHistory: [],
    education: [],
    profileImages: ['https://api.dicebear.com/7.x/avataaars/svg?seed=Chen']
  },
  {
    id: '22222222-2222-2222-2222-222222222225',
    name: 'Kwame Mensah',
    email: 'kwame.m@example.com',
    role: 'Growth Lead',
    city: 'Greater Accra',
    country: 'Ghana',
    skills: ['B2B Sales', 'Market Expansion', 'CRM'],
    digitalSkills: ['Salesforce', 'HubSpot'],
    certifications: ['MBA'],
    hobbies: ['Chess'],
    projects: [],
    experienceSummary: '10 years',
    stealthMode: false,
    profileCompleted: true,
    linkedInConnected: true,
    isSubscribed: false,
    subscriptionTier: 'free',
    purchaseHistory: [],
    adOptIn: true,
    alerts: [],
    savedJobIds: [],
    autoApplyEnabled: true,
    workHistory: [],
    education: [],
    profileImages: ['https://api.dicebear.com/7.x/avataaars/svg?seed=Kwame']
  },
  {
    id: '22222222-2222-2222-2222-222222222226',
    name: 'Elena Rodriguez',
    email: 'elena.r@example.com',
    role: 'Cybersecurity Analyst',
    city: 'Madrid',
    country: 'Spain',
    skills: ['Penetration Testing', 'SIEM', 'Compliance'],
    digitalSkills: ['Kali Linux', 'Splunk'],
    certifications: ['CISSP'],
    hobbies: ['Hiking'],
    projects: [],
    experienceSummary: '6 years',
    stealthMode: false,
    profileCompleted: true,
    linkedInConnected: true,
    isSubscribed: true,
    subscriptionTier: 'premium',
    purchaseHistory: [],
    adOptIn: true,
    alerts: [],
    savedJobIds: [],
    autoApplyEnabled: false,
    workHistory: [],
    education: [],
    profileImages: ['https://api.dicebear.com/7.x/avataaars/svg?seed=Elena']
  }
];

export const MOCK_EMPLOYER: UserProfile = {
  id: '22222222-2222-2222-2222-222222222227',
  idNumber: 'CMP-67890',
  name: 'James Miller',
  email: 'hiring@quantify.ai',
  role: 'CEO & Founding Partner',
  companyName: 'Quantify Systems',
  companyBio: 'Quantify Systems is a leading AI analytics firm specializing in neural network processing and predictive market modeling.',
  industry: 'Artificial Intelligence',
  companySize: '51-200',
  city: 'London',
  country: 'United Kingdom',
  isEmployer: true,
  isVerified: true,
  isSuperUser: true,
  profileCompleted: true,
  stealthMode: false,
  linkedInConnected: true,
  isSubscribed: true,
  subscriptionTier: 'premium',
  purchaseHistory: [],
  adOptIn: true,
  alerts: [],
  savedJobIds: [],
  autoApplyEnabled: false,
  workHistory: [],
  education: [],
  digitalSkills: [],
  certifications: [],
  hobbies: [],
  projects: [],
  experienceSummary: '15+ years',
  skills: ['Leadership', 'AI Strategy', 'Venture Capital'],
  profileImages: ['https://api.dicebear.com/7.x/avataaars/svg?seed=JamesMiller'],
  subUsers: [
    { id: 'sub-1', name: 'Alice Thompson', email: 'alice@quantify.ai', role: 'recruiter', isSuperUser: false, joinedDate: generatePastDate(1200), lastLogin: generatePastDate(12) },
    { id: 'sub-2', name: 'Bob Roberts', email: 'bob@quantify.ai', role: 'viewer', isSuperUser: false, joinedDate: generatePastDate(240), lastLogin: generatePastDate(48) }
  ],
  subsidiaries: [
    { id: 'subs-1', name: 'Quantify Data Labs', industry: 'Big Data', activeJobs: 3, location: 'Dublin, Ireland', joinedDate: generatePastDate(2000) },
    { id: 'subs-2', name: 'Quantify Neural Robotics', industry: 'Hardware', activeJobs: 1, location: 'Austin, USA', joinedDate: generatePastDate(1000) }
  ],
  pendingAssessmentReminders: []
};

export const MOCK_JOBS: Job[] = [
  {
    id: '33333333-3333-3333-3333-333333333333',
    idNumber: 'JOB-001',
    title: 'Lead AI Infrastructure Engineer',
    company: 'Quantify Systems',
    city: 'London',
    country: 'United Kingdom',
    category: 'Formal Jobs',
    location: 'Hybrid',
    allowedCountries: ['Global'],
    salary: '£180k - £240k',
    description: 'We are looking for an elite infrastructure engineer to scale our neural processing clusters.',
    responsibilities: 'Orchestrate high-availability GPU workloads and optimize data pipelines for LLM fine-tuning. Lead architectural reviews for distributed training systems.',
    requirements: '8+ years experience in infrastructure. Masters degree in Computer Science. Expertise in CUDA and Kubernetes.',
    tags: ['AI', 'Infrastructure', 'London', 'Premium'],
    postedAt: generatePastDate(24),
    expiryDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    isPremium: true,
    status: 'active',
    applicationType: 'in-app',
    aptitudeTestId: '44444444-4444-4444-4444-444444444444',
    industry: 'Technology & Telecommunication'
  },
  {
    id: '33333333-3333-3333-3333-333333333334',
    idNumber: 'JOB-002',
    title: 'Regional Head of Growth',
    company: 'FinFlow',
    city: 'Greater Accra',
    country: 'Ghana',
    category: 'Growth & StartUps',
    location: 'Onsite',
    allowedCountries: ['Ghana', 'Nigeria', 'Kenya'],
    salary: 'GH₵90k - GH₵130k',
    description: 'Drive expansion across the West African market for our next-gen payment orchestration platform.',
    responsibilities: 'Execute market entry strategies in West Africa. Build and manage high-performing growth teams. Negotiate B2B partnerships with financial institutions.',
    requirements: '10+ years in Fintech growth. Proven track record in B2B negotiations. Academic background in Business Administration.',
    tags: ['Fintech', 'Growth', 'Accra', 'Regional'],
    postedAt: generatePastDate(48),
    expiryDate: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    applicationType: 'in-app',
    aptitudeTestId: '44444444-4444-4444-4444-444444444445',
    industry: 'Banking & Financial Services'
  },
  {
    id: '33333333-3333-3333-3333-333333333335',
    idNumber: 'JOB-003',
    title: 'Senior Product Designer',
    company: 'Loom Studio',
    city: 'Berlin',
    country: 'Germany',
    category: 'Formal Jobs',
    location: 'Remote',
    allowedCountries: ['Global'],
    salary: '€120k - €160k',
    description: 'Join our award-winning design studio to lead the user experience for next-gen creative tools.',
    responsibilities: 'Lead product design initiatives from concept to delivery. Mentor junior designers and maintain our global design system. Collaborate with engineering on high-fidelity prototypes.',
    requirements: '6+ years in product design. Expert level in Figma. Portfolio demonstrating complex SaaS workflows.',
    tags: ['Design', 'Remote', 'SaaS', 'UI/UX'],
    postedAt: generatePastDate(12),
    expiryDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    isPremium: true,
    status: 'active',
    applicationType: 'in-app',
    industry: 'Advertising & Marketing'
  },
  {
    id: '33333333-3333-3333-3333-333333333336',
    idNumber: 'JOB-004',
    title: 'Full Stack Developer',
    company: 'Nexus AI',
    city: 'California',
    country: 'USA',
    category: 'Growth & StartUps',
    location: 'Hybrid',
    allowedCountries: ['USA', 'Canada'],
    salary: '$150k - $210k',
    description: 'Scale the nexus of artificial intelligence and human interaction at a rapid-growth seed stage startup.',
    responsibilities: 'Build and deploy scalable React/Node.js microservices. Integrate LLM APIs and optimize vector database queries. Participate in agile sprints and peer code reviews.',
    requirements: '4+ years full stack experience. Deep expertise in TypeScript, React, and PostgreSQL. Experience with OpenAI or Anthropic SDKs preferred.',
    tags: ['Node.js', 'React', 'Startup', 'AI'],
    postedAt: generatePastDate(8),
    expiryDate: new Date(now.getTime() + 40 * 24 * 60 * 60 * 1000).toISOString(),
    isQuickHire: true,
    status: 'active',
    applicationType: 'external',
    externalApplyUrl: 'https://nexusai.com/careers/apply',
    industry: 'Technology & Telecommunication'
  }
];

export const MOCK_APPLICATIONS: Application[] = [
  {
    id: '55555555-5555-5555-5555-555555555555',
    jobId: '33333333-3333-3333-3333-333333333333',
    status: 'applied',
    appliedDate: generatePastDate(2),
    candidateProfile: MOCK_APPLICANTS[0],
    statusHistory: [
      { status: 'applied', date: generatePastDate(2) }
    ]
  },
  {
    id: '55555555-5555-5555-5555-555555555556',
    jobId: '33333333-3333-3333-3333-333333333335',
    status: 'shortlisted',
    appliedDate: generatePastDate(10),
    candidateProfile: MOCK_APPLICANTS[1],
    statusHistory: [
      { status: 'applied', date: generatePastDate(10) },
      { status: 'viewed', date: generatePastDate(8) },
      { status: 'shortlisted', date: generatePastDate(5) }
    ]
  },
  {
    id: '55555555-5555-5555-5555-555555555557',
    jobId: '33333333-3333-3333-3333-333333333336',
    status: 'applied',
    appliedDate: generatePastDate(1),
    candidateProfile: MOCK_USER,
    isAutoApplied: true,
    matchScore: 92,
    matchReason: 'Exceptional alignment with full-stack requirements and AI integration expertise.',
    statusHistory: [
      { status: 'applied', date: generatePastDate(1) }
    ],
    reminderSent7d: false
  }
];

export const MOCK_APTITUDE_TESTS: AptitudeTest[] = [
  {
    id: '44444444-4444-4444-4444-444444444444',
    jobId: '33333333-3333-3333-3333-333333333333',
    title: 'Neural Infrastructure Scalability Assessment',
    timeLimit: 10,
    createdAt: generatePastDate(120),
    questions: [
      {
        id: 'ai-q1',
        scenario: "During a peak training cycle for a multi-billion parameter model, your primary H100 cluster reports a thermal throttle on 15% of nodes, causing a synchronized training halt. Stakeholders demand a fix within 20 minutes to prevent a $50k loss in wasted compute time. What is your immediate technical response?",
        options: [
          "Initiate a graceful shutdown of the entire cluster to prevent hardware damage.",
          "Redirect the workload to a secondary A100 cluster in a different region immediately.",
          "Identify the specific thermal threshold breach and adjust the fan speed duty cycle via IPMI for the affected nodes.",
          "Analyze the training checkpoint logs to determine if the halt was necessary before taking action."
        ],
        correctIndex: 2
      }
    ]
  },
  {
    id: '44444444-4444-4444-4444-444444444445',
    jobId: '33333333-3333-3333-3333-333333333334',
    title: 'Regional Growth Strategy Assessment',
    timeLimit: 15,
    createdAt: generatePastDate(60),
    questions: [
      {
        id: 'growth-q1',
        scenario: "You are entering a new market in West Africa where mobile money is the dominant payment method but your platform currently only supports card payments. What is your first priority?",
        options: [
          "Launch with card payments and hope for the best.",
          "Partner with a local payment aggregator to integrate mobile money.",
          "Wait until you have a full local team before launching.",
          "Focus on high-end corporate clients who use cards."
        ],
        correctIndex: 1
      }
    ]
  }
];

export const MOCK_EVENTS: CaliberEvent[] = [
  {
    id: 'event-1',
    title: 'AI in Recruitment: The 2026 Outlook',
    description: 'Join global leaders as we discuss the evolving landscape of AI-driven hiring and how it impacts both employers and job seekers in the next decade.',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    time: '14:00 GMT',
    location: 'Virtual / Zoom',
    organizer: 'CaliberDesk Research',
    imageUrl: 'https://picsum.photos/seed/event1/800/400',
    bookingUrl: 'https://caliberdesk.com/events/ai-outlook',
    type: 'Webinar'
  },
  {
    id: 'event-2',
    title: 'Global Talent Mobility Summit',
    description: 'A deep dive into cross-border recruitment strategies, visa regulations, and the future of remote-first international teams.',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    time: '09:00 GMT',
    location: 'London, UK / Hybrid',
    organizer: 'International HR Forum',
    imageUrl: 'https://picsum.photos/seed/event2/800/400',
    bookingUrl: 'https://caliberdesk.com/events/mobility-summit',
    type: 'Conference'
  },
  {
    id: 'event-3',
    title: 'Executive CV Workshop',
    description: 'Master the art of high-impact CV writing for senior management and executive roles. Direct feedback from top-tier recruiters.',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    time: '18:00 GMT',
    location: 'Virtual / Google Meet',
    organizer: 'CaliberDesk Coaching',
    imageUrl: 'https://picsum.photos/seed/event3/800/400',
    bookingUrl: 'https://caliberdesk.com/events/cv-workshop',
    type: 'Workshop'
  }
];

export const GLOBAL_TRANSACTIONS: Transaction[] = [
  { id: 'TX-8821', userName: 'Kester Djanie', date: generatePastDate(48), item: 'Annual Seeker Premium', amount: 28, status: 'completed', paymentMethod: 'Mastercard' },
  { id: 'TX-9901', userName: 'James Miller', date: generatePastDate(120), item: 'Professional Hire Tier', amount: 500, status: 'completed', paymentMethod: 'Corporate VISA' }
];

export const MOCK_LEADS = [
  { id: 'lead-1', company: 'Solara Energy', stage: 'Negotiation', value: 12000 },
  { id: 'lead-2', company: 'HealthPulse', stage: 'Prospecting', value: 8500 },
  { id: 'lead-3', company: 'BitVault', stage: 'Qualified', value: 4500 }
];

export const MOCK_TICKETS: any[] = [
  {
    id: 'TKT-1001',
    userId: 'user-1',
    userName: 'Kester Djanie',
    subject: 'Cannot access premium features',
    message: 'I paid for premium but the features are still locked.',
    status: 'open',
    priority: 'high',
    category: 'billing',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'TKT-1002',
    userId: 'emp-mock-1',
    userName: 'James Miller',
    subject: 'Job listing approval delay',
    message: 'My job listing has been pending for 24 hours.',
    status: 'in-progress',
    priority: 'medium',
    category: 'account',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'TKT-1003',
    userId: 'applicant-1',
    userName: 'Sarah Jenkins',
    subject: 'Bug in application form',
    message: 'The upload button is not working on mobile.',
    status: 'resolved',
    priority: 'low',
    category: 'technical',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString()
  }
];

export const MOCK_USER_DIRECTORY: UserProfile[] = [
  MOCK_USER,
  MOCK_EMPLOYER,
  ...MOCK_APPLICANTS,
  ...Object.values(STAFF_ACCOUNTS)
];
