# ChromeReadinglist2

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.2.0.

## Deploy

run
```
yarn build --prod
```
make sure you've bumped the version in package.json and manifest.json

then zip the contents of the `dist` directory
```
cd dist
rm *.zip
zip -r -X chrome-readinglist2.zip ./chrome-readinglist2/
cd ..
ls -lhk dist/*.zip
``` 

goto Chrome extensions dashboard: https://chrome.google.com/webstore/devconsole

Upload the zip as a new package


# NgRX

## generate feature

```
yarn ng g feature bookmarks/bookmarks --creators --group --module bookmarks --api false --creators tru
```
