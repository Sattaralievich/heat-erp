const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  full_name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  role: {
    type: DataTypes.ENUM('super_admin','director','sales_manager',
      'warehouse_staff','export_manager','accountant'),
    defaultValue: 'sales_manager'
  },
  is_2fa_enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
  totp_secret: DataTypes.STRING,
  telegram_chat_id: DataTypes.STRING,
  email_notifications: { type: DataTypes.BOOLEAN, defaultValue: true },
  telegram_notifications: { type: DataTypes.BOOLEAN, defaultValue: false },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  last_login: DataTypes.DATE
}, { tableName: 'users' });

const Customer = sequelize.define('Customer', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(200), allowNull: false },
  company: DataTypes.STRING(200),
  country: DataTypes.STRING(100),
  city: DataTypes.STRING(100),
  phone: DataTypes.STRING(20),
  email: DataTypes.STRING,
  tax_number: DataTypes.STRING(50),
  address: DataTypes.TEXT,
  currency: { type: DataTypes.ENUM('UZS','USD','EUR','GBP','CNY'), defaultValue: 'USD' },
  credit_limit: { type: DataTypes.DECIMAL(15,2), defaultValue: 0 },
  is_foreign: { type: DataTypes.BOOLEAN, defaultValue: false },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  notes: DataTypes.TEXT
}, { tableName: 'customers' });

const Product = sequelize.define('Product', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(200), allowNull: false },
  sku: { type: DataTypes.STRING(50), unique: true },
  barcode: DataTypes.STRING(50),
  category: DataTypes.STRING(100),
  brand: DataTypes.STRING(100),
  unit: { type: DataTypes.ENUM('kg','meter','piece','box','roll'), defaultValue: 'kg' },
  price_uzs: { type: DataTypes.DECIMAL(15,2), defaultValue: 0 },
  price_usd: { type: DataTypes.DECIMAL(10,4), defaultValue: 0 },
  price_eur: { type: DataTypes.DECIMAL(10,4), defaultValue: 0 },
  current_stock: { type: DataTypes.DECIMAL(12,3), defaultValue: 0 },
  min_stock: { type: DataTypes.DECIMAL(12,3), defaultValue: 0 },
  warehouse_location: DataTypes.STRING(50),
  hs_code: DataTypes.STRING(20),
  origin_country: { type: DataTypes.STRING(100), defaultValue: 'Uzbekistan' },
  description: DataTypes.TEXT,
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: 'products' });

const Order = sequelize.define('Order', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  order_number: { type: DataTypes.STRING(20), unique: true },
  customer_id: DataTypes.UUID,
  created_by: DataTypes.UUID,
  status: {
    type: DataTypes.ENUM('new','approved','warehouse_check','ready_to_ship',
      'shipped','payment_pending','closed','cancelled'),
    defaultValue: 'new'
  },
  currency: { type: DataTypes.ENUM('UZS','USD','EUR','GBP','CNY'), defaultValue: 'USD' },
  subtotal: { type: DataTypes.DECIMAL(15,2), defaultValue: 0 },
  discount_percent: { type: DataTypes.DECIMAL(5,2), defaultValue: 0 },
  discount_amount: { type: DataTypes.DECIMAL(15,2), defaultValue: 0 },
  total_amount: { type: DataTypes.DECIMAL(15,2), defaultValue: 0 },
  total_amount_uzs: { type: DataTypes.DECIMAL(18,2), defaultValue: 0 },
  payment_due_date: DataTypes.DATEONLY,
  notes: DataTypes.TEXT,
  contract_number: DataTypes.STRING(50),
  is_export: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { tableName: 'orders' });

const OrderItem = sequelize.define('OrderItem', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  order_id: DataTypes.UUID,
  product_id: DataTypes.UUID,
  quantity: { type: DataTypes.DECIMAL(12,3), allowNull: false },
  unit_price: { type: DataTypes.DECIMAL(15,4), allowNull: false },
  total_price: { type: DataTypes.DECIMAL(15,2), allowNull: false }
}, { tableName: 'order_items' });

const StockMovement = sequelize.define('StockMovement', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  product_id: DataTypes.UUID,
  type: { type: DataTypes.ENUM('in','out','adjustment','return'), allowNull: false },
  quantity: { type: DataTypes.DECIMAL(12,3), allowNull: false },
  unit_cost: DataTypes.DECIMAL(15,4),
  reference_type: DataTypes.STRING(50),
  reference_id: DataTypes.UUID,
  supplier: DataTypes.STRING(200),
  batch_number: DataTypes.STRING(50),
  notes: DataTypes.TEXT,
  created_by: DataTypes.UUID
}, { tableName: 'stock_movements' });

const ExportShipment = sequelize.define('ExportShipment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  shipment_number: { type: DataTypes.STRING(30), unique: true },
  order_id: DataTypes.UUID,
  customer_id: DataTypes.UUID,
  status: {
    type: DataTypes.ENUM('preparing','customs','in_transit','delivered','cancelled'),
    defaultValue: 'preparing'
  },
  cargo_company: DataTypes.STRING(200),
  tracking_number: DataTypes.STRING(100),
  destination_country: DataTypes.STRING(100),
  destination_address: DataTypes.TEXT,
  incoterms: { type: DataTypes.ENUM('EXW','FOB','CIF','DDP','DAP'), defaultValue: 'FOB' },
  total_weight_kg: DataTypes.DECIMAL(10,3),
  total_boxes: DataTypes.INTEGER,
  invoice_amount: DataTypes.DECIMAL(15,2),
  invoice_currency: { type: DataTypes.ENUM('USD','EUR','GBP','CNY'), defaultValue: 'USD' },
  customs_declaration: DataTypes.STRING(50),
  lc_number: DataTypes.STRING(50),
  lc_bank: DataTypes.STRING(200),
  lc_expiry_date: DataTypes.DATEONLY,
  estimated_delivery: DataTypes.DATEONLY,
  actual_delivery: DataTypes.DATEONLY,
  created_by: DataTypes.UUID,
  notes: DataTypes.TEXT
}, { tableName: 'export_shipments' });

const Transaction = sequelize.define('Transaction', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  type: { type: DataTypes.ENUM('income','expense'), allowNull: false },
  category: DataTypes.STRING(100),
  amount: { type: DataTypes.DECIMAL(15,2), allowNull: false },
  currency: { type: DataTypes.ENUM('UZS','USD','EUR','GBP','CNY'), defaultValue: 'USD' },
  amount_uzs: DataTypes.DECIMAL(18,2),
  exchange_rate: { type: DataTypes.DECIMAL(12,4), defaultValue: 1 },
  payment_method: {
    type: DataTypes.ENUM('cash','bank_transfer','card','lc'),
    defaultValue: 'bank_transfer'
  },
  customer_id: DataTypes.UUID,
  order_id: DataTypes.UUID,
  reference_number: DataTypes.STRING(100),
  description: DataTypes.TEXT,
  transaction_date: DataTypes.DATEONLY,
  created_by: DataTypes.UUID
}, { tableName: 'transactions' });

const NotificationSettings = sequelize.define('NotificationSettings', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  telegram_bot_token: DataTypes.STRING(500),
  telegram_enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
  smtp_host: DataTypes.STRING(200),
  smtp_port: DataTypes.INTEGER,
  smtp_user: DataTypes.STRING(200),
  smtp_pass: DataTypes.STRING(200),
  smtp_from_name: DataTypes.STRING(100),
  smtp_from_email: DataTypes.STRING(200),
  email_enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
  notify_new_order: { type: DataTypes.BOOLEAN, defaultValue: true },
  notify_low_stock: { type: DataTypes.BOOLEAN, defaultValue: true },
  notify_payment_due: { type: DataTypes.BOOLEAN, defaultValue: true },
  notify_daily_report: { type: DataTypes.BOOLEAN, defaultValue: false },
  daily_report_time: { type: DataTypes.STRING(5), defaultValue: '08:00' },
  admin_email: DataTypes.STRING(200),
  admin_telegram_ids: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  report_emails: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] }
}, { tableName: 'notification_settings' });

const NotificationLog = sequelize.define('NotificationLog', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  type: { type: DataTypes.ENUM('telegram','email','sms'), allowNull: false },
  recipient: DataTypes.STRING(200),
  subject: DataTypes.STRING(500),
  message: DataTypes.TEXT,
  status: { type: DataTypes.ENUM('sent','failed','pending'), defaultValue: 'pending' },
  error_message: DataTypes.TEXT
}, { tableName: 'notification_logs' });

const AIConversation = sequelize.define('AIConversation', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: DataTypes.UUID,
  session_id: { type: DataTypes.STRING(100), unique: true },
  messages: { type: DataTypes.JSONB, defaultValue: [] }
}, { tableName: 'ai_conversations' });

// Associations
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Order.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
Order.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
StockMovement.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
ExportShipment.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
Transaction.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });

module.exports = {
  sequelize, User, Customer, Product, Order, OrderItem,
  StockMovement, ExportShipment, Transaction,
  NotificationSettings, NotificationLog, AIConversation
};
