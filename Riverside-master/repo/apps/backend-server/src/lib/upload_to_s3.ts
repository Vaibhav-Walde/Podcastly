import { fileType } from "../types/types";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function uploadToS3(file: fileType) {
  console.log('Uploading to Supabase:', file.originalname);
  
  const { error } = await supabase.storage
    .from('recordings')
    .upload(file.originalname, file.buffer, {
      contentType: file.mimetype,
      upsert: true
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from('recordings')
    .getPublicUrl(file.originalname);

  return data.publicUrl;
}
