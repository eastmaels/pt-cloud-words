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
  author
  ,permlink
  ,body
  ,created
from 
 Comments
where 
  depth=0 
  and ISJSON(json_metadata) > 0
  and created >= '2018-04-22'
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
    result.recordset.forEach(function(item) {
      const body = removeMd(item.body);
      const bodyCloudWords = sw.removeStopwords(body.split(' '), sw.pt);

      var dataToWrite = `${bodyCloudWords.join(' ')}\r\n`
      fs.appendFileSync(outputCsv, dataToWrite);
    });

    console.log("Output done");
  });
});