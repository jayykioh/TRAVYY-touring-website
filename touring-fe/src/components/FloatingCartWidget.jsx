/* eslint-disable no-unused-vars */
// components/ItineraryCart.jsx
import React, { useMemo } from 'react';
import logger from "../utils/logger";
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, X, Trash2, Sparkles, ChevronRight } from 'lucide-react';
import { useItinerary } from '../hooks/useIntinerary';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const getAddress = (it) =>
  it?.address || it?.formatted_address || it?.vicinity || "—";

const getTypes = (it) =>
  Array.isArray(it?.types) && it.types.length
    ? it.types.slice(0, 3)
    : [];

const getDuration = (it) =>
  typeof it?.duration === "number" && it.duration > 0 ? it.duration : 60;

const ClockMini = (props) => (
  <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden {...props}>
    <path fill="currentColor" d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2Zm.75 5h-1.5v5l4.25 2.55.75-1.23-3.5-2.07V7Z"/>
  </svg>
);

const PinMini = (props) => (
  <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden {...props}>
    <path fill="currentColor" d="M12 2C8.69 2 6 4.69 6 8c0 4.35 5.22 10.47 5.44 10.72.3.34.82.34 1.12 0C12.78 18.47 18 12.35 18 8c0-3.31-2.69-6-6-6Zm0 8.5A2.5 2.5 0 1 1 12 5.5a2.5 2.5 0 0 1 0 5Z"/>
  </svg>
);

const CafeIcon = () => (
  <svg viewBox="0 0 32 32" fill="currentColor" className="w-8 h-8">
    <path d="M20 8h-2V6c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 3.3 2.7 6 6 6h4c3.1 0 5.6-2.3 5.9-5.3 1.7-.4 3.1-2 3.1-3.7v-3c0-1.1-.9-2-2-2h-3zm3 7c0 .6-.4 1-1 1v-4h1v3zM8 18V8h8v10c0 2.2-1.8 4-4 4h-4c-2.2 0-4-1.8-4-4V8h4v10z"/>
    <line x1="11" y1="3" x2="11" y2="5" strokeWidth="1.5" stroke="currentColor" strokeLinecap="round"/>
    <line x1="14" y1="2" x2="14" y2="4.5" strokeWidth="1.5" stroke="currentColor" strokeLinecap="round"/>
    <line x1="17" y1="3" x2="17" y2="5" strokeWidth="1.5" stroke="currentColor" strokeLinecap="round"/>
    <rect x="5" y="26" width="14" height="2" rx="1"/>
  </svg>
);

const RestaurantIcon = () => (
  <svg viewBox="0 0 32 32" fill="currentColor" className="w-8 h-8">
    <circle cx="16" cy="16" r="10" fill="none" stroke="currentColor" strokeWidth="2.5"/>
    <path d="M10 11v5c0 .5.4 1 1 1v9h1.5V17c.5 0 1-.4 1-1v-5h-.8v4.5h-.4v-4.5h-.8v4.5h-.4V11H10z"/>
    <path d="M20.5 11c-.5 0-1 .4-1 1v4.5c0 1 .7 1.8 1.5 2v7.5h1.5v-7.5c.8-.2 1.5-1 1.5-2V12c0-.6-.5-1-1-1h-2.5z"/>
  </svg>
);

const BarIcon = () => (
  <svg viewBox="0 0 32 32" fill="currentColor" className="w-8 h-8">
    <path d="M8 8l4 6v9c0 .6.4 1 1 1h6c.6 0 1-.4 1-1v-9l4-6H8zm10.5 13h-5v-7l-2.8-4h10.6l-2.8 4v7z"/>
    <circle cx="12" cy="5" r="1.2"/>
    <circle cx="16" cy="4" r="1.2"/>
    <circle cx="20" cy="5" r="1.2"/>
    <path d="M11 25h10v2H11z"/>
  </svg>
);

const TempleIcon = () => (
  <svg viewBox="0 0 32 32" fill="currentColor" className="w-8 h-8">
    <path d="M16 3l-8 5v2h16V8l-8-5zm-6 8v14c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V11H10zm4 12h-2v-6h2v6zm4 0h-2v-6h2v6zm4 0h-2v-6h2v6z"/>
  </svg>
);

const ChurchIcon = () => (
  <svg viewBox="0 0 32 32" fill="currentColor" className="w-8 h-8">
    <path d="M17 3h-2v2h-2v2h2v2l-6 4v14h14V13l-6-4V7h2V5h-2V3zm-5 22v-8h8v8h-8zm4-18c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z"/>
  </svg>
);

const MosqueIcon = () => (
  <svg viewBox="0 0 32 32" fill="currentColor" className="w-8 h-8">
    <path d="M16 3l-2 2h4l-2-2zm-6 6c-1.1 0-2 .9-2 2v14h20V11c0-1.1-.9-2-2-2h-4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2h-4zm2 4h12v10H12V13zm4 2h4v6h-4v-6z"/>
  </svg>
);

const MuseumIcon = () => (
  <svg viewBox="0 0 32 32" fill="currentColor" className="w-8 h-8">
    <path d="M16 4L4 10v2h24v-2L16 4zm-12 8v12h2V14H8zm4 0v12h2V14h-2zm4 0v12h2V14h-2zm4 0v12h2V14h-2zm4 0v12h2V14h-2zm4 0v12h2V14h-2zM4 26v2h24v-2H4z"/>
  </svg>
);

const ParkIcon = () => (
  <svg viewBox="0 0 32 32" fill="currentColor" className="w-8 h-8">
    <path d="M16 4l-6 8h4v12h4V12h4l-6-8zm-2 20h4v4h-4v-4z"/>
  </svg>
);

const BeachIcon = () => (
  <svg viewBox="0 0 32 32" fill="currentColor" className="w-8 h-8">
    <path d="M28 20c-2.8-3.7-7-6-12-6s-9.2 2.3-12 6v2h24v-2zm-12-8c3.9 0 7.4 1.6 10 4.2v.8H6v-.8C8.6 13.6 12.1 12 16 12zM8 24h16v2H8v-2z"/>
  </svg>
);

const HotelIcon = () => (
  <svg viewBox="0 0 32 32" fill="currentColor" className="w-8 h-8">
    <path d="M26 6H6c-1.1 0-2 .9-2 2v16h2v-2h20v2h2V8c0-1.1-.9-2-2-2zm-16 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm16 8H6v-4c0-2.2 2.7-4 6-4h8c3.3 0 6 1.8 6 4v4z"/>
  </svg>
);

const ShoppingIcon = () => (
  <svg viewBox="0 0 32 32" fill="currentColor" className="w-8 h-8">
    <path d="M24 8h-4V6c0-2.2-1.8-4-4-4s-4 1.8-4 4v2H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-10-2c0-1.1.9-2 2-2s2 .9 2 2v2h-4V6zm10 18H8V10h2v2h2v-2h8v2h2v-2h2v14z"/>
  </svg>
);

const PharmacyIcon = () => (
  <svg viewBox="0 0 32 32" fill="currentColor" className="w-8 h-8">
    <path d="M24 6H8c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6 14h-4v-4h-4v-4h4v-4h4v4h4v4h-4v4z"/>
  </svg>
);

const HospitalIcon = () => (
  <svg viewBox="0 0 32 32" fill="currentColor" className="w-8 h-8">
    <path d="M24 4H8c-1.1 0-2 .9-2 2v20c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-6 18h-4v-4h-4v-4h4v-4h4v4h4v4h-4v4z"/>
  </svg>
);

const MovieIcon = () => (
  <svg viewBox="0 0 32 32" fill="currentColor" className="w-8 h-8">
    <path d="M26 6H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM8 8h2v2H8V8zm0 4h2v2H8v-2zm0 4h2v2H8v-2zm0 4h2v2H8v-2zm14 2H12V10h10v12zm2-2h2v2h-2v-2zm0-4h2v2h-2v-2zm0-4h2v2h-2v-2zm0-4h2v2h-2V8z"/>
  </svg>
);

const TouristIcon = () => (
  <svg viewBox="0 0 32 32" fill="currentColor" className="w-8 h-8">
    <path d="M16 4c-3.3 0-6 2.7-6 6 0 4.5 6 12 6 12s6-7.5 6-12c0-3.3-2.7-6-6-6zm0 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm-4 12c-2.2 0-4 1.8-4 4v4h16v-4c0-2.2-1.8-4-4-4h-8z"/>
  </svg>
);

const AirportIcon = () => (
  <svg viewBox="0 0 32 32" fill="currentColor" className="w-8 h-8">
    <path d="M28 14l-12-8V2l-2 2-2-2v4L0 14v2l12-4v6l-4 2v2l6-2 6 2v-2l-4-2v-6l12 4v-2z"/>
  </svg>
);

const TrainIcon = () => (
  <svg viewBox="0 0 32 32" fill="currentColor" className="w-8 h-8">
    <path d="M20 4H12C9.8 4 8 5.8 8 8v12c0 2.2 1.8 4 4 4l-2 2v2h12v-2l-2-2c2.2 0 4-1.8 4-4V8c0-2.2-1.8-4-4-4zm-8 18c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm0-6V8h8v8h-8zm8 6c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z"/>
  </svg>
);

const BusIcon = () => (
  <svg viewBox="0 0 32 32" fill="currentColor" className="w-8 h-8">
    <path d="M22 6H10C7.8 6 6 7.8 6 10v10c0 2.2 1.8 4 4 4l-1 2v2h2l2-2h6l2 2h2v-2l-1-2c2.2 0 4-1.8 4-4V10c0-2.2-1.8-4-4-4zm-12 16c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm0-6V10h12v6H10zm12 6c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z"/>
  </svg>
);

const StadiumIcon = () => (
  <svg viewBox="0 0 32 32" fill="currentColor" className="w-8 h-8">
    <ellipse cx="16" cy="10" rx="12" ry="4"/>
    <path d="M4 10v8c0 2.2 5.4 4 12 4s12-1.8 12-4v-8c0 2.2-5.4 4-12 4S4 12.2 4 10zm0 8v4c0 2.2 5.4 4 12 4s12-1.8 12-4v-4c0 2.2-5.4 4-12 4s-12-1.8-12-4z"/>
  </svg>
);

const GymIcon = () => (
  <svg viewBox="0 0 32 32" fill="currentColor" className="w-8 h-8">
    <path d="M28 14h-2v-2c0-1.1-.9-2-2-2h-2V8c0-1.1-.9-2-2-2h-8c-1.1 0-2 .9-2 2v2H8c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h2v2c0 1.1.9 2 2 2h2v2c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-2h2c1.1 0 2-.9 2-2v-2h2c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2z"/>
  </svg>
);

const SpaIcon = () => (
  <svg viewBox="0 0 32 32" fill="currentColor" className="w-8 h-8">
    <path d="M16 2l2.5 7.5L26 12l-7.5 2.5L16 22l-2.5-7.5L6 12l7.5-2.5L16 2z"/>
    <path d="M8 20l1.5 4L14 26l-4.5 1.5L8 32l-1.5-4.5L2 26l4.5-1.5L8 20z"/>
    <path d="M26 18l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z"/>
  </svg>
);

const LibraryIcon = () => (
  <svg viewBox="0 0 32 32" fill="currentColor" className="w-8 h-8">
    <path d="M26 4H10c-2.2 0-4 1.8-4 4v16c0 2.2 1.8 4 4 4h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-16 20c-1.1 0-2-.9-2-2V8c0-1.1.9-2 2-2h14v18H10zm4-14h8v2h-8v-2zm0 4h8v2h-8v-2zm0 4h6v2h-6v-2z"/>
  </svg>
);

const UniversityIcon = () => (
  <svg viewBox="0 0 32 32" fill="currentColor" className="w-8 h-8">
    <path d="M16 2L2 10v2h2v12H2v2h28v-2h-2V12h2v-2L16 2zm-6 22v-8h12v8H10zm14 0v-8h2v8h-2zM6 24v-8h2v8H6zm10-18c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1z"/>
  </svg>
);

const SchoolIcon = () => (
  <svg viewBox="0 0 32 32" fill="currentColor" className="w-8 h-8">
    <path d="M16 4L2 12l4 2.2V22c0 2.2 4.5 4 10 4s10-1.8 10-4v-7.8l2-1.1V20h2V12L16 4zm0 18c-4.4 0-8-1.3-8-2v-5.5l8 4.4 8-4.4V20c0 .7-3.6 2-8 2z"/>
  </svg>
);

const BankIcon = () => (
  <svg viewBox="0 0 32 32" fill="currentColor" className="w-8 h-8">
    <path d="M16 2L2 10v2h28v-2L16 2zm-10 12v8h2v-8H6zm4 0v8h2v-8h-2zm4 0v8h2v-8h-2zm4 0v8h2v-8h-2zm4 0v8h2v-8h-2zm4 0v8h2v-8h-2zM2 24v2h28v-2H2z"/>
  </svg>
);

const LocationIcon = () => (
  <svg viewBox="0 0 32 32" fill="currentColor" className="w-8 h-8">
    <path d="M16 4C11.6 4 8 7.6 8 12c0 6 8 16 8 16s8-10 8-16c0-4.4-3.6-8-8-8zm0 11c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z"/>
  </svg>
);

const getPoiIcon = (types = []) => {
  if (!types || types.length === 0) return <LocationIcon />;
  
  const typeString = types.join(' ').toLowerCase();
  
  const iconMap = {
    cafe: <CafeIcon />,
    coffee: <CafeIcon />,
    restaurant: <RestaurantIcon />,
    food: <RestaurantIcon />,
    meal: <RestaurantIcon />,
    bar: <BarIcon />,
    night_club: <BarIcon />,
    liquor: <BarIcon />,
    temple: <TempleIcon />,
    hindu_temple: <TempleIcon />,
    church: <ChurchIcon />,
    mosque: <MosqueIcon />,
    museum: <MuseumIcon />,
    art_gallery: <MuseumIcon />,
    park: <ParkIcon />,
    natural_feature: <ParkIcon />,
    campground: <ParkIcon />,
    beach: <BeachIcon />,
    hotel: <HotelIcon />,
    lodging: <HotelIcon />,
    resort: <HotelIcon />,
    shopping_mall: <ShoppingIcon />,
    store: <ShoppingIcon />,
    department_store: <ShoppingIcon />,
    supermarket: <ShoppingIcon />,
    pharmacy: <PharmacyIcon />,
    drugstore: <PharmacyIcon />,
    hospital: <HospitalIcon />,
    doctor: <HospitalIcon />,
    clinic: <HospitalIcon />,
    movie_theater: <MovieIcon />,
    cinema: <MovieIcon />,
    tourist_attraction: <TouristIcon />,
    point_of_interest: <TouristIcon />,
    landmark: <TouristIcon />,
    airport: <AirportIcon />,
    train_station: <TrainIcon />,
    subway_station: <TrainIcon />,
    bus_station: <BusIcon />,
    transit_station: <BusIcon />,
    stadium: <StadiumIcon />,
    sports: <StadiumIcon />,
    gym: <GymIcon />,
    fitness: <GymIcon />,
    spa: <SpaIcon />,
    beauty_salon: <SpaIcon />,
    beauty: <SpaIcon />,
    hair_care: <SpaIcon />,
    barbershop: <SpaIcon />,
    library: <LibraryIcon />,
    book_store: <LibraryIcon />,
    university: <UniversityIcon />,
    college: <UniversityIcon />,
    school: <SchoolIcon />,
    bank: <BankIcon />,
    atm: <BankIcon />,
    finance: <BankIcon />
  };

  for (const [key, icon] of Object.entries(iconMap)) {
    if (typeString.includes(key)) return icon;
  }
  
  return <LocationIcon />;
};

function SortableItem({ item, index, onRemove }) {
  const sortableProps = useSortable({ id: item.poiId });
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = sortableProps;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 1000 : 1
  };

  const getPhotoUrl = (photoRef) => {
    if (!photoRef) return null;
    if (photoRef.startsWith('http')) return photoRef;
    const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoRef}&key=${GOOGLE_API_KEY}`;
  };

  const firstPhoto = item.photos?.[0];
  const photoUrl = getPhotoUrl(firstPhoto);
  const primaryType = item.types?.[0]?.replace(/_/g, ' ') || '';
  const isTour = item.itemType === 'tour';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border overflow-hidden transition ${
        isTour ? 'bg-[#e6f7fa] border-[#02A0AA]' : 'bg-white border-slate-200 hover:border-slate-300'
      } ${isDragging ? 'shadow-lg scale-105' : ''}`}
    >
      <div className="flex gap-3 p-3 items-center">
        <button
          {...attributes}
          {...listeners}
          className="flex flex-col items-center justify-center gap-0.5 w-8 flex-shrink-0 select-none cursor-grab active:cursor-grabbing text-slate-400 hover:text-[#02A0AA] transition"
          aria-label="Kéo để sắp xếp"
        >
          <span className="h-1 w-1 rounded-full bg-current block" />
          <span className="h-1 w-1 rounded-full bg-current block" />
          <span className="h-1 w-1 rounded-full bg-current block" />
          <span className="text-[10px] font-bold mt-1 bg-slate-100 px-1.5 py-0.5 rounded-full">
            {index + 1}
          </span>
        </button>

        {photoUrl ? (
          <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100">
            <img 
              src={photoUrl} 
              alt={item.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-cyan-100 to-teal-100 flex items-center justify-center text-[#02A0AA] border-2 border-[#02A0AA]">
            {getPoiIcon(item.types)}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm text-slate-900 line-clamp-1">
              {item.name}
            </h3>
            {isTour && (
              <span className="ml-1 px-2 py-0.5 text-[10px] rounded-full bg-[#02A0AA] text-white font-semibold uppercase">TOUR</span>
            )}
          </div>
          <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1 line-clamp-1">
            <PinMini className="text-slate-500 flex-shrink-0" />
            <span className="truncate">
              {item.address || 'Địa chỉ không xác định'}
            </span>
          </p>
          <div className="flex items-center gap-2 mt-1">
            {primaryType && !isTour && (
              <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full capitalize">
                {primaryType}
              </span>
            )}
            {item.rating > 0 && (
              <span className="text-[10px] text-amber-600 font-medium flex items-center gap-0.5">
                ⭐ {item.rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => onRemove(item.poiId)}
          className="flex-shrink-0 w-8 h-8 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition flex items-center justify-center"
          aria-label="Xóa địa điểm"
        >
          <Trash2 className="w-4 h-4" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

export default function ItineraryCart() {
  const navigate = useNavigate();
  const {
    currentItinerary,
    setCurrentItinerary,
    isOpen,
    getCartCount,
    toggleCart,
    closeCart,
    removePOI,
    reorderPOIs
  } = useItinerary();

  const cartCount = getCartCount();
  const items = currentItinerary?.items || [];
  const itemIds = useMemo(() => items.map(i => i.poiId), [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function handleDragEnd(event) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = itemIds.indexOf(active.id);
    const newIndex = itemIds.indexOf(over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const nextItems = arrayMove(items, oldIndex, newIndex);
    const nextIds = nextItems.map(i => i.poiId);

    if (typeof reorderPOIs === 'function') {
      reorderPOIs(nextIds);
    } else {
      setCurrentItinerary?.({ ...currentItinerary, items: nextItems });
    }
  }

  const handleViewItinerary = () => {
    closeCart();
    navigate('/itinerary', { state: { itinerary: currentItinerary } });
  };

  const handleRemovePOI = async (poiId) => {
    try {
      await removePOI(poiId);
    } catch (e) {
      logger.error(e);
    }
  };

  return (
    <>
      <motion.button
        onClick={toggleCart}
        className="fixed bottom-6 right-6 z-[10000] flex items-center gap-2 rounded-full bg-[#02A0AA] text-white px-4 py-3 shadow-2xl hover:bg-[#028a94] transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Mở giỏ hành trình"
      >
        <ShoppingCart className="w-5 h-5" />
        <span className="font-semibold text-sm">Giỏ Hành trình</span>
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold grid place-items-center">
            {cartCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.18 } }}
              onClick={closeCart}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[10001]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 24, stiffness: 260 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-[10002] overflow-hidden flex flex-col"
              role="dialog"
              aria-label="Giỏ hành trình"
            >
              <div className="bg-gradient-to-r from-[#02A0AA] to-[#028a94] text-white px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold">Hành trình của bạn</h2>
                    <p className="text-xs text-white/80">
                      {currentItinerary?.zoneName || 'Chưa có khu vực'} • {cartCount} địa điểm
                    </p>
                  </div>
                  <button
                    onClick={closeCart}
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition grid place-items-center"
                    aria-label="Đóng giỏ hành trình"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {items.length > 0 ? (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
                      {items.map((item, index) => (
                        <SortableItem
                          key={item.poiId}
                          item={item}
                          index={index}
                          onRemove={handleRemovePOI}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                ) : (
                  <div className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3">
                    Chưa có địa điểm nào. Hãy thêm từ danh sách để bắt đầu.
                  </div>
                )}
              </div>

              <div className="border-t border-slate-200 p-4 space-y-3 bg-white">
                <button
                  onClick={handleViewItinerary}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#02A0AA] text-white px-4 py-3 font-semibold hover:bg-[#028a94] transition"
                >
                  <Sparkles className="w-5 h-5" />
                  Tạo hành trình bằng AI
                  <ChevronRight className="w-5 h-5" />
                </button>

                <p className="text-xs text-center text-slate-500">
                  Kéo-thả để sắp xếp thứ tự. AI (tùy chọn) sẽ tối ưu thời lượng & quãng đường dựa trên danh sách này.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}