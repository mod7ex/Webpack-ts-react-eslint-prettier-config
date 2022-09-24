clear
rm -Rf dist
BROWSERSLIST_ENV=development NODE_ENV=development webpack --config='./config/webpack.config.ts'