const sql = require('mssql');
const fs = require('fs');
const dateFormat = require('dateformat');
const removeMd = require('remove-markdown');
const wordcount = require('wordcount');
const sw = require('stopword');

const config = {
    server:'sql.steemsql.com',
    database:'DBSteem',
    user:'steemit',
    password:'steemit',
    requestTimeout : 240000,
    stream : true
};

const now = new Date();
console.log(now);

const sqlStr = `
select
  comments.author
  ,comments.permlink
  ,comments.body
  ,comments.created
from 
 Comments (NOLOCK) comments
where 
comments.depth=0 
and 
  ( 
    ( JSON_VALUE(json_metadata,'$.tags[4]') in ('pt') ) or
    ( JSON_VALUE(json_metadata,'$.tags[3]') in ('pt') ) or
    ( JSON_VALUE(json_metadata,'$.tags[2]') in ('pt') ) or
    ( JSON_VALUE(json_metadata,'$.tags[1]') in ('pt') ) or
    ( JSON_VALUE(json_metadata,'$.tags[0]') in ('pt') ) 
  )
`

// connect to your database
sql.connect(config, function (err) {

  if (err) console.log(err);

  // create Request object
  var request = new sql.Request();

  // query to the database and get the records
  request.query(sqlStr, function (err, result) {

    if (err) {
      console.log(err)
      return;
    }

    console.log("post count: " + result.recordset.length);

    const filetstamp = dateFormat(now, "UTC:yyyymmdd_HHMMss");
    const outputCsv = `output/pt-cloud-words_${filetstamp}.csv`;
    fs.writeFileSync(outputCsv, 'Author,Permlink,Creation Date,Word Count,Body\r\n');
    result.recordset.forEach(function(item) {
      const created = dateFormat(item.created, "UTC:yyyy-mm-dd HH:MM:ss");
      const body = removeMd(item.body);
      const word_count = wordcount(body);
      const bodyCloudWords = sw.removeStopwords(body);

      var dataToWrite = `${item.author},${item.permlink},${created},${word_count},${bodyCloudWords}\r\n`
      fs.appendFileSync(outputCsv, dataToWrite);
    });

    console.log("Output done");
  });
});