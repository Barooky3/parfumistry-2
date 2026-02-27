import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { useRef, useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';
import { getStoreSection } from './LiveVisitorDashboard';

interface VisitorSession {
  session_id: string;
  current_page: string;
  cart_items: any[];
  cart_total: number;
  is_in_checkout: boolean;
  user_email: string | null;
  country: string | null;
  created_at: string;
  pages_viewed?: string[];
  device_type?: string | null;
  browser?: string | null;
}

interface StoreVisualizationProps {
  sessions: VisitorSession[];
}

// Store layout — 4 columns × 3 rows of shelves, matching reference image layout
const STORE_SECTIONS: { key: string; label: string; color: string; pos: [number, number, number] }[] = [
  // Row 1 (back, near the store name)
  { key: 'brand-mancera', label: 'Mancera', color: '#8B6914', pos: [-9, 0, -7] },
  { key: 'brand-creed', label: 'Creed', color: '#555', pos: [-3, 0, -7] },
  { key: 'brand-parfums-de-marly', label: 'PDM', color: '#7a5c3a', pos: [3, 0, -7] },
  { key: 'bestsellers', label: 'Best Sellers', color: '#8B5CF6', pos: [9, 0, -7] },
  // Row 2 (middle)
  { key: 'brand-azzaro', label: 'Azzaro', color: '#C9A96E', pos: [-9, 0, -1] },
  { key: 'brand-jean-paul-gaultier', label: 'JPG', color: '#C58917', pos: [-3, 0, -1] },
  { key: 'brand-versace', label: 'Versace', color: '#1E90FF', pos: [3, 0, -1] },
  { key: 'brand-giorgio-armani', label: 'Armani', color: '#C0392B', pos: [9, 0, -1] },
  // Row 3 (front, near entrance)
  { key: 'brand-louis-vuitton', label: 'Louis Vuitton', color: '#3a3a3a', pos: [-9, 0, 5] },
  { key: 'brand-yves-saint-laurent', label: 'YSL', color: '#1a1a1a', pos: [-3, 0, 5] },
  { key: 'brand-valentino', label: 'Valentino', color: '#8B1A3A', pos: [3, 0, 5] },
  { key: 'shop', label: 'All Fragrances', color: '#4a7a4a', pos: [9, 0, 5] },
];

const SECTION_MAP: Record<string, [number, number, number]> = {};
STORE_SECTIONS.forEach(s => { SECTION_MAP[s.key] = s.pos; });
SECTION_MAP['entrance'] = [0, 0, 12];
SECTION_MAP['cashier'] = [6, 0, 9]; // Near entrance, front-right

function getSectionPosition(section: string): [number, number, number] {
  if (SECTION_MAP[section]) return SECTION_MAP[section];
  const hash = section.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return [(hash % 8) - 4, 0, (hash % 6) - 3];
}

// --- Tall Shelf with bottles ---
function Shelf({ position, label, color }: { position: [number, number, number]; label: string; color: string }) {
  const bottles = useMemo(() => {
    const arr: [number, number, number][] = [];
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 5; c++)
        arr.push([c * 0.35 - 0.7, 0.95 + r * 0.32, r * 0.1 - 0.1]);
    return arr;
  }, []);

  return (
    <group position={position}>
      {/* Shelf body */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[2.4, 1, 0.7]} />
        <meshStandardMaterial color="#8a8a8a" />
      </mesh>
      {/* Shelf layers */}
      {[0, 1, 2].map(i => (
        <mesh key={i} position={[0, 0.88 + i * 0.32, 0]}>
          <boxGeometry args={[2.5, 0.05, 0.75]} />
          <meshStandardMaterial color="#a0a0a0" />
        </mesh>
      ))}
      {/* Product bottles */}
      {bottles.map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[0.12, 0.2, 0.1]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
      {/* Label plate */}
      <mesh position={[0, 1.72, 0]}>
        <boxGeometry args={[1.9, 0.3, 0.05]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Text
        position={[0, 1.72, 0.04]}
        fontSize={0.17}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        {label}
      </Text>
    </group>
  );
}

// --- Character (bigger, chunky like reference) ---
function Character({
  session,
  targetPosition,
  onSelect,
  isSelected,
}: {
  session: VisitorSession;
  targetPosition: [number, number, number];
  onSelect: () => void;
  isSelected: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const posRef = useRef(new THREE.Vector3(...targetPosition));
  const target = useMemo(() => new THREE.Vector3(...targetPosition), [targetPosition]);
  const hasCart = session.cart_items && session.cart_items.length > 0;
  const bodyColor = hasCart ? '#22c55e' : '#ef4444';
  const bobRef = useRef(0);
  const movingRef = useRef(false);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const dist = posRef.current.distanceTo(target);
    movingRef.current = dist > 0.08;
    if (movingRef.current) {
      posRef.current.lerp(target, Math.min(delta * 0.6, 0.025));
      bobRef.current += delta * 5;
    }
    groupRef.current.position.copy(posRef.current);
    groupRef.current.position.y = movingRef.current ? Math.abs(Math.sin(bobRef.current)) * 0.08 : 0;
    if (movingRef.current) {
      const dir = target.clone().sub(posRef.current).normalize();
      if (dir.length() > 0.01) {
        const ty = Math.atan2(dir.x, dir.z);
        groupRef.current.rotation.y += (ty - groupRef.current.rotation.y) * Math.min(delta * 2, 0.1);
      }
    }
  });

  return (
    <group
      ref={groupRef}
      onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect(); }}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; }}
    >
      {/* Selection ring */}
      {isSelected && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.6, 0.75, 24]} />
          <meshBasicMaterial color="#facc15" side={THREE.DoubleSide} />
        </mesh>
      )}
      {/* Legs */}
      <mesh position={[-0.15, 0.35, 0]}>
        <boxGeometry args={[0.22, 0.7, 0.25]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      <mesh position={[0.15, 0.35, 0]}>
        <boxGeometry args={[0.22, 0.7, 0.25]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      {/* Body */}
      <mesh position={[0, 1.0, 0]}>
        <boxGeometry args={[0.6, 0.7, 0.35]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.42, 0.95, 0]}>
        <boxGeometry args={[0.18, 0.55, 0.2]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      <mesh position={[0.42, 0.95, 0]}>
        <boxGeometry args={[0.18, 0.55, 0.2]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#FFD5B8" />
      </mesh>
      {/* Shopping bag */}
      {hasCart && (
        <mesh position={[0.5, 0.7, 0]}>
          <boxGeometry args={[0.22, 0.3, 0.15]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>
      )}
    </group>
  );
}

// --- Cashier (near entrance) ---
function CashierDesk() {
  const pos = SECTION_MAP['cashier'];
  return (
    <group position={pos}>
      {/* Counter */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[2.5, 0.8, 1.2]} />
        <meshStandardMaterial color="#555" />
      </mesh>
      {/* Register box */}
      <mesh position={[0.3, 0.9, 0]}>
        <boxGeometry args={[0.6, 0.3, 0.5]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Screen */}
      <mesh position={[0.3, 1.15, -0.15]}>
        <boxGeometry args={[0.45, 0.3, 0.05]} />
        <meshStandardMaterial color="#4ade80" emissive="#4ade80" emissiveIntensity={0.3} />
      </mesh>
      {/* Cash drawer */}
      <mesh position={[-0.5, 0.85, 0.2]}>
        <boxGeometry args={[0.5, 0.08, 0.4]} />
        <meshStandardMaterial color="#444" />
      </mesh>
    </group>
  );
}

// --- Floor ---
function StoreFloor() {
  return (
    <>
      {/* Store floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[28, 30]} />
        <meshStandardMaterial color="#ddd9d0" />
      </mesh>
      {/* Grass around store */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]}>
        <planeGeometry args={[40, 42]} />
        <meshStandardMaterial color="#5a9a5a" />
      </mesh>
    </>
  );
}

// --- Grid ---
function FloorGrid() {
  const gridLines = useMemo(() => {
    const mat = new THREE.LineBasicMaterial({ color: '#c8c4ba', transparent: true, opacity: 0.35 });
    const objs: THREE.Line[] = [];
    for (let x = -14; x <= 14; x += 1) {
      objs.push(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, 0, -14), new THREE.Vector3(x, 0, 14)]),
        mat
      ));
    }
    for (let z = -14; z <= 14; z += 1) {
      objs.push(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-14, 0, z), new THREE.Vector3(14, 0, z)]),
        mat
      ));
    }
    return objs;
  }, []);

  return (
    <group position={[0, 0.002, 0]}>
      {gridLines.map((l, i) => <primitive key={i} object={l} />)}
    </group>
  );
}

// --- Walls (glass with dark frame) ---
function StoreWalls() {
  const o = 0.1;
  const fc = '#3a3a3a';
  const h = 4;
  const w = 28, d = 28;
  const hw = w / 2, hd = d / 2;

  return (
    <>
      {/* Glass panels */}
      <mesh position={[0, h / 2, -hd]}><boxGeometry args={[w, h, 0.08]} /><meshStandardMaterial color="#aaa" transparent opacity={o} /></mesh>
      <mesh position={[-hw, h / 2, 0]}><boxGeometry args={[0.08, h, d]} /><meshStandardMaterial color="#aaa" transparent opacity={o} /></mesh>
      <mesh position={[hw, h / 2, 0]}><boxGeometry args={[0.08, h, d]} /><meshStandardMaterial color="#aaa" transparent opacity={o} /></mesh>
      {/* Front with gap */}
      <mesh position={[-9, h / 2, hd]}><boxGeometry args={[10, h, 0.08]} /><meshStandardMaterial color="#aaa" transparent opacity={o} /></mesh>
      <mesh position={[9, h / 2, hd]}><boxGeometry args={[10, h, 0.08]} /><meshStandardMaterial color="#aaa" transparent opacity={o} /></mesh>

      {/* Dark frame — top edges */}
      <mesh position={[0, h, -hd]}><boxGeometry args={[w + 0.2, 0.12, 0.15]} /><meshStandardMaterial color={fc} /></mesh>
      <mesh position={[-hw, h, 0]}><boxGeometry args={[0.15, 0.12, d + 0.2]} /><meshStandardMaterial color={fc} /></mesh>
      <mesh position={[hw, h, 0]}><boxGeometry args={[0.15, 0.12, d + 0.2]} /><meshStandardMaterial color={fc} /></mesh>
      <mesh position={[0, h, hd]}><boxGeometry args={[w + 0.2, 0.12, 0.15]} /><meshStandardMaterial color={fc} /></mesh>
      {/* Bottom edges */}
      <mesh position={[0, 0, -hd]}><boxGeometry args={[w + 0.2, 0.12, 0.15]} /><meshStandardMaterial color={fc} /></mesh>
      <mesh position={[-hw, 0, 0]}><boxGeometry args={[0.15, 0.12, d + 0.2]} /><meshStandardMaterial color={fc} /></mesh>
      <mesh position={[hw, 0, 0]}><boxGeometry args={[0.15, 0.12, d + 0.2]} /><meshStandardMaterial color={fc} /></mesh>
      <mesh position={[0, 0, hd]}><boxGeometry args={[w + 0.2, 0.12, 0.15]} /><meshStandardMaterial color={fc} /></mesh>
      {/* Corner pillars */}
      {[[-hw, -hd], [hw, -hd], [-hw, hd], [hw, hd]].map(([x, z], i) => (
        <mesh key={i} position={[x, h / 2, z]}><boxGeometry args={[0.2, h, 0.2]} /><meshStandardMaterial color={fc} /></mesh>
      ))}
      {/* Mid pillars on front wall */}
      <mesh position={[-4, h / 2, hd]}><boxGeometry args={[0.15, h, 0.15]} /><meshStandardMaterial color={fc} /></mesh>
      <mesh position={[4, h / 2, hd]}><boxGeometry args={[0.15, h, 0.15]} /><meshStandardMaterial color={fc} /></mesh>

      {/* Store name */}
      <Text position={[0, 3.2, -hd + 0.2]} fontSize={0.8} color="#1a6b2e" anchorX="center" font={undefined}>
        PROFPARFUMS
      </Text>

      {/* Entrance area — green strip like ref */}
      <mesh position={[0, 0.005, hd + 0.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 1.5]} />
        <meshStandardMaterial color="#6aaa6a" />
      </mesh>
    </>
  );
}

// --- Customer Info Card ---
function CustomerInfoCard({ session, onClose }: { session: VisitorSession; onClose: () => void }) {
  const hasCart = session.cart_items && session.cart_items.length > 0;
  const createdAt = new Date(session.created_at);
  const secsAgo = Math.floor((Date.now() - createdAt.getTime()) / 1000);
  const timeLabel = secsAgo < 10 ? 'just now' : secsAgo < 60 ? `${secsAgo}s ago` : `${Math.floor(secsAgo / 60)}m ago`;
  const isReturning = session.user_email != null;

  return (
    <div style={{
      position: 'absolute', top: 12, right: 12, zIndex: 20,
      background: '#fff', borderRadius: 10, padding: '14px 16px',
      width: 260, boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
      border: '1px solid #e0e0e0', fontSize: 13, color: '#333',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontWeight: 700, fontSize: 13 }}>Customer</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#999', lineHeight: 1, padding: 0 }}>×</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 8, fontSize: 12 }}>
        <div>📍 From <strong>{session.country || 'Unknown'}</strong></div>
        <div>🕐 Arrived <strong>{timeLabel}</strong></div>
        <div>📱 {session.device_type || 'Unknown'} device</div>
        <div>{isReturning ? '🔁 Returning customer' : '🆕 New visitor'}</div>
        {session.user_email && <div>✉️ {session.user_email}</div>}
      </div>
      {hasCart ? (
        <div style={{ borderTop: '1px solid #eee', paddingTop: 6 }}>
          <div style={{ fontWeight: 600, color: '#16a34a', marginBottom: 4, fontSize: 12 }}>
            🛒 €{(session.cart_total || 0).toFixed(2)} ({session.cart_items.length} item{session.cart_items.length !== 1 ? 's' : ''})
          </div>
          {(session.cart_items || []).map((item: any, i: number) => (
            <div key={i} style={{ fontSize: 11, color: '#666', display: 'flex', justifyContent: 'space-between', marginBottom: 1 }}>
              <span>{item.brand} — {item.name}{item.ml ? ` (${item.ml}ml)` : ''}{item.quantity > 1 ? ` ×${item.quantity}` : ''}</span>
              <span style={{ whiteSpace: 'nowrap', marginLeft: 6 }}>€{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ borderTop: '1px solid #eee', paddingTop: 6, color: '#999', fontSize: 12 }}>🛒 Cart is empty</div>
      )}
    </div>
  );
}

// --- Camera ---
function CameraRig() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(22, 20, 28);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  return null;
}

// --- Scene ---
function StoreScene({ sessions, selectedId, onSelectSession }: {
  sessions: VisitorSession[];
  selectedId: string | null;
  onSelectSession: (id: string | null) => void;
}) {
  return (
    <>
      <CameraRig />
      <OrbitControls
        enableDamping
        dampingFactor={0.06}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={0.15}
        minDistance={3}
        maxDistance={60}
        target={[0, 0, 0]}
        enablePan
        panSpeed={0.6}
        rotateSpeed={0.5}
        zoomSpeed={1}
      />

      <ambientLight intensity={0.75} />
      <directionalLight position={[20, 30, 20]} intensity={0.7} castShadow />
      <hemisphereLight args={['#b8d8f0', '#7aa87a', 0.35]} />

      <StoreFloor />
      <FloorGrid />
      <StoreWalls />
      <CashierDesk />

      {STORE_SECTIONS.map(s => (
        <Shelf key={s.key} position={s.pos} label={s.label} color={s.color} />
      ))}

      {sessions.map(session => {
        const section = getStoreSection(session.current_page);
        const basePos = getSectionPosition(section);
        const hash = session.session_id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
        const offset: [number, number, number] = [
          basePos[0] + ((hash % 5) - 2) * 0.6,
          0,
          basePos[2] + ((hash % 7) - 3) * 0.5 + 1.5,
        ];
        return (
          <Character
            key={session.session_id}
            session={session}
            targetPosition={offset}
            onSelect={() => onSelectSession(selectedId === session.session_id ? null : session.session_id)}
            isSelected={selectedId === session.session_id}
          />
        );
      })}
    </>
  );
}

// --- Main ---
export default function StoreVisualization({ sessions }: StoreVisualizationProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedSession = sessions.find(s => s.session_id === selectedId) || null;

  const totalCartValue = useMemo(
    () => sessions.reduce((sum, s) => sum + (s.cart_total || 0), 0),
    [sessions]
  );

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas
        shadows
        style={{ background: 'linear-gradient(180deg, #c4d8e4 0%, #b0ccb0 100%)' }}
        onPointerMissed={() => setSelectedId(null)}
      >
        <StoreScene sessions={sessions} selectedId={selectedId} onSelectSession={setSelectedId} />
      </Canvas>

      {selectedSession && (
        <CustomerInfoCard session={selectedSession} onClose={() => setSelectedId(null)} />
      )}

      {/* HUD */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        padding: '20px 28px',
        pointerEvents: 'none',
        background: 'linear-gradient(transparent, rgba(0,0,0,0.22))',
      }}>
        <div style={{ color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
          <div style={{ fontSize: 12, opacity: 0.85, fontWeight: 500, letterSpacing: 1 }}>Customers</div>
          <div style={{ fontSize: 44, fontWeight: 700, lineHeight: 1 }}>{sessions.length}</div>
        </div>
        <div style={{ color: '#fff', textAlign: 'right', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
          <div style={{ fontSize: 12, opacity: 0.85, fontWeight: 500, letterSpacing: 1 }}>In Live Carts</div>
          <div style={{ fontSize: 44, fontWeight: 700, lineHeight: 1 }}>€ {totalCartValue.toFixed(0)}</div>
        </div>
      </div>
    </div>
  );
}
