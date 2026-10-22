import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Calendar,
  IndianRupee,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Download,
  RotateCcw,
  UserCheck,
  FileText,
  Activity,
  Lock,
  Loader2,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  KeyRound,
  ShieldCheck,
  Eye,
  SlidersHorizontal,
  Package,
  Layers,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Flame,
  Upload,
  Image as ImageIcon,
  Star,
  GraduationCap,
  Database,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AdminMetrics, Pujari, Puja, Product } from '../types';
import {
  ProductArt,
  RudrabhishekArt,
  GrihaPraveshArt,
  SatyanarayanArt,
  LakshmiKuberArt,
  PujariAvatar,
} from '../components/SpiritualArt';

interface AdminDashboardPageProps {
  onNavigate: (route: string) => void;
  onCatalogUpdated?: () => void;
  universalPujas?: Puja[];
  universalProducts?: Product[];
  universalPujaris?: Pujari[];
  onUpdatePujas?: (updater: (prev: Puja[]) => Puja[]) => void;
  onUpdateProducts?: (updater: (prev: Product[]) => Product[]) => void;
  onUpdatePujaris?: (updater: (prev: Pujari[]) => Pujari[]) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onNavigate,
  onCatalogUpdated,
  universalPujas,
  universalProducts,
  universalPujaris,
  onUpdatePujas,
  onUpdateProducts,
  onUpdatePujaris,
}) => {
  const { user, isLoading, login, getAuthHeaders } = useAuth();

  // Admin login state if unauthenticated or non-admin
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Tabs - restore from localStorage if user was previously viewing a tab
  const [activeTab, setActiveTabState] = useState<'overview' | 'bookings' | 'pujas' | 'products' | 'pujaris' | 'security'>(() => {
    try {
      const saved = localStorage.getItem('pujasathi_admin_active_tab') as any;
      if (['overview', 'bookings', 'pujas', 'products', 'pujaris', 'security'].includes(saved)) {
        return saved;
      }
    } catch {}
    return 'bookings';
  });

  const setActiveTab = (tab: 'overview' | 'bookings' | 'pujas' | 'products' | 'pujaris' | 'security') => {
    setActiveTabState(tab);
    try {
      localStorage.setItem('pujasathi_admin_active_tab', tab);
    } catch {}
  };

  // Database Data States
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [bookingsList, setBookingsList] = useState<any[]>([]);
  const [pujasList, setPujasList] = useState<Puja[]>(() => {
    if (universalPujas && universalPujas.length > 0) return universalPujas;
    try {
      const cached = localStorage.getItem('pujasathi_cached_pujas');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [productsList, setProductsList] = useState<Product[]>(() => {
    if (universalProducts && universalProducts.length > 0) return universalProducts;
    try {
      const cached = localStorage.getItem('pujasathi_cached_products');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [pujarisList, setPujarisList] = useState<Pujari[]>(() => {
    if (universalPujaris && universalPujaris.length > 0) return universalPujaris;
    try {
      const cached = localStorage.getItem('pujasathi_cached_pujaris');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  // Sync when universal props update
  useEffect(() => {
    if (universalPujas && universalPujas.length > 0) {
      setPujasList(universalPujas);
    }
  }, [universalPujas]);

  useEffect(() => {
    if (universalProducts && universalProducts.length > 0) {
      setProductsList(universalProducts);
    }
  }, [universalProducts]);

  useEffect(() => {
    if (universalPujaris && universalPujaris.length > 0) {
      setPujarisList(universalPujaris);
    }
  }, [universalPujaris]);

  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Filters & Search
  const [searchBooking, setSearchBooking] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [searchPuja, setSearchPuja] = useState('');
  const [searchProduct, setSearchProduct] = useState('');
  const [searchPujari, setSearchPujari] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');
  const [modalError, setModalError] = useState('');

  // Selected Booking for Full Detail Inspection & Editing
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editStatus, setEditStatus] = useState('');
  const [editPujariId, setEditPujariId] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [isUpdatingBooking, setIsUpdatingBooking] = useState(false);

  // Puja Modal State (Create / Edit)
  const [pujaModalOpen, setPujaModalOpen] = useState(false);
  const [editingPuja, setEditingPuja] = useState<Puja | null>(null);
  const [pujaForm, setPujaForm] = useState({
    name: '',
    deity: 'Lord Shiva',
    short_description: '',
    description: '',
    price_in_rupees: 2501,
    duration_mins: 90,
    image: 'rudra',
    required_materials: 'Complete consecrated Vedic samagri kit, Gangajal, pure ghee, bilva leaves.',
    booking_requirements: 'Clean pooja altar, fresh fruits, and traditional clean attire.',
    is_active: 1,
    featured: 0,
  });
  const [isSavingPuja, setIsSavingPuja] = useState(false);

  // Product Modal State (Create / Edit)
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Puja Thalis & Vessels',
    description: '',
    price_in_rupees: 450,
    stock: 50,
    image: 'thali',
    is_active: 1,
    featured: 0,
  });
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // Pujari Modal State (Create / Edit)
  const [pujariModalOpen, setPujariModalOpen] = useState(false);
  const [editingPujari, setEditingPujari] = useState<Pujari | null>(null);
  const [pujariForm, setPujariForm] = useState({
    name: '',
    photo: '',
    bio: '',
    experience_years: 10,
    specializations: 'Vedic Havan, Rudrabhishek, Griha Pravesh',
    languages: 'Hindi, Sanskrit, English',
    service_areas: 'Delhi NCR, Varanasi, Mathura',
    phone: '',
    email: '',
    is_active: 1,
    rating: 4.9,
    review_count: 12,
  });
  const [isSavingPujari, setIsSavingPujari] = useState(false);
  const [isUploadingPujaImg, setIsUploadingPujaImg] = useState(false);
  const [isUploadingPujariImg, setIsUploadingPujariImg] = useState(false);
  const [isUploadingProductImg, setIsUploadingProductImg] = useState(false);

  // Delete confirmation modals (in-app modal replacing window.confirm)
  const [pujaToDelete, setPujaToDelete] = useState<Puja | null>(null);
  const [isDeletingPuja, setIsDeletingPuja] = useState(false);
  const [pujariToDelete, setPujariToDelete] = useState<Pujari | null>(null);
  const [isDeletingPujari, setIsDeletingPujari] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);

  // Security & Password Change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ success: '', error: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const formatPrice = (paise: number) => {
    return '₹' + (paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const safeFetchJson = async (url: string, init: RequestInit = {}): Promise<{ ok: boolean; status: number; data: any }> => {
    try {
      const authHeaders = getAuthHeaders();
      const token = typeof window !== 'undefined' ? localStorage.getItem('mv_session_token') : null;
      const headers: Record<string, string> = {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}`, 'x-session-token': token } : {}),
        ...authHeaders,
        ...((init.headers as Record<string, string>) || {}),
      };

      if (init.body && !(init.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }

      const res = await fetch(url, { ...init, headers, credentials: 'include' });
      const contentType = res.headers.get('content-type') || '';
      let data: any = {};
      if (contentType.includes('application/json')) {
        try {
          data = await res.json();
        } catch {
          data = { error: 'Failed to parse JSON response' };
        }
      } else {
        const text = await res.text();
        data = { error: text.startsWith('<') ? `Server returned non-JSON response (${res.status})` : text };
      }
      return { ok: res.ok, status: res.status, data };
    } catch (err: any) {
      return { ok: false, status: 0, data: { error: err.message || 'Network request failed' } };
    }
  };

  const notifyCrossDeviceCatalogUpdate = () => {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('pujasathi_catalog_channel');
        bc.postMessage('catalog_updated');
        setTimeout(() => {
          try { bc.close(); } catch {}
        }, 150);
      }
    } catch {}
  };

  const handleFileUpload = async (
    file: File,
    onSuccess: (url: string) => void,
    setLoadingState?: (loading: boolean) => void
  ) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setActionError('Please select a valid image file (PNG, JPG, WebP, etc.)');
      setTimeout(() => setActionError(''), 4000);
      return;
    }

    if (setLoadingState) setLoadingState(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const rawDataUrl = e.target?.result as string;
        if (!rawDataUrl) {
          if (setLoadingState) setLoadingState(false);
          return;
        }

        const img = new Image();
        img.onload = async () => {
          const maxDimension = 1200;
          let width = img.width;
          let height = img.height;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);

            try {
              const res = await safeFetchJson('/api/admin/upload-image', {
                method: 'POST',
                body: JSON.stringify({ dataUrl: optimizedDataUrl, filename: file.name }),
              });

              if (res.ok && res.data?.url) {
                onSuccess(res.data.url);
              } else {
                onSuccess(optimizedDataUrl);
              }
            } catch {
              onSuccess(optimizedDataUrl);
            }
          } else {
            onSuccess(rawDataUrl);
          }
          if (setLoadingState) setLoadingState(false);
        };
        img.onerror = () => {
          onSuccess(rawDataUrl);
          if (setLoadingState) setLoadingState(false);
        };
        img.src = rawDataUrl;
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      if (setLoadingState) setLoadingState(false);
      setActionError(err.message || 'Failed to process image');
      setTimeout(() => setActionError(''), 4000);
    }
  };

  const loadAdminData = async () => {
    if (!user || user.role !== 'admin') return;
    setLoading(true);
    const t = Date.now();

    // 1. Metrics & overview
    try {
      const mRes = await safeFetchJson(`/api/admin/metrics?_t=${t}`);
      if (mRes.ok && mRes.data?.metrics) {
        setMetrics(mRes.data.metrics);
        setUpcomingBookings(mRes.data.upcoming_bookings || []);
        setRecentOrders(mRes.data.recent_orders || []);
      }
    } catch (err) {
      console.error('Error fetching admin metrics:', err);
    }

    // 2. Bookings (all orders enriched)
    try {
      const bRes = await safeFetchJson(
        `/api/admin/bookings?status=${statusFilter}&payment_status=${paymentFilter}&search=${encodeURIComponent(
          searchBooking
        )}&_t=${t}`
      );
      if (bRes.ok && bRes.data?.bookings) {
        setBookingsList(bRes.data.bookings || []);
      }
    } catch (err) {
      console.error('Error fetching admin bookings:', err);
    }

    // 3. Pujas catalog (universal server DB)
    try {
      const puCatalogRes = await safeFetchJson(`/api/admin/pujas?_t=${t}`);
      if (puCatalogRes.ok && puCatalogRes.data?.pujas && Array.isArray(puCatalogRes.data.pujas)) {
        setPujasList(puCatalogRes.data.pujas);
        try {
          localStorage.setItem('pujasathi_cached_pujas', JSON.stringify(puCatalogRes.data.pujas));
        } catch {}
      } else {
        const puFallback = await safeFetchJson(`/api/pujas?_t=${t}`);
        if (puFallback.ok && puFallback.data?.pujas && Array.isArray(puFallback.data.pujas)) {
          setPujasList(puFallback.data.pujas);
        }
      }
    } catch (err) {
      console.error('Error fetching admin pujas:', err);
    }

    // 4. Products catalog (universal server DB)
    try {
      const pRes = await safeFetchJson(`/api/admin/products?_t=${t}`);
      if (pRes.ok && pRes.data?.products && Array.isArray(pRes.data.products)) {
        setProductsList(pRes.data.products);
        try {
          localStorage.setItem('pujasathi_cached_products', JSON.stringify(pRes.data.products));
        } catch {}
      } else {
        const pFallback = await safeFetchJson(`/api/products?_t=${t}`);
        if (pFallback.ok && pFallback.data?.products && Array.isArray(pFallback.data.products)) {
          setProductsList(pFallback.data.products);
        }
      }
    } catch (err) {
      console.error('Error fetching admin products:', err);
    }

    // 5. Pujaris (universal server DB)
    try {
      const puRes = await safeFetchJson(`/api/admin/pujaris?_t=${t}`);
      if (puRes.ok && puRes.data?.pujaris && Array.isArray(puRes.data.pujaris)) {
        setPujarisList(puRes.data.pujaris);
        try {
          localStorage.setItem('pujasathi_cached_pujaris', JSON.stringify(puRes.data.pujaris));
        } catch {}
      } else {
        const puFallback = await safeFetchJson(`/api/pujaris?_t=${t}`);
        if (puFallback.ok && puFallback.data?.pujaris && Array.isArray(puFallback.data.pujaris)) {
          setPujarisList(puFallback.data.pujaris);
        }
      }
    } catch (err) {
      console.error('Error fetching admin pujaris:', err);
    }

    // 6. Audit Logs
    try {
      const aRes = await safeFetchJson(`/api/admin/audit-logs?_t=${t}`);
      if (aRes.ok && aRes.data?.logs) {
        setAuditLogs(aRes.data.logs || []);
      }
    } catch (err) {
      console.error('Error fetching admin audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAdminData();

      // Keep admin dashboard live with customer orders and catalog changes across all devices
      const interval = setInterval(() => {
        loadAdminData();
      }, 3000);

      const handleFocus = () => {
        loadAdminData();
      };

      const handleStorageUpdate = (e: StorageEvent) => {
        if (
          e.key === 'pujasathi_cached_pujas' ||
          e.key === 'pujasathi_cached_products' ||
          e.key === 'pujasathi_cached_pujaris'
        ) {
          loadAdminData();
        }
      };

      let bc: BroadcastChannel | null = null;
      try {
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
          bc = new BroadcastChannel('pujasathi_catalog_channel');
          bc.onmessage = () => {
            loadAdminData();
          };
        }
      } catch {}

      window.addEventListener('focus', handleFocus);
      window.addEventListener('visibilitychange', handleFocus);
      window.addEventListener('storage', handleStorageUpdate);

      return () => {
        clearInterval(interval);
        if (bc) {
          try {
            bc.close();
          } catch {}
        }
        window.removeEventListener('focus', handleFocus);
        window.removeEventListener('visibilitychange', handleFocus);
        window.removeEventListener('storage', handleStorageUpdate);
      };
    }
  }, [user, activeTab, statusFilter, paymentFilter, searchBooking]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoggingIn(true);
    const res = await login(adminEmail, adminPassword);
    setIsLoggingIn(false);
    if (!res.success) {
      setAuthError(res.error || 'Invalid credentials or account locked.');
    }
  };

  // Open Full Detail Modal for a Booking
  const handleOpenDetailModal = (booking: any) => {
    setSelectedBooking(booking);
    setEditStatus(booking.booking_status);
    setEditPujariId(booking.pujari_id || '');
    setEditDate(booking.scheduled_date !== 'N/A' ? booking.scheduled_date : '');
    setEditTime(booking.scheduled_time !== 'N/A' ? booking.scheduled_time : '');
    setInternalNote(booking.customer_notes || '');
    setDetailModalOpen(true);
  };

  const handleSaveBookingEdit = async () => {
    if (!selectedBooking) return;
    setIsUpdatingBooking(true);

    const selectedPujariObj = pujarisList.find((p) => p.id === editPujariId);

    try {
      const res = await safeFetchJson(`/api/admin/bookings/${selectedBooking.order_id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          booking_status: editStatus || undefined,
          pujari_id: editPujariId || undefined,
          pujari_name: selectedPujariObj ? selectedPujariObj.name : undefined,
          scheduled_date: editDate || undefined,
          scheduled_time: editTime || undefined,
          notes: internalNote || undefined,
        }),
      });

      if (res.ok) {
        setActionSuccess('Booking status and acharya assignment updated successfully.');
        setTimeout(() => setActionSuccess(''), 4000);
        setDetailModalOpen(false);
        setBookingsList((prev) =>
          prev.map((b) =>
            b.order_id === selectedBooking.order_id
              ? {
                  ...b,
                  booking_status: editStatus || b.booking_status,
                  pujari_id: editPujariId || b.pujari_id,
                  pujari_name: selectedPujariObj ? selectedPujariObj.name : b.pujari_name,
                  scheduled_date: editDate || b.scheduled_date,
                  scheduled_time: editTime || b.scheduled_time,
                  customer_notes: internalNote !== undefined ? internalNote : b.customer_notes,
                }
              : b
          )
        );
        loadAdminData();
      } else {
        setActionError(res.data?.error || 'Failed to update booking');
        setTimeout(() => setActionError(''), 4000);
      }
    } catch (err: any) {
      console.error(err);
      setActionError(err.message || 'Error updating booking');
      setTimeout(() => setActionError(''), 4000);
    } finally {
      setIsUpdatingBooking(false);
    }
  };

  const handleRefundOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to process an official refund for this booking?')) return;
    try {
      const res = await safeFetchJson(`/api/admin/orders/${orderId}/refund`, {
        method: 'POST',
        body: JSON.stringify({ reason: 'Administrative Refund via Admin Portal' }),
      });
      if (res.ok) {
        setActionSuccess('Order marked refunded and cancelled in secure audit log.');
        setTimeout(() => setActionSuccess(''), 4000);
        setDetailModalOpen(false);
        loadAdminData();
      } else {
        setActionError(res.data?.error || 'Failed to refund order');
        setTimeout(() => setActionError(''), 4000);
      }
    } catch (err: any) {
      console.error(err);
      setActionError(err.message || 'Error processing refund');
      setTimeout(() => setActionError(''), 4000);
    }
  };

  const handleDownloadReceipt = (orderNumber: string) => {
    const downloadUrl = `/api/orders/${orderNumber}/receipt`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `mandirveda_receipt_${orderNumber}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ========================================================
  // PUJA CRUD HANDLERS
  // ========================================================
  const handleOpenAddPuja = () => {
    setEditingPuja(null);
    setModalError('');
    setPujaForm({
      name: '',
      deity: 'Lord Shiva',
      short_description: '',
      description: '',
      price_in_rupees: 2501,
      duration_mins: 90,
      image: 'rudra',
      required_materials: 'Complete consecrated Vedic samagri kit, Gangajal, pure cow ghee, bilva leaves.',
      booking_requirements: 'Clean altar space and traditional attire.',
      is_active: 1,
      featured: 1,
    });
    setPujaModalOpen(true);
  };

  const handleOpenEditPuja = (puja: Puja) => {
    setEditingPuja(puja);
    setModalError('');
    setPujaForm({
      name: puja.name,
      deity: puja.deity,
      short_description: puja.short_description,
      description: puja.description,
      price_in_rupees: puja.price_paise / 100,
      duration_mins: puja.duration_mins,
      image: puja.image,
      required_materials: puja.required_materials,
      booking_requirements: puja.booking_requirements,
      is_active: puja.is_active,
      featured: puja.featured,
    });
    setPujaModalOpen(true);
  };

  const handleDeleteAttachedPujaImage = async () => {
    if (pujaForm.image && pujaForm.image.startsWith('/uploads/')) {
      try {
        await safeFetchJson('/api/admin/delete-image', {
          method: 'POST',
          body: JSON.stringify({ url: pujaForm.image }),
        });
      } catch (e) {
        console.error(e);
      }
    }
    setPujaForm((prev) => ({ ...prev, image: 'rudra' }));
    setActionSuccess('Attached image removed. Set back to sacred spiritual preset.');
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const handleSavePuja = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pujaForm.name.trim()) {
      setModalError('Puja ritual name is required');
      setActionError('Puja name is required');
      setTimeout(() => setActionError(''), 4000);
      return;
    }

    setIsSavingPuja(true);
    setModalError('');

    try {
      const shortDesc =
        pujaForm.short_description.trim() ||
        `${pujaForm.name} - Sacred Vedic ritual performed by certified temple acharyas.`;
      const fullDesc =
        pujaForm.description.trim() ||
        `${shortDesc} Performed according to authentic Vedic rites with complete consecrated samagri, customized sankalpa, and traditional guidance.`;
      const pricePaise = Math.round(Math.max(1, Number(pujaForm.price_in_rupees) || 1) * 100);
      const durationMins = Math.max(15, Number(pujaForm.duration_mins) || 60);

      const payload = {
        name: pujaForm.name.trim(),
        deity: pujaForm.deity.trim() || 'Lord Shiva',
        short_description: shortDesc,
        description: fullDesc,
        price_paise: pricePaise,
        duration_mins: durationMins,
        image: pujaForm.image || 'rudra',
        required_materials:
          pujaForm.required_materials ||
          'Complete consecrated Vedic samagri kit, Gangajal, pure cow ghee, bilva leaves.',
        booking_requirements: pujaForm.booking_requirements || 'Clean altar space and traditional attire.',
        is_active: Number(pujaForm.is_active),
        featured: Number(pujaForm.featured),
      };

      const url = editingPuja ? `/api/admin/pujas/${editingPuja.id}` : '/api/admin/pujas';
      const method = editingPuja ? 'PUT' : 'POST';

      const res = await safeFetchJson(url, {
        method,
        body: JSON.stringify(payload),
      });

      setIsSavingPuja(false);

      if (!res.ok) {
        const errorMsg = res.data?.error || 'Failed to save puja on server';
        setModalError(errorMsg);
        setActionError(errorMsg);
        setTimeout(() => setActionError(''), 4000);
        return;
      }

      setModalError('');
      const savedPuja: Puja = res.data?.puja;
      if (savedPuja) {
        const updatePujasFn = (prev: Puja[]) => [
          savedPuja,
          ...prev.filter((p) => p.id !== savedPuja.id && p.slug !== savedPuja.slug),
        ];
        setPujasList(updatePujasFn);
        onUpdatePujas?.(updatePujasFn);
        try {
          const raw = localStorage.getItem('pujasathi_cached_pujas');
          const list = raw ? JSON.parse(raw) : [];
          const updated = updatePujasFn(list);
          localStorage.setItem('pujasathi_cached_pujas', JSON.stringify(updated));
        } catch {}
      }

      setActionSuccess(
        editingPuja
          ? 'Puja ritual updated successfully on server!'
          : 'New Puja ritual created and saved to universal catalog!'
      );
      setTimeout(() => setActionSuccess(''), 4000);
      setPujaModalOpen(false);

      loadAdminData();
      onCatalogUpdated?.();
      notifyCrossDeviceCatalogUpdate();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('catalogUpdated', { detail: { type: 'puja', item: savedPuja } }));
      }
    } catch (err: any) {
      setIsSavingPuja(false);
      const msg = err.message || 'Error saving puja';
      setModalError(msg);
      setActionError(msg);
      setTimeout(() => setActionError(''), 4000);
    }
  };

  const confirmDeletePuja = async (puja: Puja) => {
    setIsDeletingPuja(true);
    try {
      const res = await safeFetchJson(`/api/admin/pujas/${puja.id}`, { method: 'DELETE' });
      if (!res.ok) {
        setActionError(res.data?.error || `Failed to delete puja "${puja.name}" from server`);
        setTimeout(() => setActionError(''), 4000);
        return;
      }

      const filterFn = (prev: Puja[]) => prev.filter((p) => p.id !== puja.id && p.slug !== puja.slug);
      setPujasList(filterFn);
      onUpdatePujas?.(filterFn);
      try {
        const raw = localStorage.getItem('pujasathi_cached_pujas');
        if (raw) {
          localStorage.setItem('pujasathi_cached_pujas', JSON.stringify(filterFn(JSON.parse(raw))));
        }
      } catch {}

      setActionSuccess(`Puja "${puja.name}" deleted successfully from universal database.`);
      setTimeout(() => setActionSuccess(''), 4000);

      onCatalogUpdated?.();
      notifyCrossDeviceCatalogUpdate();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('catalogUpdated', {
            detail: { type: 'puja_delete', id: puja.id, slug: puja.slug },
          })
        );
      }
    } catch (err: any) {
      console.error(err);
      setActionError(err.message || 'Error deleting puja');
      setTimeout(() => setActionError(''), 4000);
    } finally {
      setIsDeletingPuja(false);
      setPujaToDelete(null);
    }
  };

  // ========================================================
  // PRODUCT / ESSENTIALS CRUD HANDLERS
  // ========================================================
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setModalError('');
    setProductForm({
      name: '',
      category: 'Puja Thalis & Vessels',
      description: '',
      price_in_rupees: 450,
      stock: 50,
      image: 'thali',
      is_active: 1,
      featured: 1,
    });
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setModalError('');
    setProductForm({
      name: prod.name,
      category: prod.category,
      description: prod.description,
      price_in_rupees: prod.price_paise / 100,
      stock: prod.stock,
      image: prod.image,
      is_active: prod.is_active,
      featured: prod.featured,
    });
    setProductModalOpen(true);
  };

  const handleDeleteAttachedProductImage = async () => {
    if (productForm.image && productForm.image.startsWith('/uploads/')) {
      try {
        await safeFetchJson('/api/admin/delete-image', {
          method: 'POST',
          body: JSON.stringify({ url: productForm.image }),
        });
      } catch (e) {
        console.error(e);
      }
    }
    setProductForm((prev) => ({ ...prev, image: 'thali' }));
    setActionSuccess('Attached image removed. Set back to sacred spiritual preset.');
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim()) {
      setModalError('Essential item name is required');
      setActionError('Product name is required');
      setTimeout(() => setActionError(''), 4000);
      return;
    }

    setIsSavingProduct(true);
    setModalError('');

    try {
      const desc =
        productForm.description?.trim() ||
        `${productForm.name.trim()} - Consecrated Vedic puja essential prepared according to sacred temple traditions.`;

      const payload = {
        name: productForm.name.trim(),
        category: productForm.category.trim() || 'Puja Thalis & Vessels',
        description: desc,
        price_paise: Math.round(Math.max(1, Number(productForm.price_in_rupees) || 1) * 100),
        stock: Math.max(0, Number(productForm.stock) || 0),
        image: productForm.image || 'thali',
        is_active: Number(productForm.is_active),
        featured: Number(productForm.featured),
      };

      const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await safeFetchJson(url, {
        method,
        body: JSON.stringify(payload),
      });

      setIsSavingProduct(false);

      if (!res.ok) {
        const errorMsg = res.data?.error || 'Failed to save product on server';
        setModalError(errorMsg);
        setActionError(errorMsg);
        setTimeout(() => setActionError(''), 4000);
        return;
      }

      setModalError('');
      const savedProduct: Product = res.data?.product;
      if (savedProduct) {
        const updateProductsFn = (prev: Product[]) => {
          const idx = prev.findIndex((p) => p.id === savedProduct.id || (editingProduct && p.id === editingProduct.id));
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = savedProduct;
            return copy;
          }
          return [savedProduct, ...prev];
        };
        setProductsList(updateProductsFn);
        onUpdateProducts?.(updateProductsFn);
        try {
          const raw = localStorage.getItem('pujasathi_cached_products');
          const list = raw ? JSON.parse(raw) : [];
          const updated = updateProductsFn(list);
          localStorage.setItem('pujasathi_cached_products', JSON.stringify(updated));
        } catch {}
      }

      setActionSuccess(
        editingProduct
          ? 'Puja Essential item updated on server!'
          : 'New Puja Essential created and added to universal inventory!'
      );
      setTimeout(() => setActionSuccess(''), 4000);
      setProductModalOpen(false);

      loadAdminData();
      onCatalogUpdated?.();
      notifyCrossDeviceCatalogUpdate();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('catalogUpdated', { detail: { type: 'product', item: savedProduct } }));
      }
    } catch (err: any) {
      setIsSavingProduct(false);
      const msg = err.message || 'Error saving product';
      setModalError(msg);
      setActionError(msg);
      setTimeout(() => setActionError(''), 4000);
    }
  };

  const confirmDeleteProduct = async (prod: Product) => {
    setIsDeletingProduct(true);
    try {
      const res = await safeFetchJson(`/api/admin/products/${prod.id}`, { method: 'DELETE' });
      if (!res.ok) {
        setActionError(res.data?.error || `Failed to delete product "${prod.name}" from server`);
        setTimeout(() => setActionError(''), 4000);
        return;
      }

      const filterFn = (prev: Product[]) => prev.filter((p) => p.id !== prod.id && p.slug !== prod.slug);
      setProductsList(filterFn);
      onUpdateProducts?.(filterFn);
      try {
        const raw = localStorage.getItem('pujasathi_cached_products');
        if (raw) {
          localStorage.setItem('pujasathi_cached_products', JSON.stringify(filterFn(JSON.parse(raw))));
        }
      } catch {}

      setActionSuccess(`Essential item "${prod.name}" removed successfully from universal inventory.`);
      setTimeout(() => setActionSuccess(''), 4000);

      onCatalogUpdated?.();
      notifyCrossDeviceCatalogUpdate();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('catalogUpdated', {
            detail: { type: 'product_delete', id: prod.id, slug: prod.slug },
          })
        );
      }
    } catch (err: any) {
      console.error(err);
      setActionError(err.message || 'Error deleting product');
      setTimeout(() => setActionError(''), 4000);
    } finally {
      setIsDeletingProduct(false);
      setProductToDelete(null);
    }
  };

  const handleQuickStockUpdate = async (productId: string, newStock: number) => {
    try {
      const res = await safeFetchJson(`/api/admin/products/${productId}/stock`, {
        method: 'PATCH',
        body: JSON.stringify({ stock: newStock }),
      });
      if (res.ok) {
        setActionSuccess('Inventory stock updated.');
        setTimeout(() => setActionSuccess(''), 3000);
        loadAdminData();
        onCatalogUpdated?.();
      } else {
        setActionError(res.data?.error || 'Failed to update stock');
        setTimeout(() => setActionError(''), 3000);
      }
    } catch (err: any) {
      console.error(err);
      setActionError(err.message || 'Error updating stock');
      setTimeout(() => setActionError(''), 3000);
    }
  };

  // ========================================================
  // PUJARI / ACHARYA CRUD HANDLERS
  // ========================================================
  const handleOpenAddPujari = () => {
    setEditingPujari(null);
    setModalError('');
    setPujariForm({
      name: '',
      photo: '',
      bio: '',
      experience_years: 12,
      specializations: 'Rudrabhishek, Griha Pravesh, Maha Mrityunjaya, Vivah Vidhi',
      languages: 'Hindi, Sanskrit, English',
      service_areas: 'Delhi NCR, Varanasi, Mathura, Haridwar',
      phone: '',
      email: '',
      is_active: 1,
      rating: 4.9,
      review_count: 24,
    });
    setPujariModalOpen(true);
  };

  const handleOpenEditPujari = (pujari: Pujari) => {
    setEditingPujari(pujari);
    setModalError('');
    setPujariForm({
      name: pujari.name,
      photo: pujari.photo || '',
      bio: pujari.bio || '',
      experience_years: pujari.experience_years || 1,
      specializations: pujari.specializations || '',
      languages: pujari.languages || 'Hindi, Sanskrit',
      service_areas: pujari.service_areas || 'All Major Cities',
      phone: pujari.phone || '',
      email: pujari.email || '',
      is_active: pujari.is_active ?? 1,
      rating: pujari.rating || 4.9,
      review_count: pujari.review_count || 10,
    });
    setPujariModalOpen(true);
  };

  const handleSavePujari = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pujariForm.name.trim()) {
      setModalError('Acharya full name is required');
      setActionError('Acharya name is required');
      setTimeout(() => setActionError(''), 4000);
      return;
    }

    setIsSavingPujari(true);
    setModalError('');

    try {
      const bio =
        pujariForm.bio.trim() ||
        `Learned Vedic acharya with ${Number(pujariForm.experience_years) || 10}+ years of consecrated experience in traditional shastric rituals, sankalpa, and sacred temple ceremonies.`;

      const payload = {
        name: pujariForm.name.trim(),
        photo: pujariForm.photo || 'acharyasharma',
        bio,
        experience_years: Math.max(1, Number(pujariForm.experience_years) || 10),
        specializations: pujariForm.specializations.trim() || 'Vedic Havan, Rudrabhishek, Griha Pravesh',
        languages: pujariForm.languages.trim() || 'Hindi, Sanskrit',
        service_areas: pujariForm.service_areas.trim() || 'Delhi NCR, Varanasi, Mathura, Haridwar',
        phone: pujariForm.phone?.trim() || undefined,
        email: pujariForm.email?.trim() || undefined,
        is_active: Number(pujariForm.is_active),
        rating: Number(pujariForm.rating) || 4.9,
        review_count: Number(pujariForm.review_count) || 12,
      };

      const url = editingPujari ? `/api/admin/pujaris/${editingPujari.id}` : '/api/admin/pujaris';
      const method = editingPujari ? 'PUT' : 'POST';

      const res = await safeFetchJson(url, {
        method,
        body: JSON.stringify(payload),
      });

      setIsSavingPujari(false);

      if (!res.ok) {
        const errorMsg = res.data?.error || 'Failed to save acharya on server';
        setModalError(errorMsg);
        setActionError(errorMsg);
        setTimeout(() => setActionError(''), 4000);
        return;
      }

      setModalError('');
      const savedPujari: Pujari = res.data?.pujari;
      if (savedPujari) {
        const updatePujarisFn = (prev: Pujari[]) => {
          const idx = prev.findIndex((p) => p.id === savedPujari.id || (editingPujari && p.id === editingPujari.id));
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = savedPujari;
            return copy;
          }
          return [savedPujari, ...prev];
        };
        setPujarisList(updatePujarisFn);
        onUpdatePujaris?.(updatePujarisFn);
        try {
          const raw = localStorage.getItem('pujasathi_cached_pujaris');
          const list = raw ? JSON.parse(raw) : [];
          const updated = updatePujarisFn(list);
          localStorage.setItem('pujasathi_cached_pujaris', JSON.stringify(updated));
        } catch {}
      }

      setActionSuccess(
        editingPujari ? 'Acharya updated successfully on server!' : 'New Acharya added to universal directory!'
      );
      setTimeout(() => setActionSuccess(''), 4000);
      setPujariModalOpen(false);

      loadAdminData();
      onCatalogUpdated?.();
      notifyCrossDeviceCatalogUpdate();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('catalogUpdated', { detail: { type: 'pujari', item: savedPujari } }));
      }
    } catch (err: any) {
      setIsSavingPujari(false);
      const msg = err.message || 'Error saving acharya';
      setModalError(msg);
      setActionError(msg);
      setTimeout(() => setActionError(''), 4000);
    }
  };

  const handleDeleteAttachedPujariPhoto = async () => {
    if (pujariForm.photo && pujariForm.photo.startsWith('/uploads/')) {
      try {
        await safeFetchJson('/api/admin/delete-image', {
          method: 'POST',
          body: JSON.stringify({ url: pujariForm.photo }),
        });
      } catch (e) {
        console.error(e);
      }
    }
    setPujariForm((prev) => ({ ...prev, photo: 'acharyasharma' }));
    setActionSuccess('Acharya photo deleted and reset.');
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const confirmDeletePujari = async (pujari: Pujari) => {
    setIsDeletingPujari(true);
    try {
      const res = await safeFetchJson(`/api/admin/pujaris/${pujari.id}`, { method: 'DELETE' });
      if (!res.ok) {
        setActionError(res.data?.error || `Failed to delete acharya "${pujari.name}" from server`);
        setTimeout(() => setActionError(''), 4000);
        return;
      }

      const filterFn = (prev: Pujari[]) => prev.filter((p) => p.id !== pujari.id && p.slug !== pujari.slug);
      setPujarisList(filterFn);
      onUpdatePujaris?.(filterFn);
      try {
        const raw = localStorage.getItem('pujasathi_cached_pujaris');
        if (raw) {
          localStorage.setItem('pujasathi_cached_pujaris', JSON.stringify(filterFn(JSON.parse(raw))));
        }
      } catch {}

      setActionSuccess(`Acharya "${pujari.name}" removed successfully from universal directory.`);
      setTimeout(() => setActionSuccess(''), 4000);

      onCatalogUpdated?.();
      notifyCrossDeviceCatalogUpdate();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('catalogUpdated', {
            detail: { type: 'pujari_delete', id: pujari.id, slug: pujari.slug },
          })
        );
      }
    } catch (err: any) {
      console.error(err);
      setActionError(err.message || 'Error deleting acharya');
      setTimeout(() => setActionError(''), 4000);
    } finally {
      setIsDeletingPujari(false);
      setPujariToDelete(null);
    }
  };

  // Change Admin Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg({ success: '', error: '' });

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ success: '', error: 'New passwords do not match' });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMsg({ success: '', error: 'New password must be at least 8 characters' });
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await safeFetchJson('/api/admin/change-password', {
        method: 'POST',
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      setIsChangingPassword(false);

      if (res.ok) {
        setPasswordMsg({ success: 'Admin password changed successfully! Store it securely.', error: '' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMsg({ success: '', error: res.data?.error || 'Failed to change password' });
      }
    } catch (err: any) {
      setIsChangingPassword(false);
      setPasswordMsg({ success: '', error: err.message || 'Network error' });
    }
  };

  // If verifying session on reload, show smooth loading spinner
  if (isLoading) {
    return (
      <div className="max-w-md mx-auto px-4 py-32 text-center flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-3 border-[#9A3412] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-medium text-[#78716C]">Verifying Temple Administrative Session...</p>
      </div>
    );
  }

  // If not logged in as Admin, show strictly protected login screen
  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-[#FAF7F2] border border-[#D1BA9C] rounded-2xl shadow-xl p-8 relative">
          <div className="text-center mb-6">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-300">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold font-heading text-[#292524]">
              PujaSathi Management Portal
            </h1>
            <p className="text-xs text-[#78716C] mt-1">
              Protected administrative area for temple trustees and coordinators. Server authorization & anti-brute-force rate limiting active.
            </p>
          </div>

          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#44403C] uppercase mb-1">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="pujasathisupport@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1BA9C] bg-white text-sm text-[#292524] focus:outline-none focus:ring-2 focus:ring-[#9A3412]/30"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#44403C] uppercase mb-1">
                Admin Password
              </label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1BA9C] bg-white text-sm text-[#292524] focus:outline-none focus:ring-2 focus:ring-[#9A3412]/30"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 rounded-xl bg-[#9A3412] hover:bg-[#7C2D12] text-white text-xs font-semibold shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              <span>Sign In to Admin Portal</span>
            </button>
          </form>

          <div className="mt-4 pt-3 border-t border-[#E7DCCE]/80 space-y-2">
            <p className="text-[11px] font-semibold text-[#78716C] text-center mb-1">
              Authorized Temple Administrators:
            </p>
            <button
              type="button"
              onClick={async () => {
                setAdminEmail('subhayuroy666@gmail.com');
                setAdminPassword('Password@123');
                setAuthError('');
                setIsLoggingIn(true);
                const res = await login('subhayuroy666@gmail.com', 'Password@123');
                setIsLoggingIn(false);
                if (!res.success) {
                  setAuthError(res.error || 'Failed to login');
                }
              }}
              disabled={isLoggingIn}
              className="w-full py-2 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-300 text-orange-950 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>👤 1-Click Admin Access: Subhayu Roy</span>
            </button>
            <button
              type="button"
              onClick={async () => {
                setAdminEmail('pujasathisupport@gmail.com');
                setAdminPassword('PujaSathi@2025');
                setAuthError('');
                setIsLoggingIn(true);
                const res = await login('pujasathisupport@gmail.com', 'PujaSathi@2025');
                setIsLoggingIn(false);
                if (!res.success) {
                  setAuthError(res.error || 'Failed to login');
                }
              }}
              disabled={isLoggingIn}
              className="w-full py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>🛡️ 1-Click Admin Access: PujaSathi Support</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8">
      {/* Management Header */}
      <div className="bg-[#24140E] text-white rounded-2xl p-5 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-md bg-[#D97706] text-white">
              Administrator Console
            </span>
            <span className="text-xs text-amber-200">/management</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-white mt-1">
            PujaSathi Seva Administration
          </h1>
          <p className="text-xs text-[#D6D3D1]">
            Logged in as {user.full_name} ({user.email}) · Complete Shastric Operations, Catalog CRUD & Devotee Booking Records
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadAdminData()}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Refresh database metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => onNavigate('/')}
            className="px-3.5 py-2 rounded-xl bg-white text-[#292524] hover:bg-[#FAF7F2] text-xs font-semibold transition-colors cursor-pointer"
          >
            Public Site →
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-300 text-red-800 text-xs flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E7DCCE] pb-2 overflow-x-auto text-xs font-bold scrollbar-thin">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'bookings'
              ? 'bg-[#9A3412] text-white shadow-xs'
              : 'bg-white text-[#57534E] hover:bg-[#FAF7F2] border border-[#D1BA9C]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Who Booked Puja ({bookingsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pujas')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'pujas'
              ? 'bg-[#9A3412] text-white shadow-xs'
              : 'bg-white text-[#57534E] hover:bg-[#FAF7F2] border border-[#D1BA9C]'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Manage Pujas ({pujasList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'products'
              ? 'bg-[#9A3412] text-white shadow-xs'
              : 'bg-white text-[#57534E] hover:bg-[#FAF7F2] border border-[#D1BA9C]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Manage Puja Essentials ({productsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pujaris')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'pujaris'
              ? 'bg-[#9A3412] text-white shadow-xs'
              : 'bg-white text-[#57534E] hover:bg-[#FAF7F2] border border-[#D1BA9C]'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Our Pujaris ({pujarisList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'overview'
              ? 'bg-[#9A3412] text-white shadow-xs'
              : 'bg-white text-[#57534E] hover:bg-[#FAF7F2] border border-[#D1BA9C]'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Overview & Revenue</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'security'
              ? 'bg-[#9A3412] text-white shadow-xs'
              : 'bg-white text-[#57534E] hover:bg-[#FAF7F2] border border-[#D1BA9C]'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Anti-Hack Shield & Security</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: WHO BOOKED PUJA (BOOKINGS & PAYMENTS FULL DETAIL) */}
      {/* ======================================================== */}
      {activeTab === 'bookings' && (
        <div className="space-y-5">
          {/* Controls & Filter */}
          <div className="bg-[#FAF7F2] border border-[#E7DCCE] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#A8A29E]" />
                <input
                  type="text"
                  value={searchBooking}
                  onChange={(e) => setSearchBooking(e.target.value)}
                  placeholder="Search by devotee name, phone, order number, or email..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#D1BA9C] bg-white text-xs text-[#292524] focus:outline-none focus:ring-2 focus:ring-[#9A3412]/30"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-[#D1BA9C] bg-white text-xs text-[#292524]"
                >
                  <option value="all">All Booking Statuses</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-[#D1BA9C] bg-white text-xs text-[#292524]"
                >
                  <option value="all">All Payment Statuses</option>
                  <option value="paid">Paid & Verified</option>
                  <option value="pending">Payment Pending</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bookings List Table */}
          <div className="bg-[#FAF7F2] border border-[#E7DCCE] rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#E7DCCE] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-heading text-[#292524]">
                  Devotees Who Booked Puja & Payments
                </h3>
                <p className="text-xs text-[#78716C]">
                  Click "View Whole Detail" on any record to inspect complete devotee contacts, address, samagri items, and Razorpay payment credentials.
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-white border border-[#D1BA9C] text-[#292524]">
                {bookingsList.length} Records
              </span>
            </div>

            {bookingsList.length === 0 ? (
              <div className="p-12 text-center text-[#78716C] text-xs">
                No booking records match the filter criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F5EFEB] border-b border-[#E7DCCE] text-[#78716C] uppercase font-bold text-[11px]">
                    <tr>
                      <th className="p-3.5">Order Ref</th>
                      <th className="p-3.5">Devotee Details</th>
                      <th className="p-3.5">Puja Ritual Booked</th>
                      <th className="p-3.5">Scheduled Muhurta</th>
                      <th className="p-3.5">Total Dakshina</th>
                      <th className="p-3.5">Payment</th>
                      <th className="p-3.5">Booking</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7DCCE]">
                    {bookingsList.map((b) => (
                      <tr key={b.order_id} className="hover:bg-white/60 transition-colors">
                        <td className="p-3.5 font-bold text-[#9A3412]">
                          #{b.order_number}
                          <span className="block text-[10px] text-[#78716C] font-normal">
                            {new Date(b.created_at).toLocaleDateString('en-IN')}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <strong className="text-[#292524] block">{b.customer_name}</strong>
                          <span className="text-[#78716C] text-[11px] block">{b.customer_phone}</span>
                          <span className="text-[#78716C] text-[11px] block truncate max-w-[150px]">{b.customer_email}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-semibold text-[#292524] block">{b.item_name}</span>
                          {b.samagri_items && b.samagri_items.length > 0 && (
                            <span className="text-[10px] font-bold text-[#B45309] block">
                              +{b.samagri_items.length} Samagri essentials
                            </span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-1 font-medium text-[#292524]">
                            <Calendar className="w-3 h-3 text-[#B45309]" />
                            <span>{b.scheduled_date}</span>
                          </div>
                          <span className="text-[11px] text-[#78716C] block">{b.scheduled_time}</span>
                        </td>
                        <td className="p-3.5 font-bold tabular-nums text-[#292524]">
                          {formatPrice(b.total_paise)}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                              b.payment_status === 'paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : b.payment_status === 'refunded'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {b.payment_status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                              b.booking_status === 'confirmed'
                                ? 'bg-blue-100 text-blue-800'
                                : b.booking_status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : b.booking_status === 'cancelled'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {b.booking_status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-1">
                          <button
                            onClick={() => handleOpenDetailModal(b)}
                            className="px-2.5 py-1 bg-white border border-[#D1BA9C] hover:bg-[#FAF7F2] rounded-lg font-bold text-[11px] text-[#9A3412] cursor-pointer inline-flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Whole Detail</span>
                          </button>
                          <button
                            onClick={() => handleDownloadReceipt(b.order_number)}
                            className="p-1 rounded-lg border border-[#D1BA9C] bg-white hover:bg-[#FAF7F2] text-[#57534E] cursor-pointer inline-flex items-center"
                            title="Download PDF Receipt"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: MANAGE PUJAS (CATALOG CRUD) */}
      {/* ======================================================== */}
      {activeTab === 'pujas' && (
        <div className="space-y-5">
          <div className="bg-[#FAF7F2] border border-[#E7DCCE] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#A8A29E]" />
              <input
                type="text"
                value={searchPuja}
                onChange={(e) => setSearchPuja(e.target.value)}
                placeholder="Search pujas by name or deity..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#D1BA9C] bg-white text-xs text-[#292524] focus:outline-none"
              />
            </div>

            <button
              onClick={handleOpenAddPuja}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#9A3412] hover:bg-[#7C2D12] text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-md whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add New Puja Ritual</span>
            </button>
          </div>

          <div className="bg-[#FAF7F2] border border-[#E7DCCE] rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#E7DCCE] flex items-center justify-between">
              <h3 className="text-base font-bold font-heading text-[#292524]">
                Vedic Puja Rituals Catalog
              </h3>
              <span className="text-xs text-[#78716C]">{pujasList.length} Pujas</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5EFEB] border-b border-[#E7DCCE] text-[#78716C] uppercase font-bold text-[11px]">
                  <tr>
                    <th className="p-3.5">Artwork</th>
                    <th className="p-3.5">Puja Name</th>
                    <th className="p-3.5">Deity</th>
                    <th className="p-3.5">Current Price</th>
                    <th className="p-3.5">Duration</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7DCCE]">
                  {pujasList
                    .filter(
                      (p) =>
                        p.name.toLowerCase().includes(searchPuja.toLowerCase()) ||
                        p.deity.toLowerCase().includes(searchPuja.toLowerCase())
                    )
                    .map((p) => (
                      <tr key={p.id} className="hover:bg-white/60">
                        <td className="p-3.5">
                          <div className="w-12 h-10 rounded-lg overflow-hidden bg-[#F5EFE6] border border-[#D1BA9C] flex items-center justify-center">
                            {p.image &&
                            (p.image.startsWith('http') ||
                              p.image.startsWith('data:') ||
                              p.image.startsWith('/uploads/') ||
                              p.image.startsWith('/')) ? (
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback if local image not found
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : p.image === 'rudra' ? (
                              <RudrabhishekArt className="w-full h-full object-cover" />
                            ) : p.image === 'griha' ? (
                              <GrihaPraveshArt className="w-full h-full object-cover" />
                            ) : p.image === 'satyanarayan' ? (
                              <SatyanarayanArt className="w-full h-full object-cover" />
                            ) : p.image === 'lakshmi' ? (
                              <LakshmiKuberArt className="w-full h-full object-cover" />
                            ) : (
                              <RudrabhishekArt className="w-full h-full object-cover" />
                            )}
                          </div>
                        </td>
                        <td className="p-3.5 font-bold text-[#292524]">
                          {p.name}
                          {p.featured === 1 && (
                            <span className="ml-1.5 px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                              Featured
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-[#57534E] font-medium">{p.deity}</td>
                        <td className="p-3.5 font-bold tabular-nums text-[#9A3412]">
                          {formatPrice(p.price_paise)}
                        </td>
                        <td className="p-3.5 text-[#57534E]">{p.duration_mins} mins</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                              p.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {p.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right whitespace-nowrap">
                          <div className="inline-flex items-center justify-end gap-1.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleOpenEditPuja(p)}
                              className="px-2.5 py-1.5 bg-white border border-[#D1BA9C] hover:bg-[#FAF7F2] rounded-lg font-semibold text-[11px] text-[#292524] cursor-pointer inline-flex items-center gap-1 shadow-2xs shrink-0"
                              title="Edit Puja details"
                            >
                              <Edit className="w-3.5 h-3.5 text-[#9A3412]" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setPujaToDelete(p)}
                              className="px-2 py-1.5 rounded-lg border border-rose-300 bg-white hover:bg-rose-50 text-rose-700 cursor-pointer inline-flex items-center gap-1 shrink-0 transition-colors shadow-2xs"
                              title="Delete Puja & Attached Image"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                              <span className="text-[11px] font-semibold">Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: MANAGE PUJA ESSENTIALS (SAMAGRI CRUD & INVENTORY) */}
      {/* ======================================================== */}
      {activeTab === 'products' && (
        <div className="space-y-5">
          <div className="bg-[#FAF7F2] border border-[#E7DCCE] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#A8A29E]" />
              <input
                type="text"
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                placeholder="Search essentials by name or category..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#D1BA9C] bg-white text-xs text-[#292524] focus:outline-none"
              />
            </div>

            <button
              onClick={handleOpenAddProduct}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#9A3412] hover:bg-[#7C2D12] text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-md whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add New Puja Essential</span>
            </button>
          </div>

          <div className="bg-[#FAF7F2] border border-[#E7DCCE] rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#E7DCCE] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-heading text-[#292524]">
                  Puja Samagri Inventory & Pricing
                </h3>
                <p className="text-xs text-[#78716C]">
                  Manage stock quantities, adjust prices, change product images, and add new sacred items.
                </p>
              </div>
              <span className="text-xs text-[#78716C]">{productsList.length} Items</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5EFEB] border-b border-[#E7DCCE] text-[#78716C] uppercase font-bold text-[11px]">
                  <tr>
                    <th className="p-3.5">Image</th>
                    <th className="p-3.5">Essential Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Current Price</th>
                    <th className="p-3.5">Inventory Stock</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Quick Stock Adjust</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7DCCE]">
                  {productsList
                    .filter(
                      (p) =>
                        p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
                        p.category.toLowerCase().includes(searchProduct.toLowerCase())
                    )
                    .map((prod) => (
                      <tr key={prod.id} className="hover:bg-white/60">
                        <td className="p-3.5">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#FAF7F2] border border-[#D1BA9C] p-1 flex items-center justify-center">
                            <ProductArt type={prod.image} className="w-full h-full object-contain" />
                          </div>
                        </td>
                        <td className="p-3.5 font-bold text-[#292524]">{prod.name}</td>
                        <td className="p-3.5 text-[#57534E]">{prod.category}</td>
                        <td className="p-3.5 font-bold tabular-nums text-[#9A3412]">
                          {formatPrice(prod.price_paise)}
                        </td>
                        <td className="p-3.5">
                          <span className={`font-bold tabular-nums ${prod.stock < 10 ? 'text-red-700' : 'text-[#292524]'}`}>
                            {prod.stock} units
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                              prod.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {prod.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-3.5 space-x-1.5">
                          <button
                            onClick={() => handleQuickStockUpdate(prod.id, prod.stock + 10)}
                            className="px-2 py-1 bg-white border border-[#D1BA9C] hover:bg-[#FAF7F2] rounded-lg font-bold text-[11px] cursor-pointer"
                          >
                            +10
                          </button>
                          <button
                            onClick={() => handleQuickStockUpdate(prod.id, prod.stock + 50)}
                            className="px-2 py-1 bg-white border border-[#D1BA9C] hover:bg-[#FAF7F2] rounded-lg font-bold text-[11px] cursor-pointer"
                          >
                            +50
                          </button>
                          <button
                            onClick={() => handleQuickStockUpdate(prod.id, Math.max(0, prod.stock - 5))}
                            className="px-2 py-1 bg-white border border-[#D1BA9C] hover:bg-[#FAF7F2] rounded-lg font-bold text-[11px] cursor-pointer"
                          >
                            -5
                          </button>
                        </td>
                        <td className="p-3.5 text-right whitespace-nowrap">
                          <div className="inline-flex items-center justify-end gap-1.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleOpenEditProduct(prod)}
                              className="px-2.5 py-1.5 bg-white border border-[#D1BA9C] hover:bg-[#FAF7F2] rounded-lg font-semibold text-[11px] text-[#292524] cursor-pointer inline-flex items-center gap-1 shadow-2xs shrink-0"
                              title="Edit Puja Essential"
                            >
                              <Edit className="w-3.5 h-3.5 text-[#9A3412]" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setProductToDelete(prod)}
                              className="px-2 py-1.5 rounded-lg border border-rose-300 bg-white hover:bg-rose-50 text-rose-700 cursor-pointer inline-flex items-center gap-1 shrink-0 transition-colors shadow-2xs"
                              title="Delete essential item"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                              <span className="text-[11px] font-semibold">Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3B: MANAGE PUJARIS / ACHARYAS DIRECTORY */}
      {/* ======================================================== */}
      {activeTab === 'pujaris' && (
        <div className="space-y-5">
          <div className="bg-[#FAF7F2] border border-[#E7DCCE] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#A8A29E]" />
              <input
                type="text"
                value={searchPujari}
                onChange={(e) => setSearchPujari(e.target.value)}
                placeholder="Search acharyas by name, specializations, or city..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#D1BA9C] bg-white text-xs text-[#292524] focus:outline-none"
              />
            </div>

            <button
              onClick={handleOpenAddPujari}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#9A3412] hover:bg-[#7C2D12] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add New Acharya / Pujari</span>
            </button>
          </div>

          {/* Pujaris Table */}
          <div className="bg-[#FAF7F2] border border-[#E7DCCE] rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#292524]">
                <thead className="bg-[#F5EFEB] border-b border-[#E7DCCE] text-[#78716C] font-bold uppercase text-[11px]">
                  <tr>
                    <th className="p-3.5">Acharya</th>
                    <th className="p-3.5">Experience</th>
                    <th className="p-3.5">Specializations</th>
                    <th className="p-3.5">Languages</th>
                    <th className="p-3.5">Service Areas</th>
                    <th className="p-3.5">Rating</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7DCCE]">
                  {pujarisList.filter((p) => {
                    if (!searchPujari.trim()) return true;
                    const q = searchPujari.toLowerCase();
                    const name = (p.name || '').toLowerCase();
                    const spec = (p.specializations || '').toLowerCase();
                    const areas = (p.service_areas || '').toLowerCase();
                    const langs = (p.languages || '').toLowerCase();
                    return name.includes(q) || spec.includes(q) || areas.includes(q) || langs.includes(q);
                  }).length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-[#78716C]">
                        {searchPujari
                          ? `No acharyas matching "${searchPujari}"`
                          : 'No acharyas found. Click "+ Add New Acharya / Pujari" to add one.'}
                      </td>
                    </tr>
                  ) : (
                    pujarisList
                      .filter((p) => {
                        if (!searchPujari.trim()) return true;
                        const q = searchPujari.toLowerCase();
                        const name = (p.name || '').toLowerCase();
                        const spec = (p.specializations || '').toLowerCase();
                        const areas = (p.service_areas || '').toLowerCase();
                        const langs = (p.languages || '').toLowerCase();
                        return name.includes(q) || spec.includes(q) || areas.includes(q) || langs.includes(q);
                      })
                      .map((p) => (
                      <tr key={p.id} className="hover:bg-white/60 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <PujariAvatar code={p.photo} className="w-11 h-11 shrink-0" />
                            <div>
                              <span className="font-bold text-[#292524] block">{p.name}</span>
                              <span className="text-[11px] text-[#78716C] line-clamp-1 max-w-xs">{p.bio}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 font-semibold text-[#9A3412] whitespace-nowrap">
                          {p.experience_years} years
                        </td>
                        <td className="p-3.5 text-[#57534E] max-w-xs">
                          <span className="line-clamp-2">{p.specializations}</span>
                        </td>
                        <td className="p-3.5 text-[#57534E] whitespace-nowrap">{p.languages}</td>
                        <td className="p-3.5 text-[#57534E] whitespace-nowrap">{p.service_areas}</td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 font-bold text-amber-700">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span>{p.rating}</span>
                          </span>
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                              p.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {p.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right whitespace-nowrap">
                          <div className="inline-flex items-center justify-end gap-1.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleOpenEditPujari(p)}
                              className="px-2.5 py-1.5 bg-white border border-[#D1BA9C] hover:bg-[#FAF7F2] rounded-lg font-semibold text-[11px] text-[#292524] cursor-pointer inline-flex items-center gap-1 shadow-2xs shrink-0"
                              title="Edit Acharya Profile"
                            >
                              <Edit className="w-3.5 h-3.5 text-[#9A3412]" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setPujariToDelete(p)}
                              className="px-2 py-1.5 rounded-lg border border-rose-300 bg-white hover:bg-rose-50 text-rose-700 cursor-pointer inline-flex items-center gap-1 shrink-0 transition-colors shadow-2xs"
                              title="Delete Acharya profile"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                              <span className="text-[11px] font-semibold">Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: OVERVIEW & REVENUE STATS */}
      {/* ======================================================== */}
      {activeTab === 'overview' && metrics && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#FAF7F2] border border-[#E7DCCE] rounded-2xl p-5 shadow-xs">
              <span className="text-xs uppercase font-bold text-[#78716C] block">Total Bookings</span>
              <div className="text-3xl font-bold font-heading text-[#292524] mt-1 tabular-nums">
                {metrics.total_bookings}
              </div>
              <span className="text-[11px] text-[#15803D] mt-1 block">Vedic ceremonies scheduled</span>
            </div>

            <div className="bg-[#FAF7F2] border border-[#E7DCCE] rounded-2xl p-5 shadow-xs">
              <span className="text-xs uppercase font-bold text-[#78716C] block">Confirmed & Active</span>
              <div className="text-3xl font-bold font-heading text-emerald-800 mt-1 tabular-nums">
                {metrics.confirmed_bookings}
              </div>
              <span className="text-[11px] text-[#57534E] mt-1 block">Scheduled on altar calendar</span>
            </div>

            <div className="bg-[#FAF7F2] border border-[#E7DCCE] rounded-2xl p-5 shadow-xs">
              <span className="text-xs uppercase font-bold text-[#78716C] block">Pending Confirmation</span>
              <div className="text-3xl font-bold font-heading text-amber-700 mt-1 tabular-nums">
                {metrics.pending_bookings}
              </div>
              <span className="text-[11px] text-[#78716C] mt-1 block">Awaiting coordination</span>
            </div>

            <div className="bg-[#FAF7F2] border border-[#E7DCCE] rounded-2xl p-5 shadow-xs">
              <span className="text-xs uppercase font-bold text-[#78716C] block">Verified Revenue</span>
              <div className="text-3xl font-bold font-heading text-[#9A3412] mt-1 tabular-nums">
                {formatPrice(metrics.verified_revenue_paise)}
              </div>
              <span className="text-[11px] text-emerald-700 mt-1 block">Cleared via Razorpay</span>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: ANTI-HACK SHIELD & SECURITY CONTROLS */}
      {/* ======================================================== */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-[#FAF7F2] border border-[#E7DCCE] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center border border-emerald-300">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold font-heading text-[#292524]">
                  Active Security Defenses & Anti-Hack Shield
                </h3>
                <p className="text-xs text-[#57534E]">
                  Continuous server-side protections guard this administrative portal against unauthorized intrusions.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
              <div className="p-3.5 rounded-xl bg-white border border-[#D1BA9C] space-y-1">
                <span className="font-bold text-[#9A3412] block">1. Server-Side Role Enforcement (RBAC)</span>
                <p className="text-[#57534E]">
                  Every administrative endpoint is protected by `requireAdmin` middleware. Requests without an authenticated admin session are rejected immediately with HTTP 403 Forbidden.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-[#D1BA9C] space-y-1">
                <span className="font-bold text-[#9A3412] block">2. Anti-Brute-Force Rate Limiting</span>
                <p className="text-[#57534E]">
                  The login gate tracks consecutive failed password attempts. After 5 failed attempts, the account is automatically locked for 15 minutes, neutralizing dictionary and brute-force attacks.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-[#D1BA9C] space-y-1">
                <span className="font-bold text-[#9A3412] block">3. Cryptographic Salt & Bcrypt Hashing</span>
                <p className="text-[#57534E]">
                  All passwords are encrypted with salted 10-round bcrypt cryptography. Plaintext credentials are never stored.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-[#D1BA9C] space-y-1">
                <span className="font-bold text-[#9A3412] block">4. SQL Injection Immunity</span>
                <p className="text-[#57534E]">
                  All database queries use strictly parameterized SQLite prepared statements (`db.prepare().all/run`). SQL injection strings are treated purely as parameters.
                </p>
              </div>
            </div>
          </div>

          {/* Change Admin Password Form */}
          <div className="bg-[#FAF7F2] border border-[#E7DCCE] rounded-2xl p-6 shadow-xs max-w-xl">
            <h3 className="text-base font-bold font-heading text-[#292524] mb-2 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#9A3412]" />
              <span>Update Administrative Password</span>
            </h3>
            <p className="text-xs text-[#78716C] mb-4">
              Update your master administrator password. A verified audit entry is recorded upon change.
            </p>

            {passwordMsg.success && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs">
                {passwordMsg.success}
              </div>
            )}
            {passwordMsg.error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-300 text-red-800 text-xs">
                {passwordMsg.error}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#44403C] uppercase mb-1">
                  Current Password *
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1BA9C] bg-white text-sm text-[#292524]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#44403C] uppercase mb-1">
                  New Password (min 8 characters) *
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1BA9C] bg-white text-sm text-[#292524]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#44403C] uppercase mb-1">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1BA9C] bg-white text-sm text-[#292524]"
                />
              </div>

              <button
                type="submit"
                disabled={isChangingPassword}
                className="px-5 py-2.5 rounded-xl bg-[#9A3412] hover:bg-[#7C2D12] text-white font-semibold text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {isChangingPassword ? 'Saving Password...' : 'Update Password & Log Audit'}
              </button>
            </form>
          </div>

          {/* Audit Logs Trail */}
          <div className="bg-[#FAF7F2] border border-[#E7DCCE] rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#E7DCCE]">
              <h3 className="text-base font-bold font-heading text-[#292524]">
                Administrative Audit Log Trail
              </h3>
              <p className="text-xs text-[#78716C] mt-0.5">
                Every action, status update, price change, and login is immutably recorded here.
              </p>
            </div>

            <div className="overflow-x-auto max-h-72">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5EFEB] border-b border-[#E7DCCE] text-[#78716C] uppercase font-bold">
                  <tr>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">Action</th>
                    <th className="p-3.5">Admin Email</th>
                    <th className="p-3.5">Entity</th>
                    <th className="p-3.5">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7DCCE]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/60">
                      <td className="p-3.5 text-[#78716C] whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-amber-100 text-amber-800">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3.5 text-[#292524] font-medium">{log.admin_email}</td>
                      <td className="p-3.5 text-[#57534E] uppercase">{log.entity_type}</td>
                      <td className="p-3.5 text-[#78716C] max-w-sm truncate">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* WHOLE DETAIL OF BOOKING & PAYMENT MODAL */}
      {/* ======================================================== */}
      {detailModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div
            className="w-full max-w-3xl bg-[#FAF7F2] border border-[#D1BA9C] rounded-2xl shadow-2xl p-6 sm:p-8 relative my-8 max-h-[92vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            <button
              onClick={() => setDetailModalOpen(false)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white border border-[#D1BA9C] text-[#57534E] hover:text-[#292524] flex items-center justify-center transition-colors cursor-pointer"
            >
              <XCircle className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div className="border-b border-[#E7DCCE] pb-4 mb-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#B45309]">
                Booking & Payment Dossier
              </span>
              <h2 className="text-2xl font-bold font-heading text-[#292524] mt-1">
                Order #{selectedBooking.order_number}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#78716C] mt-1.5">
                <span>Booked on: {new Date(selectedBooking.created_at).toLocaleString('en-IN')}</span>
                <span>·</span>
                <span className="font-bold text-[#9A3412]">Total Paid: {formatPrice(selectedBooking.total_paise)}</span>
              </div>
            </div>

            <div className="space-y-6 text-xs">
              {/* Section 1: Devotee & Contact Information */}
              <div className="p-4 rounded-xl bg-white border border-[#D1BA9C] space-y-3">
                <h3 className="text-sm font-bold font-heading text-[#292524] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#9A3412]" />
                  <span>Devotee & Contact Information</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[#57534E]">
                  <div>
                    <span className="font-semibold text-[#44403C] block">Devotee Full Name:</span>
                    <span className="text-base font-bold text-[#292524]">{selectedBooking.customer_name}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-[#44403C] block">Mobile Number:</span>
                    <a href={`tel:${selectedBooking.customer_phone}`} className="text-[#9A3412] font-bold hover:underline flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      <span>{selectedBooking.customer_phone}</span>
                    </a>
                  </div>
                  <div>
                    <span className="font-semibold text-[#44403C] block">Email Address:</span>
                    <span className="text-[#292524]">{selectedBooking.customer_email || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-[#44403C] block">Full Service / Delivery Address:</span>
                    <span className="text-[#292524] block">
                      {selectedBooking.address_line}, {selectedBooking.city}, {selectedBooking.state} - {selectedBooking.pincode}
                    </span>
                  </div>
                </div>

                {selectedBooking.customer_notes && (
                  <div className="pt-2 border-t border-[#E7DCCE]">
                    <span className="font-semibold text-[#44403C] block">Sankalpa & Devotee Notes:</span>
                    <p className="text-[#78350F] italic bg-[#FEF3C7]/40 p-2.5 rounded-lg mt-1 border border-[#F59E0B]/20">
                      "{selectedBooking.customer_notes}"
                    </p>
                  </div>
                )}
              </div>

              {/* Section 2: Puja Ritual & Muhurta Details */}
              <div className="p-4 rounded-xl bg-white border border-[#D1BA9C] space-y-3">
                <h3 className="text-sm font-bold font-heading text-[#292524] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#9A3412]" />
                  <span>Puja Ritual & Auspicious Muhurta</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="font-semibold text-[#44403C] block">Puja Ritual:</span>
                    <span className="font-bold text-[#292524] text-sm">{selectedBooking.item_name}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-[#44403C] block">Assigned Acharya:</span>
                    <span className="font-bold text-[#9A3412]">{selectedBooking.pujari_name || 'Unassigned'}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-[#44403C] block">Ritual Date:</span>
                    <span className="font-bold text-[#292524]">{selectedBooking.scheduled_date}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-[#44403C] block">Auspicious Time Slot:</span>
                    <span className="font-bold text-[#292524]">{selectedBooking.scheduled_time}</span>
                  </div>
                </div>
              </div>

              {/* Section 3: Puja Essentials / Samagri Ordered in this Order */}
              {selectedBooking.samagri_items && selectedBooking.samagri_items.length > 0 && (
                <div className="p-4 rounded-xl bg-white border border-[#D1BA9C] space-y-3">
                  <h3 className="text-sm font-bold font-heading text-[#292524] flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#9A3412]" />
                    <span>Puja Essentials & Samagri Ordered ({selectedBooking.samagri_items.length})</span>
                  </h3>
                  <div className="divide-y divide-[#E7DCCE]">
                    {selectedBooking.samagri_items.map((it: any) => (
                      <div key={it.id} className="py-2 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-[#292524] block">{it.item_name}</span>
                          <span className="text-[11px] text-[#78716C]">
                            Quantity: <strong>{it.quantity}</strong> × {formatPrice(it.price_paise)}
                          </span>
                        </div>
                        <span className="font-bold text-[#9A3412] tabular-nums">
                          {formatPrice(it.price_paise * it.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 4: Whole Detail of Payment & Transaction */}
              <div className="p-4 rounded-xl bg-white border border-[#D1BA9C] space-y-3">
                <h3 className="text-sm font-bold font-heading text-[#292524] flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-[#9A3412]" />
                  <span>Whole Detail of Payment & Verification</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[#57534E]">
                  <div>
                    <span className="font-semibold text-[#44403C] block">Payment Status:</span>
                    <span
                      className={`inline-block px-2.5 py-1 rounded-md font-bold text-xs mt-0.5 ${
                        selectedBooking.payment_status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : selectedBooking.payment_status === 'refunded'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {selectedBooking.payment_status.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-[#44403C] block">Razorpay Payment ID:</span>
                    <span className="font-mono text-xs font-bold text-[#292524]">
                      {selectedBooking.payment_id || 'Pending Gateway Capture'}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-[#44403C] block">Razorpay Order ID:</span>
                    <span className="font-mono text-xs text-[#78716C]">
                      {selectedBooking.razorpay_order_id || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-[#44403C] block">Payment Breakdown:</span>
                    <span className="text-[11px] block">
                      Subtotal: {formatPrice(selectedBooking.subtotal_paise)} + GST: {formatPrice(selectedBooking.tax_paise)} + Dakshina/Ship: {formatPrice(selectedBooking.delivery_paise)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 5: Admin Edit & Operations */}
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#D1BA9C] space-y-4">
                <h3 className="text-sm font-bold font-heading text-[#292524]">
                  Update Status & Reschedule Ceremony
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-[#44403C] block mb-1">
                      Booking Status
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#D1BA9C] bg-white font-medium"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-[#44403C] block mb-1">
                      Assign / Reassign Acharya
                    </label>
                    <select
                      value={editPujariId}
                      onChange={(e) => setEditPujariId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#D1BA9C] bg-white font-medium"
                    >
                      <option value="">Unassigned</option>
                      {pujarisList.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.experience_years} yrs exp)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-[#44403C] block mb-1">
                      Reschedule Auspicious Date
                    </label>
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#D1BA9C] bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-[#44403C] block mb-1">
                      Reschedule Auspicious Slot
                    </label>
                    <input
                      type="text"
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
                      placeholder="e.g. 07:00 AM - 09:00 AM"
                      className="w-full px-3 py-2 rounded-xl border border-[#D1BA9C] bg-white font-medium"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E7DCCE]">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadReceipt(selectedBooking.order_number)}
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#D1BA9C] hover:bg-[#FAF7F2] font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF Receipt</span>
                    </button>

                    {selectedBooking.payment_status === 'paid' && (
                      <button
                        onClick={() => handleRefundOrder(selectedBooking.order_id)}
                        className="px-3 py-2 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 hover:bg-rose-100 font-semibold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Issue Refund</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDetailModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-white border border-[#D1BA9C] text-xs font-semibold cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      onClick={handleSaveBookingEdit}
                      disabled={isUpdatingBooking}
                      className="px-5 py-2 rounded-xl bg-[#9A3412] hover:bg-[#7C2D12] text-white text-xs font-semibold cursor-pointer shadow-md flex items-center gap-1.5"
                    >
                      {isUpdatingBooking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PUJA CREATE / EDIT MODAL */}
      {/* ======================================================== */}
      {pujaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#FAF7F2] border border-[#D1BA9C] rounded-2xl shadow-2xl p-6 sm:p-8 relative my-8 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setPujaModalOpen(false)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white border border-[#D1BA9C] text-[#57534E] hover:text-[#292524] flex items-center justify-center transition-colors cursor-pointer"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold font-heading text-[#292524] mb-1">
              {editingPuja ? `Edit Puja: ${editingPuja.name}` : 'Create New Vedic Puja Ritual'}
            </h2>
            <p className="text-xs text-[#78716C] mb-6">
              Set ritual name, deity, dakshina price, ceremonial duration, and shastric imagery.
            </p>

            {modalError && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span className="font-medium">{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSavePuja} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-[#44403C] block mb-1">Puja Ritual Name *</label>
                  <input
                    type="text"
                    required
                    value={pujaForm.name}
                    onChange={(e) => setPujaForm({ ...pujaForm, name: e.target.value })}
                    placeholder="e.g. Maha Mrityunjaya Japa"
                    className="w-full px-3 py-2 rounded-xl border border-[#D1BA9C] bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#44403C] block mb-1">Deity *</label>
                  <input
                    type="text"
                    required
                    value={pujaForm.deity}
                    onChange={(e) => setPujaForm({ ...pujaForm, deity: e.target.value })}
                    placeholder="e.g. Lord Shiva"
                    className="w-full px-3 py-2 rounded-xl border border-[#D1BA9C] bg-white font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-[#44403C] block mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={pujaForm.price_in_rupees}
                    onChange={(e) => setPujaForm({ ...pujaForm, price_in_rupees: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D1BA9C] bg-white font-bold text-[#9A3412]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#44403C] block mb-1">Duration (Mins) *</label>
                  <input
                    type="number"
                    min="15"
                    required
                    value={pujaForm.duration_mins}
                    onChange={(e) => setPujaForm({ ...pujaForm, duration_mins: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D1BA9C] bg-white font-medium"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="font-semibold text-[#44403C] block mb-1">Puja Image</label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-[#D1BA9C] hover:border-[#9A3412] bg-white hover:bg-amber-50/50 cursor-pointer text-xs font-semibold text-[#78350F] transition-colors">
                      {isUploadingPujaImg ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#9A3412]" />
                      ) : (
                        <Upload className="w-3.5 h-3.5 text-[#9A3412]" />
                      )}
                      <span>{isUploadingPujaImg ? 'Attaching Image...' : 'Upload from Computer'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(
                              file,
                              (url) => {
                                setPujaForm((prev) => ({ ...prev, image: url }));
                                setActionSuccess('Image attached from computer successfully!');
                                setTimeout(() => setActionSuccess(''), 3000);
                              },
                              setIsUploadingPujaImg
                            );
                          }
                        }}
                      />
                    </label>
                    <select
                      value={
                        pujaForm.image.startsWith('http') ||
                        pujaForm.image.startsWith('data:') ||
                        pujaForm.image.startsWith('/uploads/') ||
                        pujaForm.image.startsWith('/')
                          ? 'custom'
                          : pujaForm.image
                      }
                      onChange={(e) => {
                        if (e.target.value !== 'custom') {
                          setPujaForm({ ...pujaForm, image: e.target.value });
                        }
                      }}
                      className="px-2 py-2 rounded-xl border border-[#D1BA9C] bg-white font-medium text-xs max-w-[130px]"
                    >
                      <option value="custom" disabled={!pujaForm.image.startsWith('http') && !pujaForm.image.startsWith('data:') && !pujaForm.image.startsWith('/')}>
                        ★ Uploaded
                      </option>
                      <option value="rudra">Shiva Preset</option>
                      <option value="griha">Griha Preset</option>
                      <option value="satyanarayan">Vishnu Preset</option>
                      <option value="lakshmi">Lakshmi Preset</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Live Preview of Attached Puja Image with Delete Attached Image Button */}
              {pujaForm.image && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-amber-50/80 border border-amber-200 rounded-xl">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-white border border-[#D1BA9C] shrink-0 flex items-center justify-center shadow-xs">
                      {pujaForm.image.startsWith('http') ||
                      pujaForm.image.startsWith('data:') ||
                      pujaForm.image.startsWith('/uploads/') ||
                      pujaForm.image.startsWith('/') ? (
                        <img src={pujaForm.image} alt="Preview" className="w-full h-full object-cover" />
                      ) : pujaForm.image === 'rudra' ? (
                        <RudrabhishekArt className="w-full h-full object-cover" />
                      ) : pujaForm.image === 'satyanarayan' ? (
                        <SatyanarayanArt className="w-full h-full object-cover" />
                      ) : pujaForm.image === 'lakshmi' ? (
                        <LakshmiKuberArt className="w-full h-full object-cover" />
                      ) : (
                        <GrihaPraveshArt className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-[#78350F] block">
                        {pujaForm.image.startsWith('http') ||
                        pujaForm.image.startsWith('data:') ||
                        pujaForm.image.startsWith('/uploads/') ||
                        pujaForm.image.startsWith('/')
                          ? '✓ Image Attached from Computer'
                          : '✓ Spiritual Temple Preset Art'}
                      </span>
                      <p className="text-[11px] text-[#57534E] truncate font-mono mt-0.5">
                        {pujaForm.image.startsWith('data:')
                          ? 'Ready to save with ritual'
                          : pujaForm.image}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleDeleteAttachedPujaImage}
                      className="px-2.5 py-1.5 rounded-lg border border-rose-300 bg-white hover:bg-rose-50 text-rose-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                      title="Delete attached image and reset to default"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Delete Image Attached</span>
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="font-semibold text-[#44403C] block mb-1">Short Summary (1 line)</label>
                <input
                  type="text"
                  value={pujaForm.short_description}
                  onChange={(e) => setPujaForm({ ...pujaForm, short_description: e.target.value })}
                  placeholder="e.g. Sacred Vedic chanting and abhishek for health, longevity and divine peace."
                  className="w-full px-3 py-2 rounded-xl border border-[#D1BA9C] bg-white"
                />
              </div>
              <div>
                <label className="font-semibold text-[#44403C] block mb-1">In-Depth Description (Optional)</label>
                <textarea
                  rows={3}
                  value={pujaForm.description}
                  onChange={(e) => setPujaForm({ ...pujaForm, description: e.target.value })}
                  placeholder="Detailed explanation of the shastric Vidhi, mantras, and auspicious fruits (Auto-filled with authentic Vedic text if left empty)."
                  className="w-full px-3 py-2 rounded-xl border border-[#D1BA9C] bg-white leading-relaxed"
                />
              </div>

              <div>
                <label className="font-semibold text-[#44403C] block mb-1">Required Materials Provided</label>
                <input
                  type="text"
                  value={pujaForm.required_materials}
                  onChange={(e) => setPujaForm({ ...pujaForm, required_materials: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D1BA9C] bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="font-semibold text-[#44403C] block mb-1">Active Status</label>
                  <select
                    value={pujaForm.is_active}
                    onChange={(e) => setPujaForm({ ...pujaForm, is_active: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D1BA9C] bg-white"
                  >
                    <option value={1}>Active (Visible to devotees)</option>
                    <option value={0}>Inactive (Hidden)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[#44403C] block mb-1">Featured Puja</label>
                  <select
                    value={pujaForm.featured}
                    onChange={(e) => setPujaForm({ ...pujaForm, featured: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D1BA9C] bg-white"
                  >
                    <option value={0}>Standard</option>
                    <option value={1}>Featured on Homepage</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-[#E7DCCE]">
                {editingPuja ? (
                  <button
                    type="button"
                    onClick={() => {
                      const p = editingPuja;
                      setPujaModalOpen(false);
                      setPujaToDelete(p);
                    }}
                    className="px-3.5 py-2.5 rounded-xl border border-rose-300 bg-white hover:bg-rose-50 text-rose-700 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    title="Delete this Puja ritual"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Delete Puja Ritual</span>
                  </button>
                ) : <div />}

                <div className="flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPujaModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-white border border-[#D1BA9C] font-semibold text-xs cursor-pointer hover:bg-[#FAF7F2]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingPuja}
                    className="px-6 py-2.5 rounded-xl bg-[#9A3412] hover:bg-[#7C2D12] text-white font-semibold text-xs shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isSavingPuja ? 'Saving Puja...' : editingPuja ? 'Update Puja' : 'Create Puja Ritual'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PRODUCT / ESSENTIALS CREATE / EDIT MODAL */}
      {/* ======================================================== */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#FAF7F2] border border-[#D1BA9C] rounded-2xl shadow-2xl p-6 sm:p-8 relative my-8 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setProductModalOpen(false)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white border border-[#D1BA9C] text-[#57534E] hover:text-[#292524] flex items-center justify-center transition-colors cursor-pointer"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold font-heading text-[#292524] mb-1">
              {editingProduct ? `Edit Puja Essential: ${editingProduct.name}` : 'Add New Puja Essential'}
            </h2>
            <p className="text-xs text-[#78716C] mb-6">
              Set essential item name, category, pricing, real-time inventory stock, and imagery.
            </p>

            {modalError && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span className="font-medium">{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-[#44403C] block mb-1">Essential Item Name *</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="e.g. Pure Gangajal 500ml"
                    className="w-full px-3 py-2 rounded-xl border border-[#D1BA9C] bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#44403C] block mb-1">Category *</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D1BA9C] bg-white font-medium"
                  >
                    <option value="Puja Thalis & Vessels">Puja Thalis & Vessels</option>
                    <option value="Brass Diyas & Lamps">Brass Diyas & Lamps</option>
                    <option value="Diyas & Camphor">Diyas & Camphor (Ghee Battis)</option>
                    <option value="Holy Water & Panchamrit">Holy Water & Panchamrit (Gangajal)</option>
                    <option value="Incense & Dhoop">Incense & Dhoop</option>
                    <option value="Kumkum & Sandalwood">Kumkum & Sandalwood</option>
                    <option value="Sacred Attire & Vastra">Sacred Attire & Vastra</option>
                    <option value="Havan & Samagri Kits">Havan & Samagri Kits</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-[#44403C] block mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={productForm.price_in_rupees}
                    onChange={(e) => setProductForm({ ...productForm, price_in_rupees: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D1BA9C] bg-white font-bold text-[#9A3412]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#44403C] block mb-1">Inventory Stock (Units) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D1BA9C] bg-white font-bold text-[#292524]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#44403C] block mb-1">Product Image</label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-[#D1BA9C] hover:border-[#9A3412] bg-white hover:bg-amber-50/50 cursor-pointer text-xs font-semibold text-[#78350F] transition-colors">
                      {isUploadingProductImg ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#9A3412]" />
                      ) : (
                        <Upload className="w-3.5 h-3.5 text-[#9A3412]" />
                      )}
                      <span>{isUploadingProductImg ? 'Attaching Image...' : 'Upload from Computer'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(
                              file,
                              (url) => {
                                setProductForm((prev) => ({ ...prev, image: url }));
                                setActionSuccess('Product image attached successfully!');
                                setTimeout(() => setActionSuccess(''), 3000);
                              },
                              setIsUploadingProductImg
                            );
                          }
                        }}
                      />
                    </label>
                    <select
                      value={
                        productForm.image.startsWith('http') ||
                        productForm.image.startsWith('data:') ||
                        productForm.image.startsWith('/uploads/') ||
                        productForm.image.startsWith('/')
                          ? 'custom'
                          : productForm.image
                      }
                      onChange={(e) => {
                        if (e.target.value !== 'custom') {
                          setProductForm({ ...productForm, image: e.target.value });
                        }
                      }}
                      className="px-2 py-2 rounded-xl border border-[#D1BA9C] bg-white font-medium text-xs max-w-[130px]"
                    >
                      <option
                        value="custom"
                        disabled={
                          !productForm.image.startsWith('http') &&
                          !productForm.image.startsWith('data:') &&
                          !productForm.image.startsWith('/')
                        }
                      >
                        ★ Uploaded
                      </option>
                      <option value="thali">Carved Brass Thali</option>
                      <option value="diya">Brass Diya Lamp</option>
                      <option value="ghee">Cow Ghee Battis</option>
                      <option value="gangajal">Haridwar Gangajal</option>
                      <option value="dhoop">Incense & Dhoop</option>
                      <option value="chandan">Sandalwood & Kumkum</option>
                      <option value="havan">Havan Samagri Kit</option>
                      <option value="vastra">Silk Dhoti & Vastra</option>
                      <option value="camphor">Bhimseni Camphor</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Live Preview of Attached Product Image with Delete Attached Image Button */}
              {productForm.image && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-amber-50/80 border border-amber-200 rounded-xl">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-white border border-[#D1BA9C] shrink-0 flex items-center justify-center shadow-xs">
                      <ProductArt type={productForm.image} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-[#78350F] block">
                        {productForm.image.startsWith('http') ||
                        productForm.image.startsWith('data:') ||
                        productForm.image.startsWith('/uploads/') ||
                        productForm.image.startsWith('/')
                          ? '✓ Image Attached from Computer'
                          : '✓ Spiritual Temple Preset Art'}
                      </span>
                      <p className="text-[11px] text-[#57534E] truncate font-mono mt-0.5">
                        {productForm.image.startsWith('data:')
                          ? 'Ready to save with item'
                          : productForm.image}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleDeleteAttachedProductImage}
                      className="px-2.5 py-1.5 rounded-lg border border-rose-300 bg-white hover:bg-rose-50 text-rose-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                      title="Delete attached image and reset to default"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Delete Image Attached</span>
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="font-semibold text-[#44403C] block mb-1">Description (Optional)</label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Authentic description of purity, dimensions, and usage (Auto-filled if left empty)."
                  className="w-full px-3 py-2 rounded-xl border border-[#D1BA9C] bg-white leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="font-semibold text-[#44403C] block mb-1">Active Status</label>
                  <select
                    value={productForm.is_active}
                    onChange={(e) => setProductForm({ ...productForm, is_active: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D1BA9C] bg-white"
                  >
                    <option value={1}>Active (In Stock & Available)</option>
                    <option value={0}>Inactive (Hidden)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[#44403C] block mb-1">Featured Item</label>
                  <select
                    value={productForm.featured}
                    onChange={(e) => setProductForm({ ...productForm, featured: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D1BA9C] bg-white"
                  >
                    <option value={0}>Standard</option>
                    <option value={1}>Featured Item</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-[#E7DCCE]">
                {editingProduct ? (
                  <button
                    type="button"
                    onClick={() => {
                      const prod = editingProduct;
                      setProductModalOpen(false);
                      setProductToDelete(prod);
                    }}
                    className="px-3.5 py-2.5 rounded-xl border border-rose-300 bg-white hover:bg-rose-50 text-rose-700 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    title="Delete this Puja Essential"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Delete Essential Item</span>
                  </button>
                ) : <div />}

                <div className="flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setProductModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-white border border-[#D1BA9C] font-semibold text-xs cursor-pointer hover:bg-[#FAF7F2]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProduct}
                    className="px-6 py-2.5 rounded-xl bg-[#9A3412] hover:bg-[#7C2D12] text-white font-semibold text-xs shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isSavingProduct ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Puja Essential'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PUJARI / ACHARYA CREATE / EDIT MODAL */}
      {/* ======================================================== */}
      {pujariModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#FAF7F2] border border-[#D1BA9C] rounded-2xl shadow-2xl p-6 sm:p-8 relative my-8 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setPujariModalOpen(false)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white border border-[#D1BA9C] text-[#57534E] hover:text-[#292524] flex items-center justify-center transition-colors cursor-pointer"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold font-heading text-[#292524] mb-1">
              {editingPujari ? `Edit Acharya: ${editingPujari.name}` : 'Add New Vedic Acharya / Pujari'}
            </h2>
            <p className="text-xs text-[#78716C] mb-6">
              Add scholar profile with photograph, description, Vedic specializations, and languages. Profile appears in the "Our Pujaris" section.
            </p>

            {modalError && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span className="font-medium">{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSavePujari} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-[#44403C] block mb-1">Acharya / Pujari Full Name *</label>
                  <input
                    type="text"
                    required
                    value={pujariForm.name}
                    onChange={(e) => setPujariForm({ ...pujariForm, name: e.target.value })}
                    placeholder="e.g. Acharya Rameshwar Shastri"
                    className="w-full px-3 py-2 rounded-xl border border-[#D1BA9C] bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#44403C] block mb-1">Experience in Years *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={pujariForm.experience_years}
                    onChange={(e) => setPujariForm({ ...pujariForm, experience_years: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D1BA9C] bg-white font-bold text-[#9A3412]"
                  />
                </div>
              </div>

              {/* Photo Upload from Computer */}
              <div>
                <label className="font-semibold text-[#44403C] block mb-1">
                  Acharya Picture / Photograph (Upload from Computer) *
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-[#D1BA9C] hover:border-[#9A3412] bg-white hover:bg-amber-50/50 cursor-pointer text-xs font-semibold text-[#78350F] transition-colors">
                    {isUploadingPujariImg ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#9A3412]" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-[#9A3412]" />
                    )}
                    <span>{isUploadingPujariImg ? 'Processing Image...' : 'Choose Picture from Computer'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(
                            file,
                            (url) => setPujariForm((prev) => ({ ...prev, photo: url })),
                            setIsUploadingPujariImg
                          );
                        }
                      }}
                    />
                  </label>

                  {/* Photo Preview */}
                  <div className="flex items-center gap-3 p-2 bg-white border border-[#D1BA9C] rounded-xl flex-1 w-full">
                    <PujariAvatar code={pujariForm.photo} className="w-12 h-12 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] font-bold text-[#292524] block truncate">
                        {pujariForm.photo.startsWith('data:')
                          ? 'Custom uploaded picture'
                          : pujariForm.photo || 'Standard Vedic Acharya avatar'}
                      </span>
                      <span className="text-[10px] text-emerald-700">✓ Ready for customer profile</span>
                    </div>
                    {pujariForm.photo && (
                      <button
                        type="button"
                        onClick={handleDeleteAttachedPujariPhoto}
                        className="text-[11px] font-bold text-rose-700 hover:text-rose-900 px-2.5 py-1 bg-white border border-rose-200 rounded-lg cursor-pointer flex items-center gap-1 shadow-xs"
                        title="Delete photo attached"
                      >
                        <Trash2 className="w-3 h-3 text-rose-600" />
                        <span>Delete Photo</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio / Description */}
              <div>
                <label className="font-semibold text-[#44403C] block mb-1">
                  Bio & Vedic Background (Description)
                </label>
                <textarea
                  rows={3}
                  value={pujariForm.bio}
                  onChange={(e) => setPujariForm({ ...pujariForm, bio: e.target.value })}
                  placeholder="e.g. Learned scholar from Sampurnanand Sanskrit Vishwavidyalaya, Varanasi (Auto-filled with authentic shastric credentials if left empty)."
                  className="w-full px-3 py-2 rounded-xl border border-[#D1BA9C] bg-white leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-[#44403C] block mb-1">Ritual Specializations</label>
                  <input
                    type="text"
                    value={pujariForm.specializations}
                    onChange={(e) => setPujariForm({ ...pujariForm, specializations: e.target.value })}
                    placeholder="e.g. Rudrabhishek, Griha Pravesh, Vivah Vidhi"
                    className="w-full px-3 py-2 rounded-xl border border-[#D1BA9C] bg-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#44403C] block mb-1">Languages Spoken</label>
                  <input
                    type="text"
                    value={pujariForm.languages}
                    onChange={(e) => setPujariForm({ ...pujariForm, languages: e.target.value })}
                    placeholder="e.g. Hindi, Sanskrit, English"
                    className="w-full px-3 py-2 rounded-xl border border-[#D1BA9C] bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-[#44403C] block mb-1">Service Areas / Cities</label>
                  <input
                    type="text"
                    value={pujariForm.service_areas}
                    onChange={(e) => setPujariForm({ ...pujariForm, service_areas: e.target.value })}
                    placeholder="e.g. Delhi NCR, Varanasi, Mathura, Haridwar"
                    className="w-full px-3 py-2 rounded-xl border border-[#D1BA9C] bg-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#44403C] block mb-1">Phone / WhatsApp Contact</label>
                  <input
                    type="text"
                    value={pujariForm.phone}
                    onChange={(e) => setPujariForm({ ...pujariForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-xl border border-[#D1BA9C] bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="font-semibold text-[#44403C] block mb-1">Active Status</label>
                  <select
                    value={pujariForm.is_active}
                    onChange={(e) => setPujariForm({ ...pujariForm, is_active: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D1BA9C] bg-white"
                  >
                    <option value={1}>Active (Listed in Our Pujaris)</option>
                    <option value={0}>Inactive (Hidden)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[#44403C] block mb-1">Initial Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={pujariForm.rating}
                    onChange={(e) => setPujariForm({ ...pujariForm, rating: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D1BA9C] bg-white"
                  />
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-[#E7DCCE]">
                {editingPujari ? (
                  <button
                    type="button"
                    onClick={() => {
                      const p = editingPujari;
                      setPujariModalOpen(false);
                      setPujariToDelete(p);
                    }}
                    className="px-3.5 py-2.5 rounded-xl border border-rose-300 bg-white hover:bg-rose-50 text-rose-700 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    title="Delete Acharya profile"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Delete Acharya Profile</span>
                  </button>
                ) : <div />}

                <div className="flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPujariModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-white border border-[#D1BA9C] font-semibold text-xs cursor-pointer hover:bg-[#FAF7F2]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingPujari}
                    className="px-6 py-2.5 rounded-xl bg-[#9A3412] hover:bg-[#7C2D12] text-white font-semibold text-xs shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isSavingPujari ? 'Saving...' : editingPujari ? 'Update Acharya' : 'Add to Pujaris Directory'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ======================================================== */}
      {/* CONFIRMATION MODAL: DELETE PUJA RITUAL & ATTACHED IMAGE */}
      {/* ======================================================== */}
      {pujaToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] border border-[#E7DCCE] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-800">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-700" />
              </div>
              <div>
                <h3 className="font-bold font-heading text-base text-[#292524]">Delete Puja Ritual</h3>
                <p className="text-xs text-[#78716C]">Permanent removal from Vedic Puja Rituals Catalog</p>
              </div>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-[#E7DCCE] text-xs space-y-1.5">
              <p className="font-bold text-[#292524] text-sm">{pujaToDelete.name}</p>
              <div className="flex items-center gap-2 text-[#78716C]">
                <span>Deity: <strong className="text-[#44403C]">{pujaToDelete.deity}</strong></span>
                <span>•</span>
                <span>Price: <strong className="text-[#9A3412]">{formatPrice(pujaToDelete.price_paise)}</strong></span>
              </div>
              {pujaToDelete.image && (pujaToDelete.image.startsWith('/uploads/') || pujaToDelete.image.startsWith('http') || pujaToDelete.image.startsWith('data:')) && (
                <div className="mt-2 pt-2 border-t border-[#F5EFEB] flex items-center gap-2 text-[11px] text-amber-800 font-medium">
                  <div className="w-7 h-7 rounded overflow-hidden bg-amber-50 border border-amber-200 shrink-0">
                    <img src={pujaToDelete.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <span>Attached custom image file will also be permanently deleted from storage.</span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-[#78716C]">
              Are you sure? Devotees will no longer be able to view or book this puja on the customer booking portal.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E7DCCE]">
              <button
                type="button"
                onClick={() => setPujaToDelete(null)}
                className="px-4 py-2 rounded-xl bg-white border border-[#D1BA9C] text-xs font-semibold text-[#57534E] hover:bg-[#F5EFEB] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingPuja}
                onClick={() => confirmDeletePuja(pujaToDelete)}
                className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
              >
                {isDeletingPuja ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{isDeletingPuja ? 'Deleting Puja...' : 'Yes, Delete Puja & Image'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CONFIRMATION MODAL: DELETE ACHARYA / PUJARI */}
      {/* ======================================================== */}
      {pujariToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] border border-[#E7DCCE] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-800">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-700" />
              </div>
              <div>
                <h3 className="font-bold font-heading text-base text-[#292524]">Remove Acharya Profile</h3>
                <p className="text-xs text-[#78716C]">Remove from Our Pujaris directory</p>
              </div>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-[#E7DCCE] text-xs space-y-1">
              <p className="font-bold text-[#292524] text-sm">{pujariToDelete.name}</p>
              <p className="text-[#78716C]">Specializations: {pujariToDelete.specializations}</p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E7DCCE]">
              <button
                type="button"
                onClick={() => setPujariToDelete(null)}
                className="px-4 py-2 rounded-xl bg-white border border-[#D1BA9C] text-xs font-semibold text-[#57534E] hover:bg-[#F5EFEB] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingPujari}
                onClick={() => confirmDeletePujari(pujariToDelete)}
                className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
              >
                {isDeletingPujari ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{isDeletingPujari ? 'Removing...' : 'Yes, Remove Acharya'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CONFIRMATION MODAL: DELETE PRODUCT / ESSENTIAL */}
      {/* ======================================================== */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] border border-[#E7DCCE] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-800">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-700" />
              </div>
              <div>
                <h3 className="font-bold font-heading text-base text-[#292524]">Remove Puja Essential</h3>
                <p className="text-xs text-[#78716C]">Remove from Puja Shop inventory</p>
              </div>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-[#E7DCCE] text-xs space-y-1">
              <p className="font-bold text-[#292524] text-sm">{productToDelete.name}</p>
              <p className="text-[#78716C]">Category: {productToDelete.category} • Price: {formatPrice(productToDelete.price_paise)}</p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E7DCCE]">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 rounded-xl bg-white border border-[#D1BA9C] text-xs font-semibold text-[#57534E] hover:bg-[#F5EFEB] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingProduct}
                onClick={() => confirmDeleteProduct(productToDelete)}
                className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
              >
                {isDeletingProduct ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{isDeletingProduct ? 'Removing...' : 'Yes, Remove Item'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
