function matches(document, filter) {
  return Object.entries(filter).every(([key, value]) => document[key] === value);
}

class MemoryCursor {
  constructor(documents) {
    this.documents = documents;
  }

  sort(order) {
    const [[field, direction]] = Object.entries(order);
    this.documents.sort((a, b) => (a[field] > b[field] ? 1 : a[field] < b[field] ? -1 : 0) * direction);
    return this;
  }

  async toArray() {
    return structuredClone(this.documents);
  }
}

class MemoryCollection {
  constructor() {
    this.documents = [];
  }

  async createIndex() {
    return 'memory-index';
  }

  find(filter = {}) {
    return new MemoryCursor(this.documents.filter((document) => matches(document, filter)));
  }

  async findOne(filter) {
    const document = this.documents.find((item) => matches(item, filter));
    return document ? structuredClone(document) : null;
  }

  async insertOne(document) {
    this.documents.push(structuredClone(document));
    return { acknowledged: true, insertedId: document._id };
  }

  async updateOne(filter, update, { upsert = false } = {}) {
    let document = this.documents.find((item) => matches(item, filter));
    if (!document && upsert) {
      document = { ...filter, ...structuredClone(update.$setOnInsert || {}) };
      this.documents.push(document);
    }
    if (!document) return { acknowledged: true, matchedCount: 0, modifiedCount: 0 };
    Object.assign(document, structuredClone(update.$set || {}));
    return { acknowledged: true, matchedCount: 1, modifiedCount: 1 };
  }
}

export default class MemoryDatabase {
  constructor() {
    this.collections = new Map();
  }

  collection(name) {
    if (!this.collections.has(name)) this.collections.set(name, new MemoryCollection());
    return this.collections.get(name);
  }
}
