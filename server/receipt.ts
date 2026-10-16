import { jsPDF } from 'jspdf';

export interface OrderReceiptData {
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  subtotal_paise: number;
  tax_paise: number;
  delivery_paise: number;
  discount_paise: number;
  total_paise: number;
  payment_status: string;
  booking_status: string;
  payment_id?: string;
  created_at: string;
  items: Array<{
    item_type: string;
    item_name: string;
    price_paise: number;
    quantity: number;
    scheduled_date?: string;
    scheduled_time?: string;
    pujari_name?: string;
    service_location?: string;
    preferred_language?: string;
  }>;
}

export function formatINR(paise: number): string {
  const rupees = paise / 100;
  return 'Rs. ' + rupees.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function generateOrderReceiptPDF(data: OrderReceiptData): Buffer {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header banner background
  doc.setFillColor(127, 29, 29); // Deep Maroon #7F1D1D
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Gold accent bar
  doc.setFillColor(217, 119, 6); // Saffron / Muted Gold #D97706
  doc.rect(0, 28, pageWidth, 3, 'F');

  // Title & Brand
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('MANDIRVEDA', 14, 14);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(253, 230, 138); // Pale gold
  doc.text('Sacred Hindu Rituals & Vedic Samagri Store', 14, 21);

  // Status badge on header
  const isPaid = data.payment_status === 'paid';
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  if (isPaid) {
    doc.setTextColor(187, 247, 208);
    doc.text('OFFICIAL PAID RECEIPT', pageWidth - 14, 15, { align: 'right' });
  } else {
    doc.setTextColor(254, 202, 202);
    doc.text('ORDER SUMMARY (UNPAID)', pageWidth - 14, 15, { align: 'right' });
  }

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 255, 255);
  doc.text(`Receipt Ref: REC-${data.order_number}`, pageWidth - 14, 21, { align: 'right' });

  // Organization info & Meta
  let y = 40;
  doc.setTextColor(55, 65, 81);
  doc.setFontSize(8);
  doc.text('MandirVeda Trust & Ritual Services', 14, y);
  doc.text('Temple Road, Sankat Mochan, Varanasi, UP - 221001', 14, y + 4);
  doc.text('GSTIN: 09AABCU9603R1ZM  |  contact@mandirveda.com  |  +91 98765 43210', 14, y + 8);

  // Order meta box on right
  doc.setFontSize(8);
  doc.text(`Order Number: ${data.order_number}`, pageWidth - 14, y, { align: 'right' });
  doc.text(`Date: ${new Date(data.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`, pageWidth - 14, y + 4, { align: 'right' });
  doc.text(`Payment ID: ${data.payment_id || 'Pending / N/A'}`, pageWidth - 14, y + 8, { align: 'right' });
  doc.text(`Booking Status: ${data.booking_status.toUpperCase()}`, pageWidth - 14, y + 12, { align: 'right' });

  // Divider
  y += 18;
  doc.setDrawColor(229, 231, 235);
  doc.line(14, y, pageWidth - 14, y);

  // Bill To details
  y += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(127, 29, 29);
  doc.text('DEVOTEE & BILLING DETAILS', 14, y);

  y += 5;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(31, 41, 55);
  doc.text(`Name: ${data.customer_name}`, 14, y);
  if (data.customer_email && !data.customer_email.endsWith('@mandirveda.local')) {
    doc.text(`Email: ${data.customer_email}`, 14, y + 4);
    y += 4;
  }
  doc.text(`Phone: ${data.customer_phone}`, 14, y + 4);
  doc.text(`Service / Delivery Address: ${data.address_line}, ${data.city}, ${data.state} - ${data.pincode}`, 14, y + 8);

  // Table header
  y += 18;
  doc.setFillColor(245, 239, 235);
  doc.rect(14, y, pageWidth - 28, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(120, 53, 15);
  doc.text('ITEM & RITUAL SCHEDULE', 16, y + 5);
  doc.text('TYPE', 115, y + 5);
  doc.text('QTY', 140, y + 5, { align: 'center' });
  doc.text('PRICE', 160, y + 5, { align: 'right' });
  doc.text('TOTAL', pageWidth - 16, y + 5, { align: 'right' });

  y += 8;
  doc.setFont('helvetica', 'normal');

  for (const item of data.items) {
    const itemTotal = item.price_paise * item.quantity;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(17, 24, 39);
    doc.text(item.item_name, 16, y + 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(107, 114, 128);

    let extraY = 4;
    if (item.item_type === 'puja') {
      if (item.scheduled_date && item.scheduled_time) {
        extraY += 3.5;
        doc.text(`Schedule: ${item.scheduled_date} at ${item.scheduled_time}`, 16, y + extraY);
      }
      if (item.pujari_name) {
        extraY += 3.5;
        doc.text(`Assigned Acharya: ${item.pujari_name}`, 16, y + extraY);
      }
      if (item.service_location) {
        extraY += 3.5;
        doc.text(`Location: ${item.service_location}`, 16, y + extraY);
      }
    }

    doc.setTextColor(75, 85, 99);
    doc.text(item.item_type === 'puja' ? 'Vedic Puja' : 'Puja Samagri', 115, y + 4);
    doc.text(item.item_type === 'puja' ? '—' : item.quantity.toString(), 140, y + 4, { align: 'center' });
    doc.text(formatINR(item.price_paise), 160, y + 4, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text(formatINR(itemTotal), pageWidth - 16, y + 4, { align: 'right' });

    y += Math.max(8, extraY + 5);
    doc.setDrawColor(243, 244, 246);
    doc.line(14, y, pageWidth - 14, y);
    y += 2;
  }

  // Summary box
  y += 4;
  const summaryX = pageWidth - 80;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);

  doc.text('Subtotal:', summaryX, y);
  doc.text(formatINR(data.subtotal_paise), pageWidth - 16, y, { align: 'right' });

  y += 4.5;
  doc.text('GST / Taxes (5%):', summaryX, y);
  doc.text(formatINR(data.tax_paise), pageWidth - 16, y, { align: 'right' });

  y += 4.5;
  doc.text('Dakshina & Shipping:', summaryX, y);
  doc.text(data.delivery_paise === 0 ? 'FREE' : formatINR(data.delivery_paise), pageWidth - 16, y, { align: 'right' });

  if (data.discount_paise > 0) {
    y += 4.5;
    doc.text('Discount:', summaryX, y);
    doc.text('- ' + formatINR(data.discount_paise), pageWidth - 16, y, { align: 'right' });
  }

  y += 6;
  doc.setFillColor(254, 243, 199); // Soft Gold
  doc.rect(summaryX - 4, y - 4, pageWidth - summaryX - 10, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(146, 64, 14);
  doc.text('Total Amount Paid:', summaryX, y + 1.5);
  doc.text(formatINR(data.total_paise), pageWidth - 16, y + 1.5, { align: 'right' });

  // Verification Box / Stamp
  y += 22;
  doc.setDrawColor(180, 83, 9);
  doc.setLineWidth(0.4);
  doc.rect(14, y, 90, 24);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(180, 83, 9);
  doc.text('SHRADDHA EVAM VISHWAS - VERIFIED SEVA', 16, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(75, 85, 99);
  doc.text('This digital receipt is authenticated by MandirVeda.', 16, y + 10);
  doc.text('For rescheduling or sankalpa assistance, contact support', 16, y + 14);
  doc.text('with Order Number: ' + data.order_number, 16, y + 18);

  // Footer note
  doc.setFontSize(7);
  doc.setTextColor(156, 163, 175);
  doc.text('May the divine blessings of Sri Hari and Bhagavan Shiva bring peace and prosperity to your family.', pageWidth / 2, 285, { align: 'center' });
  doc.text('MandirVeda Platform - Computer Generated Document, No Signature Required.', pageWidth / 2, 289, { align: 'center' });

  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}
