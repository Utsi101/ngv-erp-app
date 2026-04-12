import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import pg from 'pg';
import { PrismaClient } from './prisma-client/client';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seeding...'); // Removed extra brackets

  // 1. Setup Your Company Profile (The Exporter)
  const myCompany = await prisma.companyProfile.create({
    data: {
      companyName: 'Neodevoir Global Ventures LLP',
      addressLine1: '32/9, Santosh Sarani, Banamlipur Road',
      addressLine2: '',
      city: 'Barasat',
      district: 'North 24 Parganas',
      state: 'West Bengal',
      stateCode: '19',
      pincode: '700124',
      gstin: '19AAXFN7571Q1ZU',
      iecCode: 'AAXFN7571Q',
      pan: 'AAXFN7571Q',
      lutNumber: '0123456789',
      llpin: 'ACL-8554',
      adCode: '12345678901234',
      bankName: 'AXIS BANK',
      bankBranch: 'Barasat',
      bankAddress: '35/B, Jessore Rd, Gupta Colony, Barasat, Kolkata, West Bengal 700124',
      accountName: 'Neodevoir Global Ventures LLP',
      accountNumber: '925020028741015',
      swiftCode: 'AXISINBB025',
      ifscCode: 'UTIB0001695',
      email: 'Neodevoirglobalventures@gmail.com',
      phone: '+918981240970',
      website: '',
    },
  });
  console.log(`✅ Created Exporter Profile: ${myCompany.companyName}`);

  // 2. Setup a Dummy International Buyer
  const buyer = await prisma.buyer.create({
    data: {
      companyName: 'London Heritage Goods Ltd.',
      contactPerson: 'James Sterling',
      billingAddress: '14 Savile Row, London, W1S 3JN, United Kingdom',
      shippingAddress: 'Warehouse 4, Heathrow Logistics Park, London, TW6 3QW, UK',
      country: 'United Kingdom',
      taxId: 'GB123456789',
      preferredCurrency: 'USD',
    },
  });
  console.log(`✅ Created Buyer: ${buyer.companyName}`);

  // 3. Setup Leather Goods Inventory
  const duffelBag = await prisma.product.create({
    data: {
      skuBase: 'BAG-DUF-001',
      description: 'Premium Full-Grain Leather Weekend Duffel Bag',
      hsCode: '4202.21.10',
      unitPriceUsd: 145.0,
      moq: 10,
      weightNet: 2.5,
      weightGross: 3.0,
      cbm: 0.045,
      variants: {
        create: [
          {
            skuFull: 'BAG-DUF-001-BRN',
            color: 'Vintage Brown',
            leatherType: 'Full-Grain',
            stockAllocation: 50,
          },
          {
            skuFull: 'BAG-DUF-001-BLK',
            color: 'Midnight Black',
            leatherType: 'Top-Grain',
            stockAllocation: 30,
          },
        ],
      },
    },
  });
  console.log(`✅ Created Product: ${duffelBag.skuBase}`);

  const wallet = await prisma.product.create({
    data: {
      skuBase: 'WAL-BIF-001',
      description: 'Classic Leather Bifold Wallet with RFID Protection',
      hsCode: '4202.31.20',
      unitPriceUsd: 22.5,
      moq: 50,
      weightNet: 0.15,
      weightGross: 0.2,
      cbm: 0.001,
      variants: {
        create: [
          {
            skuFull: 'WAL-BIF-001-TAN',
            color: 'Tan',
            leatherType: 'Nappa',
            stockAllocation: 200,
          },
          {
            skuFull: 'WAL-BIF-001-BLK',
            color: 'Black',
            leatherType: 'Nappa',
            stockAllocation: 150,
          },
        ],
      },
    },
  });
  console.log(`✅ Created Product: ${wallet.skuBase}`);

  console.log('🎉 Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
