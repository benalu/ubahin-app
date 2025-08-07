// src/lib/cloudconvert.ts
import CloudConvert from 'cloudconvert';

export const cloudConvert = new CloudConvert(process.env.CLOUDCONVERT_API_KEY!);