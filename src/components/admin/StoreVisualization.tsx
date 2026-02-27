import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Text, PerspectiveCamera, Html } from '@react-three/drei';
import { useRef, useMemo, useState, useCallback } from 'react';
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
}

interface StoreVisualizationProps {
  sessions: VisitorSession[];
}

// Actual brands from the store, laid out in a grid
const STORE_SECTIONS: { key: string; label: string; color: string; pos: [number, number, number] }[] = [
  { key: 'bestsellers', label: 'Best Sellers', color: '#8B5CF6', pos: [-6, 0, 5] },
  { key: 'shop', label: 'All Fragrances', color: '#6B7280', pos: [-2, 0, 5] },
  { key: 'bundles', label: 'Bundles', color: '#F59E0B', pos: [2, 0, 5] },
  { key: 'brand-mancera', label: 'Mancera', color: '#B8860B', pos: [6, 0, 5] },
  { key: 'brand-valentino', label: 'Valentino', color: '#8B1A3A', pos: [-6, 0, 1] },
  { key: 'brand-versace', label: 'Versace', color: '#1E90FF', pos: [-2, 0, 1] },
  { key: 'brand-jean-paul-gaultier', label: 'JPG', color: '#C58917', pos: [2, 0, 1] },
  { key: 'brand-giorgio-armani', label: 'Armani', color: '#C0392B', pos: [6, 0, 1] },
  { key: 'brand-yves-saint-laurent', label: 'YSL', color: '#2C2C2C', pos: [-6, 0, -3] },
  { key: 'brand-dior', label: 'Dior', color: '#2C3E50', pos: [-2, 0, -3] },
  { key: 'brand-tom-ford', label: 'Tom Ford', color: '#4A1942', pos: [2, 0, -3] },
  { key: 'brand-creed', label: 'Creed', color: '#2D2D2D', pos: [6, 0, -3] },
  { key: 'brand-parfums-de-marly', label: 'PDM', color: '#D4A76A', pos: [-6, 0, -7] },
  { key: 'brand-xerjoff', label: 'Xerjoff', color: '#DAA520', pos: [-2, 0, -7] },
  { key: 'brand-louis-vuitton', label: 'Louis Vuitton', color: '#8B6914', pos: [2, 0, -7] },
  { key: 'brand-lattafa', label: 'Lattafa', color: '#654321', pos: [6, 0, -7] },
  { key: 'brand-viktor---rolf', label: 'Viktor & Rolf', color: '#DC2626', pos: [-4, 0, -11] },
  { key: 'brand-azzaro', label: 'Azzaro', color: '#C9A96E', pos: [0, 0, -11] },
  { key: 'brand-prada', label: 'Prada', color: '#2C2C2C', pos: [4, 0, -11] },
];

const SECTION_MAP = Object.fromEntries(STORE_SECTIONS.map(s => [s.key, s.pos]));
SECTION_MAP['entrance'] = [0, 0, 12];
SECTION_MAP['cashier'] = [8, 0, -11];

function getSectionPosition(section: string): [number, number, number] {
  if (SECTION_MAP[section]) return SECTION_MAP[section];
  const hash = section.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return [(hash % 10) - 5, 0, (hash % 8) - 4];
}

// Shelf with mini bottles on top
function Shelf({ position, label, color }: { position: [number, number, number]; label: string; color: string }) {
  const bottlePositions = useMemo(() => {
    const bottles: [number, number, number][] = [];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        bottles.push([col * 0.35 - 0.52, 1.1 + row * 0.35, row * 0.12 - 0.15]);
      }
    }
    return bottles;
  }, []);

  return (
    <group position={position}>
      {/* Shelf unit - wider and deeper */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[2, 1, 0.8]} />
        <meshStandardMaterial color="#7a6a55" />
      </mesh>
      {/* Shelf layers */}
      {[0, 1, 2].map(i => (
        <mesh key={i} position={[0, 1.0 + i * 0.35, 0]}>
          <boxGeometry args={[2.1, 0.06, 0.85]} />
          <meshStandardMaterial color="#a09070" />
        </mesh>
      ))}
      {/* Mini bottles */}
      {bottlePositions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <boxGeometry args={[0.12, 0.22, 0.1]} />
          <meshStandardMaterial color={color} transparent opacity={0.8} />
        </mesh>
      ))}
      {/* Label sign on front */}
      <mesh position={[0, 0.85, 0.42]}>
        <boxGeometry args={[1.6, 0.3, 0.02]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Text
        position={[0, 0.85, 0.44]}
        fontSize={0.18}
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

// Clickable character
function Character({
  session,
  targetPosition,
  onClick,
  isSelected,
}: {
  session: VisitorSession;
  targetPosition: [number, number, number];
  onClick: () => void;
  isSelected: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const currentPos = useRef(new THREE.Vector3(...targetPosition));
  const target = useMemo(() => new THREE.Vector3(...targetPosition), [targetPosition]);
  const hasCart = session.cart_items && session.cart_items.length > 0;
  const bodyColor = hasCart ? '#22c55e' : '#ef4444';
  const [bobPhase, setBobPhase] = useState(0);
  const isMoving = useRef(false);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const dist = currentPos.current.distanceTo(target);
    isMoving.current = dist > 0.1;
    if (isMoving.current) {
      currentPos.current.lerp(target, Math.min(delta * 2, 1));
      setBobPhase(p => p + delta * 8);
    }
    groupRef.current.position.copy(currentPos.current);
    groupRef.current.position.y = isMoving.current ? Math.abs(Math.sin(bobPhase)) * 0.1 : 0;
    if (isMoving.current) {
      const dir = target.clone().sub(currentPos.current).normalize();
      if (dir.length() > 0.01) groupRef.current.rotation.y = Math.atan2(dir.x, dir.z);
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <group ref={groupRef} onClick={handleClick} onPointerOver={() => { document.body.style.cursor = 'pointer'; }} onPointerOut={() => { document.body.style.cursor = 'auto'; }}>
      {/* Selection ring */}
      {isSelected && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.4, 0.5, 32]} />
          <meshBasicMaterial color="#facc15" />
        </mesh>
      )}
      {/* Body */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.35, 0.5, 0.2]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.95, 0]}>
        <boxGeometry args={[0.25, 0.25, 0.25]} />
        <meshStandardMaterial color="#FFD5B8" />
      </mesh>
      {/* Shopping bag */}
      {hasCart && (
        <mesh position={[0.25, 0.4, 0]}>
          <boxGeometry args={[0.15, 0.2, 0.1]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>
      )}
    </group>
  );
}

// Cashier desk
function CashierDesk() {
  const pos = SECTION_MAP['cashier'];
  return (
    <group position={pos}>
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[2.5, 0.8, 1]} />
        <meshStandardMaterial color="#4a3728" />
      </mesh>
      {/* Register */}
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[0.6, 0.35, 0.5]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      {/* Screen */}
      <mesh position={[0, 1.2, -0.15]}>
        <boxGeometry args={[0.45, 0.3, 0.05]} />
        <meshStandardMaterial color="#4ade80" emissive="#4ade80" emissiveIntensity={0.3} />
      </mesh>
      <Text position={[0, 1.6, 0]} fontSize={0.22} color="#d97706" anchorX="center" font={undefined}>
        CHECKOUT
      </Text>
    </group>
  );
}

function StoreFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[24, 30]} />
      <meshStandardMaterial color="#e8e4dc" />
    </mesh>
  );
}

// Grid lines on floor
function FloorGrid() {
  const lines = useMemo(() => {
    const g: [number, number, number, number][] = [];
    for (let x = -12; x <= 12; x += 2) g.push([x, -14, x, 14]);
    for (let z = -14; z <= 14; z += 2) g.push([-12, z, 12, z]);
    return g;
  }, []);
  const geoRef = useRef<THREE.BufferGeometry[]>([]);
  if (geoRef.current.length === 0) {
    geoRef.current = lines.map(l => {
      const points = [new THREE.Vector3(l[0], 0, l[1]), new THREE.Vector3(l[2], 0, l[3])];
      return new THREE.BufferGeometry().setFromPoints(points);
    });
  }

  return (
    <group position={[0, 0.001, 0]}>
      {geoRef.current.map((geo, i) => (
        <primitive key={i} object={new THREE.Line(geo, new THREE.LineBasicMaterial({ color: '#d0ccc4', transparent: true, opacity: 0.5 }))} />
      ))}
    </group>
  );
}

// Glass walls
function StoreWalls() {
  return (
    <>
      {/* Back wall */}
      <mesh position={[0, 2.5, -14]}>
        <boxGeometry args={[24, 5, 0.15]} />
        <meshStandardMaterial color="#c0c0c0" transparent opacity={0.15} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-12, 2.5, 0]}>
        <boxGeometry args={[0.15, 5, 30]} />
        <meshStandardMaterial color="#c0c0c0" transparent opacity={0.15} />
      </mesh>
      {/* Right wall */}
      <mesh position={[12, 2.5, 0]}>
        <boxGeometry args={[0.15, 5, 30]} />
        <meshStandardMaterial color="#c0c0c0" transparent opacity={0.15} />
      </mesh>
      {/* Wall frame edges - dark metal */}
      {/* Top edges */}
      <mesh position={[0, 5, -14]}><boxGeometry args={[24.3, 0.1, 0.2]} /><meshStandardMaterial color="#555" /></mesh>
      <mesh position={[-12, 5, 0]}><boxGeometry args={[0.2, 0.1, 30.3]} /><meshStandardMaterial color="#555" /></mesh>
      <mesh position={[12, 5, 0]}><boxGeometry args={[0.2, 0.1, 30.3]} /><meshStandardMaterial color="#555" /></mesh>
      {/* Bottom edges */}
      <mesh position={[0, 0, -14]}><boxGeometry args={[24.3, 0.1, 0.2]} /><meshStandardMaterial color="#555" /></mesh>
      <mesh position={[-12, 0, 0]}><boxGeometry args={[0.2, 0.1, 30.3]} /><meshStandardMaterial color="#555" /></mesh>
      <mesh position={[12, 0, 0]}><boxGeometry args={[0.2, 0.1, 30.3]} /><meshStandardMaterial color="#555" /></mesh>
      {/* Corner pillars */}
      {[[-12, -14], [12, -14], [-12, 14], [12, 14]].map(([x, z], i) => (
        <mesh key={i} position={[x, 2.5, z]}><boxGeometry args={[0.2, 5, 0.2]} /><meshStandardMaterial color="#555" /></mesh>
      ))}
      {/* Front wall - partial with entrance gap */}
      <mesh position={[-8, 2.5, 14]}><boxGeometry args={[8, 5, 0.15]} /><meshStandardMaterial color="#c0c0c0" transparent opacity={0.15} /></mesh>
      <mesh position={[8, 2.5, 14]}><boxGeometry args={[8, 5, 0.15]} /><meshStandardMaterial color="#c0c0c0" transparent opacity={0.15} /></mesh>

      {/* Store name - on back wall */}
      <Text position={[0, 4, -13.8]} fontSize={0.7} color="#1a5c2e" anchorX="center" font={undefined} fontWeight="bold">
        PROFPARFUMS
      </Text>
      
      {/* Entrance label */}
      <Text position={[0, 0.05, 14.5]} fontSize={0.3} color="#888" anchorX="center" rotation={[-Math.PI / 2, 0, 0]} font={undefined}>
        ▼ ENTRANCE ▼
      </Text>

      {/* Green sidewalk strips (like reference) */}
      <mesh position={[-12.5, 0, 14]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1, 4]} />
        <meshStandardMaterial color="#4ade80" />
      </mesh>
      <mesh position={[12.5, 0, 14]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1, 4]} />
        <meshStandardMaterial color="#4ade80" />
      </mesh>
    </>
  );
}

// Info panel as HTML overlay
function VisitorInfoPanel({ session, onClose }: { session: VisitorSession; onClose: () => void }) {
  const hasCart = session.cart_items && session.cart_items.length > 0;
  const createdAt = new Date(session.created_at);
  const minutesAgo = Math.floor((Date.now() - createdAt.getTime()) / 60000);
  const timeLabel = minutesAgo < 1 ? 'just now' : `${minutesAgo}m ago`;
  const isReturning = session.user_email != null;
  const pagesCount = (session.pages_viewed || []).length;

  return (
    <div
      style={{
        background: 'rgba(0,0,0,0.88)',
        color: '#fff',
        borderRadius: 10,
        padding: '14px 18px',
        minWidth: 220,
        maxWidth: 280,
        fontSize: 13,
        lineHeight: 1.5,
        pointerEvents: 'auto',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        border: '1px solid rgba(255,255,255,0.15)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontWeight: 700, fontSize: 14 }}>
          {session.user_email || 'Anonymous Visitor'}
        </span>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: 16 }}
        >
          ✕
        </button>
      </div>
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: 6, marginBottom: 6 }}>
        <div>📍 {session.country || 'Unknown location'}</div>
        <div>🕐 Arrived {timeLabel}</div>
        <div>{isReturning ? '🔁 Returning customer' : '🆕 New visitor'}</div>
        <div>📄 {pagesCount} page{pagesCount !== 1 ? 's' : ''} viewed</div>
      </div>
      {hasCart ? (
        <div>
          <div style={{ fontWeight: 600, color: '#4ade80', marginBottom: 4 }}>
            🛒 Cart — €{(session.cart_total || 0).toFixed(2)}
          </div>
          {(session.cart_items || []).map((item: any, i: number) => (
            <div key={i} style={{ fontSize: 11, color: '#ccc', display: 'flex', justifyContent: 'space-between' }}>
              <span>{item.brand} — {item.name}{item.ml ? ` (${item.ml}ml)` : ''}{item.quantity > 1 ? ` ×${item.quantity}` : ''}</span>
              <span style={{ marginLeft: 8, whiteSpace: 'nowrap' }}>€{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ color: '#999' }}>🛒 Cart is empty</div>
      )}
    </div>
  );
}

function StoreScene({ sessions, selectedId, onSelectSession }: {
  sessions: VisitorSession[];
  selectedId: string | null;
  onSelectSession: (id: string | null) => void;
}) {
  const selectedSession = sessions.find(s => s.session_id === selectedId) || null;

  return (
    <>
      <PerspectiveCamera makeDefault position={[18, 16, 22]} fov={45} />
      <OrbitControls
        enableDamping
        dampingFactor={0.1}
        maxPolarAngle={Math.PI / 2.3}
        minDistance={8}
        maxDistance={40}
        target={[0, 0, 0]}
      />

      <ambientLight intensity={0.65} />
      <directionalLight position={[15, 20, 15]} intensity={0.85} />
      <pointLight position={[0, 8, 0]} intensity={0.25} />

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
          basePos[0] + ((hash % 5) - 2) * 0.5,
          0,
          basePos[2] + ((hash % 7) - 3) * 0.4 + 1.5,
        ];
        const isSelected = selectedId === session.session_id;
        return (
          <group key={session.session_id}>
            <Character
              session={session}
              targetPosition={offset}
              onClick={() => onSelectSession(isSelected ? null : session.session_id)}
              isSelected={isSelected}
            />
            {isSelected && selectedSession && (
              <group position={[offset[0], 2.5, offset[2]]}>
                <Html center distanceFactor={12} style={{ pointerEvents: 'auto' }}>
                  <VisitorInfoPanel session={selectedSession} onClose={() => onSelectSession(null)} />
                </Html>
              </group>
            )}
          </group>
        );
      })}
    </>
  );
}

export default function StoreVisualization({ sessions }: StoreVisualizationProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const totalCartValue = useMemo(
    () => sessions.reduce((sum, s) => sum + (s.cart_total || 0), 0),
    [sessions]
  );

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas shadows style={{ background: '#d4e6d4' }} onClick={() => setSelectedId(null)}>
        <StoreScene sessions={sessions} selectedId={selectedId} onSelectSession={setSelectedId} />
      </Canvas>
      {/* HUD Overlay - like reference image */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        padding: '16px 24px',
        pointerEvents: 'none',
        background: 'linear-gradient(transparent, rgba(0,0,0,0.3))',
      }}>
        <div style={{ color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
          <div style={{ fontSize: 13, opacity: 0.8, fontWeight: 500 }}>Customers</div>
          <div style={{ fontSize: 42, fontWeight: 700, lineHeight: 1 }}>{sessions.length}</div>
        </div>
        <div style={{ color: '#fff', textAlign: 'right', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
          <div style={{ fontSize: 13, opacity: 0.8, fontWeight: 500 }}>In Live Carts</div>
          <div style={{ fontSize: 42, fontWeight: 700, lineHeight: 1 }}>€ {totalCartValue.toFixed(0)}</div>
        </div>
      </div>
    </div>
  );
}
