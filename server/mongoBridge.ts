import { MongoClient, ObjectId, type Db } from 'mongodb';

const MONGO_URI =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  'mongodb+srv://subhayuroy666_db_user:Subhayu_004@cluster0.avbeyuw.mongodb.net/';

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8001';

let client: MongoClient | null = null;
let dbInstance: Db | null = null;

export async function getMongoDb(): Promise<Db> {
  if (dbInstance) {
    return dbInstance;
  }
  if (!client) {
    client = new MongoClient(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
  }
  await client.connect();
  dbInstance = client.db('puja');
  return dbInstance;
}

// Check if FastAPI is accessible
let fastApiAvailable: boolean | null = null;
let lastFastApiCheck = 0;

async function isFastApiReachable(): Promise<boolean> {
  const now = Date.now();
  if (fastApiAvailable !== null && now - lastFastApiCheck < 10000) {
    return fastApiAvailable;
  }
  lastFastApiCheck = now;
  try {
    const res = await fetch(`${FASTAPI_URL}/pujas`, {
      redirect: 'follow',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(1500),
    });
    fastApiAvailable = res.ok;
    return res.ok;
  } catch {
    fastApiAvailable = false;
    return false;
  }
}

// ==========================================
// PUJAS CRUD
// ==========================================
export async function getPujasFromMongo(): Promise<any[]> {
  try {
    if (await isFastApiReachable()) {
      const res = await fetch(`${FASTAPI_URL}/pujas/`, {
        redirect: 'follow',
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(3500),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    }
  } catch (e) {
    // Fall back to direct Mongo Atlas
  }

  // Direct MongoDB Atlas
  try {
    const db = await getMongoDb();
    const docs = await db.collection('pujas').find({}).toArray();
    return docs.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
    }));
  } catch (err) {
    console.error('Error fetching pujas from MongoDB Atlas:', err);
    return [];
  }
}

export async function createPujaInMongo(data: {
  title: string;
  price: number;
  des: string;
  image?: string;
  is_available?: boolean;
}): Promise<string | null> {
  // Try FastAPI first if running
  try {
    if (await isFastApiReachable()) {
      const res = await fetch(`${FASTAPI_URL}/pujas/`, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const respData = (await res.json()) as any;
        if (respData?.id) return String(respData.id);
      }
    }
  } catch (e) {
    // Fall through to direct Mongo
  }

  // Direct MongoDB Atlas insert
  try {
    const db = await getMongoDb();
    const result = await db.collection('pujas').insertOne({
      title: data.title,
      price: data.price,
      des: data.des,
      image: data.image || null,
      is_available: data.is_available ?? true,
      updated_at: null,
      created_at: new Date(),
    });
    return result.insertedId.toString();
  } catch (err) {
    console.error('Error inserting puja into MongoDB Atlas:', err);
    return null;
  }
}

export async function updatePujaInMongo(
  id: string,
  data: { title?: string; price?: number; des?: string; image?: string; is_available?: boolean }
): Promise<boolean> {
  try {
    if (await isFastApiReachable()) {
      const res = await fetch(`${FASTAPI_URL}/pujas/${id}`, {
        method: 'PUT',
        redirect: 'follow',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return true;
    }
  } catch (e) {
    // Fall through
  }

  try {
    const db = await getMongoDb();
    await db.collection('pujas').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...data,
          updated_at: new Date(),
        },
      }
    );
    return true;
  } catch (err) {
    console.error('Error updating puja in MongoDB Atlas:', err);
    return false;
  }
}

export async function deletePujaFromMongo(id: string): Promise<boolean> {
  try {
    if (await isFastApiReachable()) {
      const res = await fetch(`${FASTAPI_URL}/pujas/${id}`, {
        method: 'DELETE',
        redirect: 'follow',
      });
      if (res.ok) return true;
    }
  } catch (e) {
    // Fall through
  }

  try {
    const db = await getMongoDb();
    await db.collection('pujas').deleteOne({ _id: new ObjectId(id) });
    return true;
  } catch (err) {
    console.error('Error deleting puja from MongoDB Atlas:', err);
    return false;
  }
}

// ==========================================
// INVENTORY CRUD
// ==========================================
export async function getInventoryFromMongo(): Promise<any[]> {
  try {
    if (await isFastApiReachable()) {
      const res = await fetch(`${FASTAPI_URL}/inventory/`, {
        redirect: 'follow',
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(3500),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    }
  } catch (e) {
    // Fall through
  }

  try {
    const db = await getMongoDb();
    const docs = await db.collection('inventory').find({}).toArray();
    return docs.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
    }));
  } catch (err) {
    console.error('Error fetching inventory from MongoDB Atlas:', err);
    return [];
  }
}

export async function createInventoryInMongo(data: {
  title: string;
  price: number;
  des: string;
  image?: string;
  stock?: number;
  is_available?: boolean;
}): Promise<string | null> {
  try {
    if (await isFastApiReachable()) {
      const res = await fetch(`${FASTAPI_URL}/inventory/`, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const respData = (await res.json()) as any;
        if (respData?.id) return String(respData.id);
      }
    }
  } catch (e) {
    // Fall through
  }

  try {
    const db = await getMongoDb();
    const result = await db.collection('inventory').insertOne({
      title: data.title,
      price: data.price,
      des: data.des,
      image: data.image || null,
      stock: data.stock ?? 10,
      is_available: data.is_available ?? true,
      updated_at: null,
      created_at: new Date(),
    });
    return result.insertedId.toString();
  } catch (err) {
    console.error('Error inserting inventory into MongoDB Atlas:', err);
    return null;
  }
}

export async function updateInventoryInMongo(
  id: string,
  data: { title?: string; price?: number; des?: string; image?: string; stock?: number; is_available?: boolean }
): Promise<boolean> {
  try {
    if (await isFastApiReachable()) {
      const res = await fetch(`${FASTAPI_URL}/inventory/${id}`, {
        method: 'PUT',
        redirect: 'follow',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return true;
    }
  } catch (e) {
    // Fall through
  }

  try {
    const db = await getMongoDb();
    await db.collection('inventory').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...data,
          updated_at: new Date(),
        },
      }
    );
    return true;
  } catch (err) {
    console.error('Error updating inventory in MongoDB Atlas:', err);
    return false;
  }
}

export async function deleteInventoryFromMongo(id: string): Promise<boolean> {
  try {
    if (await isFastApiReachable()) {
      const res = await fetch(`${FASTAPI_URL}/inventory/${id}`, {
        method: 'DELETE',
        redirect: 'follow',
      });
      if (res.ok) return true;
    }
  } catch (e) {
    // Fall through
  }

  try {
    const db = await getMongoDb();
    await db.collection('inventory').deleteOne({ _id: new ObjectId(id) });
    return true;
  } catch (err) {
    console.error('Error deleting inventory from MongoDB Atlas:', err);
    return false;
  }
}

// ==========================================
// PUJARI CRUD
// ==========================================
export async function getPujarisFromMongo(): Promise<any[]> {
  try {
    if (await isFastApiReachable()) {
      const res = await fetch(`${FASTAPI_URL}/pujari/`, {
        redirect: 'follow',
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(3500),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    }
  } catch (e) {
    // Fall through
  }

  try {
    const db = await getMongoDb();
    const docs = await db.collection('pujari').find({}).toArray();
    return docs.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
    }));
  } catch (err) {
    console.error('Error fetching pujaris from MongoDB Atlas:', err);
    return [];
  }
}

export async function createPujariInMongo(data: {
  name: string;
  des: string;
  photo?: string;
  is_available?: boolean;
}): Promise<string | null> {
  try {
    if (await isFastApiReachable()) {
      const res = await fetch(`${FASTAPI_URL}/pujari/`, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const respData = (await res.json()) as any;
        if (respData?.id) return String(respData.id);
      }
    }
  } catch (e) {
    // Fall through
  }

  try {
    const db = await getMongoDb();
    const result = await db.collection('pujari').insertOne({
      name: data.name,
      des: data.des,
      photo: data.photo || null,
      is_available: data.is_available ?? true,
      updated_at: null,
      created_at: new Date(),
    });
    return result.insertedId.toString();
  } catch (err) {
    console.error('Error inserting pujari into MongoDB Atlas:', err);
    return null;
  }
}

export async function updatePujariInMongo(
  id: string,
  data: { name?: string; des?: string; photo?: string; is_available?: boolean }
): Promise<boolean> {
  try {
    if (await isFastApiReachable()) {
      const res = await fetch(`${FASTAPI_URL}/pujari/${id}`, {
        method: 'PUT',
        redirect: 'follow',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return true;
    }
  } catch (e) {
    // Fall through
  }

  try {
    const db = await getMongoDb();
    await db.collection('pujari').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...data,
          updated_at: new Date(),
        },
      }
    );
    return true;
  } catch (err) {
    console.error('Error updating pujari in MongoDB Atlas:', err);
    return false;
  }
}

export async function deletePujariFromMongo(id: string): Promise<boolean> {
  try {
    if (await isFastApiReachable()) {
      const res = await fetch(`${FASTAPI_URL}/pujari/${id}`, {
        method: 'DELETE',
        redirect: 'follow',
      });
      if (res.ok) return true;
    }
  } catch (e) {
    // Fall through
  }

  try {
    const db = await getMongoDb();
    await db.collection('pujari').deleteOne({ _id: new ObjectId(id) });
    return true;
  } catch (err) {
    console.error('Error deleting pujari from MongoDB Atlas:', err);
    return false;
  }
}

// ==========================================
// CARTS PERSISTENCE (FOR VERCEL MULTI-LAMBDA CONTINUITY)
// ==========================================
export async function saveCartToMongo(
  cartId: string,
  token: string,
  userId: string | null,
  items: any[]
): Promise<boolean> {
  try {
    const db = await getMongoDb();
    const cleanItems = (items || []).map((i) => ({
      id: i.id || ('cit_' + Math.random().toString(36).substring(2)),
      item_type: i.item_type || 'puja',
      puja_id: i.puja_id || null,
      product_id: i.product_id || null,
      scheduled_date: i.scheduled_date || null,
      scheduled_time: i.scheduled_time || null,
      pujari_id: i.pujari_id || null,
      preferred_language: i.preferred_language || null,
      service_location: i.service_location || null,
      additional_notes: i.additional_notes || null,
      price_paise: Number(i.price_paise) || 0,
      quantity: Number(i.quantity) || 1,
    }));

    await db.collection('carts').updateOne(
      { $or: [{ session_token: token }, { cart_id: cartId }, ...(userId ? [{ user_id: userId }] : [])] },
      {
        $set: {
          cart_id: cartId,
          session_token: token,
          user_id: userId || null,
          items: cleanItems,
          updated_at: new Date(),
        },
      },
      { upsert: true }
    );
    return true;
  } catch (err) {
    console.error('Error saving cart to MongoDB Atlas:', err);
    return false;
  }
}

export async function getCartFromMongo(
  tokenOrUserId: string
): Promise<{ cart_id: string; session_token: string; user_id?: string | null; items: any[] } | null> {
  try {
    const db = await getMongoDb();
    const doc = await db.collection('carts').findOne({
      $or: [
        { session_token: tokenOrUserId },
        { cart_id: tokenOrUserId },
        { user_id: tokenOrUserId },
      ],
    });
    if (!doc) return null;
    return {
      cart_id: doc.cart_id,
      session_token: doc.session_token,
      user_id: doc.user_id,
      items: doc.items || [],
    };
  } catch (err) {
    console.error('Error fetching cart from MongoDB Atlas:', err);
    return null;
  }
}

export async function deleteCartFromMongo(cartIdOrToken: string): Promise<boolean> {
  try {
    const db = await getMongoDb();
    await db.collection('carts').deleteOne({
      $or: [{ session_token: cartIdOrToken }, { cart_id: cartIdOrToken }],
    });
    return true;
  } catch (err) {
    console.error('Error deleting cart from MongoDB Atlas:', err);
    return false;
  }
}

// ==========================================
// ORDERS PERSISTENCE (ACROSS SERVERLESS LAMBDAS)
// ==========================================
export async function saveOrderToMongo(order: any, items: any[]): Promise<boolean> {
  try {
    const db = await getMongoDb();
    await db.collection('orders').updateOne(
      { id: order.id },
      {
        $set: {
          ...order,
          items: items || [],
          updated_at: new Date(),
        },
      },
      { upsert: true }
    );
    return true;
  } catch (err) {
    console.error('Error saving order to MongoDB Atlas:', err);
    return false;
  }
}

export async function getOrderFromMongo(
  orderIdOrNumber: string
): Promise<{ order: any; items: any[] } | null> {
  try {
    const db = await getMongoDb();
    const doc = await db.collection('orders').findOne({
      $or: [
        { id: orderIdOrNumber },
        { order_number: orderIdOrNumber },
        { razorpay_order_id: orderIdOrNumber },
      ],
    });
    if (!doc) return null;
    const { items, ...order } = doc;
    return { order, items: items || [] };
  } catch (err) {
    console.error('Error fetching order from MongoDB Atlas:', err);
    return null;
  }
}

export async function updateOrderInMongo(
  orderId: string,
  updates: Record<string, any>
): Promise<boolean> {
  try {
    const db = await getMongoDb();
    await db.collection('orders').updateOne(
      { $or: [{ id: orderId }, { order_number: orderId }] },
      {
        $set: {
          ...updates,
          updated_at: new Date(),
        },
      }
    );
    return true;
  } catch (err) {
    console.error('Error updating order in MongoDB Atlas:', err);
    return false;
  }
}

export async function getUserOrdersFromMongo(userIdOrEmail: string): Promise<any[]> {
  try {
    const db = await getMongoDb();
    const docs = await db
      .collection('orders')
      .find({
        $or: [{ user_id: userIdOrEmail }, { customer_email: userIdOrEmail }],
      })
      .sort({ created_at: -1 })
      .toArray();
    return docs;
  } catch (err) {
    console.error('Error fetching user orders from MongoDB Atlas:', err);
    return [];
  }
}

