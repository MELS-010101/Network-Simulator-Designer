# 🌐 Network Simulator Designer

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.2-blue)](https://reactjs.org/)
[![React Flow](https://img.shields.io/badge/React_Flow-11.10.1-cyan)](https://reactflow.dev/)

## 🇷🇺 Описание / 🇬🇧 Description

**RU:** Профессиональный веб-инструмент для проектирования и тестирования компьютерных сетей с симуляцией кибератак и защитой. Вдохновлён Cisco Packet Tracer.

**EN:** A professional web tool for designing and testing computer networks with cyberattack simulation and protection. Inspired by Cisco Packet Tracer.

---

## ✨ Возможности / Features

### ️ Проектирование сети / Network Design
- **RU:** Drag & Drop — перетаскивайте устройства из библиотеки. 10+ типов устройств (ПК, серверы, маршрутизаторы).
- **EN:** Drag & Drop — drag devices from the library. 10+ device types (PCs, servers, routers).
- **RU:** Визуальные соединения через 4 порта (верх/низ/лево/право).
- **EN:** Visual connections via 4 ports (top/bottom/left/right).

### ⚙️ Настройка оборудования / Configuration
- **RU:** Настройка IP-адресации, маски подсети, шлюза. Создание VLAN на коммутаторах.
- **EN:** Configure IP addressing, subnet mask, gateway. Create VLANs on switches.
- **RU:** Изоляция трафика L2 — устройства в разных VLAN не могут общаться напрямую.
- **EN:** L2 Traffic Isolation — devices in different VLANs cannot communicate directly.

### 🛡️ Кибербезопасность / Cybersecurity
- **RU:** Firewall с топологической проверкой пути. Симуляция атакующего узла (Hacker PC).
- **EN:** Firewall with path topology check. Simulates an attacking node (Hacker PC).
- **RU:** DDoS-атаки и сканирование портов. Анимация взлома (серверы мигают красным).
- **EN:** DDoS attacks and port scanning. Hack animation (servers blink red).

### 💾 Управление проектами / Project Management
- **RU:** Автосохранение в LocalStorage. Экспорт и Импорт схем в JSON.
- **EN:** Auto-save to LocalStorage. Export and Import schemes in JSON.
- **RU:** Системный журнал событий в реальном времени.
- **EN:** Real-time system event log.

---

## 🚀 Быстрый старт / Quick Start

### Установка / Installation

    git clone https://github.com/MELS-010101/Network-Simulator-Designer.git
    cd Network-Simulator-Designer
    npm install

### Запуск / Run

    npm run dev

Откройте / Open: http://localhost:5173

### Сборка / Build

    npm run build

---

## 📖 Руководство пользователя / User Guide

### 1. Добавление устройств / Add Devices
- **RU:** Откройте "Библиотека Устройств". Перетащите устройство на холст.
- **EN:** Open "Device Library". Drag a device onto the canvas.

### 2. Соединение устройств / Connect Devices
- **RU:** Наведите курсор на порт (синий кружок), зажмите ЛКМ и перетащите к другому порту.
- **EN:** Hover over a port (blue circle), hold LMB, and drag to another port.

### 3. Настройка VLAN / VLAN Configuration
- **RU:** Откройте настройки Коммутатора L2 → Добавьте VLAN (ID: 10). В настройках ПК выберите этот VLAN.
- **EN:** Open L2 Switch settings → Add VLAN (ID: 10). In PC settings, select this VLAN.
- **RU:** Важно: Устройства в разных VLAN не пингуются друг друга!
- **EN:** Important: Devices in different VLANs cannot ping each other!

### 4. Симуляция атаки / Attack Simulation
- **RU:** Добавьте Hacker PC и Server. Соедините через Firewall. Нажмите "DDoS Атака".
- **EN:** Add Hacker PC and Server. Connect via Firewall. Click "DDoS Attack".
- **RU:** Если Firewall активен — атака блокируется. Если выключен — сервер взламывается.
- **EN:** If Firewall is active — attack is blocked. If disabled — server is hacked.

---

## 🛠 Технологии / Tech Stack

- **Frontend:** React 18.2 + TypeScript
- **Visualization:** React Flow 11.10.1
- **Build:** Vite 5
- **Styling:** CSS-in-JS (inline styles)
- **Algorithms:** BFS (Pathfinding for Firewall logic)

---

## 📁 Структура проекта / Project Structure

Network-Simulator-Designer/
    public/
        office-plan.png
    src/
        App.jsx
        main.jsx
        components/
            Sidebar.jsx
            DeviceModal.jsx
            HelpModal.jsx
            nodes/
                PcNode.jsx
                ServerNode.jsx
                SwitchNode.jsx
    index.html
    package.json
    README.md

---

## 🔮 Планы развития / Roadmap

- [ ] Поддержка маршрутизаторов (меж-VLAN маршрутизация) / Router support (Inter-VLAN routing)
- [ ] Wi-Fi симуляция / Wi-Fi simulation
- [ ] Экспорт схемы в PNG/PDF / Export to PNG/PDF
- [ ] Готовые шаблоны сетей / Pre-made network templates

---

## 📄 Лицензия / License

Распространяется под лицензией MIT. / Distributed under the MIT License.

## 👤 Автор / Author

**MELS**
GitHub: @MELS-010101
Проект создан как образовательный инструмент. / Project created as an educational tool.

⭐ Добавьте звезду этому репозиторию, если он оказался полезным!

</div>
