export const base64ToUint8Array = (base64: string): Uint8Array => {
    const binaryString = atob(base64);
    const length = binaryString.length;
    const uint8Array = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }
    return uint8Array;
};

