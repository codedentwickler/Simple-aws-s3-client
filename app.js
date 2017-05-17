 var express = require('express');
 var bodyParser = require('body-parser');

 var aws_crud = require('./aws-s3-crud');

 var app = express();

 var PORT = process.argv.PORT || 3000;

 app.use(bodyParser.json());

 app.get('/', function(req, res) {
     res.send('Hello there !!!')
 });

 // returns all buckets on s3
 app.get('/buckets', aws_crud.listAllBuckets);

 // This endpoint to creates a new bucket with the name
 // throw an error if a bucket already exists with that name
 app.post('/buckets/create', aws_crud.createBucket);

 // This endpoint to creates a new bucket and uploads a file to the bucket
 // throw an error if a bucket already exists with that name
 // Specify the name of bucket and file path/remote Url in the request body
 app.post('/buckets/create/upload', aws_crud.createBucketAndUpload);

 // Downloads a file from a bucket. Similar to download file
 // Specify the name of bucket and the remotw name of the  in the request body
 app.get('/buckets/:name/:object_name', aws_crud.getObject);

 // returns a list of all objects in bucket with the name 
 app.get('/buckets/:name', aws_crud.listAllObjects);

 // Uploads a file to a bucket
 // Specify the name of bucket and file path/remote Url in the request body
 app.post('/buckets/upload', aws_crud.uploadFile);

 // Downloads a file from a bucket
 // Specify the name of bucket and the remotw name of the  in the request body
 app.get('/buckets/:name/download/:fileName', aws_crud.downloadFile);

 // Delete all the files in a bucket
 // Specify the name of bucket you want to empty in the request body
 app.post('/buckets/delete/objects/all', aws_crud.deleteAllObjects);

 // Deletes a specific file in a` bucket
 // Specify the name of bucket and the name of the file in the request body
 app.post('/buckets/delete/object', aws_crud.deleteObject);

 // Deletes a bucket
 // Specify the name of bucket in the request body
 app.post('/buckets/delete', aws_crud.deleteBucket);

 app.listen(PORT, function() {
     console.log('AWS S3 Server listening on port! ', PORT);
 });
