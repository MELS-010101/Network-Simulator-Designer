import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

// ==================== СТИЛИ ====================
const customCSS = `
  .react-flow__edge-path.animated-request {
    stroke-dasharray: 8;
    animation: dash 1s linear infinite;
    stroke-width: 3px;
    stroke: #3b82f6;
    filter: drop-shadow(0 0 6px #3b82f6);
  }
  .react-flow__edge-path.animated-reply {
    stroke-dasharray: 8;
    animation: dash 1s linear infinite;
    stroke-width: 3px;
    stroke: #22c55e;
    filter: drop-shadow(0 0 6px #22c55e);
  }
  .react-flow__edge-path.animated-error {
    stroke-dasharray: 8;
    animation: dash 0.5s linear infinite;
    stroke-width: 3px;
    stroke: #ef4444;
    filter: drop-shadow(0 0 8px #ef4444);
  }
  @keyframes dash {
    from { stroke-dashoffset: 16; }
    to { stroke-dashoffset: 0; }
  }
  @keyframes pulseRed {
    0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
    70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
    100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
  }
  @keyframes explode {
    0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
    100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
  }
  .modal-overlay {
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    background: rgba(0, 0, 0, 0.6);
    display: flex; justify-content: center; align-items: center;
    z-index: 9999;
  }
  /* Accordion animations */
  .accordion-content {
    overflow: hidden;
    transition: max-height 0.3s ease-out;
  }
`;

const styles = {
  // ГЛАВНЫЙ КОНТЕЙНЕР - во весь экран с Flexbox
  container: {
    display: 'flex',
    flexDirection: 'row',
    width: '100vw',
    height: '100vh',
    background: '#1a1a2e',
    color: '#eee',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    overflow: 'hidden',
  },
  // РАБОЧАЯ ОБЛАСТЬ (левая часть) - содержит холст и журнал
  workspace: {
    flex: 1,
    position: 'relative',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    background: '#16213e',
    backgroundImage: 'radial-gradient(#4a5568 1px, transparent 1px)',
    backgroundSize: '20px 20px',
  },
  // ХОЛСТ С КАРТОЙ - прижат в левый верхний угол
  canvas: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative',
    marginTop: '24px',
    marginLeft: '24px',
  },
  canvasWithPlan: {
    flex: 1,
    position: 'relative',
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  },
  // СИСТЕМНЫЙ ЖУРНАЛ - плавающий по центру внизу
  logPanel: {
    position: 'absolute',
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '600px',
    maxWidth: '90%',
    zIndex: 10,
    backgroundColor: 'rgba(26, 31, 44, 0.95)',
    border: '1px solid #2d3548',
    borderRadius: '8px',
    padding: '12px',
    textAlign: 'center',
    boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
    pointerEvents: 'auto',
    fontFamily: 'monospace',
    fontSize: '12px',
    color: '#a0aec0',
  },
  logTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#63b3ed',
    marginBottom: '10px',
  },
  logEntry: {
    fontSize: '12px',
    color: '#a0aec0',
    marginBottom: '5px',
    fontFamily: 'monospace',
  },
  // ПРАВАЯ ПАНЕЛЬ (Сайдбар) - Modern Pro Tool Style
  sidebar: {
    width: '300px',
    height: '100%',
    backgroundColor: '#111827',
    borderLeft: '1px solid #374151',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    zIndex: 5,
    overflow: 'hidden',
  },
  // Верхняя зона - скроллируемая библиотека устройств
  sidebarTop: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  // Средняя зона - панель действий
  sidebarMiddle: {
    padding: '16px',
    borderTop: '1px solid #374151',
    borderBottom: '1px solid #374151',
    background: '#111827',
  },
  // Нижняя зона - sticky footer со статистикой
  sidebarFooter: {
    padding: '12px 16px',
    background: '#0f172a',
    borderTop: '1px solid #374151',
    fontSize: '12px',
    color: '#6b7280',
  },
  sidebarTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#f9fafb',
    marginBottom: '4px',
    letterSpacing: '0.5px',
  },
  section: {
    background: '#1f2937',
    borderRadius: '8px',
    padding: '12px',
    border: '1px solid #374151',
    marginBottom: '12px',
  },
  sectionTitle: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#9ca3af',
    marginBottom: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  // Аккордеон заголовок
  accordionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 12px',
    background: '#1f2937',
    border: '1px solid #374151',
    borderRadius: '8px',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'all 0.2s',
  },
  accordionHeaderHover: {
    background: '#374151',
    borderColor: '#4b5563',
  },
  accordionTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#e5e7eb',
  },
  accordionIcon: {
    fontSize: '10px',
    color: '#9ca3af',
  },
  // Кнопка устройства внутри аккордеона
  deviceButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    padding: '10px 12px',
    background: '#1f2937',
    border: '1px solid #374151',
    borderRadius: '8px',
    color: '#e5e7eb',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: '12px',
    fontWeight: '500',
    marginBottom: '6px',
  },
  deviceButtonHover: {
    background: '#374151',
    borderColor: '#4b5563',
  },
  icon: {
    fontSize: '16px',
  },
  // Кнопки действий
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '10px 14px',
    background: '#1f2937',
    border: '1px solid #374151',
    borderRadius: '8px',
    color: '#e5e7eb',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '8px',
  },
  actionButtonGreen: {
    borderColor: '#22c55e',
    color: '#22c55e',
  },
  actionButtonGreenHover: {
    background: '#22c55e',
    color: '#fff',
  },
  actionButtonRed: {
    borderColor: '#ef4444',
    color: '#ef4444',
  },
  actionButtonRedHover: {
    background: '#ef4444',
    color: '#fff',
  },
  actionButtonOrange: {
    borderColor: '#f97316',
    color: '#f97316',
  },
  actionButtonOrangeHover: {
    background: '#f97316',
    color: '#fff',
  },
  actionButtonBlue: {
    borderColor: '#3b82f6',
    color: '#3b82f6',
  },
  actionButtonBlueHover: {
    background: '#3b82f6',
    color: '#fff',
  },
  actionButtonDangerOutline: {
    borderColor: '#7f1d1d',
    color: '#f87171',
  },
  actionButtonDangerOutlineHover: {
    background: '#7f1d1d',
    color: '#fff',
  },
  launchButtonDisabled: {
    background: '#374151',
    borderColor: '#4b5563',
    color: '#9ca3af',
    cursor: 'not-allowed',
  },
  attackButton: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '12px',
    marginBottom: '8px',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  attackButtonDDoS: {
    background: 'linear-gradient(135deg, #dc2626, #991b1b)',
    color: '#fff',
    border: '1px solid #ef4444',
  },
  attackButtonDDoSHover: {
    background: 'linear-gradient(135deg, #b91c1c, #7f1d1d)',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
  },
  attackButtonScan: {
    background: 'linear-gradient(135deg, #ea580c, #9a3412)',
    color: '#fff',
    border: '1px solid #f97316',
  },
  attackButtonScanHover: {
    background: 'linear-gradient(135deg, #c2410c, #7c2d12)',
    boxShadow: '0 4px 12px rgba(249, 115, 22, 0.4)',
  },
  divider: {
    height: '1px',
    background: '#374151',
    margin: '12px 0',
  },
  sectionLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#f59e0b',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statValue: {
    color: '#9ca3af',
    fontWeight: '500',
  },
  logContainer: {
    position: 'absolute',
    bottom: '0',
    left: '0',
    right: '0',
    height: '150px',
    background: 'rgba(15, 15, 26, 0.95)',
    borderTop: '2px solid #4a5568',
    padding: '15px',
    overflowY: 'auto',
    zIndex: 1000,
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },
  modalContent: {
    background: '#1a1a2e',
    borderRadius: '12px',
    padding: '25px',
    width: '500px',
    maxWidth: '90%',
    border: '1px solid #4a5568',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: '20px',
  },
  tabContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    borderBottom: '1px solid #2d3748',
    paddingBottom: '10px',
  },
  tab: {
    padding: '8px 16px',
    background: '#2d3748',
    border: 'none',
    borderRadius: '6px',
    color: '#a0aec0',
    cursor: 'pointer',
    fontSize: '14px',
  },
  tabActive: {
    background: '#4a5568',
    color: '#fff',
  },
  formGroup: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    color: '#a0aec0',
    marginBottom: '5px',
  },
  input: {
    width: '100%',
    padding: '10px',
    background: '#2d3748',
    border: '1px solid #4a5568',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '14px',
  },
  button: {
    padding: '10px 20px',
    background: '#4299e1',
    border: 'none',
    borderRadius: '6px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    marginRight: '10px',
  },
  buttonDanger: {
    background: '#e53e3e',
  },
  terminal: {
    background: '#000',
    borderRadius: '6px',
    padding: '15px',
    fontFamily: 'monospace',
    fontSize: '13px',
    color: '#48bb78',
    minHeight: '150px',
    marginBottom: '15px',
  },
  terminalWindow: {
    background: '#0d1117',
    borderRadius: '8px',
    border: '1px solid #30363d',
    padding: '15px',
    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
    fontSize: '13px',
    color: '#48bb78',
    minHeight: '250px',
    maxHeight: '350px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  terminalOutput: {
    flex: 1,
    overflowY: 'auto',
    marginBottom: '10px',
    lineHeight: '1.5',
  },
  terminalInputLine: {
    display: 'flex',
    alignItems: 'center',
    borderTop: '1px solid #30363d',
    paddingTop: '10px',
  },
  terminalPrompt: {
    color: '#48bb78',
    fontWeight: 'bold',
    marginRight: '8px',
    whiteSpace: 'nowrap',
  },
  terminalInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
    fontSize: '13px',
    outline: 'none',
  },
  modalContentNew: {
    background: '#1a1f2c',
    borderRadius: '12px',
    padding: '0',
    width: '600px',
    maxWidth: '90%',
    border: '1px solid #2d3548',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
    overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 25px',
    borderBottom: '1px solid #2d3548',
    background: '#161b22',
  },
  closeButtonX: {
    background: 'transparent',
    border: 'none',
    color: '#a0aec0',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '5px 10px',
    borderRadius: '4px',
    transition: 'all 0.2s',
  },
  node: {
    background: '#2d3748',
    border: '2px solid #4a5568',
    borderRadius: '8px',
    padding: '15px',
    minWidth: '120px',
    textAlign: 'center',
    color: '#fff',
    position: 'relative',
  },
  nodeSelected: {
    border: '2px solid #4299e1',
    boxShadow: '0 0 15px rgba(66, 153, 225, 0.5)',
  },
  nodeIcon: {
    fontSize: '32px',
    marginBottom: '8px',
  },
  nodeName: {
    fontSize: '12px',
    fontWeight: '600',
  },
  groupNode: {
    background: 'rgba(66, 153, 225, 0.1)',
    border: '2px dashed #4299e1',
    borderRadius: '12px',
    padding: '20px',
    minWidth: '300px',
    minHeight: '200px',
  },
  handle: {
    width: '10px',
    height: '10px',
    background: '#4299e1',
    border: '2px solid #fff',
  },
  deleteButton: {
    position: 'absolute',
    top: '-10px',
    right: '-10px',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: '#ef4444',
    border: '2px solid #fff',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    lineHeight: 1,
    zIndex: 10,
    transition: 'all 0.2s',
  },
  packet: {
    position: 'absolute',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    zIndex: 100,
    boxShadow: '0 0 10px currentColor',
  },
  helpModalContent: {
    background: '#1a1f2c',
    borderRadius: '12px',
    padding: '30px',
    width: '650px',
    maxWidth: '90%',
    border: '2px solid #2d3548',
    maxHeight: '80vh',
    overflowY: 'auto',
  },
  helpModalTitle: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: '20px',
    borderBottom: '1px solid #2d3548',
    paddingBottom: '15px',
  },
  helpStep: {
    marginBottom: '20px',
  },
  helpStepTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#63b3ed',
    marginBottom: '10px',
  },
  helpStepText: {
    fontSize: '14px',
    color: '#a0aec0',
    lineHeight: '1.6',
  },
  closeButton: {
    marginTop: '20px',
    padding: '12px 24px',
    background: '#4a5568',
    border: 'none',
    borderRadius: '6px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    float: 'right',
  },
};

// ==================== СТИЛИ ДЛЯ ПОРТОВ ====================
const portStyle = {
  width: 10,
  height: 10,
  background: '#fff',
  border: '2px solid #3b82f6',
  borderRadius: '50%',
  cursor: 'crosshair',
  zIndex: 10,
};

// ==================== ТИПЫ УСТРОЙСТВ ====================
const DEVICE_TYPES = {
  PC: { type: 'pc', label: 'ПК', icon: '️' },
  LAPTOP: { type: 'laptop', label: 'Ноутбук', icon: '💻' },
  PRINTER: { type: 'printer', label: 'Принтер', icon: '🖨️' },
  SERVER: { type: 'server', label: 'Сервер', icon: '🖧' },
  SWITCH: { type: 'switch', label: 'Коммутатор L2', icon: '🔀' },
  ROUTER: { type: 'router', label: 'Маршрутизатор', icon: '📡' },
  WIFI: { type: 'wifi', label: 'Wi-Fi Точка', icon: '📶' },
  HACKER: { type: 'hacker', label: 'Хакер', icon: '👤' },
  FIREWALL: { type: 'firewall', label: 'Firewall', icon: '🛡️' },
};

// ==================== КАСТОМНЫЕ НОДЫ ====================
const CustomNode = ({ data, selected, id, isCompromised }) => {
  // Для роутера отображаем LAN/WAN IP под иконкой, для коммутаторов L2 - ничего не показываем
  const showIp = data.type === 'router' || (data.type && !String(data.type).includes('switch'));
  const displayIp = data.type === 'router'
    ? (data.lanIp || data.ip || '')
    : (data.ip || '');

  // Определяем цвет рамки в зависимости от типа устройства
  const isHacker = data.type === 'hacker';
  const isFirewall = data.type === 'firewall';
  const firewallActive = data.isActive !== false; // По умолчанию активен
  const isServer = data.type === 'server';

  let nodeBorderColor = '#4a5568';
  if (isHacker) {
    nodeBorderColor = '#ef4444'; // Красный для хакера
  } else if (isFirewall) {
    nodeBorderColor = firewallActive ? '#10b981' : '#f59e0b'; // Зеленый если активен, желтый если выключен
  } else if (isCompromised) {
    nodeBorderColor = '#ef4444'; // Красный для зараженного сервера
  }

  return (
    <div style={{
      ...styles.node,
      ...(selected ? styles.nodeSelected : {}),
      borderColor: nodeBorderColor,
      borderWidth: isHacker || isFirewall || isCompromised ? '3px' : '2px',
      background: isCompromised ? '#450a0a' : '#2d3748',
      boxShadow: isCompromised ? '0 0 20px rgba(239, 68, 68, 0.8)' : (selected ? '0 0 15px rgba(66, 153, 225, 0.5)' : 'none'),
      animation: isCompromised ? 'pulseRed 1.5s infinite' : 'none',
      position: 'relative',
    }}>
      <Handle type="target" position="top" style={portStyle} id="top" />
      <Handle type="source" position="top" style={portStyle} id="top-source" />
      <div style={styles.nodeIcon}>{data.icon}</div>
      <div style={styles.nodeName}>{data.label}</div>
      {showIp && (
        <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '5px' }}>
          {data.type === 'router' && data.wanIp ? (
            <>LAN: {data.lanIp || '—'} | WAN: {data.wanIp}</>
          ) : (
            <>{displayIp}</>
          )}
        </div>
      )}
      {/* ✅ VLAN Badge - визуальная метка с номером VLAN */}
      {(data.vlan || data.vlanId) && (
        <div style={{
          marginTop: '4px',
          padding: '2px 6px',
          borderRadius: '4px',
          backgroundColor: '#064e3b', // Темно-зеленый фон
          border: '1px solid #10b981', // Ярко-зеленая рамка
          color: '#34d399', // Салатовый текст
          fontSize: '10px',
          fontWeight: 'bold',
          textAlign: 'center',
          width: 'fit-content',
          margin: '4px auto 0 auto'
        }}>
          VLAN {data.vlan || data.vlanId}
        </div>
      )}
      {/* Индикатор статуса Firewall */}
      {isFirewall && (
        <div style={{
          marginTop: '4px',
          fontSize: '10px',
          color: firewallActive ? '#10b981' : '#f59e0b',
          fontWeight: 'bold'
        }}>
          {firewallActive ? '🟢 АКТИВЕН' : '🔴 ОТКЛЮЧЕН'}
        </div>
      )}
      {/* Индикатор заражения для сервера */}
      {isCompromised && (
        <div style={{
          marginTop: '6px',
          fontSize: '9px',
          color: '#fca5a5',
          fontWeight: 'bold',
          background: 'rgba(239, 68, 68, 0.2)',
          padding: '3px 6px',
          borderRadius: '4px',
          border: '1px solid rgba(239, 68, 68, 0.5)'
        }}>
          ⚠️ COMPROMISED
        </div>
      )}
      <Handle type="target" position="bottom" style={portStyle} id="bottom" />
      <Handle type="source" position="bottom" style={portStyle} id="bottom-source" />
      <Handle type="target" position="left" style={portStyle} id="left" />
      <Handle type="source" position="left" style={portStyle} id="left-source" />
      <Handle type="target" position="right" style={portStyle} id="right" />
      <Handle type="source" position="right" style={portStyle} id="right-source" />
    </div>
  );
};

const GroupNode = ({ data }) => {
  return (
    <div style={{ ...styles.groupNode, position: 'relative' }}>
      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#4299e1', marginBottom: '10px' }}>
        📁 {data.label}
      </div>
      <Handle type="target" position="top" style={portStyle} id="top" />
      <Handle type="source" position="top" style={portStyle} id="top-source" />
      <Handle type="target" position="bottom" style={portStyle} id="bottom" />
      <Handle type="source" position="bottom" style={portStyle} id="bottom-source" />
      <Handle type="target" position="left" style={portStyle} id="left" />
      <Handle type="source" position="left" style={portStyle} id="left-source" />
      <Handle type="target" position="right" style={portStyle} id="right" />
      <Handle type="source" position="right" style={portStyle} id="right-source" />
    </div>
  );
};

// ==================== МОДАЛЬНОЕ ОКНО НАСТРОЕК ====================
const DeviceModal = ({ node, onClose, onUpdate, onAddLog, nodes, edges, checkConnectionBetweenNodes, setNodes, setSelectedNode }) => {
  const [activeTab, setActiveTab] = useState('settings');
  const [config, setConfig] = useState(node.data.config || {});
  const [terminalLines, setTerminalLines] = useState([]);
  const [terminalInput, setTerminalInput] = useState('');
  const [newVlanId, setNewVlanId] = useState('');
  const [newVlanName, setNewVlanName] = useState('');
  const terminalEndRef = useRef(null);

  // Строгая проверка: является ли устройство L2 коммутатором
  const isL2Switch =
    node.data.type?.toLowerCase().includes('switch') ||
    node.data.label?.toLowerCase().includes('коммутатор');

  // Инициализация VLAN для коммутатора L2
  const getSwitchVlans = () => {
    if (isL2Switch) {
      return node.data.vlans || [{ id: 1, name: 'default' }];
    }
    return [];
  };

  const [switchVlans, setSwitchVlans] = useState(getSwitchVlans());

  // ФИЛЬТРАЦИЯ УСТРОЙСТВ С ХОЛСТА: отфильтровываем только конечные узлы (ПК, ноутбуки, серверы)
  const availableEndDevices = (nodes || []).filter(n =>
    ['pc', 'laptop', 'server'].includes(n.data?.type) ||
    n.data?.label?.toLowerCase().includes('пк') ||
    n.data?.label?.toLowerCase().includes('ноутбук') ||
    n.data?.label?.toLowerCase().includes('сервер')
  );

  // Обработчик переключения устройства в VLAN - ИММУТАБЕЛЬНАЯ ВЕРСИЯ С ПРИВЕДЕНИЕМ ТИПОВ
  const handleToggleDeviceInVlan = (switchId, vlanId, deviceId, isChecked) => {
    setNodes(nds => nds.map(node => String(node.id) === String(switchId) ? {
      ...node,
      data: {
        ...node.data,
        vlans: (node.data.vlans || [{id:1, name:'default'}]).map(vlan => {
          if (vlan.id === vlanId) {
            return isChecked
              ? { ...vlan, assignedDevices: [...(vlan.assignedDevices || []), deviceId] }
              : { ...vlan, assignedDevices: (vlan.assignedDevices || []).filter(id => id !== deviceId) };
          }
          return { ...vlan, assignedDevices: (vlan.assignedDevices || []).filter(id => id !== deviceId) };
        })
      }
    } : node));

    // ✅ КРИТИЧНО: Записываем VLAN ID в данные самого ПК (конечного устройства)
    setNodes(nds => nds.map(node => String(node.id) === String(deviceId) ? {
      ...node,
      data: {
        ...node.data,
        vlan: vlanId, // Сохраняем VLAN ID в поле vlan для отображения на узле
        vlanId: vlanId // Также сохраняем в vlanId для совместимости
      }
    } : node));

    // Синхронизируем локальный стейт открытого окна
    setSelectedNode(prev => prev && String(prev.id) === String(switchId) ? {
      ...prev,
      data: {
        ...prev.data,
        vlans: (prev.data.vlans || [{id:1, name:'default'}]).map(vlan => {
          if (vlan.id === vlanId) {
            return isChecked
              ? { ...vlan, assignedDevices: [...(vlan.assignedDevices || []), deviceId] }
              : { ...vlan, assignedDevices: (vlan.assignedDevices || []).filter(id => id !== deviceId) };
          }
          return { ...vlan, assignedDevices: (vlan.assignedDevices || []).filter(id => id !== deviceId) };
        })
      }
    } : prev);
  };

  // Автопрокрутка терминала вниз
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLines]);

  // Обновление VLAN при изменении узла
  useEffect(() => {
    if (isL2Switch) {
      const newVlans = node.data.vlans || [{ id: 1, name: 'default' }];
      setSwitchVlans(newVlans);
      // Синхронизируем selectedNode с актуальными VLAN из nodes
      setSelectedNode(prev => prev && prev.id === node.id ? { ...prev, data: { ...prev.data, vlans: newVlans } } : prev);
    }
  }, [node.data.vlans, isL2Switch]);

  const handleSave = () => {
    if (isL2Switch) {
      // Для L2 коммутатора сохраняем только VLAN, без IP/Mask/Gateway
      onUpdate(node.id, { ...node.data, vlans: node.data.vlans || [{ id: 1, name: 'default' }] });
    } else {
      onUpdate(node.id, { ...node.data, config });
    }
    onAddLog(`📝 ${node.data.label}: настройки сохранены`);
    onClose();
  };

  // Добавление нового VLAN для коммутатора - ИММУТАБЕЛЬНАЯ ВЕРСИЯ С ПРИВЕДЕНИЕМ ТИПОВ
  const handleAddVlan = (nodeId, vlanId, vlanName) => {
    const pId = parseInt(vlanId);
    if (isNaN(pId) || pId < 1 || pId > 4094) {
      alert("VLAN ID должен быть числом от 1 до 4094");
      return;
    }
    setNodes(nds => nds.map(n => String(n.id) === String(nodeId) ? {
      ...n,
      data: {
        ...n.data,
        vlans: [...(n.data.vlans || [{id:1, name:'default'}]), {id: pId, name: vlanName || `VLAN_${pId}`}]
      }
    } : n));

    // Принудительно синхронизируем локальный стейт открытого окна для мгновенного рендера
    setSelectedNode(prev => prev && String(prev.id) === String(nodeId) ? {
      ...prev,
      data: {
        ...prev.data,
        vlans: [...(prev.data.vlans || [{id:1, name:'default'}]), {id: pId, name: vlanName || `VLAN_${pId}`}]
      }
    } : prev);
    onAddLog(`📝 ${node.data.label}: добавлен VLAN ${pId} (${vlanName || `VLAN_${pId}`})`);
  };

  // Удаление VLAN из коммутатора - ИММУТАБЕЛЬНАЯ ВЕРСИЯ С ПРИВЕДЕНИЕМ ТИПОВ
  const handleDeleteVlan = (vlanId) => {
    if (vlanId === 1) {
      alert('Нельзя удалить VLAN 1 (по умолчанию)');
      return;
    }
    setNodes(nds => nds.map(n => String(n.id) === String(node.id) ? {
      ...n,
      data: {
        ...n.data,
        vlans: (n.data.vlans || [{id:1, name:'default'}]).filter(v => v.id !== vlanId)
      }
    } : n));

    // Синхронизируем локальный стейт открытого окна
    setSelectedNode(prev => prev && String(prev.id) === String(node.id) ? {
      ...prev,
      data: {
        ...prev.data,
        vlans: (prev.data.vlans || [{id:1, name:'default'}]).filter(v => v.id !== vlanId)
      }
    } : prev);
    onAddLog(`📝 ${node.data.label}: удален VLAN ${vlanId}`);
  };

  // Обработка команд терминала
  const handleTerminalCommand = (command) => {
    const cmd = command.trim().toLowerCase();
    const args = cmd.split(' ');
    setTerminalLines(prev => [...prev, `C:\\Users\\Admin> ${command}`]);

    if (args[0] === 'ipconfig') {
      const ip = node.data.config?.ip || node.data.ip || 'Не назначен';
      const subnet = node.data.config?.subnet || '255.255.255.0';
      const gateway = node.data.config?.gateway || '192.168.1.1';
      setTerminalLines(prev => [...prev, '',
        'Адаптер Ethernet:',
        `   IPv4-адрес. . . . . . . . . . : ${ip}`,
        `   Маска подсети . . . . . . . . : ${subnet}`,
        `   Основной шлюз . . . . . . . . : ${gateway}`,
        ''
      ]);
    } else if (args[0] === 'ping') {
      const targetIp = args[1];
      if (!targetIp) {
        setTerminalLines(prev => [...prev, 'Ошибка: укажите IP-адрес для ping', '']);
        return;
      }
      setTerminalLines(prev => [...prev, `Ping для ${targetIp} с 32 байтами данных:`]);

      // Проверяем, существует ли устройство с таким IP
      const targetNode = nodes.find(n => {
        const nodeIp = n.data.config?.ip || n.data.ip;
        return nodeIp === targetIp;
      });

      if (!targetNode) {
        // Целевое устройство не найдено
        setTimeout(() => {
          for (let i = 0; i < 4; i++) {
            setTimeout(() => {
              setTerminalLines(prev => [...prev, `Превышен интервал ожидания для запроса.`]);
            }, i * 500);
          }
          setTimeout(() => {
            setTerminalLines(prev => [...prev, '',
              `Статистика Ping для ${targetIp}:`,
              '    Пакетов: отправлено = 4, получено = 0, потеряно = 4 (100% потерь)',
              ''
            ]);
          }, 2000);
        }, 100);
        onAddLog(`⚠️ [Ping] Узел ${targetIp} не найден в сети.`);
        return;
      }

      // Проверяем, есть ли путь от текущего устройства к целевому
      const hasPath = checkConnectionBetweenNodes(node.id, targetNode.id, edges);
      if (!hasPath) {
        // Нет физического соединения
        setTimeout(() => {
          for (let i = 0; i < 4; i++) {
            setTimeout(() => {
              setTerminalLines(prev => [...prev, `Превышен интервал ожидания для запроса.`]);
            }, i * 500);
          }
          setTimeout(() => {
            setTerminalLines(prev => [...prev, '',
              `Статистика Ping для ${targetIp}:`,
              '    Пакетов: отправлено = 4, получено = 0, потеряно = 4 (100% потерь)',
              ''
            ]);
          }, 2000);
        }, 100);
        onAddLog(`⚠️ [Ping] Нет физического пути к узлу ${targetIp}.`);
        return;
      }

      // ✅ ЕСТЬ ФИЗИЧЕСКИЙ ПУТЬ - ПРОВЕРЯЕМ VLAN ИЗОЛЯЦИЮ
      const sourceVlan = node.data.vlanId || node.data.vlan || 1;
      const targetVlan = targetNode.data.vlanId || targetNode.data.vlan || 1;

      // Находим общий коммутатор между устройствами
      const sourceEdges = edges.filter(e => e.source === node.id || e.target === node.id);
      const targetEdges = edges.filter(e => e.source === targetNode.id || e.target === targetNode.id);
      let commonSwitch = null;
      for (const se of sourceEdges) {
        const nextId = se.source === node.id ? se.target : se.source;
        const nextNode = nodes.find(n => n.id === nextId);
        const isSwitch = nextNode?.data?.type?.toLowerCase().includes('switch') ||
                         nextNode?.data?.label?.toLowerCase().includes('коммутатор');
        if (nextNode && isSwitch) {
          const isTargetConnected = targetEdges.some(e =>
            (e.source === targetNode.id && e.target === nextId) ||
            (e.target === targetNode.id && e.source === nextId)
          );
          if (isTargetConnected) {
            commonSwitch = nextNode;
            break;
          }
        }
      }

      // Если устройства подключены к одному L2 коммутатору но в разных VLAN - блокируем
      if (commonSwitch && sourceVlan !== targetVlan) {
        setTimeout(() => {
          for (let i = 0; i < 4; i++) {
            setTimeout(() => {
              setTerminalLines(prev => [...prev, `Превышен интервал ожидания для запроса.`]);
            }, i * 500);
          }
          setTimeout(() => {
            setTerminalLines(prev => [...prev, '',
              `Статистика Ping для ${targetIp}:`,
              '    Пакетов: отправлено = 4, получено = 0, потеряно = 4 (100% потерь)',
              ''
            ]);
          }, 2000);
        }, 100);
        onAddLog(` [VLAN Изоляция] Коммутатор заблокировал трафик. ${node.data.label} (VLAN ${sourceVlan}) и ${targetNode.data.label} (VLAN ${targetVlan}) изолированы друг от друга.`);
        return;
      }

      // ✅ VLAN совпадают или разные коммутаторы - пинг проходит
      setTimeout(() => {
        for (let i = 0; i < 4; i++) {
          setTimeout(() => {
            const time = Math.floor(Math.random() * 10) + 1;
            setTerminalLines(prev => [...prev, `Ответ от ${targetIp}: число байт=32 время=${time}мс TTL=64`]);
          }, i * 500);
        }
        setTimeout(() => {
          setTerminalLines(prev => [...prev, '',
            `Статистика Ping для ${targetIp}:`,
            '    Пакетов: отправлено = 4, получено = 4, потеряно = 0 (0% потерь)',
            ''
          ]);
        }, 2000);
      }, 100);
      onAddLog(`✅ [Ping] Успешный ответ от ${targetIp} (VLAN ${targetVlan})`);

    } else if (args[0] === 'help') {
      setTerminalLines(prev => [...prev, '',
        'Доступные команды:',
        '  ipconfig           - Показать настройки сети',
        '  ping [IP-адрес]    - Проверить доступность устройства',
        '  clear              - Очистить экран терминала',
        '  help               - Показать этот список',
        ''
      ]);
    } else if (args[0] === 'clear') {
      setTerminalLines([]);
    } else if (cmd !== '') {
      setTerminalLines(prev => [...prev, `'${args[0]}' не является внутренней или внешней командой.`, '']);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleTerminalCommand(terminalInput);
      setTerminalInput('');
    }
  };

  const renderSettings = () => {
    // Если это L2 коммутатор - показываем ТОЛЬКО VLAN, без IP полей
    if (isL2Switch) {
      return (
        <>
          <div style={{ marginBottom: '15px' }}>
            <label style={styles.label}>📋 Управление VLAN:</label>
            <div style={{ fontSize: '12px', color: '#718096', marginBottom: '10px' }}>
              Создавайте и управляйте VLAN на коммутаторе
            </div>
          </div>

          {/* Форма создания нового VLAN */}
          <div style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '20px',
            padding: '15px',
            background: '#2d3748',
            borderRadius: '6px'
          }}>
            <div style={{ flex: 1 }}>
              <label style={{ ...styles.label, marginBottom: '5px' }}>ID VLAN (1-4094)</label>
              <input
                type="number"
                min="1"
                max="4094"
                style={styles.input}
                value={newVlanId}
                onChange={(e) => setNewVlanId(e.target.value)}
                placeholder="10"
              />
            </div>
            <div style={{ flex: 2 }}>
              <label style={{ ...styles.label, marginBottom: '5px' }}>Имя VLAN</label>
              <input
                style={styles.input}
                value={newVlanName}
                onChange={(e) => setNewVlanName(e.target.value)}
                placeholder="Office"
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                style={{
                  ...styles.button,
                  background: '#3b82f6',
                  marginTop: '0',
                  whiteSpace: 'nowrap'
                }}
                onClick={() => handleAddVlan(node.id, newVlanId, newVlanName)}
              >
                ➕ Добавить
              </button>
            </div>
          </div>

          {/* Таблица VLAN с привязкой устройств */}
          <div className="vlan-settings-section text-white p-4">
            <h4 className="text-sm font-medium mb-3 text-gray-300">Настройка VLAN и привязка ПК</h4>
            <div className="flex gap-2 mb-4">
              <input id="vlan-id-input" type="number" placeholder="ID (1-4094)" className="w-24 px-3 py-2 bg-[#2a2f3b] border border-gray-600 rounded text-white" min="1" max="4094" />
              <input id="vlan-name-input" type="text" placeholder="Имя VLAN" className="flex-1 px-3 py-2 bg-[#2a2f3b] border border-gray-600 rounded text-white" />
              <button type="button" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm text-white" onClick={() => {
                const idInput = document.getElementById('vlan-id-input');
                const nameInput = document.getElementById('vlan-name-input');
                if (idInput && nameInput && idInput.value) {
                  handleAddVlan(node.id, idInput.value, nameInput.value || `VLAN_${idInput.value}`);
                  idInput.value = '';
                  nameInput.value = '';
                }
              }}>Добавить</button>
            </div>

            <div className="bg-[#1a1d24] rounded border border-gray-700 overflow-hidden">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-[#242936] text-xs uppercase text-gray-400">
                  <tr>
                    <th className="px-4 py-2 w-16">ID</th>
                    <th className="px-4 py-2 w-32">Название</th>
                    <th className="px-4 py-2">Выбор портов (Компьютеры)</th>
                    <th className="px-4 py-2 w-20">Действие</th>
                  </tr>
                </thead>
                <tbody>
                  {(node.data.vlans || [{ id: 1, name: 'default' }]).map((vlan) => (
                    <tr key={vlan.id} className="border-b border-gray-700">
                      <td className="px-4 py-2 font-mono text-blue-400">{vlan.id}</td>
                      <td className="px-4 py-2">{vlan.name}</td>
                      <td className="px-4 py-2">
                        {vlan.id === 1 ? (
                          <span className="text-xs text-gray-500 italic">Системный</span>
                        ) : (
                          <button
                            type="button"
                            className="text-red-400 hover:text-red-500 text-xs"
                            onClick={() => handleDeleteVlan(vlan.id)}
                          >
                            Удалить
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* БЛОК НАЗНАЧЕНИЯ ПК В VLAN */}
            <div className="mt-5 pt-4 border-t border-gray-700">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                Назначение портов (Привязка компьютеров к VLAN)
              </h5>
              {/* Собираем все ПК с холста */}
              {(() => {
                const pcsOnCanvas = nodes ? nodes.filter(n =>
                  n.data?.type === 'pc' || n.data?.type === 'laptop' ||
                  n.data?.label?.toLowerCase().includes('пк') || n.data?.label?.toLowerCase().includes('ноутбук')
                ) : [];
                if (pcsOnCanvas.length === 0) {
                  return <p className="text-xs text-gray-500 italic">Нет доступных ПК на холсте для настройки портов.</p>;
                }
                return (
                  <div className="grid grid-cols-1 gap-3 max-h-40 overflow-y-auto pr-2">
                    {pcsOnCanvas.map(pc => (
                      <div key={pc.id} className="flex items-center justify-between bg-[#1a1d24] p-2 rounded border border-gray-700">
                        <span className="text-sm font-medium text-gray-300">{pc.data?.label || 'Компьютер'}</span>
                        {/* Выпадающий список для выбора VLAN для этого конкретного ПК */}
                        <select
                          className="bg-[#242936] text-xs text-white border border-gray-600 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                          value={pc.data?.vlan || pc.data?.vlanId || ((nodes.find(n => n.id === node.id)?.data?.vlans) || []).find(v => v.assignedDevices?.includes(pc.id))?.id || 1}
                          onChange={(e) => {
                            const targetVlanId = parseInt(e.target.value);
                            handleToggleDeviceInVlan(node.id, targetVlanId, pc.id, true);
                          }}
                        >
                          {((nodes.find(n => n.id === node.id)?.data?.vlans) || [{id: 1, name: 'default'}]).map(v => (
                            <option key={v.id} value={v.id}>
                              VLAN {v.id} ({v.name})
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </>
      );
    }

    // Для ПК, ноутбуков и серверов - поля IP/Mask/Gateway
    if (['pc', 'laptop', 'server'].includes(node.data.type)) {
      return (
        <>
          <div style={styles.formGroup}>
            <label style={styles.label}>IP-адрес</label>
            <input
              style={styles.input}
              value={config.ip || node.data.ip || ''}
              onChange={(e) => setConfig({ ...config, ip: e.target.value })}
              placeholder="192.168.1.100"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Маска подсети</label>
            <input
              style={styles.input}
              value={config.subnet || ''}
              onChange={(e) => setConfig({ ...config, subnet: e.target.value })}
              placeholder="255.255.255.0"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Основной шлюз</label>
            <input
              style={styles.input}
              value={config.gateway || ''}
              onChange={(e) => setConfig({ ...config, gateway: e.target.value })}
              placeholder="192.168.1.1"
            />
          </div>
          {/* Выпадающий список VLAN для ПК */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Подключить к VLAN</label>
            <select
              style={styles.input}
              value={node.data.vlanId || 1}
              onChange={(e) => {
                const targetVlanId = parseInt(e.target.value);
                // Находим коммутатор на холсте
                const switchNode = nodes.find(n => String(n.data?.type).includes('switch'));
                if (switchNode) {
                  handleToggleDeviceInVlan(switchNode.id, targetVlanId, node.id, true);
                }
                // ✅ Записываем VLAN и в поле vlan для отображения
                onUpdate(node.id, { ...node.data, vlan: targetVlanId, vlanId: targetVlanId });
              }}
            >
              {(() => {
                // Собираем все VLAN со всех коммутаторов на холсте
                const allVlans = [];
                nodes.forEach(n => {
                  if (String(n.data?.type).includes('switch') && n.data?.vlans) {
                    n.data.vlans.forEach(v => {
                      if (!allVlans.find(av => av.id === v.id)) {
                        allVlans.push(v);
                      }
                    });
                  }
                });
                return allVlans.length > 0
                  ? allVlans.map(v => <option key={v.id} value={v.id}>VLAN {v.id} ({v.name})</option>)
                  : <option value="1">VLAN 1 (default)</option>;
              })()}
            </select>
          </div>
        </>
      );
    }

    // Для маршрутизатора - отдельные настройки LAN/WAN
    if (node.data.type === 'router') {
      return (
        <>
          <div style={styles.formGroup}>
            <label style={styles.label}>Внутренний интерфейс (LAN IP)</label>
            <input
              style={styles.input}
              value={config.lanIp || node.data.lanIp || ''}
              onChange={(e) => setConfig({ ...config, lanIp: e.target.value })}
              placeholder="192.168.1.1"
            />
            <div style={{ fontSize: '11px', color: '#718096', marginTop: '5px' }}>
              Этот адрес будет шлюзом по умолчанию для локальных ПК
            </div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Внешний интерфейс (WAN IP)</label>
            <input
              style={styles.input}
              value={config.wanIp || node.data.wanIp || ''}
              onChange={(e) => setConfig({ ...config, wanIp: e.target.value })}
              placeholder="95.24.10.1"
            />
            <div style={{ fontSize: '11px', color: '#718096', marginTop: '5px' }}>
              Публичный IP-адрес для подключения к Интернету
            </div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Статус порта</label>
            <select
              style={styles.input}
              value={config.portStatus || 'on'}
              onChange={(e) => setConfig({ ...config, portStatus: e.target.value })}
            >
              <option value="on">Включен</option>
              <option value="off">Выключен</option>
            </select>
          </div>
        </>
      );
    }

    // СПЕЦИАЛЬНЫЕ НАСТРОЙКИ ДЛЯ FIREWALL
    if (node.data.type === 'firewall') {
      const firewallActive = node.data.isActive !== false;
      return (
        <>
          <div style={{
            padding: '20px',
            background: '#1e293b',
            borderRadius: '8px',
            border: '1px solid #334155',
            marginBottom: '15px'
          }}>
            <h3 style={{
              color: '#f59e0b',
              fontSize: '14px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              ️ Статус защиты Firewall
            </h3>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              background: firewallActive ? '#064e3b' : '#450a0a',
              borderRadius: '8px',
              border: `1px solid ${firewallActive ? '#10b981' : '#ef4444'}`
            }}>
              <div>
                <div style={{
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  marginBottom: '4px'
                }}>
                  {firewallActive ? '🟢 Активен' : ' Отключен'}
                </div>
                <div style={{
                  color: '#94a3b8',
                  fontSize: '11px'
                }}>
                  {firewallActive
                    ? 'Firewall блокирует атаки и вредоносный трафик'
                    : 'Сеть не защищена - уязвима для атак'}
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() => {
                  const newStatus = !firewallActive;
                  setNodes((nds) =>
                    nds.map((n) => {
                      if (n.id === node.id) {
                        return {
                          ...n,
                          data: {
                            ...n.data,
                            isActive: newStatus
                          }
                        };
                      }
                      return n;
                    })
                  );
                  // Обновляем selectedNode для синхронизации UI
                  setSelectedNode(prev => prev && prev.id === node.id ? {
                    ...prev,
                    data: {
                      ...prev.data,
                      isActive: newStatus
                    }
                  } : prev);
                  // Логирование
                  onAddLog(`🛡️ Firewall ${node.data.label}: ${newStatus ? 'АКТИВИРОВАН' : 'ОТКЛЮЧЕН'}`);
                }}
                style={{
                  padding: '12px 24px',
                  background: firewallActive ? '#10b981' : '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  transition: 'all 0.3s',
                  boxShadow: firewallActive
                    ? '0 0 15px rgba(16, 185, 129, 0.5)'
                    : '0 0 15px rgba(239, 68, 68, 0.5)'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'scale(1)';
                }}
              >
                {firewallActive ? 'ОТКЛЮЧИТЬ' : 'АКТИВИРОВАТЬ'}
              </button>
            </div>

            {/* Информация о блокировках */}
            <div style={{
              marginTop: '16px',
              fontSize: '11px',
              color: '#64748b',
              textAlign: 'center'
            }}>
              💡 Совет: Отключите Firewall и запустите DDoS-атаку, чтобы увидеть уязвимость сети
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#718096' }}>
            ℹ️ Firewall не имеет IP-адреса и работает как фильтр сетевого трафика
          </div>
        </>
      );
    }

    return <div style={{ color: '#a0aec0' }}>Настройки для этого типа устройства недоступны</div>;
  };

  const renderTerminal = () => {
    if (!['pc', 'laptop', 'server'].includes(node.data.type)) {
      return <div style={{ color: '#a0aec0' }}>Терминал доступен только для ПК, ноутбуков и серверов</div>;
    }
    return (
      <>
        <div style={styles.terminalWindow}>
          <div style={styles.terminalOutput}>
            {terminalLines.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
            <div ref={terminalEndRef} />
          </div>
          <div style={styles.terminalInputLine}>
            <span style={styles.terminalPrompt}>C:\Users\Admin&gt; </span>
            <input
              style={styles.terminalInput}
              value={terminalInput}
              onChange={(e) => setTerminalInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>
        </div>
        <div style={{ fontSize: '12px', color: '#a0aec0', marginTop: '10px' }}>
          Команды: ipconfig, ping [IP], clear, help
        </div>
      </>
    );
  };

  return (
    <div style={styles.modal} onClick={onClose}>
      <div style={styles.modalContentNew} onClick={(e) => e.stopPropagation()}>
        {/* Заголовок с кнопкой закрытия */}
        <div style={styles.modalHeader}>
          <div style={styles.modalTitle}>️ {node.data.label}</div>
          <button style={styles.closeButtonX} onClick={onClose}>✕</button>
        </div>

        <div style={styles.tabContainer}>
          <button
            style={{ ...styles.tab, ...(activeTab === 'settings' ? styles.tabActive : {}) }}
            onClick={() => setActiveTab('settings')}
          >
            🌐 НАСТРОЙКИ
          </button>
          {['pc', 'laptop', 'server'].includes(node.data.type) && (
            <button
              style={{ ...styles.tab, ...(activeTab === 'terminal' ? styles.tabActive : {}) }}
              onClick={() => setActiveTab('terminal')}
            >
              🖥️ ТЕРМИНАЛ
            </button>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          {activeTab === 'settings' ? renderSettings() : renderTerminal()}
        </div>

        {activeTab === 'settings' && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button style={{ ...styles.button, ...styles.buttonDanger }} onClick={onClose}>
              Отмена
            </button>
            <button style={styles.button} onClick={handleSave}>
              Сохранить изменения
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== КОМПОНЕНТ ВКЛАДКИ НАСТРОЕК ====================
const SettingsTabContent = ({ node, onUpdate, onClose, onAddLog, nodes, setNodes, setSelectedNode, compromisedServers, recoverServer }) => {
  const [ip, setIp] = useState(node.data.config?.ip || node.data.ip || '');
  const [subnet, setSubnet] = useState(node.data.config?.subnet || '255.255.255.0');
  const [gateway, setGateway] = useState(node.data.config?.gateway || '192.168.1.1');
  const [lanIp, setLanIp] = useState(node.data.lanIp || '');
  const [wanIp, setWanIp] = useState(node.data.wanIp || '');
  const [vlanIdInput, setVlanIdInput] = useState('');
  const [vlanNameInput, setVlanNameInput] = useState('');

  // СБОР ВСЕХ ДОСТУПНЫХ VLAN С КОММУТАТОРОВ НА ХОЛСТЕ
  const availableVlans = React.useMemo(() => {
    if (!nodes || nodes.length === 0) {
      return [{ id: 1, name: 'default' }];
    }
    // Находим все коммутаторы на холсте
    const switches = nodes.filter(n =>
      n.data?.type?.toLowerCase().includes('switch') ||
      n.data?.label?.toLowerCase().includes('коммутатор')
    );
    if (switches.length === 0) {
      return [{ id: 1, name: 'default' }];
    }
    // Собираем все VLAN из всех коммутаторов
    const allVlans = [];
    const vlanIds = new Set();
    switches.forEach(switchNode => {
      const switchVlans = switchNode.data.vlans || [{ id: 1, name: 'default' }];
      switchVlans.forEach(vlan => {
        if (!vlanIds.has(vlan.id)) {
          vlanIds.add(vlan.id);
          allVlans.push({ id: vlan.id, name: vlan.name });
        }
      });
    });
    // Если ничего не собрали, возвращаем дефолтный VLAN
    if (allVlans.length === 0) {
      return [{ id: 1, name: 'default' }];
    }
    // Сортируем по ID
    return allVlans.sort((a, b) => a.id - b.id);
  }, [nodes]);

  // Состояние для выбранного VLAN у ПК
  const [selectedVlanId, setSelectedVlanId] = useState(node.data.vlanId || 1);

  // Надежная проверка типа устройства
  const nodeLabel = node?.data?.label?.toLowerCase() || '';
  const nodeType = node?.data?.type?.toLowerCase() || '';
  const isL2Switch = nodeType.includes('switch') || nodeLabel.includes('коммутатор') || nodeLabel.includes('switch');
  const isRouter = nodeType === 'router' || nodeLabel.includes('маршрутизатор') || nodeLabel.includes('router');
  const isFirewall = nodeType === 'firewall' || nodeLabel.includes('firewall');

  // Функция добавления VLAN
  const handleAddVlan = () => {
    const parsedId = parseInt(vlanIdInput);
    if (isNaN(parsedId) || parsedId < 1 || parsedId > 4094) {
      alert("VLAN ID должен быть числом от 1 до 4094");
      return;
    }
    // Обновляем главный стейт узлов React Flow с нестрогим сравнением типов
    setNodes((nds) =>
      nds.map((n) => {
        if (String(n.id) === String(node.id)) {
          const currentVlans = n.data?.vlans || [{ id: 1, name: 'default' }];
          if (currentVlans.some((v) => String(v.id) === String(parsedId))) return n;
          const updatedVlans = [...currentVlans, { id: parsedId, name: vlanNameInput.trim() || `VLAN_${parsedId}` }];
          // Синхронизируем локальный стейт открытого окна, чтобы таблица сразу перерисовывалась
          setSelectedNode(prev => prev && String(prev.id) === String(node.id) ? { ...prev, data: { ...prev.data, vlans: updatedVlans } } : prev);
          return {
            ...n,
            data: { ...n.data, vlans: updatedVlans }
          };
        }
        return n;
      })
    );
    onAddLog(`📝 ${node.data.label}: добавлен VLAN ${parsedId}`);
    setVlanIdInput('');
    setVlanNameInput('');
  };

  // Функция удаления VLAN
  const handleRemoveVlan = (vlanId) => {
    if (vlanId === 1 || String(vlanId) === '1') {
      onAddLog('❌ Ошибка: Нельзя удалить системный VLAN 1 (default)');
      return;
    }
    setNodes((nds) =>
      nds.map((n) => {
        if (String(n.id) === String(node.id)) {
          const currentVlans = n.data?.vlans || [{ id: 1, name: 'default' }];
          const updatedVlans = currentVlans.filter(v => String(v.id) !== String(vlanId));
          // Синхронизируем локальный стейт открытого окна
          setSelectedNode(prev => prev && String(prev.id) === String(node.id) ? { ...prev, data: { ...prev.data, vlans: updatedVlans } } : prev);
          return {
            ...n,
            data: { ...n.data, vlans: updatedVlans }
          };
        }
        return n;
      })
    );
    onAddLog(`📝 ${node.data.label}: удален VLAN ${vlanId}`);
  };

  const handleSave = () => {
    if (isL2Switch) {
      // Для L2 коммутатора сохраняем только VLAN
      onUpdate(node.id, {
        ...node.data,
        vlans: node.data.vlans || [{ id: 1, name: 'default' }]
      });
      onAddLog(`📝 ${node.data.label}: настройки VLAN сохранены`);
    } else if (isRouter) {
      // Для маршрутизатора сохраняем lanIp и wanIp
      onUpdate(node.id, {
        ...node.data,
        lanIp: lanIp,
        wanIp: wanIp,
        ip: lanIp || node.data.ip
      });
      onAddLog(` ${node.data.label}: настройки сохранены (LAN: ${lanIp}, WAN: ${wanIp})`);
    } else {
      // Для ПК, ноутбуков и серверов - сохраняем IP настройки и выбранный VLAN
      onUpdate(node.id, {
        ...node.data,
        config: { ip, subnet, gateway },
        ip: ip || node.data.ip,
        vlanId: selectedVlanId
      });
      onAddLog(` ${node.data.label}: настройки сохранены (IP: ${ip}, VLAN: ${selectedVlanId})`);
    }
    onClose();
  };

  // Проверка типа устройства для отображения настроек
  if (!isL2Switch && !isRouter && !['pc', 'laptop', 'server'].includes(nodeType) && !isFirewall) {
    return (
      <div style={{ color: '#a0aec0', textAlign: 'center', padding: '20px' }}>
        <p>⚠️ Это устройство не поддерживает настройку сети.</p>
        <p>Настройки IP доступны только для ПК, Ноутбуков, Серверов и Маршрутизаторов.</p>
      </div>
    );
  }

  // 🔥 НАСТРОЙКИ FIREWALL - Переключатель Active/Disabled
  if (isFirewall) {
    const isActive = node.data.isActive !== false; // По умолчанию true если не задано
    return (
      <div style={{
        padding: '24px',
        background: 'linear-gradient(135deg, #1e293b, #0f172a)',
        borderRadius: '12px',
        border: '2px solid #f59e0b',
        marginTop: '20px'
      }}>
        <h3 style={{
          color: '#fbbf24',
          fontSize: '16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          margin: '0 0 20px 0'
        }}>
          ️ Статус защиты Firewall
        </h3>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px',
          background: isActive ? '#064e3b' : '#450a0a',
          borderRadius: '12px',
          border: `2px solid ${isActive ? '#10b981' : '#ef4444'}`,
          boxShadow: isActive
            ? '0 0 20px rgba(16, 185, 129, 0.3)'
            : '0 0 20px rgba(239, 68, 68, 0.3)'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '16px',
              marginBottom: '8px'
            }}>
              {isActive ? '🟢 АКТИВЕН' : '🔴 ОТКЛЮЧЕН'}
            </div>
            <div style={{
              color: '#94a3b8',
              fontSize: '12px',
              lineHeight: '1.5'
            }}>
              {isActive
                ? 'Firewall блокирует все атаки и вредоносный трафик. Сеть защищена.'
                : '️ Сеть НЕ ЗАЩИЩЕНА! Уязвима для DDoS-атак и сканирования портов.'}
            </div>
          </div>
          {/* Toggle Switch Button */}
          <button
            onClick={() => {
              const newStatus = !isActive;
              console.log('🔧 Firewall статус:', newStatus);
              // Обновляем состояние Firewall
              setNodes((nds) =>
                nds.map((n) => {
                  if (n.id === node.id) {
                    return {
                      ...n,
                      data: {
                        ...n.data,
                        isActive: newStatus
                      },
                      style: {
                        ...n.style,
                        boxShadow: newStatus
                          ? '0 0 20px rgba(245, 158, 11, 0.6)'
                          : 'none'
                      }
                    };
                  }
                  return n;
                })
              );
              // Синхронизируем selectedNode для мгновенного обновления UI
              setSelectedNode(prev => prev && prev.id === node.id ? { ...prev, data: { ...prev.data, isActive: newStatus } } : prev);
              // Запись в журнал
              const statusText = newStatus ? 'АКТИВИРОВАН' : 'ОТКЛЮЧЕН';
              const emoji = newStatus ? '🛡️' : '⚠️';
              onAddLog(`${emoji} Firewall "${node.data.label}": ${statusText}`);
              alert(`Firewall ${newStatus ? 'активирован' : 'отключен'}!`);
            }}
            style={{
              padding: '16px 32px',
              background: isActive ? '#ef4444' : '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
              marginLeft: '20px',
              minWidth: '140px'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)';
            }}
          >
            {isActive ? '🔴 ОТКЛЮЧИТЬ' : '🟢 АКТИВИРОВАТЬ'}
          </button>
        </div>
        {/* Подсказка */}
        <div style={{
          marginTop: '16px',
          fontSize: '12px',
          color: '#64748b',
          textAlign: 'center',
          fontStyle: 'italic'
        }}>
          💡 Совет: Отключите Firewall и запустите DDoS-атаку из панели справа, чтобы увидеть уязвимость сети
        </div>
      </div>
    );
  }

  // Настройки для L2 коммутатора (VLAN)
  if (isL2Switch) {
    const vlans = node.data.vlans || [{ id: 1, name: 'default' }];
    return (
      <div className="vlan-settings-section">
        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '15px', color: '#a0aec0' }}>Настройка VLAN (Layer 2)</h4>
        {/* Форма создания нового VLAN */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input
            type="number"
            placeholder="ID (1-4094)"
            value={vlanIdInput}
            onChange={(e) => setVlanIdInput(e.target.value)}
            min="1"
            max="4094"
            style={{ width: '100px', padding: '10px', background: '#1f2433', border: '1px solid #3b4252', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }}
          />
          <input
            type="text"
            placeholder="Имя VLAN"
            value={vlanNameInput}
            onChange={(e) => setVlanNameInput(e.target.value)}
            style={{ flex: 1, padding: '10px', background: '#1f2433', border: '1px solid #3b4252', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }}
          />
          <button
            type="button"
            onClick={handleAddVlan}
            style={{ padding: '10px 20px', background: '#3b82f6', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
          >
            Добавить
          </button>
        </div>
        {/* Таблица со списком VLAN - рендерим строго из selectedNode.data.vlans */}
        <div style={{ background: '#1a1d24', borderRadius: '6px', border: '1px solid #3b4252', overflow: 'hidden' }}>
          <table style={{ width: '100%', textAlign: 'left', fontSize: '13px', color: '#a0aec0' }}>
            <thead style={{ background: '#242936', fontSize: '11px', textTransform: 'uppercase', color: '#718096' }}>
              <tr>
                <th style={{ padding: '10px 15px' }}>ID</th>
                <th style={{ padding: '10px 15px' }}>Название</th>
                <th style={{ padding: '10px 15px' }}>Действие</th>
              </tr>
            </thead>
            <tbody>
              {(vlans || [{ id: 1, name: 'default' }]).map((vlan) => (
                <tr key={vlan.id} style={{ borderBottom: '1px solid #3b4252' }}>
                  <td style={{ padding: '10px 15px', fontFamily: 'monospace', color: '#63b3ed' }}>{vlan.id}</td>
                  <td style={{ padding: '10px 15px' }}>{vlan.name}</td>
                  <td style={{ padding: '10px 15px' }}>
                    {String(vlan.id) === '1' ? (
                      <span style={{ color: '#718096', fontStyle: 'italic' }}>Системный</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRemoveVlan(vlan.id)}
                        style={{ background: 'transparent', border: 'none', color: '#fc8181', cursor: 'pointer', fontSize: '13px', padding: '5px 10px' }}
                      >
                        Удалить
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', background: '#4a5568', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>Отмена</button>
          <button onClick={handleSave} style={{ padding: '10px 20px', background: '#4299e1', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>Сохранить изменения</button>
        </div>
      </div>
    );
  }

  // Настройки для Маршрутизатора
  if (isRouter) {
    return (
      <div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#a0aec0', marginBottom: '5px' }}>Внутренний интерфейс (LAN IP / Шлюз для ПК):</label>
          <input
            type="text"
            value={lanIp}
            onChange={(e) => setLanIp(e.target.value)}
            placeholder="Например, 192.168.1.1"
            style={{ width: '100%', padding: '10px', background: '#1f2433', border: '1px solid #3b4252', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#a0aec0', marginBottom: '5px' }}>Внешний интерфейс (WAN IP / Публичный Интернет):</label>
          <input
            type="text"
            value={wanIp}
            onChange={(e) => setWanIp(e.target.value)}
            placeholder="Например, 95.24.10.1"
            style={{ width: '100%', padding: '10px', background: '#1f2433', border: '1px solid #3b4252', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', background: '#4a5568', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>Отмена</button>
          <button onClick={handleSave} style={{ padding: '10px 20px', background: '#4299e1', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>Сохранить изменения</button>
        </div>
      </div>
    );
  }

  // Настройки для ПК, ноутбуков и серверов
  return (
    <div>
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontSize: '13px', color: '#a0aec0', marginBottom: '5px' }}>IP-адрес</label>
        <input
          type="text"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          placeholder="192.168.1.100"
          style={{ width: '100%', padding: '10px', background: '#2d3748', border: '1px solid #4a5568', borderRadius: '6px', color: '#fff', fontSize: '14px', boxSizing: 'border-box' }}
        />
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontSize: '13px', color: '#a0aec0', marginBottom: '5px' }}>Маска подсети</label>
        <input
          type="text"
          value={subnet}
          onChange={(e) => setSubnet(e.target.value)}
          placeholder="255.255.255.0"
          style={{ width: '100%', padding: '10px', background: '#2d3748', border: '1px solid #4a5568', borderRadius: '6px', color: '#fff', fontSize: '14px', boxSizing: 'border-box' }}
        />
      </div>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '13px', color: '#a0aec0', marginBottom: '5px' }}>Шлюз по умолчанию</label>
        <input
          type="text"
          value={gateway}
          onChange={(e) => setGateway(e.target.value)}
          placeholder="192.168.1.1"
          style={{ width: '100%', padding: '10px', background: '#2d3748', border: '1px solid #4a5568', borderRadius: '6px', color: '#fff', fontSize: '14px', boxSizing: 'border-box' }}
        />
      </div>
      {/* ПОЛЕ ВЫБОРА VLAN ДЛЯ ПК */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '13px', color: '#a0aec0', marginBottom: '5px' }}>Подключен к VLAN</label>
        <select
          value={selectedVlanId}
          onChange={(e) => setSelectedVlanId(parseInt(e.target.value))}
          style={{ width: '100%', padding: '10px', background: '#2d3748', border: '1px solid #4a5568', borderRadius: '6px', color: '#fff', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
        >
          {availableVlans.map(vlan => (
            <option key={vlan.id} value={vlan.id}>
              VLAN {vlan.id} ({vlan.name})
            </option>
          ))}
        </select>
      </div>
      {/* КНОПКА ВОССТАНОВЛЕНИЯ СЕРВЕРА - показываем только если сервер заражен */}
      {(node.data.type === 'server' || String(node.data.label).toLowerCase().includes('сервер')) && compromisedServers.has(node.id) && (
        <button
          onClick={() => recoverServer(node.id)}
          style={{
            marginTop: '12px',
            padding: '10px 16px',
            background: '#064e3b',
            color: '#34d399',
            border: '1px solid #10b981',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            width: '100%',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          🔧 Восстановить сервер
        </button>
      )}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button onClick={onClose} style={{ padding: '10px 20px', background: '#4a5568', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>Отмена</button>
        <button onClick={handleSave} style={{ padding: '10px 20px', background: '#4299e1', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>Сохранить изменения</button>
      </div>
    </div>
  );
};

const TerminalTabContent = ({ node, nodes, edges, checkConnectionBetweenNodes, animatePing, addLog, checkSameVlan }) => {
  const [terminalLines, setTerminalLines] = useState([
    'Microsoft Windows [Version 10.0.19045]',
    '(c) Корпорация Майкрософт (Microsoft Corporation). Все права защищены.',
    '',
    'Введите "help" для просмотра доступных сетевых команд.',
    ''
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const terminalEndRef = useRef(null);

  // Автопрокрутка терминала вниз
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLines]);

  // Функция для выполнения команды ipconfig
  const runIpconfig = () => {
    const ip = node.data.config?.ip || node.data.ip || '0.0.0.0';
    const subnet = node.data.config?.subnet || node.data.subnet || '255.255.255.0';
    const gateway = node.data.config?.gateway || node.data.gateway || '0.0.0.0';
    setTerminalLines((prev) => [...prev,
      'C:\\Users\\Admin> ipconfig',
      'Настройка протокола IP для Windows:',
      `  IPv4-адрес. . . . . . . . . . . : ${ip}`,
      `  Маска подсети . . . . . . . . . : ${subnet}`,
      `  Основной шлюз. . . . . . . . . : ${gateway}`,
      ''
    ]);
  };

  // Функция для выполнения ping 8.8.8.8 (тест NAT)
  const runPingGoogle = () => {
    const targetIp = '8.8.8.8';
    const currentGateway = node.data.config?.gateway || node.data.gateway || '';
    setTerminalLines((prev) => [...prev,
      `C:\\Users\\Admin> ping ${targetIp}`,
      `Обмен пакетами с ${targetIp} по 32 байт данных:`
    ]);
    if (!currentGateway || currentGateway === '0.0.0.0') {
      // Шлюз не указан - ошибка
      setTimeout(() => {
        setTerminalLines((prev) => [...prev,
          '  Превышен интервал ожидания для запроса.',
          '  Превышен интервал ожидания для запроса.',
          '  Превышен интервал ожидания для запроса.',
          '  Превышен интервал ожидания для запроса.',
          'Ошибка: Запрос не отправлен. Проверьте Основной шлюз.',
          ''
        ]);
        addLog('⚠️ [Ping] Ошибка: ПК 1 не может выйти в интернет, так как не указан Основной шлюз!');
      }, 100);
    } else {
      // Проверяем, совпадает ли шлюз с LAN IP маршрутизатора
      const routerNode = nodes.find(n =>
        (n.data.type === 'router' || n.data.type === 'Маршрутизатор') &&
        (n.data.config?.lanIp === currentGateway || n.data.lanIp === currentGateway)
      );
      if (!routerNode) {
        // Шлюз указан, но маршрутизатор не найден
        setTimeout(() => {
          setTerminalLines((prev) => [...prev,
            '  Превышен интервал ожидания для запроса.',
            '  Превышен интервал ожидания для запроса.',
            '  Превышен интервал ожидания для запроса.',
            '  Превышен интервал ожидания для запроса.',
            'Ошибка: Основной шлюз недоступен.',
            ''
          ]);
          addLog(`⚠️ [Ping] Ошибка: Основной шлюз ${currentGateway} недоступен.`);
        }, 100);
      } else {
        // Успешный выход через NAT
        const sourceIp = node.data.config?.ip || node.data.ip;
        const wanIp = routerNode.data.config?.wanIp || routerNode.data.wanIp || routerNode.data.config?.ip || routerNode.data.ip || '95.24.10.1';
        addLog(`🔄 [NAT] Маршрутизатор успешно подменил локальный IP ${sourceIp || 'локальный'} на внешний WAN для ПК 1`);
        setTimeout(() => {
          setTerminalLines((prev) => [...prev,
            `  Ответ от ${targetIp}: число байт=32 время=14мс TTL=54`,
            `  Ответ от ${targetIp}: число байт=32 время=14мс TTL=54`,
            `  Ответ от ${targetIp}: число байт=32 время=14мс TTL=54`,
            `  Ответ от ${targetIp}: число байт=32 время=14мс TTL=54`,
            `Статистика Ping для ${targetIp}: Пакетов: отправлено = 4, получено = 4, потеряно = 0 (0% потерь)`,
            ''
          ]);
          addLog(`📡 [Ping] Получен успешный ответ от сервера ${targetIp} через NAT`);
        }, 100);
      }
    }
  };

  const handleTerminalSubmit = (e) => {
    e.preventDefault();
    const currentCmd = terminalInput.trim();
    const cmdLower = currentCmd.toLowerCase();
    if (!currentCmd) return;

    // Добавляем саму введенную строку в историю терминала
    let linesToAdd = [`C:\\Users\\Admin> ${currentCmd}`];

    if (cmdLower === 'help') {
      linesToAdd.push(
        'Доступные команды:',
        '  ipconfig     - Вывод текущих настроек IP',
        '  ping [IP]    - Проверка связи с узлом (например, ping 8.8.8.8)',
        '  clear        - Очистить экран терминала'
      );
    } else if (cmdLower === 'ipconfig') {
      const ip = node.data.config?.ip || node.data.ip || '0.0.0.0';
      const subnet = node.data.config?.subnet || node.data.subnet || '255.255.255.0';
      const gateway = node.data.config?.gateway || node.data.gateway || '0.0.0.0';
      linesToAdd.push(
        'Настройка протокола IP для Windows:',
        `  IPv4-адрес. . . . . . . . . . . : ${ip}`,
        `  Маска подсети . . . . . . . . . : ${subnet}`,
        `  Основной шлюз. . . . . . . . . : ${gateway}`
      );
    } else if (cmdLower === 'clear') {
      setTerminalLines([]);
      setTerminalInput('');
      return;
    } else if (cmdLower.startsWith?.('ping ')) {
      const targetIp = currentCmd.substring(5).trim();
      linesToAdd.push(`Обмен пакетами с ${targetIp} по 32 байт данных:`);
      
      if (targetIp === '8.8.8.8') {
        // Логика проверки шлюза для NAT
        const currentGateway = node.data.config?.gateway || node.data.gateway || '';
        if (!currentGateway || currentGateway === '0.0.0.0') {
          linesToAdd.push(
            '  Превышен интервал ожидания для запроса.',
            '  Превышен интервал ожидания для запроса.',
            '  Превышен интервал ожидания для запроса.',
            '  Превышен интервал ожидания для запроса.',
            'Ошибка: Запрос не отправлен. Проверьте Основной шлюз.'
          );
          addLog('⚠️ [Ping] Ошибка: ПК 1 не может выйти в интернет, так как не указан Основной шлюз!');
        } else {
          // Успешный выход через NAT
          const sourceIp = node.data.config?.ip || node.data.ip;
          const routerNode = nodes.find(n =>
            (n.data.type === 'router' || n.data.type === 'Маршрутизатор') &&
            (n.data.config?.lanIp === currentGateway || n.data.lanIp === currentGateway)
          );
          const wanIp = routerNode?.data.config?.wanIp || routerNode?.data.wanIp || routerNode?.data.config?.ip || routerNode?.data.ip || '95.24.10.1';
          addLog(`🔄 [NAT] Маршрутизатор перехватил пакет от ПК 1. Замена внутреннего IP ${sourceIp || 'локального'} на внешний IP WAN для выхода в Интернет.`);
          linesToAdd.push(
            `  Ответ от ${targetIp}: число байт=32 время=14мс TTL=54`,
            `  Ответ от ${targetIp}: число байт=32 время=14мс TTL=54`,
            `  Ответ от ${targetIp}: число байт=32 время=14мс TTL=54`,
            `  Ответ от ${targetIp}: число байт=32 время=14мс TTL=54`,
            `Статистика Ping для ${targetIp}: Пакетов: отправлено = 4, получено = 4, потеряно = 0 (0% потерь)`
          );
          addLog(`📡 [Ping] Получен успешный ответ от сервера ${targetIp} через NAT`);
        }
      } else {
        // Пинг другого устройства в локальной сети - проверяем VLAN
        const targetNode = nodes.find(n => {
          const nodeIp = n.data.config?.ip || n.data.ip;
          return nodeIp === targetIp;
        });

        if (!targetNode) {
          // Целевое устройство не найдено
          linesToAdd.push(
            '  Превышен интервал ожидания для запроса.',
            '  Превышен интервал ожидания для запроса.',
            '  Превышен интервал ожидания для запроса.',
            '  Превышен интервал ожидания для запроса.',
            `Статистика Ping для ${targetIp}: Пакетов: отправлено = 4, получено = 0, потеряно = 4 (100% потерь)`
          );
          addLog(`⚠️ [Ping] Узел ${targetIp} недоступен или не отвечает.`);
        } else {
          // Проверяем наличие пути и VLAN
          const hasPath = checkConnectionBetweenNodes(node.id, targetNode.id, edges);
          if (!hasPath) {
            // Нет физического соединения
            linesToAdd.push(
              '  Превышен интервал ожидания для запроса.',
              '  Превышен интервал ожидания для запроса.',
              '  Превышен интервал ожидания для запроса.',
              '  Превышен интервал ожидания для запроса.',
              `Статистика Ping для ${targetIp}: Пакетов: отправлено = 4, получено = 0, потеряно = 4 (100% потерь)`
            );
            addLog(`⚠️ [Ping] Нет физического пути к узлу ${targetIp}.`);
          } else {
            // Есть физическое соединение - проверяем VLAN
            const sourceVlan = node.data.vlanId || 1;
            const targetVlan = targetNode.data.vlanId || 1;
            // Используем новую функцию проверки VLAN
            const sameVlan = checkSameVlan(node, targetNode, nodes);
            // Находим коммутатор, через который идет соединение
            const sourceEdges = edges.filter(e => e.source === node.id || e.target === node.id);
            const targetEdges = edges.filter(e => e.source === targetNode.id || e.target === targetNode.id);
            let commonSwitch = null;
            for (const se of sourceEdges) {
              const nextId = se.source === node.id ? se.target : se.source;
              const nextNode = nodes.find(n => n.id === nextId);
              // Проверка на L2 коммутатор через includes для надежности
              const isSwitch = nextNode?.data?.type?.toLowerCase().includes('switch') ||
                               nextNode?.data?.label?.toLowerCase().includes('коммутатор');
              if (nextNode && isSwitch) {
                // Проверяем, подключен ли targetNode к этому же коммутатору
                const isTargetConnected = targetEdges.some(e =>
                  (e.source === targetNode.id && e.target === nextId) ||
                  (e.target === targetNode.id && e.source === nextId)
                );
                if (isTargetConnected) {
                  commonSwitch = nextNode;
                  break;
                }
              }
            }

            if (commonSwitch && !sameVlan) {
              // VLAN изоляция - блокируем трафик
              linesToAdd.push(
                '  Превышен интервал ожидания для запроса.',
                '  Превышен интервал ожидания для запроса.',
                '  Превышен интервал ожидания для запроса.',
                '  Превышен интервал ожидания для запроса.',
                `Статистика Ping для ${targetIp}: Пакетов: отправлено = 4, получено = 0, потеряно = 4 (100% потерь)`
              );
              addLog(`🚫 [VLAN Изоляция] Коммутатор заблокировал трафик. ${node.data.label} (VLAN ${sourceVlan}) и ${targetNode.data.label} (VLAN ${targetVlan}) изолированы друг от друга и не могут общаться напрямую.`);
            } else {
              // VLAN совпадают или разные коммутаторы - пинг проходит
              setTimeout(() => {
                for (let i = 0; i < 4; i++) {
                  setTimeout(() => {
                    const time = Math.floor(Math.random() * 10) + 1;
                    setTerminalLines(prev => [...prev, `Ответ от ${targetIp}: число байт=32 время=${time}мс TTL=64`]);
                  }, i * 500);
                }
                setTimeout(() => {
                  setTerminalLines(prev => [...prev, '',
                    `Статистика Ping для ${targetIp}:`,
                    '    Пакетов: отправлено = 4, получено = 4, потеряно = 0 (0% потерь)',
                    ''
                  ]);
                }, 2000);
              }, 100);
              addLog(`✅ [Ping] Успешный ответ от ${targetIp} (VLAN ${targetVlan})`);
            }
          }
        }
      }
    } else {
      linesToAdd.push(`"${currentCmd}" не является внутренней или внешней командой. Введите "help" для списка команд.`);
    }

    // Обновляем вывод терминала и очищаем поле ввода
    setTerminalLines((prev) => [...prev, ...linesToAdd, '']);
    setTerminalInput('');
  };

  return (
    <div style={{ backgroundColor: '#05070a', border: '1px solid #2d3548', borderRadius: '6px', padding: '15px', fontFamily: 'monospace', fontSize: '13px', display: 'flex', flexDirection: 'column', height: '280px', boxSizing: 'border-box' }}>
      {/* Область вывода логов */}
      <div style={{ flexGrow: 1, overflowY: 'auto', color: '#22c55e', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '10px' }}>
        {terminalLines.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
        <div ref={terminalEndRef} />
      </div>
      {/* Строка ввода */}
      <form onSubmit={handleTerminalSubmit} style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ color: '#8892b0', marginRight: '5px', whiteSpace: 'nowrap' }}>C:\Users\Admin&gt;</span>
        <input
          type="text"
          value={terminalInput}
          onChange={(e) => setTerminalInput(e.target.value)}
          onKeyDown={(e) => e.stopPropagation()}
          style={{ flexGrow: 1, background: 'none', border: 'none', color: '#fff', outline: 'none', fontFamily: 'monospace', fontSize: '13px' }}
          autoFocus
        />
      </form>
    </div>
  );
};

// ==================== ОСНОВНОЙ КОМПОНЕНТ ====================
const NetworkSimulator = () => {
  const { getNodes } = useReactFlow();

  // Состояние для зараженных серверов
  const [compromisedServers, setCompromisedServers] = useState(new Set());

  // Функция восстановления сервера
  const recoverServer = (serverId) => {
    setCompromisedServers(prev => {
      const updated = new Set(prev);
      updated.delete(serverId);
      return updated;
    });
    const server = nodes.find(n => n.id === serverId);
    setLogs(prev => [...prev, {
      time: new Date().toLocaleTimeString(),
      message: `🔧 Сервер ${server?.data?.label || serverId} восстановлен. Защита активирована.`
    }]);
  };

  // Типы узлов с зависимостью от compromisedServers
  const nodeTypes = useMemo(() => ({
    custom: (props) => <CustomNode {...props} isCompromised={compromisedServers.has(props.id)} />,
    group: GroupNode,
    planBackground: ({ data }) => (
      <div
        style={{
          width: 1600,
          height: 1200,
          backgroundImage: `url(${data.image})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          pointerEvents: "none",
        }}
      />
    ),
  }), [compromisedServers]);

  // 1. Инициализация с проверкой LocalStorage
  const [nodes, setNodes, onNodesChange] = useNodesState(() => {
    const saved = localStorage.getItem('rf_nodes');
    return saved ? JSON.parse(saved) : [];
  });

  const [edges, setEdges, onEdgesChange] = useEdgesState(() => {
    const saved = localStorage.getItem('rf_edges');
    return saved ? JSON.parse(saved) : [];
  });

  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('rf_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [packets, setPackets] = useState([]);
  const [explosions, setExplosions] = useState([]); // Анимации взрывов при блокировке firewall
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Состояния для нового окна "Настройки и Терминал"
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('settings');

  // Скрытый input для загрузки файла
  const fileInputRef = useRef(null);

  // Состояния для перетаскивания модального окна
  const [modalPosition, setModalPosition] = useState({ x: window.innerWidth / 2 - 300, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const modalRef = useRef(null);

  // Состояния для аккордеонов сайдбара
  const [isEndDevicesOpen, setIsEndDevicesOpen] = useState(true);
  const [isNetworkDevicesOpen, setIsNetworkDevicesOpen] = useState(false);
  const [isSecurityDevicesOpen, setIsSecurityDevicesOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(true);

  // Состояние для отслеживания позиции скролла журнала
  const [isUserAtBottom, setIsUserAtBottom] = useState(true);

  const reactFlowWrapper = useRef(null);
  const logContainerRef = useRef(null);
  const nextIpRef = useRef(10); // Счетчик для DHCP (начинаем с 192.168.1.10)

  // Обработчик ручного скролла журнала - запоминаем позицию
  const handleLogScroll = (e) => {
    const container = e.target;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;
    // Если мы в 50px от низа - считаем что "внизу"
    setIsUserAtBottom(distanceToBottom < 50);
  };

  // Умный автоскролл журнала: скроллим вниз только если пользователь уже внизу
  useEffect(() => {
    if (logContainerRef.current && isUserAtBottom) {
      // Скроллим вниз ТОЛЬКО если пользователь уже был внизу
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
    // Если пользователь отскроллил вверх - НЕ трогаем скролл, даем читать историю
  }, [logs, isUserAtBottom]);

  // 2. Автосохранение при изменении
  useEffect(() => {
    localStorage.setItem('rf_nodes', JSON.stringify(nodes));
  }, [nodes]);

  useEffect(() => {
    localStorage.setItem('rf_edges', JSON.stringify(edges));
  }, [edges]);

  useEffect(() => {
    localStorage.setItem('rf_logs', JSON.stringify(logs));
  }, [logs]);

  // Обработчики для перетаскивания модального окна
  const handleModalMouseDown = useCallback((e) => {
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('textarea')) {
      return;
    }
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - modalPosition.x,
      y: e.clientY - modalPosition.y
    });
  }, [modalPosition]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        setModalPosition({
          x: Math.max(0, Math.min(window.innerWidth - 600, e.clientX - dragOffset.x)),
          y: Math.max(0, Math.min(window.innerHeight - 400, e.clientY - dragOffset.y))
        });
      }
    };
    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Функция для анимации пинга по шагам с поддержкой NAT и VLAN
  const animatePing = useCallback((sourceNodeId, targetNodeId, hasPath, needsNat, gatewayNode, addLogCallback) => {
    const sourceNode = nodes.find(n => n.id === sourceNodeId);
    const targetNode = nodes.find(n => n.id === targetNodeId);
    if (!sourceNode) return;

    // Проверяем VLAN изоляцию
    const sameVlan = checkSameVlan(sourceNode, targetNode, nodes);

    // Находим коммутатор/роутер, к которому подключен источник
    const connectedEdges = edges.filter(e => e.source === sourceNodeId || e.target === sourceNodeId);
    let firstHopNode = null;
    let firstEdge = null;
    for (const edge of connectedEdges) {
      const nextId = edge.source === sourceNodeId ? edge.target : edge.source;
      const nextNode = nodes.find(n => n.id === nextId);
      if (nextNode && ['switch', 'router'].includes(nextNode.data.type)) {
        firstHopNode = nextNode;
        firstEdge = edge;
        break;
      }
    }

    if (!firstEdge) {
      // Нет соединения с коммутатором/роутером
      setTimeout(() => {
        addLogCallback("⚠️ Превышен таймаут ожидания. Пакет потерян.");
      }, 500);
      return;
    }

    // Проверяем, есть ли общий коммутатор и разные VLAN
    const sourceEdges = edges.filter(e => e.source === sourceNodeId || e.target === sourceNodeId);
    const targetEdges = edges.filter(e => e.source === targetNodeId || e.target === targetNodeId);
    let commonSwitch = null;
    for (const se of sourceEdges) {
      const nextId = se.source === sourceNodeId ? se.target : se.source;
      const nextNode = nodes.find(n => n.id === nextId);
      if (nextNode && nextNode.data.type === 'switch') {
        const isTargetConnected = targetEdges.some(e =>
          (e.source === targetNodeId && e.target === nextId) ||
          (e.target === targetNodeId && e.source === nextId)
        );
        if (isTargetConnected) {
          commonSwitch = nextNode;
          break;
        }
      }
    }

    // Если устройства за одним коммутатором но в разных VLAN - блокируем
    if (commonSwitch && !sameVlan) {
      setTimeout(() => {
        addLogCallback(`🚫 [VLAN Изоляция] Коммутатор заблокировал трафик. ${sourceNode.data.label} (VLAN ${sourceNode.data.vlanId || 1}) и ${targetNode.data.label} (VLAN ${targetNode.data.vlanId || 1}) изолированы.`);
      }, 500);
      return;
    }

    // Шаг 1: Запрос - анимация от ПК к Коммутатору/Роутеру (синий)
    setEdges((eds) => eds.map(edge => {
      if (edge.id === firstEdge.id) {
        return {
          ...edge,
          animated: true,
          className: 'animated-request',
          style: { ...edge.style, stroke: '#3b82f6', strokeWidth: 3 }
        };
      }
      return edge;
    }));

    // Если нужен NAT и есть шлюз
    if (needsNat && gatewayNode) {
      setTimeout(() => {
        // Сброс первой анимации
        setEdges((eds) => eds.map(edge => {
          if (edge.id === firstEdge.id) {
            return {
              ...edge,
              animated: false,
              className: '',
              style: { ...edge.style, stroke: '#48bb78', strokeWidth: 2 }
            };
          }
          return edge;
        }));

        // Логирование NAT
        const sourceIp = sourceNode.data.config?.ip || sourceNode.data.ip;
        const wanIp = gatewayNode.data.config?.ip || gatewayNode.data.ip || '95.24.10.1';
        addLogCallback(`🔄 [NAT] ${gatewayNode.data.label} перехватил пакет от ${sourceNode.data.label}. Замена внутреннего IP ${sourceIp} на внешний публичный IP ${wanIp} для выхода в Интернет.`);

        // Пауза на обработку NAT (0.5 сек)
        setTimeout(() => {
          // Находим WAN-интерфейс роутера (ребро, идущее наружу)
          const wanEdges = edges.filter(e =>
            (e.source === gatewayNode.id || e.target === gatewayNode.id) &&
            e.data?.type !== 'lan'
          );
          let wanEdge = null;
          if (wanEdges.length > 0) {
            wanEdge = wanEdges[0];
          } else {
            // Если нет явного WAN ребра, используем любое ребро роутера
            const routerEdges = edges.filter(e => e.source === gatewayNode.id || e.target === gatewayNode.id);
            if (routerEdges.length > 0) {
              wanEdge = routerEdges.find(e => e.id !== firstEdge.id) || routerEdges[0];
            }
          }

          if (wanEdge) {
            // Анимация выхода во внешнюю сеть (синий)
            setEdges((eds) => eds.map(edge => {
              if (edge.id === wanEdge.id) {
                return {
                  ...edge,
                  animated: true,
                  className: 'animated-request',
                  style: { ...edge.style, stroke: '#3b82f6', strokeWidth: 3 }
                };
              }
              return edge;
            }));

            // Полёт до внешней цели (1.5 сек)
            setTimeout(() => {
              // Сброс WAN анимации
              setEdges((eds) => eds.map(edge => {
                if (edge.id === wanEdge.id) {
                  return {
                    ...edge,
                    animated: false,
                    className: '',
                    style: { ...edge.style, stroke: '#48bb78', strokeWidth: 2 }
                  };
                }
                return edge;
              }));

              // Ответ из интернета (зелёный обратно)
              setEdges((eds) => eds.map(edge => {
                if (edge.id === wanEdge.id) {
                  return {
                    ...edge,
                    animated: true,
                    className: 'animated-reply',
                    style: { ...edge.style, stroke: '#22c55e', strokeWidth: 3 }
                  };
                }
                return edge;
              }));

              setTimeout(() => {
                // Сброс WAN ответа
                setEdges((eds) => eds.map(edge => {
                  if (edge.id === wanEdge.id) {
                    return {
                      ...edge,
                      animated: false,
                      className: '',
                      style: { ...edge.style, stroke: '#48bb78', strokeWidth: 2 }
                    };
                  }
                  return edge;
                }));

                // Обратная трансляция NAT
                addLogCallback(`🔄 [NAT] ${gatewayNode.data.label} получил ответ для сессии ${targetNode?.data?.ip || '8.8.8.8'}. Возврат пакета на внутренний IP ${sourceNode.data.config?.ip || sourceNode.data.ip}.`);

                // Возврат к источнику (зелёный)
                setEdges((eds) => eds.map(edge => {
                  if (edge.id === firstEdge.id) {
                    return {
                      ...edge,
                      animated: true,
                      className: 'animated-reply',
                      style: { ...edge.style, stroke: '#22c55e', strokeWidth: 3 }
                    };
                  }
                  return edge;
                }));

                // Полный сброс
                setTimeout(() => {
                  setEdges((eds) => eds.map(edge => {
                    if (edge.id === firstEdge.id || edge.id === wanEdge.id) {
                      return {
                        ...edge,
                        animated: false,
                        className: '',
                        style: { ...edge.style, stroke: '#48bb78', strokeWidth: 2 }
                      };
                    }
                    return edge;
                  }));
                }, 1500);
              }, 1500);
            }, 1500);
          } else {
            // Нет WAN подключения у роутера
            addLogCallback('⚠️ Ошибка: У маршрутизатора нет активного подключения к внешней сети (WAN).');
            addLogCallback('Request timed out.');
            // Сброс
            setTimeout(() => {
              setEdges((eds) => eds.map(edge => {
                if (edge.id === firstEdge.id) {
                  return {
                    ...edge,
                    animated: false,
                    className: '',
                    style: { ...edge.style, stroke: '#48bb78', strokeWidth: 2 }
                  };
                }
                return edge;
              }));
            }, 500);
          }
        }, 500);
      }, 1500);
      return;
    }

    // Шаг 2: Если нет пути или цели - ошибка (локальный случай)
    if (!hasPath || !targetNode) {
      setTimeout(() => {
        // Анимация ошибки на коммутаторе (красный) - включаем анимацию
        setEdges((eds) => eds.map(edge => {
          if (edge.id === firstEdge.id) {
            return {
              ...edge,
              animated: true,
              className: 'animated-error',
              style: { ...edge.style, stroke: '#ef4444', strokeWidth: 3 }
            };
          }
          return edge;
        }));
        setTimeout(() => {
          // Сброс анимации
          setEdges((eds) => eds.map(edge => {
            if (edge.id === firstEdge.id) {
              return {
                ...edge,
                animated: false,
                className: '',
                style: { ...edge.style, stroke: '#48bb78', strokeWidth: 2 }
              };
            }
            return edge;
          }));
          addLogCallback("⚠️ Превышен таймаут ожидания. Пакет потерян.");
        }, 500);
      }, 1500);
      return;
    }

    // Находим edge от коммутатора к целевому устройству
    let secondEdge = null;
    const targetConnectedEdges = edges.filter(e => e.source === targetNodeId || e.target === targetNodeId);
    for (const edge of targetConnectedEdges) {
      const otherId = edge.source === targetNodeId ? edge.target : edge.source;
      const otherNode = nodes.find(n => n.id === otherId);
      if (otherNode && ['switch', 'router'].includes(otherNode.data.type)) {
        secondEdge = edge;
        break;
      }
    }

    setTimeout(() => {
      // Отключаем первую анимацию
      setEdges((eds) => eds.map(edge => {
        if (edge.id === firstEdge.id) {
          return {
            ...edge,
            animated: false,
            className: '',
            style: { ...edge.style, stroke: '#48bb78', strokeWidth: 2 }
          };
        }
        return edge;
      }));

      // Включаем вторую анимацию (к цели)
      if (secondEdge) {
        setEdges((eds) => eds.map(edge => {
          if (edge.id === secondEdge.id) {
            return {
              ...edge,
              animated: true,
              className: 'animated-request',
              style: { ...edge.style, stroke: '#3b82f6', strokeWidth: 3 }
            };
          }
          return edge;
        }));
      }

      // Шаг 3: Ответ (зеленый обратно)
      setTimeout(() => {
        // Отключаем вторую анимацию
        if (secondEdge) {
          setEdges((eds) => eds.map(edge => {
            if (edge.id === secondEdge.id) {
              return {
                ...edge,
                animated: false,
                className: '',
                style: { ...edge.style, stroke: '#48bb78', strokeWidth: 2 }
              };
            }
            return edge;
          }));
        }
        // Включаем обратную анимацию (зеленую)
        if (secondEdge) {
          setEdges((eds) => eds.map(edge => {
            if (edge.id === secondEdge.id) {
              return {
                ...edge,
                animated: true,
                className: 'animated-reply',
                style: { ...edge.style, stroke: '#22c55e', strokeWidth: 3 }
              };
            }
            return edge;
          }));
        }

        setTimeout(() => {
          // Отключаем вторую обратную анимацию
          if (secondEdge) {
            setEdges((eds) => eds.map(edge => {
              if (edge.id === secondEdge.id) {
                return {
                  ...edge,
                  animated: false,
                  className: '',
                  style: { ...edge.style, stroke: '#48bb78', strokeWidth: 2 }
                };
              }
              return edge;
            }));
          }
          // Включаем первую обратную анимацию (зеленую)
          setEdges((eds) => eds.map(edge => {
            if (edge.id === firstEdge.id) {
              return {
                ...edge,
                animated: true,
                className: 'animated-reply',
                style: { ...edge.style, stroke: '#22c55e', strokeWidth: 3 }
              };
            }
            return edge;
          }));

          // Шаг 4: Полный сброс
          setTimeout(() => {
            setEdges((eds) => eds.map(edge => {
              if (edge.id === firstEdge.id || (secondEdge && edge.id === secondEdge.id)) {
                return {
                  ...edge,
                  animated: false,
                  className: '',
                  style: { ...edge.style, stroke: '#48bb78', strokeWidth: 2 }
                };
              }
              return edge;
            }));
          }, 1500);
        }, 1500);
      }, 1500);
    }, 1500);
  }, [nodes, edges]);

  const addLog = useCallback((message) => {
    const timestamp = new Date().toLocaleTimeString('ru-RU');
    setLogs(prev => [...prev, `[${timestamp}] ${message}`].slice(-50));
  }, []);

  // Обработчик загрузки плана офиса
  const handlePlanUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Image = event.target.result;
      // Создаем ноду фона ПЕРВОЙ в массиве
      const planNode = {
        id: 'office-plan-bg',
        type: 'planBackground',
        position: { x: 0, y: 0 },
        draggable: false,
        selectable: false,
        zIndex: -10,
        data: { image: base64Image }
      };
      setNodes((nds) => [planNode, ...nds.filter(n => n.id !== 'office-plan-bg')]);
      addLog('🗺️ [План] Схема помещений успешно загружена на холст');
      // Сбрасываем выбор узла, чтобы не мешать добавлению новых устройств
      setSelectedNodeId(null);
    };
    reader.readAsDataURL(file);
    // Сбрасываем value input, чтобы можно было загрузить тот же файл повторно
    e.target.value = '';
  };

  // Обработчик удаления плана
  const handleRemovePlan = () => {
    setNodes((nds) => nds.filter(n => n.id !== 'office-plan-bg'));
    addLog('🗺️ [План] Схема помещений удалена с холста');
  };

  // Функция экспорта схемы в JSON файл
  const handleExportScheme = useCallback(() => {
    const data = { nodes, edges, logs };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `network-scheme-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addLog('💾 Схема экспортирована в файл network-scheme.json');
  }, [nodes, edges, logs, addLog]);

  // Функция импорта схемы из JSON файла
  const fileImportRef = useRef(null);
  const handleImportScheme = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.nodes && data.edges) {
          setNodes(data.nodes);
          setEdges(data.edges);
          if (data.logs) setLogs(data.logs);
          addLog(' Схема успешно загружена из файла');
        } else {
          addLog('❌ Ошибка: Неверный формат файла');
        }
      } catch (err) {
        addLog('❌ Ошибка при чтении файла: ' + err.message);
      }
    };
    reader.readAsText(file);
    // Сбрасываем value input, чтобы можно было загрузить тот же файл повторно
    e.target.value = '';
  }, [setNodes, setEdges, setLogs, addLog]);

  // Функция полного сброса LocalStorage
  const handleHardReset = useCallback(() => {
    if (window.confirm("⚠️ Это полностью удалит все сохраненные данные из браузера. Продолжить?")) {
      localStorage.clear();
      window.location.reload();
    }
  }, []);

  // Функция удаления устройства - объявляем РАНЬШЕ всех остальных функций
  const deleteNode = useCallback((nodeId) => {
    const nodeToDelete = nodes.find(n => n.id === nodeId);
    if (!nodeToDelete) return;
    const nodeName = nodeToDelete.data.label;
    // Удаляем все соединения (edges), связанные с этим устройством
    setEdges((eds) => eds.filter(edge => edge.source !== nodeId && edge.target !== nodeId));
    // Удаляем саму ноду
    setNodes((nds) => nds.filter(node => node.id !== nodeId));
    // Закрываем модальное окно если оно было открыто для этой ноды
    if (selectedNode && selectedNode.id === nodeId) {
      setShowModal(false);
      setSelectedNode(null);
    }
    // Сбрасываем выбранный ID
    setSelectedNodeId(null);
    addLog(`🗑️ Устройство [${nodeName}] и его соединения удалены`);
  }, [nodes, selectedNode, setEdges, setNodes, addLog]);

  // Обработчик кнопки "Удалить выбранное" с использованием useReactFlow
  const handleDeleteSelected = useCallback(() => {
    // Находим ноду, у которой горит синяя рамка выделения (selected: true)
    const allNodes = getNodes();
    const selectedNodeData = allNodes.find(node => node.selected);
    if (!selectedNodeData) {
      // Если ничего не выбрано, пишем предупреждение в наш журнал по центру
      addLog("⚠️ Ошибка: Сначала выберите устройство на холсте кликом мыши!");
      return;
    }
    // Удаляем устройство и все провода, которые в него входили или выходили
    setNodes((nds) => nds.filter((n) => n.id !== selectedNodeData.id));
    setEdges((eds) => eds.filter((edge) => edge.source !== selectedNodeData.id && edge.target !== selectedNodeData.id));
    const deviceName = selectedNodeData?.data?.label || selectedNodeData?.data?.ip || "Неизвестное устройство";
    addLog(`🗑️ Устройство [${deviceName}] и его соединения удалены`);
  }, [getNodes, setNodes, setEdges, addLog]);

  // Обработчик кнопки "Настройки и Терминал"
  const handleOpenSettings = useCallback(() => {
    const allNodes = getNodes();
    const selectedNodeData = allNodes.find(node => node.selected);
    if (!selectedNodeData) {
      addLog("⚠️ Сначала выберите устройство на холсте кликом мыши!");
      return;
    }
    setSelectedNode(selectedNodeData);
    setActiveTab('settings');
    setIsSettingsOpen(true);
  }, [getNodes, addLog]);

  const onConnect = useCallback(
    (params) => {
      const newEdge = {
        ...params,
        id: `edge-${Date.now()}`,
        type: 'default',
        style: { stroke: '#48bb78', strokeWidth: 2 },
        animated: false,
      };
      setEdges((eds) => addEdge(newEdge, eds));
      addLog(`🔗 Соединение установлено между устройствами`);
    },
    [setEdges, addLog]
  );

  const addDevice = useCallback((deviceType) => {
    const device = DEVICE_TYPES[deviceType];
    const newNode = {
      id: `node-${Date.now()}`,
      type: 'custom',
      position: { x: Math.random() * 400 + 50, y: Math.random() * 300 + 50 },
      data: {
        label: `${device.label} ${nodes.filter(n => n.data?.label?.startsWith(device.label)).length + 1}`,
        icon: device.icon,
        type: device.type,
        config: {},
        // Для Firewall добавляем статус активности
        isActive: device.type === 'firewall' ? true : undefined,
      },
    };
    setNodes((nds) => [...nds, newNode]);
    addLog(`➕ Добавлено устройство: ${newNode.data.label}`);
  }, [nodes, setNodes, addLog]);

  const addGroup = useCallback(() => {
    const groupName = prompt('Введите название группы (например: Бухгалтерия):', 'Новая группа');
    if (!groupName) return;
    const newGroup = {
      id: `group-${Date.now()}`,
      type: 'group',
      position: { x: Math.random() * 300 + 100, y: Math.random() * 200 + 100 },
      data: { label: groupName },
      style: { width: 400, height: 300 },
    };
    setNodes((nds) => [...nds, newGroup]);
    addLog(`📁 Создана группа: ${groupName}`);
  }, [setNodes, addLog]);

  const updateNodeData = useCallback((nodeId, newData) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          // Для маршрутизатора сохраняем lanIp и wanIp в data напрямую для удобства отображения
          const updatedData = {
            ...newData,
            ip: newData.config?.ip || newData.ip || newData.config?.lanIp || newData.lanIp,
          };
          // Если это роутер, добавляем lanIp и wanIp в корень data для отображения на холсте
          if (newData.type === 'router' || node.data.type === 'router') {
            updatedData.lanIp = newData.config?.lanIp || newData.lanIp;
            updatedData.wanIp = newData.config?.wanIp || newData.wanIp;
          }
          // ✅ Сохраняем VLAN в корне data для отображения на узле
          if (newData.vlan !== undefined) {
            updatedData.vlan = newData.vlan;
          }
          if (newData.vlanId !== undefined) {
            updatedData.vlanId = newData.vlanId;
          }
          return {
            ...node,
            data: updatedData,
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  const defaultEdgeOptions = {
    style: { stroke: '#48bb78', strokeWidth: 2 },
  };

  // Обработчик клавиши Delete/Backspace для удаления выделенного устройства
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Игнорируем если модальное окно открыто (чтобы не удалять при вводе текста)
      if (showModal) return;
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedNodeId) {
        event.preventDefault();
        deleteNode(selectedNodeId);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedNodeId, showModal, deleteNode]);

  // Слушатель глобального события открытия настроек устройства
  useEffect(() => {
    const handleOpenSettings = (e) => {
      const { id, data } = e.detail;
      setSelectedNode({ id, data });
      setShowModal(true);
    };
    window.addEventListener('open-device-settings', handleOpenSettings);
    return () => window.removeEventListener('open-device-settings', handleOpenSettings);
  }, []);

  // Синхронизация selectedNode с selectedNodeId при клике на узел
  useEffect(() => {
    if (selectedNodeId) {
      const node = nodes.find(n => n.id === selectedNodeId);
      if (node) {
        setSelectedNode(node);
        console.log('✅ Узел выбран:', node.id, node.data.label);
      }
    } else {
      console.log('❌ Клик по пустому месту или сброс выбора');
      setSelectedNode(null);
    }
  }, [selectedNodeId, nodes]);

  // ==================== ЛОГИКА DHCP ====================
  const runDHCP = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);
    addLog(' Запуск сети: инициализация DHCP...');
    try {
      // Находим все ПК и ноутбуки без IP
      const devicesNeedingIp = nodes.filter(
        n => ['pc', 'laptop'].includes(n.data.type) && !n.data.ip
      );
      // Находим маршрутизатор
      const router = nodes.find(n => n.data.type === 'router');
      if (!router) {
        addLog('❌ Ошибка: Маршрутизатор не найден в сети!');
        setIsRunning(false);
        return;
      }

      // Проверяем соединения для каждого устройства
      for (const device of devicesNeedingIp) {
        const path = findPathWithTrace(device.id, router.id, edges, nodes);
        if (path && path.length > 0) {
          // Формируем красивое сообщение о пути
          const pathNodes = path.map(nodeId => {
            const node = nodes.find(n => n.id === nodeId);
            return node ? node.data.label : '';
          });
          const intermediateDevices = pathNodes.slice(1, -1);
          let logMessage = `[DHCP] ${device.data.label} отправил запрос`;
          if (intermediateDevices.length > 0) {
            logMessage += ` через ${intermediateDevices.join(' -> ')}`;
          }
          logMessage += ` к ${router.data.label}`;
          addLog(logMessage);

          await animatePacket(device, router, 'dhcp-request');

          // Выдаем IP адрес
          const newIp = `192.168.1.${nextIpRef.current}`;
          nextIpRef.current++;

          setNodes((nds) =>
            nds.map((node) => {
              if (node.id === device.id) {
                return {
                  ...node,
                  data: {
                    ...node.data,
                    ip: newIp,
                    config: { ...node.data.config, ip: newIp },
                  },
                };
              }
              return node;
            })
          );
          addLog(`${router.data.label} успешно выдал IP ${newIp} для ${device.data.label}`);

          // Небольшая задержка между устройствами
          await new Promise(r => setTimeout(r, 300));
        } else {
          addLog(`⚠️ ${device.data.label} не соединен с маршрутизатором`);
        }
      }

      // Инициализация сервера с внешним IP
      const server = nodes.find(n => n.data.type === 'server');
      if (server && !server.data.ip) {
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id === server.id) {
              return {
                ...node,
                data: {
                  ...node.data,
                  ip: '8.8.8.8',
                  config: { ...node.data.config, ip: '8.8.8.8' },
                  isExternal: true,
                },
              };
            }
            return node;
          })
        );
        addLog(' Сервер-2 назначен как "Внешний Интернет" с IP 8.8.8.8');
      }

      // Назначаем IP роутеру (внутренний и внешний интерфейс)
      if (!router.data.ip) {
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id === router.id) {
              return {
                ...node,
                data: {
                  ...node.data,
                  ip: '192.168.1.1',
                  externalIp: '95.24.10.1',
                  config: {
                    ...node.data.config,
                    ip: '192.168.1.1',
                    externalIp: '95.24.10.1'
                  },
                },
              };
            }
            return node;
          })
        );
        addLog('📡 Маршрутизатор настроен: внутренний IP 192.168.1.1, внешний IP 95.24.10.1');
      }

      setIsRunning(false);
      addLog('✅ Сеть запущена. DHCP завершил работу.');
    } catch (error) {
      console.error('Ошибка при запуске сети:', error);
      addLog(`❌ Ошибка симуляции: ${error.message}`);
      setIsRunning(false);
    }
  }, [nodes, edges, isRunning, addLog]);

  // Проверка соединения между устройствами (BFS - поиск в ширину)
  const checkConnectionToDevice = (fromId, toId, edges, nodes) => {
    const visited = new Set();
    const queue = [{ id: fromId, path: [fromId] }];
    while (queue.length > 0) {
      const current = queue.shift();
      if (current.id === toId) {
        return true;
      }
      if (visited.has(current.id)) continue;
      visited.add(current.id);
      // Находим все соединения от текущего узла
      const connectedEdges = edges.filter(
        e => e.source === current.id || e.target === current.id
      );
      for (const edge of connectedEdges) {
        const nextId = edge.source === current.id ? edge.target : edge.source;
        if (!visited.has(nextId)) {
          const nextNode = nodes.find(n => n.id === nextId);
          // Проходим через любые устройства (коммутаторы, маршрутизаторы и т.д.)
          // Главное - найти путь до целевого устройства
          queue.push({ id: nextId, path: [...current.path, nextId] });
        }
      }
    }
    return false;
  };

  // Поиск пути с возвратом самого пути (для логирования)
  const findPathWithTrace = (fromId, toId, edges, nodes) => {
    const visited = new Set();
    const queue = [{ id: fromId, path: [fromId] }];
    while (queue.length > 0) {
      const current = queue.shift();
      if (current.id === toId) {
        return current.path;
      }
      if (visited.has(current.id)) continue;
      visited.add(current.id);
      const connectedEdges = edges.filter(
        e => e.source === current.id || e.target === current.id
      );
      for (const edge of connectedEdges) {
        const nextId = edge.source === current.id ? edge.target : edge.source;
        if (!visited.has(nextId)) {
          queue.push({ id: nextId, path: [...current.path, nextId] });
        }
      }
    }
    return null;
  };

  // Проверка, находятся ли IP-адреса в одной подсети
  const checkIfSameSubnet = useCallback((ip1, ip2, mask) => {
    if (!ip1 || !ip2 || !mask) return false;
    const parts1 = ip1.split('.').map(Number);
    const parts2 = ip2.split('.').map(Number);
    const maskParts = mask.split('.').map(Number);
    for(let i=0; i<4; i++) {
      if ((parts1[i] & maskParts[i]) !== (parts2[i] & maskParts[i])) return false;
    }
    return true;
  }, []);

  // Проверка соединения между двумя узлами (для терминала ping)
  const checkConnectionBetweenNodes = useCallback((fromId, toId, edges) => {
    const visited = new Set();
    const queue = [fromId];
    while (queue.length > 0) {
      const currentId = queue.shift();
      if (currentId === toId) {
        return true;
      }
      if (visited.has(currentId)) continue;
      visited.add(currentId);
      const connectedEdges = edges.filter(
        e => e.source === currentId || e.target === currentId
      );
      for (const edge of connectedEdges) {
        const nextId = edge.source === currentId ? edge.target : edge.source;
        if (!visited.has(nextId)) {
          queue.push(nextId);
        }
      }
    }
    return false;
  }, []);

  // Проверка: находятся ли два устройства в одном VLAN
  const checkSameVlan = useCallback((node1, node2, allNodes) => {
    // Получаем VLAN ID обоих устройств
    const vlanId1 = node1.data?.vlanId || 1;
    const vlanId2 = node2.data?.vlanId || 1;
    // Если VLAN одинаковый - возвращаем true
    return vlanId1 === vlanId2;
  }, []);

  // Функция поиска пути (Breadth-First Search) - возвращает массив ID узлов или null
  const findPath = (startNodeId, endNodeId, edgesList, nodesList) => {
    let queue = [[startNodeId]];
    let visited = new Set([startNodeId]);
    while (queue.length > 0) {
      let path = queue.shift();
      let node = path[path.length - 1];
      if (node === endNodeId) {
        return path; // Путь найден
      }
      // Находим соседей через edges
      let neighbors = edgesList
        .filter(e => e.source === node || e.target === node)
        .map(e => e.source === node ? e.target : e.source);
      for (let neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push([...path, neighbor]);
        }
      }
    }
    return null; // Пути нет
  };

  // Анимация пакета с поддержкой атак и firewall (топологическая проверка)
  const animatePacket = async (fromNode, toNode, type, isAttack = false) => {
    const packetId = `packet-${Date.now()}`;
    // Определяем цвет пакета: красный для атак, желтый для NAT, синий для обычных
    let packetColor = '#4299e1'; // синий по умолчанию
    if (isAttack || type === 'attack') {
      packetColor = '#ef4444'; // красный для атаки
    } else if (type === 'nat') {
      packetColor = '#f6e05e'; // желтый для NAT
    } else if (type === 'dhcp-request') {
      packetColor = '#48bb78'; // зеленый для DHCP
    }

    setPackets(prev => [...prev, {
      id: packetId,
      from: fromNode.position,
      to: toNode.position,
      progress: 0,
      type,
      color: packetColor,
      isAttack,
      target: toNode.id,
      source: fromNode.id,
    }]);

    // Для атак: проверяем наличие активного Firewall НА ПУТИ между источником и целью
    let firewallOnPath = null;
    let isBlocked = false;

    if (isAttack) {
      // 1. Находим путь от источника к цели
      const path = findPath(fromNode.id, toNode.id, edges, nodes);
      if (!path) {
        // Пути нет физически - атака не может дойти
        addLog(`⚠️ Атака на ${toNode.data.label} не удалась: нет соединения с ${fromNode.data.label}`);
        setTimeout(() => {
          setPackets(prev => prev.filter(p => p.id !== packetId));
        }, 500);
        return;
      }

      // 2. Проверяем, есть ли на пути активный Firewall
      // ✅ ИСПРАВЛЕНИЕ: node.data.type вместо node.type
      for (let nodeId of path) {
        const node = nodes.find(n => n.id === nodeId);
        if (node && node.data.type === 'firewall' && node.data.isActive === true) {
          firewallOnPath = node;
          isBlocked = true;
          break;
        }
      }
      console.log('🔍 Путь атаки:', path);
      console.log('🛡️ Firewall на пути:', firewallOnPath ? firewallOnPath.data.label : 'Нет');
    }

    // Анимация движения пакета
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(r => setTimeout(r, 50));
      
      // Проверка блокировки Firewall (только для атак и только если firewall на пути)
      if (isBlocked && firewallOnPath && i > 30 && i < 70) {
        // Пакет заблокирован на середине пути
        addLog(`🛡️ Firewall "${firewallOnPath.data.label}" заблокировал ${type === 'ddos' ? 'DDoS-' : ''}атаку от ${fromNode.data.label} к ${toNode.data.label}`);
        
        // Создаем анимацию взрыва на месте Firewall
        const explosionId = `explosion-${Date.now()}`;
        setExplosions(prev => [...prev, {
          id: explosionId,
          x: firewallOnPath.position.x + 25,
          y: firewallOnPath.position.y + 25,
        }]);
        // Удаляем взрыв через 500мс
        setTimeout(() => {
          setExplosions(prev => prev.filter(e => e.id !== explosionId));
        }, 500);
        
        // Удаляем пакет
        setPackets(prev => prev.filter(p => p.id !== packetId));
        return; // Прерываем анимацию
      }

      setPackets(prev => prev.map(p =>
        p.id === packetId ? { ...p, progress: i } : p
      ));
    }

    // Пакет достиг цели - проверяем, была ли это успешная атака на сервер
    if (isAttack || type === 'ddos') {
      const targetNode = nodes.find(n => n.id === toNode.id);
      if (targetNode && targetNode.data.type === 'server') {
        // Сервер заражен!
        setCompromisedServers(prev => {
          if (!prev.has(toNode.id)) {
            const updated = new Set(prev);
            updated.add(toNode.id);
            addLog(`🚨 КРИТИЧЕСКАЯ УЯЗВИМОСТЬ! Сервер ${targetNode.data.label} (${targetNode.data.ip || 'N/A'}) ЗАРАЖЕН! DDoS пробил защиту!`);
            return updated;
          }
          return prev;
        });
      }
    }

    setPackets(prev => prev.filter(p => p.id !== packetId));
  };

  // Функция запуска DDoS атаки
  const triggerDDoSAttack = useCallback(() => {
    const hackers = nodes.filter(n => n.data.type === 'hacker');
    const servers = nodes.filter(n => n.data.type === 'server');
    if (servers.length === 0) {
      addLog('❌ Нет серверов для атаки! Добавьте сервер на холст.');
      return;
    }
    const targetServer = servers[0];
    const attackers = hackers.length > 0 ? hackers : nodes.filter(n => ['pc', 'laptop'].includes(n.data.type));
    if (attackers.length === 0) {
      addLog('❌ Нет устройств для запуска атаки! Добавьте Хакера или ПК.');
      return;
    }
    addLog(`⚠️ ЗАПУЩЕНА DDoS АТАКА на ${targetServer.data.label}!`);
    // Запускаем множественные пакеты от разных источников
    attackers.forEach((attacker, index) => {
      setTimeout(() => {
        animatePacket(attacker, targetServer, 'ddos', true);
      }, index * 200);
    });
  }, [nodes, addLog]);

  // Функция сканирования портов
  const triggerPortScan = useCallback(() => {
    const hackers = nodes.filter(n => n.data.type === 'hacker');
    const allDevices = nodes.filter(n => ['server', 'pc', 'laptop', 'router'].includes(n.data.type));
    if (hackers.length === 0) {
      addLog('❌ Нет Хакера для сканирования! Добавьте устройство Хакер.');
      return;
    }
    if (allDevices.length === 0) {
      addLog('❌ Нет устройств для сканирования!');
      return;
    }
    const hacker = hackers[0];
    addLog(` ${hacker.data.label} начинает сканирование портов...`);
    allDevices.forEach((device, index) => {
      setTimeout(() => {
        animatePacket(hacker, device, 'port-scan', true);
        addLog(`📡 Сканирование ${device.data.label}: порты 22,80,443 открыты`);
      }, index * 300);
    });
  }, [nodes, addLog]);

  // ==================== ЛОГИКА NAT ====================
  const handlePingWithNat = useCallback(async (sourceNodeId, targetIp) => {
    const sourceNode = nodes.find(n => n.id === sourceNodeId);
    const router = nodes.find(n => n.data.type === 'router');
    const server = nodes.find(n => n.data.type === 'server');

    if (!sourceNode || !router) {
      addLog('❌ Ошибка: Источник или маршрутизатор не найдены');
      return;
    }

    addLog(`🖥️ ${sourceNode.data.label} отправляет ping на ${targetIp}...`);
    // Пакет от ПК к роутеру (внутренний IP)
    await animatePacket(sourceNode, router, 'ping-internal');
    addLog(`📦 Пакет от ${sourceNode.data.ip} прибыл на маршрутизатор`);

    // Проверка: если пингуем внешний сервер, применяем NAT
    if (server && server.data.ip === targetIp && server.data.isExternal) {
      addLog(`[NAT] Замена внутреннего IP ${sourceNode.data.ip} на внешний IP шлюза ${router.data.externalIp} для отправки в Интернет`);
      // Анимация пакета с измененным цветом (NAT)
      await animatePacket(router, server, 'nat');
      addLog(`📦 NAT-пакет от ${router.data.externalIp} прибыл на Сервер (${targetIp})`);

      // Ответ от сервера
      await new Promise(r => setTimeout(r, 200));
      addLog(` Сервер отправляет ответ на ${router.data.externalIp}`);
      await animatePacket(server, router, 'nat');

      // Обратный NAT
      addLog(`[NAT] Обратная замена: ${router.data.externalIp} -> ${sourceNode.data.ip}`);
      await animatePacket(router, sourceNode, 'ping-internal');
      addLog(`✅ Ответ получен: ${targetIp}: байт=32 время=${Math.floor(Math.random() * 50) + 1}мс TTL=128`);
    }
  }, [nodes, addLog]);

  return (
    <div style={styles.container}>
      {/* РАБОЧАЯ ОБЛАСТЬ (левая часть) */}
      <div style={styles.workspace}>
        {/* ХОЛСТ С КАРТОЙ - прижат в левый верхний угол */}
        <div style={styles.canvas} ref={reactFlowWrapper}>
          <style>{customCSS}</style>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(event, node) => {
              console.log('🔵 Клик по узлу:', node.id, node.data.label);
              setSelectedNodeId(node.id);
            }}
            onPaneClick={() => {
              console.log('⚪ Клик по пустому месту');
              setSelectedNodeId(null);
            }}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            fitView
            snapToGrid
            snapGrid={[15, 15]}
            minZoom={0.5}
            maxZoom={2}
            deleteKeyCode={showModal ? null : ['Delete', 'Backspace']}
          >
            <Background color="#4a5568" gap={20} size={1} />
            <Controls
              style={{
                background: '#2d3748',
                borderRadius: '8px',
                border: '1px solid #4a5568',
              }}
            />
            <MiniMap
              position="top-left"
              style={{ backgroundColor: '#141822', border: '1px solid #1f2433', borderRadius: '8px' }}
              nodeColor="#1b2330"
              nodeStrokeColor="#3b82f6"
              maskColor="rgba(20, 24, 34, 0.8)"
            />
          </ReactFlow>

          {/* ПАКЕТЫ (АНИМАЦИЯ) */}
          {packets.map(packet => {
            const x = packet.from.x + (packet.to.x - packet.from.x) * (packet.progress / 100);
            const y = packet.from.y + (packet.to.y - packet.from.y) * (packet.progress / 100);
            return (
              <div
                key={packet.id}
                style={{
                  ...styles.packet,
                  left: `${x}px`,
                  top: `${y}px`,
                  backgroundColor: packet.color,
                  color: packet.color,
                }}
              />
            );
          })}

          {/* ВЗРЫВЫ (анимация блокировки firewall) */}
          {explosions.map(explosion => (
            <div
              key={explosion.id}
              style={{
                position: 'absolute',
                left: `${explosion.x}px`,
                top: `${explosion.y}px`,
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#ef4444',
                opacity: 0.8,
                transform: 'translate(-50%, -50%)',
                animation: 'explode 0.5s ease-out forwards',
                zIndex: 101,
              }}
            >
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#fff',
                fontSize: '24px',
                fontWeight: 'bold',
              }}>✕</div>
            </div>
          ))}
        </div>

        {/* СИСТЕМНЫЙ ЖУРНАЛ - плавающий по центру внизу */}
        <div style={styles.logPanel}>
          <div style={styles.logTitle}>📋 Системный журнал событий</div>
          <div
            ref={logContainerRef}
            onScroll={handleLogScroll}
            style={{
              maxHeight: '130px',
              minHeight: '80px',
              overflowY: 'auto',
              scrollbarWidth: 'thin',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {logs.length === 0 ? (
              <div style={{ color: '#4a5568', fontStyle: 'italic', fontSize: '12px' }}>Журнал пуст...</div>
            ) : (
              logs.map((log, i) => (
                <div key={i} style={styles.logEntry}>{log}</div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ПАНЕЛЬ УПРАВЛЕНИЯ (правая часть) - Modern Pro Tool Style */}
      <div style={styles.sidebar}>
        {/* ВЕРХНЯЯ ЗОНА - Скроллируемая библиотека устройств */}
        <div style={styles.sidebarTop}>
          <div style={styles.sidebarTitle}>📦 Библиотека Устройств</div>

          {/* Блок 1: Конечные узлы */}
          <div>
            <div
              onClick={() => setIsEndDevicesOpen(!isEndDevicesOpen)}
              onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.accordionHeaderHover)}
              onMouseOut={(e) => Object.assign(e.currentTarget.style, { background: '#1f2937', borderColor: '#374151' })}
              style={styles.accordionHeader}
            >
              <span style={styles.accordionTitle}>💻 Конечные узлы</span>
              <span style={styles.accordionIcon}>{isEndDevicesOpen ? '▼' : '▶'}</span>
            </div>
            {isEndDevicesOpen && (
              <div style={{ marginTop: '8px', paddingLeft: '4px' }}>
                {['PC', 'LAPTOP', 'PRINTER', 'SERVER'].map((key) => {
                  const device = DEVICE_TYPES[key];
                  return (
                    <button
                      key={key}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('deviceType', key);
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                      onClick={() => addDevice(key)}
                      onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.deviceButtonHover)}
                      onMouseOut={(e) => Object.assign(e.currentTarget.style, { background: '#1f2937', borderColor: '#374151' })}
                      style={styles.deviceButton}
                    >
                      <span style={styles.icon}>{device.icon}</span>
                      <span>{device.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Блок 2: Сетевое железо */}
          <div>
            <div
              onClick={() => setIsNetworkDevicesOpen(!isNetworkDevicesOpen)}
              onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.accordionHeaderHover)}
              onMouseOut={(e) => Object.assign(e.currentTarget.style, { background: '#1f2937', borderColor: '#374151' })}
              style={styles.accordionHeader}
            >
              <span style={styles.accordionTitle}>🎛️ Сетевое железо</span>
              <span style={styles.accordionIcon}>{isNetworkDevicesOpen ? '▼' : '▶'}</span>
            </div>
            {isNetworkDevicesOpen && (
              <div style={{ marginTop: '8px', paddingLeft: '4px' }}>
                {['SWITCH', 'ROUTER', 'WIFI'].map((key) => {
                  const device = DEVICE_TYPES[key];
                  return (
                    <button
                      key={key}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('deviceType', key);
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                      onClick={() => addDevice(key)}
                      onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.deviceButtonHover)}
                      onMouseOut={(e) => Object.assign(e.currentTarget.style, { background: '#1f2937', borderColor: '#374151' })}
                      style={styles.deviceButton}
                    >
                      <span style={styles.icon}>{device.icon}</span>
                      <span>{device.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Блок 3: Кибер-безопасность */}
          <div>
            <div
              onClick={() => setIsSecurityDevicesOpen(!isSecurityDevicesOpen)}
              onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.accordionHeaderHover)}
              onMouseOut={(e) => Object.assign(e.currentTarget.style, { background: '#1f2937', borderColor: '#374151' })}
              style={styles.accordionHeader}
            >
              <span style={styles.accordionTitle}>🔒 Кибер-безопасность</span>
              <span style={styles.accordionIcon}>{isSecurityDevicesOpen ? '▼' : '▶'}</span>
            </div>
            {isSecurityDevicesOpen && (
              <div style={{ marginTop: '8px', paddingLeft: '4px' }}>
                <button
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('deviceType', 'HACKER');
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  onClick={() => addDevice('HACKER')}
                  onMouseOver={(e) => Object.assign(e.currentTarget.style, { background: '#7f1d1d', borderColor: '#ef4444' })}
                  onMouseOut={(e) => Object.assign(e.currentTarget.style, { background: '#450a0a', borderColor: '#991b1b' })}
                  style={{
                    ...styles.deviceButton,
                    background: '#450a0a',
                    borderColor: '#991b1b',
                  }}
                >
                  <span style={styles.icon}></span>
                  <span>Hacker PC</span>
                </button>
                <button
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('deviceType', 'FIREWALL');
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  onClick={() => addDevice('FIREWALL')}
                  onMouseOver={(e) => Object.assign(e.currentTarget.style, { background: '#713f12', borderColor: '#f59e0b' })}
                  onMouseOut={(e) => Object.assign(e.currentTarget.style, { background: '#422006', borderColor: '#d97706' })}
                  style={{
                    ...styles.deviceButton,
                    background: '#422006',
                    borderColor: '#d97706',
                  }}
                >
                  <span style={styles.icon}>🛡️</span>
                  <span>Firewall</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* СРЕДНЯЯ ЗОНА - Панель Действий */}
        <div style={styles.sidebarMiddle}>
          <div style={styles.sectionTitle}> Панель Действий</div>

          {/* === КНОПКА НАСТРОЙКИ И ТЕРМИНАЛ === */}
          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={() => {
                console.log('🔧 Кнопка "Настройки и Терминал" нажата!');
                console.log('   selectedNode:', selectedNode);
                console.log('   selectedNodeId:', selectedNodeId);
                if (selectedNode) {
                  console.log('   ✅ Открываем модалку для:', selectedNode.data.label);
                  setIsSettingsOpen(true);
                  setActiveTab('settings');
                } else {
                  console.log('   ⚠️ Устройство не выбрано!');
                  alert('⚠️ Сначала выберите устройство на холсте!');
                }
              }}
              disabled={!selectedNode}
              style={{
                width: '100%',
                padding: '14px',
                background: selectedNode
                  ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                  : '#374151',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                cursor: selectedNode ? 'pointer' : 'not-allowed',
                fontWeight: 'bold',
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: selectedNode ? '0 4px 12px rgba(37, 99, 235, 0.5)' : 'none',
                transition: 'all 0.2s',
                opacity: selectedNode ? 1 : 0.7
              }}
              onMouseEnter={(e) => {
                if (selectedNode) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(37, 99, 235, 0.6)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedNode) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.5)';
                }
              }}
            >
              <span style={{ fontSize: '18px' }}>️</span>
              Настройки и Терминал
            </button>
            {!selectedNode && (
              <p style={{
                fontSize: '12px',
                color: '#9ca3af',
                textAlign: 'center',
                marginTop: '8px',
                fontStyle: 'italic'
              }}>
                👈 Выберите устройство на схеме
              </p>
            )}
          </div>

          {/* Главная кнопка запуска */}
          <button
            onClick={runDHCP}
            disabled={isRunning}
            onMouseOver={(e) => {
              if (!isRunning) Object.assign(e.currentTarget.style, styles.actionButtonGreenHover);
            }}
            onMouseOut={(e) => {
              if (!isRunning) Object.assign(e.currentTarget.style, { background: '#1f2937', color: '#22c55e' });
            }}
            style={{
              ...styles.actionButton,
              ...styles.actionButtonGreen,
              ...(isRunning ? styles.launchButtonDisabled : {}),
            }}
          >
            <span>▶️ Запустить сеть (DHCP)</span>
          </button>

          {/* Секция атак */}
          <div style={styles.divider} />
          <div style={styles.sectionLabel}>⚔️ Симуляция Атак</div>
          <button
            onClick={triggerDDoSAttack}
            onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.attackButtonDDoSHover)}
            onMouseOut={(e) => Object.assign(e.currentTarget.style, { background: 'linear-gradient(135deg, #dc2626, #991b1b)' })}
            style={{ ...styles.attackButton, ...styles.attackButtonDDoS }}
          >
            <span>🔴 DDoS Атака</span>
          </button>
          <button
            onClick={triggerPortScan}
            onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.attackButtonScanHover)}
            onMouseOut={(e) => Object.assign(e.currentTarget.style, { background: 'linear-gradient(135deg, #ea580c, #9a3412)' })}
            style={{ ...styles.attackButton, ...styles.attackButtonScan }}
          >
            <span>🟠 Скан портов</span>
          </button>

          {/* Управление - полезные действия */}
          <div style={styles.divider} />
          <div style={styles.sectionLabel}>🔧 Управление</div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handlePlanUpload}
          />
          <input
            type="file"
            accept=".json,application/json"
            ref={fileImportRef}
            style={{ display: 'none' }}
            onChange={handleImportScheme}
          />

          {!nodes.some(n => n.id === 'office-plan-bg') ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.actionButtonBlueHover)}
              onMouseOut={(e) => Object.assign(e.currentTarget.style, { background: '#1f2937', color: '#3b82f6' })}
              style={{ ...styles.actionButton, ...styles.actionButtonBlue, marginBottom: '8px' }}
            >
              <span>🗺️ Загрузить план офиса</span>
            </button>
          ) : (
            <button
              onClick={handleRemovePlan}
              onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.actionButtonRedHover)}
              onMouseOut={(e) => Object.assign(e.currentTarget.style, { background: '#1f2937', color: '#ef4444' })}
              style={{ ...styles.actionButton, ...styles.actionButtonRed, marginBottom: '8px' }}
            >
              <span> Удалить план</span>
            </button>
          )}

          {/* Экспорт/Импорт схемы */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <button
              onClick={handleExportScheme}
              onMouseOver={(e) => Object.assign(e.currentTarget.style, { background: '#374151', borderColor: '#60a5fa' })}
              onMouseOut={(e) => Object.assign(e.currentTarget.style, { background: '#1f2937', borderColor: '#3b82f6', color: '#3b82f6' })}
              style={{
                flex: 1,
                padding: '8px',
                background: '#1f2937',
                border: '1px solid #3b82f6',
                color: '#3b82f6',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                transition: 'all 0.2s',
              }}
            >
              💾 Экспорт
            </button>
            <button
              onClick={() => fileImportRef.current?.click()}
              onMouseOver={(e) => Object.assign(e.currentTarget.style, { background: '#374151', borderColor: '#60a5fa' })}
              onMouseOut={(e) => Object.assign(e.currentTarget.style, { background: '#1f2937', borderColor: '#3b82f6', color: '#3b82f6' })}
              style={{
                flex: 1,
                padding: '8px',
                background: '#1f2937',
                border: '1px solid #3b82f6',
                color: '#3b82f6',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                transition: 'all 0.2s',
              }}
            >
              📂 Импорт
            </button>
          </div>

          {/* ОПАСНАЯ ЗОНА */}
          <div style={{
            marginTop: '16px',
            background: 'rgba(239, 68, 68, 0.05)',
            border: '1px dashed #ef4444',
            borderRadius: '8px',
            padding: '12px'
          }}>
            <div style={{
              fontSize: '11px',
              fontWeight: '700',
              color: '#f87171',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              ⚠️ Опасная зона
            </div>
            <button
              onClick={() => {
                const hasSelected = getNodes()?.some(n => n.selected);
                if (!hasSelected) return;
                if (window.confirm('Вы уверены, что хотите удалить выбранные устройства?')) {
                  handleDeleteSelected();
                }
              }}
              disabled={!getNodes()?.some(n => n.selected)}
              onMouseOver={(e) => {
                if (!getNodes()?.some(n => n.selected)) return;
                Object.assign(e.currentTarget.style, { background: '#ef4444', color: '#fff' });
              }}
              onMouseOut={(e) => {
                Object.assign(e.currentTarget.style, { background: 'transparent', color: '#ef4444' });
              }}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '8px',
                background: 'transparent',
                border: '1px solid #ef4444',
                color: getNodes()?.some(n => n.selected) ? '#ef4444' : '#6b7280',
                borderRadius: '6px',
                cursor: getNodes()?.some(n => n.selected) ? 'pointer' : 'not-allowed',
                fontWeight: 'bold',
                fontSize: '13px',
                opacity: getNodes()?.some(n => n.selected) ? 1 : 0.5,
                transition: 'all 0.2s',
              }}
            >
              🗑️ Удалить выбранное
            </button>
            <button
              onClick={() => {
                if (window.confirm('Вы уверены, что хотите очистить всю схему? Это действие нельзя отменить!')) {
                  setNodes([]);
                  setEdges([]);
                  setLogs([]);
                  addLog('🗑️ Рабочая область очищена');
                }
              }}
              onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.actionButtonDangerOutlineHover)}
              onMouseOut={(e) => Object.assign(e.currentTarget.style, { background: 'transparent', color: '#f87171' })}
              style={{
                ...styles.actionButton,
                ...styles.actionButtonDangerOutline,
                width: '100%',
                marginBottom: '8px',
                background: 'transparent',
              }}
            >
              <span>⚠️ Очистить всё</span>
            </button>
            <button
              onClick={() => {
                if (window.confirm('Вы уверены, что хотите сбросить LocalStorage? Все сохранённые данные будут удалены!')) {
                  handleHardReset();
                }
              }}
              onMouseOver={(e) => Object.assign(e.currentTarget.style, { background: '#7f1d1d', color: '#fff' })}
              onMouseOut={(e) => Object.assign(e.currentTarget.style, { background: 'transparent', color: '#9ca3af' })}
              style={{
                width: '100%',
                padding: '8px',
                background: 'transparent',
                border: '1px dashed #4b5563',
                color: '#9ca3af',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '11px',
                transition: 'all 0.2s',
              }}
            >
              🔄 Сброс LocalStorage
            </button>
          </div>

          {/* Кнопка Справка и Инструкция - OUTLINE стиль */}
          <button
            onClick={() => setShowHelpModal(true)}
            style={{
              width: '100%',
              padding: '10px',
              marginTop: '16px',
              background: 'transparent',
              border: '1px solid #475569',
              color: '#94a3b8',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.target.style.borderColor = '#3b82f6';
              e.target.style.color = '#60a5fa';
            }}
            onMouseOut={(e) => {
              e.target.style.borderColor = '#475569';
              e.target.style.color = '#94a3b8';
            }}
          >
            ❓ Справка и Инструкция
          </button>
        </div>

        {/* НИЖНЯЯ ЗОНА - Mini-Dashboard со статистикой */}
        <div style={styles.sidebarFooter}>
          <div style={{
            background: '#0f172a',
            borderRadius: '12px',
            padding: '14px',
            border: '1px solid #1e293b',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#34d399',
                }}>
                  {nodes.filter(n => n.type === 'custom').length}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#64748b',
                  textTransform: 'uppercase',
                  marginTop: '2px'
                }}>
                  Устройств
                </div>
              </div>
              <div style={{
                width: '1px',
                height: '40px',
                background: '#1e293b',
                margin: '0 8px'
              }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#60a5fa',
                }}>
                  {edges.length}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#64748b',
                  textTransform: 'uppercase',
                  marginTop: '2px'
                }}>
                  Связей
                </div>
              </div>
              <div style={{
                width: '1px',
                height: '40px',
                background: '#1e293b',
                margin: '0 8px'
              }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#fbbf24',
                }}>
                  {logs.length}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#64748b',
                  textTransform: 'uppercase',
                  marginTop: '2px'
                }}>
                  Событий
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* МОДАЛЬНОЕ ОКНО НАСТРОЕК УСТРОЙСТВА - ГЛОБАЛЬНЫЙ ОВЕРЛЕЙ */}
      {showModal && selectedNode && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            style={{
              background: '#1a1f2c',
              borderRadius: '12px',
              padding: '0',
              width: '600px',
              maxWidth: '90%',
              border: '1px solid #2d3548',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <DeviceModal
              node={selectedNode}
              onClose={() => setShowModal(false)}
              onUpdate={updateNodeData}
              onAddLog={addLog}
              nodes={nodes}
              edges={edges}
              checkConnectionBetweenNodes={checkConnectionBetweenNodes}
              setNodes={setNodes}
              setSelectedNode={setSelectedNode}
              compromisedServers={compromisedServers}
              recoverServer={recoverServer}
            />
          </div>
        </div>
      )}

      {/* НОВОЕ МОДАЛЬНОЕ ОКНО "НАСТРОЙКИ И ТЕРМИНАЛ" - ПЕРЕТАСКИВАЕМОЕ */}
      {isSettingsOpen && selectedNode && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.75)',
            zIndex: 2000
          }}
          onClick={() => setIsSettingsOpen(false)}
        >
          <div
            ref={modalRef}
            style={{
              position: 'absolute',
              left: modalPosition.x,
              top: modalPosition.y,
              backgroundColor: '#141822',
              border: '2px solid #2d3548',
              borderRadius: '12px',
              width: '600px',
              padding: '0',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              cursor: isDragging ? 'grabbing' : 'default'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Заголовок с кнопкой закрытия - зона для перетаскивания */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px 25px',
                borderBottom: '1px solid #2d3548',
                background: '#161b22',
                cursor: 'grab',
                userSelect: 'none'
              }}
              onMouseDown={handleModalMouseDown}
            >
              <h3 style={{ margin: 0, color: '#fff', fontSize: '18px' }}>⚙️ Настройки и Терминал: {selectedNode.data.label}</h3>
              <button onClick={() => setIsSettingsOpen(false)} style={{ background: 'transparent', border: 'none', color: '#a0aec0', fontSize: '24px', cursor: 'pointer', padding: '5px 10px', borderRadius: '4px' }}>✕</button>
            </div>

            {/* Вкладки */}
            <div style={{ display: 'flex', gap: '10px', padding: '15px 25px', borderBottom: '1px solid #2d3548', background: '#1a1f2c' }}>
              <button
                onClick={() => setActiveTab('settings')}
                style={{
                  padding: '10px 20px',
                  background: activeTab === 'settings' ? '#3b82f6' : '#2d3748',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                🌐 НАСТРОЙКИ
              </button>
              <button
                onClick={() => setActiveTab('terminal')}
                style={{
                  padding: '10px 20px',
                  background: activeTab === 'terminal' ? '#3b82f6' : '#2d3748',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                🖥️ ТЕРМИНАЛ
              </button>
            </div>

            {/* Содержимое вкладок */}
            <div style={{ padding: '25px' }}>
              {activeTab === 'settings' && (
                <SettingsTabContent
                  node={selectedNode}
                  onUpdate={updateNodeData}
                  onClose={() => setIsSettingsOpen(false)}
                  onAddLog={addLog}
                  nodes={nodes}
                  setNodes={setNodes}
                  setSelectedNode={setSelectedNode}
                  compromisedServers={compromisedServers}
                  recoverServer={recoverServer}
                />
              )}
              {activeTab === 'terminal' && (
                <TerminalTabContent
                  node={selectedNode}
                  nodes={nodes}
                  edges={edges}
                  checkConnectionBetweenNodes={checkConnectionBetweenNodes}
                  checkSameVlan={checkSameVlan}
                  animatePing={animatePing}
                  addLog={addLog}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО СПРАВКИ */}
      {showHelpModal && (
        <HelpModal onClose={() => setShowHelpModal(false)} />
      )}
    </div>
  );
};

// ==================== КОМПОНЕНТ HELP MODAL С АККОРДЕОН
