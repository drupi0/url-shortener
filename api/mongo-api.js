const { MongoClient, ObjectId } = require('mongodb');

const url = process.env.MONGO_URL || "mongodb://localhost:27017";
const dbName = 'url-shortener-database';

async function connectToDatabase() {
  const client = new MongoClient(url);
  await client.connect();
  const db = client.db(dbName);
  return db;
}

async function createDocument(collectionName, document) {
  const db = await connectToDatabase();
  const collection = db.collection(collectionName);
  const result = await collection.insertOne(document);
  return result.insertedId;
}

async function getDocuments(collectionName, filter) {
  const db = await connectToDatabase();
  const collection = db.collection(collectionName);
  const documents = await collection.find(filter);
  return documents.toArray();
}

async function updateDocument(collectionName, documentId, update) {
  const db = await connectToDatabase();
  const collection = db.collection(collectionName);
  const result = await collection.updateOne(
    { _id: ObjectId(documentId) },
    { $set: update }
  );
  return result.modifiedCount;
}

async function deleteDocument(collectionName, documentId) {
  const db = await connectToDatabase();
  const collection = db.collection(collectionName);
  const result = await collection.deleteOne({ _id: ObjectId(documentId) });
  return result.deletedCount;
}


module.exports = {
  connectToDatabase, createDocument, getDocuments, updateDocument, deleteDocument
}