# 🌐 Network Simulator Designer

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.2-blue)](https://reactjs.org/)
[![React Flow](https://img.shields.io/badge/React_Flow-11.10.1-cyan)](https://reactflow.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.0-purple)](https://vitejs.dev/)

---

## 📖 Описание / Description

**🇷🇺 RU:** Network Simulator Designer — это профессиональный веб-инструмент для проектирования, моделирования и тестирования компьютерных сетей. Приложение позволяет создавать сетевую инфраструктуру, настраивать VLAN, моделировать кибератаки и проверять системы защиты. Идеально подходит для обучения сетевым технологиям и тестирования концепций безопасности.

**🇬🇧 EN:** Network Simulator Designer is a professional web-based tool for designing, simulating, and testing computer networks. The application allows you to create network infrastructure, configure VLANs, simulate cyberattacks, and test security systems. Perfect for learning network technologies and testing security concepts.

---

##  Скриншот / Screenshot

![Network Simulator Interface](https://i.imgur.com/your-screenshot.png)
*Основной интерфейс симулятора с планом офиса / Main simulator interface with office layout*

---

## ✨ Основные возможности / Key Features

### 🏗️ Проектирование сети / Network Design

**🇷🇺 RU:**
- Интерактивная библиотека устройств с drag-and-drop функциональностью
- Более 10 типов сетевого оборудования:
  - Конечные устройства: ПК, ноутбуки, серверы, принтеры
  - Сетевое оборудование: коммутаторы L2, маршрутизаторы
  - Беспроводные сети: Wi-Fi точки доступа
  - Кибербезопасность: Firewall, Hacker PC
- Визуальное соединение устройств через 4 порта (верх, низ, лево, право)
- Загрузка и использование планов помещений (офисов, зданий)
- Автоматическая маршрутизация соединений

**🇬🇧 EN:**
- Interactive device library with drag-and-drop functionality
- 10+ types of network equipment:
  - End devices: PCs, laptops, servers, printers
  - Network equipment: L2 switches, routers
  - Wireless: Wi-Fi access points
  - Cybersecurity: Firewall, Hacker PC
- Visual device connection via 4 ports (top, bottom, left, right)
- Upload and use floor plans (offices, buildings)
- Automatic connection routing

---

### ⚙️ Настройка оборудования / Device Configuration

**🇷🇺 RU:**
- **IP-адресация:** Ручная и автоматическая (DHCP) настройка IP-адресов, масок подсети, шлюзов
- **VLAN (Virtual LAN):**
  - Создание и управление VLAN на коммутаторах L2
  - Назначение VLAN для конечных устройств
  - Визуальная индикация принадлежности к VLAN
- **Изоляция трафика:** Устройства в разных VLAN не могут обмениваться данными на уровне L2
- **DHCP сервер:** Автоматическая раздача IP-адресов устройствам в сети

**🇬 EN:**
- **IP Addressing:** Manual and automatic (DHCP) configuration of IP addresses, subnet masks, gateways
- **VLAN (Virtual LAN):**
  - Create and manage VLANs on L2 switches
  - Assign VLANs to end devices
  - Visual indication of VLAN membership
- **Traffic Isolation:** Devices in different VLANs cannot communicate at L2 level
- **DHCP Server:** Automatic IP address assignment to network devices

---

### 🛡️ Кибербезопасность / Cybersecurity

**🇷🇺 RU:**
- **Firewall (Межсетевой экран):**
  - Топологическая проверка пути пакетов
  - Блокировка атак только если Firewall находится на пути к цели
  - Включение/выключение защиты в реальном времени
- **Hacker PC (Атакующий узел):**
  - Симуляция злоумышленника в сети
  - Генерация вредоносного трафика
- **DDoS-атаки:**
  - Визуализация атак красными пакетами
  - Массовая отправка пакетов к серверам
- **Сканирование портов:**
  - Проверка открытых портов (22, 80, 443)
  - Оранжевые пакеты сканирования
- **Анимация взлома:**
  - Серверы мигают красным при успешной атаке
  - Статус "COMPROMISED" на взломанных устройствах
  - Возможность восстановления сервера

**🇬 EN:**
- **Firewall:**
  - Topological path checking for packets
  - Blocks attacks only if Firewall is on the path to target
  - Enable/disable protection in real-time
- **Hacker PC:**
  - Simulates an attacker in the network
  - Generates malicious traffic
- **DDoS Attacks:**
  - Visualize attacks with red packets
  - Mass packet sending to servers
- **Port Scanning:**
  - Check open ports (22, 80, 443)
  - Orange scan packets
- **Hack Animation:**
  - Servers blink red on successful attack
  - "COMPROMISED" status on hacked devices
  - Server recovery option

---

### 💾 Управление проектами / Project Management

**🇷🇺 RU:**
- **Автосохранение:** Все изменения автоматически сохраняются в LocalStorage браузера
- **Экспорт:** Скачивание полной схемы сети в формате JSON
- **Импорт:** Загрузка ранее сохраненных проектов
- **Системный журнал:**
  - Отслеживание всех событий в реальном времени
  - Логи подключений, ошибок VLAN, блокировок Firewall
  - Автоматический скролл вниз
- **Сброс данных:** Полная очистка LocalStorage

**🇬🇧 EN:**
- **Auto-save:** All changes automatically saved to browser LocalStorage
- **Export:** Download full network scheme in JSON format
- **Import:** Load previously saved projects
- **System Log:**
  - Track all events in real-time
  - Connection logs, VLAN errors, Firewall blocks
  - Auto-scroll to bottom
- **Reset Data:** Complete LocalStorage cleanup

---

## 🚀 Быстрый старт / Quick Start

### Предварительные требования / Prerequisites

**🇷🇺 RU:**
- Node.js версии 16.x или выше
- npm или yarn

**🇬🇧 EN:**
- Node.js version 16.x or higher
- npm or yarn

### Установка / Installation

    # Клонируйте репозиторий / Clone repository
    git clone https://github.com/MELS-010101/Network-Simulator-Designer.git

    # Перейдите в директорию / Navigate to directory
    cd Network-Simulator-Designer

    # Установите зависимости / Install dependencies
    npm install

### Запуск / Run

    # Запустите сервер разработки / Start development server
    npm run dev

    # Откройте браузер по адресу / Open browser at:
    # http://localhost:5173

### Сборка для продакшена / Build for Production

    # Создайте оптимизированную сборку / Create optimized build
    npm run build

    # Файлы сборки будут в папке dist/
    # Build files will be in dist/ folder

---

## 📖 Подробное руководство / Detailed Guide

### 1. Создание сети / Creating a Network

**🇷 RU:**

**Шаг 1: Добавьте устройства**
1. Откройте панель "Библиотека Устройств" слева
2. Разверните нужную категорию:
   - "Конечные узлы" — ПК, ноутбуки, серверы
   - "Сетевое железо" — коммутаторы, маршрутизаторы
   - "Кибер-безопасность" — Firewall, Hacker PC
3. Кликните на устройство для добавления на холст

**Шаг 2: Соедините устройства**
1. Наведите курсор на любой порт устройства (синий кружок)
2. Зажмите левую кнопку мыши
3. Перетащите линию к порту другого устройства
4. Отпустите кнопку для создания соединения

**Шаг 3: Разместите на плане (опционально)**
1. Нажмите "Загрузить план офиса"
2. Выберите PNG/JPG файл с планировкой
3. Разместите устройства на соответствующих местах

**🇬 EN:**

**Step 1: Add Devices**
1. Open "Device Library" panel on the left
2. Expand desired category:
   - "End Nodes" — PCs, laptops, servers
   - "Network Hardware" — switches, routers
   - "Cybersecurity" — Firewall, Hacker PC
3. Click device to add to canvas

**Step 2: Connect Devices**
1. Hover over any device port (blue circle)
2. Hold left mouse button
3. Drag line to another device's port
4. Release button to create connection

**Step 3: Place on Floor Plan (Optional)**
1. Click "Load Office Plan"
2. Select PNG/JPG floor plan file
3. Place devices in appropriate locations

---

### 2. Настройка VLAN / VLAN Configuration

**🇷🇺 RU:**

**Настройка коммутатора:**
1. Кликните на коммутатор L2 для выделения
2. Нажмите кнопку "Настройки и Терминал"
3. Перейдите во вкладку "VLAN"
4. Добавьте новую VLAN:
   - ID: 10 (или любой номер 1-4094)
   - Name: HR (или любое имя)
5. Нажмите "Сохранить"

**Настройка устройств:**
1. Откройте настройки ПК
2. В поле "VLAN" выберите созданный VLAN (например, 10)
3. Сохраните изменения

**Проверка:**
- Устройства с VLAN 10 могут пинговать друг друга
- Устройства с VLAN 20 НЕ могут пинговать VLAN 10
- Для связи между VLAN нужен маршрутизатор

**🇬 EN:**

**Configure Switch:**
1. Click L2 switch to select
2. Click "Settings and Terminal" button
3. Go to "VLAN" tab
4. Add new VLAN:
   - ID: 10 (or any number 1-4094)
   - Name: HR (or any name)
5. Click "Save"

**Configure Devices:**
1. Open PC settings
2. In "VLAN" field select created VLAN (e.g., 10)
3. Save changes

**Verification:**
- Devices with VLAN 10 can ping each other
- Devices with VLAN 20 CANNOT ping VLAN 10
- Router needed for inter-VLAN communication

---

### 3. Симуляция атаки / Attack Simulation

**🇷🇺 RU:**

**Сценарий: Защита сервера Firewall'ом**

**Подготовка:**
1. Добавьте Hacker PC на холст
2. Добавьте Server (сервер баз данных)
3. Добавьте Firewall между ними
4. Соедините: Hacker → Firewall → Server

**Тест 1: Firewall АКТИВЕН (защита работает)**
1. Откройте настройки Firewall
2. Убедитесь что статус "🟢 АКТИВЕН"
3. Нажмите красную кнопку "DDoS Атака"
4. **Результат:** Красные пакеты летят от хакера
5. Firewall блокирует атаки на пути
6. Сервер остается в безопасности (не краснеет)
7. В журнале: "🛡️ Firewall заблокировал DDoS-пакет"

**Тест 2: Firewall ОТКЛЮЧЕН (уязвимость)**
1. Откройте настройки Firewall
2. Нажмите "ОТКЛЮЧИТЬ" (статус станет 🔴)
3. Нажмите "DDoS Атака" снова
4. **Результат:** Пакеты беспрепятственно долетают
5. Сервер начинает мигать красным
6. Появляется надпись "⚠️ COMPROMISED"
7. В журнале: "🚨 КРИТИЧЕСКАЯ УЯЗВИМОСТЬ! Сервер ЗАРАЖЕН!"

**Восстановление:**
1. Откройте настройки зараженного сервера
2. Нажмите кнопку "🔧 Восстановить сервер"
3. Сервер вернется в нормальное состояние

**🇬 EN:**

**Scenario: Protecting Server with Firewall**

**Preparation:**
1. Add Hacker PC to canvas
2. Add Server (database server)
3. Add Firewall between them
4. Connect: Hacker → Firewall → Server

**Test 1: Firewall ACTIVE (protection works)**
1. Open Firewall settings
2. Ensure status is "🟢 ACTIVE"
3. Click red "DDoS Attack" button
4. **Result:** Red packets fly from hacker
5. Firewall blocks attacks on the path
6. Server stays safe (doesn't turn red)
7. In log: "🛡️ Firewall blocked DDoS packet"

**Test 2: Firewall DISABLED (vulnerability)**
1. Open Firewall settings
2. Click "DISABLE" (status becomes 🔴)
3. Click "DDoS Attack" again
4. **Result:** Packets reach freely
5. Server starts blinking red
6. "⚠️ COMPROMISED" label appears
7. In log: "🚨 CRITICAL VULNERABILITY! Server HACKED!"

**Recovery:**
1. Open compromised server settings
2. Click "🔧 Recover Server" button
3. Server returns to normal state

---

## 🛠 Технологии / Technologies

**🇷 RU:**
- **Frontend Framework:** React 18.2 с хуками
- **Визуализация:** React Flow 11.10.1 (нодовый редактор)
- **Сборка:** Vite 5 (быстрая сборка и HMR)
- **Язык:** JavaScript (ES6+)
- **Стили:** CSS-in-JS (inline стили)
- **Алгоритмы:** BFS (поиск пути для Firewall)
- **Хранение:** LocalStorage API
- **Иконки:** Emoji + inline SVG

**🇬 EN:**
- **Frontend Framework:** React 18.2 with hooks
- **Visualization:** React Flow 11.10.1 (node editor)
- **Build:** Vite 5 (fast build and HMR)
- **Language:** JavaScript (ES6+)
- **Styling:** CSS-in-JS (inline styles)
- **Algorithms:** BFS (pathfinding for Firewall)
- **Storage:** LocalStorage API
- **Icons:** Emoji + inline SVG

---

## 📁 Структура проекта / Project Structure

Network-Simulator-Designer/
├── public/
│   └── office-plan.png          # Пример плана офиса / Example floor plan
├── src/
│   ├── App.jsx                  # Основной компонент приложения / Main app component
│   ├── main.jsx                 # Точка входа / Entry point
│   ├── index.css                # Глобальные стили / Global styles
│   │
│   ├── components/
│   │   ├── Sidebar.jsx          # Боковая панель / Sidebar panel
│   │   ├── DeviceModal.jsx      # Модальное окно настроек / Settings modal
│   │   ├── HelpModal.jsx        # Справка и инструкция / Help modal
│   │   ├── SystemLog.jsx        # Системный журнал / System log
│   │   │
│   │   └── nodes/
│   │       ├── PcNode.jsx       # Компонент ПК / PC node
│   │       ├── LaptopNode.jsx   # Компонент ноутбука / Laptop node
│   │       ├── ServerNode.jsx   # Компонент сервера / Server node
│   │       ├── SwitchNode.jsx   # Компонент коммутатора / Switch node
│   │       ├── RouterNode.jsx   # Компонент маршрутизатора / Router node
│   │       ├── PrinterNode.jsx  # Компонент принтера / Printer node
│   │       ├── WifiNode.jsx     # Компонент Wi-Fi точки / WiFi node
│   │       ├── HackerNode.jsx   # Компонент хакера / Hacker node
│   │       └── FirewallNode.jsx # Компонент Firewall / Firewall node
│   │
│   └── utils/
│       ├── networkLogic.js      # Логика сети (VLAN, пинг) / Network logic
│       ├── attackSimulation.js  # Симуляция атак / Attack simulation
│       └── storage.js           # Работа с LocalStorage / LocalStorage utils
│
├── index.html                   # HTML шаблон / HTML template
├── package.json                 # Зависимости и скрипты / Dependencies & scripts
├── vite.config.js              # Конфигурация Vite / Vite config
└── README.md                   # Документация / Documentation

---


## 🤝 Вклад / Contributing

**🇷 RU:**

Мы приветствуем вклад в развитие проекта! Если вы нашли ошибку или хотите добавить новую функцию:

1. **Сообщите об ошибке:** Откройте Issue с описанием проблемы
2. **Предложите улучшение:** Создайте Feature Request
3. **Сделайте Fork:** Создайте форк репозитория
4. **Создайте ветку:** `git checkout -b feature/YourFeature`
5. **Внесите изменения:** Сделайте коммиты с понятными сообщениями
6. **Отправьте:** `git push origin feature/YourFeature`
7. **Создайте PR:** Откройте Pull Request с описанием изменений

**🇬 EN:**

We welcome contributions to the project! If you found a bug or want to add a new feature:

1. **Report a bug:** Open an Issue with problem description
2. **Suggest enhancement:** Create a Feature Request
3. **Fork:** Create a fork of repository
4. **Create branch:** `git checkout -b feature/YourFeature`
5. **Make changes:** Commit with clear messages
6. **Push:** `git push origin feature/YourFeature`
7. **Create PR:** Open Pull Request with changes description

---

## 📄 Лицензия / License

**🇷🇺 RU:** Распространяется под лицензией MIT. См. файл LICENSE для деталей.

**🇬🇧 EN:** Distributed under the MIT License. See LICENSE file for details.

---

## 👤 Автор / Author

**MELS**
- GitHub: https://github.com/MELS-010101

**🇷🇺 RU:** Проект создан как образовательный инструмент для изучения сетевых технологий и кибербезопасности.

**🇬🇧 EN:** Project created as an educational tool for learning network technologies and cybersecurity.

---

## 🙏 Благодарности / Acknowledgments

**🇷🇺 RU:**
- React Flow — отличная библиотека для создания нодовых интерфейсов
- Cisco Packet Tracer — источник вдохновения
- Vite — за молниеносную сборку
- Сообществу React за поддержку

**🇬🇧 EN:**
- React Flow — excellent library for node-based interfaces
- Cisco Packet Tracer — inspiration source
- Vite — for lightning-fast builds
- React community for support

---

## 📞 Контакты / Contact

**🇷🇺 RU:** Если у вас есть вопросы или предложения, создайте Issue в репозитории или напишите напрямую.

**🇬🇧 EN:** If you have questions or suggestions, create an Issue in repository or contact directly.

---

<div align="center">

### 🌟 Network Simulator Designer

**Made with ❤️ using React & Vite**

⭐ **Поставьте звезду на GitHub, если проект полезен!** ⭐

**🇷🇺 Сделано в России | 🇬🇧 Made in Russia**

---

[![GitHub stars](https://img.shields.io/github/stars/MELS-010101/Network-Simulator-Designer?style=social)](https://github.com/MELS-010101/Network-Simulator-Designer/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/MELS-010101/Network-Simulator-Designer?style=social)](https://github.com/MELS-010101/Network-Simulator-Designer/network/members)
[![GitHub issues](https://img.shields.io/github/issues/MELS-010101/Network-Simulator-Designer)](https://github.com/MELS-010101/Network-Simulator-Designer/issues)

</div>

