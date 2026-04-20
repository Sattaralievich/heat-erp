require('dotenv').config();
const bcrypt = require('bcryptjs');

async function seed() {
  const {
    sequelize, User, Customer, Product,
    Transaction, Order, OrderItem,
    ExportShipment, NotificationSettings
  } = require('../models');

  try {
    await sequelize.sync({ force: true });
    console.log('✅ Database synced');

    const hash = async (p) => bcrypt.hash(p, 12);

    await User.bulkCreate([
      { full_name: 'Super Admin', email: 'admin@hamzaexpo.uz',
        password: await hash('Admin@12345'), role: 'super_admin' },
      { full_name: 'Hamza Rahimov', email: 'director@hamzaexpo.uz',
        password: await hash('Director@12345'), role: 'director' },
      { full_name: 'Sardor Alimov', email: 'sales@hamzaexpo.uz',
        password: await hash('Sales@12345'), role: 'sales_manager' },
      { full_name: 'Bobur Yusupov', email: 'warehouse@hamzaexpo.uz',
        password: await hash('Warehouse@12345'), role: 'warehouse_staff' },
      { full_name: 'Kamola Nazarova', email: 'export@hamzaexpo.uz',
        password: await hash('Export@12345'), role: 'export_manager' },
      { full_name: 'Dilnoza Xasanova', email: 'finance@hamzaexpo.uz',
        password: await hash('Finance@12345'), role: 'accountant' }
    ]);

    const customers = await Customer.bulkCreate([
      { name: 'Abdullah Trading LLC', country: 'UAE', city: 'Dubai',
        email: 'info@abdullahtrading.ae', currency: 'USD',
        is_foreign: true, credit_limit: 50000 },
      { name: 'Silk Road GmbH', country: 'Germany', city: 'Hamburg',
        email: 'info@silkroad.de', currency: 'EUR',
        is_foreign: true, credit_limit: 80000 },
      { name: 'Tashkent Fashion Store', country: 'Uzbekistan', city: 'Tashkent',
        email: 'tfs@mail.uz', currency: 'UZS',
        is_foreign: false, credit_limit: 500000000 },
      { name: 'Istanbul Fabric Hub', country: 'Turkey', city: 'Istanbul',
        email: 'ifh@tr.com', currency: 'USD',
        is_foreign: true, credit_limit: 60000 },
      { name: 'Beijing Textile Co', country: 'China', city: 'Beijing',
        email: 'btc@cn.com', currency: 'CNY',
        is_foreign: true, credit_limit: 100000 }
    ]);

    const products = await Product.bulkCreate([
      { name: 'Paxta mato (Oq)', sku: 'CTN-100-WHT', category: 'Paxta',
        unit: 'meter', price_uzs: 45000, price_usd: 3.8, price_eur: 3.5,
        current_stock: 5000, min_stock: 500, warehouse_location: 'A-01' },
      { name: 'Ipak mato (Ko\'k)', sku: 'SLK-BLU-001', category: 'Ipak',
        unit: 'meter', price_uzs: 120000, price_usd: 10.0, price_eur: 9.2,
        current_stock: 1200, min_stock: 200, warehouse_location: 'B-02' },
      { name: 'Kanaus mato (Qizil)', sku: 'KNS-RED-001', category: 'Kanaus',
        unit: 'meter', price_uzs: 35000, price_usd: 2.9, price_eur: 2.7,
        current_stock: 80, min_stock: 300, warehouse_location: 'A-03' },
      { name: 'Zigir mato (Sariq)', sku: 'LNM-YLW-001', category: 'Zigir',
        unit: 'meter', price_uzs: 55000, price_usd: 4.6, price_eur: 4.2,
        current_stock: 2800, min_stock: 300, warehouse_location: 'C-01' },
      { name: 'Atir mato (Yashil)', sku: 'VLV-GRN-001', category: 'Atir',
        unit: 'meter', price_uzs: 95000, price_usd: 8.0, price_eur: 7.3,
        current_stock: 0, min_stock: 100, warehouse_location: 'B-05' },
      { name: 'Gazlama (Oq)', sku: 'GZL-WHT-001', category: 'Gazlama',
        unit: 'kg', price_uzs: 25000, price_usd: 2.1, price_eur: 1.9,
        current_stock: 3500, min_stock: 500, warehouse_location: 'A-05' },
      { name: 'Shoyi mato', sku: 'SHY-BRN-001', category: 'Shoyi',
        unit: 'meter', price_uzs: 150000, price_usd: 12.5, price_eur: 11.5,
        current_stock: 600, min_stock: 100, warehouse_location: 'E-01' },
      { name: 'Chit mato', sku: 'CHT-BLW-001', category: 'Chit',
        unit: 'meter', price_uzs: 30000, price_usd: 2.5, price_eur: 2.3,
        current_stock: 4200, min_stock: 600, warehouse_location: 'D-01' }
    ]);

    const admin = await User.findOne({ where: { role: 'super_admin' } });

    const orders = [
      { ci: 0, amount: 12400, cur: 'USD', status: 'new' },
      { ci: 1, amount: 18900, cur: 'EUR', status: 'approved' },
      { ci: 2, amount: 47500000, cur: 'UZS', status: 'warehouse_check' },
      { ci: 3, amount: 8750, cur: 'USD', status: 'ready_to_ship' },
      { ci: 4, amount: 15200, cur: 'USD', status: 'closed' }
    ];

    for (const [i, od] of orders.entries()) {
      const order = await Order.create({
        order_number: `ORD-202504-00${i + 1}`,
        customer_id: customers[od.ci].id,
        created_by: admin.id,
        status: od.status,
        currency: od.cur,
        subtotal: od.amount,
        total_amount: od.amount,
        total_amount_uzs: od.amount,
        payment_due_date: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString().split('T')[0]
      });
      await OrderItem.create({
        order_id: order.id,
        product_id: products[i].id,
        quantity: 100,
        unit_price: od.amount / 100,
        total_price: od.amount
      });
    }

    const txList = [
      { type: 'income', category: 'Sotuv', amount: 12400, currency: 'USD', amount_uzs: 150000000 },
      { type: 'income', category: 'Sotuv', amount: 18900, currency: 'EUR', amount_uzs: 230000000 },
      { type: 'expense', category: 'Yuk tashish', amount: 2800, currency: 'USD', amount_uzs: 34000000 },
      { type: 'income', category: 'Sotuv', amount: 15200, currency: 'USD', amount_uzs: 185000000 },
      { type: 'expense', category: 'Xom ashyo', amount: 45000, currency: 'USD', amount_uzs: 547000000 },
      { type: 'expense', category: 'Maosh', amount: 25000, currency: 'USD', amount_uzs: 304000000 }
    ];

    for (const [i, tx] of txList.entries()) {
      const d = new Date();
      d.setDate(d.getDate() - i * 3);
      await Transaction.create({
        ...tx, created_by: admin.id,
        payment_method: 'bank_transfer',
        transaction_date: d.toISOString().split('T')[0]
      });
    }

    await ExportShipment.bulkCreate([
      { shipment_number: 'EXP-202504-001',
        customer_id: customers[0].id,
        status: 'in_transit', cargo_company: 'DHL Express',
        tracking_number: 'DHL9876543210',
        destination_country: 'UAE',
        incoterms: 'CIF', total_weight_kg: 450, total_boxes: 24,
        invoice_amount: 12400, invoice_currency: 'USD',
        created_by: admin.id },
      { shipment_number: 'EXP-202504-002',
        customer_id: customers[1].id,
        status: 'customs', cargo_company: 'MSC Shipping',
        tracking_number: 'MSC1234567890',
        destination_country: 'Germany',
        incoterms: 'FOB', total_weight_kg: 1200, total_boxes: 48,
        invoice_amount: 18900, invoice_currency: 'EUR',
        created_by: admin.id }
    ]);

    await NotificationSettings.create({
      telegram_enabled: false, email_enabled: false,
      notify_new_order: true, notify_low_stock: true,
      notify_payment_due: true, notify_daily_report: false
    });

    console.log('\n✅ SEED TAYYOR!\n');
    console.log('admin@hamzaexpo.uz     → Admin@12345');
    console.log('director@hamzaexpo.uz  → Director@12345');
    console.log('sales@hamzaexpo.uz     → Sales@12345');
    process.exit(0);
  } catch (e) {
    console.error('❌ Seed error:', e.message);
    process.exit(1);
  }
}

seed();
