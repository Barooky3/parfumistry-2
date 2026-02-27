import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
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

// Only brands visible on homepage brand navigation + key store sections
const STORE_SECTIONS: { key: string; label: string; color: string; pos: [number, number, number] }[] = [
  { key: 'bestsellers', label: 'Best Sellers', color: '#8B5CF6', pos: [-5.5, 0, 4] },
  { key: 'shop', label: 'All Fragrances', color: '#6B7280', pos: [0, 0, 4] },
  { key: 'brand-versace', label: 'Versace', color: '#1E90FF', pos: [5.5, 0, 4] },
  { key: 'brand-jean-paul-gaultier', label: 'JPG', color: '#C58917', pos: [-5.5, 0, 0] },
  { key: 'brand-yves-saint-laurent', label: 'YSL', color: '#1a1a1a', pos: [0, 0, 0] },
  { key: 'brand-valentino', label: 'Valentino', color: '#8B1A3A', pos: [5.5, 0, 0] },
  { key: 'brand-azzaro', label: 'Azzaro', color: '#C9A96E', pos: [-5.5, 0, -4] },
  { key: 'brand-giorgio-armani', label: 'Armani', color: '#C0392B', pos: [0, 0, -4] },
  { key: 'brand-louis-vuitton', label: 'Louis Vuitton', color: '#8B6914', pos: [5.5, 0, -4] },
  { key: 'brand-parfums-de-marly', label: 'PDM', color: '#D4A76A', pos: [-5.5, 0, -8] },
  { key: 'brand-creed', label: 'Creed', color: '#2D2D2D', pos: [0, 0, -8] },
  { key: 'brand-mancera', label: 'Mancera', color: '#B8860B', pos: [5.5, 0, -8] },
];

const SECTION_MAP: Record<string, [number, number, number]> = {};
STORE_SECTIONS.forEach(s => { SECTION_MAP[s.key] = s.pos; });
SECTION_MAP['entrance'] = [0, 0, 10];
SECTION_MAP['cashier'] = [7, 0, -12];

function getSectionPosition(section: string): [number, number, number] {
  if (SECTION_MAP[section]) return SECTION_MAP[section];
  // Fallback for unknown brands
  const hash = section.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return [(hash % 8) - 4, 0, (hash % 6) - 3];
}

// --- Shelf ---
function Shelf({ position, label, color }: { position: [number, number, number]; label: string; color: string }) {
  const bottles = useMemo(() => {
    const arr: [number, number, number][] = [];
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 5; c++)
        arr.push([c * 0.32 - 0.64, 0.92 + r * 0.3, r * 0.08 - 0.08]);
    return arr;
  }, []);

  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[2.2, 0.8, 0.7]} />
        <meshStandardMaterial color="#8a8a8a" />
      </mesh>
      {/* Shelves */}
      {[0, 1, 2].map(i => (
        <mesh key={i} position={[0, 0.85 + i * 0.3, 0]}>
          <boxGeometry args={[2.3, 0.04, 0.75]} />
          <meshStandardMaterial color="#a0a0a0" />
        </mesh>
      ))}
      {/* Bottles */}
      {bottles.map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[0.1, 0.18, 0.08]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
      {/* Label plate */}
      <mesh position={[0, 1.75, 0]}>
        <boxGeometry args={[1.8, 0.28, 0.04]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Text
        position={[0, 1.75, 0.03]}
        fontSize={0.16}
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

// --- Character ---
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
    movingRef.current = dist > 0.05;
    if (movingRef.current) {
      // Smooth, slow movement
      posRef.current.lerp(target, Math.min(delta * 0.8, 0.03));
      bobRef.current += delta * 6;
    }
    groupRef.current.position.copy(posRef.current);
    groupRef.current.position.y = movingRef.current ? Math.abs(Math.sin(bobRef.current)) * 0.06 : 0;
    if (movingRef.current) {
      const dir = target.clone().sub(posRef.current).normalize();
      if (dir.length() > 0.01) {
        const targetY = Math.atan2(dir.x, dir.z);
        groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * Math.min(delta * 3, 0.15);
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
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.35, 0.45, 24]} />
          <meshBasicMaterial color="#facc15" side={THREE.DoubleSide} />
        </mesh>
      )}
      {/* Body */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[0.3, 0.45, 0.18]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.85, 0]}>
        <boxGeometry args={[0.22, 0.22, 0.22]} />
        <meshStandardMaterial color="#FFD5B8" />
      </mesh>
      {/* Shopping bag */}
      {hasCart && (
        <mesh position={[0.22, 0.35, 0]}>
          <boxGeometry args={[0.12, 0.16, 0.08]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>
      )}
    </group>
  );
}

// --- Cashier ---
function CashierDesk() {
  const pos = SECTION_MAP['cashier'];
  return (
    <group position={pos}>
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[2.2, 0.7, 0.9]} />
        <meshStandardMaterial color="#555" />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[0.5, 0.3, 0.4]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0, 1.05, -0.12]}>
        <boxGeometry args={[0.4, 0.25, 0.04]} />
        <meshStandardMaterial color="#4ade80" emissive="#4ade80" emissiveIntensity={0.4} />
      </mesh>
      <Text position={[0, 1.45, 0]} fontSize={0.2} color="#d97706" anchorX="center" font={undefined}>
        CHECKOUT
      </Text>
    </group>
  );
}

// --- Floor ---
function StoreFloor() {
  return (
    <>
      {/* Main floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, -1]} receiveShadow>
        <planeGeometry args={[22, 28]} />
        <meshStandardMaterial color="#e0ddd5" />
      </mesh>
      {/* Ground plane around store */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, -1]}>
        <planeGeometry args={[30, 36]} />
        <meshStandardMaterial color="#5a9a5a" />
      </mesh>
    </>
  );
}

// --- Grid ---
function FloorGrid() {
  const gridLines = useMemo(() => {
    const mat = new THREE.LineBasicMaterial({ color: '#ccc8c0', transparent: true, opacity: 0.4 });
    const objs: THREE.Line[] = [];
    for (let x = -11; x <= 11; x += 2) {
      const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, 0, -15), new THREE.Vector3(x, 0, 13)]);
      objs.push(new THREE.Line(g, mat));
    }
    for (let z = -15; z <= 13; z += 2) {
      const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-11, 0, z), new THREE.Vector3(11, 0, z)]);
      objs.push(new THREE.Line(g, mat));
    }
    return objs;
  }, []);

  return (
    <group position={[0, 0.001, 0]}>
      {gridLines.map((line, i) => (
        <primitive key={i} object={line} />
      ))}
    </group>
  );
}

// --- Walls ---
function StoreWalls() {
  const wallOpacity = 0.12;
  const frameColor = '#444';
  const wallH = 4.5;
  const w = 22, d = 28;

  return (
    <>
      {/* Back */}
      <mesh position={[0, wallH / 2, -15]}>
        <boxGeometry args={[w, wallH, 0.1]} />
        <meshStandardMaterial color="#bbb" transparent opacity={wallOpacity} />
      </mesh>
      {/* Left */}
      <mesh position={[-11, wallH / 2, -1]}>
        <boxGeometry args={[0.1, wallH, d]} />
        <meshStandardMaterial color="#bbb" transparent opacity={wallOpacity} />
      </mesh>
      {/* Right */}
      <mesh position={[11, wallH / 2, -1]}>
        <boxGeometry args={[0.1, wallH, d]} />
        <meshStandardMaterial color="#bbb" transparent opacity={wallOpacity} />
      </mesh>
      {/* Front - with entrance gap */}
      <mesh position={[-7, wallH / 2, 13]}>
        <boxGeometry args={[8, wallH, 0.1]} />
        <meshStandardMaterial color="#bbb" transparent opacity={wallOpacity} />
      </mesh>
      <mesh position={[7, wallH / 2, 13]}>
        <boxGeometry args={[8, wallH, 0.1]} />
        <meshStandardMaterial color="#bbb" transparent opacity={wallOpacity} />
      </mesh>

      {/* Frame edges */}
      {/* Top */}
      <mesh position={[0, wallH, -15]}><boxGeometry args={[w + 0.2, 0.08, 0.15]} /><meshStandardMaterial color={frameColor} /></mesh>
      <mesh position={[-11, wallH, -1]}><boxGeometry args={[0.15, 0.08, d + 0.2]} /><meshStandardMaterial color={frameColor} /></mesh>
      <mesh position={[11, wallH, -1]}><boxGeometry args={[0.15, 0.08, d + 0.2]} /><meshStandardMaterial color={frameColor} /></mesh>
      {/* Bottom */}
      <mesh position={[0, 0, -15]}><boxGeometry args={[w + 0.2, 0.08, 0.15]} /><meshStandardMaterial color={frameColor} /></mesh>
      <mesh position={[-11, 0, -1]}><boxGeometry args={[0.15, 0.08, d + 0.2]} /><meshStandardMaterial color={frameColor} /></mesh>
      <mesh position={[11, 0, -1]}><boxGeometry args={[0.15, 0.08, d + 0.2]} /><meshStandardMaterial color={frameColor} /></mesh>
      {/* Corner pillars */}
      {[[-11, -15], [11, -15], [-11, 13], [11, 13]].map(([x, z], i) => (
        <mesh key={i} position={[x, wallH / 2, z]}>
          <boxGeometry args={[0.15, wallH, 0.15]} />
          <meshStandardMaterial color={frameColor} />
        </mesh>
      ))}

      {/* Store name */}
      <Text position={[0, 3.6, -14.8]} fontSize={0.65} color="#1a5c2e" anchorX="center" font={undefined}>
        PROFPARFUMS
      </Text>

      {/* Entrance mat */}
      <mesh position={[0, 0.005, 13.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 1.5]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>
      <Text position={[0, 0.02, 13.5]} fontSize={0.25} color="#ddd" anchorX="center" rotation={[-Math.PI / 2, 0, 0]} font={undefined}>
        ENTRANCE
      </Text>
    </>
  );
}

// --- Customer Info Card (fixed position, outside canvas) ---
function CustomerInfoCard({ session, onClose }: { session: VisitorSession; onClose: () => void }) {
  const hasCart = session.cart_items && session.cart_items.length > 0;
  const createdAt = new Date(session.created_at);
  const secsAgo = Math.floor((Date.now() - createdAt.getTime()) / 1000);
  const timeLabel = secsAgo < 10 ? 'just now' : secsAgo < 60 ? `${secsAgo}s ago` : `${Math.floor(secsAgo / 60)}m ago`;
  const isReturning = session.user_email != null;

  return (
    <div style={{
      position: 'absolute', top: 12, right: 12, zIndex: 20,
      background: '#fff', borderRadius: 8, padding: 16,
      width: 280, boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
      border: '1px solid #e5e5e5', fontSize: 13, color: '#333',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontWeight: 700, fontSize: 14 }}>Customer</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#999', lineHeight: 1 }}>×</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
        <div>📍 From <strong>{session.country || 'Unknown'}</strong></div>
        <div>🕐 Arrived <strong>{timeLabel}</strong></div>
        <div>📱 {session.device_type || 'Unknown'} device</div>
        <div>{isReturning ? '🔁 Returning customer' : '🆕 New visitor'}</div>
        {session.user_email && <div>✉️ {session.user_email}</div>}
      </div>

      {hasCart ? (
        <div style={{ borderTop: '1px solid #eee', paddingTop: 8 }}>
          <div style={{ fontWeight: 600, color: '#16a34a', marginBottom: 6 }}>
            🛒 €{(session.cart_total || 0).toFixed(2)} ({session.cart_items.length} item{session.cart_items.length !== 1 ? 's' : ''})
          </div>
          {(session.cart_items || []).map((item: any, i: number) => (
            <div key={i} style={{ fontSize: 11, color: '#666', display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <span>{item.brand} — {item.name}{item.ml ? ` (${item.ml}ml)` : ''}{item.quantity > 1 ? ` ×${item.quantity}` : ''}</span>
              <span style={{ whiteSpace: 'nowrap', marginLeft: 8 }}>€{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ borderTop: '1px solid #eee', paddingTop: 8, color: '#999' }}>🛒 Cart is empty</div>
      )}
    </div>
  );
}

// --- Camera setup ---
function CameraRig() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(20, 18, 24);
    camera.lookAt(0, 0, -1);
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
        dampingFactor={0.08}
        maxPolarAngle={Math.PI / 2.1}
        minPolarAngle={0.2}
        minDistance={4}
        maxDistance={50}
        target={[0, 0, -1]}
        enablePan
        panSpeed={0.8}
        rotateSpeed={0.6}
        zoomSpeed={1.2}
      />

      <ambientLight intensity={0.7} />
      <directionalLight position={[15, 25, 20]} intensity={0.75} castShadow />
      <hemisphereLight args={['#b0d4f1', '#8a9a5a', 0.3]} />

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
          basePos[0] + ((hash % 5) - 2) * 0.4,
          0,
          basePos[2] + ((hash % 7) - 3) * 0.35 + 1.2,
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
        style={{ background: 'linear-gradient(180deg, #c8dce8 0%, #a8c8a8 100%)' }}
        onPointerMissed={() => setSelectedId(null)}
      >
        <StoreScene sessions={sessions} selectedId={selectedId} onSelectSession={setSelectedId} />
      </Canvas>

      {/* Customer info card - outside canvas for reliable clicking */}
      {selectedSession && (
        <CustomerInfoCard session={selectedSession} onClose={() => setSelectedId(null)} />
      )}

      {/* HUD */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        padding: '20px 28px',
        pointerEvents: 'none',
        background: 'linear-gradient(transparent, rgba(0,0,0,0.25))',
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
