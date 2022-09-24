clear
rm -Rf dist
BROWSERSLIST_ENV=production NODE_ENV=production webpack --config='./config/webpack.config.ts'