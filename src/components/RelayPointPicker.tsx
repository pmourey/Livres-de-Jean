import React, { useState } from 'react';
import { RelayPoint } from '../types';
import { MapPin, Clock, Check, Search } from 'lucide-react';

interface RelayPointPickerProps {
  relayPoints?: RelayPoint[];
  selectedPoint?: RelayPoint;
  onSelect: (point: RelayPoint) => void;
  defaultPostalCode?: string;
}

export const RelayPointPicker: React.FC<RelayPointPickerProps> = ({
  relayPoints,
  selectedPoint,
  onSelect,
  defaultPostalCode = '71200'
}) => {
  const [searchQuery, setSearchQuery] = useState(defaultPostalCode);

  const availablePoints: RelayPoint[] = React.useMemo(() => {
    if (relayPoints && relayPoints.length > 0) return relayPoints;
    const cp = searchQuery.trim() || defaultPostalCode || '71200';
    return [
      {
        id: `pickup-${cp}-1`,
        name: 'Point Relais La Poste / Pickup',
        address: '14 Rue du Général Leclerc',
        postalCode: cp,
        city: 'Centre-Ville',
        distanceKm: 0.8,
        carrier: 'Point Relais La Poste / Pickup',
        hours: 'Lun-Sam : 07h30 - 19h00'
      },
      {
        id: `pickup-${cp}-2`,
        name: 'Librairie & Tabac Presse (Mondial Relay)',
        address: '3 Place de l’Église',
        postalCode: cp,
        city: 'Centre-Ville',
        distanceKm: 1.4,
        carrier: 'Mondial Relay / Relais Colis',
        hours: 'Mar-Sam : 08h00 - 19h30, Dim : 08h30 - 12h30'
      },
      {
        id: `pickup-${cp}-3`,
        name: 'Relais Colis / Supermarché Partenaire',
        address: '45 Avenue de la République',
        postalCode: cp,
        city: 'Quartier Commerces',
        distanceKm: 2.1,
        carrier: 'Mondial Relay / Pickup',
        hours: 'Lun-Sam : 08h30 - 20h00'
      }
    ];
  }, [relayPoints, searchQuery, defaultPostalCode]);

  const [activePinId, setActivePinId] = useState<string>(selectedPoint?.id || availablePoints[0]?.id || '');

  const filteredPoints = availablePoints.filter(p => 
    p.postalCode.includes(searchQuery) ||
    p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayPoints = filteredPoints.length > 0 ? filteredPoints : availablePoints;

  // Auto-select first available point if none is currently selected
  React.useEffect(() => {
    if (!selectedPoint && displayPoints.length > 0) {
      onSelect(displayPoints[0]);
    }
  }, [selectedPoint, displayPoints, onSelect]);

  return (
    <div className="border border-stone-200 rounded-lg p-4 bg-stone-50/50 mt-3 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold text-stone-900">
            Sélectionnez votre Point Relais le plus proche
          </h4>
          <p className="text-xs text-stone-500">
            Réseau officiel La Poste Pickup & Mondial Relay partenaires
          </p>
        </div>

        {/* Search bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Code postal ou ville..."
            className="pl-8 pr-3 py-1.5 text-xs bg-white border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#8B1E2D]"
          />
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Interactive Map Visual Schema */}
      <div className="relative h-44 bg-stone-200/90 rounded-md overflow-hidden border border-stone-300 flex items-center justify-center">
        {/* Abstract road grid background pattern */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(#57534e 1px, transparent 1px), linear-gradient(to right, #78716c 1px, transparent 1px), linear-gradient(to bottom, #78716c 1px, transparent 1px)',
          backgroundSize: '24px 24px, 72px 72px, 72px 72px'
        }} />

        {/* Map Label badge */}
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-medium text-stone-600 border border-stone-200">
          Secteur {searchQuery || 'Bourgogne / France'}
        </div>

        {/* Client Position Marker */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
          <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-md animate-pulse" />
          <span className="text-[9px] font-bold text-blue-900 bg-white/80 px-1 rounded mt-0.5 shadow-xs">
            Votre domicile
          </span>
        </div>

        {/* Pins for each relay point */}
        {displayPoints.map((point, index) => {
          // Calculate stylized offsets around center
          const angle = (index / displayPoints.length) * 2 * Math.PI - 0.5;
          const radius = 55;
          const x = 50 + Math.cos(angle) * (radius / 1.6);
          const y = 50 + Math.sin(angle) * (radius / 2.2);

          const isSelected = selectedPoint?.id === point.id;
          const isActive = activePinId === point.id;

          return (
            <button
              key={point.id}
              onClick={() => {
                setActivePinId(point.id);
                onSelect(point);
              }}
              style={{ left: `${x}%`, top: `${y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-transform ${
                isActive ? 'scale-110 z-20' : 'z-10 hover:scale-105'
              }`}
              title={`${point.name} (${point.distanceKm} km)`}
            >
              <div
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded shadow-md border text-[10px] font-semibold transition-colors ${
                  isSelected
                    ? 'bg-[#8B1E2D] text-white border-[#701622]'
                    : isActive
                    ? 'bg-amber-600 text-white border-amber-700'
                    : 'bg-white text-stone-800 border-stone-300 hover:border-[#8B1E2D]'
                }`}
              >
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate max-w-[80px]">{point.name}</span>
                <span className="text-[9px] opacity-80 tabular-nums">({point.distanceKm} km)</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* List of points */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
        {displayPoints.map((point) => {
          const isSelected = selectedPoint?.id === point.id;
          return (
            <div
              key={point.id}
              onClick={() => {
                setActivePinId(point.id);
                onSelect(point);
              }}
              className={`p-3 rounded-md border text-left cursor-pointer transition-all ${
                isSelected
                  ? 'border-[#8B1E2D] bg-[#8B1E2D]/5 ring-1 ring-[#8B1E2D]'
                  : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-stone-900">{point.name}</p>
                  <p className="text-[11px] text-stone-600 mt-0.5">{point.address}</p>
                  <p className="text-[11px] text-stone-500">
                    {point.postalCode} {point.city} · <span className="tabular-nums font-medium text-[#8B1E2D]">{point.distanceKm} km</span>
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-[#8B1E2D] text-white' : 'border border-stone-300'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                </div>
              </div>

              <div className="mt-2 pt-1.5 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-stone-400" />
                  {point.hours}
                </span>
                <span className="font-medium text-stone-600">{point.carrier}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
