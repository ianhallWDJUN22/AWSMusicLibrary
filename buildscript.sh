cd lambda
echo "...INSTALLING LAMBDA DEPENDENCIES..."
npm i
echo "...INSTALLATION COMPLETE..."
echo "...COPYING NODE MODULES.."
cp -R node_modules dist
echo "...NODE MODULES COPY COMPLETE..."
cd ..
echo "...BUILDING LAMBDA..."
npm run build-lambda
echo "...BUILDING COMPLETE..."
echo "...RUNNING CDK SYNTH..."
cdk synth
echo "...SYNTH COMPLETE..."
echo "...RUNNING CDK DEPLOY..."
cdk deploy
echo "...DEPLOY COMPLETE..."