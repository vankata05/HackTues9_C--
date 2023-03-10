# HackTues9_C--
HackTUES 9 

PetSafe 

Документация 

1. Проблем 

Домашните любимци на различни хора могат да се загубят и ако това стане е трудно да се намерят след това. 

2. Аудитория 

Хората с домашни любимци, особено тези с по-игриви кучета, които могат да избягат или просто за всички хора, които искат да имат сигурност за личните си вещи. 

3. Решение 

Тракер, който да може да се постави върху домашния любимец и стопанинът му да може да влезе в уебсайт, където да може да види локацията на животното. Също, до координатите трябва да има достъп само стопанинът. Така, ако избяга животното, може да се отвори уебсайта и да се види къде е домашния любимец. 
Този тракер може да се използва не само за животни, но и за автомобили, както и други обекти, които може да бъдат загубени или откраднати (например скъпа техника). 

4. Разделение на работа и соринтове 

4.1. MVP 

Хардуер: 
- Тракер, който да може да изпраща координати на Хелиум посредством модул (+код). 

Софтуер: 
- Уебсайт, в който потребител да може да се регистрира посредством потребителско име и парола.
- Интерфейс на сайта, който да позволява регистриране и влизане в съществуващ акаунт.
- При регистриране да се изпраща 6-цифрен код за потвърждаване. 

Време: ~7 часа 

4.2. Втора итерация 
Хардуер: 
- Хелиум, който да се свързва през Интернет с уебсайта. 

Софтуер: 
- Уебсайта да получава координати от тракера и да изобразява карта, на която да се показва точка, където се намира тракера и съответно обекта на издирване. 
- Да се поддържа система за плащане от потребителите на основа на това колко са използвали тракера. 
- Да може един потребител да има няколко тракера (няколко тракера към един потребител) и да може да се изобразяват на картата като различни точки. 
- До се проверява дали потребителя е влязъл в акаунта си, когато се опитва да достъпи картата и ако не е - да се отвори екран за регистриране/вход. 
- Криптирана връзка (SSL сертификат).
- Сесии, затрудняващи кражбата на идентичност. 
- Хубаво е да има хеширане 

Време: До 22:00 на втория ден 

4.3. Трета итерация 

- Да има мобилно приложение, което да предоставя същите функционалности като уебсайта (поддържане на система за потребители, изобразяване на карта с тракерите, система за плащене, улеснена навигация през приложението). 

Време: Каквото остане 

5. Използвани технологии 

- Хардуер: Raspberry, защото го имахме и е по-бърз от ардуино, LoRa WAN за мрежа от LoRa у-ва, трябва за свързване към мрежа, Helium е мрежата на LoRa WAN, LoRa - вид безжична комуникация, UART за физическо свързване на компоненти. 

- Front-end Софтуер: HTML за основната част на сайта, CSS за дизайн, JavaScript, Krita за обработване на изображения  

- Back-end Софтуер: Node js и MongoDB, защото е често използван и достъпен начин за връзка между уебсайт и база данни.
