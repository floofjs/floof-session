declare module 'floof-session' {
  /**
   * A hashing function.
   */
  type HashFunction = 'sha1' | 'sha224' | 'sha256' | 'sha384' | 'sha512';
  
  /**
   * An object representing and implementing a text serialization scheme.
   */
  interface Serialization {
    /**
     * Serializes a plaintext string.
     */
    serialize(s: string): string;
    
    /**
     * Deserializes a previously-serialized string to a plaintext string.
     */
    deserialize(s: string): string;
  }
  
  /**
   * The floof-session plugin. Register an instance with FloofBall#plugin.
   */
  export class SessionPlugin {
    /**
     * Initializes the plugin.
     * @param secretKey The key used to sign cookies.
     * @param maxAge The maximum age for session cookies to persist, in milliseconds.
     * @param hashFunc The function to use for HMAC cookie verification. Defaults to SHA256.
     * @param serialization The serialization scheme to use. Defaults to plain ol' base64.
     */
    constructor(secretKey: string, maxAge?: number, hashFunc?: HashFunction, serialization?: Serialization);
  }
}