
const { v2: cloudinary } = require('cloudinary');
const fs = require('fs');

console.log('Testing Cloudinary Upload for dvfmu9d12...');

cloudinary.config({
  cloud_name: 'dvfmu9d12',
  api_key: '615164819852142',
  api_secret: 'vlYWx0IBuaJ8AhWZYR6q7DoPX0I',
});

async function testUpload() {
  try {
    // Creating a test dummy image file content
    const testFile = 'D:/coding/Alpha-Devs/test_upload_2.txt';
    fs.writeFileSync(testFile, 'ECO-ROUTE TEST UPLOAD');

    const result = await cloudinary.uploader.upload(testFile, {
      folder: 'wildlife-sightings-test',
      resource_type: 'auto',
      upload_preset: 'kaizen_uploads',
    });
    
    console.log('\n✅ SUCCESS: Cloudinary Uploaded!');
    console.log('Public URL:', result.secure_url);
    
    // Clean up
    fs.unlinkSync(testFile);
  } catch (err) {
    console.error('\n❌ FAILED: Cloudinary Upload failed.');
    console.error(err);
  }
}

testUpload();
