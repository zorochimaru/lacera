const fs = require('fs');
const path = require('path');

const dir = 'src/environments';
const prodFile = 'environment.prod.ts';

const content = `${process.env.ENVIRONMENT_FILE}`;

fs.access(dir, fs.constants.F_OK, err => {
  if (err) {
    // Directory doesn't exist
    console.log("src doesn't exist, creating now", process.cwd());
    // Create /src
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (error) {
      console.log(`Error while creating ${dir}. Error is ${error}`);
      process.exit(1);
    }
  }
  // Now write to file
  try {
    fs.writeFileSync(dir + '/' + prodFile, content);
    console.log('Created successfully in', process.cwd());
    if (fs.existsSync(dir + '/' + file)) {
      console.log('File is created', path.resolve(dir + '/' + file));
      const str = fs.readFileSync(dir + '/' + file).toString();
      console.log(str);
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
});
