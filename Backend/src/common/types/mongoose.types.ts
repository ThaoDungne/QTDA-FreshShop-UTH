declare module 'mongoose' {
  interface Document {
    softDelete(): Promise<this>;
  }
}
