const hash = require('hash.js');

class Base64Serialization {
  serialize(s) {
    return new Buffer(s, 'ascii').toString('base64');
  }
  
  deserialize(s) {
    return new Buffer(s, 'base64').toString('ascii');
  }
}

const hashFuncs = new Map();
for (const hashFuncName of ['sha1', 'sha224', 'sha256', 'sha384', 'sha512']) {
  hashFuncs.set(hashFuncName, hash[hashFuncName]);
}

class SessionPlugin {
  constructor(secretKey, maxAge = 0, hashFunc = 'sha256', serialization = new Base64Serialization()) {
    this.secretKey = secretKey;
    this.maxAge = maxAge;
    this.hashFunc = hashFuncs.get(hashFunc);
    if (!this.hashFunc) throw new Error(`Unknown hashing algorithm ${hashFunc}`);
    this.serialization = serialization;
  }
  
  _predicateBefore(req) {
    req.session = {};
    return !!req.cookie('session');
  }

  _executorBefore(req) {
    let deser = this.serialization.deserialize(req.cookie('session'));
    const index = deser.indexOf('!');
    if (~index) {
      const hashLength = parseInt(deser.substring(0, index), 10);
      if (!isNaN(hashLength) && hashLength * 8 === this.hashFunc.blockSize) {
        const oldHash = deser.substring(index + 1, index + hashLength + 1);
        deser = deser.substring(index + hashLength + 1);
        const mac = hash.hmac(this.hashFunc, this.secretKey)
          .update(deser).digest('hex');
        if (oldHash === mac) {
          req.session = JSON.parse(deser);
          req.__sessionHash = mac;
        }
      }
    }
  }

  _predicateAfter(req, res) {
    req.__sessionSerialized = JSON.stringify(req.session);
    req.__newSessionHash = hash.hmac(this.hashFunc, this.secretKey)
      .update(req.__sessionSerialized).digest('hex');
    return req.__newSessionHash !== req.__sessionHash;
  }

  _executorAfter(req, res) {
    const serialized = this.serialization.serialize(
      req.__newSessionHash.length + '!' +
      req.__newSessionHash + req.__sessionSerialized);
    res.cookie('session', serialized, this.maxAge, '/');
  }
  
  init(floofball) {
    floofball.before()
      .when(this._predicateBefore.bind(this))
      .exec(this._executorBefore.bind(this));
    floofball.after()
      .when(this._predicateAfter.bind(this))
      .exec(this._executorAfter.bind(this));
  }
}

module.exports = SessionPlugin;
