import React, { useState, useMemo } from 'react';
import { Repository, RepoFile } from '../types';

interface IsometricCodebaseCityProps {
  repository: Repository;
  selectedFile: RepoFile | null;
  onSelectFile: (file: RepoFile) => void;
  onAction?: (action: 'bug' | 'blast' | 'view', filePath: string) => void;
}

interface Building {
  id: string;
  name: string;
  path: string;
  file: RepoFile;
  gridX: number; // 0 to 8
  gridY: number; // 0 to 8
  width: number;
  depth: number;
  height: number; // height in pixels
  district: 'auth' | 'payment' | 'core' | 'tests' | 'other';
  isLandmark: boolean;
  colorTop: string;
  colorLeft: string;
  colorRight: string;
  accentColor: string;
}

export const IsometricCodebaseCity: React.FC<IsometricCodebaseCityProps> = ({
  repository,
  selectedFile,
  onSelectFile,
  onAction
}) => {
  const [hoveredBuilding, setHoveredBuilding] = useState<Building | null>(null);

  // Generate buildings from the repository files with isometric palette matching reference screenshot
  const buildings: Building[] = useMemo(() => {
    // Reference screenshot palette:
    // 1. Dusty Rose / Magenta District (Auth & Security)
    const rosePalette = {
      top: '#e07aa5',
      left: '#c7588b',
      right: '#9d3b66',
      accent: '#e07aa5'
    };
    // 2. Warm Ochre / Golden Amber (Payment & Checkout)
    const ochrePalette = {
      top: '#e5b85c',
      left: '#cb9a3e',
      right: '#9f7324',
      accent: '#e5b85c'
    };
    // 3. Teal / Jade Green (Core API & Data Store)
    const tealPalette = {
      top: '#4dd2b9',
      left: '#2db89e',
      right: '#1f8a76',
      accent: '#4dd2b9'
    };
    // 4. Slate / Cobalt Blue (Tests & Verification)
    const bluePalette = {
      top: '#6e98e4',
      left: '#4d7bc9',
      right: '#365a99',
      accent: '#6e98e4'
    };

    const result: Building[] = [];
    let fileIdx = 0;

    // Define positions in a neat 4-district isometric urban layout
    // Auth District: gridX ~ [0..2], gridY ~ [0..2]
    // Payment District: gridX ~ [3..5], gridY ~ [0..2]
    // Core District: gridX ~ [0..2], gridY ~ [3..5]
    // Tests/Services: gridX ~ [3..5], gridY ~ [3..5]

    const files = repository.files.slice(0, 16);

    files.forEach((file) => {
      const lower = file.path.toLowerCase();
      let district: 'auth' | 'payment' | 'core' | 'tests' | 'other' = 'core';
      let palette = tealPalette;
      let baseX = 0;
      let baseY = 0;

      if (lower.includes('auth') || lower.includes('security') || lower.includes('session') || lower.includes('token')) {
        district = 'auth';
        palette = rosePalette;
        baseX = 0.5 + (fileIdx % 2) * 1.3;
        baseY = 0.5 + Math.floor((fileIdx % 4) / 2) * 1.3;
      } else if (lower.includes('payment') || lower.includes('checkout') || lower.includes('ledger') || lower.includes('order')) {
        district = 'payment';
        palette = ochrePalette;
        baseX = 3.8 + (fileIdx % 2) * 1.3;
        baseY = 0.5 + Math.floor((fileIdx % 4) / 2) * 1.3;
      } else if (lower.includes('test')) {
        district = 'tests';
        palette = bluePalette;
        baseX = 3.8 + (fileIdx % 2) * 1.3;
        baseY = 3.6 + Math.floor((fileIdx % 4) / 2) * 1.3;
      } else {
        district = 'core';
        palette = tealPalette;
        baseX = 0.5 + (fileIdx % 2) * 1.3;
        baseY = 3.6 + Math.floor((fileIdx % 4) / 2) * 1.3;
      }

      // Height scales with code lines: 35px to 140px
      const lines = file.lines || 50;
      const height = Math.min(145, Math.max(38, Math.round(lines * 1.1)));
      const isLandmark = file.name === 'auth.py' || file.name === 'checkout.py' || file.name === 'payment.py' || height > 95;

      result.push({
        id: file.path,
        name: file.name,
        path: file.path,
        file,
        gridX: baseX,
        gridY: baseY,
        width: 28,
        depth: 28,
        height,
        district,
        isLandmark,
        colorTop: palette.top,
        colorLeft: palette.left,
        colorRight: palette.right,
        accentColor: palette.accent
      });

      fileIdx++;
    });

    // Sort by isometric draw order: back-to-front (gridX + gridY ascending)
    result.sort((a, b) => (a.gridX + a.gridY) - (b.gridX + b.gridY));
    return result;
  }, [repository.files]);

  // Isometric projection math:
  // isoX = (x - y) * cos(30°)
  // isoY = (x + y) * sin(30°)
  const originX = 260;
  const originY = 175;
  const scaleX = 40;
  const scaleY = 23;

  const toIso = (gx: number, gy: number, z: number = 0) => {
    const screenX = originX + (gx - gy) * scaleX;
    const screenY = originY + (gx + gy) * scaleY - z;
    return { x: screenX, y: screenY };
  };

  const activeFocus = hoveredBuilding || (selectedFile ? buildings.find(b => b.path === selectedFile.path) : null);

  return (
    <div className="relative w-full max-w-[560px] mx-auto select-none">
      {/* SVG Canvas for True 3D Isometric Projection */}
      <svg
        viewBox="0 0 520 440"
        className="w-full h-auto overflow-visible drop-shadow-xs"
        style={{ filter: 'drop-shadow(0 14px 28px rgba(0,0,0,0.06))' }}
      >
        <defs>
          {/* Subtle ground shadow gradient */}
          <radialGradient id="cityGroundGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Soft shadow under the entire city base */}
        <ellipse cx="260" cy="300" rx="220" ry="105" fill="url(#cityGroundGlow)" />

        {/* Isometric Grid Floor (matches the pale grid lines in screenshot) */}
        <g stroke="#e2e8f0" strokeWidth="1" fill="none" opacity="0.85">
          {Array.from({ length: 8 }).map((_, i) => {
            const p1 = toIso(0, i, 0);
            const p2 = toIso(7, i, 0);
            return <line key={`gx-${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} />;
          })}
          {Array.from({ length: 8 }).map((_, i) => {
            const p1 = toIso(i, 0, 0);
            const p2 = toIso(i, 7, 0);
            return <line key={`gy-${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} />;
          })}
        </g>

        {/* Translucent Base Platform Slab */}
        <polygon
          points={`
            ${toIso(0, 0, 0).x},${toIso(0, 0, 0).y}
            ${toIso(7, 0, 0).x},${toIso(7, 0, 0).y}
            ${toIso(7, 7, 0).x},${toIso(7, 7, 0).y}
            ${toIso(0, 7, 0).x},${toIso(0, 7, 0).y}
          `}
          fill="#ffffff"
          fillOpacity="0.45"
          stroke="#cbd5e1"
          strokeWidth="1.2"
        />

        {/* 3D Buildings Rendered in Back-to-Front Isometric Order */}
        {buildings.map((b) => {
          const isSelected = selectedFile?.path === b.path;
          const isHovered = hoveredBuilding?.id === b.id;
          const isActive = isSelected || isHovered;

          // Building footprint coordinates (base)
          const bW = 0.85;
          const bD = 0.85;
          const gx = b.gridX;
          const gy = b.gridY;
          const h = b.height;

          // Base points on ground (z = 0)
          const pBaseBack = toIso(gx, gy, 0);
          const pBaseRight = toIso(gx + bW, gy, 0);
          const pBaseFront = toIso(gx + bW, gy + bD, 0);
          const pBaseLeft = toIso(gx, gy + bD, 0);

          // Roof points (z = h)
          const pRoofBack = toIso(gx, gy, h);
          const pRoofRight = toIso(gx + bW, gy, h);
          const pRoofFront = toIso(gx + bW, gy + bD, h);
          const pRoofLeft = toIso(gx, gy + bD, h);

          // Landmark Beacon coords (center of roof + pin height)
          const roofCenter = toIso(gx + bW / 2, gy + bD / 2, h);
          const pinTip = toIso(gx + bW / 2, gy + bD / 2, h + 36);

          return (
            <g
              key={b.id}
              className="cursor-pointer transition-all duration-150"
              onClick={() => onSelectFile(b.file)}
              onMouseEnter={() => setHoveredBuilding(b)}
              onMouseLeave={() => setHoveredBuilding(null)}
            >
              {/* Left Face */}
              <polygon
                points={`
                  ${pBaseLeft.x},${pBaseLeft.y}
                  ${pBaseFront.x},${pBaseFront.y}
                  ${pRoofFront.x},${pRoofFront.y}
                  ${pRoofLeft.x},${pRoofLeft.y}
                `}
                fill={isActive ? '#3b82f6' : b.colorLeft}
                stroke={isActive ? '#1d4ed8' : '#ffffff'}
                strokeWidth={isActive ? '1.5' : '0.6'}
                strokeOpacity="0.75"
              />

              {/* Right Face */}
              <polygon
                points={`
                  ${pBaseFront.x},${pBaseFront.y}
                  ${pBaseRight.x},${pBaseRight.y}
                  ${pRoofRight.x},${pRoofRight.y}
                  ${pRoofFront.x},${pRoofFront.y}
                `}
                fill={isActive ? '#1d4ed8' : b.colorRight}
                stroke={isActive ? '#1e3a8a' : '#ffffff'}
                strokeWidth={isActive ? '1.5' : '0.6'}
                strokeOpacity="0.75"
              />

              {/* Top Roof Face */}
              <polygon
                points={`
                  ${pRoofBack.x},${pRoofBack.y}
                  ${pRoofRight.x},${pRoofRight.y}
                  ${pRoofFront.x},${pRoofFront.y}
                  ${pRoofLeft.x},${pRoofLeft.y}
                `}
                fill={isActive ? '#60a5fa' : b.colorTop}
                stroke={isActive ? '#93c5fd' : '#ffffff'}
                strokeWidth={isActive ? '1.5' : '0.7'}
              />

              {/* Landmark Diamond Pin (Exact match to reference screenshot) */}
              {b.isLandmark && (
                <g>
                  {/* Thin vertical pole */}
                  <line
                    x1={roofCenter.x}
                    y1={roofCenter.y}
                    x2={pinTip.x}
                    y2={pinTip.y}
                    stroke="#2563eb"
                    strokeWidth="1.2"
                    strokeDasharray="1 1"
                  />
                  {/* Diamond marker */}
                  <polygon
                    points={`
                      ${pinTip.x},${pinTip.y - 6}
                      ${pinTip.x + 4.5},${pinTip.y}
                      ${pinTip.x},${pinTip.y + 6}
                      ${pinTip.x - 4.5},${pinTip.y}
                    `}
                    fill="#3b82f6"
                    stroke="#ffffff"
                    strokeWidth="1"
                  />
                  {/* Subtle pulsing beacon core */}
                  <circle cx={pinTip.x} cy={pinTip.y} r="1.5" fill="#ffffff" />
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Floating Interactive Tooltip when hovering/selecting */}
      {activeFocus && (
        <div className="mt-2 p-3.5 rounded-xl bg-white border border-gray-200/90 shadow-md flex items-center justify-between gap-3 text-xs font-mono transition-all animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <div
              className="w-3 h-3 rounded-xs shrink-0"
              style={{ backgroundColor: activeFocus.accentColor }}
            />
            <div>
              <span className="font-bold text-gray-900 block truncate">
                {activeFocus.name}
              </span>
              <span className="text-[11px] text-gray-500 font-sans">
                {activeFocus.file.lines} lines • {activeFocus.file.functions?.length || 0} functions
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onAction && (
              <>
                <button
                  onClick={() => onAction('bug', activeFocus.path)}
                  className="px-2.5 py-1 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold border border-purple-200 transition cursor-pointer text-[11px]"
                >
                  Bug2Fix
                </button>
                <button
                  onClick={() => onAction('blast', activeFocus.path)}
                  className="px-2.5 py-1 rounded-md bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold border border-sky-200 transition cursor-pointer text-[11px]"
                >
                  Blast Radius
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
