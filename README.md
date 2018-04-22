# Portuguese Cloud Words

Word Cloud Generator for Portuguese posts in STEEM.

## Installation

```
$ git clone git@github.com:eastmaels/pt-cloud-words.git
$ cd pt-cloud-words
$ npm install
```

### 1. `pt-cloud-words.js`

This generatest the cloud words from STEEM posts containing the #pt tag.

```
$ node pt-cloud-words.js
```

This will generate a CSV in `./output` folder with filename formatted to `pt-cloud-words__yyyymmdd_HHMMss.csv`. 
You can directly copy the content of this file to https://www.jasondavies.com/wordcloud/.

