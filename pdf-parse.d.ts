// pdf-parse.d.ts
declare module "pdf-parse" {
  function pdf(buffer: Buffer): Promise<{ text: string; numpages: number }>;
  export default pdf;
}