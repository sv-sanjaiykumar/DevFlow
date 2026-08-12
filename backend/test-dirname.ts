console.log('Checking __dirname...');
try {
  console.log('__dirname:', __dirname);
} catch (e) {
  console.error('Error accessing __dirname:', e.message);
}
