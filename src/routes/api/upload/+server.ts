import { json } from '@sveltejs/kit';
import { writeFileSync } from 'fs';
import { join } from 'path';

export async function POST({ request }) {
  try {
    const data = await request.formData();
    const file = data.get('image') as File;
    
    if (!file) {
      return json({ error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Generate a unique filename to prevent collisions
    const ext = file.name.split('.').pop() || 'png';
    const filename = `${crypto.randomUUID()}.${ext}`;
    
    // Save to the static/uploads directory so the web server can serve it directly
    const filePath = join(process.cwd(), 'static', 'uploads', filename);
    writeFileSync(filePath, buffer);
    
    return json({ url: `/uploads/${filename}` });
  } catch (err) {
    console.error('Error uploading file:', err);
    return json({ error: 'Upload failed' }, { status: 500 });
  }
}
