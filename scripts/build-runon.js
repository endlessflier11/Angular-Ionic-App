const { execSync } = require('child_process');
const fs = require('fs');
const plist = require('plist');
const program = require('commander');

function updateEnvChannel(channel) {
  execSync(`sed -i -e 's/PREF_deployChannel=.*/PREF_deployChannel=${channel}/g' ".env"`);
  execSync(`sed -i -e 's/PREF_nativeChannel=.*/PREF_nativeChannel=${channel}/g' ".env"`);
  //execSync(`rm .env-e`);
}

function updateIosChannel(platform, channel) {
  if (platform !== 'ios') {
    return;
  }

  const obj = plist.parse(fs.readFileSync('./ios/App/App/Info.plist', 'utf8'));

  obj.IonChannelName = channel;

  fs.writeFileSync('./ios/App/App/Info.plist', plist.build(obj));
}

function updateAndroidFlavor(platform, isProd) {
  if (platform !== 'android') {
    return;
  }

  const capacitorConfig = JSON.parse(fs.readFileSync('./capacitor.config.json', 'utf-8'));

  capacitorConfig.android.flavor = isProd ? 'prod' : 'dev';

  let data = JSON.stringify(capacitorConfig, null, 2);
  fs.writeFileSync('./capacitor.config.json', data);
}

function buildIonicEnv() {
  execSync('npm run build:ionic-env', { stdio: 'inherit' });
}

function buildCommand(platform, options) {
  const configuration = options.prod ? 'production' : 'development';
  const livereloadFlag = options.livereload ? '--livereload --external' : '';
  const targetFlag = options.sim
    ? `--target ${platform == 'ios' ? process.env.IOS_SIMULATOR : process.env.ANDROID_EMULATOR}`
    : '';
  const command = `ionic capacitor run ${platform} --configuration=${configuration} ${targetFlag} ${livereloadFlag}`;

  console.log(`Command to run: ${command}`);
  return command;
}

function run(platform, options) {
  const ionicChannel = options.prod ? 'C5-Production' : 'C5-Development';
  // updateEnvChannel(ionicChannel);
  updateIosChannel(platform, ionicChannel);
  updateAndroidFlavor(platform, options.prod);

  require('dotenv').config();

  buildIonicEnv();
  const command = buildCommand(platform, options);

  execSync(command, { stdio: 'inherit' });
}

program
  .addArgument(
    new program.Argument('<platform>', 'Platform to run on <android|ios>').choices([
      'android',
      'ios',
    ])
  )
  .option('-l, --livereload', 'Use livereload for ionic development', false)
  .option('-s, --sim', 'Run on simulator or emulator', false)
  .option('--prod', 'Run production build', false)
  .action(run)
  .parse(process.argv);
