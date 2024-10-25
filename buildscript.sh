cd lambda
echo "installing lambda dependencies"
npm i
echo "installation complete"
echo "copying node modules"
cp -R node_modules dist
echo "node modules copy complete"
cd ..
echo "building lambda"
npm run build-lambda
echo "build complete"
echo "running cdk synth"
cdk synth
echo "synth complete"
echo "running cdk deploy"
cdk deploy
