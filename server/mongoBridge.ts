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
  data: { title?: string; price?: number; des?: string; is_available?: boolean }
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
  data: { title?: string; price?: number; des?: string; stock?: number; is_available?: boolean }
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
  data: { name?: string; des?: string; is_available?: boolean }
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
