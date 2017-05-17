var fs = require('fs'),
    AWS = require('aws-sdk'),
    mime = require('mime-types'),
    path = require('path');

AWS.config.loadFromPath('./config.json');

var s3 = new AWS.S3();

exports.createBucket = function(req, res) {

    var bucketName = req.body.name;
    console.log(bucketName);

    var params = {
        Bucket: bucketName,
        Key: '.create.txt',
        Body: 'This write shows i\'ve Successfully initialized a new Bucket'
    };
    s3.createBucket({ Bucket: req.body.name }, function(err, data) {
        if (err) {
            return res.json({ "error": err });
        }
        s3.upload(params, function() {
            if (err) {
                return res.json({ "error": err });
            } else {
                res.send("Successfully Created new Bucket " + bucketName + " and uploaded create.txt to " + bucketName + " " + params.Key);
            }

        });
    });
}

exports.createBucketAndUpload = function(req, res) {

    var bucketName = req.body.name;
    var file_path = req.body.path;

    var filename = path.basename(file_path);
    var ext_name = path.extname(file_path);

    var metaData = mime.contentType(ext_name);

    var fileBuffer = fs.readFileSync(file_path);

    var params = {
        Bucket: bucketName,
        Key: filename,
        Body: fileBuffer,
        ContentType: metaData
    };

    s3.createBucket({ Bucket: bucketName }, function(err, data) {
        if (err) {
            return res.json({ "error": err });
        } else {
            s3.upload(params, function(err, data) {
                if (err) {
                    res.json({ "error": err });
                }
                res.send('Uploaded file [' + filename + '] to [' + params.Key + '] as [' + ext_name + ']');
            });
        }
    });
}

exports.listAllBuckets = function(req, res) {

    var buckets = [];

    s3.listBuckets(function(err, data) {
        if (err) {
            res.json({ "error": err });
        } else {
            for (var index in data.Buckets) {
                var bucket = data.Buckets[index];
                buckets.push({ "Bucket": bucket.Name, "Creation_Date": bucket.CreationDate });
            }
            res.json({ "buckets": buckets });
        }
    });
}

exports.deleteBucket = function(req, res) {

    var bucketName = req.body.name;
    var params = { Bucket: bucketName };

    s3.deleteBucket(params, function(err, data) {
        if (err) {
            res.json({ "error": err });
        } else {
            res.send(`Succesfully deleted Bucket : ${bucketName}`);

        }
    });
}

exports.getObject = function(req, res) {

    var bucketName = req.params.name;
    var object_name = req.params.object_name;

    var params = {
        Bucket: bucketName,
        Key: object_name
    }
    var file = fs.createWriteStream(__dirname + '/public/downloads/' + object_name);
    console.log(file.path);

    file.on('close', function() {
        res.send('Downloading Complete, Check public/download folder for the downloaded file '); //prints, file created
    });

    s3.getObject(params).createReadStream().on('error', function(err) {
        res.send(err);
    }).pipe(file);
}

exports.putObjects = function(req, res) {
    var bucketName = req.params.name;
    var object_name = req.params.obobject_name;

    var params = {
        Bucket: bucketName,
        Key: object_name
    }

    s3.putObject(params, function(err, data) {
        if (err) {
            return res.json({ "error": err });
        }
        res.json({ "data": data });
    })

}

exports.deleteAllObjects = function(req, res) {
    var bucketName = req.body.name;

    var objects = [];

    s3.listObjects({ Bucket: bucketName }, function(err, data) {
        if (err) {
            res.send(err)
        } // an error occurred
        else {
            for (var index in data.Contents) {
                var object = data.Contents[index];

                objects.push({ "Key": object.Key });
            }
            var params = {
                Bucket: bucketName,
                Delete: {
                    Objects: objects
                }
            };
            s3.deleteObjects(params, function(err, data) {
                if (err) {
                    return res.send({ "error": err });
                }
                res.json({ "data": data });
            });
        }
    });

}

exports.deleteObject = function(req, res) {
    var bucketName = req.body.name;
    var object_name = req.body.Key;

    var params = {
        Bucket: bucketName,
        Key: object_name
    }

    s3.deleteObject(params, function(err, data) {
        if (err) {
            return res.send({ "error": err });
        } else {
            res.send(`Succesfully deleted Object : ${object_name} from " ${bucketName}`);
        }
    });

}

exports.uploadFile = function(req, res) {

    var bucketName = req.body.name;
    var file_path = req.body.path;

    var filename = path.basename(file_path);
    var ext_name = path.extname(file_path);

    var metaData = mime.contentType(ext_name);

    var fileBuffer = fs.readFileSync(file_path);

    var params = {
        Bucket: bucketName,
        Key: filename,
        Body: fileBuffer,
        ContentType: metaData
    };

    s3.upload(params, function(err, data) {
        if (err) {
            res.json({ "error": err });
        }
        res.send('Uploaded file[' + filename + '] to [' + params.Key + '] as [' + ext_name + ']');
    });
}

exports.listAllObjects = function(req, res) {

    var bucketName = req.params.name;
    var params = { Bucket: bucketName };

    s3.listObjects(params, function(err, data) {
        if (err) {
            res.json({ "error": err });
        } // an error occurred
        res.json({ "data": data }); // successful response
    });
}

exports.downloadFile = function(req, res) {

    var bucketName = req.params.name;
    var remoteFilename = req.params.fileName;
    var params = { Bucket: bucketName, Key: remoteFilename }

    var file = fs.createWriteStream(__dirname + '/public/downloads/' + remoteFilename);
    console.log(file.path);

    file.on('close', function() {
        res.send('Downloading Complete, Check public/download folder for the downloaded file '); //prints, file created
    });

    s3.getObject(params).createReadStream().on('error', function(err) {
        res.send(err);
    }).pipe(file);

}