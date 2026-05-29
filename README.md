# 🌐 Interactive Office Network Simulator & Designer
## Интерактивный симулятор и проектировщик офисных сетей

[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
[![React Flow](https://img.shields.io/badge/React_Flow-^11.10.1-orange)](https://reactflow.dev/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

**EN:** A powerful web-based network simulation tool inspired by Cisco Packet Tracer. Design, configure, and test office networks directly in your browser with a modern dark UI.

**RU:** Мощный веб-инструмент для симуляции сетей, вдохновленный Cisco Packet Tracer. Проектируйте, настраивайте и тестируйте офисные сети прямо в браузере с современным темным интерфейсом.

---

## ✨ Features / Возможности

### 🇬🇧 English
- **Drag & Drop Devices**: Add PCs, laptops, servers, printers, switches, routers, and Wi-Fi access points to the canvas
- **Real-time Configuration**: Configure IP addresses, subnet masks, gateways, VLANs, and router interfaces via modal dialogs
- **Visual Connections**: Create network links with color-coded status (green = active, red = inactive)
- **Packet Animation**: Watch data packets travel between devices when running ping commands
- **Network Groups**: Organize devices into visual zones (e.g., "Accounting", "Server Room", "Sales Department")
- **System Log**: Real-time event logging showing ARP requests, packet forwarding, and ping results
- **Modern Dark Theme**: Professional graphite/charcoal color scheme with dot grid background
- **Built with React Flow**: Smooth interactions and professional node-based interface

### 🇷🇺 Русский
- **Перетаскивание устройств**: Добавляйте ПК, ноутбуки, серверы, принтеры, коммутаторы, маршрутизаторы и точки доступа Wi-Fi на холст
- **Настройка в реальном времени**: Настраивайте IP-адреса, маски подсети, шлюзы, VLAN и интерфейсы маршрутизаторов через модальные окна
- **Визуальные соединения**: Создавайте сетевые связи с цветовой индикацией статуса (зеленый = активно, красный = неактивно)
- **Анимация пакетов**: Наблюдайте за перемещением пакетов данных между устройствами при выполнении команд ping
- **Группировка устройств**: Организуйте устройства в визуальные зоны (например, "Бухгалтерия", "Серверная", "Отдел продаж")
- **Системный журнал**: Журнал событий в реальном времени с отображением ARP-запросов, перенаправления пакетов и результатов ping
- **Современная темная тема**: Профессиональная цветовая схема в оттенках графита и угля с фоновой точечной сеткой
- **На базе React Flow**: Плавные взаимодействия и профессиональный интерфейс на основе узлов

---

## 🚀 Quick Start / Быстрый старт

### Prerequisites / Требования
- Node.js 16+ 
- npm or yarn

### Installation / Установка

```bash
# Clone the repository / Клонировать репозиторий
git clone https://github.com/yourusername/network-simulator.git

# Navigate to project directory / Перейти в директорию проекта
cd network-simulator

# Install dependencies / Установить зависимости
npm install

# Start development server / Запустить сервер разработки
npm run dev

# Build for production / Сборка для продакшена
npm run build

# Preview production build / Предпросмотр продакшен сборки
npm run preview
```

The application will open at `http://localhost:5173` (Vite default) or check the terminal for the actual URL.

Приложение откроется по адресу `http://localhost:5173` (по умолчанию Vite) или проверьте терминал для фактического URL.

---

## 📖 How to Use / Как использовать

### 🇬🇧 English

#### 1. Add Devices
- Select a device from the right sidebar ("Добавить устройства")
- Drag it onto the canvas or click to place it
- Available devices: PC, Laptop, Printer, Server, Switch (L2), Router, Wi-Fi Access Point

#### 2. Connect Devices
- Hover over a device to see connection ports (pins)
- Click and drag from one port to another to create a connection
- Green lines indicate active links, red lines indicate inactive/disabled ports

#### 3. Configure Devices
- Click on any device on the canvas to open its configuration modal
- **PC/Server**: Set IP address, subnet mask, default gateway
- **Switch**: Configure VLANs (add VLAN ID and name)
- **Router**: Configure interface status (On/Off) and IP addresses per port

#### 4. Test Connectivity
- Open a PC/Server configuration modal
- Go to the "Терминал" (Terminal) tab
- Enter `ping [IP_address]` command (e.g., `ping 192.168.1.1`)
- Watch the animated packet travel through the network
- Check the system log at the bottom for detailed step-by-step messages

#### 5. Create Network Zones
- Use the "Архитектура (Группы)" section in the sidebar
- Add group containers to organize devices by departments or rooms
- Customize group names and arrange devices inside groups
- Groups have semi-transparent backgrounds for clear visual organization

### 🇷🇺 Русский

#### 1. Добавление устройств
- Выберите устройство в правой панели ("Добавить устройства")
- Перетащите его на холст или кликните для размещения
- Доступные устройства: ПК, Ноутбук, Принтер, Сервер, Коммутатор (L2), Маршрутизатор, Точка доступа Wi-Fi

#### 2. Подключение устройств
- Наведите курсор на устройство, чтобы увидеть порты подключения (пины)
- Нажмите и перетащите от одного порта к другому для создания соединения
- Зеленые линии означают активные связи, красные — неактивные/отключенные порты

#### 3. Настройка устройств
- Кликните на любое устройство на холсте, чтобы открыть окно настроек
- **ПК/Сервер**: Укажите IP-адрес, маску подсети, основной шлюз
- **Коммутатор**: Настройте VLAN (добавьте ID и имя VLAN)
- **Маршрутизатор**: Настройте статус интерфейсов (Вкл/Выкл) и IP-адреса для каждого порта

#### 4. Тестирование connectivity
- Откройте окно настроек ПК/Сервера
- Перейдите на вкладку "Терминал"
- Введите команду `ping [IP_адрес]` (например, `ping 192.168.1.1`)
- Наблюдайте за анимацией движения пакета через сеть
- Проверьте системный журнал внизу для подробных пошаговых сообщений

#### 5. Создание сетевых зон
- Используйте раздел "Архитектура (Группы)" в боковой панели
- Добавляйте контейнеры групп для организации устройств по отделам или комнатам
- Настраивайте названия групп и размещайте устройства внутри них
- Группы имеют полупрозрачный фон для четкой визуальной организации

---

## 🎨 Interface Overview / Обзор интерфейса

```
┌─────────────────────────────────────┬──────────────────────┐
│                                     │  📦 Добавить        │
│         WORKSPACE (CANVAS)          │     устройства      │
│                                     │                      │
│   [PC] ---- [Switch] ---- [Router]  │  🔧 Инструменты     │
│    |                    |           │                      │
│   [Laptop]            [Server]      │  🏢 Архитектура     │
│                                     │    (Группы)         │
│                                     │                      │
│  ┌───────────────────────────────┐  │                      │
│  │  📋 СИСТЕМНЫЙ ЖУРНАЛ          │  │                      │
│  │  • ПК-1 отправляет ARP...     │  │                      │
│  │  • Switch перенаправляет...   │  │                      │
│  │  • Успешный ответ от...       │  │                      │
│  └───────────────────────────────┘  │                      │
└─────────────────────────────────────┴──────────────────────┘
```

---

## 🛠️ Tech Stack / Технологии

- **Frontend Framework**: React 18.2
- **Node-based Library**: React Flow v11.10.1
- **Styling**: Inline styles with CSS-in-JS approach
- **State Management**: React Hooks (useState, useCallback, useMemo)
- **Build Tool**: Vite 5
- **Language**: JavaScript (ES6+), ES Modules

---

## 📸 Screenshots / Скриншоты

> *Add your screenshots here showing:*
> - Main workspace with connected devices
> - Device configuration modal
> - Packet animation during ping command
> - Grouped devices in network zones
> - System log with network events

> *Добавьте ваши скриншоты здесь, показывающие:*
> - Основную рабочую область с подключенными устройствами
> - Модальное окно настройки устройства
> - Анимацию пакетов во время выполнения команды ping
> - Сгруппированные устройства в сетевых зонах
> - Системный журнал с сетевыми событиями

---

## 🤝 Contributing / Вклад

Contributions are welcome! Please feel free to submit a Pull Request.

Вклад приветствуется! Не стесняйтесь отправлять Pull Request.

1. Fork the project / Форкните проект
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License / Лицензия

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Этот проект лицензирован под лицензией MIT - подробности см. в файле [LICENSE](LICENSE).

---

## 👨‍💻 Author / Автор

**Your Name**  
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

---

## 🙏 Acknowledgments / Благодарности

- [React Flow](https://reactflow.dev/) - Amazing node-based library
- [Cisco Packet Tracer](https://www.netacad.com/courses/packet-tracer) - Inspiration for this project
- React Community for excellent documentation and support

---

<div align="center">

**Made with ❤️ using React**

⭐ Star this repo if you find it helpful!

**Сделано с ❤️ используя React**

⭐ Добавьте звезду этому репозиторию, если он оказался полезным!

</div>
