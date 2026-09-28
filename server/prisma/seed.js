import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Sunrise Heights Society Command database...');

  // Clean existing tables in reverse order of foreign keys
  await prisma.rating.deleteMany();
  await prisma.poolVendorSelection.deleteMany();
  await prisma.quotation.deleteMany();
  await prisma.vendorInvitation.deleteMany();
  await prisma.serviceRequest.deleteMany();
  await prisma.servicePool.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.notice.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.document.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.society.deleteMany();
  await prisma.user.deleteMany();
  await prisma.serviceCategory.deleteMany();

  const hashedSuperAdmin = await bcrypt.hash('admin123', 10);
  const hashedAdmin = await bcrypt.hash('admin123', 10);
  const hashedResident = await bcrypt.hash('resident123', 10);
  const hashedVendor = await bcrypt.hash('vendor123', 10);

  // 1. Service Categories matching Society Command
  const catElevator = await prisma.serviceCategory.create({
    data: {
      name: 'Elevator',
      description: 'Lift AMC renewal, preventative checkup, safety rope inspections',
      icon: 'arrow-up-down',
      marketPrice: 65000.0
    }
  });

  const catElectrical = await prisma.serviceCategory.create({
    data: {
      name: 'Electrical',
      description: 'Corridor LED retrofit, transformer servicing, surge arrestors',
      icon: 'zap',
      marketPrice: 95000.0
    }
  });

  const catHousekeeping = await prisma.serviceCategory.create({
    data: {
      name: 'Housekeeping',
      description: 'Overhead tank cleaning, basement power scrub, terrace waterproofing',
      icon: 'sparkles',
      marketPrice: 32000.0
    }
  });

  const catPainting = await prisma.serviceCategory.create({
    data: {
      name: 'Painting',
      description: 'Parking repaint, exterior weather-shield coating, curb line striping',
      icon: 'brush',
      marketPrice: 24000.0
    }
  });

  const catPlumbing = await prisma.serviceCategory.create({
    data: {
      name: 'Plumbing',
      description: 'Water softener service, STP filter bed renewal, pressure pump maintenance',
      icon: 'wrench',
      marketPrice: 52000.0
    }
  });

  const catAC = await prisma.serviceCategory.create({
    data: {
      name: 'AC Servicing & HVAC',
      description: 'Seasonal foam wash, refrigerant gas top-up, fan motor check',
      icon: 'air-vent',
      marketPrice: 45000.0
    }
  });

  // 2. Super Admin User
  const superAdmin = await prisma.user.create({
    data: {
      name: 'Platform Super Admin',
      email: 'superadmin@nivaasos.com',
      passwordHash: hashedSuperAdmin,
      phone: '+91 98765 00001',
      role: 'SUPER_ADMIN'
    }
  });

  // 3. Society Admin User (R. Anand - Society Admin)
  const adminUser = await prisma.user.create({
    data: {
      name: 'R. Anand',
      email: 'admin@sunriseheights.com',
      passwordHash: hashedAdmin,
      phone: '+91 98765 11111',
      role: 'ADMIN',
      flatNumber: 'A-401'
    }
  });

  // 4. Society Creation (Sunrise Heights · HSR Layout, Bengaluru)
  const society = await prisma.society.create({
    data: {
      name: 'Sunrise Heights',
      address: 'HSR Layout, Sector 2',
      city: 'Bengaluru',
      totalFlats: 312,
      adminId: adminUser.id
    }
  });

  // Link admin user's societyId
  await prisma.user.update({
    where: { id: adminUser.id },
    data: { societyId: society.id }
  });

  // 5. Resident Users
  const res1 = await prisma.user.create({
    data: {
      name: 'Rajesh Sharma',
      email: 'resident1@sunriseheights.com',
      passwordHash: hashedResident,
      phone: '+91 98765 22001',
      role: 'RESIDENT',
      societyId: society.id,
      flatNumber: 'A-101'
    }
  });

  const res2 = await prisma.user.create({
    data: {
      name: 'Priya Patel',
      email: 'resident2@sunriseheights.com',
      passwordHash: hashedResident,
      phone: '+91 98765 22002',
      role: 'RESIDENT',
      societyId: society.id,
      flatNumber: 'B-204'
    }
  });

  const res3 = await prisma.user.create({
    data: {
      name: 'Amitabh Verma',
      email: 'resident3@sunriseheights.com',
      passwordHash: hashedResident,
      phone: '+91 98765 22003',
      role: 'RESIDENT',
      societyId: society.id,
      flatNumber: 'A-302'
    }
  });

  const res4 = await prisma.user.create({
    data: {
      name: 'Sneha Reddy',
      email: 'resident4@sunriseheights.com',
      passwordHash: hashedResident,
      phone: '+91 98765 22004',
      role: 'RESIDENT',
      societyId: society.id,
      flatNumber: 'C-501'
    }
  });

  // 6. Vendor Users & Profiles matching Lovable
  const vendorUser1 = await prisma.user.create({
    data: {
      name: 'VertexLift Engineering',
      email: 'vendor.vertex@nivaas.com',
      passwordHash: hashedVendor,
      phone: '+91 98765 33001',
      role: 'VENDOR'
    }
  });

  const vendor1 = await prisma.vendor.create({
    data: {
      userId: vendorUser1.id,
      businessName: 'VertexLift Services',
      servicesOffered: 'Elevator, Electrical',
      verificationStatus: 'VERIFIED',
      avgRating: 4.85,
      totalRatingsCount: 48,
      serviceArea: 'Bengaluru South & Central'
    }
  });

  const vendorUser2 = await prisma.user.create({
    data: {
      name: 'Metro Facility Care',
      email: 'vendor.metro@nivaas.com',
      passwordHash: hashedVendor,
      phone: '+91 98765 33002',
      role: 'VENDOR'
    }
  });

  const vendor2 = await prisma.vendor.create({
    data: {
      userId: vendorUser2.id,
      businessName: 'Metro Facility Care',
      servicesOffered: 'Housekeeping, Painting, Plumbing',
      verificationStatus: 'VERIFIED',
      avgRating: 4.62,
      totalRatingsCount: 36,
      serviceArea: 'Bengaluru'
    }
  });

  const vendorUser3 = await prisma.user.create({
    data: {
      name: 'Apex Electricals',
      email: 'vendor.apex@nivaas.com',
      passwordHash: hashedVendor,
      phone: '+91 98765 33003',
      role: 'VENDOR'
    }
  });

  const vendor3 = await prisma.vendor.create({
    data: {
      userId: vendorUser3.id,
      businessName: 'Apex Power & LED Systems',
      servicesOffered: 'Electrical, Lighting Retrofit',
      verificationStatus: 'VERIFIED',
      avgRating: 4.90,
      totalRatingsCount: 62,
      serviceArea: 'HSR Layout & Koramangala'
    }
  });

  // 7. Seed Demand Pools matching Society Command UI
  // Pool 1: Lift AMC renewal (Bidding, 4 quotes, 14 flats)
  const poolLift = await prisma.servicePool.create({
    data: {
      societyId: society.id,
      categoryId: catElevator.id,
      status: 'QUOTING',
      cycleStart: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      cycleEnd: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    }
  });

  await prisma.serviceRequest.create({
    data: {
      residentId: res1.id,
      societyId: society.id,
      categoryId: catElevator.id,
      description: 'Tower A Lift 2 AMC renewal and sensor alignment',
      urgency: 'HIGH',
      status: 'POOLED',
      poolId: poolLift.id
    }
  });

  await prisma.quotation.create({
    data: {
      poolId: poolLift.id,
      vendorId: vendor1.id,
      pricePerUnit: 23000.0,
      totalEstimate: 46000.0,
      terms: 'Comprehensive 12-month AMC with bi-weekly preventative audits and 30-min breakdown response SLA.',
      availability: 'Immediate on contract signing'
    }
  });

  // Pool 2: Corridor LED retrofit (Assigned, 7 quotes, 212 flats)
  const poolLED = await prisma.servicePool.create({
    data: {
      societyId: society.id,
      categoryId: catElectrical.id,
      status: 'ASSIGNED',
      cycleStart: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      cycleEnd: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  });

  // Pool 3: Overhead tank cleaning (In progress, 3 quotes, 164 flats)
  const poolTank = await prisma.servicePool.create({
    data: {
      societyId: society.id,
      categoryId: catHousekeeping.id,
      status: 'IN_PROGRESS',
      cycleStart: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      cycleEnd: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    }
  });

  // Pool 4: Parking repaint (Bidding, 2 quotes, 58 flats)
  const poolPaint = await prisma.servicePool.create({
    data: {
      societyId: society.id,
      categoryId: catPainting.id,
      status: 'QUOTING',
      cycleStart: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      cycleEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });

  // Pool 5: Water softener service (Assigned, 5 quotes, 189 flats)
  const poolSoftener = await prisma.servicePool.create({
    data: {
      societyId: society.id,
      categoryId: catPlumbing.id,
      status: 'ASSIGNED',
      cycleStart: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      cycleEnd: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    }
  });

  // 8. Complaints matching Complaint Health
  await prisma.complaint.create({
    data: {
      residentId: res2.id,
      societyId: society.id,
      category: 'Water pressure',
      description: 'Low water pressure on top floor fixtures during morning peak 7-9 AM.',
      status: 'OPEN',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  });

  await prisma.complaint.create({
    data: {
      residentId: res1.id,
      societyId: society.id,
      category: 'Lift breakdowns',
      description: 'Lift #2 in Tower A has intermittent door sensor errors. Needs admin attention today.',
      status: 'OPEN',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // Past SLA
    }
  });

  await prisma.complaint.create({
    data: {
      residentId: res3.id,
      societyId: society.id,
      category: 'Security access',
      description: 'Gate C intercom handset and visitor RFID barrier offline.',
      status: 'OPEN',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // Past SLA
    }
  });

  // 9. Notices matching Recent Notices
  await prisma.notice.create({
    data: {
      societyId: society.id,
      postedBy: adminUser.id,
      title: 'Water supply timing revised from Monday',
      content: 'Bengaluru Water Board (BWSSB) will carry out main feeder pipe connection works. Supply will run from 6:00 AM - 9:30 AM and 6:30 PM - 9:30 PM.',
      category: 'WATER',
      createdAt: new Date()
    }
  });

  await prisma.notice.create({
    data: {
      societyId: society.id,
      postedBy: adminUser.id,
      title: 'AGM agenda open for suggestions',
      content: 'Please submit any agenda items for the upcoming Annual General Body Meeting to the society management office before Friday.',
      category: 'EVENT',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    }
  });

  await prisma.notice.create({
    data: {
      societyId: society.id,
      postedBy: adminUser.id,
      title: 'Visitor parking reserved for Diwali',
      content: 'Guest parking bays in Basement B & C are pre-allocated for festival visitors with designated parking passes.',
      category: 'FACILITY',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    }
  });

  // 10. Payments Log
  await prisma.payment.create({
    data: {
      residentId: res1.id,
      societyId: society.id,
      amount: 4200.0,
      month: 'September 2026',
      status: 'PAID',
      paymentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      receiptUrl: 'REC-2026-09-A101'
    }
  });

  await prisma.payment.create({
    data: {
      residentId: res2.id,
      societyId: society.id,
      amount: 4200.0,
      month: 'September 2026',
      status: 'PAID',
      paymentDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      receiptUrl: 'REC-2026-09-B204'
    }
  });

  // 11. Documents
  await prisma.document.create({
    data: {
      societyId: society.id,
      title: 'Sunrise Heights Apartment Owners Association Registered Bylaws',
      fileUrl: '/docs/Sunrise-Heights-Bylaws.pdf',
      uploadedBy: adminUser.name,
      category: 'BYLAWS'
    }
  });

  await prisma.document.create({
    data: {
      societyId: society.id,
      title: 'Audited Society Balance Sheet & Bulk Savings Summary FY25-26',
      fileUrl: '/docs/Sunrise-Audit-FY26.pdf',
      uploadedBy: adminUser.name,
      category: 'FINANCIAL'
    }
  });

  console.log('Seeding Sunrise Heights successfully completed!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
