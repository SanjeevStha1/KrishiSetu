import React, { useState, useMemo, useEffect } from 'react';
import {
  Truck,
  MapPin,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Check,
  X,
  Plus,
  Clock,
  Trash2,
  Package,
  Layers,
  Sparkles,
  Phone,
  User,
  AlertCircle,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Commodity, UserProfile } from '../types/krishi';
import { DISTRICT_LIST, COMMODITY_SEEDS } from '../data/agriData';
import { InAppMessageService } from '../services/inAppMessageService';
import { useLanguage } from '../context/LanguageContext';

export interface ScheduledTruck {
  id: string;
  dateId: string;
  destinationId: string;
  nameEn: string;
  nameNe: string;
  destinationEn: string;
  destinationNe: string;
  departureEn: string;
  departureNe: string;
  spaceRemainingKg: number;
  capacityKg: number;
  bookedKg: number;
  percentFilled: number;
  ratePerKg: number;
  savingsPct: number;
  farmersCount: number;
  // User-created pool attributes
  isUserCreated?: boolean;
  createdByUserId?: string;
  createdByName?: string;
  createdByPhone?: string;
  originDistrict?: string;
  originHub?: string;
  vehicleType?: string;
  cropAllowed?: string;
  notes?: string;
}

export interface UserBooking {
  id: string;
  truckId: string;
  truckName: string;
  destination: string;
  dateStr: string;
  departure: string;
  cropId: string;
  cropName: string;
  quantityKg: number;
  pickupLocation: string;
  ratePerKg: number;
  totalCost: number;
  savings: number;
  bookedAt: string;
}

interface FarmerSellSmartProps {
  commodities: Commodity[];
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
  initialCropId?: string;
  userProfile?: UserProfile;
  onJoinPool?: (poolId: string, volumeKg: number, pickupLocation: string) => void;
}

const BOOKINGS_STORAGE_KEY = 'krishisetu_user_transport_bookings_v2';
const TRUCKS_STORAGE_KEY = 'krishisetu_scheduled_trucks_v3';

const DEFAULT_SCHEDULED_TRUCKS: ScheduledTruck[] = [
  // 27 Sat
  {
    id: 'truck-sat-kalimati',
    dateId: 'date-4',
    destinationId: 'kalimati',
    nameEn: 'Kalimati Mandi Express',
    nameNe: 'कालीमाटी मन्डी एक्सप्रेस',
    destinationEn: 'Kalimati Wholesale',
    destinationNe: 'कालीमाटी थोक बजार',
    departureEn: '5:00 PM',
    departureNe: '५:०० बजे',
    spaceRemainingKg: 1400,
    capacityKg: 3500,
    bookedKg: 2100,
    percentFilled: 60,
    ratePerKg: 2.5,
    savingsPct: 48,
    farmersCount: 4,
  },
  {
    id: 'truck-sat-balkhu',
    dateId: 'date-4',
    destinationId: 'balkhu',
    nameEn: 'Balkhu Saturday Shuttle',
    nameNe: 'बल्खु शनिबारे शटल',
    destinationEn: 'Balkhu Market',
    destinationNe: 'बल्खु कृषि बजार',
    departureEn: '6:30 PM',
    departureNe: '६:३० बजे',
    spaceRemainingKg: 1200,
    capacityKg: 2000,
    bookedKg: 800,
    percentFilled: 40,
    ratePerKg: 2.8,
    savingsPct: 44,
    farmersCount: 3,
  },
  {
    id: 'truck-sat-narayangarh',
    dateId: 'date-4',
    destinationId: 'narayangarh',
    nameEn: 'Narayangarh Highway Link',
    nameNe: 'नारायणगढ राजमार्ग लिंक',
    destinationEn: 'Narayangarh Mandi',
    destinationNe: 'नारायणगढ बजार',
    departureEn: '8:00 PM',
    departureNe: '८:०० बजे',
    spaceRemainingKg: 1900,
    capacityKg: 3000,
    bookedKg: 1100,
    percentFilled: 37,
    ratePerKg: 3.7,
    savingsPct: 38,
    farmersCount: 2,
  },
  // 23 Tue
  {
    id: 'truck-tue-kalimati',
    dateId: 'date-0',
    destinationId: 'kalimati',
    nameEn: 'Kalimati Mandi Express',
    nameNe: 'कालीमाटी मन्डी एक्सप्रेस',
    destinationEn: 'Kalimati Wholesale',
    destinationNe: 'कालीमाटी थोक बजार',
    departureEn: '5:00 PM',
    departureNe: '५:०० बजे',
    spaceRemainingKg: 1400,
    capacityKg: 3500,
    bookedKg: 2100,
    percentFilled: 60,
    ratePerKg: 2.5,
    savingsPct: 48,
    farmersCount: 4,
  },
  {
    id: 'truck-tue-balkhu',
    dateId: 'date-0',
    destinationId: 'balkhu',
    nameEn: 'Balkhu Agri Feeder',
    nameNe: 'बल्खु कृषि फिडर',
    destinationEn: 'Balkhu Market',
    destinationNe: 'बल्खु कृषि बजार',
    departureEn: '7:30 PM',
    departureNe: '७:३० बजे',
    spaceRemainingKg: 1100,
    capacityKg: 2000,
    bookedKg: 900,
    percentFilled: 45,
    ratePerKg: 2.8,
    savingsPct: 42,
    farmersCount: 2,
  },
  // 24 Wed
  {
    id: 'truck-wed-narayangarh',
    dateId: 'date-1',
    destinationId: 'narayangarh',
    nameEn: 'Narayangarh Wholesale Link',
    nameNe: 'नारायणगढ थोक ढुवानी',
    destinationEn: 'Narayangarh Mandi',
    destinationNe: 'नारायणगढ बजार',
    departureEn: '6:00 AM',
    departureNe: '६:०० बजे',
    spaceRemainingKg: 2400,
    capacityKg: 3500,
    bookedKg: 1100,
    percentFilled: 31,
    ratePerKg: 3.6,
    savingsPct: 38,
    farmersCount: 3,
  },
  {
    id: 'truck-wed-kalimati',
    dateId: 'date-1',
    destinationId: 'kalimati',
    nameEn: 'Kalimati Midday Feeder',
    nameNe: 'कालीमाटी दिउँसोको गाडी',
    destinationEn: 'Kalimati Wholesale',
    destinationNe: 'कालीमाटी थोक बजार',
    departureEn: '1:30 PM',
    departureNe: '१:३० बजे',
    spaceRemainingKg: 1600,
    capacityKg: 3000,
    bookedKg: 1400,
    percentFilled: 47,
    ratePerKg: 2.5,
    savingsPct: 46,
    farmersCount: 2,
  },
  // 25 Thu
  {
    id: 'truck-thu-kalimati',
    dateId: 'date-2',
    destinationId: 'kalimati',
    nameEn: 'Kalimati Morning Hauler',
    nameNe: 'कालीमाटी बिहानी ढुवानी',
    destinationEn: 'Kalimati Wholesale',
    destinationNe: 'कालीमाटी थोक बजार',
    departureEn: '7:00 AM',
    departureNe: '७:०० बजे',
    spaceRemainingKg: 1800,
    capacityKg: 3500,
    bookedKg: 1700,
    percentFilled: 49,
    ratePerKg: 2.5,
    savingsPct: 48,
    farmersCount: 4,
  },
  {
    id: 'truck-thu-pokhara',
    dateId: 'date-2',
    destinationId: 'pokhara',
    nameEn: 'Pokhara Direct Transit',
    nameNe: 'पोखरा सिधा ढुवानी',
    destinationEn: 'Pokhara Wholesale',
    destinationNe: 'पोखरा थोक बजार',
    departureEn: '4:30 PM',
    departureNe: '४:३० बजे',
    spaceRemainingKg: 950,
    capacityKg: 2500,
    bookedKg: 1550,
    percentFilled: 62,
    ratePerKg: 3.9,
    savingsPct: 40,
    farmersCount: 3,
  },
  // 26 Fri
  {
    id: 'truck-fri-balkhu',
    dateId: 'date-3',
    destinationId: 'balkhu',
    nameEn: 'Balkhu Weekend Line',
    nameNe: 'बल्खु सप्ताहान्त लाइन',
    destinationEn: 'Balkhu Market',
    destinationNe: 'बल्खु कृषि बजार',
    departureEn: '5:30 PM',
    departureNe: '५:३० बजे',
    spaceRemainingKg: 1500,
    capacityKg: 3000,
    bookedKg: 1500,
    percentFilled: 50,
    ratePerKg: 2.7,
    savingsPct: 45,
    farmersCount: 2,
  },
  {
    id: 'truck-fri-kalimati',
    dateId: 'date-3',
    destinationId: 'kalimati',
    nameEn: 'Kalimati Friday Express',
    nameNe: 'कालीमाटी शुक्रबारे एक्सप्रेस',
    destinationEn: 'Kalimati Wholesale',
    destinationNe: 'कालीमाटी थोक बजार',
    departureEn: '7:00 PM',
    departureNe: '७:०० बजे',
    spaceRemainingKg: 1300,
    capacityKg: 3200,
    bookedKg: 1900,
    percentFilled: 59,
    ratePerKg: 2.5,
    savingsPct: 48,
    farmersCount: 5,
  },
];

export const FarmerSellSmart: React.FC<FarmerSellSmartProps> = ({
  commodities,
  selectedDistrict,
  setSelectedDistrict,
  initialCropId = 'tomato',
  userProfile,
  onJoinPool,
}) => {
  const { language, t } = useLanguage();
  const isNe = language === 'ne';

  const currentDistrictObj =
    DISTRICT_LIST.find((d) => d.id.toLowerCase() === selectedDistrict.toLowerCase()) ||
    DISTRICT_LIST[0];

  // Calendar dates matching Home Page
  const calendarDates = useMemo(() => {
    const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayNamesNe = ['आइत', 'सोम', 'मंगल', 'बुध', 'बिही', 'शुक्र', 'शनि'];

    return [
      { id: 'date-0', dayNum: 23, dayName: isNe ? dayNamesNe[2] : 'Tue', bsDateStr: '2083-05-23' },
      { id: 'date-1', dayNum: 24, dayName: isNe ? dayNamesNe[3] : 'Wed', bsDateStr: '2083-05-24' },
      { id: 'date-2', dayNum: 25, dayName: isNe ? dayNamesNe[4] : 'Thu', bsDateStr: '2083-05-25' },
      { id: 'date-3', dayNum: 26, dayName: isNe ? dayNamesNe[5] : 'Fri', bsDateStr: '2083-05-26' },
      { id: 'date-4', dayNum: 27, dayName: isNe ? dayNamesNe[6] : 'Sat', bsDateStr: '2083-05-27' },
    ];
  }, [isNe]);

  // Main navigation view state
  const [viewMode, setViewMode] = useState<'available' | 'my-bookings' | 'my-created'>('available');

  // Filter states
  const [selectedDispatchDate, setSelectedDispatchDate] = useState<string>('date-4');
  const [selectedDestination, setSelectedDestination] = useState<string>('all');
  const [selectedTruckId, setSelectedTruckId] = useState<string>('truck-sat-kalimati');

  // Dynamic Trucks List in State (Persisted)
  const [trucksList, setTrucksList] = useState<ScheduledTruck[]>(() => {
    try {
      const saved = localStorage.getItem(TRUCKS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_SCHEDULED_TRUCKS;
  });

  const saveTrucks = (updated: ScheduledTruck[]) => {
    setTrucksList(updated);
    try {
      localStorage.setItem(TRUCKS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Persisted User Bookings
  const [userBookings, setUserBookings] = useState<UserBooking[]>(() => {
    try {
      const saved = localStorage.getItem(BOOKINGS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveBookings = (bookings: UserBooking[]) => {
    setUserBookings(bookings);
    try {
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
    } catch {}
  };

  // User-created pools filter
  const myCreatedPools = useMemo(() => {
    return trucksList.filter((t) => t.isUserCreated);
  }, [trucksList]);

  // Booking Form State with Regex Validation
  const [selectedCropId, setSelectedCropId] = useState<string>(initialCropId || 'tomato');
  // Free string input for quantity so user can freely backspace, type any custom value or default!
  const [quantityInput, setQuantityInput] = useState<string>('500');
  const [pickupLocation, setPickupLocation] = useState<string>(
    `${currentDistrictObj.name} Central Hub`
  );
  const [bookingSuccessId, setBookingSuccessId] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Sync pickup default when district changes
  useEffect(() => {
    setPickupLocation(`${currentDistrictObj.name} Central Hub`);
  }, [currentDistrictObj.name]);

  const activeCalendarDay = useMemo(() => {
    return calendarDates.find((d) => d.id === selectedDispatchDate) || calendarDates[4];
  }, [calendarDates, selectedDispatchDate]);

  // Filtered trucks by selected date and destination
  const filteredTrucks = useMemo(() => {
    return trucksList.filter((truck) => {
      const matchDate = truck.dateId === selectedDispatchDate;
      const matchDest =
        selectedDestination === 'all' || truck.destinationId === selectedDestination;
      return matchDate && matchDest;
    });
  }, [trucksList, selectedDispatchDate, selectedDestination]);

  // Active selected truck object
  const activeTruck = useMemo(() => {
    const found = filteredTrucks.find((t) => t.id === selectedTruckId);
    return found || filteredTrucks[0] || trucksList[0];
  }, [filteredTrucks, selectedTruckId, trucksList]);

  // Crop metadata
  const selectedCropObj = useMemo(() => {
    return COMMODITY_SEEDS.find((s) => s.id === selectedCropId) || COMMODITY_SEEDS[0];
  }, [selectedCropId]);

  // Handle quantity change with proper regex: allows empty string or positive digits only
  const handleQuantityChange = (val: string) => {
    // Regex allows empty string or integers
    if (val === '' || /^\d+$/.test(val)) {
      setQuantityInput(val);
      setBookingError(null);
    }
  };

  // Numerical quantity derived from regex input
  const quantityKg = parseFloat(quantityInput) || 0;

  // Financial calculations
  const soloRatePerKg = 5.5;
  const pooledRatePerKg = activeTruck ? activeTruck.ratePerKg : 2.5;
  const freightTotal = Math.round(quantityKg * pooledRatePerKg);
  const soloTotal = Math.round(quantityKg * soloRatePerKg);
  const savingsTotal = soloTotal - freightTotal;

  // Handle Booking Confirmation
  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTruck) return;

    if (quantityKg <= 0) {
      setBookingError(isNe ? 'कृपया परिमाण राख्नुहोस् (१ केजी भन्दा बढी)' : 'Please enter a valid quantity (> 0 kg)');
      return;
    }

    if (quantityKg > activeTruck.spaceRemainingKg) {
      setBookingError(
        isNe
          ? `गाडीमा केवल ${activeTruck.spaceRemainingKg} केजी ठाउँ बाँकी छ`
          : `Only ${activeTruck.spaceRemainingKg} kg space remaining in this truck`
      );
      return;
    }

    const newBooking: UserBooking = {
      id: `bk-${Date.now()}`,
      truckId: activeTruck.id,
      truckName: isNe ? activeTruck.nameNe : activeTruck.nameEn,
      destination: isNe ? activeTruck.destinationNe : activeTruck.destinationEn,
      dateStr: activeCalendarDay.bsDateStr,
      departure: isNe ? activeTruck.departureNe : activeTruck.departureEn,
      cropId: selectedCropId,
      cropName: isNe ? selectedCropObj.nepaliName : selectedCropObj.name,
      quantityKg,
      pickupLocation,
      ratePerKg: activeTruck.ratePerKg,
      totalCost: freightTotal,
      savings: savingsTotal,
      bookedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // 1. Save user booking
    saveBookings([newBooking, ...userBookings]);

    // 2. DYNAMICALLY UPDATE TRUCK WEIGHT (space remaining decreases, booked increases)
    const updatedTrucks = trucksList.map((t) => {
      if (t.id === activeTruck.id) {
        const newBooked = t.bookedKg + quantityKg;
        const newRemaining = Math.max(0, t.capacityKg - newBooked);
        const newPercent = Math.min(100, Math.round((newBooked / t.capacityKg) * 100));
        return {
          ...t,
          bookedKg: newBooked,
          spaceRemainingKg: newRemaining,
          percentFilled: newPercent,
          farmersCount: t.farmersCount + 1,
        };
      }
      return t;
    });
    saveTrucks(updatedTrucks);

    setBookingSuccessId(newBooking.id);
    setBookingError(null);

    // Call external hook for ledger & session updates
    if (onJoinPool) {
      onJoinPool(activeTruck.id, quantityKg, pickupLocation);
    }

    // In-App Notification
    InAppMessageService.dispatchMessage({
      title: isNe ? 'ढुवानी बुकिङ निश्चित भयो' : 'Transport Booking Confirmed',
      body: isNe
        ? `${selectedCropObj.nepaliName} ${quantityKg} केजी - ${activeTruck.destinationNe} (${activeCalendarDay.bsDateStr})`
        : `${selectedCropObj.name} ${quantityKg} kg booked to ${activeTruck.destinationEn} on ${activeCalendarDay.bsDateStr}.`,
      type: 'pooling_match',
      priority: 'high',
      badge: 'Transport',
      actionLabel: isNe ? 'मेरो बुकिङ हेर्नुहोस्' : 'View My Bookings',
      actionTab: 'sell',
    });

    setTimeout(() => {
      setBookingSuccessId(null);
    }, 3500);
  };

  // Handle Cancel Booking (Restores truck capacity dynamically!)
  const handleCancelBooking = (bookingId: string) => {
    const bookingToCancel = userBookings.find((b) => b.id === bookingId);
    if (!bookingToCancel) return;

    // Restore weight in truck
    const updatedTrucks = trucksList.map((t) => {
      if (t.id === bookingToCancel.truckId) {
        const newBooked = Math.max(0, t.bookedKg - bookingToCancel.quantityKg);
        const newRemaining = Math.max(0, t.capacityKg - newBooked);
        const newPercent = Math.min(100, Math.round((newBooked / t.capacityKg) * 100));
        return {
          ...t,
          bookedKg: newBooked,
          spaceRemainingKg: newRemaining,
          percentFilled: newPercent,
          farmersCount: Math.max(1, t.farmersCount - 1),
        };
      }
      return t;
    });

    saveTrucks(updatedTrucks);
    saveBookings(userBookings.filter((b) => b.id !== bookingId));

    InAppMessageService.dispatchMessage({
      title: isNe ? 'बुकिङ रद्द भयो' : 'Booking Canceled',
      body: isNe
        ? `${bookingToCancel.cropName} ${bookingToCancel.quantityKg} केजीको बुकिङ रद्द गरियो र गाडीमा ठाउँ फिर्ता गरियो।`
        : `${bookingToCancel.cropName} (${bookingToCancel.quantityKg} kg) was canceled and space restored to the truck.`,
      type: 'pooling_match',
      priority: 'high',
      badge: 'Transport',
    });
  };

  // =========================================================================
  // CREATE NEW POOL MODAL STATE & HANDLERS
  // =========================================================================
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newOriginDistrict, setNewOriginDistrict] = useState<string>(selectedDistrict);
  const [newOriginHub, setNewOriginHub] = useState<string>(`${currentDistrictObj.name} Central Hub`);
  const [newDestinationChoice, setNewDestinationChoice] = useState<string>('kalimati');
  const [newCustomDest, setNewCustomDest] = useState<string>('');
  const [newDepartureDateId, setNewDepartureDateId] = useState<string>('date-4');
  const [newDepartureTime, setNewDepartureTime] = useState<string>('5:00 AM');
  const [newVehicleType, setNewVehicleType] = useState<string>('Mahindra Bolero Maxi Truck (2.5 Ton)');
  const [newCapacityInput, setNewCapacityInput] = useState<string>('2500');
  const [newRateInput, setNewRateInput] = useState<string>('2.5');
  const [newInitialCropId, setNewInitialCropId] = useState<string>('tomato');
  const [newInitialCargoInput, setNewInitialCargoInput] = useState<string>('300');
  const [newOrganizerName, setNewOrganizerName] = useState<string>(
    userProfile?.name || 'Ram Bahadur Thapa'
  );
  const [newOrganizerPhone, setNewOrganizerPhone] = useState<string>(
    userProfile?.phone || '+977 9845012345'
  );
  const [newNotes, setNewNotes] = useState<string>('Meeting at chowk hub 30 min before departure.');
  const [createPoolError, setCreatePoolError] = useState<string | null>(null);

  // Reset create pool form
  const handleOpenCreateModal = () => {
    setNewOriginDistrict(selectedDistrict);
    setNewOriginHub(`${currentDistrictObj.name} Central Hub`);
    setNewDestinationChoice('kalimati');
    setNewCustomDest('');
    setNewCapacityInput('2500');
    setNewRateInput('2.5');
    setNewInitialCargoInput('300');
    setCreatePoolError(null);
    setIsCreateModalOpen(true);
  };

  // Regex handlers for Create Pool modal inputs
  const handleCapacityInputChange = (val: string) => {
    if (val === '' || /^\d+$/.test(val)) {
      setNewCapacityInput(val);
    }
  };

  const handleRateInputChange = (val: string) => {
    if (val === '' || /^\d*(\.\d{0,2})?$/.test(val)) {
      setNewRateInput(val);
    }
  };

  const handleInitialCargoInputChange = (val: string) => {
    if (val === '' || /^\d+$/.test(val)) {
      setNewInitialCargoInput(val);
    }
  };

  const handleCreatePoolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const capacityKg = parseFloat(newCapacityInput) || 0;
    const ratePerKg = parseFloat(newRateInput) || 0;
    const initialCargoKg = parseFloat(newInitialCargoInput) || 0;

    if (capacityKg <= 100) {
      setCreatePoolError(isNe ? 'गाडी क्षमता १०० केजी भन्दा बढी हुनुपर्छ' : 'Capacity must be at least 100 kg');
      return;
    }
    if (ratePerKg <= 0) {
      setCreatePoolError(isNe ? 'कृपया मान्य भाडा दर राख्नुहोस्' : 'Please enter a valid rate per kg');
      return;
    }
    if (initialCargoKg > capacityKg) {
      setCreatePoolError(
        isNe ? 'प्रारम्भिक परिमाण गाडीको क्षमता भन्दा धेरै हुन सक्दैन' : 'Initial cargo cannot exceed total capacity'
      );
      return;
    }

    // Resolve destination names
    let destinationEn = 'Kalimati Wholesale';
    let destinationNe = 'कालीमाटी थोक बजार';
    let destinationId = newDestinationChoice;

    if (newDestinationChoice === 'balkhu') {
      destinationEn = 'Balkhu Agri Market';
      destinationNe = 'बल्खु कृषि बजार';
    } else if (newDestinationChoice === 'pokhara') {
      destinationEn = 'Pokhara Wholesale Mandi';
      destinationNe = 'पोखरा थोक मन्डी';
    } else if (newDestinationChoice === 'narayangarh') {
      destinationEn = 'Narayangarh Mandi';
      destinationNe = 'नारायणगढ मन्डी';
    } else if (newDestinationChoice === 'butwal') {
      destinationEn = 'Butwal Wholesale Market';
      destinationNe = 'बुटवल थोक बजार';
    } else if (newDestinationChoice === 'birgunj') {
      destinationEn = 'Birgunj Border Mandi';
      destinationNe = 'वीरगञ्ज बजार';
    } else if (newDestinationChoice === 'custom') {
      const trimmed = newCustomDest.trim() || 'Custom Market';
      destinationEn = trimmed;
      destinationNe = trimmed;
      destinationId = `custom-${Date.now()}`;
    }

    const truckId = `truck-user-${Date.now()}`;
    const bookedKg = initialCargoKg;
    const spaceRemainingKg = Math.max(0, capacityKg - bookedKg);
    const percentFilled = Math.min(100, Math.round((bookedKg / capacityKg) * 100));

    const newTruck: ScheduledTruck = {
      id: truckId,
      dateId: newDepartureDateId,
      destinationId,
      nameEn: `${newOriginDistrict} - ${destinationEn} Farmer Pool`,
      nameNe: `${newOriginDistrict} - ${destinationNe} किसान ढुवानी`,
      destinationEn,
      destinationNe,
      departureEn: newDepartureTime,
      departureNe: newDepartureTime,
      spaceRemainingKg,
      capacityKg,
      bookedKg,
      percentFilled,
      ratePerKg,
      savingsPct: Math.round(Math.max(20, (1 - ratePerKg / soloRatePerKg) * 100)),
      farmersCount: initialCargoKg > 0 ? 1 : 0,
      isUserCreated: true,
      createdByName: newOrganizerName,
      createdByPhone: newOrganizerPhone,
      originDistrict: newOriginDistrict,
      originHub: newOriginHub,
      vehicleType: newVehicleType,
      cropAllowed: newInitialCropId,
      notes: newNotes,
    };

    // Prepend to trucks
    const updatedTrucks = [newTruck, ...trucksList];
    saveTrucks(updatedTrucks);

    // If user loaded initial cargo, register their booking
    if (initialCargoKg > 0) {
      const dateObj = calendarDates.find((d) => d.id === newDepartureDateId) || calendarDates[4];
      const cropObj = COMMODITY_SEEDS.find((s) => s.id === newInitialCropId) || COMMODITY_SEEDS[0];
      const cost = Math.round(initialCargoKg * ratePerKg);
      const savings = Math.round(initialCargoKg * (soloRatePerKg - ratePerKg));

      const newBooking: UserBooking = {
        id: `bk-${Date.now()}`,
        truckId: newTruck.id,
        truckName: isNe ? newTruck.nameNe : newTruck.nameEn,
        destination: isNe ? newTruck.destinationNe : newTruck.destinationEn,
        dateStr: dateObj.bsDateStr,
        departure: newDepartureTime,
        cropId: newInitialCropId,
        cropName: isNe ? cropObj.nepaliName : cropObj.name,
        quantityKg: initialCargoKg,
        pickupLocation: newOriginHub,
        ratePerKg,
        totalCost: cost,
        savings,
        bookedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      saveBookings([newBooking, ...userBookings]);
    }

    // Notification
    InAppMessageService.dispatchMessage({
      title: isNe ? 'नयाँ ढुवानी पुल सिर्जना भयो' : 'New Transport Pool Created',
      body: isNe
        ? `${destinationNe} तर्फको ${newVehicleType} ढुवानी तयार भयो। अन्य किसानहरूले अब ठाउँ बुक गर्न सक्नेछन्।`
        : `Pool to ${destinationEn} (${capacityKg} kg capacity) is now open for nearby farmers to join.`,
      type: 'pooling_match',
      priority: 'high',
      badge: 'Transport',
    });

    setIsCreateModalOpen(false);
    setSelectedTruckId(newTruck.id);
    setSelectedDispatchDate(newDepartureDateId);
    setViewMode('my-created');
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-6 font-sans text-[#1F1E1B] dark:text-[#F5F3EF]">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8E2D8] dark:border-[#383530]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EAF3EE] dark:bg-[#1E3327] text-[#2E7D5A] dark:text-[#4ADE80] flex items-center justify-center shrink-0 shadow-xs">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#1F1E1B] dark:text-[#F5F3EF]">
              {isNe ? 'ढुवानी तथा ग्रुप पुलिङ' : 'Transport Pool & Freight'}
            </h1>
            <p className="text-xs text-[#746F68] dark:text-[#A6A096]">
              {isNe
                ? 'नजिकका किसानहरूसँग मिलेर ट्रक साझेदारी गर्नुहोस् र भाडामा ५०% सम्म बचत गर्नुहोस्'
                : 'Share freight trucks with nearby farmers and cut transport costs by up to 50%'}
            </p>
          </div>
        </div>

        {/* Actions & District Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Create New Pool Button */}
          <button
            type="button"
            id="transport-create-pool-btn"
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2E7D5A] hover:bg-[#246648] text-white text-xs font-bold transition cursor-pointer shadow-xs active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" />
            <span>{isNe ? 'नयाँ पुल सिर्जना गर्नुहोस्' : 'Create New Pool'}</span>
          </button>

          {/* District selector */}
          <div className="flex items-center gap-2 bg-[#FAF7F2] dark:bg-[#262421] px-3 py-2 rounded-xl border border-[#E8E2D8] dark:border-[#383530] text-xs">
            <MapPin className="w-3.5 h-3.5 text-[#C8A27C] dark:text-[#D9B591]" />
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-transparent font-bold text-[#1F1E1B] dark:text-[#F5F3EF] focus:outline-none cursor-pointer pr-1"
            >
              {DISTRICT_LIST.map((dist) => (
                <option key={dist.id} value={dist.id} className="dark:bg-[#1C1A18] dark:text-[#F5F3EF]">
                  {dist.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* View Switcher Subtabs */}
      <div className="flex items-center gap-2 border-b border-[#E8E2D8] dark:border-[#383530] pb-2 overflow-x-auto">
        <button
          type="button"
          id="pool-tab-available"
          onClick={() => setViewMode('available')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
            viewMode === 'available'
              ? 'bg-[#18181B] text-white shadow-xs'
              : 'text-[#746F68] dark:text-[#A6A096] hover:bg-[#FAF7F2] dark:hover:bg-[#262421]'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>{isNe ? 'सबै उपलब्ध गाडीहरू' : 'All Available Pools'}</span>
          <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-white/20 text-inherit font-mono">
            {trucksList.length}
          </span>
        </button>

        <button
          type="button"
          id="pool-tab-my-bookings"
          onClick={() => setViewMode('my-bookings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
            viewMode === 'my-bookings'
              ? 'bg-[#18181B] text-white shadow-xs'
              : 'text-[#746F68] dark:text-[#A6A096] hover:bg-[#FAF7F2] dark:hover:bg-[#262421]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>{isNe ? 'मैले बुक गरेका ढुवानी' : 'My Bookings'}</span>
          <span
            className={`ml-1 text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ${
              userBookings.length > 0
                ? 'bg-[#2E7D5A] text-white'
                : 'bg-[#E8E2D8] dark:bg-[#383530] text-[#746F68] dark:text-[#A6A096]'
            }`}
          >
            {userBookings.length}
          </span>
        </button>

        <button
          type="button"
          id="pool-tab-my-created"
          onClick={() => setViewMode('my-created')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
            viewMode === 'my-created'
              ? 'bg-[#18181B] text-white shadow-xs'
              : 'text-[#746F68] dark:text-[#A6A096] hover:bg-[#FAF7F2] dark:hover:bg-[#262421]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{isNe ? 'मैले राखेका ढुवानी पुलहरू' : 'My Created Pools'}</span>
          <span
            className={`ml-1 text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ${
              myCreatedPools.length > 0
                ? 'bg-[#2D6CDF] text-white'
                : 'bg-[#E8E2D8] dark:bg-[#383530] text-[#746F68] dark:text-[#A6A096]'
            }`}
          >
            {myCreatedPools.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: ALL AVAILABLE POOLS (Schedule + Booking Sheet)                   */}
      {/* ========================================================================= */}
      {viewMode === 'available' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* COLUMN 1: SCHEDULE (Calendar Route Dispatcher) */}
          <div className="lg:col-span-7 bg-white dark:bg-[#22201D] p-5 sm:p-6 rounded-2xl border border-[#E8E2D8] dark:border-[#383530] shadow-sm space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D8] dark:border-[#383530]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] flex items-center justify-center text-[#1F1E1B] dark:text-[#F5F3EF]">
                  <Calendar className="w-4 h-4 text-[#2D6CDF]" />
                </div>
                <h2 className="text-base sm:text-lg font-black text-[#1F1E1B] dark:text-[#F5F3EF]">
                  {isNe ? 'गाडी तालिका' : 'Scheduled Routes'}
                </h2>
              </div>
              <span className="text-xs font-bold text-[#746F68] dark:text-[#A6A096]">
                {filteredTrucks.length} {isNe ? 'गाडी उपलब्ध' : 'trucks available'}
              </span>
            </div>

            {/* Calendar & Location Controls */}
            <div className="p-3 sm:p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] space-y-2.5">
              {/* Destination Dropdown & Date Display */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div className="flex items-center gap-2.5 bg-white dark:bg-[#1E1D1B] px-3.5 py-2 rounded-xl border border-[#E8E2D8] dark:border-[#383530] flex-1">
                  <MapPin className="w-4 h-4 text-[#2D6CDF] shrink-0" />
                  <select
                    value={selectedDestination}
                    onChange={(e) => setSelectedDestination(e.target.value)}
                    className="bg-transparent text-xs sm:text-sm font-bold text-[#1F1E1B] dark:text-[#F5F3EF] focus:outline-none w-full cursor-pointer"
                  >
                    <option value="all" className="dark:bg-[#1E1D1B]">
                      {isNe ? 'सबै बजारहरू' : 'All Mandis'}
                    </option>
                    <option value="kalimati" className="dark:bg-[#1E1D1B]">
                      {isNe ? 'कालीमाटी थोक बजार' : 'Kalimati Wholesale'}
                    </option>
                    <option value="balkhu" className="dark:bg-[#1E1D1B]">
                      {isNe ? 'बल्खु कृषि बजार' : 'Balkhu Market'}
                    </option>
                    <option value="narayangarh" className="dark:bg-[#1E1D1B]">
                      {isNe ? 'नारायणगढ मन्डी' : 'Narayangarh Mandi'}
                    </option>
                    <option value="pokhara" className="dark:bg-[#1E1D1B]">
                      {isNe ? 'पोखरा थोक बजार' : 'Pokhara Wholesale'}
                    </option>
                  </select>
                </div>

                <div className="flex items-center justify-between sm:justify-center px-3.5 py-2 rounded-xl bg-white dark:bg-[#1E1D1B] border border-[#E8E2D8] dark:border-[#383530] text-xs font-mono font-bold text-[#1F1E1B] dark:text-[#F5F3EF] shrink-0 gap-2">
                  <Calendar className="w-3.5 h-3.5 text-[#2D6CDF]" />
                  <span>{activeCalendarDay.bsDateStr}</span>
                </div>
              </div>

              {/* Calendar Date Pills Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                {calendarDates.map((dateObj) => {
                  const isSelected = selectedDispatchDate === dateObj.id;
                  return (
                    <button
                      key={dateObj.id}
                      type="button"
                      onClick={() => setSelectedDispatchDate(dateObj.id)}
                      className={`flex-1 flex flex-col items-center justify-center px-2 py-1.5 rounded-xl border text-center transition cursor-pointer min-w-[50px] sm:min-w-[58px] ${
                        isSelected
                          ? 'bg-[#2D6CDF] text-white border-[#2D6CDF] shadow-xs'
                          : 'bg-white dark:bg-[#1E1D1B] text-[#1F1E1B] dark:text-[#F5F3EF] border-[#E8E2D8] dark:border-[#383530] hover:bg-[#FAF7F2] dark:hover:bg-[#262421]'
                      }`}
                    >
                      <span className="text-sm sm:text-base font-black leading-tight">
                        {dateObj.dayNum}
                      </span>
                      <span
                        className={`text-[11px] font-semibold leading-tight ${
                          isSelected ? 'text-white/90' : 'text-[#746F68] dark:text-[#A6A096]'
                        }`}
                      >
                        {dateObj.dayName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Truck List */}
            <div className="space-y-2.5 pt-1">
              {filteredTrucks.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] text-center space-y-3">
                  <Truck className="w-8 h-8 text-[#A6A096] mx-auto opacity-50" />
                  <span className="text-sm font-bold text-[#1F1E1B] dark:text-[#F5F3EF] block">
                    {isNe ? 'यस मितिमा कुनै गाडी तालिका छैन' : 'No trucks scheduled for this date'}
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedDestination('all')}
                      className="text-xs font-bold text-[#2D6CDF] hover:underline cursor-pointer"
                    >
                      {isNe ? 'सबै बजारहरू देखाउनुहोस्' : 'Show all destinations'}
                    </button>
                    <span className="text-[#746F68]">•</span>
                    <button
                      type="button"
                      onClick={handleOpenCreateModal}
                      className="text-xs font-bold text-[#2E7D5A] hover:underline cursor-pointer"
                    >
                      {isNe ? '+ नयाँ गाडी थप्नुहोस्' : '+ Add a new pool'}
                    </button>
                  </div>
                </div>
              ) : (
                filteredTrucks.map((truck) => {
                  const isSelected = selectedTruckId === truck.id;
                  return (
                    <div
                      key={truck.id}
                      onClick={() => setSelectedTruckId(truck.id)}
                      className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#F0F6FF] dark:bg-[#1B2942] border-[#2D6CDF] shadow-xs ring-1 ring-[#2D6CDF]/30'
                          : 'bg-[#FAF7F2] dark:bg-[#262421] border-[#E8E2D8] dark:border-[#383530] hover:border-[#2D6CDF]/40 hover:bg-white dark:hover:bg-[#22201D]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-[#2D6CDF] text-white'
                                : 'bg-[#EAF3EE] dark:bg-[#1E3327] text-[#2E7D5A] dark:text-[#4ADE80]'
                            }`}
                          >
                            <Truck className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-black text-sm sm:text-base text-[#1F1E1B] dark:text-[#F5F3EF]">
                                {isNe ? truck.destinationNe : truck.destinationEn}
                              </h3>
                              {truck.isUserCreated && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold text-[10px] border border-amber-200 dark:border-amber-800/60">
                                  {isNe ? 'किसानले राखेको' : 'Farmer Organized'}
                                </span>
                              )}
                            </div>
                            <span className="text-xs font-semibold text-[#545048] dark:text-[#C5BFB5] flex items-center gap-1.5 mt-0.5">
                              <Clock className="w-3 h-3 text-[#746F68] dark:text-[#A6A096]" />
                              {isNe ? truck.departureNe : truck.departureEn} • {truck.nameEn}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-mono font-black text-sm sm:text-base text-[#1F1E1B] dark:text-[#F5F3EF]">
                            Rs {truck.ratePerKg}/kg
                          </span>
                          <span className="text-[11px] font-bold text-[#2E7D5A] dark:text-[#4ADE80] block">
                            -{truck.savingsPct}% {isNe ? 'सस्तो' : 'cheaper'}
                          </span>
                        </div>
                      </div>

                      {/* DYNAMIC PROGRESS BAR & WEIGHT DETAILS */}
                      <div className="mt-3 space-y-1">
                        <div className="h-2 w-full bg-white dark:bg-[#1E1D1B] rounded-full border border-[#E8E2D8] dark:border-[#383530] overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              truck.percentFilled >= 90
                                ? 'bg-amber-500'
                                : 'bg-[#2D6CDF]'
                            }`}
                            style={{ width: `${truck.percentFilled}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-mono text-[#746F68] dark:text-[#A6A096]">
                          <span>
                            {truck.bookedKg} / {truck.capacityKg} kg ({truck.percentFilled}%)
                            {truck.farmersCount > 0 && ` • ${truck.farmersCount} farmers`}
                          </span>
                          <span
                            className={`font-bold ${
                              truck.spaceRemainingKg <= 200
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-[#1F1E1B] dark:text-[#F5F3EF]'
                            }`}
                          >
                            {truck.spaceRemainingKg} kg {isNe ? 'बाँकी ठाउँ' : 'space remaining'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* COLUMN 2: BOOKING SHEET (Interactive Booking & Dynamic Update) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-[#22201D] p-5 sm:p-6 rounded-2xl border border-[#E8E2D8] dark:border-[#383530] shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D8] dark:border-[#383530]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#EAF3EE] dark:bg-[#1E3327] text-[#2E7D5A] dark:text-[#4ADE80] flex items-center justify-center font-bold">
                    <Check className="w-4 h-4" />
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-[#1F1E1B] dark:text-[#F5F3EF]">
                    {isNe ? 'ढुवानी ठाउँ बुकिङ' : 'Book Truck Space'}
                  </h2>
                </div>
                <span className="text-xs font-mono font-bold text-[#2D6CDF]">
                  {activeTruck ? (isNe ? activeTruck.destinationNe : activeTruck.destinationEn) : ''}
                </span>
              </div>

              {/* Selected Truck Details */}
              {activeTruck && (
                <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#1F1E1B] dark:text-[#F5F3EF]">
                      {isNe ? activeTruck.nameNe : activeTruck.nameEn}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#EAF3EE] dark:bg-[#1E3327] text-[#2E7D5A] dark:text-[#4ADE80] font-bold text-[11px]">
                      Rs {activeTruck.ratePerKg}/kg
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#746F68] dark:text-[#A6A096]">
                    <span>
                      {activeCalendarDay.bsDateStr} • {isNe ? activeTruck.departureNe : activeTruck.departureEn}
                    </span>
                    <span className="font-mono font-bold text-[#2D6CDF]">
                      {activeTruck.spaceRemainingKg} kg {isNe ? 'उपलब्ध' : 'available'}
                    </span>
                  </div>
                  {activeTruck.createdByName && (
                    <div className="text-[11px] text-[#746F68] dark:text-[#A6A096] pt-1 border-t border-[#E8E2D8] dark:border-[#383530] flex items-center justify-between">
                      <span>{isNe ? 'संयोजक:' : 'Organizer:'} {activeTruck.createdByName}</span>
                      {activeTruck.createdByPhone && <span>{activeTruck.createdByPhone}</span>}
                    </div>
                  )}
                </div>
              )}

              {/* Booking Form */}
              <form onSubmit={handleConfirmBooking} className="space-y-3.5 text-xs">
                {/* Crop */}
                <div className="space-y-1">
                  <label className="font-bold text-[#746F68] dark:text-[#A6A096]">
                    {isNe ? 'बाली (Crop)' : 'Crop to Transport'}
                  </label>
                  <select
                    value={selectedCropId}
                    onChange={(e) => setSelectedCropId(e.target.value)}
                    className="w-full bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] rounded-xl px-3 py-2.5 font-bold text-[#1F1E1B] dark:text-[#F5F3EF] focus:outline-none cursor-pointer"
                  >
                    {COMMODITY_SEEDS.map((seed) => (
                      <option key={seed.id} value={seed.id} className="dark:bg-[#1E1D1B]">
                        {seed.emoji} {isNe ? seed.nepaliName : seed.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity Input with Regex Validation: Allows free typing, backspacing, custom amounts! */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-[#746F68] dark:text-[#A6A096]">
                      {isNe ? 'परिमाण (केजी) - Quantity (kg)' : 'Quantity (kg)'}
                    </label>
                    {/* Quick preset chips */}
                    <div className="flex gap-1">
                      {[100, 250, 500, 1000].map((qty) => (
                        <button
                          key={qty}
                          type="button"
                          onClick={() => setQuantityInput(String(qty))}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition ${
                            quantityInput === String(qty)
                              ? 'bg-[#1F1E1B] text-white dark:bg-[#F5F3EF] dark:text-[#1F1E1B]'
                              : 'bg-[#FAF7F2] dark:bg-[#262421] text-[#746F68] dark:text-[#A6A096] hover:text-[#1F1E1B]'
                          }`}
                        >
                          {qty}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setQuantityInput('500')}
                        className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold text-[#2D6CDF] hover:underline cursor-pointer"
                        title="Set default 500 kg"
                      >
                        {isNe ? 'डिफल्ट' : 'Default'}
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={quantityInput}
                      onChange={(e) => handleQuantityChange(e.target.value)}
                      placeholder={isNe ? 'जस्तै: 350' : 'e.g. 350'}
                      className="w-full bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] rounded-xl px-3 py-2.5 font-mono font-bold text-base text-[#1F1E1B] dark:text-[#F5F3EF] focus:outline-none focus:ring-1 focus:ring-[#2E7D5A]"
                    />
                    <span className="absolute right-3 top-3 text-xs font-mono font-bold text-[#746F68] dark:text-[#A6A096]">
                      KG
                    </span>
                  </div>

                  {bookingError && (
                    <p className="text-[11px] text-red-600 dark:text-red-400 font-bold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{bookingError}</span>
                    </p>
                  )}
                </div>

                {/* Pickup Hub */}
                <div className="space-y-1">
                  <label className="font-bold text-[#746F68] dark:text-[#A6A096]">
                    {isNe ? 'संकलन केन्द्र (Pickup Hub)' : 'Pickup Hub Location'}
                  </label>
                  <input
                    type="text"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="w-full bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] rounded-xl px-3 py-2 font-medium text-xs text-[#1F1E1B] dark:text-[#F5F3EF] focus:outline-none"
                  />
                </div>

                {/* Summary Table */}
                <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-[#746F68] dark:text-[#A6A096]">
                    <span>{isNe ? 'साझेदारी दर' : 'Pooled Rate'}</span>
                    <span>Rs {pooledRatePerKg}/kg</span>
                  </div>
                  <div className="flex justify-between text-[#746F68] dark:text-[#A6A096]">
                    <span>{isNe ? 'एक्लै गाडी गर्दा दर' : 'Solo Freight Rate'}</span>
                    <span className="line-through">Rs {soloRatePerKg}/kg</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#1F1E1B] dark:text-[#F5F3EF] pt-1 border-t border-[#E8E2D8] dark:border-[#383530]">
                    <span>{isNe ? 'कुल ढुवानी भाडा' : 'Total Freight'}</span>
                    <span>Rs {freightTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#2E7D5A] dark:text-[#4ADE80]">
                    <span>{isNe ? 'तपाईंको कुल बचत' : 'Your Net Savings'}</span>
                    <span>+Rs {savingsTotal.toLocaleString()} NPR</span>
                  </div>
                </div>

                {/* Success Message */}
                <AnimatePresence>
                  {bookingSuccessId && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-3 rounded-xl bg-[#EAF3EE] dark:bg-[#1E3327] text-[#1E5E41] dark:text-[#4ADE80] text-xs font-bold flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>
                        {isNe
                          ? 'ठाउँ सफलतापूर्वक सुरक्षित भयो! गाडीको बाँकी तौल अपडेट भयो।'
                          : 'Truck space successfully reserved! Truck capacity updated.'}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Primary CTA */}
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#2E7D5A] hover:bg-[#246648] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-xs active:scale-[0.99]"
                >
                  <span>
                    {isNe
                      ? `ठाउँ बुक गर्नुहोस् (${quantityKg} केजी)`
                      : `Confirm Booking (${quantityKg} kg)`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Quick Link to My Bookings */}
            {userBookings.length > 0 && (
              <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#1F1E1B] dark:text-[#F5F3EF] block">
                    {isNe ? `तपाईंसँग ${userBookings.length} सक्रिय बुकिङ छन्` : `You have ${userBookings.length} active bookings`}
                  </span>
                  <span className="text-[#746F68] dark:text-[#A6A096] text-[11px]">
                    {isNe ? 'आफ्ना लोडहरू हेर्न तथा व्यवस्थापन गर्न क्लिक गर्नुहोस्' : 'Click to see what transport you booked and kept here'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setViewMode('my-bookings')}
                  className="px-3 py-1.5 rounded-lg bg-[#18181B] dark:bg-white text-white dark:text-[#18181B] font-bold text-xs cursor-pointer hover:opacity-90"
                >
                  {isNe ? 'हेर्नुहोस्' : 'View'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: MY BOOKINGS ("What transport I booked")                            */}
      {/* ========================================================================= */}
      {viewMode === 'my-bookings' && (
        <div className="space-y-6">
          {/* Summary Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#22201D] border border-[#E8E2D8] dark:border-[#383530] shadow-xs">
              <span className="text-xs font-bold text-[#746F68] dark:text-[#A6A096] block">
                {isNe ? 'कुल बुक गरिएको तौल' : 'Total Booked Cargo'}
              </span>
              <div className="text-2xl font-black text-[#1F1E1B] dark:text-[#F5F3EF] font-mono mt-1">
                {userBookings.reduce((sum, b) => sum + b.quantityKg, 0).toLocaleString()} kg
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#22201D] border border-[#E8E2D8] dark:border-[#383530] shadow-xs">
              <span className="text-xs font-bold text-[#746F68] dark:text-[#A6A096] block">
                {isNe ? 'कुल ढुवानी लागत' : 'Total Freight Cost'}
              </span>
              <div className="text-2xl font-black text-[#2D6CDF] font-mono mt-1">
                Rs {userBookings.reduce((sum, b) => sum + b.totalCost, 0).toLocaleString()}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#22201D] border border-[#E8E2D8] dark:border-[#383530] shadow-xs">
              <span className="text-xs font-bold text-[#746F68] dark:text-[#A6A096] block">
                {isNe ? 'कुल बचत गरिएको रकम' : 'Total Pooling Savings'}
              </span>
              <div className="text-2xl font-black text-[#2E7D5A] dark:text-[#4ADE80] font-mono mt-1">
                +Rs {userBookings.reduce((sum, b) => sum + b.savings, 0).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Bookings List */}
          <div className="bg-white dark:bg-[#22201D] p-5 sm:p-6 rounded-2xl border border-[#E8E2D8] dark:border-[#383530] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D8] dark:border-[#383530]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EAF3EE] dark:bg-[#1E3327] text-[#2E7D5A] dark:text-[#4ADE80] flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-[#1F1E1B] dark:text-[#F5F3EF]">
                    {isNe ? 'मैले बुक गरेका गाडीहरू र राखिएका उत्पादनहरू' : 'Booked Transport & Reserved Cargo'}
                  </h2>
                  <p className="text-xs text-[#746F68] dark:text-[#A6A096]">
                    {isNe
                      ? 'तपाईंले कुन गाडीमा कति सामान राख्नुभएको छ यहाँ हेर्नुहोस्'
                      : 'Review all trucks you booked and items reserved for transport'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewMode('available')}
                className="px-3 py-1.5 rounded-lg border border-[#E8E2D8] dark:border-[#383530] text-xs font-bold text-[#1F1E1B] dark:text-[#F5F3EF] hover:bg-[#FAF7F2] dark:hover:bg-[#262421] cursor-pointer"
              >
                {isNe ? '+ थप गाडी बुक गर्नुहोस्' : '+ Book More Space'}
              </button>
            </div>

            {userBookings.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <Package className="w-12 h-12 text-[#A6A096] mx-auto opacity-40" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[#1F1E1B] dark:text-[#F5F3EF]">
                    {isNe ? 'कुनै बुकिङ गरिएको छैन' : 'No Transport Bookings Yet'}
                  </h3>
                  <p className="text-xs text-[#746F68] dark:text-[#A6A096] max-w-sm mx-auto">
                    {isNe
                      ? 'उपलब्ध गाडीहरूको तालिका हेरी आफ्नो तरकारी वा बालीको ढुवानी ठाउँ सुरक्षित गर्नुहोस्'
                      : 'Choose an available truck from the schedule to book space for your harvested crops'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewMode('available')}
                  className="px-4 py-2 rounded-xl bg-[#2E7D5A] hover:bg-[#246648] text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  {isNe ? 'गाडी तालिका हेर्नुहोस्' : 'Browse Available Trucks'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userBookings.map((bk) => (
                  <div
                    key={bk.id}
                    className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-[#2D6CDF] block uppercase">
                          {bk.id} • {bk.dateStr}
                        </span>
                        <h3 className="font-black text-base text-[#1F1E1B] dark:text-[#F5F3EF]">
                          {bk.destination}
                        </h3>
                        <span className="text-xs font-semibold text-[#746F68] dark:text-[#A6A096]">
                          {bk.truckName}
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-[#EAF3EE] dark:bg-[#1E3327] text-[#2E7D5A] dark:text-[#4ADE80] font-bold text-xs">
                        {bk.quantityKg} kg
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-white dark:bg-[#1E1D1B] border border-[#E8E2D8] dark:border-[#383530] text-xs space-y-1 font-mono">
                      <div className="flex justify-between text-[#746F68] dark:text-[#A6A096]">
                        <span>{isNe ? 'बाली' : 'Crop'}</span>
                        <span className="font-bold text-[#1F1E1B] dark:text-[#F5F3EF]">{bk.cropName}</span>
                      </div>
                      <div className="flex justify-between text-[#746F68] dark:text-[#A6A096]">
                        <span>{isNe ? 'संकलन केन्द्र' : 'Pickup Hub'}</span>
                        <span className="font-bold text-[#1F1E1B] dark:text-[#F5F3EF] truncate max-w-[160px]">
                          {bk.pickupLocation}
                        </span>
                      </div>
                      <div className="flex justify-between text-[#746F68] dark:text-[#A6A096]">
                        <span>{isNe ? 'प्रस्थान समय' : 'Departure'}</span>
                        <span className="font-bold text-[#1F1E1B] dark:text-[#F5F3EF]">{bk.departure}</span>
                      </div>
                      <div className="flex justify-between font-bold text-[#1F1E1B] dark:text-[#F5F3EF] pt-1 border-t border-[#E8E2D8] dark:border-[#383530]">
                        <span>{isNe ? 'भाडा रकम' : 'Freight Cost'}</span>
                        <span className="text-[#2D6CDF]">Rs {bk.totalCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold text-[#2E7D5A] dark:text-[#4ADE80]">
                        <span>{isNe ? 'बचत' : 'Saved'}</span>
                        <span>+Rs {bk.savings.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-[11px] text-[#746F68] dark:text-[#A6A096]">
                        {isNe ? 'बुकिङ समय:' : 'Booked:'} {bk.bookedAt}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCancelBooking(bk.id)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700 dark:text-red-400 font-bold hover:underline cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{isNe ? 'बुकिङ रद्द गर्नुहोस्' : 'Cancel & Free Weight'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: MY CREATED POOLS ("What I have kept here")                          */}
      {/* ========================================================================= */}
      {viewMode === 'my-created' && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#22201D] border border-[#E8E2D8] dark:border-[#383530] shadow-xs">
              <span className="text-xs font-bold text-[#746F68] dark:text-[#A6A096] block">
                {isNe ? 'मैले राखेका गाडीहरू' : 'Created Pools'}
              </span>
              <div className="text-2xl font-black text-[#1F1E1B] dark:text-[#F5F3EF] font-mono mt-1">
                {myCreatedPools.length}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#22201D] border border-[#E8E2D8] dark:border-[#383530] shadow-xs">
              <span className="text-xs font-bold text-[#746F68] dark:text-[#A6A096] block">
                {isNe ? 'प्रस्तावित कुल क्षमता' : 'Total Offered Capacity'}
              </span>
              <div className="text-2xl font-black text-[#2D6CDF] font-mono mt-1">
                {myCreatedPools.reduce((sum, p) => sum + p.capacityKg, 0).toLocaleString()} kg
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#22201D] border border-[#E8E2D8] dark:border-[#383530] shadow-xs">
              <span className="text-xs font-bold text-[#746F68] dark:text-[#A6A096] block">
                {isNe ? 'किसानहरूले भरेको तौल' : 'Filled Cargo Volume'}
              </span>
              <div className="text-2xl font-black text-[#2E7D5A] dark:text-[#4ADE80] font-mono mt-1">
                {myCreatedPools.reduce((sum, p) => sum + p.bookedKg, 0).toLocaleString()} kg
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#22201D] p-5 sm:p-6 rounded-2xl border border-[#E8E2D8] dark:border-[#383530] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D8] dark:border-[#383530]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EAF3EE] dark:bg-[#1E3327] text-[#2E7D5A] dark:text-[#4ADE80] flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-[#1F1E1B] dark:text-[#F5F3EF]">
                    {isNe ? 'मैले नयाँ गन्तव्यका लागि राखेका गाडी तथा पुलहरू' : 'My Created Pools & Registered Trucks'}
                  </h2>
                  <p className="text-xs text-[#746F68] dark:text-[#A6A096]">
                    {isNe
                      ? 'तपाईंले अरू किसानहरू थप्नका लागि राखेका ढुवानी गाडीहरू'
                      : 'Transport pools you initiated so other nearby farmers can load their crops'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2E7D5A] hover:bg-[#246648] text-white text-xs font-bold transition cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>{isNe ? '+ अर्को पुल थप्नुहोस्' : '+ Create Another Pool'}</span>
              </button>
            </div>

            {myCreatedPools.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <Layers className="w-12 h-12 text-[#A6A096] mx-auto opacity-40" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[#1F1E1B] dark:text-[#F5F3EF]">
                    {isNe ? 'तपाईंले कुनै नयाँ ढुवानी पुल राख्नुभएको छैन' : 'No Created Pools Yet'}
                  </h3>
                  <p className="text-xs text-[#746F68] dark:text-[#A6A096] max-w-sm mx-auto">
                    {isNe
                      ? 'यदि तपाईं गाडी रिजर्व गर्दै हुनुहुन्छ भने नयाँ पुल सिर्जना गर्नुहोस् ताकि अन्य किसानहरूले पनि आफ्नो उत्पादन थप्न सकून् र भाडा आधा घटोस्'
                      : 'If you have a vehicle or wish to ship to a new mandi, create a pool so neighboring farmers can pool their harvests with you'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="px-4 py-2 rounded-xl bg-[#2E7D5A] hover:bg-[#246648] text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  {isNe ? 'नयाँ ढुवानी पुल सुरु गर्नुहोस्' : 'Start a Transport Pool'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myCreatedPools.map((pool) => (
                  <div
                    key={pool.id}
                    className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] border border-emerald-200 dark:border-emerald-800/60">
                            {isNe ? 'खुला छ' : 'Active Pool'}
                          </span>
                          <span className="text-xs font-mono font-bold text-[#746F68] dark:text-[#A6A096]">
                            Rs {pool.ratePerKg}/kg
                          </span>
                        </div>
                        <h3 className="font-black text-base text-[#1F1E1B] dark:text-[#F5F3EF] mt-1">
                          {pool.originDistrict || selectedDistrict} → {isNe ? pool.destinationNe : pool.destinationEn}
                        </h3>
                        <span className="text-xs font-medium text-[#746F68] dark:text-[#A6A096] block">
                          {pool.vehicleType || 'Bolero Pickup 2.5T'} • {isNe ? pool.departureNe : pool.departureEn}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-sm text-[#2E7D5A] dark:text-[#4ADE80]">
                          {pool.percentFilled}%
                        </span>
                        <span className="text-[10px] text-[#746F68] dark:text-[#A6A096] block">
                          {isNe ? 'भरिएको' : 'filled'}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="h-2.5 w-full bg-white dark:bg-[#1E1D1B] rounded-full border border-[#E8E2D8] dark:border-[#383530] overflow-hidden">
                        <div
                          className="h-full bg-[#2E7D5A] rounded-full transition-all duration-300"
                          style={{ width: `${pool.percentFilled}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] font-mono text-[#746F68] dark:text-[#A6A096]">
                        <span>
                          {pool.bookedKg} / {pool.capacityKg} kg
                        </span>
                        <span className="font-bold text-[#1F1E1B] dark:text-[#F5F3EF]">
                          {pool.spaceRemainingKg} kg {isNe ? 'अरू किसानका लागि बाँकी' : 'available for farmers'}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-white dark:bg-[#1E1D1B] border border-[#E8E2D8] dark:border-[#383530] text-xs space-y-1">
                      <div className="flex justify-between text-[#746F68] dark:text-[#A6A096]">
                        <span>{isNe ? 'संकलन विन्दु' : 'Pickup Hub'}</span>
                        <span className="font-medium text-[#1F1E1B] dark:text-[#F5F3EF] truncate max-w-[180px]">
                          {pool.originHub}
                        </span>
                      </div>
                      <div className="flex justify-between text-[#746F68] dark:text-[#A6A096]">
                        <span>{isNe ? 'सहभागी किसानहरू' : 'Joined Farmers'}</span>
                        <span className="font-bold text-[#1F1E1B] dark:text-[#F5F3EF]">
                          {pool.farmersCount} {isNe ? 'जना' : 'farmers'}
                        </span>
                      </div>
                      {pool.notes && (
                        <div className="pt-1 text-[11px] text-[#746F68] dark:text-[#A6A096] italic">
                          "{pool.notes}"
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE NEW POOL BY USERS                                           */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-lg bg-white dark:bg-[#22201D] border border-[#E8E2D8] dark:border-[#383530] rounded-2xl shadow-xl overflow-hidden my-8 text-xs text-[#1F1E1B] dark:text-[#F5F3EF]"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-[#E8E2D8] dark:border-[#383530] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#EAF3EE] dark:bg-[#1E3327] text-[#2E7D5A] dark:text-[#4ADE80] flex items-center justify-center">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black">
                      {isNe ? 'नयाँ ढुवानी पुल सिर्जना गर्नुहोस्' : 'Create New Transport Pool'}
                    </h3>
                    <p className="text-[11px] text-[#746F68] dark:text-[#A6A096]">
                      {isNe
                        ? 'नयाँ गन्तव्यमा गाडी राख्नुहोस्, अन्य किसानले आफ्ना उत्पादन थप्न सक्नेछन्'
                        : 'Post a vehicle for a route so neighboring farmers can share and add crops'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-[#FAF7F2] dark:hover:bg-[#262421] text-[#746F68] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleCreatePoolSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                {/* 1. Origin & Hub */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-[#746F68] dark:text-[#A6A096]">
                      {isNe ? 'सुरुवात जिल्ला' : 'Origin District'}
                    </label>
                    <select
                      value={newOriginDistrict}
                      onChange={(e) => {
                        setNewOriginDistrict(e.target.value);
                        setNewOriginHub(`${e.target.value} Central Hub`);
                      }}
                      className="w-full bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] rounded-xl px-3 py-2 font-bold cursor-pointer"
                    >
                      {DISTRICT_LIST.map((d) => (
                        <option key={d.id} value={d.name} className="dark:bg-[#1E1D1B]">
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#746F68] dark:text-[#A6A096]">
                      {isNe ? 'संकलन विन्दु (Pickup Hub)' : 'Pickup Hub'}
                    </label>
                    <input
                      type="text"
                      value={newOriginHub}
                      onChange={(e) => setNewOriginHub(e.target.value)}
                      placeholder="e.g. Bharatpur-11 Chowk"
                      className="w-full bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] rounded-xl px-3 py-2 font-medium"
                      required
                    />
                  </div>
                </div>

                {/* 2. Destination */}
                <div className="space-y-1">
                  <label className="font-bold text-[#746F68] dark:text-[#A6A096]">
                    {isNe ? 'गन्तव्य बजार (Target Mandi)' : 'Target Mandi / Destination'}
                  </label>
                  <select
                    value={newDestinationChoice}
                    onChange={(e) => setNewDestinationChoice(e.target.value)}
                    className="w-full bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] rounded-xl px-3 py-2 font-bold cursor-pointer"
                  >
                    <option value="kalimati" className="dark:bg-[#1E1D1B]">
                      {isNe ? 'कालीमाटी थोक बजार (काठमाडौं)' : 'Kalimati Wholesale (Kathmandu)'}
                    </option>
                    <option value="balkhu" className="dark:bg-[#1E1D1B]">
                      {isNe ? 'बल्खु कृषि बजार (काठमाडौं)' : 'Balkhu Agri Market (Kathmandu)'}
                    </option>
                    <option value="pokhara" className="dark:bg-[#1E1D1B]">
                      {isNe ? 'पोखरा थोक मन्डी' : 'Pokhara Wholesale Mandi'}
                    </option>
                    <option value="narayangarh" className="dark:bg-[#1E1D1B]">
                      {isNe ? 'नारायणगढ मन्डी' : 'Narayangarh Mandi'}
                    </option>
                    <option value="butwal" className="dark:bg-[#1E1D1B]">
                      {isNe ? 'बुटवल थोक बजार' : 'Butwal Wholesale Market'}
                    </option>
                    <option value="birgunj" className="dark:bg-[#1E1D1B]">
                      {isNe ? 'वीरगञ्ज बजार' : 'Birgunj Border Mandi'}
                    </option>
                    <option value="custom" className="dark:bg-[#1E1D1B]">
                      {isNe ? 'अन्य नयाँ बजार / ठाउँ...' : 'Other Custom Location...'}
                    </option>
                  </select>

                  {newDestinationChoice === 'custom' && (
                    <input
                      type="text"
                      value={newCustomDest}
                      onChange={(e) => setNewCustomDest(e.target.value)}
                      placeholder={isNe ? 'नयाँ बजारको नाम लेख्नुहोस्...' : 'Type custom destination name...'}
                      className="w-full bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] rounded-xl px-3 py-2 font-bold mt-1"
                      required
                    />
                  )}
                </div>

                {/* 3. Departure Date & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-[#746F68] dark:text-[#A6A096]">
                      {isNe ? 'प्रस्थान मिति' : 'Departure Date'}
                    </label>
                    <select
                      value={newDepartureDateId}
                      onChange={(e) => setNewDepartureDateId(e.target.value)}
                      className="w-full bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] rounded-xl px-3 py-2 font-bold cursor-pointer"
                    >
                      {calendarDates.map((d) => (
                        <option key={d.id} value={d.id} className="dark:bg-[#1E1D1B]">
                          {d.bsDateStr} ({d.dayName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#746F68] dark:text-[#A6A096]">
                      {isNe ? 'प्रस्थान समय' : 'Departure Time'}
                    </label>
                    <input
                      type="text"
                      value={newDepartureTime}
                      onChange={(e) => setNewDepartureTime(e.target.value)}
                      placeholder="e.g. 5:00 AM"
                      className="w-full bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] rounded-xl px-3 py-2 font-bold"
                      required
                    />
                  </div>
                </div>

                {/* 4. Vehicle Type & Capacity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-[#746F68] dark:text-[#A6A096]">
                      {isNe ? 'गाडीको प्रकार' : 'Vehicle Type'}
                    </label>
                    <select
                      value={newVehicleType}
                      onChange={(e) => {
                        setNewVehicleType(e.target.value);
                        if (e.target.value.includes('Bolero')) setNewCapacityInput('2500');
                        else if (e.target.value.includes('Tata Ace')) setNewCapacityInput('1500');
                        else if (e.target.value.includes('Eicher')) setNewCapacityInput('5000');
                        else if (e.target.value.includes('Heavy')) setNewCapacityInput('10000');
                      }}
                      className="w-full bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] rounded-xl px-3 py-2 font-bold cursor-pointer text-xs"
                    >
                      <option value="Mahindra Bolero Maxi Truck (2.5 Ton)">Bolero Maxi (2.5 Ton)</option>
                      <option value="Tata Ace Mini Truck (1.5 Ton)">Tata Ace (1.5 Ton)</option>
                      <option value="Eicher Medium Truck (5 Ton)">Eicher Truck (5 Ton)</option>
                      <option value="Heavy 6-Wheeler Truck (10 Ton)">Heavy Truck (10 Ton)</option>
                    </select>
                  </div>

                  {/* Regex Validated Capacity Input */}
                  <div className="space-y-1">
                    <label className="font-bold text-[#746F68] dark:text-[#A6A096]">
                      {isNe ? 'कुल क्षमता (केजी)' : 'Total Capacity (kg)'}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={newCapacityInput}
                      onChange={(e) => handleCapacityInputChange(e.target.value)}
                      placeholder="2500"
                      className="w-full bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] rounded-xl px-3 py-2 font-mono font-bold"
                      required
                    />
                  </div>
                </div>

                {/* 5. Rate per kg & Initial Cargo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Regex Validated Price/Rate Input */}
                  <div className="space-y-1">
                    <label className="font-bold text-[#746F68] dark:text-[#A6A096]">
                      {isNe ? 'प्रस्तावित भाडा दर (रु/केजी)' : 'Proposed Rate (Rs/kg)'}
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={newRateInput}
                      onChange={(e) => handleRateInputChange(e.target.value)}
                      placeholder="2.5"
                      className="w-full bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] rounded-xl px-3 py-2 font-mono font-bold"
                      required
                    />
                  </div>

                  {/* Regex Validated Initial Cargo Input */}
                  <div className="space-y-1">
                    <label className="font-bold text-[#746F68] dark:text-[#A6A096]">
                      {isNe ? 'तपाईंको सुरुवाती तौल (केजी)' : 'Your Initial Cargo (kg)'}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={newInitialCargoInput}
                      onChange={(e) => handleInitialCargoInputChange(e.target.value)}
                      placeholder="300"
                      className="w-full bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] rounded-xl px-3 py-2 font-mono font-bold"
                    />
                  </div>
                </div>

                {/* 6. Crop and Organizer Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-[#746F68] dark:text-[#A6A096]">
                      {isNe ? 'तपाईंको बाली' : 'Your Harvested Crop'}
                    </label>
                    <select
                      value={newInitialCropId}
                      onChange={(e) => setNewInitialCropId(e.target.value)}
                      className="w-full bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] rounded-xl px-3 py-2 font-bold cursor-pointer"
                    >
                      {COMMODITY_SEEDS.map((s) => (
                        <option key={s.id} value={s.id} className="dark:bg-[#1E1D1B]">
                          {s.emoji} {isNe ? s.nepaliName : s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#746F68] dark:text-[#A6A096]">
                      {isNe ? 'सम्पर्क फोन नम्बर' : 'Contact Phone'}
                    </label>
                    <input
                      type="text"
                      value={newOrganizerPhone}
                      onChange={(e) => setNewOrganizerPhone(e.target.value)}
                      className="w-full bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] rounded-xl px-3 py-2 font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#746F68] dark:text-[#A6A096]">
                    {isNe ? 'अन्य किसानका लागि जानकारी / नोट' : 'Instructions for other farmers'}
                  </label>
                  <input
                    type="text"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="e.g. Loading crates at 4:30 AM"
                    className="w-full bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] rounded-xl px-3 py-2 font-medium"
                  />
                </div>

                {createPoolError && (
                  <p className="text-red-600 dark:text-red-400 font-bold flex items-center gap-1.5 pt-1">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{createPoolError}</span>
                  </p>
                )}

                <div className="pt-2 flex items-center gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-[#E8E2D8] dark:border-[#383530] font-bold text-xs hover:bg-[#FAF7F2] dark:hover:bg-[#262421] cursor-pointer"
                  >
                    {isNe ? 'रद्द गर्नुहोस्' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#2E7D5A] hover:bg-[#246648] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isNe ? 'पुल प्रकाशित गर्नुहोस्' : 'Publish Pool for Farmers'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
